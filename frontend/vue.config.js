const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const fs = require('fs');

// .env dosyasını manuel olarak yükleyelim
let envPath = path.resolve(__dirname, '../.env');
let env = {};

if (fs.existsSync(envPath)) {
  console.log(`.env dosyası bulundu: ${envPath}`);
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    // Boş satırları ve açıklamaları atlayalım
    if (!line || line.startsWith('#')) return;
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
} else {
  console.warn(`.env dosyası bulunamadı, varsayılan değerler kullanılacak.`);
}

// Varsayılan değerler
const BACKEND_URL = env.BACKEND_URL || 'http://localhost:3000';
const FRONTEND_PORT = env.FRONTEND_PORT || 8080;

console.log(`Frontend port: ${FRONTEND_PORT}`);
console.log(`Backend URL: ${BACKEND_URL}`);

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' }, // Aynı path'i koruyoruz
        secure: false,
        logLevel: 'debug',
        bypass: function(req, res, proxyOptions) {
          console.log('Proxy request:', req.method, req.url);
        },
        onProxyRes: function(proxyRes, req, res) {
          console.log('Proxy response:', proxyRes.statusCode, req.url);
        },
        onError: function (err, req, res) {
          console.error('Proxy error:', err);
          
          // Özel modül endpoint hataları için fallback yanıtlar
          if (req.url.includes('/modules')) {
            console.log('Providing fallback data for module request:', req.url);
            
            // active endpoint için
            if (req.url.includes('/modules/active')) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([
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
                  description: 'Kullanıcı yönetimi',
                  version: '1.0.0',
                  isActive: true,
                  isCore: true
                }
              ]));
              return;
            }
            
            // genel modules endpoint için
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([
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
                description: 'Kullanıcı yönetimi',
                version: '1.0.0',
                isActive: true,
                isCore: true
              },
              {
                code: 'inventory',
                name: 'Stok Yönetimi',
                description: 'Envanter ve stok yönetimi',
                version: '1.0.0',
                isActive: false,
                isCore: false,
                dependencies: ['core']
              }
            ]));
            return;
          }
          
          // Diğer API hatalarında standard hata yanıtı döndür
          res.writeHead(500);
          res.end('Proxy Error: ' + err.message);
        }
      }
    }
  }
});
