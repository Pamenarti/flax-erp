/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // API sunucu URL'si
      },
    ];
  },
  // API anahtarlarını istemci tarafından erişilebilir yap
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
