import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendors';
            }
            if (id.includes('firebase')) {
              return 'firebase-chunk';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux-vendors';
            }
            if (id.includes('react-router-dom')) {
              return 'router-chunk';
            }
            if (id.includes('lightweight-charts')) {
              return 'charts-chunk';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 700, 
  }
});
