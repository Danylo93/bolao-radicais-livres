import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Target, Trophy, Swords, ScrollText, User, CheckCircle2, XCircle, Info, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store';
import { Background } from './ui';

const NAV = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/palpites', label: 'Palpites', icon: Target },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/chaveamento', label: 'Chave', icon: Swords },
  { to: '/regras', label: 'Regras', icon: ScrollText },
];

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <img src="/rl-logo-white.png" alt="Logo RL" className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </div>
      <div className="leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-white">BOLÃO RL</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
          São Miguel
        </span>
      </div>
    </Link>
  );
}

function Toasts() {
  const { toasts } = useStore();
  const icon = { success: CheckCircle2, error: XCircle, info: Info };
  const color = {
    success: 'text-emerald-300 border-emerald-400/30',
    error: 'text-rose-300 border-rose-400/30',
    info: 'text-cyan-300 border-cyan-400/30',
  };
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icon[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`glass-strong pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl ${color[t.type] || color.info}`}
            >
              <Icon size={18} />
              {t.msg}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
    }
  }, []);

  const toggle = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.currentTime < 11 || audioRef.current.currentTime >= 42) {
        audioRef.current.currentTime = 11;
      }
      audioRef.current.play().catch(() => {
        // Ignora erros
      });
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.currentTime >= 42) {
      audioRef.current.currentTime = 11;
      // Garante que continue tocando caso haja algum engasgo no loop
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="flex items-center">
      <audio ref={audioRef} src="/shakira.mp3" onTimeUpdate={handleTimeUpdate} preload="none" />
      <button
        onClick={toggle}
        className={`group relative grid h-9 w-9 place-items-center rounded-xl transition-all ${
          playing
            ? 'bg-amber-400/20 text-amber-300 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.3)]'
            : 'bg-white/5 text-[var(--text-faint)] hover:bg-white/10 hover:text-white'
        }`}
        title="Música tema"
      >
        {playing ? (
          <>
            <Volume2 size={18} className="animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
          </>
        ) : (
          <VolumeX size={18} />
        )}
      </button>
    </div>
  );
}

export default function Layout({ children }) {
  const { player } = useStore();

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Background />
      <Toasts />

      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-amber-400/20 bg-pitch-card/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-200 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]'
                      : 'text-[var(--text-muted)] hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <BackgroundMusic />
            <div className="h-4 w-px bg-white/10" />
            {player ? (
              <Link to="/palpites" className="chip max-w-[10rem] truncate">
                <User size={14} className="text-emerald-300" />
                <span className="truncate">{player.nome}</span>
              </Link>
            ) : (
              <Link to="/cadastro" className="btn-primary px-4 py-2 text-sm">
                Participar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-400/20 bg-pitch-card/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-amber-300' : 'text-[var(--text-faint)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <n.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' : ''} />
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to={player ? '/palpites' : '/cadastro'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-amber-300' : 'text-[var(--text-faint)]'
              }`
            }
          >
            <User size={20} />
            {player ? 'Perfil' : 'Entrar'}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
