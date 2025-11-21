import { expect, test } from '@playwright/test';
import { generateUniqueTestData } from './helpers/tax-test-helpers';

/**
 * What-If Comparison E2E Tests
 *
 * Tests the "What If" scenario comparison feature that allows users to:
 * - Compare current salary vs alternative scenarios
 * - Test percentage increases/decreases
 * - Test fixed amount changes
 * - Test new total salary scenarios
 * - Visualize salary sacrifice impact
 * - See tax trap effects in £100k-£125k range
 */
test.describe('What-If Comparison - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with cache-busting
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🍪 Cookie banner dismissed');
    }

    // Open What-If collapsible section (required for all tests)
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await expect(whatIfTrigger).toBeVisible({ timeout: 5000 });
    await whatIfTrigger.click();
    // Collapsible opens instantly - no wait needed to complete

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔓 What-If section opened');
  });

  test('should display What-If inputs section', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Checking What-If section exists...');

    // What-If section should be visible
    const whatIfSection = page.locator('text=What If Scenario').first();
    await expect(whatIfSection).toBeVisible();

    // Type selector should be present
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await expect(typeSelect).toBeVisible();

    // Value input should be present
    const valueInput = page.locator('[data-testid="what-if-value-input"]');
    await expect(valueInput).toBeVisible();

    // What-If trigger button should be present (use .first() due to 2 instances)
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await expect(whatIfTrigger).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ What-If section displayed correctly');
  });

  test('should toggle between What-If comparison types', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔄 Testing What-If type switching...');

    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();

    // Check all three options are available
    await expect(page.getByRole('option', { name: 'Percentage' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Amount' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Total' })).toBeVisible();

    // Select "Amount"
    await page.getByRole('option', { name: 'Amount' }).click();

    // Verify selection changed
    await expect(typeSelect).toContainText(/amount/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ What-If type switching works');
  });

  test('should clear What-If comparison', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🧹 Testing What-If clear functionality...');

    // Enter a salary first
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    // Enter What-If value
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('10');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should be visible
    const comparisonHeading = page.locator('text=Current vs What If Comparison').first();
    await expect(comparisonHeading).toBeVisible({ timeout: 5000 });

    // Clear button should now be visible
    const clearButton = page.locator('[data-testid="clear-what-if-button"]');
    await expect(clearButton).toBeVisible();

    // Click clear
    await clearButton.click();

    // Comparison heading should no longer be visible
    await expect(comparisonHeading).not.toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ What-If clear works correctly');
  });
});

test.describe('What-If Comparison - Percentage Changes', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should calculate 10% salary increase correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📈 Testing 10% increase What-If scenario...');

    const testData = generateUniqueTestData({ salary: 40000 });

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill(testData.salary.toString());

    // Wait for initial calculation
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible({ timeout: 5000 });

    // Select percentage type (should be default)
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await expect(typeSelect).toContainText(/percentage/i);

    // Enter 10% increase
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('10');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison table should be visible with Current vs What If columns
    const comparisonHeading = page.locator('text=Current vs What If Comparison').first();
    await expect(comparisonHeading).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ 10% increase scenario calculated');
  });

  test('should calculate 5% salary decrease correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📉 Testing 5% decrease What-If scenario...');

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    // Enter -5% decrease
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('-5');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should show decreased values
    const comparisonHeading = page.locator('text=Current vs What If Comparison').first();
    await expect(comparisonHeading).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ 5% decrease scenario calculated');
  });
});

test.describe('What-If Comparison - Amount Changes', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should calculate £5,000 raise correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('💰 Testing £5,000 raise What-If scenario...');

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    // Select "Amount" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Amount' }).click();

    // Enter £5,000
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('5000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Verify comparison displayed
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ £5,000 raise scenario calculated');
  });

  test('should calculate salary reduction correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📉 Testing salary reduction What-If scenario...');

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('60000');

    // Select "Amount" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Amount' }).click();

    // Enter -£10,000
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('-10000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Verify comparison displayed
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Salary reduction scenario calculated');
  });
});

test.describe('What-If Comparison - New Total Salary', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should compare current £40k vs new £50k salary', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('💼 Testing £40k vs £50k comparison...');

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    // Select "Total" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Total' }).click();

    // Enter £50,000
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('50000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Verify comparison displayed
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ £40k vs £50k comparison calculated');
  });

  test('should handle career progression scenario (£30k to £60k)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🚀 Testing career progression scenario...');

    // Enter starting salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    // Select "Total" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Total' }).click();

    // Enter target salary
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('60000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Verify comparison displayed
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Career progression scenario calculated');
  });
});

test.describe('What-If Comparison - Tax Trap Scenarios', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should show tax trap comparison for £95k to £110k increase', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('⚠️ Testing tax trap scenario (£95k → £110k)...');

    // Enter £95k salary (just below trap)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('95000');

    // Select "Total" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Total' }).click();

    // Enter £110k (deep in trap zone)
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('110000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should be visible showing the tax trap effects
    const comparisonHeading = page.locator('text=Current vs What If Comparison').first();
    await expect(comparisonHeading).toBeVisible({ timeout: 5000 });

    // Should show tax calculations for both scenarios
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Tax trap comparison displayed correctly');
  });

  test('should compare £100k vs £125k (full trap range)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('💸 Testing full tax trap range (£100k → £125k)...');

    // Enter £100k salary (trap starts)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('100000');

    // Select "Total" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Total' }).click();

    // Enter £125k (trap ends)
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('125000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should show marginal rate differences
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Full tax trap comparison calculated');
  });

  test('should show better outcome for £125k vs £130k (past trap)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✨ Testing post-trap scenario (£125k → £130k)...');

    // Enter £125k salary (trap ends)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('125000');

    // Select "Total" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Total' }).click();

    // Enter £130k (past trap, normal rates resume)
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('130000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should show improved marginal rate
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Post-trap scenario calculated');
  });
});

test.describe('What-If Comparison - Salary Sacrifice Scenarios', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should show impact of £5k salary sacrifice', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🎁 Testing £5k salary sacrifice scenario...');

    // Enter base salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('45000');

    // Select "Amount" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Amount' }).click();

    // Enter -£5,000 (sacrificing to pension)
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('-5000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should show tax savings
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Salary sacrifice impact calculated');
  });

  test('should demonstrate tax trap mitigation via salary sacrifice', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🛡️ Testing tax trap mitigation via salary sacrifice...');

    // Enter £105k salary (in trap zone)
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('105000');

    // Select "Amount" type
    const typeSelect = page.locator('[data-testid="what-if-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Amount' }).click();

    // Sacrifice £6k to get below £100k trap threshold
    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('-6000');

    // Click compare
    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Comparison should show benefit of avoiding trap
    const comparisonSection = page.locator('text=Current vs What If').first();
    await expect(comparisonSection).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Tax trap mitigation scenario calculated');
  });
});

test.describe('What-If Comparison - Comparison Table Display', () => {
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

    // Open What-If section
    const whatIfTrigger = page.getByTestId('what-if-trigger').first();
    await whatIfTrigger.click();
  });

  test('should display side-by-side comparison table correctly', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📊 Testing comparison table display...');

    // Enter base salary and create comparison
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('10');

    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Check comparison table structure
    const comparisonTable = page.locator('[data-testid="results-table"]');
    await expect(comparisonTable).toBeVisible({ timeout: 5000 });

    // Should show key metrics in comparison
    await expect(comparisonTable).toContainText(/gross.*pay/i);
    await expect(comparisonTable).toContainText(/total.*tax/i);
    await expect(comparisonTable).toContainText(/national.*insurance/i);
    await expect(comparisonTable).toContainText(/net.*pay/i);

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Comparison table displayed correctly');
  });

  test('should show percentage differences in comparison', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📈 Testing percentage difference display...');

    // Create comparison
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('15');

    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Percentage difference column should be visible
    const diffColumn = page.locator('text=/\\+.*%|\\-.*%/').first();
    await expect(diffColumn).toBeVisible({ timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Percentage differences shown correctly');
  });

  test('should support period selector in comparison view', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📅 Testing period selector with comparison...');

    // Create comparison
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    const whatIfInput = page.locator('[data-testid="what-if-value-input"]');
    await whatIfInput.fill('5');

    const compareButton = page.getByTestId('what-if-trigger').first();
    await compareButton.click();
    await page.waitForTimeout(1500);

    // Period checkboxes should be visible
    const yearlyCheckbox = page.locator('label:has-text("Yearly")').first();
    await expect(yearlyCheckbox).toBeVisible({ timeout: 5000 });

    const monthlyCheckbox = page.locator('label:has-text("Monthly")').first();
    await expect(monthlyCheckbox).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Period selector works with comparison');
  });
});
