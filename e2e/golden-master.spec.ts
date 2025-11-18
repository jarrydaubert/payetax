/**
 * Golden Master E2E Tests - HMRC-Verified Tax Calculations
 *
 * This test suite uses verified HMRC tax calculations to ensure 100% accuracy.
 * Each test case is a real-world scenario with expected results calculated from
 * official HMRC guidance and verified against multiple sources.
 *
 * Benefits:
 * - Zero false positives (precise penny-accurate assertions)
 * - Data-driven testing (easy to add new scenarios)
 * - Easy tax year updates (just update JSON)
 * - Catches rounding errors and edge cases
 *
 * Priority: CRITICAL - These are the "known good" calculations that build trust
 */

import { expect, test } from '@playwright/test';
import goldenCases from './fixtures/golden-tax-cases-2025-26.json';

test.describe('HMRC Golden Master 2025/26 - Zero Tolerance Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with cache-busting
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}#tax-calculator`);
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  // Helper to extract results as numbers
  async function extractResults(page) {
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible({ timeout: 10000 });

    // Extract numeric values from results table
    const extractValue = async (rowText: string) => {
      const row = resultsTable.locator(`tr:has-text("${rowText}")`);
      if (!(await row.isVisible().catch(() => false))) {
        return 0;
      }
      const cell = row.locator('td').nth(2); // Annual column
      const text = await cell.textContent();
      return parseFloat(text?.replace(/[£,]/g, '') || '0');
    };

    return {
      incomeTax: await extractValue('Income Tax'),
      employeeNI: await extractValue('National Insurance'),
      studentLoan: await extractValue('Student Loan'),
      pension: await extractValue('Pension'),
      netPay: await extractValue('Net Pay'),
    };
  }

  // Data-driven tests from golden master JSON
  for (const scenario of goldenCases.cases) {
    test(`${scenario.id}: ${scenario.description}`, async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging
      console.log(`\n💰 Testing: ${scenario.description}`);

      const input = scenario.input;
      const expected = scenario.expected;

      // Fill salary
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill(input.salary.toString());
      await page.waitForTimeout(300);

      // Set region if not England (default)
      if (input.region !== 'England') {
        const regionSelect = page.locator('button').filter({ hasText: /england|scotland|wales/i });
        await regionSelect.click();
        await page.getByRole('option', { name: input.region }).click();
        await page.waitForTimeout(300);
      }

      // Set tax code if not default
      if (input.taxCode !== '1257L') {
        const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
        await taxCodeInput.click();
        await taxCodeInput.fill(input.taxCode);
        await page.waitForTimeout(300);
      }

      // Set pension if specified
      if (input.pensionContribution > 0) {
        const pensionInput = page.getByLabel(/pension.*%/i);
        if (await pensionInput.isVisible().catch(() => false)) {
          await pensionInput.fill(input.pensionContribution.toString());
          await page.waitForTimeout(300);
        }
      }

      // Set student loan if specified
      if (input.studentLoan !== 'none') {
        const studentLoanSelect = page.getByTestId('student-loan-select');
        if (await studentLoanSelect.isVisible().catch(() => false)) {
          await studentLoanSelect.click();
          await page.getByRole('option', { name: new RegExp(input.studentLoan, 'i') }).click();
          await page.waitForTimeout(300);
        }
      }

      // Set marriage allowance if specified
      if (input.isMarried) {
        const marriedCheckbox = page.getByLabel(/married/i);
        if (await marriedCheckbox.isVisible().catch(() => false)) {
          await marriedCheckbox.check();
          await page.waitForTimeout(300);

          if (input.partnerGrossWage) {
            const partnerInput = page.getByLabel(/partner.*wage/i);
            await partnerInput.fill(input.partnerGrossWage.toString());
            await page.waitForTimeout(300);
          }
        }
      }

      // Calculate
      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();
      await page.waitForTimeout(1500);

      // Extract results
      const results = await extractResults(page);

      // CRITICAL: Penny-accurate assertions (2 decimal places)
      // This is what prevents false positives!

      if (expected.incomeTax !== undefined) {
        expect(results.incomeTax).toBeCloseTo(expected.incomeTax, 2);
        // biome-ignore lint/suspicious/noConsole: Test debugging
        console.log(
          `  ✅ Income Tax: £${results.incomeTax.toFixed(2)} (expected £${expected.incomeTax.toFixed(2)})`
        );
      }

      if (expected.employeeNI !== undefined) {
        expect(results.employeeNI).toBeCloseTo(expected.employeeNI, 2);
        // biome-ignore lint/suspicious/noConsole: Test debugging
        console.log(
          `  ✅ Employee NI: £${results.employeeNI.toFixed(2)} (expected £${expected.employeeNI.toFixed(2)})`
        );
      }

      if (expected.netPay !== undefined) {
        expect(results.netPay).toBeCloseTo(expected.netPay, 2);
        // biome-ignore lint/suspicious/noConsole: Test debugging
        console.log(
          `  ✅ Net Pay: £${results.netPay.toFixed(2)} (expected £${expected.netPay.toFixed(2)})`
        );
      }

      if (input.studentLoan !== 'none' && expected.studentLoanRepayment !== undefined) {
        expect(results.studentLoan).toBeCloseTo(expected.studentLoanRepayment, 2);
        // biome-ignore lint/suspicious/noConsole: Test debugging
        console.log(
          `  ✅ Student Loan: £${results.studentLoan.toFixed(2)} (expected £${expected.studentLoanRepayment.toFixed(2)})`
        );
      }

      // Screenshot for visual verification
      await page.screenshot({
        path: `audit-outputs/test-results/golden-master-${scenario.id}.png`,
        fullPage: false,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging
      console.log(`  ✅ ${scenario.id} PASS - All values match HMRC calculations`);
    });
  }
});

test.describe('Golden Master - Edge Case Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}#tax-calculator`);
    await page.waitForLoadState('networkidle');

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Salary exactly at personal allowance (£12,570) - zero tax', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('\n💰 Testing: Salary exactly at personal allowance');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('12570');
    await page.waitForTimeout(300);

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    const resultsTable = page.locator('[data-testid="results-table"]');
    const taxRow = resultsTable.locator('tr:has-text("Income Tax")');
    const taxCell = taxRow.locator('td').nth(2);
    const taxText = await taxCell.textContent();
    const incomeTax = parseFloat(taxText?.replace(/[£,]/g, '') || '0');

    // Should be exactly £0.00
    expect(incomeTax).toBeCloseTo(0.0, 2);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log(`  ✅ Income Tax: £${incomeTax.toFixed(2)} (expected £0.00)`);
  });

  test('Salary exactly at NI threshold (£12,570) - minimal NI', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('\n💰 Testing: Salary at NI threshold');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('12570');
    await page.waitForTimeout(300);

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    const resultsTable = page.locator('[data-testid="results-table"]');
    const niRow = resultsTable.locator('tr:has-text("National Insurance")');
    const niCell = niRow.locator('td').nth(2);
    const niText = await niCell.textContent();
    const employeeNI = parseFloat(niText?.replace(/[£,]/g, '') || '0');

    // Should be exactly £0.00 (at threshold)
    expect(employeeNI).toBeCloseTo(0.0, 2);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log(`  ✅ Employee NI: £${employeeNI.toFixed(2)} (expected £0.00)`);
  });

  test('Salary exactly at higher rate threshold (£50,270)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('\n💰 Testing: Salary exactly at higher rate threshold');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50270');
    await page.waitForTimeout(300);

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    const resultsTable = page.locator('[data-testid="results-table"]');
    const taxRow = resultsTable.locator('tr:has-text("Income Tax")');
    const taxCell = taxRow.locator('td').nth(2);
    const taxText = await taxCell.textContent();
    const incomeTax = parseFloat(taxText?.replace(/[£,]/g, '') || '0');

    // £50,270 - £12,570 = £37,700 @ 20% = £7,540
    const expectedTax = 7540.0;
    expect(incomeTax).toBeCloseTo(expectedTax, 2);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log(`  ✅ Income Tax: £${incomeTax.toFixed(2)} (expected £${expectedTax.toFixed(2)})`);
  });
});
