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
    await page.waitForTimeout(1500);

    // Accept cookies using the data-testid
    const acceptButton = page.getByTestId('cookie-accept-analytics');
    if (await acceptButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(500);

      // Verify cookie consent was saved to localStorage
      const consent = await page.evaluate(() => localStorage.getItem('cookie-consent'));
      if (consent === 'accepted') {
        // biome-ignore lint/suspicious/noConsole: Setup logging for test diagnostics
        console.log('✅ Cookie consent accepted and saved to localStorage');
      } else {
        console.warn('⚠️  Cookie consent not saved (might be okay for some tests)');
      }
    } else {
      // biome-ignore lint/suspicious/noConsole: Setup logging for test diagnostics
      console.log('ℹ️  Cookie banner not visible (already accepted or not rendered)');
    }

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
