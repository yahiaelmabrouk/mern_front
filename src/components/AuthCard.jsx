import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { loginSuccess } from '../redux/authSlice';
import FeedbackAlert from './FeedbackAlert';
import FormField from './FormField';

export default function AuthCard() {
  // Formulaire contrôlé : chaque champ est relié à un useState
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const isRegister = mode === 'register';

  // ==========================================================================
  // Connexion ou Inscription -> le serveur renvoie { user, token }
  // ==========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      // 1. Envoyer les identifiants au serveur Express
      const response = isRegister
        ? await axiosClient.post('/auth/register', { name, email, password })
        : await axiosClient.post('/auth/login', { email, password });

      // 2. Ranger l'utilisateur et son Token JWT dans Redux + localStorage
      dispatch(loginSuccess(response.data));
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Erreur de connexion au serveur Express.'
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
  };

  const fillDemoAccount = () => {
    setMode('login');
    setEmail('admin@pme.tn');
    setPassword('123456');
    setErrorMsg('');
  };

  return (
    <section className="form-card auth-card">
      <div className="form-header">
        <span className="lock-pill">Espace Membre Sécurisé (JWT)</span>
        <h3>{isRegister ? 'Créer un Compte Employé' : 'Connexion Requise pour Gérer'}</h3>
        <p>
          Connectez-vous pour obtenir votre Token JWT et débloquer l'ajout, la modification
          et la suppression des tâches.
        </p>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={!isRegister ? 'tab active' : 'tab'}
          onClick={() => changeMode('login')}
        >
          Connexion
        </button>
        <button
          type="button"
          className={isRegister ? 'tab active' : 'tab'}
          onClick={() => changeMode('register')}
        >
          Inscription
        </button>
      </div>

      <FeedbackAlert type="error" message={errorMsg} />

      <form onSubmit={handleSubmit} className="article-form">
        {isRegister && (
          <FormField id="name" label="Nom complet :">
            <input
              id="name"
              type="text"
              placeholder="Ex : Aya Ben Amor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>
        )}

        <FormField id="email" label="Adresse Email :">
          <input
            id="email"
            type="email"
            placeholder="admin@pme.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField id="password" label="Mot de Passe :">
          <input
            id="password"
            type="password"
            placeholder={isRegister ? '6 caractères minimum' : '123456'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isRegister ? 6 : undefined}
            required
          />
        </FormField>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading
            ? 'Vérification...'
            : isRegister
              ? "S'inscrire (Obtenir Token JWT)"
              : 'Se Connecter (Obtenir Token JWT)'}
        </button>

        {!isRegister && (
          <button type="button" className="btn-demo" onClick={fillDemoAccount}>
            Remplir Compte Démo (admin@pme.tn / 123456)
          </button>
        )}
      </form>
    </section>
  );
}
