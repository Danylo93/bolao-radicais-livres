// ============================================================================
//  BOLÃO RL — Dados REAIS da Copa do Mundo FIFA 2026
//  Fonte: Wikipédia (2026 FIFA World Cup, páginas dos Grupos A–L) — jun/2026.
//  Grupos, confrontos, DATAS/HORÁRIOS e placares da fase de grupos são reais.
//  Horários armazenados em UTC (com sufixo Z); a interface mostra no fuso de
//  quem acessa (em São Miguel/BR = horário de Brasília).
//  Mata-mata: vagas com times "A definir" (preencher no painel conforme a Copa).
// ============================================================================

export const TOURNAMENT = {
  name: 'Bolão RL São Miguel',
  subtitle: 'Copa RL São Miguel 2026',
  prizes: [
    { place: '1º Lugar', prize: 'Inscrição do Amor que Pensa', emoji: '💘' },
    { place: '2º Lugar', prize: 'Camiseta RL São Miguel', emoji: '👕' },
    { place: '3º Lugar', prize: 'Comunhão com os Discipuladores Jovens', emoji: '🤝' },
  ],
  edition: 'Edição São Miguel • Jovens RL',
};

// Pontuação MANUAL de presença/frequência (lançada pelo organizador no /admin).
export const ACTIVITIES = [
  { kind: 'culto', label: 'Culto', points: 15 },
  { kind: 'culto_domingo', label: 'Culto de domingo', points: 10 },
  { kind: 'celula', label: 'Célula', points: 5 },
  { kind: 'visitante', label: 'Trouxe visitante', points: 10 },
];
export const ACTIVITY_POINTS = Object.fromEntries(ACTIVITIES.map((a) => [a.kind, a.points]));
export const ACTIVITY_LABELS = Object.fromEntries(ACTIVITIES.map((a) => [a.kind, a.label]));

// Regras de pontuação (pontos por jogo).
export const RULES = {
  exact: 10, // Placar exato (cravou!)
  resultDiff: 7, // Acertou o vencedor + o saldo de gols
  result: 5, // Acertou só quem venceu (ou o empate)
  oneTeam: 1, // Acertou os gols de um dos times (mas errou o resultado)
};

// Tradução (inglês → pt-BR) + bandeira de cada uma das 48 seleções.
const T = {
  Mexico: { name: 'México', flag: '🇲🇽' },
  'South Africa': { name: 'África do Sul', flag: '🇿🇦' },
  'South Korea': { name: 'Coreia do Sul', flag: '🇰🇷' },
  'Czech Republic': { name: 'Tchéquia', flag: '🇨🇿' },
  Canada: { name: 'Canadá', flag: '🇨🇦' },
  'Bosnia and Herzegovina': { name: 'Bósnia e Herzegovina', flag: '🇧🇦' },
  Qatar: { name: 'Catar', flag: '🇶🇦' },
  Switzerland: { name: 'Suíça', flag: '🇨🇭' },
  Brazil: { name: 'Brasil', flag: '🇧🇷' },
  Morocco: { name: 'Marrocos', flag: '🇲🇦' },
  Haiti: { name: 'Haiti', flag: '🇭🇹' },
  Scotland: { name: 'Escócia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'United States': { name: 'Estados Unidos', flag: '🇺🇸' },
  Paraguay: { name: 'Paraguai', flag: '🇵🇾' },
  Australia: { name: 'Austrália', flag: '🇦🇺' },
  Turkey: { name: 'Turquia', flag: '🇹🇷' },
  Germany: { name: 'Alemanha', flag: '🇩🇪' },
  'Curaçao': { name: 'Curaçao', flag: '🇨🇼' },
  'Ivory Coast': { name: 'Costa do Marfim', flag: '🇨🇮' },
  Ecuador: { name: 'Equador', flag: '🇪🇨' },
  Netherlands: { name: 'Holanda', flag: '🇳🇱' },
  Japan: { name: 'Japão', flag: '🇯🇵' },
  Sweden: { name: 'Suécia', flag: '🇸🇪' },
  Tunisia: { name: 'Tunísia', flag: '🇹🇳' },
  Belgium: { name: 'Bélgica', flag: '🇧🇪' },
  Egypt: { name: 'Egito', flag: '🇪🇬' },
  Iran: { name: 'Irã', flag: '🇮🇷' },
  'New Zealand': { name: 'Nova Zelândia', flag: '🇳🇿' },
  Spain: { name: 'Espanha', flag: '🇪🇸' },
  'Cape Verde': { name: 'Cabo Verde', flag: '🇨🇻' },
  'Saudi Arabia': { name: 'Arábia Saudita', flag: '🇸🇦' },
  Uruguay: { name: 'Uruguai', flag: '🇺🇾' },
  France: { name: 'França', flag: '🇫🇷' },
  Senegal: { name: 'Senegal', flag: '🇸🇳' },
  Iraq: { name: 'Iraque', flag: '🇮🇶' },
  Norway: { name: 'Noruega', flag: '🇳🇴' },
  Argentina: { name: 'Argentina', flag: '🇦🇷' },
  Algeria: { name: 'Argélia', flag: '🇩🇿' },
  Austria: { name: 'Áustria', flag: '🇦🇹' },
  Jordan: { name: 'Jordânia', flag: '🇯🇴' },
  Portugal: { name: 'Portugal', flag: '🇵🇹' },
  'DR Congo': { name: 'Rep. Dem. do Congo', flag: '🇨🇩' },
  Uzbekistan: { name: 'Uzbequistão', flag: '🇺🇿' },
  Colombia: { name: 'Colômbia', flag: '🇨🇴' },
  England: { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  Croatia: { name: 'Croácia', flag: '🇭🇷' },
  Ghana: { name: 'Gana', flag: '🇬🇭' },
  Panama: { name: 'Panamá', flag: '🇵🇦' },
};

const GROUPS_EN = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czech Republic'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Turkey'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

// Confrontos reais da fase de grupos: [grupo, mandante, visitante, kickoff(UTC), placar|null]
// Horários convertidos do horário local de cada sede para UTC.
const GROUP_FIXTURES = [
  ['A', 'Mexico', 'South Africa', '2026-06-11T19:00:00Z', '2-0'],
  ['A', 'South Korea', 'Czech Republic', '2026-06-12T02:00:00Z', '2-1'],
  ['A', 'Czech Republic', 'South Africa', '2026-06-18T16:00:00Z', '1-1'],
  ['A', 'Mexico', 'South Korea', '2026-06-19T01:00:00Z', '1-0'],
  ['A', 'Czech Republic', 'Mexico', '2026-06-25T01:00:00Z', null],
  ['A', 'South Africa', 'South Korea', '2026-06-25T01:00:00Z', null],

  ['B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12T19:00:00Z', '1-1'],
  ['B', 'Qatar', 'Switzerland', '2026-06-13T19:00:00Z', '1-1'],
  ['B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18T19:00:00Z', '4-1'],
  ['B', 'Canada', 'Qatar', '2026-06-18T22:00:00Z', '6-0'],
  ['B', 'Switzerland', 'Canada', '2026-06-24T19:00:00Z', null],
  ['B', 'Bosnia and Herzegovina', 'Qatar', '2026-06-24T19:00:00Z', null],

  ['C', 'Brazil', 'Morocco', '2026-06-13T22:00:00Z', '1-1'],
  ['C', 'Haiti', 'Scotland', '2026-06-14T01:00:00Z', '0-1'],
  ['C', 'Scotland', 'Morocco', '2026-06-19T22:00:00Z', '0-1'],
  ['C', 'Brazil', 'Haiti', '2026-06-20T00:30:00Z', '3-0'],
  ['C', 'Scotland', 'Brazil', '2026-06-24T22:00:00Z', null],
  ['C', 'Morocco', 'Haiti', '2026-06-24T22:00:00Z', null],

  ['D', 'United States', 'Paraguay', '2026-06-13T01:00:00Z', '4-1'],
  ['D', 'Australia', 'Turkey', '2026-06-14T04:00:00Z', '2-0'],
  ['D', 'United States', 'Australia', '2026-06-19T19:00:00Z', '2-0'],
  ['D', 'Turkey', 'Paraguay', '2026-06-20T03:00:00Z', '0-1'],
  ['D', 'Turkey', 'United States', '2026-06-26T02:00:00Z', null],
  ['D', 'Paraguay', 'Australia', '2026-06-26T02:00:00Z', null],

  ['E', 'Germany', 'Curaçao', '2026-06-14T17:00:00Z', '7-1'],
  ['E', 'Ivory Coast', 'Ecuador', '2026-06-14T23:00:00Z', '1-0'],
  ['E', 'Germany', 'Ivory Coast', '2026-06-20T20:00:00Z', null],
  ['E', 'Ecuador', 'Curaçao', '2026-06-21T00:00:00Z', null],
  ['E', 'Curaçao', 'Ivory Coast', '2026-06-25T20:00:00Z', null],
  ['E', 'Ecuador', 'Germany', '2026-06-25T20:00:00Z', null],

  ['F', 'Netherlands', 'Japan', '2026-06-14T20:00:00Z', '2-2'],
  ['F', 'Sweden', 'Tunisia', '2026-06-15T02:00:00Z', '5-1'],
  ['F', 'Netherlands', 'Sweden', '2026-06-20T17:00:00Z', null],
  ['F', 'Tunisia', 'Japan', '2026-06-21T04:00:00Z', null],
  ['F', 'Japan', 'Sweden', '2026-06-25T23:00:00Z', null],
  ['F', 'Tunisia', 'Netherlands', '2026-06-25T23:00:00Z', null],

  ['G', 'Belgium', 'Egypt', '2026-06-15T19:00:00Z', '1-1'],
  ['G', 'Iran', 'New Zealand', '2026-06-16T01:00:00Z', '2-2'],
  ['G', 'Belgium', 'Iran', '2026-06-21T19:00:00Z', null],
  ['G', 'New Zealand', 'Egypt', '2026-06-22T01:00:00Z', null],
  ['G', 'Egypt', 'Iran', '2026-06-27T03:00:00Z', null],
  ['G', 'New Zealand', 'Belgium', '2026-06-27T03:00:00Z', null],

  ['H', 'Spain', 'Cape Verde', '2026-06-15T16:00:00Z', '0-0'],
  ['H', 'Saudi Arabia', 'Uruguay', '2026-06-15T22:00:00Z', '1-1'],
  ['H', 'Spain', 'Saudi Arabia', '2026-06-21T16:00:00Z', null],
  ['H', 'Uruguay', 'Cape Verde', '2026-06-21T22:00:00Z', null],
  ['H', 'Cape Verde', 'Saudi Arabia', '2026-06-27T00:00:00Z', null],
  ['H', 'Uruguay', 'Spain', '2026-06-27T00:00:00Z', null],

  ['I', 'France', 'Senegal', '2026-06-16T19:00:00Z', '3-1'],
  ['I', 'Iraq', 'Norway', '2026-06-16T22:00:00Z', '1-4'],
  ['I', 'France', 'Iraq', '2026-06-22T21:00:00Z', null],
  ['I', 'Norway', 'Senegal', '2026-06-23T00:00:00Z', null],
  ['I', 'Norway', 'France', '2026-06-26T19:00:00Z', null],
  ['I', 'Senegal', 'Iraq', '2026-06-26T19:00:00Z', null],

  ['J', 'Argentina', 'Algeria', '2026-06-17T01:00:00Z', '3-0'],
  ['J', 'Austria', 'Jordan', '2026-06-17T04:00:00Z', '3-1'],
  ['J', 'Argentina', 'Austria', '2026-06-22T17:00:00Z', null],
  ['J', 'Jordan', 'Algeria', '2026-06-23T03:00:00Z', null],
  ['J', 'Algeria', 'Austria', '2026-06-28T02:00:00Z', null],
  ['J', 'Jordan', 'Argentina', '2026-06-28T02:00:00Z', null],

  ['K', 'Portugal', 'DR Congo', '2026-06-17T17:00:00Z', '1-1'],
  ['K', 'Uzbekistan', 'Colombia', '2026-06-18T02:00:00Z', '1-3'],
  ['K', 'Portugal', 'Uzbekistan', '2026-06-23T17:00:00Z', null],
  ['K', 'Colombia', 'DR Congo', '2026-06-24T02:00:00Z', null],
  ['K', 'Colombia', 'Portugal', '2026-06-27T23:30:00Z', null],
  ['K', 'DR Congo', 'Uzbekistan', '2026-06-27T23:30:00Z', null],

  ['L', 'England', 'Croatia', '2026-06-17T20:00:00Z', '4-2'],
  ['L', 'Ghana', 'Panama', '2026-06-17T23:00:00Z', '1-0'],
  ['L', 'England', 'Ghana', '2026-06-23T20:00:00Z', null],
  ['L', 'Panama', 'Croatia', '2026-06-23T23:00:00Z', null],
  ['L', 'Panama', 'England', '2026-06-27T21:00:00Z', null],
  ['L', 'Croatia', 'Ghana', '2026-06-27T21:00:00Z', null],
];

// Lista achatada de seleções (para selects de cadastro / filtros).
export const TEAMS = Object.values(GROUPS_EN)
  .flat()
  .map((en) => T[en])
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export const PHASE_ORDER = [
  'Fase de Grupos',
  '16-avos',
  'Oitavas',
  'Quartas',
  'Semifinal',
  'Disputa do 3º',
  'Final',
];

const pad = (n) => String(n).padStart(2, '0');
const isoAtUTC = (dateStr, hour) => `${dateStr}T${pad(hour)}:00:00Z`;

function buildGroupMatches() {
  const out = [];
  Object.keys(GROUPS_EN).forEach((g) => {
    const fixtures = GROUP_FIXTURES.filter((f) => f[0] === g);
    fixtures.forEach(([, homeEn, awayEn, date, score], idx) => {
      const finished = !!score;
      let hs = null;
      let as = null;
      if (finished) {
        const [h, a] = score.split('-').map(Number);
        hs = h;
        as = a;
      }
      out.push({
        id: `G-${g}-${idx + 1}`,
        phase: 'Fase de Grupos',
        group: g,
        round: `${Math.floor(idx / 2) + 1}ª rodada`,
        home: T[homeEn],
        away: T[awayEn],
        date, // já em UTC (sufixo Z)
        homeScore: hs,
        awayScore: as,
        finished,
      });
    });
  });
  return out;
}

// Mata-mata real (datas oficiais). Times "A definir" — preencher no painel admin.
const KO_PHASES = [
  ['16-avos', 16, '2026-06-28', '2026-07-03'],
  ['Oitavas', 8, '2026-07-04', '2026-07-07'],
  ['Quartas', 4, '2026-07-09', '2026-07-11'],
  ['Semifinal', 2, '2026-07-14', '2026-07-15'],
  ['Disputa do 3º', 1, '2026-07-18', '2026-07-18'],
  ['Final', 1, '2026-07-19', '2026-07-19'],
];

function spreadDates(start, end, count) {
  const s = new Date(`${start}T12:00:00Z`).getTime();
  const e = new Date(`${end}T12:00:00Z`).getTime();
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? s : s + Math.round(((e - s) * i) / (count - 1));
    const d = new Date(t);
    out.push(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`);
  }
  return out;
}

function buildKnockoutMatches() {
  const out = [];
  for (const [phase, count, start, end] of KO_PHASES) {
    const dates = spreadDates(start, end, count);
    for (let i = 0; i < count; i++) {
      out.push({
        id: `KO-${phase}-${i + 1}`,
        phase,
        group: null,
        round: phase,
        home: null,
        away: null,
        // 20h/23h UTC ≈ 17h/20h de Brasília (ajuste no admin quando definir os times).
        date: isoAtUTC(dates[i], i % 2 === 0 ? 20 : 23),
        homeScore: null,
        awayScore: null,
        finished: false,
      });
    }
  }
  return out;
}

export function buildSeed() {
  return [...buildGroupMatches(), ...buildKnockoutMatches()];
}

// Mapeamento pt-BR ↔ inglês (para sincronizar placares externos).
const PT_TO_EN = Object.fromEntries(Object.entries(T).map(([en, t]) => [t.name, en]));

export function teamByEnglish(en) {
  return T[en] || null;
}

export function englishKeyForTeamName(name) {
  return PT_TO_EN[name] || null;
}
