import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Mirrors what the Ingress does in the cluster (manifests/kairos/50-ingress.yaml):
    // /api and /socket.io go to the backend, everything else is served by this dev
    // server. Keeping the two in sync is what lets one build run in both places.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // No rewrite: the backend now owns the /api prefix itself (setGlobalPrefix).
      },
      // WebSocket transport. socket.io always connects to <origin>/socket.io/, so
      // without this the dev server would answer the upgrade itself and the
      // '/meetings' namespace would never reach Nest.
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
