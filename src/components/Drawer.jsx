import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

// Panneau latéral qui glisse depuis la droite (formulaire "Nouvelle tâche")
export default function Drawer({ open, onClose, title, children }) {
  // On garde le panneau monté pendant l'animation de fermeture
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), 380);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`drawer-root ${open ? 'open' : 'closing'}`}>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label={title}>
        <button className="drawer-close icon-btn" onClick={onClose} aria-label="Fermer">
          <Icon name="x" />
        </button>
        {children}
      </aside>
    </div>,
    document.body
  );
}
