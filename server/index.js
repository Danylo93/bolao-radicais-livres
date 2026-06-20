import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './app.js';
import * as db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4010;
const ADMIN_KEY = process.env.ADMIN_KEY || 'rl2026';

// ----------------------------- Front-end (produção local) -------------------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ----------------------------- Boot ----------------------------------------
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  ⚽  Bolão RL no ar em http://localhost:${PORT}`);
      console.log(`  🔑  Chave admin: ${ADMIN_KEY}\n`);
    });
  })
  .catch((e) => {
    console.error('\n❌  Falha ao iniciar (banco de dados):', e.message);
    process.exit(1);
  });
