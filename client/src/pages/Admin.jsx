import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, KeyRound, Loader2, Save, LogOut, RotateCcw, Search, Trash2, Users,
  RefreshCw, CalendarDays, Mail, AlertTriangle,
} from 'lucide-react';
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
  const [view, setView] = useState('jogos');
  const [phase, setPhase] = useState('todas');
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const [users, setUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userQuery, setUserQuery] = useState('');

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

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { users } = await api.adminUsers(key);
      setUsers(users);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [key, toast]);

  useEffect(() => {
    if (authed && view === 'participantes' && users === null) loadUsers();
  }, [authed, view, users, loadUsers]);

  const reset = async (what) => {
    const msg =
      what === 'participants'
        ? 'Apagar TODOS os participantes e palpites? (use antes de abrir pra valer)'
        : 'Zerar TODOS os resultados dos jogos?';
    if (!window.confirm(msg)) return;
    try {
      await api.adminReset(key, what);
      await refresh();
      setUsers(null);
      toast('Pronto! ✅');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const r = await api.adminSync(key);
      await refresh();
      toast(`Placares sincronizados (${r.source}, ${r.updated} atualizado(s)) ✅`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSyncing(false);
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

  const filteredUsers = (users || []).filter((u) => {
    if (!userQuery.trim()) return true;
    const q = userQuery.toLowerCase();
    return (
      u.nome.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.celula || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        icon={Shield}
        title="Painel do organizador"
        subtitle="Gerencie jogos e participantes do Bolão RL."
      />

      <div className="card mb-5 flex flex-wrap items-center gap-3 border-amber-400/20 p-4">
        <span className="chip"><Users size={14} className="text-amber-300" /> {state.stats.participants} participantes</span>
        <span className="chip">{state.stats.finished}/{state.stats.totalMatches} jogos encerrados</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={runSync} disabled={syncing} className="btn-ghost px-3 py-2 text-xs">
            {syncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            Sincronizar agora
          </button>
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

      {/* Alternância Jogos / Participantes / Notificações */}
      <div className="mb-6 grid max-w-md grid-cols-3 gap-1 rounded-2xl bg-white/5 p-1">
        {[
          { k: 'jogos', label: 'Jogos', icon: CalendarDays },
          { k: 'participantes', label: 'Participantes', icon: Users },
          { k: 'push', label: 'Notificar', icon: Mail },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setView(t.k)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition ${
              view === t.k ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-night' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {view === 'jogos' ? (
        <>
          <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
            <select className="input sm:max-w-[14rem]" value={phase} onChange={(e) => setPhase(e.target.value)}>
              <option value="todas">Todas as fases</option>
              {state.phaseOrder.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
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
        </>
      ) : view === 'participantes' ? (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
              <input
                className="input pl-9"
                placeholder="Buscar por nome, e-mail ou célula…"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <button onClick={loadUsers} className="btn-ghost px-3 py-2 text-xs">
              <RefreshCw size={14} /> Atualizar
            </button>
          </div>

          {loadingUsers || users === null ? (
            <Loading label="Carregando participantes…" />
          ) : filteredUsers.length === 0 ? (
            <div className="card p-8 text-center text-muted">Nenhum participante encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <AdminUserRow
                  key={u.id}
                  user={u}
                  adminKey={key}
                  teams={state.teams}
                  activities={state.activities}
                  totalMatches={state.matches.filter((m) => !!m.home && !!m.away).length}
                  onChanged={async () => { await loadUsers(); await refresh(); }}
                  toast={toast}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <AdminPushTab adminKey={key} toast={toast} />
      )}
    </div>
  );
}

function AdminPushTab({ adminKey, toast }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!msg.trim()) return toast('Escreva uma mensagem!', 'error');
    if (!confirm('Deseja enviar esta notificação para todos os inscritos?')) return;
    
    setBusy(true);
    try {
      const res = await api.adminSendPush(adminKey, msg);
      toast(`Push enviado para ${res.sent} de ${res.total} usuários! ✅`, 'success');
      setMsg('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card max-w-lg p-6">
      <h3 className="mb-2 text-lg font-bold text-amber-400">Notificações Web Push</h3>
      <p className="mb-4 text-sm text-muted">
        Envie uma notificação para todos os usuários que permitiram receber alertas no navegador ou celular.
      </p>
      
      <textarea
        className="input mb-4 min-h-[100px] resize-y"
        placeholder="Ex: Os palpites do Mata-mata estão abertos!"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      
      <button onClick={send} disabled={busy || !msg.trim()} className="btn-primary w-full">
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
        {busy ? 'Enviando...' : 'Disparar Notificação'}
      </button>
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
      <div className="mb-3 flex items-center justify-between text-faint">
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
          <span className="text-[var(--text-faint)]">×</span>
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
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
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

function AdminUserRow({ user, adminKey, teams, activities, totalMatches, onChanged, toast }) {
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email || '');
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [celula, setCelula] = useState(user.celula || '');
  const [selecao, setSelecao] = useState(user.selecao || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.adminUpdateUser(adminKey, user.id, { nome, email, telefone, celula, selecao });
      await onChanged();
      toast(`${nome.split(' ')[0]} atualizado ✅`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remover ${user.nome}? Os palpites dele também serão apagados.`)) return;
    setBusy(true);
    try {
      await api.adminDeleteUser(adminKey, user.id);
      await onChanged();
      toast('Participante removido.', 'info');
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  };

  const labelByKind = Object.fromEntries((activities || []).map((a) => [a.kind, a.label]));

  const addAct = async (kind) => {
    setBusy(true);
    try {
      await api.adminAddActivity(adminKey, user.id, kind);
      await onChanged();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const removeAct = async (id) => {
    setBusy(true);
    try {
      await api.adminDeleteActivity(adminKey, id);
      await onChanged();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const betsCount = user.betsCount || 0;
  let statusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  let statusText = 'Sem palpites';
  if (betsCount > 0 && betsCount < totalMatches) {
    statusColor = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    statusText = `${betsCount}/${totalMatches} palpites`;
  } else if (betsCount > 0 && betsCount >= totalMatches) {
    statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    statusText = 'Palpites completos';
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-faint">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">#{user.id}</span>
          <span className={`chip border ${statusColor}`}>{statusText}</span>
        </div>
        {!user.telefone && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-300">
            <AlertTriangle size={13} /> sem telefone — não consegue logar
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-faint">Nome</span>
          <input className="input py-2 text-sm" value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-faint"><Mail size={12} /> E-mail (opcional)</span>
          <input className="input py-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-faint">Telefone</span>
          <input className="input py-2 text-sm" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
        </label>
        <label className="block">
          <span className="mb-1 block text-faint">Célula</span>
          <input className="input py-2 text-sm" value={celula} onChange={(e) => setCelula(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-faint">Seleção do coração</span>
          <select className="input py-2 text-sm" value={selecao} onChange={(e) => setSelecao(e.target.value)}>
            <option value="">—</option>
            {teams.map((t) => (
              <option key={t.name} value={t.name}>{t.flag} {t.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Presença — pontos manuais */}
      <div className="mt-3 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-faint">Presença (pontos manuais)</span>
          <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-200">+{user.bonus || 0} pts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(activities || []).map((a) => (
            <button
              key={a.kind}
              onClick={() => addAct(a.kind)}
              disabled={busy}
              className="btn-ghost px-2.5 py-1.5 text-xs"
            >
              + {a.label} ({a.points})
            </button>
          ))}
        </div>
        {user.activities && user.activities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.activities.map((act) => (
              <span
                key={act.id}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]"
              >
                {labelByKind[act.kind] || act.kind} +{act.points}
                <button
                  onClick={() => removeAct(act.id)}
                  disabled={busy}
                  className="text-rose-300 hover:text-rose-200"
                  title="Remover lançamento"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={remove} disabled={busy} className="btn-ghost px-3 py-2 text-xs text-rose-300">
          <Trash2 size={14} /> Remover
        </button>
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
      <span className="mb-1 block text-faint">{label}</span>
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
