import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/static/frontend/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: '../backend/static/frontend',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'framer-motion', 'react-hot-toast'],
          'charts': ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
