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

      /* ---------------- AFFILIATE SERVICE (2003) ---------------- */

      "/api/admin/affiliates": {
        target: "http://localhost:2003",
        changeOrigin: true
      },
      "/api/admin/affiliate-links": {
        target: "http://localhost:2003",
        changeOrigin: true
      },
      "/api/admin/leads": {
        target: "http://localhost:2003",
        changeOrigin: true
      },
      "/api/admin/sales": {
        target: "http://localhost:2003",
        changeOrigin: true
      },
      "/api/affiliates": {
        target: "http://localhost:2003",
        changeOrigin: true
      },

      /* ---------------- FEE MANAGEMENT (3130) ---------------- */

      "/api/fee-management": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/fee-types": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/fee-structures": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/fee-allocations": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/payments": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/student/payment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/admin/installment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/admin/early-payment": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/admin/settings": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },
      "/api/v1/fee-management": {
        target: "http://127.0.0.1:3130",
        changeOrigin: true
      },

      /* ---------------- LIBRARY SERVICE (9191) ---------------- */

      "/api/v1/library": {
        target: "http://127.0.0.1:9191",
        changeOrigin: true
      },

      /* ---------------- AUTH SERVICE (8081) ---------------- */

      "/auth": {
        target: "http://192.168.1.22:8081",
        changeOrigin: true
      },
      "/api-identity": {
        target: "http://192.168.1.22:8081",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-identity/, "")
      },

      /* ---------------- MANAGEMENT SERVICE (5151) ---------------- */

      "/api/attendance": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/courses": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/batches": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/student-batches": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/sessions": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/student-batch-transfers": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/certificates": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/exams": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/topics": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/api/topic-contents": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },

      "/uploads": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },
      "/images": {
        target: "http://192.168.1.27:5151",
        changeOrigin: true
      },

      /* ---------------- ADMIN CATCH ALL (LAST) ---------------- */

      "/admin": {
        target: "http://192.168.1.22:8081",
        changeOrigin: true,
        bypass: (req, res, proxyOptions) => {
          if (req.headers.accept.indexOf("html") !== -1) {
            return "/index.html";
          }
        }
      }

    }
  }
});