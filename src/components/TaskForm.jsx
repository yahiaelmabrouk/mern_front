import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { addTask } from '../redux/taskSlice';
import { STATUSES, PRIORITIES, STATUS_LABELS } from '../constants';
import FeedbackAlert from './FeedbackAlert';
import FormField from './FormField';

export default function TaskForm() {
  // Formulaire contrôlé : un useState par champ
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Moyenne');
  const [status, setStatus] = useState(STATUSES[0]);
  const [dueDate, setDueDate] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMsg('');
    setFeedback('');

    try {
      setSubmitting(true);
      // 1. Envoyer la tâche (l'intercepteur Axios ajoute automatiquement le Token JWT !)
      const response = await axiosClient.post('/tasks', {
        title,
        description,
        priority,
        status,
        dueDate
      });

      // 2. Ranger la tâche créée dans le Store Redux
      dispatch(addTask(response.data));

      // 3. Vider le formulaire
      setTitle('');
      setDescription('');
      setPriority('Moyenne');
      setStatus(STATUSES[0]);
      setDueDate('');
      setFeedback('Tâche créée avec succès (Token JWT vérifié par Express) !');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-card unlocked-card">
      <div className="form-header">
        <span className="unlock-pill">Token JWT Actif -- Création Autorisée</span>
        <h3>Nouvelle Tâche</h3>
        <p>Responsable certifié par le Token JWT : <strong>{user?.name}</strong></p>
      </div>

      <FeedbackAlert type="success" message={feedback} />
      <FeedbackAlert type="error" message={errorMsg} />

      <form onSubmit={handleSubmit} className="article-form">
        <FormField id="title" label="Titre de la Tâche :">
          <input
            id="title"
            type="text"
            placeholder="Ex : Commander les fournitures de bureau"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>

        <FormField id="description" label="Description :">
          <textarea
            id="description"
            rows="3"
            placeholder="Détails, contexte, étapes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <div className="form-row">
          <FormField id="priority" label="Priorité :">
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>

          <FormField id="status" label="Statut :">
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="dueDate" label="Échéance :">
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Envoi...' : '+ Créer avec mon Token JWT'}
        </button>
      </form>
    </section>
  );
}
