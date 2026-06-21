import { RULES } from './data.js';

// Calcula os pontos de um palpite para um jogo já finalizado.
export function pointsFor(pred, match) {
  if (!match || !match.finished || match.homeScore == null || match.awayScore == null) return 0;
  if (!pred || pred.home == null || pred.away == null) return 0;

  const ph = Number(pred.home);
  const pa = Number(pred.away);
  const ah = Number(match.homeScore);
  const aa = Number(match.awayScore);
  if ([ph, pa, ah, aa].some((n) => Number.isNaN(n))) return 0;

  // Placar exato
  if (ph === ah && pa === aa) return RULES.exact;

  const predResult = Math.sign(ph - pa); // 1 mandante, 0 empate, -1 visitante
  const actualResult = Math.sign(ah - aa);

  if (predResult === actualResult) {
    // Acertou quem venceu (ou o empate)
    if (actualResult !== 0 && ph - pa === ah - aa) return RULES.resultDiff; // + saldo
    return RULES.result;
  }

  // Errou o resultado, mas cravou os gols de um dos times
  if (ph === ah || pa === aa) return RULES.oneTeam;

  return 0;
}

// Classificação textual do acerto (para feedback na interface).
export function classify(pred, match) {
  const pts = pointsFor(pred, match);
  if (pts === RULES.exact) return { pts, label: 'Cravou o placar!', tone: 'exact' };
  if (pts === RULES.resultDiff) return { pts, label: 'Vencedor + saldo', tone: 'great' };
  if (pts === RULES.result) return { pts, label: 'Acertou o resultado', tone: 'good' };
  if (pts === RULES.oneTeam) return { pts, label: 'Gols de um time', tone: 'meh' };
  return { pts, label: 'Não pontuou', tone: 'zero' };
}

// Monta o ranking geral: pontos de palpites + pontos manuais de presença.
export function computeRanking(users, betsByUser, matches, bonusByUser = {}) {
  const matchById = Object.fromEntries(matches.map((m) => [m.id, m]));

  return users
    .map((u) => {
      const ub = betsByUser[u.id] || {};
      let matchPoints = 0;
      let exacts = 0;
      let hits = 0;
      let played = 0;
      for (const [mid, pred] of Object.entries(ub)) {
        const m = matchById[mid];
        if (!m || !m.finished) continue;
        const p = pointsFor(pred, m);
        played += 1;
        if (p > 0) hits += 1;
        if (p === RULES.exact) exacts += 1;
        matchPoints += p;
      }
      const bonusPoints = bonusByUser[u.id] || 0;
      return {
        id: u.id,
        nome: u.nome,
        celula: u.celula,
        selecao: u.selecao,
        matchPoints,
        bonusPoints,
        points: matchPoints + bonusPoints,
        exacts,
        hits,
        played,
        createdAt: u.createdAt,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.exacts - a.exacts ||
        b.hits - a.hits ||
        a.createdAt - b.createdAt
    )
    .map((r, i) => ({ ...r, pos: i + 1 }));
}
