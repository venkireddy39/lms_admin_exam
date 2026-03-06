import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-bootstrap",
            "bootstrap",
            "react-router-dom",
            "axios",
            "react-toastify"
          ],
          pdfutils: ["html2canvas", "jspdf"],
          charts: ["recharts"],
          icons: ["react-icons", "lucide-react"]
        }
      }
    }
  },

  server: {
    port: 5173,
    host: true,

    proxy: {

      // AUTH + ADMIN SERVICE (8081)
      "/admin": {
        target: "http://192.168.1.24:8081",
        changeOrigin: true,
        secure: false
      },

      "/auth": {
        target: "http://192.168.1.24:8081",
        changeOrigin: true,
        secure: false
      },

      "/api-identity": {
        target: "http://192.168.1.24:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-identity/, "")
      },


      // FEE MANAGEMENT SERVICE (LOCAL 3130)
      "/api/fee-management": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/fee-types": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/fee-structures": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/fee-allocations": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/fee": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/student/payment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/admin/installment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/admin/early-payment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/admin/settings": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/payments": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },

      "/api/v1": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true,
        secure: false
      },


      // MANAGEMENT SERVICE (5151 → 192.168.1.63)
      "/api/attendance": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/courses": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/batches": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/student-batches": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/sessions": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/student-batch-transfers": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/certificates": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/exams": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/topics": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/api/topic-contents": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },


      // STATIC FILES
      "/uploads": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },

      "/images": {
        target: "http://192.168.1.63:5151",
        changeOrigin: true,
        secure: false
      },


      // LIBRARY SERVICE (9191)
      "/api/v1/library": {
        target: "http://127.0.0.1:9191",
        changeOrigin: true,
        secure: false
      }

    }
  }
});