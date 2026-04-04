import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // Use the existing hand-crafted sw.js for offline capabilities
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      injectManifest: {
        injectionPoint: undefined, // sw.js handles its own caching
      },
      manifest: {
        name: "Mitra - Smart Fishing Assistant",
        short_name: "Mitra",
        description: "Offline-first marine safety and fishing navigation app for Indian fishermen.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0f1a",
        theme_color: "#0ea5e9",
        orientation: "portrait",
        categories: ["navigation", "utilities"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/favicon.png",
            sizes: "64x64",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
