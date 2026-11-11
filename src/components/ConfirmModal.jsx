import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Boîte de dialogue de confirmation (remplace window.confirm)
export default function ConfirmModal({ title, message, confirmLabel = 'Supprimer', onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Portal : le modal est rendu dans <body> pour échapper au backdrop-filter de la carte
  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">!</div>
        <h4>{title}</h4>
        <p>{message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn-ghost" onClick={onCancel}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
