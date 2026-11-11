import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AuthCard from './components/AuthCard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import StatsRow from './components/StatsRow';
import Drawer from './components/Drawer';
import Toaster from './components/Toaster';
import Icon from './components/Icon';

const HEADLINE = ['Pilotez', 'les', 'tâches', 'de', 'votre', 'équipe,'];
const FEATURES = [
  { icon: 'board', label: 'Tableau Kanban' },
  { icon: 'chat', label: 'Commentaires' },
  { icon: 'clock', label: 'Échéances' },
  { icon: 'lock', label: 'Accès sécurisé' }
];

const SPOT_TARGETS = '.stat-card, .article-card, .form-card, .list-section';
const RIPPLE_TARGETS = '.btn-primary, .btn-submit, .btn-secondary, .chip, .seg-btn, .icon-btn';

export default function App() {
  // On lit si un utilisateur est connecté dans le coffre Redux (state.auth)
  const { user } = useSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Si l'utilisateur se déconnecte, on ferme le panneau
  useEffect(() => {
    if (!user) setDrawerOpen(false);
  }, [user]);

  // Effets visuels globaux (délégation d'événements, un seul écouteur chacun) :
  //  - spotlight : la lumière suit la souris sur les cartes (--mx / --my)
  //  - ripple    : onde au clic sur les boutons
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.(SPOT_TARGETS);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const onDown = (e) => {
      const btn = e.target.closest?.(RIPPLE_TARGETS);
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const wave = document.createElement('span');
      wave.className = 'ripple';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      btn.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <div className="app-shell" id="top">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <Navbar />

      <main className="container main-content">
        <section className={`hero ${user ? 'is-member' : 'is-visitor'}`}>
          <div className="hero-copy">
            <span className="eyebrow">
              <i /> Gestion de projets pour PME
            </span>

            <h1>
              {HEADLINE.map((w, i) => (
                <React.Fragment key={i}>
                  <span className="word" style={{ '--i': i }}>{w}</span>{' '}
                </React.Fragment>
              ))}
              <em className="word accent" style={{ '--i': HEADLINE.length }}>sans effort.</em>
            </h1>

            <p className="hero-lead">
              {user
                ? `Bon retour, ${user.name.split(' ')[0]} ! Créez, suivez et terminez vos tâches — glissez-les d'une colonne à l'autre pour avancer.`
                : 'Consultez les tâches en mode visiteur, ou connectez-vous pour créer, mettre à jour, commenter et supprimer vos tâches.'}
            </p>

            <div className="hero-cta">
              {user ? (
                <button className="btn-primary" onClick={openDrawer}>
                  <Icon name="plus" /> Nouvelle tâche
                </button>
              ) : null}
              <a className="btn-secondary" href="#tasks">
                Voir les tâches <Icon name="arrow" size={16} />
              </a>
            </div>

            <ul className="hero-features">
              {FEATURES.map((f, i) => (
                <li key={f.label} style={{ '--i': i }}>
                  <Icon name={f.icon} size={15} /> {f.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-side">
            {/* Visiteur -> Connexion / Inscription ; Membre -> tableau de bord */}
            {user ? <StatsRow /> : <AuthCard />}
          </div>
        </section>

        {!user && <StatsRow />}

        <TaskList onNew={user ? openDrawer : null} />
      </main>

      <footer className="footer-bar">
        <div className="container footer-inner">
          <span className="brand-mini">
            <span className="brand-mark sm"><Icon name="check" size={12} /></span>
            TaskFlow PME
          </span>
          <span className="stack">
            {['MongoDB', 'Express', 'React', 'Node.js', 'JWT'].map((s) => (
              <em key={s}>{s}</em>
            ))}
          </span>
        </div>
      </footer>

      <Drawer open={drawerOpen} onClose={closeDrawer} title="Nouvelle tâche">
        <TaskForm onCreated={closeDrawer} />
      </Drawer>

      <Toaster />
    </div>
  );
}
