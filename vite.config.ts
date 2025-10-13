import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Set default for VITE_MOCK_ENABLED based on command
  // dev: true (use mock), build: false (use real API)
  const mockEnabled = env.VITE_MOCK_ENABLED ?? (command === 'serve' ? 'true' : 'false');
  
  const defaultConfig = {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_MOCK_ENABLED': JSON.stringify(mockEnabled),
    },
  };

  if (command === 'serve') {
    // Development configuration
    return {
      ...defaultConfig,
      server: {
        host: "::",  // Required for Lovable
        port: 8080,  // Required for Lovable
        proxy: {
          '/api': {
            target: env.VITE_API_TARGET || 'https://localhost:44348',
            secure: false,
            changeOrigin: true,
          },
        },
      },
    };
  } else {
    // Build configuration
    return {
      ...defaultConfig,
      base: env.VITE_BUILD_BASE || '/',
    };
  }
});
