// Valeurs identiques aux "enum" du modèle Mongoose Task (server/models/Task.js)
export const STATUSES = ['A faire', 'En cours', 'Terminee'];
export const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

// Libellés affichés à l'écran
export const STATUS_LABELS = {
  'A faire': 'À faire',
  'En cours': 'En cours',
  Terminee: 'Terminée'
};

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('fr-FR') : '';
