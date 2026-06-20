// ============================================================================
//  BOLÃO RL — Dados REAIS da Copa do Mundo FIFA 2026
//  Fonte: Wikipédia (2026 FIFA World Cup, páginas dos Grupos A–L) — jun/2026.
//  Grupos, confrontos, datas e placares da fase de grupos são reais.
//  Mata-mata: vagas com times "A definir" (preencher no painel conforme a Copa).
// ============================================================================

export const TOURNAMENT = {
  name: 'Bolão RL',
  subtitle: 'Copa RL São Miguel 2026',
  prize: '1 amor que pensa em novembro 💘',
  edition: 'Edição São Miguel • Jovens RL',
};

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

// Confrontos reais da fase de grupos: [grupo, mandante, visitante, data, placar|null]
const GROUP_FIXTURES = [
  ['A', 'Mexico', 'South Africa', '2026-06-11', '2-0'],
  ['A', 'South Korea', 'Czech Republic', '2026-06-11', '2-1'],
  ['A', 'Czech Republic', 'South Africa', '2026-06-18', '1-1'],
  ['A', 'Mexico', 'South Korea', '2026-06-18', '1-0'],
  ['A', 'Czech Republic', 'Mexico', '2026-06-24', null],
  ['A', 'South Africa', 'South Korea', '2026-06-24', null],

  ['B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12', '1-1'],
  ['B', 'Qatar', 'Switzerland', '2026-06-13', '1-1'],
  ['B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18', '4-1'],
  ['B', 'Canada', 'Qatar', '2026-06-18', '6-0'],
  ['B', 'Switzerland', 'Canada', '2026-06-24', null],
  ['B', 'Bosnia and Herzegovina', 'Qatar', '2026-06-24', null],

  ['C', 'Brazil', 'Morocco', '2026-06-13', '1-1'],
  ['C', 'Haiti', 'Scotland', '2026-06-13', '0-1'],
  ['C', 'Scotland', 'Morocco', '2026-06-19', '0-1'],
  ['C', 'Brazil', 'Haiti', '2026-06-19', '3-0'],
  ['C', 'Scotland', 'Brazil', '2026-06-24', null],
  ['C', 'Morocco', 'Haiti', '2026-06-24', null],

  ['D', 'United States', 'Paraguay', '2026-06-12', '4-1'],
  ['D', 'Australia', 'Turkey', '2026-06-13', '2-0'],
  ['D', 'United States', 'Australia', '2026-06-19', '2-0'],
  ['D', 'Turkey', 'Paraguay', '2026-06-19', '0-1'],
  ['D', 'Turkey', 'United States', '2026-06-25', null],
  ['D', 'Paraguay', 'Australia', '2026-06-25', null],

  ['E', 'Germany', 'Curaçao', '2026-06-14', '7-1'],
  ['E', 'Ivory Coast', 'Ecuador', '2026-06-14', '1-0'],
  ['E', 'Germany', 'Ivory Coast', '2026-06-20', null],
  ['E', 'Ecuador', 'Curaçao', '2026-06-20', null],
  ['E', 'Curaçao', 'Ivory Coast', '2026-06-25', null],
  ['E', 'Ecuador', 'Germany', '2026-06-25', null],

  ['F', 'Netherlands', 'Japan', '2026-06-14', '2-2'],
  ['F', 'Sweden', 'Tunisia', '2026-06-14', '5-1'],
  ['F', 'Netherlands', 'Sweden', '2026-06-20', null],
  ['F', 'Tunisia', 'Japan', '2026-06-20', null],
  ['F', 'Japan', 'Sweden', '2026-06-25', null],
  ['F', 'Tunisia', 'Netherlands', '2026-06-25', null],

  ['G', 'Belgium', 'Egypt', '2026-06-15', '1-1'],
  ['G', 'Iran', 'New Zealand', '2026-06-15', '2-2'],
  ['G', 'Belgium', 'Iran', '2026-06-21', null],
  ['G', 'New Zealand', 'Egypt', '2026-06-21', null],
  ['G', 'Egypt', 'Iran', '2026-06-26', null],
  ['G', 'New Zealand', 'Belgium', '2026-06-26', null],

  ['H', 'Spain', 'Cape Verde', '2026-06-15', '0-0'],
  ['H', 'Saudi Arabia', 'Uruguay', '2026-06-15', '1-1'],
  ['H', 'Spain', 'Saudi Arabia', '2026-06-21', null],
  ['H', 'Uruguay', 'Cape Verde', '2026-06-21', null],
  ['H', 'Cape Verde', 'Saudi Arabia', '2026-06-26', null],
  ['H', 'Uruguay', 'Spain', '2026-06-26', null],

  ['I', 'France', 'Senegal', '2026-06-16', '3-1'],
  ['I', 'Iraq', 'Norway', '2026-06-16', '1-4'],
  ['I', 'France', 'Iraq', '2026-06-22', null],
  ['I', 'Norway', 'Senegal', '2026-06-22', null],
  ['I', 'Norway', 'France', '2026-06-26', null],
  ['I', 'Senegal', 'Iraq', '2026-06-26', null],

  ['J', 'Argentina', 'Algeria', '2026-06-16', '3-0'],
  ['J', 'Austria', 'Jordan', '2026-06-16', '3-1'],
  ['J', 'Argentina', 'Austria', '2026-06-22', null],
  ['J', 'Jordan', 'Algeria', '2026-06-22', null],
  ['J', 'Algeria', 'Austria', '2026-06-27', null],
  ['J', 'Jordan', 'Argentina', '2026-06-27', null],

  ['K', 'Portugal', 'DR Congo', '2026-06-17', '1-1'],
  ['K', 'Uzbekistan', 'Colombia', '2026-06-17', '1-3'],
  ['K', 'Portugal', 'Uzbekistan', '2026-06-23', null],
  ['K', 'Colombia', 'DR Congo', '2026-06-23', null],
  ['K', 'Colombia', 'Portugal', '2026-06-27', null],
  ['K', 'DR Congo', 'Uzbekistan', '2026-06-27', null],

  ['L', 'England', 'Croatia', '2026-06-17', '4-2'],
  ['L', 'Ghana', 'Panama', '2026-06-17', '1-0'],
  ['L', 'England', 'Ghana', '2026-06-23', null],
  ['L', 'Panama', 'Croatia', '2026-06-23', null],
  ['L', 'Panama', 'England', '2026-06-27', null],
  ['L', 'Croatia', 'Ghana', '2026-06-27', null],
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
const isoAt = (dateStr, hour) => `${dateStr}T${pad(hour)}:00:00-03:00`; // horário de Brasília
const GROUP_HOURS = [13, 16, 19, 22];

function buildGroupMatches() {
  const out = [];
  Object.keys(GROUPS_EN).forEach((g, gi) => {
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
        date: isoAt(date, GROUP_HOURS[gi % 4]),
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
  const s = new Date(`${start}T12:00:00-03:00`).getTime();
  const e = new Date(`${end}T12:00:00-03:00`).getTime();
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? s : s + Math.round(((e - s) * i) / (count - 1));
    const d = new Date(t);
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
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
        date: isoAt(dates[i], i % 2 === 0 ? 16 : 20),
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
