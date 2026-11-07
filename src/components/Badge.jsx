import React from 'react';

// Composant réutilisable : pastille colorée (statut, priorité, retard...)
// variant -> classe CSS (ex : "status-en-cours", "priority-haute", "late")
export default function Badge({ variant, children }) {
  return <span className={`badge ${variant}`}>{children}</span>;
}

// Transforme "En cours" en "en-cours" pour construire le nom de classe CSS
export const toVariant = (prefix, value) =>
  `${prefix}-${value.toLowerCase().replace(/\s+/g, '-')}`;
