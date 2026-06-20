import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Loader2, Save, LogOut, RotateCcw, Search, Trash2, Users } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../api';
import { PageHeader, Loading } from '../components/ui';
import { fmtDate, matchStatus } from '../utils';

const KEY_STORE = 'bolao_rl_admin_key';

function toLocalInput(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Admin() {
  const { state, refresh, toast } = useStore();
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORE) || '');
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('todas');
  const [query, setQuery] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.adminLogin(key);
      localStorage.setItem(KEY_STORE, key);
      setAuthed(true);
      toast('Bem-vindo, admin! 🛠️');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = async (what) => {
    const msg =
      what === 'participants'
        ? 'Apagar TODOS os participantes e palpites? (use antes de abrir pra valer)'
        : 'Zerar TODOS os resultados dos jogos?';
    if (!window.confirm(msg)) return;
    try {
      await api.adminReset(key, what);
      await refresh();
      toast('Pronto! ✅');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader icon={Shield} title="Área do organizador" subtitle="Acesso restrito." />
        <motion.form
          onSubmit={login}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4 p-6"
        >
          <div>
            <label className="label flex items-center gap-1.5">
              <KeyRound size={14} className="text-emerald-300" /> Chave de admin
            </label>
            <input
              className="input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="••••••"
              autoFocus
            />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
            Entrar
          </button>
        </motion.form>
      </div>
    );
  }

  const matches = state.matches
    .filter((m) => (phase === 'todas' ? true : m.phase === phase))
    .filter((m) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        m.home?.name.toLowerCase().includes(q) ||
        m.away?.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    });

  return (
    <div>
      <PageHeader icon={Shield} title="Painel do organizador" subtitle="Lance resultados e gerencie o bolão." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="chip"><Users size={14} className="text-emerald-300" /> {state.stats.participants} participantes</span>
        <span className="chip">{state.stats.finished}/{state.stats.totalMatches} jogos encerrados</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => reset('results')} className="btn-ghost px-3 py-2 text-xs">
            <RotateCcw size={14} /> Zerar resultados
          </button>
          <button onClick={() => reset('participants')} className="btn-ghost px-3 py-2 text-xs text-rose-300">
            <Trash2 size={14} /> Zerar participantes
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(KEY_STORE);
              setAuthed(false);
            }}
            className="btn-ghost px-3 py-2 text-xs"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
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
            placeholder="Buscar jogo, seleção ou ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <AdminMatchRow key={m.id} match={m} adminKey={key} teams={state.teams} onSaved={refresh} toast={toast} />
        ))}
      </div>
    </div>
  );
}

function AdminMatchRow({ match, adminKey, teams, onSaved, toast }) {
  const isKO = match.phase !== 'Fase de Grupos';
  const [hs, setHs] = useState(match.homeScore ?? '');
  const [as, setAs] = useState(match.awayScore ?? '');
  const [finished, setFinished] = useState(match.finished);
  const [date, setDate] = useState(toLocalInput(match.date));
  const [home, setHome] = useState(match.home?.name || '');
  const [away, setAway] = useState(match.away?.name || '');
  const [busy, setBusy] = useState(false);

  const teamObj = (name) => teams.find((t) => t.name === name) || null;

  const save = async () => {
    setBusy(true);
    try {
      const patch = {
        date: new Date(date).toISOString(),
        homeScore: hs === '' ? null : Number(hs),
        awayScore: as === '' ? null : Number(as),
        finished,
      };
      if (isKO) {
        patch.home = home ? teamObj(home) : null;
        patch.away = away ? teamObj(away) : null;
      }
      await api.adminMatch(adminKey, match.id, patch);
      await onSaved();
      toast(`Jogo ${match.id} salvo. ✅`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const status = matchStatus(match);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span className="chip">{match.group ? `Grupo ${match.group}` : match.phase} · {match.id}</span>
        <span>{fmtDate(match.date)} · {status}</span>
      </div>

      {isKO && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <TeamSelect label="Mandante" value={home} onChange={setHome} teams={teams} />
          <TeamSelect label="Visitante" value={away} onChange={setAway} teams={teams} />
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="truncate text-sm font-semibold">
          {match.home ? `${match.home.flag} ${match.home.name}` : 'A definir'}
        </span>
        <div className="flex items-center gap-1.5">
          <input type="number" min={0} className="h-11 w-12 rounded-xl border border-white/10 bg-white/5 text-center font-bold" value={hs} onChange={(e) => setHs(e.target.value)} />
          <span className="text-slate-500">×</span>
          <input type="number" min={0} className="h-11 w-12 rounded-xl border border-white/10 bg-white/5 text-center font-bold" value={as} onChange={(e) => setAs(e.target.value)} />
        </div>
        <span className="truncate text-right text-sm font-semibold">
          {match.away ? `${match.away.name} ${match.away.flag}` : 'A definir'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="datetime-local"
          className="input max-w-[14rem] py-2 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} className="h-4 w-4 accent-emerald-400" />
          Encerrado
        </label>
        <button onClick={save} disabled={busy} className="btn-primary ml-auto px-4 py-2 text-sm">
          {busy ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Salvar
        </button>
      </div>
    </div>
  );
}

function TeamSelect({ label, value, onChange, teams }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <select className="input py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">A definir</option>
        {teams.map((t) => (
          <option key={t.name} value={t.name}>
            {t.flag} {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
