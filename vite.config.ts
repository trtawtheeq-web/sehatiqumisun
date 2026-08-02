import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

export default defineConfig({
  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3010",
        changeOrigin: true,
      },
    },
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"), // Set root to client folder
  build: {
    outDir: "../dist", // Output to dist folder in project root
    emptyOutDir: true,
  },
});
