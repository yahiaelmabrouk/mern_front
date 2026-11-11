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

  // 2. État Local (useState) : filtres sélectionnés + recherche
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [query, setQuery] = useState('');

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
  const q = query.trim().toLowerCase();
  const filteredItems = items.filter(
    (t) =>
      (!selectedStatus || t.status === selectedStatus) &&
      (!selectedPriority || t.priority === selectedPriority) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q))
  );

  const doneCount = items.filter((t) => t.status === 'Terminee').length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const countFor = (status) =>
    status ? items.filter((t) => t.status === status).length : items.length;

  return (
    <section className="list-section">
      <div className="list-header">
        <div>
          <h3>Tâches Synchronisées avec l'API</h3>
          <p className="list-subtitle">
            Données MongoDB récupérées via Axios (auteur affiché grâce à populate)
          </p>
        </div>
      </div>

      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Rechercher une tâche..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="filter-box">
          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
            <option value="">Toutes priorités</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Filtrer par statut">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            role="tab"
            aria-selected={selectedStatus === s}
            className={selectedStatus === s ? 'chip active' : 'chip'}
            onClick={() => setSelectedStatus(s)}
          >
            {s ? STATUS_LABELS[s] : 'Toutes'}
            <em>{countFor(s)}</em>
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="progress">
          <div className="progress-meta">
            <span>Progression globale</span>
            <b>{doneCount}/{items.length} terminées · {pct}%</b>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ '--pct': `${pct}%` }} />
          </div>
        </div>
      )}

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
          <div className="skeleton-stack">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
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
          {filteredItems.map((task, i) => (
            <TaskCard key={task._id} task={task} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
