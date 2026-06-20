# ⚽ Bolão RL — Copa RL São Miguel 2026

Bolão interativo da Copa do Mundo 2026 para os **jovens da RL São Miguel**.
O jovem escaneia o **QR Code**, se cadastra (Nome, Célula, Seleção do coração e Telefone),
dá os palpites em todos os jogos e disputa o **ranking geral** ao vivo.

> 🏆 **Prêmio do campeão:** _1 amor que pensa em novembro_ 💘

---

## ✨ O que tem

- **Cadastro relâmpago** (Nome, Célula, Seleção, Telefone) — é só escanear o QR Code.
- **104 jogos da Copa 2026** (72 da fase de grupos + 32 do mata-mata).
- **Palpites** com bloqueio automático no horário de cada jogo.
- **Motor de pontuação** com feedback de acerto (cravou, vencedor + saldo, etc.).
- **Ranking geral** com pódio animado e **filtros** por célula, seleção e nome.
- **Painel do organizador** (`/admin`) pra lançar resultados e definir os times do mata-mata.
- **100% responsivo** (feito pra celular) e **bem animado**.

## 🧰 Stack

- **Front-end:** React 18 + Vite + TailwindCSS + Framer Motion + lucide-react + qrcode.react + canvas-confetti
- **Back-end:** Node.js + Express (API REST) + PostgreSQL (`pg`)

---

## 🚀 Como rodar

### 1) Instalar tudo
```bash
npm run setup
```

### 2a) Desenvolvimento (com hot reload)
```bash
npm run dev
```
- App (Vite): http://localhost:5173
- API (Express): http://localhost:4010

### 2b) Produção (um servidor só)
```bash
npm run build   # gera o front em client/dist
npm start       # Express serve o app + API em http://localhost:4010
```

> A porta padrão é **4010** (a 3001 estava ocupada nesta máquina). Mude com `PORT=...`.

### 2c) Deploy na Vercel

O projeto já inclui `vercel.json` e uma função serverless em `api/index.js`.

Configure estas variáveis no painel da Vercel:

```bash
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/bolao_rl
ADMIN_KEY=troque-esta-chave
API_FOOTBALL_KEY=sua-chave-api-football
CRON_SECRET=uma-string-secreta-aleatoria
```

Opcionalmente defina `PGSSL=disable` apenas se o banco não usar SSL. Em Vercel, o pool usa 1 conexão por instância por padrão.

**Placares automáticos:** o servidor busca resultados da Copa a cada 5 min (cron) e quando alguém abre o app. Com `API_FOOTBALL_KEY` (liga `1`, temporada `2026`) os placares e o ranking atualizam sozinhos — sem precisar lançar manualmente no admin.

---

## 📲 Como a galera participa

1. Mostre o **QR Code** da tela inicial (telão, story, cartaz…).
2. O jovem escaneia, cai no app e toca em **Quero participar**.
3. Preenche o cadastro e já começa a palpitar. ✅

> O QR Code aponta pra `window.location.origin`. Para publicar, defina a URL pública
> em `client/.env` antes do build:
> ```
> VITE_PUBLIC_URL=https://seu-dominio.com
> ```

---

## 🛠️ Painel do organizador

- Acesse **`/admin`** e entre com a chave (padrão: **`rl2026`**).
- **Placares são automáticos** — sincronizados da Copa 2026 a cada 5 min e ao abrir o app/ranking.
- O admin serve para **ajustes manuais** (mata-mata, datas, correções):
  - Definir os **times do mata-mata** conforme as seleções se classificam.
  - Ajustar **datas/horários** ou corrigir um placar pontualmente.
  - **Sincronizar agora** ou **zerar** participantes/resultados.

### ⚠️ Antes de abrir pra valer
O app já vem com **dados de demonstração** (participantes "(DEMO)" e alguns resultados)
só pra você ver o ranking funcionando. Quando for usar de verdade:
1. Entre em `/admin`.
2. Clique em **Zerar participantes** e depois em **Zerar resultados**.

> Para começar **sem** dados de demonstração, rode o servidor com `SEED_DEMO=false`
> na primeira vez (antes de criar o `server/data/db.json`).

---

## 🏅 Regras de pontuação

| Pontos | Acerto |
|:---:|---|
| **10** | Placar exato (cravou!) |
| **7**  | Vencedor + saldo de gols |
| **5**  | Só o resultado (quem venceu / empate) |
| **1**  | Gols de um dos times (errando o resultado) |
| **0**  | Não pontuou |

**Desempate:** mais placares cravados → mais acertos no geral → quem se cadastrou primeiro.

Quer mudar a pontuação ou as seleções/grupos? Edite [`server/data.js`](server/data.js)
(constantes `RULES` e `GROUPS`).

> As seleções e grupos vêm como um **modelo editável** — ajuste pelo painel de admin
> (ou no `data.js`) conforme o chaveamento real da Copa.

---

## 📁 Estrutura

```
bolao-rl/
├── server/        # API Express + pontuação + dados da Copa
│   ├── app.js     # rotas da API Express
│   ├── index.js   # boot local e entrega do app em produção local
│   ├── data.js    # seleções, grupos, jogos e regras (editável)
│   ├── scoring.js # motor de pontuação e ranking
│   └── db.js      # persistência PostgreSQL + seed dos jogos
├── api/           # função serverless da Vercel
│   └── index.js
└── client/        # app React (Vite + Tailwind + Framer Motion)
    └── src/
        ├── pages/      # Home, Cadastro, Entrar, Palpites, Ranking, Regras, Admin
        └── components/ # Layout, cards de jogo, UI
```

Feito com 💚 pra RL São Miguel. Bora cravar! ⚽
