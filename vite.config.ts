import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
<<<<<<< HEAD
    port: 5173,
    strictPort: false,
=======
    host: "::",
    port: 8080,
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    hmr: {
      overlay: false,
    },
  },
<<<<<<< HEAD
  plugins: [
    react(), 
    // mode === "development" && componentTagger()
  ].filter(Boolean),
=======
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
