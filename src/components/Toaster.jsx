import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const DURATION = 3200;

// Affiche les notifications envoyées par toast() (voir src/toast.js)
export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-3), { id, ...e.detail }]);
      setTimeout(() => dismiss(id), DURATION);
    };
    window.addEventListener('taskflow:toast', onToast);
    return () => window.removeEventListener('taskflow:toast', onToast);
  }, []);

  const dismiss = (id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 300);
  };

  return createPortal(
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type} ${t.leaving ? 'leaving' : ''}`}>
          <span className="toast-icon">
            <Icon name={t.type === 'error' ? 'x' : 'check'} size={14} />
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Fermer">
            <Icon name="x" size={14} />
          </button>
          <span className="toast-bar" style={{ animationDuration: `${DURATION}ms` }} />
        </div>
      ))}
    </div>,
    document.body
  );
}
