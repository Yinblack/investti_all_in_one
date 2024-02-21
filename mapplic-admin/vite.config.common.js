import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default {
  plugins: [react()],
  server: {
    port: process.env.PORT || 2024,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_CALLS,
        changeOrigin: true,
      },
    },
  },
};