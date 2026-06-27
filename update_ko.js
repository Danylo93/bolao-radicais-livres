import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://bolao_admin:eFJifygWLkrScOc8RetP2aUcw5Es@bolao-rl-db.c29mkas48exm.us-east-1.rds.amazonaws.com:5432/bolao_rl',
  ssl: { rejectUnauthorized: false }
});

const officialKO = [
  // Round of 32 (16-avos)
  { id: 'KO-16-avos-1', date: '2026-06-28T21:00:00Z' }, // Match 73
  { id: 'KO-16-avos-2', date: '2026-06-29T17:00:00Z' }, // Match 74
  { id: 'KO-16-avos-3', date: '2026-06-29T21:00:00Z' }, // Match 75
  { id: 'KO-16-avos-4', date: '2026-06-29T00:00:00Z' }, // Match 76 (next day UTC)
  { id: 'KO-16-avos-5', date: '2026-06-30T17:00:00Z' }, // Match 77
  { id: 'KO-16-avos-6', date: '2026-06-30T21:00:00Z' }, // Match 78
  { id: 'KO-16-avos-7', date: '2026-06-30T00:00:00Z' }, // Match 79
  { id: 'KO-16-avos-8', date: '2026-07-01T17:00:00Z' }, // Match 80
  { id: 'KO-16-avos-9', date: '2026-07-01T21:00:00Z' }, // Match 81
  { id: 'KO-16-avos-10', date: '2026-07-01T00:00:00Z' }, // Match 82
  { id: 'KO-16-avos-11', date: '2026-07-02T17:00:00Z' }, // Match 83
  { id: 'KO-16-avos-12', date: '2026-07-02T21:00:00Z' }, // Match 84
  { id: 'KO-16-avos-13', date: '2026-07-02T00:00:00Z' }, // Match 85
  { id: 'KO-16-avos-14', date: '2026-07-03T17:00:00Z' }, // Match 86
  { id: 'KO-16-avos-15', date: '2026-07-03T21:00:00Z' }, // Match 87
  { id: 'KO-16-avos-16', date: '2026-07-03T00:00:00Z' }, // Match 88
];

async function run() {
  for (const m of officialKO) {
    await pool.query('UPDATE matches SET match_date = $1 WHERE id = $2', [m.date, m.id]);
  }
  console.log('Done updating KO dates!');
  process.exit(0);
}
run();
