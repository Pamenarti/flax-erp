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
  
  console.log(`[Mock API] Handling ${method} ${url}`);
  
  // API endpoint'lerine göre mock yanıtlar
  
  // Modüller API
  if (url.match(/\/modules\/active$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: getDefaultModules().filter(module => module.isActive),
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  if (url.match(/\/modules$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: getDefaultModules(),
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  if (url.match(/\/modules\/[a-zA-Z0-9-]+\/toggle$/i) && method === 'put') {
    const moduleId = url.split('/').pop().replace('/toggle', '');
    const modules = getDefaultModules();
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex !== -1) {
      modules[moduleIndex].isActive = !modules[moduleIndex].isActive;
      return {
        status: 200,
        statusText: 'OK',
        data: modules[moduleIndex],
        headers: {
          'content-type': 'application/json'
        }
      };
    }
  }
  
  // Sağlık kontrolü
  if (url.match(/\/health$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: {
        status: 'ok',
        uptime: 12345,
        timestamp: new Date().toISOString(),
        environment: 'development'
      },
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  // Kullanıcılar API
  if (url.match(/\/users$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
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
      ],
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  // Ürünler API
  if (url.match(/\/products$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: [
        {
          id: '1',
          code: 'P001',
          name: 'Ürün 1',
          description: 'Test ürünü 1',
          purchasePrice: 100,
          salePrice: 150,
          unit: 'adet',
          minimumStockLevel: 10,
          currentStock: 5,
          category: 'Elektronik',
          isActive: true
        },
        {
          id: '2',
          code: 'P002',
          name: 'Ürün 2',
          description: 'Test ürünü 2',
          purchasePrice: 200,
          salePrice: 250,
          unit: 'adet',
          minimumStockLevel: 5,
          currentStock: 15,
          category: 'Elektronik',
          isActive: true
        },
        {
          id: '3',
          code: 'P003',
          name: 'Ürün 3',
          description: 'Test ürünü 3',
          purchasePrice: 300,
          salePrice: 350,
          unit: 'kg',
          minimumStockLevel: 20,
          currentStock: 0,
          category: 'Gıda',
          isActive: true
        }
      ],
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  if (url.match(/\/products\/low-stock$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: [
        {
          id: '1',
          code: 'P001',
          name: 'Ürün 1',
          description: 'Test ürünü 1',
          purchasePrice: 100,
          salePrice: 150,
          unit: 'adet',
          minimumStockLevel: 10,
          currentStock: 5,
          category: 'Elektronik',
          isActive: true
        },
        {
          id: '3',
          code: 'P003',
          name: 'Ürün 3',
          description: 'Test ürünü 3',
          purchasePrice: 300,
          salePrice: 350,
          unit: 'kg',
          minimumStockLevel: 20,
          currentStock: 0,
          category: 'Gıda',
          isActive: true
        }
      ],
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  if (url.match(/\/products\/categories$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: ['Elektronik', 'Gıda', 'Kırtasiye'],
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  // Stok hareketleri API
  if (url.match(/\/stock-movements$/i) && method === 'get') {
    return {
      status: 200,
      statusText: 'OK',
      data: [
        {
          id: '1',
          productId: '1',
          product: {
            id: '1',
            name: 'Ürün 1',
            unit: 'adet'
          },
          movementType: 'purchase',
          quantity: 10,
          documentNumber: 'FT-001',
          notes: 'İlk stok girişi',
          unitPrice: 100,
          date: new Date(Date.now() - 86400000).toISOString() // 1 gün önce
        },
        {
          id: '2',
          productId: '1',
          product: {
            id: '1',
            name: 'Ürün 1',
            unit: 'adet'
          },
          movementType: 'sale',
          quantity: 5,
          documentNumber: 'ST-001',
          notes: 'Satış',
          unitPrice: 150,
          date: new Date().toISOString()
        },
        {
          id: '3',
          productId: '2',
          product: {
            id: '2',
            name: 'Ürün 2',
            unit: 'adet'
          },
          movementType: 'purchase',
          quantity: 15,
          documentNumber: 'FT-002',
          notes: 'Stok girişi',
          unitPrice: 200,
          date: new Date(Date.now() - 172800000).toISOString() // 2 gün önce
        }
      ],
      headers: {
        'content-type': 'application/json'
      }
    };
  }
  
  // Mock yanıt bulunamadı
  return null;
};
