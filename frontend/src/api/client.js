import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || '/api',
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

// Response interceptor to catch unauthorized errors and invalid responses
api.interceptors.response.use(
  (response) => {
    // If response is HTML (e.g. static host fallback returning index.html for unknown /api route)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') || response.data.trim().startsWith('<html'))
    ) {
      const err = new Error('Received HTML response instead of JSON API response.');
      err.response = {
        status: 404,
        data: { detail: 'Backend API route not found (received HTML document from static host).' },
      };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear invalid auth
      const currentToken = localStorage.getItem('skillswap_token');
      if (currentToken && !error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('skillswap_token');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Safely formats any Axios error or API response into a clear, user-friendly message.
 * Distinguishes network errors, missing 404 endpoints, 502/503 server downtimes,
 * FastAPI 422 validation arrays, and standard 400 validation exceptions.
 */
export const formatApiError = (err, fallback = 'Operation failed. Please try again.') => {
  if (!err) return fallback;

  // 1. Network / No Response (e.g., server offline, CORS blocked, DNS failure)
  if (!err.response) {
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      return 'Unable to reach the backend server. Please verify your connection and ensure the backend is running.';
    }
    return err.message || 'Unable to connect to the server. Please ensure the backend is running.';
  }

  const { status, data } = err.response;

  // 2. HTTP 404 Not Found (e.g., Vercel static host without backend proxy, missing route)
  if (status === 404) {
    return 'Backend API endpoint not found (HTTP 404). Please ensure the FastAPI backend is running and VITE_API_URL is configured.';
  }

  // 3. HTTP 502 / 503 / 504 (Server waking up, sleeping on free tier, or crashed)
  if (status === 502 || status === 503 || status === 504) {
    return `Backend service is temporarily unavailable (HTTP ${status}). If hosted on a free tier (e.g. Render), please allow up to 60 seconds for it to spin up.`;
  }

  // 4. FastAPI 422 Unprocessable Entity (Array of validation errors)
  if (status === 422 && Array.isArray(data?.detail)) {
    const messages = data.detail.map((item) => {
      const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
      const msg = item.msg || 'Invalid format';
      const cleanMsg = msg
        .replace(/^value is not a valid /, 'Invalid ')
        .replace(/^Value error, /, '');
      return field && field !== 'body' ? `${field}: ${cleanMsg}` : cleanMsg;
    });
    return messages.join('. ');
  }

  // 5. FastAPI HTTPException detail (e.g. "Username is already taken. Please choose another.")
  if (typeof data?.detail === 'string' && data.detail.trim().length > 0) {
    return data.detail.trim();
  }

  // 6. Generic JSON message / error fields
  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message.trim();
  }
  if (typeof data?.error === 'string' && data.error.trim().length > 0) {
    return data.error.trim();
  }

  // 7. Plain text response (e.g. short string from Vercel/proxy)
  if (typeof data === 'string' && data.trim().length > 0 && data.length < 200) {
    const trimmed = data.trim();
    if (trimmed.includes('NOT_FOUND') || trimmed.includes('The page could not be found')) {
      return 'Backend API endpoint not found (HTTP 404). Please ensure the backend is running and VITE_API_URL is configured.';
    }
    return trimmed;
  }

  // 8. Sensible HTTP status fallbacks
  if (status === 400) {
    return 'Invalid request. Please check the submitted fields.';
  }
  if (status === 401) {
    return 'Invalid credentials. Please check your username/email and password.';
  }
  if (status === 403) {
    return 'Access forbidden. You do not have permission to perform this action.';
  }
  if (status >= 500) {
    return 'Internal server error. Please try again later.';
  }

  return fallback;
};

export default api;
