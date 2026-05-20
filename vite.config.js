import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), legacy({
    targets: ["defaults", "not IE 11", "chrome >= 45", "safari >= 9", "firefox >= 52", "android >= 4.4", "samsung >= 6"],
    modernPolyfills: true,
    renderLegacyChunks: true,
  })],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-dom/client"],
          motion: ["framer-motion"],
          charts: ["recharts"],
        },
      },
    },
  },
});
