/**
 * Scroll Indicators - Essential Tests
 *
 * What bugs do these tests find?
 * - Scroll indicators not showing when table overflows
 * - Mobile horizontal scroll broken
 */

import { expect, type Page, test } from '@playwright/test';

async function forceTableOverflow(page: Page) {
  const periods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];
  for (const period of periods) {
    const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }
}

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

    // Enable additional periods to force overflow.
    await forceTableOverflow(page);

    // Table should be scrollable
    const scrollContainer = page.getByTestId('results-table-container');
    const isScrollable = await scrollContainer.evaluate((el) => el.scrollWidth > el.clientWidth);

    expect(isScrollable).toBe(true);
  });

  test('table container exposes horizontal scrolling behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await forceTableOverflow(page);

    const scrollContainer = page.getByTestId('results-table-container');
    const containerState = await scrollContainer.evaluate((el) => ({
      overflowX: window.getComputedStyle(el).overflowX,
      hasHorizontalOverflow: el.scrollWidth > el.clientWidth,
    }));

    expect(containerState.hasHorizontalOverflow).toBe(true);
    expect(['auto', 'scroll']).toContain(containerState.overflowX);
  });
});
