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

  const defaultPeriods = ['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly'];
  const optionalPeriods = ['4-Weekly', 'Fortnightly'];
  const allPeriods = ['Yearly', 'Monthly', '4-Weekly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly'];

  test('offers seven periods with exactly five selected by default', async ({ page }) => {
    await expect(
      page.getByRole('checkbox', {
        name: /^(Yearly|Monthly|4-Weekly|Fortnightly|Weekly|Daily|Hourly)$/,
      }),
    ).toHaveCount(7);
    for (const period of defaultPeriods) {
      await expect(page.getByRole('checkbox', { name: period, exact: true })).toBeChecked();
    }
    for (const period of optionalPeriods) {
      await expect(page.getByRole('checkbox', { name: period, exact: true })).not.toBeChecked();
    }
    await expect(
      page.getByTestId('results-table').locator('thead tr').first().locator('th'),
    ).toHaveText(['Breakdown', '%', ...defaultPeriods]);
  });

  test('optional periods can be enabled and selections survive resizing both ways', async ({
    page,
  }) => {
    for (const period of optionalPeriods) {
      await page.getByRole('checkbox', { name: period, exact: true }).click();
    }
    const table = page.getByTestId('results-table');
    const netPay = table.locator('tbody tr', { hasText: 'Net Pay' });
    const yearlyNetPay = await netPay.locator('td').nth(1).textContent();
    for (const width of [1440, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const period of allPeriods) {
        await expect(page.getByRole('checkbox', { name: period, exact: true })).toBeChecked();
      }
      await expect(table.locator('thead tr').first().locator('th')).toHaveText([
        'Breakdown',
        '%',
        ...allPeriods,
      ]);
      await expect(netPay.locator('td').nth(1)).toHaveText(yearlyNetPay ?? '');
      if (width >= 1280) {
        const geometry = await page.getByTestId('results-table-container').evaluate((region) => ({
          clientWidth: region.clientWidth,
          scrollWidth: region.scrollWidth,
        }));
        expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
      }
    }
    await page.getByRole('checkbox', { name: 'Daily', exact: true }).click();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('checkbox', { name: 'Daily', exact: true })).not.toBeChecked();
      await expect(table.getByRole('columnheader', { name: 'Daily', exact: true })).toHaveCount(0);
      for (const period of optionalPeriods) {
        await expect(page.getByRole('checkbox', { name: period, exact: true })).toBeChecked();
      }
    }
  });

  test('toggling period updates results table columns', async ({ page }) => {
    const hourlyCheckbox = page.getByRole('checkbox', { name: 'Hourly', exact: true });
    const resultsTable = page.getByTestId('results-table');

    // Check initial state
    const initiallyChecked = await hourlyCheckbox.isChecked();
    await hourlyCheckbox.scrollIntoViewIfNeeded();

    // Radix renders role=checkbox buttons; click directly to avoid check()/uncheck() flakiness in WebKit.
    if (initiallyChecked) {
      await hourlyCheckbox.click({ force: true });
      await expect(hourlyCheckbox).not.toBeChecked();
    } else {
      await hourlyCheckbox.click({ force: true });
      await expect(hourlyCheckbox).toBeChecked();
    }

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
      await dailyCheckbox.scrollIntoViewIfNeeded();
      await dailyCheckbox.click({ force: true });
    }

    // Recalculate with new salary
    await page.getByTestId('salary-input').fill('60000');
    await page.getByTestId('calculate-button').click();

    // Verify selection persisted
    await expect(dailyCheckbox).not.toBeChecked();
  });
});
