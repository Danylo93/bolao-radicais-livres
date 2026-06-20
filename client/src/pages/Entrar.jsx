import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Phone, Loader2, LogOut } from 'lucide-react';
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

export default function Entrar() {
  const { savePlayer, toast, player, logout } = useStore();
  const nav = useNavigate();
  const [tel, setTel] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user } = await api.login(tel);
      savePlayer(user);
      toast(`Olá de novo, ${user.nome.split(' ')[0]}! 👋`);
      nav('/palpites');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader icon={LogIn} title="Já participo" subtitle="Acesse com o telefone do seu cadastro." />

      {player && (
        <div className="card mb-4 flex items-center justify-between p-4">
          <span className="text-body">
            Logado como <b className="text-white">{player.nome}</b>
          </span>
          <button
            onClick={() => {
              logout();
              toast('Você saiu da conta.', 'info');
            }}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      )}

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-5 p-6 sm:p-8"
      >
        <div>
          <label className="label flex items-center gap-1.5">
            <Phone size={14} className="text-emerald-300" /> Telefone do cadastro
          </label>
          <input
            className="input"
            value={tel}
            onChange={(e) => setTel(maskPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            inputMode="numeric"
            autoFocus
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full text-base">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
          {busy ? 'Entrando…' : 'Acessar meus palpites'}
        </button>
        <p className="text-center text-muted">
          Ainda não tem cadastro?{' '}
          <Link to="/cadastro" className="text-link">
            Cadastre-se
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
