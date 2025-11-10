import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we have a token (meaning we were authenticated)
      // Don't redirect if it's a login attempt that failed (no token means we're already trying to login)
      const token = localStorage.getItem('token');
      const isLoginEndpoint = error.config?.url?.includes('/auth/login') || 
                              error.config?.url?.includes('/auth/2fa/verify') ||
                              error.config?.url?.includes('/auth/2fa/setup-mandatory') ||
                              error.config?.url?.includes('/auth/2fa/verify-setup-mandatory');
      
      if (token && !isLoginEndpoint) {
        // We had a token but got 401 - session expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If no token or it's a login endpoint, just let the error propagate
      // so the component can handle it (show error message, etc.)
    }
    return Promise.reject(error);
  }
);

export default api;
