/**
 * Visual Regression Testing with Playwright
 * PAYTAX-160 Phase 3: Add visual regression baselines
 *
 * Uses Playwright's built-in screenshot comparison to detect unintended UI changes.
 * Screenshots are stored in e2e/__snapshots__ and compared on each run.
 *
 * Configuration in playwright.config.ts:
 * - maxDiffPixels: 50 (allows minor anti-aliasing differences)
 * - maxDiffPixelRatio: 0.001 (sub-pixel perfect across OS)
 *
 * To update baselines: npm run test:e2e -- --update-snapshots
 */

import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  /**
   * Helper to wait for page stability before screenshot
   */
  async function waitForStability(page: any) {
    await page.waitForLoadState('networkidle');
    // Wait for animations to complete
    await page.waitForTimeout(500);
  }

  test.describe('Homepage Visual Regression', () => {
    test('should match homepage snapshot (desktop)', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Dismiss cookie banner if present (consistent screenshots)
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
      });
    });

    test('should match homepage snapshot (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
      });
    });

    test('should match hero section snapshot', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Screenshot just the hero section
      const hero = page.locator('section').first();
      await expect(hero).toHaveScreenshot('hero-section.png');
    });
  });

  test.describe('Calculator Visual Regression', () => {
    test('should match calculator initial state', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      // Screenshot calculator section
      const calculator = page.locator('#tax-calculator');
      await expect(calculator).toHaveScreenshot('calculator-initial.png');
    });

    test('should match calculator with results', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      // Fill in salary
      const salaryInput = page.getByTestId('salary-input');
      await salaryInput.click();
      await salaryInput.fill('45000');
      await salaryInput.blur();

      // Click calculate
      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();

      // Wait for results
      await page.waitForTimeout(1000);

      // Screenshot results table
      const resultsTable = page.getByTestId('results-table');
      await expect(resultsTable).toHaveScreenshot('calculator-results-45k.png');
    });

    test('should match salary page layout', async ({ page }) => {
      await page.goto('/calculator/45000-after-tax');
      await waitForStability(page);

      // Screenshot the dedicated salary page
      await expect(page).toHaveScreenshot('salary-page-45k.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Blog Visual Regression', () => {
    test('should match blog listing page', async ({ page }) => {
      await page.goto('/blog');
      await waitForStability(page);

      await expect(page).toHaveScreenshot('blog-listing.png', {
        fullPage: true,
      });
    });

    test('should match blog category filter', async ({ page }) => {
      await page.goto('/blog');
      await waitForStability(page);

      // Screenshot category filter section
      const categoryFilter = page.locator('[role="region"]').first();
      await expect(categoryFilter).toHaveScreenshot('blog-category-filter.png');
    });
  });

  test.describe('Theme Visual Regression', () => {
    test('should match homepage in light mode', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Ensure light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot('homepage-light-mode.png', {
        fullPage: false, // Just above the fold
      });
    });

    test('should match homepage in dark mode', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Set dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: false, // Just above the fold
      });
    });
  });

  test.describe('Component Visual Regression', () => {
    test('should match navigation bar', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      const nav = page.locator('nav').first();
      await expect(nav).toHaveScreenshot('navigation-bar.png');
    });

    test('should match footer', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      const footer = page.locator('footer').first();
      await expect(footer).toHaveScreenshot('footer.png');
    });

    test('should match results table rows', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Dismiss cookie banner
      const cookieButton = page.getByTestId('cookie-accept-all');
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click();
        await page.waitForTimeout(300);
      }

      // Calculate
      const salaryInput = page.getByTestId('salary-input');
      await salaryInput.fill('45000');
      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();
      await page.waitForTimeout(1000);

      // Screenshot individual result rows
      const resultsTable = page.getByTestId('results-table');
      await expect(resultsTable).toHaveScreenshot('results-table-structure.png');
    });
  });

  test.describe('Responsive Visual Regression', () => {
    const viewports = [
      { name: 'mobile-portrait', width: 375, height: 667 }, // iPhone SE
      { name: 'mobile-landscape', width: 667, height: 375 },
      { name: 'tablet', width: 768, height: 1024 }, // iPad
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`should match calculator on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await waitForStability(page);

        // Dismiss cookie banner
        const cookieButton = page.getByTestId('cookie-accept-all');
        if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await cookieButton.click();
          await page.waitForTimeout(300);
        }

        await expect(page).toHaveScreenshot(`calculator-${viewport.name}.png`, {
          fullPage: false, // Above the fold only
        });
      });
    }
  });

  test.describe('Error States Visual Regression', () => {
    test('should match 404 page', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-404');
      await waitForStability(page);

      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
      });
    });

    test('should match offline page', async ({ page }) => {
      await page.goto('/offline');
      await waitForStability(page);

      await expect(page).toHaveScreenshot('offline-page.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Interactive States Visual Regression', () => {
    test('should match tooltip on hover', async ({ page }) => {
      await page.goto('/');
      await waitForStability(page);

      // Find a tooltip trigger and hover
      const tooltipTrigger = page.locator('[data-testid*="tooltip"]').first();
      if (await tooltipTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tooltipTrigger.hover();
        await page.waitForTimeout(300);

        // Screenshot the tooltip area
        await expect(tooltipTrigger).toHaveScreenshot('tooltip-hover.png');
      }
    });

    test('should match mobile menu open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForStability(page);

      // Open mobile menu if button exists
      const menuButton = page.getByRole('button', { name: /menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot('mobile-menu-open.png');
      }
    });
  });
});
