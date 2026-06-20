import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Save, Loader2, Search, Sparkles, LogOut, Trophy } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../api';
import { PageHeader, Loading, EmptyState } from '../components/ui';
import { MatchCard } from '../components/match';
import { pointsFor, matchStatus } from '../utils';

const STATUS_TABS = [
  { key: 'abertos', label: 'Abertos' },
  { key: 'encerrados', label: 'Encerrados' },
  { key: 'todos', label: 'Todos' },
];

function openSig(bets, matches) {
  const open = matches.filter((m) => matchStatus(m) === 'open').map((m) => m.id);
  return JSON.stringify(open.map((id) => [id, bets[id]?.home ?? '', bets[id]?.away ?? '']));
}

export default function Palpites() {
  const { state, player, refresh, toast, logout } = useStore();
  const rules = state.rules;
  const [bets, setBets] = useState({});
  const [initial, setInitial] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState('abertos');
  const [phase, setPhase] = useState('todas');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!player) return;
    setLoaded(false);
    api
      .user(player.id)
      .then(({ bets }) => {
        setBets(bets || {});
        setInitial(openSig(bets || {}, state.matches));
      })
      .catch(() => toast('Não consegui carregar seus palpites.', 'error'))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

  const myPoints = useMemo(() => {
    let pts = 0;
    let cravadas = 0;
    for (const m of state.matches) {
      if (!m.finished) continue;
      const p = pointsFor(bets[m.id], m, rules);
      pts += p;
      if (p === rules.exact) cravadas += 1;
    }
    return { pts, cravadas };
  }, [bets, state.matches, rules]);

  const openMatches = state.matches.filter((m) => matchStatus(m) === 'open');
  const filledOpen = openMatches.filter(
    (m) => bets[m.id]?.home !== '' && bets[m.id]?.home != null && bets[m.id]?.away !== '' && bets[m.id]?.away != null
  ).length;

  const filtered = useMemo(() => {
    let list = [...state.matches];
    if (status === 'abertos') list = list.filter((m) => matchStatus(m) === 'open');
    else if (status === 'encerrados') list = list.filter((m) => m.finished);
    if (phase !== 'todas') list = list.filter((m) => m.phase === phase);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.home?.name.toLowerCase().includes(q) ||
          m.away?.name.toLowerCase().includes(q) ||
          (m.group && `grupo ${m.group}`.includes(q))
      );
    }
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [state.matches, status, phase, query]);

  const dirty = loaded && initial !== openSig(bets, state.matches);

  const save = async () => {
    setBusy(true);
    try {
      const payload = {};
      for (const m of openMatches) {
        const b = bets[m.id];
        payload[m.id] =
          b && b.home !== '' && b.home != null && b.away !== '' && b.away != null
            ? { home: b.home, away: b.away }
            : null;
      }
      const r = await api.saveBets(player.id, payload);
      await refresh();
      setInitial(openSig(bets, state.matches));
      toast(`Palpites salvos! (${r.saved} jogos) ✅`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!player) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader icon={Target} title="Meus palpites" />
        <EmptyState icon={Sparkles} title="Entre pra dar seus palpites">
          <p className="mb-4">Cadastre-se ou acesse com seu telefone pra começar a cravar placares.</p>
          <div className="flex justify-center gap-3">
            <Link to="/cadastro" className="btn-primary">
              Quero participar
            </Link>
            <Link to="/entrar" className="btn-ghost">
              Já participo
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={Target} title="Meus palpites" subtitle={`${player.nome} • ${player.celula || 'sem célula'}`} />

      {/* Resumo do jogador */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard icon={Trophy} label="Meus pontos" value={myPoints.pts} tone="amber" />
        <SummaryCard icon={Sparkles} label="Cravadas" value={myPoints.cravadas} tone="emerald" />
        <SummaryCard icon={Target} label="Palpites feitos" value={`${filledOpen}/${openMatches.length}`} tone="cyan" />
      </div>

      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => {
            logout();
            toast('Você saiu da conta.', 'info');
          }}
          className="btn-ghost px-3 py-2 text-xs"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6 space-y-3 p-4">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/5 p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`rounded-xl py-2 text-sm font-semibold transition ${
                status === t.key ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-night' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select className="input sm:max-w-[14rem]" value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="todas">Todas as fases</option>
            {state.phaseOrder.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Buscar seleção ou grupo…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!loaded ? (
        <Loading label="Carregando seus palpites…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum jogo por aqui">
          <p>Tente mudar os filtros acima.</p>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m, i) => (
            <MatchCard
              key={m.id}
              match={m}
              rules={rules}
              index={i}
              bet={bets[m.id]}
              onChange={(val) => setBets((b) => ({ ...b, [m.id]: val }))}
            />
          ))}
        </div>
      )}

      {/* Barra de salvar */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6"
          >
            <div className="glass-strong flex items-center gap-3 rounded-2xl border-emerald-400/30 px-4 py-3 shadow-glow">
              <span className="text-sm text-slate-200">Você tem alterações não salvas</span>
              <button onClick={save} disabled={busy} className="btn-primary px-4 py-2 text-sm">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {busy ? 'Salvando…' : 'Salvar palpites'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const tones = { amber: 'text-amber-300', emerald: 'text-emerald-300', cyan: 'text-cyan-300' };
  return (
    <div className="card p-4 text-center">
      <Icon className={`mx-auto ${tones[tone]}`} size={20} />
      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
