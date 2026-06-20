import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { useStore } from './store';
import { Loading } from './components/ui';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Entrar from './pages/Entrar';
import Palpites from './pages/Palpites';
import Ranking from './pages/Ranking';
import Regras from './pages/Regras';
import Admin from './pages/Admin';

export default function App() {
  const { loading, state } = useStore();

  return (
    <Layout>
      {loading ? (
        <Loading label="Preparando o gramado…" />
      ) : !state ? (
        <div className="card mx-auto max-w-md p-8 text-center">
          <p className="mb-2 text-lg font-semibold">Ops! Não consegui falar com o servidor.</p>
          <p className="text-slate-400">
            Confira se o servidor está rodando e recarregue a página.
          </p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/palpites" element={<Palpites />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/regras" element={<Regras />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      )}
    </Layout>
  );
}
