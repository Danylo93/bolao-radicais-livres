import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as db from './db.js';
import { TOURNAMENT, RULES, TEAMS, PHASE_ORDER } from './data.js';
import { computeRanking } from './scoring.js';
import { maybeSync, syncMatches } from './sync.js';

const app = express();
const ADMIN_KEY = process.env.ADMIN_KEY || 'rl2026';

app.use(cors());
app.use(express.json());

// ----------------------------- Helpers --------------------------------------
function isOpen(m) {
  return !m.finished && !!m.home && !!m.away && new Date(m.date).getTime() > Date.now();
}
function withOpen(m) {
  return { ...m, open: isOpen(m) };
}

function buildStats(matches, participants) {
  const finished = matches.filter((m) => m.finished).length;
  const now = Date.now();
  const next =
    matches
      .filter((m) => m.home && m.away && !m.finished && new Date(m.date).getTime() > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
  return {
    participants,
    totalMatches: matches.length,
    finished,
    nextMatch: next ? withOpen(next) : null,
  };
}

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Chave de admin inválida.' });
  next();
}

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error(e);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// ----------------------------- API: público --------------------------------
app.get('/api/state', wrap(async (req, res) => {
  await maybeSync();
  const [matches, users, celulas] = await Promise.all([db.getMatches(), db.getUsers(), db.getCelulas()]);
  res.json({
    tournament: TOURNAMENT,
    rules: RULES,
    teams: TEAMS,
    phaseOrder: PHASE_ORDER,
    matches: matches.map(withOpen),
    celulas,
    stats: buildStats(matches, users.length),
  });
}));

app.post('/api/register', wrap(async (req, res) => {
  const { nome, celula, selecao, telefone } = req.body || {};
  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!telefone || db.normalizePhone(telefone).length < 10)
    return res.status(400).json({ error: 'Informe um telefone válido com DDD.' });
  try {
    const user = await db.addUser({ nome, celula, selecao, telefone });
    res.status(201).json({ user: db.publicUser(user) });
  } catch (e) {
    if (e.code === '23505')
      return res.status(409).json({ error: 'Esse telefone já está cadastrado. Use "Já participo".' });
    throw e;
  }
}));

app.post('/api/login', wrap(async (req, res) => {
  const { telefone } = req.body || {};
  const user = await db.findUserByPhone(telefone);
  if (!user) return res.status(404).json({ error: 'Telefone não encontrado. Faça seu cadastro.' });
  res.json({ user: db.publicUser(user) });
}));

app.get('/api/users/:id', wrap(async (req, res) => {
  const user = await db.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Participante não encontrado.' });
  const bets = await db.getUserBets(user.id);
  res.json({ user: db.publicUser(user), bets });
}));

app.post('/api/users/:id/bets', wrap(async (req, res) => {
  const user = await db.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Participante não encontrado.' });

  const incoming = (req.body && req.body.bets) || {};
  const matches = await db.getMatches();
  const byId = Object.fromEntries(matches.map((m) => [m.id, m]));

  let saved = 0;
  let rejected = 0;
  for (const [matchId, pred] of Object.entries(incoming)) {
    const m = byId[matchId];
    if (!m || !isOpen(m)) {
      rejected += 1;
      continue;
    }
    if (pred == null || pred.home === '' || pred.away === '' || pred.home == null || pred.away == null) {
      await db.deleteBet(user.id, matchId);
      continue;
    }
    const home = Math.max(0, Math.min(30, parseInt(pred.home, 10)));
    const away = Math.max(0, Math.min(30, parseInt(pred.away, 10)));
    if (Number.isNaN(home) || Number.isNaN(away)) {
      rejected += 1;
      continue;
    }
    await db.setBet(user.id, matchId, home, away);
    saved += 1;
  }
  res.json({ saved, rejected });
}));

app.get('/api/ranking', wrap(async (req, res) => {
  await maybeSync();
  const [users, bets, matches] = await Promise.all([db.getUsers(), db.getAllBets(), db.getMatches()]);
  res.json({ ranking: computeRanking(users, bets, matches) });
}));

// ----------------------------- API: admin ----------------------------------
app.post('/api/admin/login', (req, res) => {
  const { key } = req.body || {};
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Chave inválida.' });
  res.json({ ok: true });
});

app.get('/api/admin/users', requireAdmin, wrap(async (req, res) => {
  const users = await db.getUsers();
  res.json({ users });
}));

app.post('/api/admin/match/:id', requireAdmin, wrap(async (req, res) => {
  const { homeScore, awayScore, finished, home, away, date } = req.body || {};
  const match = await db.updateMatch(req.params.id, { homeScore, awayScore, finished, home, away, date });
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado.' });
  res.json({ match: withOpen(match) });
}));

app.post('/api/admin/reset', requireAdmin, wrap(async (req, res) => {
  const what = (req.body && req.body.what) || 'participants';
  if (what === 'participants') await db.resetParticipants();
  else if (what === 'results') await db.resetResults();
  res.json({ ok: true });
}));

app.post('/api/admin/sync', requireAdmin, wrap(async (req, res) => {
  const result = await syncMatches();
  await db.setMeta('last_sync_at', String(Date.now()));
  res.json({ ok: true, ...result });
}));

app.get('/api/cron/sync', wrap(async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
  }
  const result = await syncMatches();
  await db.setMeta('last_sync_at', String(Date.now()));
  res.json({ ok: true, ...result });
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
