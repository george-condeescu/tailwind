// api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 secunde pana la timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * INTERCEPTOR CERERE (REQUEST)
 * Se execută înainte ca cererea să plece către server.
 */
api.interceptors.request.use(
  (config) => {
    // extract token from localStorage
    const token = localStorage.getItem('token'); // Sau din memorie

    // Dacă avem token, îl adăugăm în header-ul de Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pentru FormData, lăsăm axios să seteze automat Content-Type cu boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * INTERCEPTOR RĂSPUNS (RESPONSE)
 * Se execută după ce primim răspunsul de la server, înainte să ajungă la codul care a făcut cererea.
 * Aici putem verifica dacă răspunsul indică o problemă de autorizare (401) și să acționăm în consecință.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // 2. Gestionare Eroare 401 (Neautorizat / Token Expirat)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Marcăm cererea pentru a nu intra într-o buclă infinită dacă și refresh-ul dă 401
      originalRequest._retry = true;

      // Curățăm datele sesiunii expirate
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirecționăm către login cu parametrul de motiv
      // Folosim window.location pentru a forța resetarea stării React
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=expired';
      }
    }
    // 3. Gestionare alte erori comune (Opțional)
    if (error.response?.status === 403) {
      console.error('Acces interzis! Nu ai permisiunile necesare.');
    }

    if (error.response?.status >= 500) {
      console.error('Eroare de server. Te rugăm să încerci mai târziu.');
    }
    return Promise.reject(error);
  },
);

export default api;
