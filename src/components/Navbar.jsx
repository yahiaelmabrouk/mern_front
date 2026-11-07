import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setTasks, setLoading, setError } from '../redux/taskSlice';
import { logout } from '../redux/authSlice';

export default function Navbar() {
  const { items, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleRefresh = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosClient.get('/tasks');
      dispatch(setTasks(response.data));
    } catch (err) {
      dispatch(setError('Serveur Express injoignable. Vérifiez que l API est démarrée.'));
    }
  };

  const doneCount = items.filter((t) => t.status === 'Terminee').length;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="logo-icon">✓</span>
        <div>
          <h2>TaskFlow <span className="badge-track">PME</span></h2>
          <span className="nav-sub">React 18 + Redux Toolkit + Axios JWT + Express + MongoDB</span>
        </div>
      </div>

      <div className="nav-stats">
        {user ? (
          <div className="user-badge connected">
            <span className="status-dot online"></span>
            <span><strong>{user.name}</strong> ({user.role})</span>
            <button className="btn-logout" onClick={() => dispatch(logout())}>
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="user-badge visitor">
            <span className="status-dot offline"></span>
            <span>Mode Visiteur (Lecture seule)</span>
          </div>
        )}

        <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Chargement...' : 'Rafraîchir'}
        </button>

        <div className="stat-pill">
          <span className="stat-label">Tâches :</span>
          <span className="stat-count">{doneCount}/{items.length}</span>
        </div>
      </div>
    </nav>
  );
}
