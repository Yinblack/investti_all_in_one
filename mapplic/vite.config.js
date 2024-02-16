import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "mapplic.[ext]",
        entryFileNames: "mapplic.js",
        chunkFileNames: "mapplic.js"
      }
    }
  },
  server: { port: 1100 },
  plugins: [react()]
})