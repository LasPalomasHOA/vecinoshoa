import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { handleApiRequest } from './api/_lib/router';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const handled = await handleApiRequest(req, res);
            if (!handled) {
              next();
            }
          } catch (err) {
            console.error('[Vite Dev API Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Error interno en API dev server' }));
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
});
