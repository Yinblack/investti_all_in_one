import { defineConfig } from 'vite';
import commonConfig from './vite.config.common';

export default defineConfig({
  ...commonConfig,
  base: '',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        assetFileNames: 'admin/mapplic-admin.[ext]',
        entryFileNames: 'admin/mapplic-admin.js',
        chunkFileNames: 'admin/[name].js'
      }
    }
  },
});