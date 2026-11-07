import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],      // La liste des tâches reçues du serveur Express
    loading: false, // true pendant que la requête Axios est en cours
    error: null     // Message d'erreur si le serveur Express est éteint
  },
  reducers: {
    // 1. Remplir la liste quand Axios reçoit les tâches (GET)
    setTasks: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },

    // 2. Ajouter une nouvelle tâche en tête de liste (POST)
    addTask: (state, action) => {
      state.items.unshift(action.payload);
    },

    // 3. Remplacer une tâche modifiée (PUT)
    updateTask: (state, action) => {
      const index = state.items.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
    },

    // 4. Supprimer une tâche par son identifiant (DELETE)
    removeTask: (state, action) => {
      state.items = state.items.filter((t) => t._id !== action.payload);
    },

    // 5. Activer/désactiver le chargement ou afficher une erreur
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError
} = taskSlice.actions;

export default taskSlice.reducer;
