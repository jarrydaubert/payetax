/**
 * Calculator Critical Path Tests
 *
 * What bugs will these tests find?
 * - UI regressions that break core calculator usage (inputs -> calculate -> results)
 * - Regression where "non-taxable allowances" stop affecting net pay correctly
 * - Regression where marginal rate stops reflecting selected options (e.g. student loan)
 * - Regression where additional income sources stop showing/being included in totals
 */

import { expect, test, type Page } from '@playwright/test';

function parsePercent(text: string): number {
  const match = text.match(/(\d+(\.\d+)?)%/);
  if (!match) throw new Error(`Could not parse % from: ${text}`);
  return Number.parseFloat(match[1] ?? 'NaN');
}

function parseGBP(text: string): number {
  const cleaned = text.replace(/[£,]/g, '').trim();
  const n = Number.parseFloat(cleaned);
  if (Number.isNaN(n)) throw new Error(`Could not parse GBP from: ${text}`);
  return n;
}

async function getYearlyTableValue(page: Page, label: string): Promise<number> {
  const table = page.getByTestId('results-table');
  const headerRow = table.locator('thead tr').first();
  const headers = headerRow.locator('th');
  const headerCount = await headers.count();

  let yearlyIdx = -1;
  for (let i = 0; i < headerCount; i++) {
    const t = (await headers.nth(i).textContent())?.trim() ?? '';
    if (t === 'Yearly') {
      yearlyIdx = i;
      break;
    }
  }
  if (yearlyIdx === -1) throw new Error('Yearly column not found in results table header');

  const row = table.locator('tbody tr').filter({ hasText: label }).first();
  await expect(row, `Row "${label}" should be visible`).toBeVisible();

  const cells = row.locator(':scope > th, :scope > td');
  const cellText = await cells.nth(yearlyIdx).textContent();
  if (!cellText) throw new Error(`Yearly value cell empty for "${label}"`);
  return parseGBP(cellText);
}

test.describe('Calculator critical @critical', () => {
  test('Breakdown table renders and marginal responds to student loan @critical', async ({
    page,
  }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });

    // Set a stable baseline.
    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Breakdown' })).toBeVisible();

    const marginalCard = page.getByRole('button', { name: /Marginal Tax Rate/i });
    const baseMarginalText = (await marginalCard.textContent()) ?? '';
    const baseMarginal = parsePercent(baseMarginalText);

    // Sanity check: should be around 20% IT + 8% NI in the basic band.
    expect(baseMarginal).toBeGreaterThan(20);
    expect(baseMarginal).toBeLessThan(40);

    // Add a student loan plan and ensure marginal increases (student loan is included).
    await page.getByTestId('student-loan-select').click();
    await page.getByRole('option', { name: /Plan 2/i }).click();

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const newMarginalText = (await marginalCard.textContent()) ?? '';
    const newMarginal = parsePercent(newMarginalText);
    expect(newMarginal).toBeGreaterThan(baseMarginal);
  });

  test('Non-taxable allowances increase annual net pay by the same amount @critical', async ({
    page,
  }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const baseNet = await getYearlyTableValue(page, 'Net Pay');

    // Enter a clear annual amount and re-calc.
    await page.getByTestId('non-taxable-allowances-input').fill('1200');
    await page.getByTestId('calculate-button').click();

    const newNet = await getYearlyTableValue(page, 'Net Pay');
    expect(newNet).toBeCloseTo(baseNet + 1200, 1);
  });

  test('Additional rental income shows as "Other Income (No NI)" and is included in gross @critical', async ({
    page,
  }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const baseGross = await getYearlyTableValue(page, 'Gross Pay');

    // Add a rental income source: £1,000 annually.
    await page.getByText('Additional Income Sources').click();
    await page.getByTestId('add-income-source').click();

    await page.getByTestId('income-source-0-type').click();
    await page.getByRole('option', { name: 'Rental Income' }).click();

    await page.getByTestId('income-source-0-amount').fill('1000');

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    await expect(page.getByText('Other Income (No NI)')).toBeVisible();

    const newGross = await getYearlyTableValue(page, 'Gross Pay');
    expect(newGross).toBeCloseTo(baseGross + 1000, 1);
  });

  test('Plan 2 + Postgrad UI applies both loans @critical', async ({ page }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('salary-input').fill('50000');

    // Select Plan 2 and enable Postgrad add-on.
    await page.getByTestId('student-loan-select').click();
    await page.getByRole('option', { name: /Plan 2/i }).click();
    await expect(page.getByTestId('postgraduate-addon-checkbox')).toBeVisible();
    await page.getByTestId('postgraduate-addon-checkbox').check();

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    // Expected from current rules/rounding (also covered in golden-master):
    // Plan 2 (9%) + Postgrad (6%) at £50k.
    const sl = await getYearlyTableValue(page, 'Student Loan');
    expect(sl).toBeCloseTo(3677.76, 2);
  });
});
