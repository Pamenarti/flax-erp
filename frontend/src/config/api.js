import axios from 'axios';
import { mockApiHandler } from '../mock/api-mock';

// API URL yapılandırması
const API_URL = typeof window !== 'undefined' 
  ? '/api' // Tarayıcı için rölatif yol
  : process.env.BACKEND_URL || 'http://localhost:3000';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock modu aktif mi kontrolü
const isMockEnabled = process.env.NODE_ENV === 'development';

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

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - mock yanıtları ve hataları yönet
api.interceptors.response.use(
  response => response,
  async error => {
    // Developer modunda ve API 404 hatası varsa mock yanıt kullan
    if (isMockEnabled && error.response && error.response.status === 404) {
      try {
        console.log(`[Mock API] Intercepting failed request to ${error.config.url}`);
        const mockResponse = await mockApiHandler(error.config);
        
        if (mockResponse) {
          console.log(`[Mock API] Returning mock data for ${error.config.url}`);
          return Promise.resolve(mockResponse);
        }
      } catch (mockError) {
        console.warn('[Mock API] Error generating mock response:', mockError);
      }
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
