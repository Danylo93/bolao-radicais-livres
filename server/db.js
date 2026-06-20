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
  };
}

// ----------------------------- Inicialização --------------------------------
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
      finished    BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      nome       TEXT NOT NULL,
      celula     TEXT NOT NULL DEFAULT '',
      selecao    TEXT NOT NULL DEFAULT '',
      telefone   TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Telefone único pelos dígitos (ignora máscara/formatação).
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_phone_digits
    ON users ((regexp_replace(telefone, '[^0-9]', '', 'g')));
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bets (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      home     INTEGER NOT NULL,
      away     INTEGER NOT NULL,
      PRIMARY KEY (user_id, match_id)
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

  await pool.query(
    `UPDATE matches
       SET home_name=$2, home_flag=$3, away_name=$4, away_flag=$5,
           match_date=$6, home_score=$7, away_score=$8, finished=$9
     WHERE id=$1`,
    [id, home?.name ?? null, home?.flag ?? null, away?.name ?? null, away?.flag ?? null, date, hs, as, finished]
  );
  return getMatch(id);
}

// ----------------------------- Usuários -------------------------------------
export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, nome: u.nome, celula: u.celula, selecao: u.selecao, telefone: u.telefone };
}

export async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at');
  return rows.map((u) => ({ ...u, createdAt: new Date(u.created_at).getTime() }));
}

export async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function findUserByPhone(tel) {
  const t = normalizePhone(tel);
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE regexp_replace(telefone, '[^0-9]', '', 'g') = $1 LIMIT 1`,
    [t]
  );
  return rows[0] || null;
}

export async function addUser({ nome, celula, selecao, telefone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (nome, celula, selecao, telefone) VALUES ($1,$2,$3,$4) RETURNING *`,
    [String(nome).trim(), String(celula || '').trim(), String(selecao || '').trim(), String(telefone).trim()]
  );
  return rows[0];
}

export async function getCelulas() {
  const { rows } = await pool.query(
    `SELECT DISTINCT celula FROM users WHERE celula <> '' ORDER BY celula`
  );
  return rows.map((r) => r.celula);
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
