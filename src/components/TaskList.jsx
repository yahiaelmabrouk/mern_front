import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setTasks, setLoading, setError } from '../redux/taskSlice';
import { changeTaskStatus } from '../redux/taskActions';
import { STATUSES, PRIORITIES, STATUS_LABELS } from '../constants';
import { toast } from '../toast';
import { toVariant } from './Badge';
import TaskCard, { DRAG_TYPE } from './TaskCard';
import Icon from './Icon';

const readView = () => {
  try {
    return localStorage.getItem('view') === 'board' ? 'board' : 'list';
  } catch (e) {
    return 'list';
  }
};

export default function TaskList({ onNew }) {
  const dispatch = useDispatch();

  // 1. État Global (Redux) : liste des tâches, chargement et erreur
  const { items, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  // 2. État Local (useState) : filtres, recherche, vue (liste / tableau)
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState(readView);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('view', view);
    } catch (e) {
      /* ignore */
    }
  }, [view]);

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

  // Filtrage JavaScript simple (le tableau ignore le filtre de statut : chaque colonne EST un statut)
  const q = query.trim().toLowerCase();
  const baseItems = items.filter(
    (t) =>
      (!selectedPriority || t.priority === selectedPriority) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q))
  );
  const filteredItems = baseItems.filter((t) => !selectedStatus || t.status === selectedStatus);

  const doneCount = items.filter((t) => t.status === 'Terminee').length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const countFor = (status) =>
    status ? items.filter((t) => t.status === status).length : items.length;

  // Glisser-déposer : on lâche une carte dans une colonne -> PUT du nouveau statut
  const acceptsDrag = (e) => e.dataTransfer.types.includes(DRAG_TYPE);

  const handleDrop = async (e, status) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    const task = items.find((t) => t._id === id);
    if (!task || task.status === status) return;
    try {
      await dispatch(changeTaskStatus(task, status));
      toast(`« ${task.title} » → ${STATUS_LABELS[status]}`);
    } catch (err) {
      toast(err.response?.data?.message || 'Action non autorisée.', 'error');
    }
  };

  const showList = !loading && view === 'list' && filteredItems.length > 0;
  const showBoard = !loading && !error && view === 'board' && items.length > 0;
  const showEmpty = !loading && !error && (view === 'list' ? filteredItems.length === 0 : items.length === 0);

  return (
    <section className="list-section" id="tasks">
      <div className="list-header">
        <div>
          <h3>Tâches de l'équipe</h3>
          <p className="list-subtitle">
            Synchronisées en direct avec l'API Express & MongoDB
          </p>
        </div>

        <div className="list-header-actions">
          <div className={`segmented view-${view}`} role="tablist" aria-label="Mode d'affichage">
            <button
              role="tab"
              aria-selected={view === 'list'}
              className={`seg-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <Icon name="list" size={16} /> Liste
            </button>
            <button
              role="tab"
              aria-selected={view === 'board'}
              className={`seg-btn ${view === 'board' ? 'active' : ''}`}
              onClick={() => setView('board')}
            >
              <Icon name="board" size={16} /> Tableau
            </button>
          </div>

          {onNew && (
            <button className="btn-primary small" onClick={onNew}>
              <Icon name="plus" size={16} /> Nouvelle tâche
            </button>
          )}
        </div>
      </div>

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={17} />
          <input
            type="search"
            placeholder="Rechercher une tâche..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="filter-box">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            aria-label="Filtrer par priorité"
          >
            <option value="">Toutes priorités</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {view === 'list' && (
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
              <em key={countFor(s)}>{countFor(s)}</em>
            </button>
          ))}
        </div>
      )}

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
            <strong>Erreur de communication avec l'API Express</strong>
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
          <div className="spinner"><span /><span /><span /></div>
          <p>Chargement des tâches...</p>
          <div className="skeleton-stack">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </div>
      )}

      {/* CAS 3 : Aucune tâche */}
      {showEmpty && (
        <div className="empty-box">
          <div className="empty-art" aria-hidden="true">
            <span /><span /><span />
          </div>
          <p>Aucune tâche à afficher</p>
          <span>
            {user ? 'Modifiez les filtres ou créez une nouvelle tâche.' : 'Modifiez les filtres ou connectez-vous pour créer une tâche.'}
          </span>
        </div>
      )}

      {/* CAS 4a : Liste des tâches */}
      {showList && (
        <div className="articles-grid">
          {filteredItems.map((task, i) => (
            <TaskCard key={task._id} task={task} index={i} />
          ))}
        </div>
      )}

      {/* CAS 4b : Tableau Kanban (glisser-déposer entre colonnes) */}
      {showBoard && (
        <div className="board">
          {STATUSES.map((s, ci) => {
            const col = baseItems.filter((t) => t.status === s);
            return (
              <div
                key={s}
                className={`board-col ${toVariant('col', s)} ${dragOver === s ? 'drag-over' : ''}`}
                style={{ '--ci': ci }}
                onDragOver={(e) => {
                  if (!acceptsDrag(e)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOver !== s) setDragOver(s);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
                }}
                onDrop={(e) => handleDrop(e, s)}
              >
                <header className="board-col-head">
                  <span className="col-dot" />
                  {STATUS_LABELS[s]}
                  <em key={col.length}>{col.length}</em>
                </header>
                <div className="board-col-body">
                  {col.map((task, i) => (
                    <TaskCard key={task._id} task={task} index={i} compact />
                  ))}
                  {col.length === 0 && (
                    <div className="board-empty">
                      {user ? 'Déposez une tâche ici' : 'Aucune tâche'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
