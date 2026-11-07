import React from 'react';

// Composant réutilisable : message de succès ou d'erreur (rien si message vide)
export default function FeedbackAlert({ type = 'success', message }) {
  if (!message) return null;
  return <div className={`feedback-alert ${type}`}>{message}</div>;
}
