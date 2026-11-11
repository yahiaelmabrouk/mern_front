import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AuthCard from './components/AuthCard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import StatsRow from './components/StatsRow';

export default function App() {
  // On lit si un utilisateur est connecté dans le coffre Redux (state.auth)
  const { user } = useSelector((state) => state.auth);

  // Cursor spotlight : on écrit la position de la souris dans --mx / --my
  // de la carte survolée (utilisé par le dégradé radial en CSS)
  useEffect(() => {
    const onMove = (e) => {
      const card = e.target.closest?.('.form-card, .list-section, .article-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <Navbar />

      <main className="container main-content">
        <header className="page-intro">
          <span className="eyebrow"><i /> Gestion de projets pour PME</span>
          <h1>
            Suivi des <span className="grad-text">Tâches</span> de l'Entreprise
          </h1>
          <p>
            Consultez les tâches en mode visiteur, ou connectez-vous pour créer, mettre à jour,
            commenter et supprimer vos tâches.
          </p>
        </header>

        <StatsRow />

        <div className="app-grid-layout">
          <div className="column-form">
            {/* Si connecté -> Formulaire d'ajout, sinon -> Carte de Connexion / Inscription */}
            {user ? <TaskForm /> : <AuthCard />}
          </div>
          <div className="column-list">
            <TaskList />
          </div>
        </div>
      </main>

      <footer className="footer-bar">
        <p>TaskFlow PME -- Application MERN (MongoDB, Express, React, Node.js) sécurisée par JWT</p>
      </footer>
    </div>
  );
}
