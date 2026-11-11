import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { isLateTask } from '../constants';
import Icon from './Icon';

// Compteur animé : monte progressivement jusqu'à la valeur cible
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    let raf;
    let start;
    const from = fromRef.current;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// Anneau de progression SVG (taux de réussite)
function Ring({ pct }) {
  const r = 19;
  const c = 2 * Math.PI * r;
  return (
    <svg className="stat-ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle className="ring-track" cx="24" cy="24" r={r} />
      <circle
        className="ring-fill"
        cx="24"
        cy="24"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
    </svg>
  );
}

function Stat({ icon, label, value, suffix = '', tone, delay, ring }) {
  const shown = useCountUp(value);
  return (
    <div className={`stat-card tone-${tone}`} style={{ '--d': `${delay}ms` }}>
      <span className="stat-icon">
        {ring !== undefined ? <Ring pct={ring} /> : null}
        <Icon name={icon} size={20} />
      </span>
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
      <Stat icon="layers" label="Tâches au total" value={total} tone="emerald" delay={0} />
      <Stat icon="activity" label="En cours" value={inProgress} tone="sky" delay={90} />
      <Stat icon="flag" label="En retard" value={late} tone="rose" delay={180} />
      <Stat icon="check" label="Taux de réussite" value={pct} suffix="%" tone="lime" delay={270} ring={pct} />
    </section>
  );
}
