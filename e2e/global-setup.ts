/**
 * Playwright Global Setup
 *
 * Runs ONCE before all test suites to:
 * 1. Accept cookie banner (saves to storageState.json)
 * 2. Sets up authentication state if needed
 *
 * This eliminates the need to handle cookie banner in every test!
 */

import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Accept cookies using the data-testid
    const acceptButton = page.getByTestId('cookie-accept-all');
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    await acceptButton.click();

    await page.waitForFunction(
      () => {
        try {
          const raw = localStorage.getItem('cookie-consent');
          const timestamp = localStorage.getItem('cookie-consent-timestamp');
          return (
            raw !== null &&
            JSON.parse(raw).analytics === true &&
            timestamp !== null &&
            !Number.isNaN(new Date(timestamp).getTime())
          );
        } catch {
          return false;
        }
      },
      { timeout: 5000 },
    );

    // biome-ignore lint/suspicious/noConsole: Setup logging for test diagnostics
    console.log('✅ Cookie consent accepted with a valid timestamp');

    // Save storage state (includes localStorage with cookie consent)
    await context.storageState({ path: 'playwright/.auth/storageState.json' });
    // biome-ignore lint/suspicious/noConsole: Setup logging for test diagnostics
    console.log('✅ Storage state saved to playwright/.auth/storageState.json');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
