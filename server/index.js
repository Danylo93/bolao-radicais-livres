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

    // CRON: A cada 5 minutos checa se tem jogos começando em até 30 minutos
    setInterval(async () => {
      try {
        const upcoming = await db.getMatchesToNotify(30);
        if (!upcoming.length) return;

        const subs = await db.getAllSubscriptions();
        const webpush = (await import('web-push')).default;

        for (const match of upcoming) {
          const msg = `⚽ Faltam 30 minutos: ${match.home.name} x ${match.away.name}. Você já fez seu palpite?`;
          const payload = JSON.stringify({
            title: 'Bolão Radicais Livres',
            body: msg,
            icon: '/icon-192.png',
            url: '/palpites'
          });

          // Dispara pra todos (em chunks seria ideal, mas pra app pequeno serve)
          await Promise.all(subs.map(({ subscription }) => 
            webpush.sendNotification(subscription, payload).catch(() => {})
          ));

          await db.markMatchNotified(match.id);
          console.log(`🔔 Notificação automática enviada para o jogo ${match.id}`);
        }
      } catch (e) {
        console.error('Erro no cron de notificações:', e);
      }
    }, 5 * 60 * 1000); // 5 minutos

  })
  .catch((e) => {
    console.error('\n❌  Falha ao iniciar (banco de dados):', e.message);
    process.exit(1);
  });
