import * as db from './db.js';
import { buildSeed, englishKeyForTeamName, teamByEnglish } from './data.js';

const FINISHED_STATUS = new Set(['FT', 'AET', 'PEN']);
const LIVE_STATUS = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT']);

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
    // Só grava placar de jogo que já começou (ao vivo) ou terminou.
    // Evita gravar 0-0 em jogos ainda não iniciados (a API devolve 0/null antes do apito).
    const started = ext.finished || ext.live;

    if (started) {
      if (hs != null && m.homeScore !== hs) patch.homeScore = hs;
      if (as != null && m.awayScore !== as) patch.awayScore = as;
      if (ext.finished && hs != null && as != null && m.finished !== true) {
        patch.finished = true;
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
