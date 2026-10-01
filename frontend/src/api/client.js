import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors and invalid HTML responses
api.interceptors.response.use(
  (response) => {
    // If response is HTML (e.g. static host fallback returning index.html for unknown /api route)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') || response.data.trim().startsWith('<html'))
    ) {
      const err = new Error('Received HTML response instead of JSON API response.');
      err.response = { status: 404, data: { detail: 'API route not found' } };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear invalid auth
      const currentToken = localStorage.getItem('skillswap_token');
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('skillswap_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
