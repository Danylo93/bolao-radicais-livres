import { Link } from 'react-router-dom';
import { ScrollText, Trophy, Target, Clock, Award, Heart, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { PageHeader, Reveal } from '../components/ui';

export default function Regras() {
  const { state } = useStore();
  const { rules, tournament } = state;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={ScrollText} title="Regras do Bolão" subtitle="Simples, justo e pra cima. Bora entender?" />

      {/* Prêmio */}
      <Reveal>
        <div className="mb-6 overflow-hidden rounded-3xl border border-pink-400/20 bg-gradient-to-r from-pink-500/15 to-amber-400/10 p-6 text-center shadow-pink">
          <Trophy className="mx-auto text-amber-300" size={28} />
          <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-wide text-white">Prêmio do grande campeão</h2>
          <p className="mt-1 font-display text-2xl font-extrabold text-gold">{tournament.prize}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-muted">
            <Heart size={13} className="text-pink-400" /> Pode rir, mas é sério. 😎
          </p>
        </div>
      </Reveal>

      {/* Pontuação */}
      <Reveal delay={0.05}>
        <section className="card mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <Target size={20} className="text-emerald-300" /> Como pontuar
          </h2>
          <div className="space-y-3">
            <Rule pts={rules.exact} tone="amber" title="Placar exato">
              Você cravou o resultado idêntico. Ex.: palpitou <b>2×1</b> e o jogo terminou <b>2×1</b>.
            </Rule>
            <Rule pts={rules.resultDiff} tone="emerald" title="Vencedor + saldo de gols">
              Acertou quem venceu e por quantos gols de diferença. Ex.: palpitou <b>2×1</b> e foi <b>3×2</b>.
            </Rule>
            <Rule pts={rules.result} tone="cyan" title="Só o resultado">
              Acertou quem ganhou (ou que foi empate), mas errou o placar. Ex.: palpitou <b>2×0</b> e foi <b>3×1</b>.
            </Rule>
            <Rule pts={rules.oneTeam} tone="slate" title="Gols de um time">
              Errou o resultado, mas cravou os gols de uma das seleções. Ex.: palpitou <b>1×2</b> e foi <b>1×0</b>.
            </Rule>
            <Rule pts={0} tone="zero" title="Não pontuou">
              Não acertou nada do jogo. Faz parte — bola pra frente! ⚽
            </Rule>
          </div>
        </section>
      </Reveal>

      {/* Regras gerais */}
      <Reveal delay={0.1}>
        <section className="card mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <ShieldCheck size={20} className="text-emerald-300" /> Regras gerais
          </h2>
          <ul className="space-y-3 text-body">
            <Item icon={Clock} title="Palpite até o apito inicial">
              Cada jogo fecha pra palpite no horário de início. Depois disso, não dá mais pra mexer naquele jogo.
            </Item>
            <Item icon={Target} title="Palpite em todos os jogos">
              Dá pra palpitar na fase de grupos e no mata-mata. Os jogos do mata-mata abrem assim que as seleções são definidas.
            </Item>
            <Item icon={Award} title="Critério de desempate">
              Em caso de empate em pontos, vence quem tiver <b>mais placares cravados</b>. Persistindo, quem
              tiver mais acertos no geral e, por fim, quem se cadastrou primeiro.
            </Item>
            <Item icon={Trophy} title="Vale tudo (de bom)">
              Um cadastro por pessoa (um telefone). Respeito e fair play com a galera das células. 🙏
            </Item>
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <h3 className="font-display text-2xl font-extrabold">Entendeu? Então bora! ⚽</h3>
          <Link to="/cadastro" className="btn-primary">
            Fazer meu cadastro
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function Rule({ pts, tone, title, children }) {
  const tones = {
    amber: 'from-amber-300 to-orange-400 text-night',
    emerald: 'from-emerald-400 to-cyan-400 text-night',
    cyan: 'from-cyan-400 to-sky-400 text-night',
    slate: 'from-slate-300 to-slate-400 text-night',
    zero: 'from-rose-500/40 to-rose-700/40 text-rose-100',
  };
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-display text-xl font-extrabold ${tones[tone]}`}>
        {pts}
      </div>
      <div>
        <div className="font-semibold text-white">
          {title} <span className="text-muted font-normal">· {pts} {pts === 1 ? 'ponto' : 'pontos'}</span>
        </div>
        <p className="mt-0.5 text-muted">{children}</p>
      </div>
    </div>
  );
}

function Item({ icon: Icon, title, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
        <Icon size={16} />
      </span>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <p className="text-muted">{children}</p>
      </div>
    </li>
  );
}
