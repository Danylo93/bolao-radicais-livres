import 'dotenv/config';
import pg from 'pg';
import { buildSeed } from './data.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('\n⚠️  DATABASE_URL não definido. Configure server/.env (veja server/.env.example).\n');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // RDS exige SSL; aceitamos o certificado padrão da AWS.
  ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || (process.env.VERCEL ? 1 : 10)),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 5000),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 10000),
});

export function normalizePhone(tel) {
  return String(tel || '').replace(/\D/g, '');
}

function rowToMatch(r) {
  return {
    id: r.id,
    phase: r.phase,
    group: r.grupo,
    round: r.round,
    home: r.home_name ? { name: r.home_name, flag: r.home_flag } : null,
    away: r.away_name ? { name: r.away_name, flag: r.away_flag } : null,
    date: r.match_date instanceof Date ? r.match_date.toISOString() : r.match_date,
    homeScore: r.home_score,
    awayScore: r.away_score,
    finished: r.finished,
    penalties: r.penalties || null,
  };
}

// ----------------------------- Inicialização --------------------------------
export async function ping() {
  await pool.query('SELECT 1');
}

export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id          TEXT PRIMARY KEY,
      phase       TEXT NOT NULL,
      grupo       TEXT,
      round       TEXT,
      home_name   TEXT,
      home_flag   TEXT,
      away_name   TEXT,
      away_flag   TEXT,
      match_date  TIMESTAMPTZ NOT NULL,
      home_score  INTEGER,
      away_score  INTEGER,
      finished    BOOLEAN NOT NULL DEFAULT FALSE,
      notified_push BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);
  
  // Migração para os bancos existentes
  await pool.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS notified_push BOOLEAN DEFAULT FALSE;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      nome       TEXT NOT NULL,
      celula     TEXT NOT NULL DEFAULT '',
      selecao    TEXT NOT NULL DEFAULT '',
      email      TEXT,
      telefone   TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Migrações p/ bancos já existentes: adiciona e-mail e torna telefone opcional.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;`);
  await pool.query(`ALTER TABLE users ALTER COLUMN telefone DROP NOT NULL;`);
  await pool.query(`ALTER TABLE users ALTER COLUMN telefone SET DEFAULT '';`);
  await pool.query(`DROP INDEX IF EXISTS users_phone_digits;`);
  // E-mail é opcional (login é por telefone): único SÓ quando preenchido
  // (índice parcial) — evita colisão entre vários cadastros sem e-mail.
  await pool.query(`DROP INDEX IF EXISTS users_email_lower;`);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower
    ON users ((lower(email))) WHERE email IS NOT NULL AND email <> '';
  `);
  // Conserta cadastros antigos que gravaram e-mail vazio/"undefined".
  await pool.query(`UPDATE users SET email = NULL WHERE email = '' OR lower(email) = 'undefined';`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bets (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      home     INTEGER NOT NULL,
      away     INTEGER NOT NULL,
      PRIMARY KEY (user_id, match_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Pontos manuais de presença (culto, célula, visitantes).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind       TEXT NOT NULL,
      points     INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM matches');
  if (rows[0].n === 0) {
    await seedMatches();
    console.log('  🌱  Jogos da Copa 2026 carregados no banco.');
  }
}

async function seedMatches() {
  const matches = buildSeed();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const m of matches) {
      await client.query(
        `INSERT INTO matches
           (id, phase, grupo, round, home_name, home_flag, away_name, away_flag, match_date, home_score, away_score, finished)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [
          m.id, m.phase, m.group, m.round,
          m.home?.name ?? null, m.home?.flag ?? null,
          m.away?.name ?? null, m.away?.flag ?? null,
          m.date, m.homeScore, m.awayScore, m.finished,
        ]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ----------------------------- Jogos ----------------------------------------
export async function getMatches() {
  const { rows } = await pool.query('SELECT * FROM matches ORDER BY match_date, id');
  return rows.map(rowToMatch);
}

export async function getMatch(id) {
  const { rows } = await pool.query('SELECT * FROM matches WHERE id = $1', [id]);
  return rows[0] ? rowToMatch(rows[0]) : null;
}

export async function updateMatch(id, p) {
  const cur = await getMatch(id);
  if (!cur) return null;
  const home = p.home !== undefined ? p.home : cur.home;
  const away = p.away !== undefined ? p.away : cur.away;
  const date = p.date !== undefined ? p.date : cur.date;
  let hs = p.homeScore !== undefined ? (p.homeScore === '' || p.homeScore === null ? null : Number(p.homeScore)) : cur.homeScore;
  let as = p.awayScore !== undefined ? (p.awayScore === '' || p.awayScore === null ? null : Number(p.awayScore)) : cur.awayScore;
  let finished = p.finished !== undefined ? !!p.finished : cur.finished;
  if (finished && (hs == null || as == null)) finished = false;
  const penalties = p.penalties !== undefined ? (p.penalties || null) : cur.penalties;

  await pool.query(
    `UPDATE matches
       SET home_name=$2, home_flag=$3, away_name=$4, away_flag=$5,
           match_date=$6, home_score=$7, away_score=$8, finished=$9, penalties=$10
     WHERE id=$1`,
    [id, home?.name ?? null, home?.flag ?? null, away?.name ?? null, away?.flag ?? null, date, hs, as, finished, penalties]
  );
  return getMatch(id);
}

// ----------------------------- Usuários -------------------------------------
export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, nome: u.nome, celula: u.celula, selecao: u.selecao, email: u.email, telefone: u.telefone };
}

export async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at');
  return rows.map((u) => ({ ...u, createdAt: new Date(u.created_at).getTime() }));
}

export async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [String(email || '').trim()]
  );
  return rows[0] || null;
}

export async function findUserByPhone(tel) {
  const t = normalizePhone(tel);
  if (!t) return null;
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE regexp_replace(telefone, '[^0-9]', '', 'g') = $1 LIMIT 1`,
    [t]
  );
  return rows[0] || null;
}

export async function addUser({ nome, celula, selecao, email, telefone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (nome, celula, selecao, email, telefone) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      String(nome).trim(),
      String(celula || '').trim(),
      String(selecao || '').trim(),
      email && String(email).trim() ? String(email).trim().toLowerCase() : null,
      String(telefone || '').trim(),
    ]
  );
  return rows[0];
}

export async function getCelulas() {
  const { rows } = await pool.query(
    `SELECT DISTINCT celula FROM users WHERE celula <> '' ORDER BY celula`
  );
  return rows.map((r) => r.celula);
}

export async function updateUser(id, { nome, celula, selecao, email, telefone }) {
  const { rows } = await pool.query(
    `UPDATE users
       SET nome = $2, celula = $3, selecao = $4, email = $5, telefone = $6
     WHERE id = $1
     RETURNING *`,
    [
      id,
      String(nome || '').trim(),
      String(celula || '').trim(),
      String(selecao || '').trim(),
      email ? String(email).trim().toLowerCase() : null,
      String(telefone || '').trim(),
    ]
  );
  return rows[0] || null;
}

export async function deleteUser(id) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}

// ----------------------------- Presença (pontos manuais) --------------------
export async function addActivity(userId, kind, points) {
  const { rows } = await pool.query(
    `INSERT INTO activities (user_id, kind, points) VALUES ($1, $2, $3) RETURNING *`,
    [userId, kind, points]
  );
  return rows[0];
}

export async function deleteActivity(id) {
  const { rowCount } = await pool.query('DELETE FROM activities WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getActivityTotals() {
  const { rows } = await pool.query(
    'SELECT user_id, COALESCE(SUM(points), 0)::int AS total FROM activities GROUP BY user_id'
  );
  const map = {};
  for (const r of rows) map[r.user_id] = r.total;
  return map;
}

export async function getUserActivityTotal(userId) {
  const { rows } = await pool.query(
    'SELECT COALESCE(SUM(points), 0)::int AS total FROM activities WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.total || 0;
}

export async function getAllActivities() {
  const { rows } = await pool.query(
    'SELECT id, user_id, kind, points, created_at FROM activities ORDER BY created_at DESC'
  );
  return rows;
}

// ----------------------------- Palpites -------------------------------------
export async function getUserBets(userId) {
  const { rows } = await pool.query('SELECT match_id, home, away FROM bets WHERE user_id = $1', [userId]);
  const b = {};
  for (const r of rows) b[r.match_id] = { home: r.home, away: r.away };
  return b;
}

export async function getAllBets() {
  const { rows } = await pool.query('SELECT user_id, match_id, home, away FROM bets');
  const map = {};
  for (const r of rows) {
    (map[r.user_id] ||= {})[r.match_id] = { home: r.home, away: r.away };
  }
  return map;
}

export async function setBet(userId, matchId, home, away) {
  await pool.query(
    `INSERT INTO bets (user_id, match_id, home, away) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, match_id) DO UPDATE SET home = $3, away = $4`,
    [userId, matchId, home, away]
  );
}

export async function deleteBet(userId, matchId) {
  await pool.query('DELETE FROM bets WHERE user_id = $1 AND match_id = $2', [userId, matchId]);
}

// ----------------------------- Reset (admin) --------------------------------
export async function resetParticipants() {
  await pool.query('TRUNCATE bets, users RESTART IDENTITY CASCADE');
}

export async function resetResults() {
  await pool.query('UPDATE matches SET finished = FALSE, home_score = NULL, away_score = NULL');
}

// ----------------------------- Meta / sync ----------------------------------
export async function getMeta(key) {
  const { rows } = await pool.query('SELECT value FROM meta WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
}

export async function setMeta(key, value) {
  await pool.query(
    `INSERT INTO meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, String(value)]
  );
}

// ----------------------------- Push Notifications ------------------------------

export async function saveSubscription(userId, subscription) {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) return;
  
  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE 
     SET user_id = $1, p256dh = $3, auth = $4`,
    [userId, endpoint, keys.p256dh, keys.auth]
  );
}

export async function getAllSubscriptions() {
  const { rows } = await pool.query('SELECT user_id, endpoint, p256dh, auth FROM push_subscriptions');
  return rows.map(r => ({
    userId: r.user_id,
    subscription: {
      endpoint: r.endpoint,
      keys: { p256dh: r.p256dh, auth: r.auth }
    }
  }));
}

export async function getMatchesToNotify(minutesFromNow = 30) {
  const { rows } = await pool.query(`
    SELECT * FROM matches 
    WHERE notified_push = FALSE 
    AND match_date > now() 
    AND match_date <= now() + interval '1 minute' * $1
    AND home_name IS NOT NULL AND home_name <> ''
    AND away_name IS NOT NULL AND away_name <> ''
  `, [minutesFromNow]);
  return rows.map(rowToMatch);
}

export async function markMatchNotified(id) {
  await pool.query('UPDATE matches SET notified_push = TRUE WHERE id = $1', [id]);
}


export async function shouldSync(maxAgeMs = 5 * 60 * 1000) {
  const last = await getMeta('last_sync_at');
  if (!last) return true;
  return Date.now() - Number(last) > maxAgeMs;
}
