// Espelho da lógica de pontuação do servidor (para feedback na interface).
export function pointsFor(pred, match, rules) {
  if (!match || !match.finished || match.homeScore == null || match.awayScore == null) return 0;
  if (!pred || pred.home == null || pred.away == null) return 0;
  const ph = Number(pred.home);
  const pa = Number(pred.away);
  const ah = Number(match.homeScore);
  const aa = Number(match.awayScore);
  if ([ph, pa, ah, aa].some((n) => Number.isNaN(n))) return 0;
  if (ph === ah && pa === aa) return rules.exact;
  const pr = Math.sign(ph - pa);
  const ar = Math.sign(ah - aa);
  if (pr === ar) {
    if (ar !== 0 && ph - pa === ah - aa) return rules.resultDiff;
    return rules.result;
  }
  if (ph === ah || pa === aa) return rules.oneTeam;
  return 0;
}

export function classify(pred, match, rules) {
  const pts = pointsFor(pred, match, rules);
  if (pts === rules.exact) return { pts, label: 'Cravou! 🎯', tone: 'exact' };
  if (pts === rules.resultDiff) return { pts, label: 'Vencedor + saldo', tone: 'great' };
  if (pts === rules.result) return { pts, label: 'Acertou o resultado', tone: 'good' };
  if (pts === rules.oneTeam) return { pts, label: 'Gols de um time', tone: 'meh' };
  return { pts, label: 'Não pontuou', tone: 'zero' };
}

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export function fmtDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${WD[d.getDay()]} ${dd}/${mm} • ${hh}:${mi}`;
}

export function fmtDay(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

export function matchStatus(m) {
  if (m.finished) return 'finished';
  if (m.open) return 'open';
  if (!m.home || !m.away) return 'tbd';
  return 'locked'; // já começou, sem resultado
}
