import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Gramado */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/pitch-bg.png)' }}
      />

      {/* Overlay escuro + vinheta verde — legibilidade sobre o gramado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#041208]/92 via-[#062010]/78 to-[#041208]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020a06_78%)]" />

      {/* Faixas douradas estilo Copa */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Marcações de campo (linhas brancas sutis) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.35" />
        <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="0.8" fill="white" />
        <rect x="2" y="28" width="16" height="44" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="82" y="28" width="16" height="44" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="2" y="38" width="6" height="24" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="92" y="38" width="6" height="24" fill="none" stroke="white" strokeWidth="0.3" />
      </svg>

      {/* Brilho dourado suave no topo */}
      <div className="absolute -left-20 -top-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -right-16 top-1/4 h-64 w-64 rounded-full bg-emerald-400/8 blur-3xl" />
    </div>
  );
}

export function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ value = 0, duration = 1200 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const to = Number(value) || 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{n.toLocaleString('pt-BR')}</span>;
}

export function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="mb-2 flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/25 to-emerald-400/15 text-amber-200 shadow-gold">
            <Icon size={22} />
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
      </div>
      {subtitle && <p className="text-emerald-100/60">{subtitle}</p>}
    </motion.div>
  );
}

export function Loading({ label = 'Carregando…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-emerald-100/60">
      <Loader2 className="animate-spin text-amber-300" size={32} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center text-emerald-100/60">
      {Icon && <Icon size={36} className="text-amber-300/50" />}
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}
