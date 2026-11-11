import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { removeTask, updateTask } from '../redux/taskSlice';
import { STATUSES, STATUS_LABELS, formatDate, isLateTask } from '../constants';
import Avatar from './Avatar';
import Badge, { toVariant } from './Badge';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';

const CONFETTI_COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'];

export default function TaskCard({ task, index = 0 }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [burst, setBurst] = useState(0);

  // Rendu conditionnel : seul l'auteur (ou un Admin) peut modifier / supprimer
  const canManage = user && (user.id === task.author?._id || user.role === 'Admin');

  const isLate = isLateTask(task);

  const handleStatusChange = async (e) => {
    try {
      // PUT protégé : le Token JWT est ajouté automatiquement par l'intercepteur
      const response = await axiosClient.put(`/tasks/${task._id}`, { status: e.target.value });
      dispatch(updateTask(response.data));
      // Petite célébration quand la tâche passe à "Terminée"
      if (response.data.status === 'Terminee') {
        setBurst((b) => b + 1);
        setTimeout(() => setBurst(0), 1400);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action non autorisée.');
    }
  };

  const handleDelete = async () => {
    setConfirming(false);
    try {
      // 1. Supprimer sur Express (le Token JWT est ajouté automatiquement par l'intercepteur)
      await axiosClient.delete(`/tasks/${task._id}`);
      // 2. Jouer l'animation de sortie, puis retirer du Store Redux
      setLeaving(true);
      setTimeout(() => dispatch(removeTask(task._id)), 450);
    } catch (err) {
      alert(err.response?.data?.message || 'Action non autorisée.');
    }
  };

  const authorName = task.author?.name || 'Utilisateur supprimé';

  return (
    <article
      className={`article-card ${toVariant('prio', task.priority)} ${
        task.status === 'Terminee' ? 'done' : ''
      } ${leaving ? 'leaving' : ''}`}
      style={{ '--i': index }}
    >
      {burst > 0 && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r = 70 + (i % 3) * 30;
            return (
              <i
                key={i}
                style={{
                  '--x': `${Math.cos(a) * r}px`,
                  '--y': `${Math.sin(a) * r - 30}px`,
                  '--rot': `${i * 47}deg`,
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
                }}
              />
            );
          })}
        </div>
      )}

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
            <button className="btn-delete" onClick={() => setConfirming(true)}>
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
          <Avatar name={authorName} size={26} />
          <span>
            <strong>{authorName}</strong>
            {' · '}{formatDate(task.createdAt)}
          </span>
          {task.dueDate && (
            <span className={`due-chip ${isLate ? 'late' : ''}`}>
              ⏱ {formatDate(task.dueDate)}
            </span>
          )}
        </span>
        <button className="btn-link" onClick={() => setShowComments(!showComments)}>
          {showComments ? 'Masquer les commentaires' : 'Commentaires'}
        </button>
      </div>

      {showComments && <CommentSection taskId={task._id} />}

      {confirming && (
        <ConfirmModal
          title="Supprimer cette tâche ?"
          message={`« ${task.title} » sera définitivement supprimée.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </article>
  );
}
