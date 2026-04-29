// filepath: [vite.config.js](http://_vscodecontentref_/0)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  
  build: {
    outDir: 'dist',
  },
  
  // Solo para desarrollo
  server: {
    port: process.env.PORT || 5173,
    host: true, // Para Docker/containers
    open: true,
    proxy: {
      '/projects': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/blog': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/subcategories': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/subscribers': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/search': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  
  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
// trigger deploy
// trigger
// Deploy
