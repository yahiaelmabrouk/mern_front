import React from 'react';

// Pastille d'initiales : la teinte est déduite du nom (toujours la même pour la même personne)
export default function Avatar({ name = '?', size = 24 }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);

  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue} 80% 62%), hsl(${(hue + 50) % 360} 80% 52%))`
      }}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  );
}
