import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { loginSuccess } from '../redux/authSlice';
import FeedbackAlert from './FeedbackAlert';
import FormField from './FormField';
import Icon from './Icon';
import { toast } from '../toast';

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
      toast(`Bienvenue, ${response.data.user?.name || ''} !`);
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
        <span className="lock-pill"><Icon name="lock" size={12} /> Espace membre sécurisé</span>
        <h3>{isRegister ? 'Créer un compte employé' : 'Bon retour parmi nous'}</h3>
        <p>
          {isRegister
            ? 'Rejoignez votre équipe pour créer et suivre vos tâches.'
            : 'Connectez-vous pour créer, modifier, commenter et supprimer des tâches.'}
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
          {loading ? (
            <><span className="btn-spinner" /> Vérification...</>
          ) : isRegister ? (
            <>Créer mon compte <Icon name="arrow" size={16} /></>
          ) : (
            <>Se connecter <Icon name="arrow" size={16} /></>
          )}
        </button>

        {!isRegister && (
          <button type="button" className="btn-demo" onClick={fillDemoAccount}>
            <Icon name="sparkle" size={14} /> Utiliser le compte démo
          </button>
        )}
      </form>
    </section>
  );
}
