import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-[34rem] w-[34rem] animate-blob rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-1/3 h-[30rem] w-[30rem] animate-blob rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:4s]" />
      <div className="absolute bottom-[-4rem] left-1/4 h-[28rem] w-[28rem] animate-blob rounded-full bg-cyan-500/20 blur-3xl [animation-delay:8s]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
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
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/30 to-cyan-400/20 text-emerald-300">
            <Icon size={22} />
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      </div>
      {subtitle && <p className="text-slate-400">{subtitle}</p>}
    </motion.div>
  );
}

export function Loading({ label = 'Carregando…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="animate-spin text-emerald-400" size={32} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center text-slate-400">
      {Icon && <Icon size={36} className="text-slate-500" />}
      <p className="font-display text-lg font-semibold text-slate-200">{title}</p>
      {children}
    </div>
  );
}
