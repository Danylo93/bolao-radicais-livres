import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgres://bolao_admin:eFJifygWLkrScOc8RetP2aUcw5Es@bolao-rl-db.c29mkas48exm.us-east-1.rds.amazonaws.com:5432/bolao_rl',
  ssl: { rejectUnauthorized: false }
});

const officialKO = [
  { id: 'KO-16-avos-1', date: '2026-06-28T19:00:00Z' }, // 16h BRT
  { id: 'KO-16-avos-2', date: '2026-06-29T17:00:00Z' }, // 14h BRT
  { id: 'KO-16-avos-3', date: '2026-06-29T20:30:00Z' }, // 17h30 BRT
  { id: 'KO-16-avos-4', date: '2026-06-30T01:00:00Z' }, // 22h BRT (dia 29)
  { id: 'KO-16-avos-5', date: '2026-06-30T17:00:00Z' }, // 14h BRT
  { id: 'KO-16-avos-6', date: '2026-06-30T21:00:00Z' }, // 18h BRT
  { id: 'KO-16-avos-7', date: '2026-07-01T01:00:00Z' }, // 22h BRT (dia 30)
  { id: 'KO-16-avos-8', date: '2026-07-01T16:00:00Z' }, // 13h BRT
  { id: 'KO-16-avos-9', date: '2026-07-01T20:00:00Z' }, // 17h BRT
  { id: 'KO-16-avos-10', date: '2026-07-02T00:00:00Z' }, // 21h BRT (dia 1)
  { id: 'KO-16-avos-11', date: '2026-07-02T19:00:00Z' }, // 16h BRT
  { id: 'KO-16-avos-12', date: '2026-07-02T23:00:00Z' }, // 20h BRT
  { id: 'KO-16-avos-13', date: '2026-07-03T03:00:00Z' }, // 00h BRT (dia 3)
  { id: 'KO-16-avos-14', date: '2026-07-03T18:00:00Z' }, // 15h BRT
  { id: 'KO-16-avos-15', date: '2026-07-03T22:00:00Z' }, // 19h BRT
  { id: 'KO-16-avos-16', date: '2026-07-04T01:30:00Z' }, // 22h30 BRT (dia 3)
];

async function run() {
  for (const m of officialKO) {
    await pool.query('UPDATE matches SET match_date = $1 WHERE id = $2', [m.date, m.id]);
  }
  console.log('KO BRT dates updated!');
  process.exit(0);
}
run();
