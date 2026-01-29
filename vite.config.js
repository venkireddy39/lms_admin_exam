import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/student-batches': {
        target: 'http://192.168.1.20:5151', // Corrected: StudentBatchController is in Main LMS (5151)
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://192.168.1.20:5151', // Gateway / Other Modules
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
      '/users': {
        target: 'http://192.168.1.22:8081',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://192.168.1.20:5151',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            delete proxyRes.headers['x-frame-options'];
          });
        }
      },
      '/library': {
        target: 'http://localhost:9191', // Library backend on local laptop
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
