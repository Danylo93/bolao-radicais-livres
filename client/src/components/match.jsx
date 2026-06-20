import { motion } from 'framer-motion';
import { Lock, Clock, CheckCircle2, HelpCircle } from 'lucide-react';
import { classify, fmtDate, matchStatus } from '../utils';

export function TeamBadge({ team, reverse = false }) {
  const flag = team?.flag || '🏳️';
  const name = team?.name || 'A definir';
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        reverse ? 'flex-row-reverse text-right' : 'text-left'
      }`}
    >
      <span className="text-3xl leading-none drop-shadow sm:text-4xl">{flag}</span>
      <span className="min-w-0 truncate text-sm font-semibold leading-tight sm:text-base">
        {name}
      </span>
    </div>
  );
}

function ScoreBox({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={30}
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="-"
      className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold tabular-nums outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70 sm:h-14 sm:w-14"
    />
  );
}

const TONE = {
  exact: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  great: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  good: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  meh: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  zero: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function StatusBadge({ status }) {
  const map = {
    open: { icon: Clock, text: 'Aberto p/ palpite', cls: 'text-emerald-300' },
    locked: { icon: Lock, text: 'Em andamento', cls: 'text-amber-300' },
    finished: { icon: CheckCircle2, text: 'Encerrado', cls: 'text-cyan-300' },
    tbd: { icon: HelpCircle, text: 'A definir', cls: 'text-slate-400' },
  };
  const { icon: Icon, text, cls } = map[status] || map.tbd;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon size={13} /> {text}
    </span>
  );
}

export function MatchCard({ match, bet, onChange, rules, index = 0 }) {
  const status = matchStatus(match);
  const editable = status === 'open';
  const finished = status === 'finished';
  const result = finished ? classify(bet, match, rules) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className={`card p-4 transition-shadow ${editable ? 'hover:shadow-glow' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="chip text-xs">
          {match.group ? `Grupo ${match.group}` : match.phase}
          {match.group && <span className="text-slate-400">· {match.round}</span>}
        </span>
        <span className="text-xs text-slate-400">{fmtDate(match.date)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamBadge team={match.home} />
        <div className="flex items-center gap-1.5">
          {finished ? (
            <ResultScore home={match.homeScore} away={match.awayScore} bet={bet} />
          ) : (
            <>
              <ScoreBox
                value={bet?.home}
                disabled={!editable}
                onChange={(v) => onChange({ home: v, away: bet?.away ?? '' })}
              />
              <span className="text-lg font-bold text-slate-500">×</span>
              <ScoreBox
                value={bet?.away}
                disabled={!editable}
                onChange={(v) => onChange({ home: bet?.home ?? '', away: v })}
              />
            </>
          )}
        </div>
        <TeamBadge team={match.away} reverse />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={status} />
        {finished ? (
          <span className={`chip border text-xs ${TONE[result.tone]}`}>
            {bet ? `Você: ${bet.home}×${bet.away}` : 'Sem palpite'} · {result.label}{' '}
            <b className="ml-1">+{result.pts}</b>
          </span>
        ) : status === 'locked' ? (
          <span className="text-xs text-slate-400">Palpites encerrados</span>
        ) : status === 'open' ? (
          <span className="text-xs text-emerald-300/80">Bom palpite! 🍀</span>
        ) : (
          <span className="text-xs text-slate-500">Aguardando classificação</span>
        )}
      </div>
    </motion.div>
  );
}

function ResultScore({ home, away, bet }) {
  const hit = bet && Number(bet.home) === home && Number(bet.away) === away;
  return (
    <div className="flex items-center gap-1.5">
      <ScoreResult n={home} hit={hit} />
      <span className="text-lg font-bold text-slate-500">×</span>
      <ScoreResult n={away} hit={hit} />
    </div>
  );
}

function ScoreResult({ n, hit }) {
  return (
    <div
      className={`grid h-12 w-12 place-items-center rounded-xl border text-xl font-extrabold tabular-nums sm:h-14 sm:w-14 ${
        hit
          ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
          : 'border-white/10 bg-white/[0.07] text-slate-100'
      }`}
    >
      {n}
    </div>
  );
}
