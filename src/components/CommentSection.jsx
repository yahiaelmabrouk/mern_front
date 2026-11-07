import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { formatDate } from '../constants';
import FeedbackAlert from './FeedbackAlert';

// Relation 1 -> N : une Tâche possède plusieurs Commentaires
export default function CommentSection({ taskId }) {
  const { user } = useSelector((state) => state.auth);

  // État local : la liste n'est utile qu'à cette carte, pas besoin de Redux
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Chargement des commentaires quand la section s'ouvre (GET public)
  useEffect(() => {
    const chargerCommentaires = async () => {
      try {
        const response = await axiosClient.get(`/comments/task/${taskId}`);
        setComments(response.data);
      } catch (err) {
        setErrorMsg('Impossible de charger les commentaires.');
      } finally {
        setLoading(false);
      }
    };
    chargerCommentaires();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setErrorMsg('');
    try {
      // POST protégé : l'intercepteur Axios ajoute le Token JWT
      const response = await axiosClient.post('/comments', { text, taskId });
      setComments([...comments, response.data]);
      setText('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l ajout du commentaire.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/comments/${id}`);
      setComments(comments.filter((c) => c._id !== id));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Action non autorisée.');
    }
  };

  return (
    <div className="comments-box">
      <FeedbackAlert type="error" message={errorMsg} />

      {loading && <p className="comments-empty">Chargement...</p>}

      {!loading && comments.length === 0 && (
        <p className="comments-empty">Aucun commentaire pour le moment.</p>
      )}

      {comments.map((c) => (
        <div key={c._id} className="comment-item">
          <div className="comment-meta">
            <strong>{c.author?.name || 'Utilisateur supprimé'}</strong>
            <span>{formatDate(c.createdAt)}</span>
            {user && (user.id === c.author?._id || user.role === 'Admin') && (
              <button className="btn-link danger" onClick={() => handleDelete(c._id)}>
                Supprimer
              </button>
            )}
          </div>
          <p>{c.text}</p>
        </div>
      ))}

      {/* Rendu conditionnel : formulaire de commentaire uniquement si connecté */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            placeholder="Ajouter un commentaire..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-submit small">Envoyer</button>
        </form>
      ) : (
        <p className="comments-empty">Connectez-vous pour commenter.</p>
      )}
    </div>
  );
}
