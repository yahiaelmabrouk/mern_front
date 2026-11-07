import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer, // Tiroir 1 : Liste des tâches
    auth: authReducer   // Tiroir 2 : Utilisateur connecté & Token JWT
  }
});
