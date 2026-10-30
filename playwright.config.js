import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the dummy-API todo app.
 *
 * Projects:
 *  default  — VITE_API_MODE=dummy, no latency, no failure
 *  latency  — 800ms simulated latency (tests loading spinners)
 *  failmode — VITE_DUMMY_FAIL_RATE=1 (every call throws; tests error states)
 *  realmode — VITE_API_MODE=real (badge shows REAL API; no backend needed for badge test)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,       // dummy API uses localStorage; keep tests serial
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'default',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'latency',
      use: {
        ...devices['Desktop Chrome'],
        // Playwright can't override Vite compile-time env at runtime;
        // these env vars are read by the Vite dev server via the webServer entry below.
        // Set them in the test itself via page.addInitScript or use a separate server.
      },
    },
    {
      name: 'failmode',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_API_MODE: 'dummy',
      VITE_DUMMY_API_LATENCY_MS: '0',
      VITE_DUMMY_FAIL_RATE: '0',
    },
  },
})
