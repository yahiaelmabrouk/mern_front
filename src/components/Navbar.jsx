import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setTasks, setLoading, setError } from '../redux/taskSlice';
import { logout } from '../redux/authSlice';
import { toast } from '../toast';
import Avatar from './Avatar';
import Icon from './Icon';

export default function Navbar() {
  const { items, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);

  // Thème clair (défaut) / sombre, mémorisé dans localStorage
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* stockage indisponible : on ignore */
    }
  }, [theme]);

  // La barre se "compacte" légèrement quand on fait défiler la page
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Changement de thème avec révélation circulaire (View Transitions API si disponible)
  const toggleTheme = (e) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.setAttribute('data-theme', next);
      flushSync(() => setTheme(next));
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      apply();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };

  const handleRefresh = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosClient.get('/tasks');
      dispatch(setTasks(response.data));
      toast('Tâches synchronisées');
    } catch (err) {
      dispatch(setError('Serveur Express injoignable. Vérifiez que l API est démarrée.'));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast('Vous êtes déconnecté');
  };

  const doneCount = items.filter((t) => t.status === 'Terminee').length;

  return (
    <header className={`nav-wrap ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar">
        <a className="brand" href="#top" aria-label="TaskFlow PME — accueil">
          <span className="brand-mark"><Icon name="check" size={18} /></span>
          <span className="brand-name">
            TaskFlow <span className="brand-tag">PME</span>
          </span>
        </a>

        <div className="nav-actions">
          <span className="nav-progress" title="Tâches terminées">
            <b>{doneCount}</b>/{items.length} terminées
          </span>

          {user ? (
            <div className="user-chip">
              <Avatar name={user.name} size={28} />
              <span className="user-meta">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </span>
              <span className="status-dot online" aria-hidden="true" />
            </div>
          ) : (
            <div className="user-chip visitor">
              <span className="status-dot offline" aria-hidden="true" />
              <span className="user-meta">
                <strong>Visiteur</strong>
                <small>Lecture seule</small>
              </span>
            </div>
          )}

          <button
            className={`icon-btn ${loading ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Rafraîchir"
            aria-label="Rafraîchir les tâches"
          >
            <Icon name="refresh" />
          </button>

          <button
            className="icon-btn theme-btn"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
          >
            <span key={theme} className="theme-icon">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </span>
          </button>

          {user && (
            <button className="icon-btn" onClick={handleLogout} title="Déconnexion" aria-label="Déconnexion">
              <Icon name="logout" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
