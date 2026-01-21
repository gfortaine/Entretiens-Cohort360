import axios from 'axios';

/**
 * Client HTTP configuré pour l'API Django.
 * Uses Vite proxy in development (/api -> http://127.0.0.1:8000)
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
