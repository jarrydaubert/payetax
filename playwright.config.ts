import { defineConfig, devices } from '@playwright/test';

const DEFAULT_PLAYWRIGHT_PORT = 3100;
const DEFAULT_PLAYWRIGHT_BASE_URL = `http://localhost:${DEFAULT_PLAYWRIGHT_PORT}`;

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 *
 * Key design decisions:
 * - Workers: 1 in CI for stability (Playwright recommendation), 50% locally for speed
 * - Sharding: Uses blob reporter in CI for merged reports across shards
 * - Security: No --disable-web-security (tests real-world CORS behavior)
 * - baseURL: Environment-driven for preview deploys and staging
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './audit-outputs/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Playwright recommends workers: 1 in CI for stability; use sharding for parallelism
  workers: process.env.CI ? 1 : '50%',

  // Reporting: Use blob in CI for shard merging, HTML locally
  // After CI run: bunx playwright merge-reports --reporter html ./audit-outputs/blob-report
  reporter: process.env.CI
    ? [['blob', { outputDir: 'audit-outputs/blob-report' }], ['github']]
    : [['html', { outputFolder: 'audit-outputs/playwright-report' }]],

  timeout: 60000,
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixels: 50,
      maxDiffPixelRatio: 0.001,
    },
  },

  // Sharding for CI parallelism across jobs
  shard:
    process.env.CI && process.env.PLAYWRIGHT_SHARD
      ? { total: 6, current: Number(process.env.PLAYWRIGHT_SHARD) }
      : undefined,

  use: {
    // Environment-driven baseURL for preview deploys, staging, etc.
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_PLAYWRIGHT_BASE_URL,
    storageState: 'playwright/.auth/storageState.json',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Desktop Chrome - Primary browser
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-features=TranslateUI',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-timer-throttling',
            // --no-sandbox only in CI (Docker/container environments)
            ...(process.env.CI ? ['--no-sandbox'] : []),
          ],
        },
      },
    },

    // WebKit (Safari engine)
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile Chrome - Critical paths only
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: [
        '**/smoke.spec.ts',
        '**/calculator-critical.spec.ts',
        '**/director-guide-critical.spec.ts',
        '**/payslip-regression.spec.ts',
        '**/golden-master-PERFECT.spec.ts',
      ],
    },

    // Mobile Safari - Critical paths only
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
      testMatch: [
        '**/smoke.spec.ts',
        '**/calculator-critical.spec.ts',
        '**/director-guide-critical.spec.ts',
        '**/payslip-regression.spec.ts',
        '**/golden-master-PERFECT.spec.ts',
      ],
    },

    // Network throttling project removed - browser args alone don't throttle
    // For slow network testing, use CDP in test: page.context().newCDPSession()
    // then: cdp.send('Network.emulateNetworkConditions', {...})
  ],

  webServer: {
    command: 'bun run build && bun run start',
    url: process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_PLAYWRIGHT_BASE_URL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'production',
      PORT: String(DEFAULT_PLAYWRIGHT_PORT),
    },
  },

  // Global setup for cookie consent - runs once before all tests
  // Note: Playwright recommends setup projects for better tracing/reporting,
  // but globalSetup is simpler for cookie consent only
  globalSetup: './e2e/global-setup.ts',
});
