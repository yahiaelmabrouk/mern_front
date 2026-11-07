import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { removeTask, updateTask } from '../redux/taskSlice';
import { STATUSES, STATUS_LABELS, formatDate } from '../constants';
import Badge, { toVariant } from './Badge';
import CommentSection from './CommentSection';

export default function TaskCard({ task }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);

  // Rendu conditionnel : seul l'auteur (ou un Admin) peut modifier / supprimer
  const canManage = user && (user.id === task.author?._id || user.role === 'Admin');

  const isLate =
    task.dueDate && task.status !== 'Terminee' && new Date(task.dueDate) < new Date();

  const handleStatusChange = async (e) => {
    try {
      // PUT protégé : le Token JWT est ajouté automatiquement par l'intercepteur
      const response = await axiosClient.put(`/tasks/${task._id}`, { status: e.target.value });
      dispatch(updateTask(response.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Action non autorisée.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la tâche "${task.title}" ?`)) return;
    try {
      // 1. Supprimer sur Express (le Token JWT est ajouté automatiquement par l'intercepteur)
      await axiosClient.delete(`/tasks/${task._id}`);
      // 2. Retirer du Store Redux
      dispatch(removeTask(task._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action non autorisée.');
    }
  };

  return (
    <article className="article-card">
      <div className="card-top">
        <div className="badges">
          <Badge variant={toVariant('status', task.status)}>{STATUS_LABELS[task.status]}</Badge>
          <Badge variant={toVariant('priority', task.priority)}>Priorité {task.priority}</Badge>
          {isLate && <Badge variant="late">En retard</Badge>}
        </div>

        {canManage ? (
          <div className="card-actions">
            <select className="status-select" value={task.status} onChange={handleStatusChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button className="btn-delete" onClick={handleDelete}>
              Supprimer
            </button>
          </div>
        ) : (
          <span className="locked-tag">
            {user ? 'Lecture seule (pas l auteur)' : 'Lecture seule (JWT requis)'}
          </span>
        )}
      </div>

      <h3 className="article-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="card-footer">
        <span className="author-info">
          Créée par : <strong>{task.author?.name || 'Utilisateur supprimé'}</strong>
          {' · '}le {formatDate(task.createdAt)}
          {task.dueDate && <> · Échéance : <strong>{formatDate(task.dueDate)}</strong></>}
        </span>
        <button className="btn-link" onClick={() => setShowComments(!showComments)}>
          {showComments ? 'Masquer les commentaires' : 'Commentaires'}
        </button>
      </div>

      {showComments && <CommentSection taskId={task._id} />}
    </article>
  );
}
