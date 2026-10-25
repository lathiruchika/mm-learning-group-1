import { defineConfig, devices } from '@playwright/test'

// A dedicated port so the suite never collides with a dev server you already
// have running on 5173, and always runs the app in dummy (localStorage) mode.
const PORT = 5199

export default defineConfig({
  testDir: './tests',
  // Only the e2e specs; tests/unit/*.test.js belong to the Node test runner.
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: { VITE_API_MODE: 'dummy' },
  },
})
