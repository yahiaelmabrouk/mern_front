import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isLateTask } from '../constants';

// Compteur animé : monte progressivement jusqu'à la valeur cible
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const from = value;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

function Stat({ icon, label, value, suffix = '', tone, delay }) {
  const shown = useCountUp(value);
  return (
    <div className={`stat-card tone-${tone}`} style={{ '--d': `${delay}ms` }}>
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value">{shown}{suffix}</div>
        <div className="stat-label-sm">{label}</div>
      </div>
    </div>
  );
}

export default function StatsRow() {
  const { items } = useSelector((state) => state.tasks);

  const total = items.length;
  const inProgress = items.filter((t) => t.status === 'En cours').length;
  const late = items.filter(isLateTask).length;
  const done = items.filter((t) => t.status === 'Terminee').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="stats-row" aria-label="Statistiques">
      <Stat icon="▦" label="Tâches au total" value={total} tone="violet" delay={0} />
      <Stat icon="◔" label="En cours" value={inProgress} tone="cyan" delay={80} />
      <Stat icon="⚑" label="En retard" value={late} tone="rose" delay={160} />
      <Stat icon="✓" label="Taux de réussite" value={pct} suffix="%" tone="green" delay={240} />
    </section>
  );
}
