import axios from 'axios';

// API client yapılandırması
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// İstek interceptor'ları
apiClient.interceptors.request.use(
  config => {
    console.log(`API İsteği: ${config.method.toUpperCase()} ${config.url}`);
    
    // Auth token eklenebilir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ları
apiClient.interceptors.response.use(
  response => {
    console.log(`API Yanıtı: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error('API Yanıt Hatası:', error);
    
    // 404 hataları için fallback mekanizması
    if (error.response && error.response.status === 404) {
      const url = error.config.url;
      
      // Modül API'si için fallback
      if (url.includes('/api/modules')) {
        console.log('Modül API 404, fallback kullanılıyor...');
        
        // Temel modüller için fallback veri
        return Promise.resolve({
          data: [
            {
              code: 'core',
              name: 'Çekirdek Sistem',
              description: 'Temel sistem bileşenleri',
              version: '1.0.0',
              isActive: true,
              isCore: true
            },
            {
              code: 'users',
              name: 'Kullanıcı Yönetimi',
              description: 'Kullanıcı hesapları ve yetkilendirme',
              version: '1.0.0',
              isActive: true,
              isCore: true,
              dependencies: ['core']
            }
          ]
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
