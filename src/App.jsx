import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AuthCard from './components/AuthCard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

export default function App() {
  // On lit si un utilisateur est connecté dans le coffre Redux (state.auth)
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container main-content">
        <header className="page-intro">
          <h1>Suivi des Tâches de l'Entreprise</h1>
          <p>
            Consultez les tâches en mode visiteur, ou connectez-vous pour créer, mettre à jour,
            commenter et supprimer vos tâches.
          </p>
        </header>

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
