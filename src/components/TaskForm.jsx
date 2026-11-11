import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { addTask } from '../redux/taskSlice';
import { STATUSES, PRIORITIES, STATUS_LABELS } from '../constants';
import { toast } from '../toast';
import FeedbackAlert from './FeedbackAlert';
import FormField from './FormField';
import Avatar from './Avatar';
import Icon from './Icon';

export default function TaskForm({ onCreated }) {
  // Formulaire contrôlé : un useState par champ
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Moyenne');
  const [status, setStatus] = useState(STATUSES[0]);
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Focus automatique sur le titre à l'ouverture du panneau
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMsg('');

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

      // 3. Vider le formulaire, notifier et fermer le panneau
      setTitle('');
      setDescription('');
      setPriority('Moyenne');
      setStatus(STATUSES[0]);
      setDueDate('');
      toast('Tâche créée avec succès');
      onCreated?.();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-card unlocked-card">
      <div className="form-header">
        <span className="unlock-pill"><Icon name="sparkle" size={13} /> Nouvelle tâche</span>
        <h3>Qu'y a-t-il à faire ?</h3>
        <p className="owner">
          <Avatar name={user?.name || '?'} size={22} />
          Responsable : <strong>{user?.name}</strong>
        </p>
      </div>

      <FeedbackAlert type="error" message={errorMsg} />

      <form onSubmit={handleSubmit} className="article-form">
        <FormField id="title" label="Titre">
          <input
            ref={titleRef}
            id="title"
            type="text"
            placeholder="Ex : Commander les fournitures de bureau"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>

        <FormField id="description" label="Description">
          <textarea
            id="description"
            rows="4"
            placeholder="Détails, contexte, étapes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <FormField id="priority" label="Priorité">
          <div className="seg-pick" role="radiogroup" aria-label="Priorité">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={priority === p}
                className={`pick ${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                onClick={() => setPriority(p)}
              >
                <span className="pick-dot" /> {p}
              </button>
            ))}
          </div>
        </FormField>

        <div className="form-row">
          <FormField id="status" label="Statut">
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </FormField>

          <FormField id="dueDate" label="Échéance">
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? (
            <><span className="btn-spinner" /> Création...</>
          ) : (
            <><Icon name="plus" size={17} /> Créer la tâche</>
          )}
        </button>
      </form>
    </section>
  );
}
