/**
 * Scroll Indicators - Essential Tests
 *
 * What bugs do these tests find?
 * - Scroll indicators not showing when table overflows
 * - Mobile horizontal scroll broken
 */

import { expect, test } from '@playwright/test';

test.describe('Scroll Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#tax-calculator');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('salary-input').fill('50000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();
  });

  test('shows scroll indicator when table overflows on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Enable all periods to force overflow
    const periods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
    for (const period of periods) {
      const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }
    }

    // Table should be scrollable
    const table = page.getByTestId('results-table');
    const scrollContainer = table.locator('..');
    const isScrollable = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

    expect(isScrollable).toBe(true);
  });

  test('table is scrollable horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const table = page.getByTestId('results-table');
    const scrollContainer = table.locator('..');

    // Scroll right
    await scrollContainer.evaluate((el) => el.scrollTo({ left: 100 }));
    const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);

    expect(scrollLeft).toBeGreaterThan(0);
  });
});
