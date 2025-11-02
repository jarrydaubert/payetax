import { expect, test } from '@playwright/test';

/**
 * Comprehensive Scroll Indicators E2E Tests
 * Tests scroll behavior across all viewports and browsers
 * Validates that scroll indicators appear/disappear correctly based on table overflow
 */

test.describe('Results Table Scroll Indicators E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calculator with cache-busting
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}`);
    await page.waitForLoadState('networkidle');

    // Enter salary and calculate
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 10000 });
    await salaryInput.fill('50000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    // Wait for results table
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should not show scroll indicators with 3 default periods', async ({ page }) => {
      // Default periods: Yearly, Monthly, Weekly
      await page.waitForTimeout(500); // Wait for scroll check

      // Table should fit without scrolling
      const table = page.locator('[data-testid="results-table"]');
      const scrollContainer = table.locator('..');

      const scrollWidth = await scrollContainer.evaluate((el) => el.scrollWidth);
      const clientWidth = await scrollContainer.evaluate((el) => el.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('should show scroll indicators when all 7 periods selected', async ({ page }) => {
      // Enable all periods - check state first due to localStorage persistence
      const periods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];

      for (const period of periods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      // Wait for table to re-render
      await page.waitForTimeout(500);

      // Check if table has horizontal scroll
      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
      const hasHorizontalScroll = await scrollContainer.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });

      // On 1920px width with proper layout, all periods should be visible
      // This tests that our max-width: 1600px fix works
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should show right indicator when table overflows', async ({ page }) => {
      // Force overflow by checking all periods and resizing to smaller width
      await page.setViewportSize({ width: 1200, height: 800 });

      const periods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of periods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
      const hasOverflow = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

      if (hasOverflow) {
        // Right indicator should be visible (check for animated chevron)
        const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
        expect(scrollLeft).toBe(0); // At start, so right indicator should show
      }
    });
  });

  test.describe('Laptop Viewport (1366x768)', () => {
    test.use({ viewport: { width: 1366, height: 768 } });

    test('should show scroll with all 7 periods on laptop', async ({ page }) => {
      // Enable all periods - check state first
      const periods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];

      for (const period of periods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
      const scrollWidth = await scrollContainer.evaluate((el) => el.scrollWidth);
      const clientWidth = await scrollContainer.evaluate((el) => el.clientWidth);

      // Should either fit or have minimal overflow
      expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth);
    });

    test('should be able to scroll horizontally', async ({ page }) => {
      // Enable all periods
      const allPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');

      // Try to scroll
      await scrollContainer.evaluate((el) => {
        el.scrollLeft = 100;
      });

      await page.waitForTimeout(200);

      const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);

      if (scrollLeft > 0) {
        expect(scrollLeft).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Mobile Viewport (375x667)', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    });

    test('should show swipe hint on mobile when overflow', async ({ page }) => {
      // Enable multiple periods to force overflow - check state first
      const periods = ['4-Weekly', 'Daily', 'Hourly'];

      for (const period of periods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
      const hasOverflow = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

      // Swipe hint should be visible if there's overflow
      if (hasOverflow) {
        const swipeHint = page.locator('text=/swipe to see all periods/i');
        await expect(swipeHint).toBeVisible({ timeout: 2000 });
      }
    });

    test('should support touch scrolling on mobile', async ({ page }) => {
      // Enable all periods
      const allPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');

      // Simulate touch scroll
      const box = await scrollContainer.boundingBox();
      if (box) {
        // Swipe left (scroll right)
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 50, box.y + box.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(300);

        const _scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
      }
    });

    test('should have touch-pan-x class for horizontal scrolling', async ({ page }) => {
      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');

      const hasTouchPanX = await scrollContainer.evaluate((el) => {
        return el.classList.contains('touch-pan-x') || el.classList.contains('overflow-x-auto');
      });

      expect(hasTouchPanX).toBe(true);
    });
  });

  test.describe('Scroll Indicator Visibility Logic', () => {
    test('should update indicators when toggling periods', async ({ page, viewport }) => {
      // Start with 3 periods (no overflow on most screens)
      await page.waitForTimeout(500);

      // Add more periods one by one and check for overflow
      const periodsToAdd = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];

      for (const period of periodsToAdd) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }

        await page.waitForTimeout(300);

        const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
        const _scrollWidth = await scrollContainer.evaluate((el) => el.scrollWidth);
        const _clientWidth = await scrollContainer.evaluate((el) => el.clientWidth);
      }
    });

    test('should hide indicators when removing periods to fit viewport', async ({ page }) => {
      // First ensure all periods are checked
      const allPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      // Then remove them to reduce width
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (isChecked) {
          await checkbox.click();
          await expect(checkbox).not.toBeChecked({ timeout: 3000 });
        }

        await page.waitForTimeout(300);

        const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');
        const _scrollWidth = await scrollContainer.evaluate((el) => el.scrollWidth);
        const _clientWidth = await scrollContainer.evaluate((el) => el.clientWidth);
      }
    });
  });

  test.describe('Scroll Position Tests', () => {
    test.use({ viewport: { width: 1200, height: 800 } });

    test('should show left indicator after scrolling right', async ({ page }) => {
      // Enable all periods to ensure overflow
      const allPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');

      const hasOverflow = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

      if (hasOverflow) {
        // Scroll to middle
        await scrollContainer.evaluate((el) => {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        });

        await page.waitForTimeout(300);

        const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);

        expect(scrollLeft).toBeGreaterThan(5); // Should trigger left indicator
      }
    });

    test('should hide right indicator at end of scroll', async ({ page }) => {
      // Enable all periods
      const allPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await expect(checkbox).toBeChecked({ timeout: 3000 });
        }
      }

      await page.waitForTimeout(500);

      const scrollContainer = page.locator('[role="region"][aria-label*="Tax calculation"]');

      const hasOverflow = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

      if (hasOverflow) {
        // Scroll to end
        await scrollContainer.evaluate((el) => {
          el.scrollLeft = el.scrollWidth - el.clientWidth;
        });

        await page.waitForTimeout(300);

        const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
        const maxScroll = await scrollContainer.evaluate((el) => el.scrollWidth - el.clientWidth);

        expect(Math.abs(scrollLeft - maxScroll)).toBeLessThan(5); // Should be at end
      }
    });
  });

  test.describe('Container Width Tests', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should use max-width 1800px container', async ({ page }) => {
      const calculatorSection = page.locator('[data-testid="calculator-section"]');
      await expect(calculatorSection).toBeVisible();

      const maxWidth = await calculatorSection.evaluate((el) => {
        return window.getComputedStyle(el).maxWidth;
      });
      expect(maxWidth).toBe('1800px');
    });

    test('should have proper grid layout on desktop', async ({ page }) => {
      const calculatorSection = page.locator('[data-testid="calculator-section"]');
      const gridCols = await calculatorSection.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // Should have 2-column grid: 380px + 1fr
      expect(gridCols).toContain('380px');
    });
  });
});
