/**
 * E2E Tests: Calculator Initial State & Reset Functionality
 *
 * Comprehensive tests to verify:
 * 1. Initial page load shows empty state (no auto-calculation)
 * 2. Reset button returns to identical empty state
 * 3. All input fields show placeholders correctly
 * 4. No results are displayed until user clicks Calculate
 *
 * These tests ensure consistent UX between first visit and reset.
 */

import { expect, test } from '@playwright/test';

test.describe('Calculator Initial State & Reset', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure clean state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Navigate with cache-busting
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}`);
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    if (await acceptCookiesButton.isVisible().catch(() => false)) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show empty state on initial page load', async ({ page }) => {
    // Verify "Ready to Calculate" message is visible
    const readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible({ timeout: 5000 });

    // Verify no results are displayed
    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).not.toBeVisible();

    // Verify no charts are displayed
    const chartsContainer = page.locator('[data-testid="charts-container"]');
    await expect(chartsContainer).not.toBeVisible();

    // Verify no payslip table is displayed
    const payslipTable = page.locator('[data-testid="results-table"]');
    await expect(payslipTable).not.toBeVisible();
  });

  test('should have empty input fields with placeholders on initial load', async ({ page }) => {
    // Check salary input is empty (value should be empty string or "0")
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible();

    const salaryValue = await salaryInput.inputValue();
    // Input should be empty or show "0" which appears as placeholder
    expect(salaryValue === '' || salaryValue === '0' || salaryValue === '0.00').toBeTruthy();

    // Check tax code input has placeholder visible
    const taxCodeInput = page.locator('input[type="text"]').filter({ hasText: /1257L/i }).first();
    if (await taxCodeInput.isVisible().catch(() => false)) {
      const taxCodeValue = await taxCodeInput.inputValue();
      // Tax code should be empty (showing placeholder)
      expect(taxCodeValue === '' || taxCodeValue === '1257L').toBeTruthy();
    }

    // Verify allowances/deductions is 0
    const allowancesInput = page.getByLabel(/allowances.*deductions/i);
    if (await allowancesInput.isVisible().catch(() => false)) {
      const allowancesValue = await allowancesInput.inputValue();
      expect(
        allowancesValue === '' || allowancesValue === '0' || allowancesValue === '0.00'
      ).toBeTruthy();
    }

    // Verify pension is 0
    const pensionInput = page.locator('[data-testid="pension-input"]');
    if (await pensionInput.isVisible().catch(() => false)) {
      const pensionValue = await pensionInput.inputValue();
      expect(pensionValue === '' || pensionValue === '0' || pensionValue === '0.00').toBeTruthy();
    }
  });

  test('should show default selections on initial load', async ({ page }) => {
    // Tax year should be 2025-2026 (current year)
    const taxYearSelect = page.getByLabel(/tax year/i);
    await expect(taxYearSelect).toContainText(/2025-2026/);

    // Region should be England
    const regionSelect = page.getByLabel(/region/i);
    await expect(regionSelect).toContainText(/england/i);

    // Pay period should be Annually
    const payPeriodSelect = page.getByLabel(/annually/i);
    await expect(payPeriodSelect).toBeVisible();

    // Student loan should be No
    const studentLoanSelect = page.getByLabel(/student loan/i);
    await expect(studentLoanSelect).toContainText(/no/i);

    // Age should be Under 65
    const ageSelect = page.getByLabel(/age/i);
    await expect(ageSelect).toContainText(/under 65/i);

    // Checkboxes should be unchecked
    const marriedCheckbox = page.getByLabel(/married/i);
    await expect(marriedCheckbox).not.toBeChecked();

    const blindCheckbox = page.getByLabel(/blind/i);
    await expect(blindCheckbox).not.toBeChecked();

    const payNoNICheckbox = page.getByLabel(/i pay no ni/i);
    await expect(payNoNICheckbox).not.toBeChecked();
  });

  test('should match initial state after reset button is clicked', async ({ page }) => {
    // First, fill in some data and calculate
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.clear();
    await salaryInput.fill('35000');

    const taxCodeInput = page.locator('label:has-text("Tax Code")').locator('..').locator('input');
    await taxCodeInput.fill('1250L');

    // Click Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Verify results are now visible
    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).toBeVisible({ timeout: 5000 });

    // Now click Reset
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify we're back to initial state
    // 1. Ready to Calculate message visible
    const readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible();

    // 2. No results visible
    await expect(resultsSection).not.toBeVisible();

    // 3. Salary is back to 0
    const salaryValue = await salaryInput.inputValue();
    expect(salaryValue === '' || salaryValue === '0' || salaryValue === '0.00').toBeTruthy();

    // 4. Tax code is empty
    const taxCodeValue = await taxCodeInput.inputValue();
    expect(taxCodeValue === '' || taxCodeValue === '1257L').toBeTruthy();

    // 5. No charts visible
    const chartsContainer = page.locator('[data-testid="charts-container"]');
    await expect(chartsContainer).not.toBeVisible();

    // 6. No payslip table visible
    const payslipTable = page.locator('[data-testid="results-table"]');
    await expect(payslipTable).not.toBeVisible();
  });

  test('should require Calculate button click to show results', async ({ page }) => {
    // Fill in salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.clear();
    await salaryInput.fill('40000');
    await page.waitForTimeout(1000); // Wait to see if auto-calculation happens

    // Results should NOT appear automatically
    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).not.toBeVisible();

    // Ready to Calculate message should still be visible
    const readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible();

    // Now click Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // NOW results should appear
    await expect(resultsSection).toBeVisible({ timeout: 5000 });

    // Ready to Calculate should be hidden
    await expect(readyMessage).not.toBeVisible();
  });

  test('should clear all results when reset is clicked', async ({ page }) => {
    // Fill in data and calculate
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Verify results, charts, and table are visible
    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).toBeVisible({ timeout: 5000 });

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // Now reset
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.click();
    await page.waitForTimeout(500);

    // All results should be hidden
    await expect(resultsSection).not.toBeVisible();
    await expect(resultsTable).not.toBeVisible();

    // Summary cards should show £0.00
    const annualTakeHome = page.locator('text=/annual take-home/i').locator('..');
    if (await annualTakeHome.isVisible().catch(() => false)) {
      await expect(annualTakeHome).toContainText('£0.00');
    }
  });

  test('should reset What If comparison if it was enabled', async ({ page }) => {
    // Fill in salary and calculate
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('45000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Enable What If comparison
    const compareButton = page.getByRole('button', { name: /compare scenarios/i });
    if (await compareButton.isVisible().catch(() => false)) {
      await compareButton.click();
      await page.waitForTimeout(500);

      // Verify What If is active
      const whatIfSection = page.locator('[data-testid="what-if-section"]');
      if (await whatIfSection.isVisible().catch(() => false)) {
        // Reset
        const resetButton = page.getByRole('button', { name: /reset/i });
        await resetButton.click();
        await page.waitForTimeout(500);

        // What If should be closed
        await expect(whatIfSection).not.toBeVisible();
      }
    }
  });

  test('should maintain consistent state across multiple resets', async ({ page }) => {
    // Perform calculation
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // First reset
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify empty state
    let readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible();

    // Enter new data
    await salaryInput.fill('55000');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Second reset
    await resetButton.click();
    await page.waitForTimeout(500);

    // Should still be in same empty state
    readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible();

    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).not.toBeVisible();

    // Salary should be 0
    const salaryValue = await salaryInput.inputValue();
    expect(salaryValue === '' || salaryValue === '0' || salaryValue === '0.00').toBeTruthy();
  });

  test('should not persist calculated state after page reload', async ({ page }) => {
    // Calculate something
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('42000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Verify results are visible
    const resultsSection = page.locator('[data-testid="tax-results"]');
    await expect(resultsSection).toBeVisible({ timeout: 5000 });

    // Reload page with cache busting
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}`);
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    if (await acceptCookiesButton.isVisible().catch(() => false)) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }

    // Should be back to initial empty state
    const readyMessage = page.getByText(/ready to calculate/i);
    await expect(readyMessage).toBeVisible();

    // No results should be visible
    await expect(resultsSection).not.toBeVisible();
  });
});
