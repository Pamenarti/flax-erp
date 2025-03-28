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
        pathRewrite: { '^/api': '/api' },
        logLevel: 'debug',
        onProxyReq(proxyReq, req, res) {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${BACKEND_URL}${proxyReq.path}`);
        },
        onError(err, req, res) {
          console.error(`[Proxy Error] ${req.method} ${req.url}: ${err.message}`);
          // Proxy hatası durumunda fallback yanıt
          if (req.url.includes('/api/modules')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([
              {
                code: 'core',
                name: 'Çekirdek Sistem',
                description: 'Temel sistem bileşenleri',
                version: '1.0.0',
                isActive: true,
                isCore: true
              }
            ]));
          } else {
            res.writeHead(500);
            res.end('Proxy Error: ' + err.message);
          }
        }
      }
    }
  }
});
