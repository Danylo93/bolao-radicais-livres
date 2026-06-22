import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Target,
  Trophy,
  Copy,
  Check,
  Share2,
  Sparkles,
  CalendarClock,
  Users,
  ListChecks,
  ArrowRight,
  Heart,
  Clock,
} from 'lucide-react';
import { useStore } from '../store';
import { Reveal, Counter } from '../components/ui';
import { TeamBadge } from '../components/match';
import { fmtDate } from '../utils';

const BASE_URL = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
// O QR Code e o link de divulgação levam direto para a tela de cadastro.
const SHARE_URL = `${BASE_URL}/cadastro`;

const ACT_DESC = {
  culto: 'Presença no culto de jovens',
  culto_domingo: 'Presença no culto de domingo',
  celula: 'Presença na sua célula',
  visitante: 'A cada amigo que você trouxer',
};

export default function Home() {
  const { state, player } = useStore();
  const { tournament, rules, stats, activities } = state;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bolão RL — Copa São Miguel 2026',
          text: 'Bora palpitar na Copa? Entra no Bolão RL! ⚽',
          url: SHARE_URL,
        });
      } catch {
        /* cancelado */
      }
    } else {
      copy();
    }
  };

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative grid items-center gap-10 pt-2 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chip mb-5 border-amber-400/35 bg-amber-400/10 text-amber-100"
          >
            <Sparkles size={14} /> {tournament.subtitle}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl"
          >
            <span className="text-gradient">BOLÃO RL</span>
            <span className="mt-1 block text-copa text-4xl font-extrabold sm:text-6xl">São Miguel</span>
            <span className="mt-3 block text-xl font-semibold text-[var(--text-secondary)] text-shadow-sm sm:text-2xl">
              Palpite. Cravar. Brilhar. 🏆
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-md text-body"
          >
            O bolão dos jovens da <b className="text-white">RL São Miguel</b> pra Copa 2026. Dê seus
            palpites em todos os jogos, dispute com a galera e fature o prêmio mais cobiçado do ano. 😏
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <Link to={player ? '/palpites' : '/cadastro'} className="btn-primary text-base">
              {player ? 'Meus palpites' : 'Quero participar'} <ArrowRight size={18} />
            </Link>
            <Link to="/ranking" className="btn-ghost text-base">
              <Trophy size={18} className="text-amber-300" /> Ver ranking
            </Link>
            {!player && (
              <Link to="/entrar" className="btn-ghost text-base">
                Já participo
              </Link>
            )}
          </motion.div>
        </div>

        {/* QR CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
          className="card relative mx-auto w-full max-w-sm overflow-hidden border-amber-400/20 p-6 text-center shadow-gold"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl" />
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-amber-200">
            <QrCode size={16} /> Escaneie e participe
          </div>
          <div className="mx-auto w-fit rounded-3xl bg-white p-4 shadow-xl ring-2 ring-amber-400/30">
            <QRCodeSVG value={SHARE_URL} size={184} bgColor="#ffffff" fgColor="#041208" level="M" />
          </div>
          <p className="mt-4 break-all text-faint">{SHARE_URL}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={copy} className="btn-ghost flex-1 py-2.5 text-sm">
              {copied ? <Check size={16} className="text-amber-300" /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button onClick={share} className="btn-primary flex-1 py-2.5 text-sm">
              <Share2 size={16} /> Compartilhar
            </button>
          </div>
        </motion.div>
      </section>

      {/* PRÊMIOS */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-600/10 p-6 shadow-gold sm:p-8">
          <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.15),transparent_60%)]" />
          <span className="chip mx-auto mb-5 flex w-fit border-amber-400/35 bg-amber-400/10 text-amber-100">
            <Trophy size={14} /> Premiação
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {(tournament.prizes || []).map((p, i) => (
              <div key={p.place} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <div className="text-3xl">{['🥇', '🥈', '🥉'][i] || '🏅'}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-200/80">
                  {p.place}
                </div>
                <div className="mt-1 font-display font-bold leading-tight text-white">{p.prize}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} value={stats.participants} label="Participantes" tone="emerald" />
        <StatCard icon={ListChecks} value={stats.totalMatches} label="Jogos da Copa" tone="cyan" />
        <StatCard icon={Trophy} value={stats.finished} label="Jogos encerrados" tone="amber" />
        <NextMatchCard next={stats.nextMatch} />
      </section>

      {/* COMO FUNCIONA */}
      <section>
        <Reveal>
          <h2 className="mb-6 text-center font-display text-3xl font-extrabold uppercase tracking-wide text-white text-shadow-sm">
            Como <span className="text-gradient">funciona</span>
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: QrCode,
              title: '1. Escaneie & cadastre',
              text: 'Aponte a câmera no QR Code e preencha nome, célula, seleção do coração e telefone.',
            },
            {
              icon: Target,
              title: '2. Dê seus palpites',
              text: 'Cravou o placar de cada jogo da Copa antes do apito inicial. Dá pra editar até começar.',
            },
            {
              icon: Trophy,
              title: '3. Suba no ranking',
              text: 'Cada acerto vira ponto. Acompanhe o ranking ao vivo e mire no topo (e no prêmio).',
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="card h-full p-6">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/30 to-cyan-400/20 text-emerald-300">
                  <s.icon size={24} />
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">{s.title}</h3>
                <p className="mt-1.5 text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PONTUAÇÃO */}
      <section>
        <Reveal>
          <h2 className="mb-2 text-center font-display text-3xl font-extrabold uppercase tracking-wide text-white text-shadow-sm">
            Como <span className="text-gradient">pontuar</span>
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-center text-body">
            Você soma pontos <b className="text-white">nos jogos</b> e também sendo <b className="text-amber-200">fiel nos cultos e na célula</b>. Tudo entra no ranking! 🏆
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Jogos */}
          <Reveal>
            <div className="card h-full p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide text-white">
                ⚽ Nos jogos
              </h3>
              <div className="space-y-3">
                <ScoreRow pts={rules.exact} title="Placar exato" desc="Cravou o resultado certinho" tone="amber" />
                <ScoreRow pts={rules.resultDiff} title="Vencedor + saldo" desc="Acertou quem ganhou e por quantos" tone="emerald" />
                <ScoreRow pts={rules.result} title="Só o resultado" desc="Acertou quem venceu, mas errou o saldo" tone="cyan" />
                <ScoreRow pts={rules.oneTeam} title="Gols de um time" desc="Cravou os gols de uma seleção" tone="slate" />
              </div>
            </div>
          </Reveal>

          {/* Presença */}
          <Reveal delay={0.08}>
            <div className="card h-full border-amber-400/25 p-6 shadow-gold">
              <h3 className="mb-1 flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide text-white">
                🙌 Na presença
              </h3>
              <p className="mb-4 text-sm text-amber-200/90">
                Ser fiel na casa de Deus vale ponto — lançado pela liderança.
              </p>
              <div className="space-y-3">
                {(activities || []).map((a) => (
                  <ScoreRow
                    key={a.kind}
                    pts={a.points}
                    title={a.label}
                    desc={ACT_DESC[a.kind] || 'Pontos de presença'}
                    tone="amber"
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Destaque: regras rápidas */}
        <Reveal delay={0.12}>
          <div className="card mt-4 grid gap-3 border-amber-400/20 p-5 sm:grid-cols-3">
            <Quick icon={Clock} title="Palpite até o apito">
              Cada jogo fecha no horário de início.
            </Quick>
            <Quick icon={Users} title="Traga visitantes">
              Cada amigo vale ponto — e uma vida pra Jesus. ✝️
            </Quick>
            <Quick icon={Trophy} title="Desempate">
              Vence quem tiver mais placares cravados.
            </Quick>
          </div>
        </Reveal>

        <div className="mt-4 text-center">
          <Link to="/regras" className="btn-ghost text-sm">
            Ver regras completas →
          </Link>
        </div>
      </section>

      {/* CTA FINAL */}
      <Reveal>
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:p-10">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white text-shadow-sm sm:text-4xl">
            Bora pro jogo? <span className="text-gradient">Cadastre-se agora</span>
          </h2>
          <p className="max-w-md text-muted">
            Leva menos de 1 minuto. Chama a galera da sua célula e venham com tudo pra cima do topo do
            ranking!
          </p>
          <Link to={player ? '/palpites' : '/cadastro'} className="btn-primary text-base">
            {player ? 'Ir para meus palpites' : 'Participar do Bolão RL'} <ArrowRight size={18} />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, tone }) {
  const tones = {
    emerald: 'text-emerald-300',
    cyan: 'text-cyan-300',
    amber: 'text-amber-300',
  };
  return (
    <Reveal>
      <div className="card h-full p-5">
        <Icon className={tones[tone]} size={22} />
        <div className="mt-3 font-display text-3xl font-extrabold tabular-nums">
          <Counter value={value} />
        </div>
        <div className="text-muted">{label}</div>
      </div>
    </Reveal>
  );
}

function NextMatchCard({ next }) {
  return (
    <Reveal>
      <div className="card h-full p-5">
        <div className="flex items-center gap-1.5 text-fuchsia-300">
          <CalendarClock size={20} />
          <span className="text-sm font-semibold">Próximo jogo</span>
        </div>
        {next ? (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-1 text-sm font-semibold">
              <span className="truncate">
                {next.home?.flag} {next.home?.name}
              </span>
              <span className="text-[var(--text-faint)]">×</span>
              <span className="truncate text-right">
                {next.away?.name} {next.away?.flag}
              </span>
            </div>
            <div className="mt-1 text-faint">{fmtDate(next.date)}</div>
          </div>
        ) : (
          <p className="mt-3 text-muted">A definir em breve.</p>
        )}
      </div>
    </Reveal>
  );
}

function Quick({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
        <Icon size={18} />
      </span>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <p className="text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}

function ScoreRow({ pts, title, desc, tone }) {
  const tones = {
    amber: 'from-amber-300 to-orange-400 text-night',
    emerald: 'from-emerald-400 to-cyan-400 text-night',
    cyan: 'from-cyan-400 to-sky-400 text-night',
    slate: 'from-slate-300 to-slate-400 text-night',
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-display text-xl font-extrabold ${tones[tone]}`}
      >
        {pts}
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-muted">{desc}</div>
      </div>
    </div>
  );
}
