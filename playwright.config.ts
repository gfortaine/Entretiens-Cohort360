import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration
 * Cohort360 Prescription App - Full-stack testing
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /**
   * Web servers started before tests
   * 
   * For boilerplate:
   * - Frontend only: Set PLAYWRIGHT_API_OPTIONAL=1 to skip backend
   * - Full-stack: Both servers required (default)
   */
  webServer: [
    // Backend API (optional for frontend-only testing)
    ...(process.env.PLAYWRIGHT_API_OPTIONAL ? [] : [{
      command: 'cd apps/api && uv run python manage.py runserver 8000',
      url: 'http://127.0.0.1:8000/admin/',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }]),
    // Frontend
    {
      command: 'cd apps/web && npm run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
