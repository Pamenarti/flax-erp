import axios from 'axios';
import { mockApiHandler } from '../mock/api-mock';

// API URL yapılandırması
const API_URL = typeof window !== 'undefined' 
  ? '/api' // Tarayıcı için rölatif yol
  : process.env.BACKEND_URL || 'http://localhost:3000';

// Mock modu etkin mi kontrol et
const isMockEnabled = process.env.API_MOCK_ENABLED === 'true';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - token ve mock kontrolü
api.interceptors.request.use(
  async config => {
    // Token varsa ekle
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Mock API modu
    if (isMockEnabled && process.env.NODE_ENV === 'development') {
      try {
        console.log(`[Mock API] ${config.method?.toUpperCase()} ${config.url}`);
        // Mock API yanıtını al ve dön
        const mockResponse = await mockApiHandler(config);
        if (mockResponse) {
          // Axios isteğini iptal et ve mock yanıtı döndür
          return Promise.reject({
            isMockResponse: true,
            response: mockResponse
          });
        }
      } catch (error) {
        console.warn('[Mock API] Hata:', error);
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - mock yanıtları ve hataları yönet
api.interceptors.response.use(
  response => response,
  error => {
    // Mock yanıtı ise gerçek yanıt gibi dön
    if (error.isMockResponse) {
      return error.response;
    }
    
    // API hatalarında konsola detaylı hata mesajı
    console.error('API Error:', error.message, error.config?.url);
    
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş veya geçersiz (geliştirme ortamında bu kontrolü atlayalım)
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
