import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel - with proper test isolation */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Selective retry logic - only retry genuinely flaky tests */
  retries: process.env.CI ? 2 : 0,
  /* Optimal worker count for parallel execution */
  workers: process.env.CI ? 2 : 4,
  /* Enhanced reporting */
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  /* Timeout configuration */
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Enhanced trace collection */
    trace: 'retain-on-failure',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: 'retain-on-failure',

    /* Enhanced action timeout */
    actionTimeout: 15000,

    /* Navigation timeout */
    navigationTimeout: 30000,
  },

  /* Configure projects for comprehensive browser compatibility testing */
  projects: [
    // Desktop Browsers - Full Test Suite
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-iframes-display-none-removal',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-timer-throttling',
            '--no-sandbox',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'media.navigator.permission.disabled': true,
          },
        },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile Browsers - Core Functionality Tests
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: ['**/calculator.spec.ts', '**/layout-integrity.spec.ts'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
      testMatch: ['**/calculator.spec.ts', '**/layout-integrity.spec.ts'],
    },

    // Edge Browser Compatibility - Disabled until msedge is installed
    // {
    //   name: 'edge',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'msedge',
    //   },
    //   testMatch: ['**/calculator.spec.ts'],
    // },

    // Legacy/Compatibility Testing
    {
      name: 'chrome-slow-3g',
      use: {
        ...devices['Desktop Chrome'],
        // Network throttling is handled at the CDP level, not context level
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
        },
      },
      testMatch: ['**/calculator.spec.ts'],
    },
  ],

  /* Enhanced dev server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes startup timeout
    env: {
      NODE_ENV: 'test',
    },
  },

  /* Global setup and teardown */
  globalSetup: undefined, // Add if needed
  globalTeardown: undefined, // Add if needed
});
