import app from '../server/app.js';
import * as db from '../server/db.js';

let initPromise;

function ensureDb() {
  initPromise ||= db.init();
  return initPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (e) {
    console.error('Falha ao iniciar API:', e);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
