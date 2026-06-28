// Preenche os 16-avos (Round of 32) com os confrontos + datas/horários OFICIAIS.
// Horário convertido do fuso da sede para UTC. Uso: `node scripts/fill-r32.mjs` (em server/).
import 'dotenv/config';
import { pool } from '../db.js';
import * as db from '../db.js';
import { teamByEnglish } from '../data.js';

// [slot KO-16-avos-N, homeEn, awayEn, kickoff em UTC]
const R32 = [
  [1, 'South Africa', 'Canada', '2026-06-28T19:00:00Z'],
  [2, 'Germany', 'Paraguay', '2026-06-29T20:30:00Z'],
  [3, 'Netherlands', 'Morocco', '2026-06-30T01:00:00Z'],
  [4, 'Brazil', 'Japan', '2026-06-29T17:00:00Z'],
  [5, 'France', 'Sweden', '2026-06-30T21:00:00Z'],
  [6, 'Ivory Coast', 'Norway', '2026-06-30T17:00:00Z'],
  [7, 'Mexico', 'Ecuador', '2026-07-01T01:00:00Z'],
  [8, 'England', 'DR Congo', '2026-07-01T16:00:00Z'],
  [9, 'United States', 'Bosnia and Herzegovina', '2026-07-02T00:00:00Z'],
  [10, 'Belgium', 'Senegal', '2026-07-01T20:00:00Z'],
  [11, 'Portugal', 'Croatia', '2026-07-02T23:00:00Z'],
  [12, 'Spain', 'Austria', '2026-07-02T19:00:00Z'],
  [13, 'Switzerland', 'Algeria', '2026-07-03T03:00:00Z'],
  [14, 'Argentina', 'Cape Verde', '2026-07-03T22:00:00Z'],
  [15, 'Colombia', 'Ghana', '2026-07-04T01:30:00Z'],
  [16, 'Australia', 'Egypt', '2026-07-03T18:00:00Z'],
];

let n = 0;
for (const [slot, h, a, date] of R32) {
  const home = teamByEnglish(h);
  const away = teamByEnglish(a);
  if (!home || !away) {
    console.log('⚠️ time não encontrado:', h, a);
    continue;
  }
  await db.updateMatch(`KO-16-avos-${slot}`, {
    home,
    away,
    date,
    homeScore: null,
    awayScore: null,
    finished: false,
  });
  n += 1;
  console.log(`KO-16-avos-${slot}: ${home.name} x ${away.name} @ ${date}`);
}
console.log(`\n✅ ${n} jogos do R32 atualizados.`);
await pool.end();
