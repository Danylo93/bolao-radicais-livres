import app from '../server/app.js';
import * as db from '../server/db.js';

let initPromise;

function ensureDb() {
  initPromise ||= db.ping();
  return initPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (e) {
    initPromise = undefined;
    console.error('Falha ao iniciar API:', e);
    return res.status(503).json({
      error: 'Banco de dados indisponível. Confira DATABASE_URL, SSL e liberação de acesso ao Postgres.',
    });
  }
}
