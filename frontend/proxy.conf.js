module.exports = {
  '/api': {
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxy: ${req.method} ${req.url} -> http://localhost:3000${proxyReq.path}`);
    }
  }
};
