/**
 * Display Periods - Essential Tests
 *
 * What bugs do these tests find?
 * - Period checkboxes don't render
 * - Toggling periods doesn't update results table
 * - State doesn't persist after recalculation
 */

import { expect, test } from '@playwright/test';

test.describe('Display Periods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#tax-calculator');
    await page.waitForLoadState('networkidle');

    // Enter salary to show results
    await page.getByTestId('salary-input').fill('50000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();
  });

  test('renders all period checkboxes', async ({ page }) => {
    const periods = ['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly'];

    for (const period of periods) {
      await expect(page.getByRole('checkbox', { name: period, exact: true })).toBeVisible();
    }
  });

  test('toggling period updates results table columns', async ({ page }) => {
    const hourlyCheckbox = page.getByRole('checkbox', { name: 'Hourly', exact: true });
    const resultsTable = page.getByTestId('results-table');

    // Check initial state
    const initiallyChecked = await hourlyCheckbox.isChecked();

    // Toggle and verify table updates
    await hourlyCheckbox.click();

    if (initiallyChecked) {
      await expect(resultsTable.locator('th:has-text("Hourly")')).not.toBeVisible();
    } else {
      await expect(resultsTable.locator('th:has-text("Hourly")')).toBeVisible();
    }
  });

  test('period selections persist after recalculation', async ({ page }) => {
    // Uncheck a period
    const dailyCheckbox = page.getByRole('checkbox', { name: 'Daily', exact: true });
    if (await dailyCheckbox.isChecked()) {
      await dailyCheckbox.click();
    }

    // Recalculate with new salary
    await page.getByTestId('salary-input').fill('60000');
    await page.getByTestId('calculate-button').click();

    // Verify selection persisted
    await expect(dailyCheckbox).not.toBeChecked();
  });
});
