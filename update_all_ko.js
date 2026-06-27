import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgres://bolao_admin:eFJifygWLkrScOc8RetP2aUcw5Es@bolao-rl-db.c29mkas48exm.us-east-1.rds.amazonaws.com:5432/bolao_rl',
  ssl: { rejectUnauthorized: false }
});

const officialKO = [
  // 16-avos (matches 73-88) - Já ajustados
  
  // Oitavas (8 jogos)
  { id: 'KO-Oitavas-1', date: '2026-07-04T17:00:00Z' }, // 14:00 BRT (M90)
  { id: 'KO-Oitavas-2', date: '2026-07-04T21:00:00Z' }, // 18:00 BRT (M89)
  { id: 'KO-Oitavas-3', date: '2026-07-05T20:00:00Z' }, // 17:00 BRT (M91)
  { id: 'KO-Oitavas-4', date: '2026-07-06T00:00:00Z' }, // 21:00 BRT (M92)
  { id: 'KO-Oitavas-5', date: '2026-07-06T19:00:00Z' }, // 16:00 BRT (M93)
  { id: 'KO-Oitavas-6', date: '2026-07-07T00:00:00Z' }, // 21:00 BRT (M94)
  { id: 'KO-Oitavas-7', date: '2026-07-07T16:00:00Z' }, // 13:00 BRT (M95)
  { id: 'KO-Oitavas-8', date: '2026-07-07T20:00:00Z' }, // 17:00 BRT (M96)

  // Quartas (4 jogos)
  { id: 'KO-Quartas-1', date: '2026-07-09T20:00:00Z' }, // 17:00 BRT (M97)
  { id: 'KO-Quartas-2', date: '2026-07-10T19:00:00Z' }, // 16:00 BRT (M98)
  { id: 'KO-Quartas-3', date: '2026-07-11T21:00:00Z' }, // 18:00 BRT (M99)
  { id: 'KO-Quartas-4', date: '2026-07-12T01:00:00Z' }, // 22:00 BRT (M100)

  // Semifinais (2 jogos)
  { id: 'KO-Semifinal-1', date: '2026-07-14T19:00:00Z' }, // 16:00 BRT (M101)
  { id: 'KO-Semifinal-2', date: '2026-07-15T19:00:00Z' }, // 16:00 BRT (M102)

  // 3º Lugar
  { id: 'KO-Disputa do 3º-1', date: '2026-07-18T21:00:00Z' }, // 18:00 BRT (Estimado)

  // Final
  { id: 'KO-Final-1', date: '2026-07-19T19:00:00Z' }, // 16:00 BRT (Confirmado NY)
];

async function run() {
  for (const m of officialKO) {
    await pool.query('UPDATE matches SET match_date = $1 WHERE id = $2', [m.date, m.id]);
  }
  console.log('All remaining KO BRT dates updated!');
  process.exit(0);
}
run();
