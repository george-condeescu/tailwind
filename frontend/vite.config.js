import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Redirecționează orice cerere care începe cu /pdfuri către Backend
      '/pdfuri': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Dacă ai și rute de API (ex: /api/documents)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  test: {
    globals: true,           // permite folosirea 'describe', 'it' fără import
    environment: 'jsdom',    // simulează mediul de browser
    setupFiles: './src/setupTests.js', // fișier pentru configurări globale
  },
})
