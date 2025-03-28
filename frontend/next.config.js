/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use localhost for development, but let Docker use backend service name
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/:path*'
          : 'http://backend:3000/:path*',
      },
    ];
  },
  // Docker için performans ve izin sorunlarını çözen ayarlar
  swcMinify: true,
  experimental: {
    // RAM disk kullanımını devre dışı bırak
    esmExternals: 'loose',
  },
  onDemandEntries: {
    // Sayfaları bellekte daha uzun süre tut
    maxInactiveAge: 60 * 60 * 1000, // 1 saat
    pagesBufferLength: 5,
  },
  // Optimizasyonları geliştirme ortamında devre dışı bırak
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
