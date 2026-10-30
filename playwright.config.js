import { defineConfig, devices } from '@playwright/test'

// Dedicated dev server for the e2e suite. It never reuses an existing server
// (e.g. one on 5173) and bakes in a short, nonzero dummy-API delay so the
// loading-indicator scenarios are observable but the suite stays fast.
const PORT = 5199
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_DUMMY_API_DELAY_MS: '300' },
  },
})
