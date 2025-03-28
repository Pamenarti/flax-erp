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
    API_MOCK_ENABLED: 'true' // Bu değeri 'true' olarak değiştirdik
  },
}

module.exports = nextConfig
