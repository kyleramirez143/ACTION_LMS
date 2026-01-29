import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirect requests starting with /api to the backend running on port 5000
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false, // Set to true for HTTPS
      },
      '/uploads': 'http://localhost:5000',
    },
  },
})
