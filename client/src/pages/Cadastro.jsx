import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { UserPlus, User, Users, Flag, Phone, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../api';
import { PageHeader } from '../components/ui';

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Cadastro() {
  const { state, savePlayer, toast } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: '', celula: '', selecao: '', telefone: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: k === 'telefone' ? maskPhone(e.target.value) : e.target.value }));

  const party = () => {
    const opts = { particleCount: 70, spread: 70, startVelocity: 45, ticks: 220 };
    confetti({ ...opts, origin: { x: 0.2, y: 0.6 }, colors: ['#10b981', '#22d3ee', '#fbbf24'] });
    confetti({ ...opts, origin: { x: 0.8, y: 0.6 }, colors: ['#ec4899', '#a855f7', '#fbbf24'] });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast('Informe seu nome.', 'error');
    if (form.telefone.replace(/\D/g, '').length < 10)
      return toast('Telefone inválido. Use DDD + número.', 'error');
    setBusy(true);
    try {
      const { user } = await api.register(form);
      savePlayer(user);
      party();
      toast(`Bem-vindo(a), ${user.nome.split(' ')[0]}! 🎉`);
      setTimeout(() => nav('/palpites'), 700);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader icon={UserPlus} title="Fazer cadastro" subtitle="Preencha pra entrar no Bolão RL." />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-5 p-6 sm:p-8"
      >
        <Field icon={User} label="Nome completo">
          <input
            className="input"
            value={form.nome}
            onChange={set('nome')}
            placeholder="Ex.: João Vitor Santos"
            autoFocus
          />
        </Field>

        <Field icon={Users} label="Célula">
          <input
            className="input"
            value={form.celula}
            onChange={set('celula')}
            placeholder="Ex.: Célula Vencedores"
            list="celulas"
          />
          <datalist id="celulas">
            {state.celulas.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field icon={Flag} label="Seleção do coração">
          <select className="input" value={form.selecao} onChange={set('selecao')}>
            <option value="">Selecione uma seleção…</option>
            {state.teams.map((t) => (
              <option key={t.name} value={t.name}>
                {t.flag} {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Phone} label="Telefone (WhatsApp)">
          <input
            className="input"
            value={form.telefone}
            onChange={set('telefone')}
            placeholder="(11) 99999-9999"
            inputMode="numeric"
          />
        </Field>

        <button type="submit" disabled={busy} className="btn-primary w-full text-base">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          {busy ? 'Cadastrando…' : 'Entrar no bolão'}
        </button>

        <p className="text-center text-muted">
          Já tem cadastro?{' '}
          <Link to="/entrar" className="text-link">
            Acesse aqui
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Icon size={14} className="text-emerald-300" /> {label}
      </label>
      {children}
    </div>
  );
}
