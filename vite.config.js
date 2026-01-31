import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/student-batches': {
        target: 'http://192.168.1.20:5151',
        changeOrigin: true,
        secure: false,
      },
      '/api/attendance': {
        target: 'http://192.168.1.20:5151',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://192.168.1.20:5151',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://192.168.1.22:8081',
        changeOrigin: true,
        secure: false,
      },
      '/student': {
        target: 'http://192.168.1.22:8081',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://192.168.1.22:8081',
        changeOrigin: true,
        secure: false,
      },
      '/library': {
        target: 'http://localhost:9191',
        changeOrigin: true,
        secure: false,
        bypass: (req, res, options) => {
          if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
            return req.url;
          }
        }
      }
    }
  }
})
