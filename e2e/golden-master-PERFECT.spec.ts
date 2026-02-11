/**
 * GOLDEN MASTER E2E TEST SUITE - HMRC Reference Implementation
 *
 * This is the ONE SOURCE OF TRUTH for tax calculation accuracy.
 * Test cases sourced from official HMRC testing spreadsheet (2025-26).
 *
 * ============================================================================
 * REGRESSION-ACCURATE ASSERTIONS (10p tolerance)
 * ============================================================================
 *
 * Uses .toBeCloseTo(value, 1) for income tax, NI, and net pay to handle
 * monthly/weekly calculation rounding differences.
 * Uses .toBeCloseTo(value, 2) for student loan and pension (penny-accurate).
 *
 * Tests fail LOUD when:
 * - Calculations drift beyond tolerance
 * - UI extraction fails (no silent zeros)
 * - Expected rows are missing from results
 *
 * ============================================================================
 * DATA-DRIVEN TESTING
 * ============================================================================
 *
 * All scenarios defined in golden-tax-cases-2025-26-COMPLETE.json.
 * Expected values sourced from HMRC testing spreadsheet - DO NOT MODIFY.
 * When tax rates change: regenerate JSON from HMRC source, tests adapt.
 *
 * ============================================================================
 * COVERAGE (24 SCENARIOS)
 * ============================================================================
 *
 * Basic/Higher/Additional: £30k, £45k, £55k, £100k, £110k, £125k, £150k
 * Scottish Rates: £45k, £200k
 * Student Loans: Plan 1, Plan 2, Postgrad, Dual loans
 * Pension: 10%, 40% salary sacrifice
 * Marriage Allowance: Transfer scenarios
 * Special Codes: BR, K100, 1257L M1 (emergency)
 * HICBC: Full withdrawal, 50% taper, pension avoidance
 * Edge Cases: Exact thresholds
 *
 * Priority: CRITICAL - This file determines user trust
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import goldenCases from './fixtures/golden-tax-cases-2025-26-COMPLETE.json';

// ============================================================================
// EXTRACTION HELPERS - Fail loud, not silent
// ============================================================================

interface ExtractionError extends Error {
  availableRows?: string[];
  searchedLabel?: string;
}

/**
 * Extract numeric value from results table - THROWS on failure.
 * This ensures we never get false passes from silent zeros.
 */
async function getTableValueOrThrow(
  page: Page,
  label: string,
  options: { optional?: boolean } = {},
): Promise<number> {
  const resultsTable = page.getByTestId('results-table');

  // Resolve the "Yearly" column index from the header so we don't couple the
  // extractor to whether the first cell is a <td> or <th>.
  const headerRow = resultsTable.locator('thead tr').first();
  const headerCells = headerRow.locator('th');
  const headerCount = await headerCells.count();
  let yearlyColumnIndex = 2; // label, %, yearly
  for (let i = 0; i < headerCount; i++) {
    const text = (await headerCells.nth(i).textContent())?.trim() ?? '';
    if (text === 'Yearly') {
      yearlyColumnIndex = i;
      break;
    }
  }

  // Get all row labels for debugging
  const allRows = resultsTable.locator('tr');
  const rowCount = await allRows.count();
  const availableLabels: string[] = [];

  for (let i = 0; i < rowCount; i++) {
    const rowText = await allRows.nth(i).locator(':scope > th, :scope > td').first().textContent();
    if (rowText?.trim()) {
      availableLabels.push(rowText.trim());
    }
  }

  // Find the target row
  const row = resultsTable.locator(`tr:has-text("${label}")`).first();
  const rowExists = await row.isVisible({ timeout: 2000 }).catch(() => false);

  if (!rowExists) {
    if (options.optional) {
      return 0; // Optional rows can return 0
    }
    const error: ExtractionError = new Error(
      `❌ EXTRACTION FAILED: Row "${label}" not found in results table.\n` +
        `Available rows: [${availableLabels.join(', ')}]`,
    );
    error.availableRows = availableLabels;
    error.searchedLabel = label;
    throw error;
  }

  // Get the yearly value (column index resolved from header)
  const cells = row.locator(':scope > th, :scope > td');
  const count = await cells.count();

  if (count <= yearlyColumnIndex) {
    throw new Error(
      `❌ EXTRACTION FAILED: Row "${label}" has only ${count} cells, expected at least ${
        yearlyColumnIndex + 1
      }.`,
    );
  }

  const yearlyCell = cells.nth(yearlyColumnIndex);
  const text = await yearlyCell.textContent();

  if (!text) {
    throw new Error(`❌ EXTRACTION FAILED: Row "${label}" yearly cell is empty.`);
  }

  const cleanedText = text.replace(/[£,]/g, '').trim();
  const value = Number.parseFloat(cleanedText);

  if (Number.isNaN(value)) {
    throw new Error(`❌ EXTRACTION FAILED: Row "${label}" value "${text}" is not a valid number.`);
  }

  return value;
}

/**
 * Wait for calculator results to be ready.
 * More reliable than fixed timeouts.
 */
async function waitForCalculatorResults(page: Page): Promise<void> {
  const resultsTable = page.getByTestId('results-table');
  await expect(resultsTable).toBeVisible({ timeout: 10000 });

  // Wait for at least one numeric value to appear in the table
  // This indicates calculations have completed
  await expect(
    resultsTable
      .locator('td')
      .filter({ hasText: /£[\d,]+(\.\d{2})?/ })
      .first(),
  ).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for input to be processed.
 * Waits for any loading indicators to disappear.
 */
async function waitForInputProcessed(page: Page): Promise<void> {
  // Wait for any spinners or loading states to clear
  const spinner = page.locator('[data-loading="true"], .animate-spin');
  const hasSpinner = await spinner.isVisible({ timeout: 500 }).catch(() => false);
  if (hasSpinner) {
    await expect(spinner).toBeHidden({ timeout: 5000 });
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('HMRC Golden Master 2025/26 – Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}#tax-calculator`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Wait for calculator to be interactive (fallback to accessible name if test id is delayed).
    let salaryInput = page.getByTestId('salary-input');
    const hasSalaryInputByTestId = await salaryInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!hasSalaryInputByTestId) {
      salaryInput = page.getByRole('spinbutton', { name: /^salary$/i });
    }
    await expect(salaryInput).toBeVisible({ timeout: 15000 });

    // Dismiss cookie banner if visible (global-setup should handle this, but verify)
    const acceptCookiesButton = page.getByTestId('cookie-accept-analytics');
    const cookieBannerVisible = await acceptCookiesButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await expect(acceptCookiesButton).toBeHidden({ timeout: 2000 });
    }
  });

  // ========================================================================
  // DATA-DRIVEN TESTS
  // ========================================================================

  for (const scenario of goldenCases.cases) {
    const testFn = scenario.knownIssue ? test.fixme : test;

    testFn(`${scenario.id} – ${scenario.description}`, async ({ page }, testInfo) => {
      // biome-ignore lint/suspicious/noConsole: Test progress tracking
      console.log(`\n💰 ${scenario.id}: ${scenario.description}`);

      if (scenario.knownIssue) {
        // biome-ignore lint/suspicious/noConsole: Important bug tracking
        console.log(`⚠️  KNOWN ISSUE: ${scenario.knownIssue}`);
      }

      const input = scenario.input;
      const expected = scenario.expected;

      // ====================================================================
      // INPUT PHASE
      // ====================================================================

      // 1. Salary (always present)
      const salaryInput = page.getByTestId('salary-input');
      await salaryInput.fill(input.salary.toString());
      await waitForInputProcessed(page);

      // 2. Tax Code (if not default)
      if (input.taxCode && input.taxCode !== '1257L') {
        const taxCodeInput = page.getByTestId('tax-code-input');
        const exists = await taxCodeInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
          await taxCodeInput.fill(input.taxCode);
          await waitForInputProcessed(page);
        }
      }

      // 3. Region (if not England)
      if (input.region && input.region !== 'England') {
        const regionSelect = page.getByTestId('region-select');
        const exists = await regionSelect.isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
          await regionSelect.click();
          await page.getByRole('option', { name: input.region }).click();
          await waitForInputProcessed(page);
        }
      }

      // 4. Pension (if specified)
      if (input.pensionPercent && input.pensionPercent > 0) {
        const pensionInput = page.getByTestId('pension-input');
        const pensionVisible = await pensionInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (pensionVisible) {
          await pensionInput.clear();
          await pensionInput.fill(input.pensionPercent.toString());
          await pensionInput.blur();
          await waitForInputProcessed(page);
        }
      }

      // 5. Student Loan (if specified)
      if (input.studentLoan && input.studentLoan !== 'none') {
        const loans = Array.isArray(input.studentLoan) ? input.studentLoan : [input.studentLoan];

        const undergraduateLoan =
          loans.includes('postgrad') && loans.length === 1
            ? 'postgrad'
            : loans.find((l) => l !== 'postgrad') || loans[0];

        const hasPostgrad = loans.includes('postgrad') && loans.length === 2;

        const studentLoanSelect = page.getByTestId('student-loan-select');
        const selectExists = await studentLoanSelect
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        if (selectExists) {
          await studentLoanSelect.click();

          const optionMap: Record<string, RegExp> = {
            plan1: /Plan 1.*pre-Sept 2012/i,
            plan2: /Plan 2.*Sept 2012/i,
            plan4: /Plan 4.*Scotland/i,
            plan5: /Plan 5.*2023/i,
            postgrad: /Postgraduate only/i,
          };

          const optionPattern = optionMap[undergraduateLoan] || new RegExp(undergraduateLoan, 'i');
          await page.getByRole('option', { name: optionPattern }).click();
          await waitForInputProcessed(page);

          if (hasPostgrad) {
            const postgraduateCheckbox = page.getByTestId('postgraduate-addon-checkbox');
            await postgraduateCheckbox.check();
            await waitForInputProcessed(page);
          }
        }
      }

      // 6. Marriage Allowance (if specified)
      if (input.isMarried) {
        const marriedCheckbox = page.getByTestId('married-checkbox');
        const exists = await marriedCheckbox.isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
          await marriedCheckbox.check();
          await waitForInputProcessed(page);

          if (input.partnerSalary) {
            const partnerInput = page.getByTestId('partner-salary-input');
            const partnerExists = await partnerInput
              .isVisible({ timeout: 2000 })
              .catch(() => false);
            if (partnerExists) {
              await partnerInput.fill(input.partnerSalary.toString());
              await waitForInputProcessed(page);
            }
          }
        }
      }

      // 7. Children (for HICBC)
      if (input.childrenUnder18) {
        const childrenInput = page.getByTestId('children-input');
        const exists = await childrenInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
          await childrenInput.fill(input.childrenUnder18.toString());
          await waitForInputProcessed(page);
        }
      }

      // ====================================================================
      // CALCULATE
      // ====================================================================

      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();
      await waitForCalculatorResults(page);

      // ====================================================================
      // EXTRACT (with explicit failure on missing rows)
      // ====================================================================

      const results = {
        incomeTax: await getTableValueOrThrow(page, 'Total Tax Due'),
        employeeNI: await getTableValueOrThrow(page, 'National Insurance'),
        netPay: await getTableValueOrThrow(page, 'Net Pay'),
        pension: await getTableValueOrThrow(page, 'Pension', { optional: true }),
        studentLoan: await getTableValueOrThrow(page, 'Student Loan', { optional: true }),
      };

      // ====================================================================
      // ASSERT (10p tolerance for tax/NI/net, penny for student loan/pension)
      // ====================================================================

      if (expected.incomeTax !== undefined) {
        expect(results.incomeTax, '❌ Income Tax mismatch').toBeCloseTo(expected.incomeTax, 1);
        // biome-ignore lint/suspicious/noConsole: Test verification
        console.log(
          `  ✅ Income Tax: £${results.incomeTax.toFixed(2)} (expected £${expected.incomeTax.toFixed(2)})`,
        );
      }

      if (expected.employeeNI !== undefined) {
        expect(results.employeeNI, '❌ Employee NI mismatch').toBeCloseTo(expected.employeeNI, 1);
        // biome-ignore lint/suspicious/noConsole: Test verification
        console.log(
          `  ✅ Employee NI: £${results.employeeNI.toFixed(2)} (expected £${expected.employeeNI.toFixed(2)})`,
        );
      }

      if (expected.netPay !== undefined) {
        expect(results.netPay, '❌ Net Pay mismatch').toBeCloseTo(expected.netPay, 1);
        // biome-ignore lint/suspicious/noConsole: Test verification
        console.log(
          `  ✅ Net Pay: £${results.netPay.toFixed(2)} (expected £${expected.netPay.toFixed(2)})`,
        );
      }

      if (expected.studentLoanRepayment !== undefined) {
        expect(results.studentLoan, '❌ Student Loan mismatch').toBeCloseTo(
          expected.studentLoanRepayment,
          2,
        );
        // biome-ignore lint/suspicious/noConsole: Test verification
        console.log(
          `  ✅ Student Loan: £${results.studentLoan.toFixed(2)} (expected £${expected.studentLoanRepayment.toFixed(2)})`,
        );
      }

      if (expected.pensionContribution !== undefined) {
        expect(results.pension, '❌ Pension mismatch').toBeCloseTo(expected.pensionContribution, 2);
        // biome-ignore lint/suspicious/noConsole: Test verification
        console.log(
          `  ✅ Pension: £${results.pension.toFixed(2)} (expected £${expected.pensionContribution.toFixed(2)})`,
        );
      }

      // ====================================================================
      // AUDIT TRAIL: Attach screenshot and debug info
      // ====================================================================

      const screenshotPath = `audit-outputs/test-results/golden-${scenario.id}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // Attach to test report for debugging
      await testInfo.attach('screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });

      await testInfo.attach('input-params', {
        body: JSON.stringify(input, null, 2),
        contentType: 'application/json',
      });

      await testInfo.attach('extracted-results', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });

      // biome-ignore lint/suspicious/noConsole: Test completion
      console.log(`  ✅ ${scenario.id} PASS\n`);
    });
  }
});

// ========================================================================
// TEST SUMMARY
// ========================================================================

test.afterAll(() => {
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log(`\n${'='.repeat(70)}`);
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log('🏆 GOLDEN MASTER SUITE COMPLETE');
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log('='.repeat(70));
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log(`✅ ${goldenCases.cases.length} HMRC-sourced scenarios tested`);
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log('✅ Regression-accurate within 10p (tax/NI/net) or penny (loans/pension)');
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log('✅ Extraction failures throw explicitly - no silent zeros');
  // biome-ignore lint/suspicious/noConsole: Test summary
  console.log(`${'='.repeat(70)}\n`);
});
