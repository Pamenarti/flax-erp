import axios from 'axios';

// Use a relative URL for browser-side requests or the environment variable
// This resolves the "backend:3000" hostname resolution error
const API_URL = typeof window !== 'undefined' 
  ? '/api' // Use relative path for browser requests
  : process.env.BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - her istekte token ekler
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - token geçersizse kullanıcıyı çıkış yapar
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş veya geçersiz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Tarayıcı ortamındaysa login sayfasına yönlendir
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
