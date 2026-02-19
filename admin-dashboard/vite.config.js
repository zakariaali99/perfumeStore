import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/static/admin/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: '../backend/static/admin',
    emptyOutDir: true,
  }
})
