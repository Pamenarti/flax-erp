/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:3000/:path*',
      },
    ];
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    API_MOCK_ENABLED: 'true'
  },
  // Hata mesajlarını daha okunabilir hale getir
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      // Üretimde kullanılmayacak ekstra webpack ayarları
      config.devtool = 'eval-source-map';
    }
    return config;
  },
}

module.exports = nextConfig
