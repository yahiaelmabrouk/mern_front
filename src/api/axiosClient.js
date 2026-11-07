import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/authSlice';

// 1. Instance Axios pointant vers le serveur Express (ou l'URL Cloud en production)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// ============================================================================
// 2. Intercepteur de REQUÊTE JWT : ajoute "Authorization: Bearer <token>"
// ============================================================================
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// 3. Intercepteur de RÉPONSE : si le token est expiré (401), on déconnecte
// ============================================================================
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
