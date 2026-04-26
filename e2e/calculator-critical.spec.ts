/**
 * Calculator Critical Path Tests
 *
 * What bugs will these tests find?
 * - UI regressions that break core calculator usage (inputs -> calculate -> results)
 * - Regression where "non-taxable allowances" stop affecting net pay correctly
 * - Regression where marginal rate stops reflecting selected options (e.g. student loan)
 * - Regression where additional income sources stop showing/being included in totals
 */

import { expect, type Locator, type Page, test } from '@playwright/test';
import { dismissCookieBannerIfPresent, ensureCalculatorVisible } from './helpers/calculator-ui';

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

async function setLandscapeViewportIfPortrait(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= viewport.height) return;
  await page.setViewportSize({ width: viewport.height, height: viewport.width });
}

async function gotoCalculator(page: Page): Promise<void> {
  await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await dismissCookieBannerIfPresent(page);
  await ensureCalculatorVisible(page);
}

async function selectOption(
  page: Page,
  trigger: Locator,
  optionName: string | RegExp,
): Promise<void> {
  await trigger.click();
  const option = page.getByRole('option', { name: optionName }).first();
  await expect(option).toBeVisible();

  try {
    await option.click();
  } catch {
    try {
      await option.click({ force: true });
    } catch {
      // Safari mobile can report "outside viewport" for Radix options even when rendered.
      await option.evaluate((el) => (el as HTMLElement).click());
    }
  }
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
  test('Age select text is not visually truncated in the side panel @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    const ageTrigger = page.getByTestId('age-select');
    await expect(ageTrigger).toBeVisible();

    // If the trigger is too narrow, the selected value will truncate with ellipsis (scrollWidth > clientWidth).
    const hasOverflow = await ageTrigger.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasOverflow).toBe(false);
  });

  test('State Pension Age selection removes employee NI and increases net pay @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const baseNI = await getYearlyTableValue(page, 'National Insurance');
    const baseNet = await getYearlyTableValue(page, 'Net Pay');
    expect(baseNI).toBeGreaterThan(0);

    await selectOption(
      page,
      page.getByTestId('age-select'),
      /State Pension Age or over|Over State Pension Age/i,
    );
    await page.getByTestId('calculate-button').click();

    const niAtPensionAge = await getYearlyTableValue(page, 'National Insurance');
    const netAtPensionAge = await getYearlyTableValue(page, 'Net Pay');
    expect(niAtPensionAge).toBe(0);
    expect(netAtPensionAge).toBeGreaterThan(baseNet);
  });

  test('Marriage allowance prompt toggles with married + partner wage thresholds @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    await page.getByTestId('salary-input').fill('35000');
    await page.getByTestId('married-checkbox').click();
    await expect(page.getByTestId('partner-salary-input')).toBeVisible();
    await page.getByTestId('partner-salary-input').fill('10000');

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();
    await expect(page.getByText(/You May Qualify for Marriage Allowance/i)).toBeVisible();

    // Push partner salary above PA threshold; prompt should disappear.
    await page.getByTestId('partner-salary-input').fill('13000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByText(/You May Qualify for Marriage Allowance/i)).toBeHidden();
  });

  test('Breakdown table renders and marginal responds to student loan @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

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
    await selectOption(page, page.getByTestId('student-loan-select'), /Plan 2/i);

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const newMarginalText = (await marginalCard.textContent()) ?? '';
    const newMarginal = parsePercent(newMarginalText);
    expect(newMarginal).toBeGreaterThan(baseMarginal);
  });

  test('Non-taxable allowances increase annual net pay by the same amount @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

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
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const baseGross = await getYearlyTableValue(page, 'Gross Pay');

    // Add a rental income source: £1,000 annually.
    await page.getByText('Additional Income Sources').click();
    await page.getByTestId('add-income-source').click();

    await selectOption(page, page.getByTestId('income-source-0-type'), 'Rental Income');

    await page.getByTestId('income-source-0-amount').fill('1000');

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    await expect(page.getByText('Other Income (No NI)')).toBeVisible();

    const newGross = await getYearlyTableValue(page, 'Gross Pay');
    expect(newGross).toBeCloseTo(baseGross + 1000, 1);
  });

  test('Plan 2 + Postgrad UI applies both loans @critical', async ({ page }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    await page.getByTestId('salary-input').fill('50000');

    // Select Plan 2 and enable Postgrad add-on.
    await selectOption(page, page.getByTestId('student-loan-select'), /Plan 2/i);
    await expect(page.getByTestId('postgraduate-addon-checkbox')).toBeVisible();
    await page.getByTestId('postgraduate-addon-checkbox').check();

    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    // Expected from current 2026-2027 rules/rounding:
    // Plan 2 (9%) + Postgrad (6%) at £50k.
    const sl = await getYearlyTableValue(page, 'Student Loan');
    expect(sl).toBeCloseTo(3595.32, 2);
  });
});
