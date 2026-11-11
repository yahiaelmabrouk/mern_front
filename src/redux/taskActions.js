import axiosClient from '../api/axiosClient';
import { updateTask } from './taskSlice';

// Identifiants des tâches qui viennent d'être terminées : la carte joue
// l'animation de confettis au prochain rendu (même si elle change de colonne).
export const justCompleted = new Set();

// Changement de statut "optimiste" : l'interface bouge tout de suite,
// puis on confirme avec Express (PUT protégé). En cas d'échec, on revient en arrière.
export const changeTaskStatus = (task, status) => async (dispatch) => {
  if (task.status === status) return task;
  if (status === 'Terminee') justCompleted.add(task._id);
  dispatch(updateTask({ ...task, status }));
  try {
    const response = await axiosClient.put(`/tasks/${task._id}`, { status });
    dispatch(updateTask(response.data));
    return response.data;
  } catch (err) {
    justCompleted.delete(task._id);
    dispatch(updateTask(task));
    throw err;
  }
};
