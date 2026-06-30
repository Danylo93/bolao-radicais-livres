import * as db from './db.js';
import { buildSeed, englishKeyForTeamName, teamByEnglish } from './data.js';

const FINISHED_STATUS = new Set(['FT', 'AET', 'PEN']);
const LIVE_STATUS = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT']);

// Mapeia o nome da rodada (API) para a fase do nosso mata-mata.
// Ordem importa: "quarter/semi/3rd" antes de "final" (que casa como substring).
const KO_ROUND_MAP = [
  [/round of 32|r32|16[\s-]*avos/i, '16-avos'],
  [/round of 16|r16|oitavas/i, 'Oitavas'],
  [/quarter|qf|quartas/i, 'Quartas'],
  [/semi|sf/i, 'Semifinal'],
  [/third place|3rd place|third|disputa/i, 'Disputa do 3º'],
  [/final/i, 'Final'],
];
function koPhaseFromRound(round) {
  if (!round || /group/i.test(round)) return null;
  for (const [re, phase] of KO_ROUND_MAP) if (re.test(round)) return phase;
  return null;
}

const API_NAME_ALIASES = {
  'Korea Republic': 'South Korea',
  'Republic of Korea': 'South Korea',
  Czechia: 'Czech Republic',
  'Côte d\'Ivoire': 'Ivory Coast',
  "Cote d'Ivoire": 'Ivory Coast',
  USA: 'United States',
  'United States of America': 'United States',
  'IR Iran': 'Iran',
  'DR Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
  'Democratic Republic of the Congo': 'DR Congo',
};

function normEn(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  return API_NAME_ALIASES[trimmed] || trimmed;
}

function extKey(group, homeEn, awayEn) {
  return `${group || 'KO'}|${normEn(homeEn)}|${normEn(awayEn)}`;
}

function numScore(v) {
  if (v == null || v === '' || v === 'null') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function buildIndex(games) {
  const index = new Map();
  for (const g of games) {
    index.set(extKey(g.group, g.homeEn, g.awayEn), g);
    index.set(extKey(null, g.homeEn, g.awayEn), g);
  }
  return index;
}

function findExternal(index, match) {
  if (!match.home?.name || !match.away?.name) return null;
  const homeEn = englishKeyForTeamName(match.home.name);
  const awayEn = englishKeyForTeamName(match.away.name);
  if (!homeEn || !awayEn) return null;
  return index.get(extKey(match.group, homeEn, awayEn)) || index.get(extKey(null, homeEn, awayEn));
}

async function applyGames(games, source) {
  const matches = await db.getMatches();
  const index = buildIndex(games);
  let updated = 0;

  for (const m of matches) {
    const ext = findExternal(index, m);
    if (!ext) continue;

    const patch = {};
    const hs = numScore(ext.homeScore);
    const as = numScore(ext.awayScore);
    // Só grava placar de jogo que já começou (ao vivo) ou terminou — E cujo
    // horário de início já passou. A checagem do horário é à prova de falha:
    // mesmo que a fonte marque um jogo agendado como "ao vivo" por engano,
    // um jogo com início no futuro nunca recebe placar (evita 0-0 indevido).
    const kickedOff = new Date(m.date).getTime() <= Date.now();
    const started = (ext.finished || ext.live) && kickedOff;

    if (started) {
      if (hs != null && m.homeScore !== hs) patch.homeScore = hs;
      if (as != null && m.awayScore !== as) patch.awayScore = as;
      if (ext.finished && hs != null && as != null && m.finished !== true) {
        patch.finished = true;
      }
      if (ext.penalties && m.penalties !== ext.penalties) {
        patch.penalties = ext.penalties;
      }
    }

    if (!m.home && ext.homeEn) {
      const team = teamByEnglish(normEn(ext.homeEn));
      if (team) patch.home = team;
    }
    if (!m.away && ext.awayEn) {
      const team = teamByEnglish(normEn(ext.awayEn));
      if (team) patch.away = team;
    }

    if (!Object.keys(patch).length) continue;
    await db.updateMatch(m.id, patch);
    updated += 1;
  }

  // --- Mata-mata: preenche os confrontos vazios conforme a API os define ---
  // Inclui jogos parcialmente definidos para completar o adversário.
  // Rastreia confrontos já colocados para NUNCA duplicar.
  const koByPhase = {};
  for (const g of games) {
    if (!g.phase) continue;
    const home = g.homeEn ? teamByEnglish(normEn(g.homeEn)) : null;
    const away = g.awayEn ? teamByEnglish(normEn(g.awayEn)) : null;
    if (!home && !away) continue;
    (koByPhase[g.phase] ||= []).push({ home, away, date: g.date, penalties: g.penalties });
  }
  for (const [phase, apiGames] of Object.entries(koByPhase)) {
    // Confrontos já existentes na fase (para não duplicar)
    const existingPairs = new Set();
    for (const m of matches) {
      if (m.phase === phase && m.home && m.away) {
        existingPairs.add(`${m.home.name}|${m.away.name}`);
      }
    }

    const slots = matches
      .filter((m) => m.phase === phase && (!m.home || !m.away))
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id.localeCompare(b.id));

    // Deduplica jogos da API (a mesma API pode listar o mesmo confronto várias vezes)
    const seen = new Set();
    const uniqueApiGames = apiGames.filter((ag) => {
      const key = `${ag.home?.name || '?'}|${ag.away?.name || '?'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    for (const ag of uniqueApiGames) {
      // Pula se esse confronto completo já existe na fase
      if (ag.home && ag.away && existingPairs.has(`${ag.home.name}|${ag.away.name}`)) continue;

      let slot = null;
      if (ag.home && !ag.away) {
        // Só mandante definido: procura slot que já tenha esse mandante
        slot = slots.find((s) => s.home?.name === ag.home.name);
      } else if (!ag.home && ag.away) {
        slot = slots.find((s) => s.away?.name === ag.away.name);
      } else if (ag.home && ag.away) {
        // Confronto completo: procura slot que tenha um dos times
        slot = slots.find((s) => s.home?.name === ag.home.name || s.away?.name === ag.away.name);
        // Se não achou, usa o primeiro slot totalmente vazio
        if (!slot) slot = slots.find((s) => !s.home && !s.away);
      }
      if (!slot) continue;

      const patch = {};
      if (!slot.home && ag.home) patch.home = ag.home;
      if (!slot.away && ag.away) patch.away = ag.away;
      if (ag.date) patch.date = ag.date;
      if (Object.keys(patch).length) {
        await db.updateMatch(slot.id, patch);
        if (ag.home && ag.away) existingPairs.add(`${ag.home.name}|${ag.away.name}`);
        const idx = slots.indexOf(slot);
        if (idx !== -1) slots.splice(idx, 1);
        updated += 1;
      }
    }
  }

  return { updated, source, total: games.length };
}

// ----------------------------- Fontes externas --------------------------------

async function fetchApiFootball(key) {
  const league = process.env.API_FOOTBALL_LEAGUE || '1';
  const season = process.env.API_FOOTBALL_SEASON || '2026';
  const url = `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': key },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length) {
    throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  }

  return (data.response || []).map((row) => {
    const status = row.fixture?.status?.short || 'NS';
    const round = row.league?.round || '';
    const group = round.match(/Group\s+([A-L])/i)?.[1]?.toUpperCase() || null;
    return {
      homeEn: normEn(row.teams?.home?.name),
      awayEn: normEn(row.teams?.away?.name),
      homeScore: row.goals?.home,
      awayScore: row.goals?.away,
      finished: FINISHED_STATUS.has(status),
      live: LIVE_STATUS.has(status),
      group,
      phase: koPhaseFromRound(round),
      date: row.fixture?.date || null,
    };
  });
}

async function fetchWorldCupApi() {
  const base = process.env.WORLD_CUP_API_URL || 'https://worldcup26.ir';
  const res = await fetch(`${base}/get/games`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`WorldCup API HTTP ${res.status}`);
  const data = await res.json();
  return (data.games || []).map((g) => ({
    homeEn: normEn(g.home_team_name_en),
    awayEn: normEn(g.away_team_name_en),
    homeScore: g.home_score,
    awayScore: g.away_score,
    finished: String(g.finished).toUpperCase() === 'TRUE' || g.time_elapsed === 'finished',
    live: g.time_elapsed && g.time_elapsed !== 'finished' && String(g.finished).toUpperCase() !== 'TRUE',
    group: g.group || null,
    phase: koPhaseFromRound(g.type || g.stage || g.round || ''),
    date: g.date || g.datetime || g.match_time || null,
  }));
}

async function syncFromSeed() {
  const seed = buildSeed();
  let updated = 0;
  for (const s of seed) {
    if (!s.finished && s.homeScore == null) continue;
    const cur = await db.getMatch(s.id);
    if (!cur) continue;
    const patch = {};
    if (cur.homeScore !== s.homeScore) patch.homeScore = s.homeScore;
    if (cur.awayScore !== s.awayScore) patch.awayScore = s.awayScore;
    if (cur.finished !== s.finished) patch.finished = s.finished;
    if (!Object.keys(patch).length) continue;
    await db.updateMatch(s.id, patch);
    updated += 1;
  }
  return { updated, source: 'seed', total: seed.length };
}

// ----------------------------- Orquestração -----------------------------------

export async function syncMatches() {
  const key = process.env.API_FOOTBALL_KEY;
  const errors = [];

  if (key) {
    try {
      const games = await fetchApiFootball(key);
      const r = await applyGames(games, 'api-football');
      if (r.updated > 0) return r;
      if (games.length > 0) return r;
    } catch (e) {
      errors.push(e.message);
      console.error('Sync API-Football:', e.message);
    }
  }

  if (process.env.WORLD_CUP_API !== 'disable') {
    try {
      const games = await fetchWorldCupApi();
      const r = await applyGames(games, 'worldcup26');
      if (r.updated > 0) return r;
      if (games.length > 0) return r;
    } catch (e) {
      errors.push(e.message);
      console.error('Sync WorldCup API:', e.message);
    }
  }

  const seedResult = await syncFromSeed();
  if (errors.length && seedResult.updated === 0) {
    console.warn('Sync: usando seed local. Erros:', errors.join('; '));
  }
  return seedResult;
}

export async function maybeSync() {
  const maxAge = Number(process.env.SYNC_INTERVAL_MS || 5 * 60 * 1000);
  if (!(await db.shouldSync(maxAge))) return null;
  try {
    const result = await syncMatches();
    await db.setMeta('last_sync_at', String(Date.now()));
    return result;
  } catch (e) {
    console.error('maybeSync:', e.message);
    return null;
  }
}
