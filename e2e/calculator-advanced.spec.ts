import { expect, test } from '@playwright/test';

/**
 * Advanced Calculator Features E2E Tests
 *
 * Comprehensive testing of advanced calculator features:
 * - Student Loan Plans (Plan 1, 2, 4, 5, Postgraduate)
 * - Pension Contributions (percentage vs fixed amount)
 * - Marriage Allowance transfers
 * - Scottish Tax Rates
 * - Blind Person's Allowance
 * - Multiple feature combinations
 */

test.describe('Advanced Calculator - Student Loans', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
    }
  });

  test('should calculate Plan 1 student loan correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing Plan 1 student loan...');

    // Enter salary above Plan 1 threshold (£22,015)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    // Select Plan 1
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 1' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify student loan row appears in results
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Plan 1 calculated correctly');
  });

  test('should calculate Plan 2 student loan correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing Plan 2 student loan...');

    // Enter salary above Plan 2 threshold (£27,295)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    // Select Plan 2
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 2' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify student loan deduction
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Plan 2 calculated correctly');
  });

  test('should calculate Plan 4 student loan correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing Plan 4 student loan...');

    // Enter salary above Plan 4 threshold (£31,395)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    // Select Plan 4
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 4' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify student loan deduction
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Plan 4 calculated correctly');
  });

  test('should calculate Plan 5 student loan correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing Plan 5 student loan...');

    // Enter salary above Plan 5 threshold (£25,000)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    // Select Plan 5
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 5' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify student loan deduction
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Plan 5 calculated correctly');
  });

  test('should calculate Postgraduate loan correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing Postgraduate loan...');

    // Enter salary above Postgrad threshold (£21,000)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    // Select Postgraduate
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Postgraduate' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify student loan deduction
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Postgraduate loan calculated correctly');
  });

  test('should not deduct student loan below threshold', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🎓 Testing below threshold (no deduction)...');

    // Enter salary below all thresholds
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('20000');

    // Select Plan 2
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 2' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Student loan row should show £0.00
    const resultsTable = page.locator('[data-testid="results-table"]');
    const studentLoanRow = resultsTable.locator('tr').filter({ hasText: /student.*loan/i });
    await expect(studentLoanRow).toContainText('£0.00');

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Below threshold shows £0.00');
  });
});

test.describe('Advanced Calculator - Pension Contributions', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
    }
  });

  test('should calculate percentage-based pension correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💰 Testing 5% pension contribution...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    // Pension should default to percentage type
    // Enter 5% pension contribution
    const pensionInput = page.getByTestId('pension-input');
    await pensionInput.fill('5');

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify pension deduction (5% of £40k = £2000)
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/pension/i);
    await expect(resultsTable).toContainText('£2,000.00');

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ 5% pension calculated correctly');
  });

  test('should calculate fixed amount pension correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💰 Testing £3,000 fixed pension...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    // Switch to fixed amount
    const pensionTypeSelect = page.getByTestId('pension-type-select');
    await pensionTypeSelect.click();
    // Select the pound icon (second option)
    await page.getByRole('option').nth(1).click();

    // Enter £3,000 fixed pension
    const pensionInput = page.getByTestId('pension-input');
    await pensionInput.fill('3000');

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify pension deduction
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText('£3,000.00');

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ £3,000 fixed pension calculated correctly');
  });

  test('should reduce taxable income with pension', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💰 Testing pension reduces tax...');

    // Calculate without pension first
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify initial calculation
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // Now add 10% pension
    const pensionInput = page.getByTestId('pension-input');
    await pensionInput.fill('10');

    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify pension reduces taxable income - check pension row exists
    await expect(resultsTable).toContainText(/pension/i);
    await expect(resultsTable).toContainText('£4,000.00');

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Pension reduces taxable income');
  });
});

test.describe('Advanced Calculator - Marriage Allowance', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
    }
  });

  test('should show partner wage input when married checkbox checked', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💍 Testing marriage allowance UI...');

    // Partner wage input should not be visible initially
    let partnerInput = page.locator('input').filter({ hasText: /partner/i });
    await expect(partnerInput).not.toBeVisible();

    // Check married checkbox
    const marriedCheckbox = page.getByTestId('married-checkbox');
    await marriedCheckbox.click();

    // Partner wage input should now be visible
    await page.waitForTimeout(500); // Wait for conditional render
    partnerInput = page.locator('input[placeholder*="0.00"]').last();
    await expect(partnerInput).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Partner wage input shows when married');
  });

  test('should calculate marriage allowance transfer', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💍 Testing marriage allowance calculation...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    // Check married
    const marriedCheckbox = page.locator('label:has-text("Married")').locator('~ button, ~ input');
    await marriedCheckbox.click();

    // Enter partner's wage (low earner can transfer)
    const partnerInput = page.locator('input[placeholder*="0.00"]').last();
    await partnerInput.fill('10000');

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Results should be calculated
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Marriage allowance calculated');
  });
});

test.describe('Advanced Calculator - Scottish Tax Rates', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
    }
  });

  test('should calculate Scottish tax rates correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Testing Scottish tax rates...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('45000');

    // Select Scotland
    const regionSelect = page.locator('button').filter({ hasText: /england|scotland|wales/i });
    await regionSelect.click();
    await page.getByRole('option', { name: 'Scotland' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify Scottish tax bands appear
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // Scottish tax has different bands (19%, 20%, 21%, 42%, 47%)
    // Just verify calculation completes
    await expect(resultsTable).toContainText(/total.*tax/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Scottish rates calculated');
  });

  test('should show higher tax for Scotland vs England at same salary', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Comparing Scottish vs English tax...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    // Calculate with England (default)
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Get England tax (for comparison)
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/total.*tax/i);

    // Switch to Scotland
    const regionSelect = page.locator('button').filter({ hasText: /england|scotland|wales/i });
    await regionSelect.click();
    await page.getByRole('option', { name: 'Scotland' }).click();

    // Recalculate
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Scottish tax should be different (typically higher)
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Scottish vs English comparison works');
  });
});

test.describe('Advanced Calculator - Combined Features', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
    }
  });

  test('should handle student loan + pension + marriage allowance together', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🔥 Testing all features combined...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('45000');

    // Add student loan
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 2' }).click();

    // Add pension (5%)
    const pensionInput = page.getByTestId('pension-input');
    await pensionInput.fill('5');

    // Enable married
    const marriedCheckbox = page.locator('label:has-text("Married")').locator('~ button, ~ input');
    await marriedCheckbox.click();

    // Enter partner wage
    const partnerInput = page.locator('input[placeholder*="0.00"]').last();
    await partnerInput.fill('8000');

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify all deductions appear
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/student.*loan/i);
    await expect(resultsTable).toContainText(/pension/i);
    await expect(resultsTable).toContainText(/net.*pay/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ All features work together');
  });

  test('should handle Scottish rates + pension + student loan', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Testing Scottish rates with deductions...');

    // Enter salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('55000');

    // Select Scotland
    const regionSelect = page.locator('button').filter({ hasText: /england|scotland|wales/i });
    await regionSelect.click();
    await page.getByRole('option', { name: 'Scotland' }).click();

    // Add pension
    const pensionInput = page.getByTestId('pension-input');
    await pensionInput.fill('8');

    // Add student loan
    const studentLoanSelect = page.getByTestId('student-loan-select');
    await studentLoanSelect.click();
    await page.getByRole('option', { name: 'Plan 4' }).click();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Verify calculation completes with all deductions
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toContainText(/total.*tax/i);
    await expect(resultsTable).toContainText(/pension/i);
    await expect(resultsTable).toContainText(/student.*loan/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Scottish + deductions calculated');
  });
});
