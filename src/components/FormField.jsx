import React from 'react';

// Composant réutilisable : un label + son champ (input, select, textarea...)
export default function FormField({ id, label, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
