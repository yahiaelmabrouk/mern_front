import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { removeTask } from '../redux/taskSlice';
import { changeTaskStatus, justCompleted } from '../redux/taskActions';
import { STATUSES, STATUS_LABELS, formatDate, isLateTask } from '../constants';
import { toast } from '../toast';
import Avatar from './Avatar';
import Badge, { toVariant } from './Badge';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';

export const DRAG_TYPE = 'application/x-taskflow-id';

const CONFETTI_COLORS = ['#10b981', '#a3e635', '#14b8a6', '#fbbf24', '#38bdf8', '#f472b6'];

export default function TaskCard({ task, index = 0, compact = false }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [burst, setBurst] = useState(0);

  // Rendu conditionnel : seul l'auteur (ou un Admin) peut modifier / supprimer
  const canManage = user && (user.id === task.author?._id || user.role === 'Admin');
  const isLate = isLateTask(task);
  const done = task.status === 'Terminee';

  // Petite célébration quand la tâche vient de passer à "Terminée"
  useEffect(() => {
    if (done && justCompleted.has(task._id)) {
      justCompleted.delete(task._id);
      setBurst((b) => b + 1);
    }
  }, [done, task._id]);

  const setStatus = async (status) => {
    try {
      // PUT protégé (optimiste) : le Token JWT est ajouté automatiquement par l'intercepteur
      await dispatch(changeTaskStatus(task, status));
    } catch (err) {
      toast(err.response?.data?.message || 'Action non autorisée.', 'error');
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
      toast('Tâche supprimée');
    } catch (err) {
      toast(err.response?.data?.message || 'Action non autorisée.', 'error');
    }
  };

  const draggable = compact && canManage;
  const authorName = task.author?.name || 'Utilisateur supprimé';

  return (
    <article
      className={[
        'article-card',
        toVariant('prio', task.priority),
        done && 'done',
        leaving && 'leaving',
        dragging && 'dragging',
        compact && 'compact',
        draggable && 'is-draggable'
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--i': index }}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable || e.target !== e.currentTarget) return;
        e.dataTransfer.setData(DRAG_TYPE, task._id);
        e.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
    >
      {burst > 0 && (
        <div className="confetti" key={burst} aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            const r = 60 + (i % 3) * 28;
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

      <div className="task-main">
        <button
          type="button"
          className={`check ${done ? 'checked' : ''}`}
          onClick={() => setStatus(done ? 'A faire' : 'Terminee')}
          disabled={!canManage}
          aria-pressed={done}
          aria-label={done ? 'Marquer comme à faire' : 'Marquer comme terminée'}
          title={canManage ? (done ? 'Rouvrir la tâche' : 'Marquer comme terminée') : 'Lecture seule'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 12.5l4 4 8-9" />
          </svg>
        </button>

        <div className="task-body">
          <div className="card-top">
            <div className="badges">
              {!compact && (
                <Badge variant={toVariant('status', task.status)}>{STATUS_LABELS[task.status]}</Badge>
              )}
              <Badge variant={toVariant('priority', task.priority)}>{task.priority}</Badge>
              {isLate && <Badge variant="late">En retard</Badge>}
            </div>

            {canManage ? (
              <div className="card-actions">
                {!compact && (
                  <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Changer le statut"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}
                <button
                  className="icon-btn danger sm"
                  onClick={() => setConfirming(true)}
                  title="Supprimer"
                  aria-label="Supprimer la tâche"
                >
                  <Icon name="trash" size={15} />
                </button>
                {draggable && (
                  <span className="drag-handle" title="Glisser vers une autre colonne" aria-hidden="true">
                    <Icon name="drag" size={16} />
                  </span>
                )}
              </div>
            ) : (
              <span className="locked-tag" title={user ? "Vous n'êtes pas l'auteur" : 'Connectez-vous pour modifier'}>
                <Icon name="lock" size={12} /> Lecture seule
              </span>
            )}
          </div>

          <h3 className="article-title"><span>{task.title}</span></h3>
          {task.description && <p className="task-description">{task.description}</p>}

          <div className="card-footer">
            <span className="author-info">
              <Avatar name={authorName} size={24} />
              <span>
                <strong>{authorName}</strong>
                {!compact && <> · {formatDate(task.createdAt)}</>}
              </span>
              {task.dueDate && (
                <span className={`due-chip ${isLate ? 'late' : ''}`}>
                  <Icon name="clock" size={12} /> {formatDate(task.dueDate)}
                </span>
              )}
            </span>
            <button
              className={`btn-link ${showComments ? 'open' : ''}`}
              onClick={() => setShowComments(!showComments)}
              aria-expanded={showComments}
            >
              <Icon name="chat" size={14} />
              {showComments ? 'Masquer' : 'Commentaires'}
            </button>
          </div>
        </div>
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
