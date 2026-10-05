import { defineConfig, devices } from '@playwright/test';

// Los specs E2E corren contra el dev server de Vite (puerto 5173). Las llamadas al
// backend se interceptan con page.route en los helpers, así que no se necesita el
// servidor Express ni la base de datos para el MVP.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  // Vite dev compila el grafo (three.js, r3f, drei...) on-demand en la primera
  // carga; ese arranque en frío puede tardar bastante. Timeouts holgados lo absorben.
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    navigationTimeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
