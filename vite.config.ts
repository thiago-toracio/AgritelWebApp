import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load environment variables based on the current mode (e.g., 'production' loads .env.production)
  const env = loadEnv(mode, process.cwd(), "");

  // Set VITE_MOCK_DISABLED based on the mode.
  // It's ALWAYS 'true' (mock disabled/real API used) if mode is NOT 'development'.
  // Otherwise, it relies on the value defined in the .env file (defaults to 'false' if missing).
  const mockDisabled =
    mode === "production" ? "true" : env.VITE_MOCK_DISABLED ?? "false";

  const defaultConfig = {
    base: "/reactapp/monitoramento-online",
    plugins: [
      react(),
      // The componentTagger plugin runs only in development mode.
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        // Alias '@' to the './src' directory for cleaner imports
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Injects the resolved string value into the client-side code (import.meta.env)
      "import.meta.env.VITE_MOCK_DISABLED": JSON.stringify(mockDisabled),
    },
  };

  if (command === "serve") {
    // Configuration specific for the Development Server (npm run dev)
    return {
      ...defaultConfig,
      server: {
        host: "::",
        port: 8080,
        open: "/reactapp/monitoramento-online",
        // Proxy is only needed in development to forward /api calls to the backend (to avoid CORS)
        proxy: {
          "/api": {
            target: env.VITE_API_TARGET || "https://localhost:44348",
            secure: false,
            changeOrigin: true,
          },
        },
      },
    };
  } else {
    // Configuration specific for the Build Process
    return {
      ...defaultConfig,
      // Uses VITE_BUILD_BASE from the environment file
      base: env.VITE_BUILD_BASE || "/reactapp/monitoramento-online",

      // ADICIONE ESTE BLOCO BUILD:
      build: {
        // Limpa a pasta de saida antes de gerar novos arquivos
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: "assets/index.js",

            chunkFileNames: "assets/[name].js",

            assetFileNames: (assetInfo) => {
              if (!assetInfo.name) {
                return "assets/[name].[ext]";
              }
              const extType = assetInfo.name.split(".").pop() || "";
              if (/css/i.test(extType)) {
                return "assets/index.css";
              }
              return "assets/[name].[ext]";
            },
          },
        },
      },
    };
  }
});
