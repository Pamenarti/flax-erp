const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3333;

// CORS ve JSON desteği
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Temel modül verileri
const modules = [
  {
    code: 'core',
    name: 'Çekirdek Sistem',
    description: 'Temel sistem bileşenleri ve gösterge paneli',
    version: '1.0.0',
    isActive: true,
    isCore: true,
    dependencies: []
  },
  {
    code: 'users',
    name: 'Kullanıcı Yönetimi',
    description: 'Kullanıcı hesapları ve yetkilendirme',
    version: '1.0.0',
    isActive: true,
    isCore: true,
    dependencies: ['core']
  },
  {
    code: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve stok hareketleri',
    version: '1.0.0',
    isActive: false,
    isCore: false,
    dependencies: ['core']
  }
];

// Aktif modüller
const activeModules = modules.filter(m => m.isActive);

// API endpoint'leri
app.get(['/api/modules', '/modules'], (req, res) => {
  res.json(modules);
});

app.get(['/api/modules/active', '/modules/active'], (req, res) => {
  res.json(activeModules);
});

app.post(['/api/modules/:id/enable', '/modules/:id/enable'], (req, res) => {
  const id = req.params.id;
  res.json({
    success: true,
    message: `"${id}" modülü etkinleştirilmek üzere işaretlendi.`
  });
});

app.post(['/api/modules/:id/disable', '/modules/:id/disable'], (req, res) => {
  const id = req.params.id;
  res.json({
    success: true,
    message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi.`
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Catch-all route
app.all('*', (req, res) => {
  console.log(`Bilinmeyen istek: ${req.method} ${req.url}`);
  
  // Modül istekleri için otomatik yanıt
  if (req.url.includes('modules')) {
    if (req.url.includes('active')) {
      return res.json(activeModules);
    }
    return res.json(modules);
  }
  
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`API Test Sunucusu başlatıldı: http://localhost:${PORT}`);
  console.log(`Modüller endpoint: http://localhost:${PORT}/api/modules`);
  console.log(`Aktif modüller endpoint: http://localhost:${PORT}/api/modules/active`);
});
