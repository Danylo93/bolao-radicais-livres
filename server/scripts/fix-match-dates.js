// Atualiza SOMENTE o horário (match_date) dos jogos já existentes no banco,
// usando os horários oficiais (UTC) definidos em data.js. Preserva placares,
// times e status. Uso: `node scripts/fix-match-dates.js` (a partir de server/).
import 'dotenv/config';
import { pool } from '../db.js';
import { buildSeed } from '../data.js';

const seed = buildSeed();
let updated = 0;
for (const m of seed) {
  const r = await pool.query('UPDATE matches SET match_date = $2 WHERE id = $1', [m.id, m.date]);
  updated += r.rowCount;
}
console.log(`Horários atualizados: ${updated} jogos.`);
await pool.end();
