/**
 * Payslip Regression Tests
 *
 * What bugs will these tests find?
 * - Payroll-style rounding regressions for monthly results
 * - Regression where salary sacrifice stops affecting NI or taxable pay
 * - Regression where non-taxable allowances stop adding to take-home
 *
 * Notes:
 * - This is "payslip-style" validation based on a real example, but our calculator
 *   uses HMRC-style rules/threshold conversions (so very small deltas vs some payroll
 *   systems can happen). This test is intended as a regression lock for our behavior.
 */

import { expect, type Page, test } from '@playwright/test';

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

async function getTableValue(
  page: Page,
  label: string,
  period: 'Monthly' | 'Yearly',
): Promise<number> {
  const table = page.getByTestId('results-table');
  const headerRow = table.locator('thead tr').first();
  const headers = headerRow.locator('th');
  const headerCount = await headers.count();

  let colIdx = -1;
  for (let i = 0; i < headerCount; i++) {
    const t = (await headers.nth(i).textContent())?.trim() ?? '';
    if (t === period) {
      colIdx = i;
      break;
    }
  }
  if (colIdx === -1) throw new Error(`${period} column not found in results table header`);

  const row = table.locator('tbody tr').filter({ hasText: label }).first();
  await expect(row, `Row "${label}" should be visible`).toBeVisible();

  const cells = row.locator(':scope > th, :scope > td');
  const cellText = await cells.nth(colIdx).textContent();
  if (!cellText) throw new Error(`${period} value cell empty for "${label}"`);
  return parseGBP(cellText);
}

test.describe('Payslip regression @rounding', () => {
  test('Monthly breakdown matches known example inputs @rounding', async ({ page }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });

    // Start from a clean baseline (localStorage can persist inputs between runs).
    await page.getByRole('button', { name: /reset/i }).click();

    // Example:
    // Salary: £49,131 annually
    // Pension salary sacrifice: 4%
    // Non-taxable allowance(s): £312 annually (e.g. "Home Base" shown separately on payslip)
    await page.getByTestId('salary-input').fill('49131');
    await page.getByTestId('pension-input').fill('4');
    await page.getByTestId('non-taxable-allowances-input').fill('312');

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    // Monthly targets (regression locks for our calculator behavior)
    expect(await getTableValue(page, 'Gross Pay', 'Monthly')).toBeCloseTo(4094.25, 2);
    expect(await getTableValue(page, 'Total Tax Due', 'Monthly')).toBeCloseTo(576.4, 2);
    expect(await getTableValue(page, 'National Insurance', 'Monthly')).toBeCloseTo(230.6, 2);
    expect(await getTableValue(page, 'Pension', 'Monthly')).toBeCloseTo(163.77, 2);
    expect(await getTableValue(page, 'Non-taxable allowance(s)', 'Monthly')).toBeCloseTo(26.0, 2);
    expect(await getTableValue(page, 'Net Pay', 'Monthly')).toBeCloseTo(3149.48, 2);

    // Regression lock: salary sacrifice should reduce marginal tax/NI on the "next £100".
    // For this scenario, marginal should be ~26.9% (not ~28% basic band, and definitely not a higher figure).
    const marginalCard = page.getByRole('button', { name: /Marginal Tax Rate/i });
    const marginalText = (await marginalCard.textContent()) ?? '';
    const marginal = parsePercent(marginalText);
    expect(marginal).toBeCloseTo(26.9, 1);
  });
});
