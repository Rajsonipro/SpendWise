import axios from 'axios';

// Validate that VITE_API_URL is set in production
const baseURL = import.meta.env.VITE_API_URL || '';

if (!baseURL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.error(
    '%c🚨 VITE_API_URL is not set!\n%cAPI calls will be sent to the same origin (' +
      window.location.origin +
      '), which may not have the backend routes.',
    'font-size: 16px; font-weight: bold; color: #ef4444;',
    'font-size: 13px; color: #f97316;'
  );
}

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
  // No withCredentials — auth uses Bearer token header, not cookies
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('Failed to parse userInfo from localStorage:', e);
        localStorage.removeItem('userInfo');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — logging only, pass the error through so components can handle it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API request timed out');
    } else if (!error.response) {
      console.error('Network error — backend may be unreachable:', error.message);
    } else if (error.response.status === 401) {
      console.warn('Authentication failed (401)');
    }

    return Promise.reject(error);
  }
);

export default api;