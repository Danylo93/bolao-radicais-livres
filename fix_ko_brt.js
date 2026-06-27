import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgres://bolao_admin:eFJifygWLkrScOc8RetP2aUcw5Es@bolao-rl-db.c29mkas48exm.us-east-1.rds.amazonaws.com:5432/bolao_rl',
  ssl: { rejectUnauthorized: false }
});

const correctDates = [
  { id: 'KO-16-avos-1', date: '2026-06-28T19:00:00Z' }, // 16:00 BRT (África do Sul x Canadá)
  { id: 'KO-16-avos-2', date: '2026-06-29T20:30:00Z' }, // 17:30 BRT (Alemanha x Paraguai)
  { id: 'KO-16-avos-3', date: '2026-06-30T01:00:00Z' }, // 22:00 BRT (Holanda x Marrocos)
  { id: 'KO-16-avos-4', date: '2026-06-29T17:00:00Z' }, // 14:00 BRT (Brasil x Japão)
  { id: 'KO-16-avos-5', date: '2026-06-30T21:00:00Z' }, // 18:00 BRT (França x Suécia)
  { id: 'KO-16-avos-6', date: '2026-06-30T17:00:00Z' }, // 14:00 BRT (Costa do Marfim x Noruega)
  { id: 'KO-16-avos-7', date: '2026-07-01T01:00:00Z' }, // 22:00 BRT (México)
  { id: 'KO-16-avos-8', date: '2026-07-01T16:00:00Z' }, // 13:00 BRT (Vazio)
  { id: 'KO-16-avos-9', date: '2026-07-02T00:00:00Z' }, // 21:00 BRT (EUA x Bósnia)
  { id: 'KO-16-avos-10', date: '2026-07-01T20:00:00Z' }, // 17:00 BRT (Bélgica)
  { id: 'KO-16-avos-11', date: '2026-07-02T23:00:00Z' }, // 20:00 BRT (Vazio)
  { id: 'KO-16-avos-12', date: '2026-07-02T19:00:00Z' }, // 16:00 BRT (Espanha)
  { id: 'KO-16-avos-13', date: '2026-07-03T03:00:00Z' }, // 00:00 BRT (Suíça)
  { id: 'KO-16-avos-14', date: '2026-07-03T22:00:00Z' }, // 19:00 BRT (Argentina x Cabo Verde)
  { id: 'KO-16-avos-15', date: '2026-07-04T01:30:00Z' }, // 22:30 BRT (Vazio)
  { id: 'KO-16-avos-16', date: '2026-07-03T18:00:00Z' }, // 15:00 BRT (Austrália x Egito)
];

async function run() {
  for (const m of correctDates) {
    await pool.query('UPDATE matches SET match_date = $1 WHERE id = $2', [m.date, m.id]);
  }
  console.log('Fixed KO dates based on specific matchups!');
  process.exit(0);
}
run();
