import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // En desarrollo, usar siempre localhost:3000; en producción usar BACKEND_URL.
  // Fallback a localhost:3000 para poder correr `preview` en local contra el
  // backend levantado con tsx (ver script preview:full).
  const backendTarget =
    mode === "development"
      ? "http://localhost:3000"
      : env.BACKEND_URL || "http://localhost:3000";

  // El proxy /api se comparte entre el server de dev y el de preview, porque
  // `vite preview` no hereda la config de `server`.
  const apiProxy = {
    "/api": {
      target: backendTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ""),
    },
  };

  return {
    plugins: [react()],
    server: {
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
    test: {
      // Los specs E2E (tests/e2e) los corre Playwright, no Vitest.
      exclude: [...configDefaults.exclude, "tests/e2e/**"],
      coverage: {
        provider: 'v8',
        exclude: [
          '**/EscenarioController.ts',
          '**/ProgresoController.ts',
          '**/RedController.ts',
          '**/EscenarioBuilder.ts',
          '**/FirewallBuilder.ts',
          '**/apiConfig.ts',
        ],
      },
    },
  };
});
