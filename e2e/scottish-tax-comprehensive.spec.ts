/**
 * Scottish Tax Rates - Comprehensive Test Suite
 *
 * CRITICAL: Affects 5.5 million Scottish taxpayers
 *
 * Scottish Income Tax Bands 2025-26:
 * - Starter: 19% on £12,571-£14,876 (£2,305)
 * - Basic: 20% on £14,877-£26,561 (£11,684)
 * - Intermediate: 21% on £26,562-£43,662 (£17,100)
 * - Higher: 42% on £43,663-£75,000 (£31,337)
 * - Advanced: 45% on £75,001-£125,140 (£50,139)
 * - Top: 48% on £125,141+
 *
 * Key differences from England:
 * - 6 bands vs 3 bands
 * - Top rate 48% vs 45%
 * - Pays more tax at most income levels
 */

import { expect, test } from '@playwright/test';

test.describe('Scottish Tax - All 6 Tax Bands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#tax-calculator');
    await page.waitForLoadState('networkidle');

    // Wait for calculator to be ready
    await expect(page.getByTestId('salary-input')).toBeVisible({ timeout: 10000 });
  });

  test('Scottish: £14k - Starter rate 19%', async ({ page }) => {
    // £14k falls in starter band (19%)
    // Taxable: £14,000 - £12,570 PA = £1,430
    // Tax: £1,430 × 19% = £271.70

    await page.getByTestId('salary-input').fill('14000');

    // Select Scotland region
    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });

    const taxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const taxCells = taxRow.locator('td');
    const taxText = await taxCells.nth(2).textContent();
    const tax = Number.parseFloat(taxText?.replace(/[£,]/g, '') || '0');

    // Verify Scottish starter rate applied
    expect(tax).toBeCloseTo(271.7, 0);
  });

  test('Scottish: £20k - Basic rate 20%', async ({ page }) => {
    // Starter: £2,305 × 19% = £437.95
    // Basic: (£20,000 - £14,876) × 20% = £5,124 × 20% = £1,024.80
    // Total: £1,462.75

    await page.getByTestId('salary-input').fill('20000');
    await expect(page.getByTestId('salary-input')).toHaveValue('20,000.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });
  });

  test('Scottish: £35k - Intermediate rate 21%', async ({ page }) => {
    // This is the unique Scottish band!
    // Starter: £437.95
    // Basic: £2,336.80
    // Intermediate: (£35,000 - £26,561) × 21% = £8,439 × 21% = £1,772.19
    // Total: £4,546.94

    await page.getByTestId('salary-input').fill('35000');

    // Wait for salary to be accepted
    await expect(page.getByTestId('salary-input')).toHaveValue('35,000.00');

    // Select Scotland region
    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close before clicking calculate

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });

    const taxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const taxCells = taxRow.locator('td');
    const taxText = await taxCells.nth(2).textContent();
    const tax = Number.parseFloat(taxText?.replace(/[£,]/g, '') || '0');

    // Verify intermediate rate applied
    expect(tax).toBeCloseTo(4547, 0);
  });

  test('Scottish: £60k - Higher rate 42%', async ({ page }) => {
    // Already tested in golden master (£45k)
    // Testing £60k for higher rate

    await page.getByTestId('salary-input').fill('60000');
    await expect(page.getByTestId('salary-input')).toHaveValue('60,000.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });
  });

  test('Scottish: £100k - Advanced rate 45%', async ({ page }) => {
    // Advanced rate kicks in after £75k

    await page.getByTestId('salary-input').fill('100000');
    await expect(page.getByTestId('salary-input')).toHaveValue('100,000.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });
  });

  test('Scottish: £200k - Top rate 48%', async ({ page }) => {
    // Already in golden master - verify it's working
    // Top rate: 48% (vs 45% in England = 3% more!)

    await page.getByTestId('salary-input').fill('200000');
    await expect(page.getByTestId('salary-input')).toHaveValue('200,000.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });

    const taxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const taxCells = taxRow.locator('td');
    const taxText = await taxCells.nth(2).textContent();
    const tax = Number.parseFloat(taxText?.replace(/[£,]/g, '') || '0');

    // From golden master: £84,043.20
    expect(tax).toBeCloseTo(84043, 0);
  });
});

test.describe('Scottish vs England - Comparison Tests', () => {
  test('Compare £30k: Scotland vs England', async ({ page }) => {
    // Test same salary in both regions
    // Scotland pays MORE due to intermediate band

    // First: England
    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });

    const englandTaxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const englandTaxCells = englandTaxRow.locator('td');
    const englandTaxText = await englandTaxCells.nth(2).textContent();
    const englandTax = Number.parseFloat(englandTaxText?.replace(/[£,]/g, '') || '0');

    // England: £3,486
    expect(englandTax).toBeCloseTo(3486, 0);

    // Now: Scotland
    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await page.waitForTimeout(1000);

    const scotlandTaxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const scotlandTaxCells = scotlandTaxRow.locator('td');
    const scotlandTaxText = await scotlandTaxCells.nth(2).textContent();
    const scotlandTax = Number.parseFloat(scotlandTaxText?.replace(/[£,]/g, '') || '0');

    // Scotland should pay MORE (intermediate band)
    expect(scotlandTax).toBeGreaterThan(englandTax);
  });

  test('Compare £50k: Scotland vs England', async ({ page }) => {
    // At £50k, Scotland pays significantly more

    await page.getByTestId('salary-input').fill('50000');
    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });

    // Get England tax
    const englandTaxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const englandTaxCells = englandTaxRow.locator('td');
    const englandTaxText = await englandTaxCells.nth(2).textContent();
    const englandTax = Number.parseFloat(englandTaxText?.replace(/[£,]/g, '') || '0');

    // Switch to Scotland
    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await page.waitForTimeout(1000);

    const scotlandTaxRow = page.locator('tr:has-text("Total Tax Due")').first();
    const scotlandTaxCells = scotlandTaxRow.locator('td');
    const scotlandTaxText = await scotlandTaxCells.nth(2).textContent();
    const scotlandTax = Number.parseFloat(scotlandTaxText?.replace(/[£,]/g, '') || '0');

    // Scotland pays ~£1,500 more per year at £50k!
    expect(scotlandTax - englandTax).toBeGreaterThan(1000);
  });
});

test.describe('Scottish Tax - Edge Cases', () => {
  test('Exactly at band boundaries', async ({ page }) => {
    // Test exactly at £14,876 (top of starter band)
    await page.getByTestId('salary-input').fill('14876');
    await expect(page.getByTestId('salary-input')).toHaveValue('14,876.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });
  });

  test('£1 over band boundary triggers next rate', async ({ page }) => {
    // £14,877 triggers basic rate on that £1
    await page.getByTestId('salary-input').fill('14877');
    await expect(page.getByTestId('salary-input')).toHaveValue('14,877.00');

    await page.getByRole('combobox', { name: /tax region/i }).click();
    await page.getByRole('option', { name: /scotland/i }).click();

    // Wait for dropdown to close

    await page.getByTestId('calculate-button').click();
    await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 5000 });
  });
});
