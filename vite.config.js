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
      /* ---------------- AUTH & IDENTITY SERVICE (5151) ---------------- */
      "/auth": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api-identity": {
        target: "http://100.83.30.12:5151",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-identity/, "")
      },

      /* ---------------- FUNCTIONAL MANAGEMENT SERVICE (5151) ---------------- */
      // Specific mappings for individual root paths
      "/api/instructor": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/courses": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/topics": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/batches": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/exams": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/questions": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/attendance": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/api/v1": { target: "http://100.83.30.12:5151", changeOrigin: true },

      // Catch-all for any other /api calls
      "/api": {
        target: "http://100.83.30.12:5151",
        changeOrigin: true
      },

      "/uploads": { target: "http://100.83.30.12:5151", changeOrigin: true },
      "/images": { target: "http://100.83.30.12:5151", changeOrigin: true },

      /* Removed generic /admin proxy as it collides with frontend routes */
    }
  }
});