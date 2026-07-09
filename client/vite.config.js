import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        // Split large, stable third-party libs into their own chunks so a code
        // change to the app doesn't invalidate the whole vendor bundle in caches.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          apollo: ["@apollo/client", "graphql"],
          charts: ["chart.js", "react-chartjs-2"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
