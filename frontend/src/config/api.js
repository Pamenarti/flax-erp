import axios from 'axios';

// API URL yapılandırması - doğru yola yönlendir
const API_URL = typeof window !== 'undefined' 
  ? '/api' // Tarayıcı için rölatif yol (proxy'ye gidecek)
  : process.env.BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - token ekler
api.interceptors.request.use(
  config => {
    // Token varsa ekle
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - hataları yönet
api.interceptors.response.use(
  response => response,
  error => {
    // API hatalarında sadece konsola yazdır
    console.error('API Error:', error.message, error.config?.url);
    
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş veya geçersiz
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
