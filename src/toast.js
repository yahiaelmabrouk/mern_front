// Mini système de notifications : n'importe quel composant peut appeler toast(...)
// et le <Toaster /> monté dans App les affiche (événement DOM, aucune dépendance).
export const toast = (message, type = 'success') =>
  window.dispatchEvent(new CustomEvent('taskflow:toast', { detail: { message, type } }));
