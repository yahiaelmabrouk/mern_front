import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setTasks, setLoading, setError } from '../redux/taskSlice';
import { STATUSES, PRIORITIES, STATUS_LABELS } from '../constants';
import TaskCard from './TaskCard';

export default function TaskList() {
  const dispatch = useDispatch();

  // 1. État Global (Redux) : liste des tâches, chargement et erreur
  const { items, loading, error } = useSelector((state) => state.tasks);

  // 2. État Local (useState) : filtres sélectionnés
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Fonction simple pour charger les tâches avec Axios et les ranger dans Redux
  const chargerTaches = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosClient.get('/tasks');
      dispatch(setTasks(response.data));
    } catch (err) {
      dispatch(setError('Serveur Express injoignable. Vérifiez que l API est démarrée.'));
    }
  };

  // Chargement initial à l'ouverture de la page
  useEffect(() => {
    chargerTaches();
  }, []);

  // Filtrage JavaScript simple
  const filteredItems = items.filter(
    (t) =>
      (!selectedStatus || t.status === selectedStatus) &&
      (!selectedPriority || t.priority === selectedPriority)
  );

  return (
    <section className="list-section">
      <div className="list-header">
        <div>
          <h3>Tâches Synchronisées avec l'API</h3>
          <p className="list-subtitle">
            Données MongoDB récupérées via Axios (auteur affiché grâce à populate)
          </p>
        </div>

        <div className="filter-box">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
            <option value="">Toutes priorités</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CAS 1 : Alerte en cas d'erreur réseau */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">!</div>
          <div className="error-text">
            <strong>Erreur de Communication avec l'API Express :</strong>
            <p>{error}</p>
          </div>
          <button className="btn-retry" onClick={chargerTaches}>
            Réessayer
          </button>
        </div>
      )}

      {/* CAS 2 : Indicateur de chargement */}
      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Chargement des tâches depuis l'API Express...</p>
        </div>
      )}

      {/* CAS 3 : Aucune tâche */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="empty-box">
          <p>Aucune tâche à afficher</p>
          <span>Modifiez les filtres ou connectez-vous pour créer une tâche.</span>
        </div>
      )}

      {/* CAS 4 : Grille des tâches */}
      {!loading && filteredItems.length > 0 && (
        <div className="articles-grid">
          {filteredItems.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
