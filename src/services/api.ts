import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Making request to:', (config.baseURL || '') + (config.url || ''), 'with token:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data, error.config?.url);
    
    // Manejo específico de errores de red
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      error.message = 'La petición tardó demasiado tiempo. Verifica tu conexión.';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error');
      error.message = 'Error de red. Verifica que el servidor esté funcionando.';
    } else if (error.response?.status === 401) {
      console.log('Unauthorized - clearing auth data');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);