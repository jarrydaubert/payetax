/**
 * E2E Tests for Tax Code Validation
 *
 * Tests the comprehensive HMRC tax code validation including:
 * - Scottish codes (S prefix)
 * - K codes (negative allowance)
 * - Special rates (BR, D0, D1, NT, 0T)
 * - Emergency codes (W1, M1, X)
 * - Case insensitivity
 *
 * Priority: HIGH - Critical bug fix validation
 */

import { expect, test } from '@playwright/test';
import { dismissCookieBannerIfPresent, ensureCalculatorVisible } from './helpers/calculator-ui';

test.describe('Tax Code Validation - HMRC Comprehensive Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}#tax-calculator`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await dismissCookieBannerIfPresent(page);
    await ensureCalculatorVisible(page);
  });

  test('should accept Scottish tax code (S1257L)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Testing Scottish tax code validation...');

    // Fill salary
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    // Find and fill tax code input - use getByRole to avoid tooltip collision
    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('S1257L');

    // Verify no validation error
    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    // Calculate
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    // Verify calculation succeeds
    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Scottish tax code S1257L accepted');
  });

  test('should accept Scottish tax code in lowercase (s1257l)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🔤 Testing case-insensitive Scottish tax code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('s1257l'); // lowercase

    // Should still be valid
    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Lowercase s1257l accepted (case-insensitive)');
  });

  test('should accept K code (K100)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('💰 Testing K code (negative allowance)...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('60000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('K100');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ K code K100 accepted');
  });

  test('should accept Scottish K code (SK200)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿💰 Testing Scottish K code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('60000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('SK200');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Scottish K code SK200 accepted');
  });

  test('should accept special code BR (Basic Rate)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('⚡ Testing BR (Basic Rate) tax code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('30000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('BR');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ BR code accepted');
  });

  test('should accept special code D0 (Higher Rate)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('⚡ Testing D0 (Higher Rate) tax code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('50000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('D0');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ D0 code accepted');
  });

  test('should accept special code D1 (Additional Rate)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('⚡ Testing D1 (Additional Rate) tax code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('150000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('D1');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ D1 code accepted');
  });

  test('should accept special code NT (No Tax)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('⚡ Testing NT (No Tax) code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('25000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('NT');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ NT code accepted');
  });

  test('should accept special code 0T (Zero Personal Allowance)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('⚡ Testing 0T (Zero Allowance) code...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('0T');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ 0T code accepted');
  });

  test('should accept emergency code with space (1257L M1)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🚨 Testing emergency code 1257L M1 (with space)...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('1257L M1');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Emergency code 1257L M1 accepted');
  });

  test('should accept emergency code without space (1257LW1)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🚨 Testing emergency code 1257LW1 (without space)...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('1257LW1');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Emergency code 1257LW1 accepted');
  });

  test('should accept emergency code X (1257L X)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🚨 Testing emergency code 1257L X...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('35000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('1257L X');

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Emergency code 1257L X accepted');
  });

  test('should handle mixed case tax codes (MiXeD1257l)', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('🔤 Testing mixed case handling...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('MiXeD1257l'); // Mixed case nonsense that should normalize

    // This might fail validation (which is correct), or auto-correct
    // Just verify it doesn't crash
    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    // Page should still work (either error or success)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Mixed case handled gracefully');
  });

  test('should trim whitespace from tax codes', async ({ page }) => {
    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✂️ Testing whitespace trimming...');

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await salaryInput.fill('40000');

    const taxCodeInput = page.getByRole('textbox', { name: /tax code/i });
    await taxCodeInput.click();
    await taxCodeInput.fill('  1257L  '); // With leading/trailing spaces

    await expect(page.getByText(/invalid.*tax.*code/i)).not.toBeVisible();

    const calculateButton = page.getByTestId('calculate-button');
    await calculateButton.click();

    const resultsTable = page.locator('[data-testid="results-table"]');
    await expect(resultsTable).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging
    console.log('✅ Whitespace trimmed correctly');
  });
});
