import { getDefaultModules } from './modules-mock';

/**
 * API isteklerini taklit eden mock handler
 * @param {Object} config - Axios istek konfigürasyonu
 * @returns {Promise<Object|null>} Mock yanıt veya null
 */
export const mockApiHandler = async (config) => {
  // URL'den endpoint'i al
  const url = config.url || '';
  const method = config.method?.toLowerCase() || 'get';
  
  console.log(`[Mock API] Generating response for ${method} ${url}`);
  
  // URL'deki path parametrelerini temizle
  let cleanUrl = url.replace(/^\/api\//, '/');
  
  // API endpoint'lerine göre mock yanıtlar
  
  // Modüller API
  if (cleanUrl.match(/^\/modules\/active$/i) && method === 'get') {
    console.log('[Mock API] Returning active modules');
    return {
      data: getDefaultModules().filter(module => module.isActive)
    };
  }
  
  if (cleanUrl.match(/^\/modules$/i) && method === 'get') {
    console.log('[Mock API] Returning all modules');
    return {
      data: getDefaultModules()
    };
  }
  
  if (cleanUrl.match(/^\/modules\/[a-zA-Z0-9-]+\/toggle$/i) && method === 'put') {
    const moduleId = cleanUrl.split('/').pop().replace('/toggle', '');
    console.log(`[Mock API] Toggling module with ID: ${moduleId}`);
    
    const modules = getDefaultModules();
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex !== -1) {
      modules[moduleIndex].isActive = !modules[moduleIndex].isActive;
      return {
        data: modules[moduleIndex]
      };
    }
  }
  
  // Sağlık kontrolü
  if (cleanUrl.match(/^\/health$/i) && method === 'get') {
    return {
      data: {
        status: 'ok',
        uptime: 12345,
        timestamp: new Date().toISOString(),
        environment: 'development'
      }
    };
  }
  
  // Kullanıcılar API
  if (cleanUrl.match(/^\/users$/i) && method === 'get') {
    return {
      data: [
        {
          id: '1',
          email: 'admin@flaxerp.com',
          firstName: 'Admin',
          lastName: 'User',
          roles: ['admin'],
          isActive: true
        },
        {
          id: '2',
          email: 'user@flaxerp.com',
          firstName: 'Normal',
          lastName: 'User',
          roles: ['user'],
          isActive: true
        },
        {
          id: '3',
          email: 'manager@flaxerp.com',
          firstName: 'Manager',
          lastName: 'User',
          roles: ['user', 'manager'],
          isActive: true
        }
      ]
    };
  }
  
  // Mock yanıt bulunamadı
  console.warn(`[Mock API] No mock handler found for ${method} ${url}`);
  return null;
};
