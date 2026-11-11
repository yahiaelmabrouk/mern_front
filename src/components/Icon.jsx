import React from 'react';

// Petit jeu d'icônes SVG (trait 2px, style "outline") — aucune dépendance externe
const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

const PATHS = {
  sun: [
    circle(12, 12, 4),
    'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'
  ],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
  plus: ['M12 5v14M5 12h14'],
  list: ['M9 6h12M9 12h12M9 18h12', 'M4 6h.01M4 12h.01M4 18h.01'],
  board: ['M4 4h4.5v16H4zM10.25 4h4.5v10h-4.5zM16.5 4H20v13h-3.5z'],
  search: [circle(11, 11, 7), 'M21 21l-4.35-4.35'],
  refresh: ['M21 12a9 9 0 1 1-2.64-6.36', 'M21 3v6h-6'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  check: ['M20 6L9 17l-5-5'],
  clock: [circle(12, 12, 9), 'M12 7v5l3 2'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6M14 11v6'],
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z'],
  x: ['M18 6L6 18M6 6l12 12'],
  layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  flag: ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  arrow: ['M5 12h14', 'M12 5l7 7-7 7'],
  sparkle: ['M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z', 'M19 17v4M17 19h4'],
  drag: [circle(9, 6, 1), circle(15, 6, 1), circle(9, 12, 1), circle(15, 12, 1), circle(9, 18, 1), circle(15, 18, 1)]
};

export default function Icon({ name, size = 18, className = '', ...rest }) {
  const paths = PATHS[name] || [];
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
