import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  reporter: [['html', { outputFolder: 'report' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL || 'https://app.crew-ai.me',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Guest (unauthenticated)
    { name: 'chromium-guest', use: { ...devices['Desktop Chrome'] } },
    // Authenticated (injected token from global-setup)
    {
      name: 'chromium-authed',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    // Mobile guest
    { name: 'mobile-guest', use: { ...devices['Pixel 5'] } },
    // Setup project (runs global-setup)
    { name: 'setup', testMatch: /global\.setup\.ts/ },
  ],
})
