import { useMemo } from 'react';
import { Swords, Radio, Trophy } from 'lucide-react';
import { useStore } from '../store';
import { PageHeader } from '../components/ui';
import { fmtDate, matchStatus, hasLiveScore } from '../utils';

export default function Chaveamento() {
  const { state } = useStore();

  // Fases do mata-mata, na ordem (tudo menos a fase de grupos).
  const phases = useMemo(
    () => (state.phaseOrder || []).filter((p) => p !== 'Fase de Grupos'),
    [state.phaseOrder]
  );

  const byPhase = useMemo(() => {
    const map = {};
    for (const p of phases) {
      map[p] = state.matches
        .filter((m) => m.phase === p)
        .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id.localeCompare(b.id));
    }
    return map;
  }, [state.matches, phases]);

  const definidos = state.matches.filter(
    (m) => m.phase !== 'Fase de Grupos' && m.home && m.away
  ).length;
  const totalKo = state.matches.filter((m) => m.phase !== 'Fase de Grupos').length;

  return (
    <div>
      <PageHeader
        icon={Swords}
        title="Chaveamento"
        subtitle="Agora o bicho vai pegar, vamos ver quem será o grande campeão. 🏆"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="chip">
          <Swords size={14} className="text-amber-300" /> {definidos}/{totalKo} confrontos definidos
        </span>
      </div>

      {/* Colunas por fase (rolagem horizontal no desktop, empilhado no mobile) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-4 lg:overflow-x-auto lg:pb-4">
        {phases.map((phase) => (
          <section key={phase} className="lg:min-w-[280px] lg:flex-1">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-white">
              {phase === 'Final' ? (
                <Trophy size={18} className="text-amber-300" />
              ) : (
                <Swords size={16} className="text-amber-300/80" />
              )}
              {phase}
              <span className="text-xs font-normal text-[var(--text-faint)]">
                ({byPhase[phase].length})
              </span>
            </h2>
            <div className="flex flex-col gap-3 lg:h-full lg:justify-around">
              {byPhase[phase].map((m, i) => (
                <BracketMatch key={m.id} match={m} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({ match }) {
  const status = matchStatus(match);
  const live = status === 'locked' && hasLiveScore(match);
  const finished = status === 'finished';
  const showScore = finished || live;

  const hs = match.homeScore;
  const as = match.awayScore;
  const homeWin = finished && hs != null && as != null && hs > as;
  const awayWin = finished && hs != null && as != null && as > hs;
  const isBrazil = match.home?.name === 'Brasil' || match.away?.name === 'Brasil';

  return (
    <div
      className={`card p-3 ${live ? 'border-amber-400/30 shadow-gold' : ''} ${
        finished ? 'border-cyan-400/20' : ''
      } ${isBrazil ? 'ring-2 ring-amber-400 shadow-gold' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-[var(--text-faint)]">
          {isBrazil && <span className="font-bold text-amber-300">🔥</span>}
          {fmtDate(match.date)}
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1 font-semibold text-amber-200">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-rose-400" />
            <Radio size={11} /> AO VIVO
          </span>
        ) : finished ? (
          <span className="font-medium text-cyan-300">Encerrado</span>
        ) : match.home && match.away ? (
          <span className="text-[var(--text-faint)]">Agendado</span>
        ) : (
          <span className="text-[var(--text-faint)]">A definir</span>
        )}
      </div>

      <TeamLine team={match.home} score={showScore ? hs : null} win={homeWin} dim={finished && !homeWin} />
      <div className="my-1 h-px bg-white/5" />
      <TeamLine team={match.away} score={showScore ? as : null} win={awayWin} dim={finished && !awayWin} />
    </div>
  );
}

function TeamLine({ team, score, win, dim }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${dim ? 'opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xl leading-none">{team?.flag || '⚪'}</span>
        <span
          className={`min-w-0 truncate text-sm ${
            team ? 'font-semibold text-white' : 'italic text-[var(--text-faint)]'
          } ${win ? 'text-amber-300' : ''}`}
        >
          {team?.name || 'A definir'}
        </span>
        {win && <Trophy size={12} className="shrink-0 text-amber-300" />}
      </div>
      {score != null && (
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold tabular-nums ${
            win ? 'bg-amber-400/20 text-amber-300' : 'bg-black/40 text-white'
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
