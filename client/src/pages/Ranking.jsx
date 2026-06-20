import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Search, RefreshCw, Users, Flag, Crown, Medal } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../api';
import { PageHeader, Loading, EmptyState } from '../components/ui';

export default function Ranking() {
  const { state, player } = useStore();
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celula, setCelula] = useState('todas');
  const [selecao, setSelecao] = useState('todas');
  const [query, setQuery] = useState('');

  const flagFor = (name) => state.teams.find((t) => t.name === name)?.flag || '';

  const load = () => {
    setLoading(true);
    api
      .ranking()
      .then(({ ranking }) => setRanking(ranking))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!ranking) return [];
    return ranking.filter((r) => {
      if (celula !== 'todas' && r.celula !== celula) return false;
      if (selecao !== 'todas' && r.selecao !== selecao) return false;
      if (query.trim() && !r.nome.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [ranking, celula, selecao, query]);

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div>
      <PageHeader icon={Trophy} title="Ranking geral" subtitle="Quem tá voando rumo ao prêmio? 🏆" />

      {/* Filtros */}
      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-3">
        <Select icon={Users} value={celula} onChange={setCelula}>
          <option value="todas">Todas as células</option>
          {state.celulas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select icon={Flag} value={selecao} onChange={setSelecao}>
          <option value="todas">Todas as seleções</option>
          {state.teams.map((t) => (
            <option key={t.name} value={t.name}>
              {t.flag} {t.name}
            </option>
          ))}
        </Select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            className="input pl-9"
            placeholder="Buscar nome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-muted">
          {filtered.length} participante{filtered.length === 1 ? '' : 's'}
        </span>
        <button onClick={load} className="btn-ghost px-3 py-2 text-xs">
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {loading ? (
        <Loading label="Montando o ranking…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Trophy} title="Ninguém por aqui ainda">
          <p>Seja o primeiro a pontuar — ou ajuste os filtros.</p>
        </EmptyState>
      ) : (
        <>
          {podium.length > 0 && <Podium podium={podium} flagFor={flagFor} playerId={player?.id} />}

          <div className="space-y-2">
            {rest.map((r, i) => (
              <Row key={r.id} r={r} flag={flagFor(r.selecao)} me={r.id === player?.id} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Select({ icon: Icon, value, onChange, children }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
      <select className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

const PODIUM_STYLE = [
  { grad: 'from-amber-300 to-yellow-500', ring: 'ring-amber-300/50', h: 'h-28', icon: Crown, order: 'order-2' },
  { grad: 'from-slate-200 to-slate-400', ring: 'ring-slate-200/40', h: 'h-20', icon: Medal, order: 'order-1' },
  { grad: 'from-orange-400 to-amber-600', ring: 'ring-orange-400/40', h: 'h-16', icon: Medal, order: 'order-3' },
];

function Podium({ podium, flagFor, playerId }) {
  return (
    <div className="mb-8 grid grid-cols-3 items-end gap-3">
      {podium.map((r, i) => {
        const s = PODIUM_STYLE[i];
        const Icon = s.icon;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
            className={`flex flex-col items-center ${s.order}`}
          >
            <div className={`relative mb-2 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${s.grad} text-night shadow-lg ring-4 ${s.ring}`}>
              <span className="font-display text-2xl font-extrabold">{i + 1}</span>
              <Icon size={18} className="absolute -top-2 -right-1 text-white drop-shadow" />
            </div>
            <div className="max-w-full truncate text-center text-sm font-bold">
              {r.id === playerId ? 'Você' : r.nome.replace('(DEMO) ', '')}
            </div>
            <div className="mb-2 text-faint">
              {flagFor(r.selecao)} {r.points} pts
            </div>
            <div className={`w-full rounded-t-2xl bg-gradient-to-t ${s.grad} ${s.h} opacity-80`} />
          </motion.div>
        );
      })}
    </div>
  );
}

function Row({ r, flag, me, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3) }}
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        me ? 'border-amber-400/40 bg-amber-400/10 shadow-gold' : 'border-white/10 bg-black/35'
      }`}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/40 font-display text-sm font-bold tabular-nums text-[var(--text-secondary)]">
        {r.pos}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate font-semibold">
          <span className="truncate">{me ? 'Você' : r.nome.replace('(DEMO) ', '')}</span>
          {me && <span className="chip border-amber-400/35 bg-amber-400/15 px-2 py-0 text-[10px] text-amber-100">eu</span>}
        </div>
        <div className="truncate text-faint">
          {flag} {r.celula || 'sem célula'}
        </div>
      </div>
      <div className="text-right">
        <div className="font-display text-lg font-extrabold tabular-nums text-amber-200">
          {r.points}
        </div>
        <div className="text-faint">{r.exacts} cravadas</div>
      </div>
    </motion.div>
  );
}
