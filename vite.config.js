import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Read secrets only in the Node/Vite process. Never expose EDUBRIDGE_API_KEY
  // through import.meta.env or a VITE_ prefixed variable.
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.EDUBRIDGE_API_TARGET || 'http://127.0.0.1:8000';
  const apiKey = env.EDUBRIDGE_API_KEY || '';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/edubridge': {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/edubridge/, '/api/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) proxyReq.setHeader('X-API-Key', apiKey);
            });
          },
        },
      },
    },
  };
});
