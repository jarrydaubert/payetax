/**
 * Calculator Critical Path Tests
 *
 * What bugs will these tests find?
 * - UI regressions that break core calculator usage (inputs -> calculate -> results)
 * - Regression where "non-taxable allowances" stop affecting net pay correctly
 * - Regression where marginal rate stops reflecting selected options (e.g. student loan)
 * - Regression where additional income sources stop showing/being included in totals
 * - Regression where amount fields scale pence, drop minus signs or turn malformed text into £0,
 *   or leave results for a rejected amount on screen
 */

import { expect, type Locator, type Page, test } from '@playwright/test';
import { parseCurrencyInput } from '../src/lib/currencyInput';
import payrollFixtures from '../src/test/payeVerificationFixtures/salary-guides-payroll-2026-27.json';
import {
  dismissCookieBannerIfPresent,
  ensureCalculatorVisible,
  openCalculatorForAmountEntry,
} from './helpers/calculator-ui';

function parsePercent(text: string): number {
  const match = text.match(/(\d+(\.\d+)?)%/);
  if (!match) throw new Error(`Could not parse % from: ${text}`);
  return Number.parseFloat(match[1] ?? 'NaN');
}

test.describe('MC-03 input integrity @critical', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await openCalculatorForAmountEntry(page, isMobile);
    await page.getByTestId('married-checkbox').click();
    await expect(page.getByTestId('partner-salary-input')).toBeHidden();
  });

  async function typeAmount(field: Locator, text: string) {
    await field.click();
    await field.press('ControlOrMeta+A');
    await field.pressSequentially(text);
    await expect(field).toHaveValue(text);
  }

  const emailAction = (page: Page) =>
    page.getByRole('button', { name: 'Email tax calculation results' });

  test('valid salary edit and blur require Calculate, then email matches the displayed inputs', async ({
    page,
  }) => {
    const sent: unknown[] = [];
    await page.route('**/api/send-results', async (route) => {
      sent.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true } });
    });
    const salary = page.getByTestId('salary-input');
    await typeAmount(salary, '30000');
    await page.getByTestId('calculate-button').click();
    expect(await getYearlyTableValue(page, 'Gross Pay')).toBe(30000);
    await typeAmount(salary, '40000');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await expect(emailAction(page)).toHaveCount(0);
    await salary.press('Tab');
    await expect(salary).toHaveValue('40,000.00');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /to Pension$/ })).toHaveCount(0);
    expect(sent).toEqual([]);
    await page.getByTestId('calculate-button').press('Enter');
    expect(await getYearlyTableValue(page, 'Gross Pay')).toBe(40000);
    await emailAction(page).click();
    await page.getByLabel('Email address for results').fill('mc03@example.com');
    await page.getByRole('button', { name: /^Email Results$/ }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Results sent' })).toBeVisible();
    expect(sent).toEqual([
      expect.objectContaining({
        input: expect.objectContaining({
          salary: 40000,
          payPeriod: 'annually',
          pensionContribution: 0,
        }),
      }),
    ]);
  });

  test('invalid drafts stay blocked through recovery until explicit Calculate', async ({
    page,
  }) => {
    const salary = page.getByTestId('salary-input');
    await typeAmount(salary, '30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('tax-results')).toBeVisible();
    await typeAmount(salary, '-500');
    await page.getByTestId('calculate-button').click();
    await expect(salary).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await expect(emailAction(page)).toHaveCount(0);
    await typeAmount(salary, '40000');
    await salary.press('Enter');
    await expect(salary).toHaveValue('40,000.00');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await page.getByTestId('calculate-button').press('Enter');
    expect(await getYearlyTableValue(page, 'Gross Pay')).toBe(40000);
  });

  test('pension edit removes stale suggestions; applying a fresh suggestion only edits input', async ({
    page,
  }) => {
    await typeAmount(page.getByTestId('salary-input'), '120000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByRole('button', { name: 'Add £20,000 to Pension' })).toBeVisible();
    const pension = page.getByTestId('pension-input');
    await typeAmount(pension, '5');
    await expect(page.getByRole('button', { name: /to Pension$/ })).toHaveCount(0);
    await pension.press('Tab');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await page.getByTestId('calculate-button').click();
    await page.getByRole('button', { name: 'Add £14,000 to Pension' }).click();
    await expect(pension).toHaveValue('20,000.00');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await expect(emailAction(page)).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Calculate again' })).toBeVisible();
    await pension.focus();
    await pension.press('Tab');
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    await page.getByTestId('calculate-button').click();
    expect(await getYearlyTableValue(page, 'Pension')).toBe(20000);
    await expect(page.getByRole('button', { name: /to Pension$/ })).toHaveCount(0);
  });

  test('an already-open email form cannot send after a concurrent input edit', async ({ page }) => {
    const sent: unknown[] = [];
    await page.route('**/api/send-results', async (route) => {
      sent.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true } });
    });
    await typeAmount(page.getByTestId('salary-input'), '30000');
    await page.getByTestId('calculate-button').click();
    await emailAction(page).click();
    await page.getByLabel('Email address for results').fill('mc03@example.com');
    // Model another mounted consumer editing while this dialog is open. Dispatch the stale
    // form in the same task, before React has necessarily removed its DOM.
    await page.evaluate(() => {
      const salary = document.querySelector<HTMLInputElement>('[data-testid="salary-input"]');
      const form = document.querySelector<HTMLFormElement>('[role="dialog"] form');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (!(salary && form && setter)) throw new Error('Missing mounted salary/email form');
      setter.call(salary, '40000');
      salary.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('tax-results')).toHaveCount(0);
    expect(sent).toEqual([]);
  });
});

test.describe('MC-02 pension units and restoration @critical', () => {
  async function typePension(pension: Locator, text: string) {
    await pension.click();
    await expect(pension).toBeFocused();
    await pension.press('ControlOrMeta+A');
    await pension.pressSequentially(text);
    await expect(pension).toHaveValue(text);
    await pension.press('Tab');
  }

  async function switchPensionUnit(page: Page, to: 'percentage' | 'amount') {
    const trigger = page.getByTestId('pension-type-select');
    await trigger.focus();
    await trigger.press('Space');
    await expect(page.getByRole('listbox')).toBeVisible();
    const option =
      to === 'percentage' ? page.getByRole('option').first() : page.getByRole('option').last();
    await option.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toBeFocused();
  }

  async function restorePension(page: Page, value: number, type: 'percentage' | 'amount') {
    await page.addInitScript(
      ({ value, type }) => {
        if (localStorage.getItem('tax-calculator-storage') !== null) return;
        localStorage.setItem(
          'tax-calculator-storage',
          JSON.stringify({
            state: {
              input: {
                salary: 60000,
                taxYear: '2026-2027',
                taxCode: '1257L',
                pensionContribution: value,
                pensionContributionType: type,
              },
            },
            version: 0,
          }),
        );
      },
      { value, type },
    );
  }

  async function openPensionCalculator(page: Page, touch: boolean, reload = false) {
    if (reload) await page.reload({ waitUntil: 'domcontentloaded' });
    else await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);
    await ensureCalculatorVisible(page);
    const married = page.getByTestId('married-checkbox');
    const checked = (await married.getAttribute('aria-checked')) !== 'true';
    // Readiness is a mounted React interaction, independent of external analytics requests.
    await expect(async () => {
      if ((await married.getAttribute('aria-checked')) !== String(checked)) {
        if (touch) await married.tap();
        else await married.press('Space');
      }
      await expect(married).toHaveAttribute('aria-checked', String(checked), { timeout: 1000 });
      if (checked)
        await expect(page.getByTestId('partner-salary-input')).toBeVisible({ timeout: 1000 });
      else await expect(page.getByTestId('partner-salary-input')).toBeHidden({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
  }

  for (const [type, value, display, annual] of [
    ['percentage', 5.25, '5.25', 3150],
    ['amount', 5000.25, '5,000.25', 5000.25],
  ] as const) {
    test(`valid restored ${value} ${type} keeps its meaning`, async ({ page, isMobile }) => {
      await restorePension(page, value, type);
      await openPensionCalculator(page, isMobile);
      const pension = page.getByTestId('pension-input');
      await expect(pension).toHaveValue(display);
      await expect(pension).not.toHaveAttribute('aria-invalid');
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      await page.getByTestId('calculate-button').press('Enter');
      expect(await getYearlyTableValue(page, 'Pension')).toBe(annual);
    });
  }

  for (const recovery of ['percentage', 'amount'] as const) {
    test(`legacy 5000% is preserved, blocked and recoverable as ${recovery}`, async ({
      page,
      isMobile,
    }) => {
      await restorePension(page, 5000, 'percentage');
      await openPensionCalculator(page, isMobile);
      const pension = page.getByTestId('pension-input');
      const calculate = page.getByTestId('calculate-button');
      const results = page.getByTestId('tax-results');
      await expect(pension).toHaveValue('5000');
      await expect(pension).toHaveAttribute('aria-invalid', 'true');
      await expect(pension).toHaveAccessibleDescription(/no more than 100%/);
      await pension.focus();
      await pension.press('Tab');
      await calculate.press('Enter');
      await expect(
        page.getByRole('alert').filter({ hasText: 'Correct the invalid amount in Pension' }),
      ).toBeVisible();
      await expect(results).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Email tax calculation results' })).toHaveCount(
        0,
      );
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('tax-calculator-storage') ?? '{}'),
      );
      expect(saved.state.input.pensionContribution).toBe(5000);
      expect(saved.state.input.pensionContributionType).toBe('percentage');
      await openPensionCalculator(page, isMobile, true);
      await expect(pension).toHaveAttribute('aria-invalid', 'true');

      if (recovery === 'amount') {
        await switchPensionUnit(page, 'amount');
        await expect(pension).toHaveValue('0.00');
        await expect(page.getByText(/Changing between % and £ resets/)).toBeVisible();
      }
      await typePension(pension, recovery === 'amount' ? '5000' : '5.25');
      await expect(pension).not.toHaveAttribute('aria-invalid');
      await expect(results).toHaveCount(0);
      await calculate.press('Enter');
      expect(await getYearlyTableValue(page, 'Pension')).toBe(recovery === 'amount' ? 5000 : 3150);
      await openPensionCalculator(page, isMobile, true);
      await expect(pension).toHaveValue(recovery === 'amount' ? '5,000.00' : '5.25');
      await expect(pension).not.toHaveAttribute('aria-invalid');
      await expect(results).toHaveCount(0);
    });
  }

  for (const [from, value] of [
    ['amount', 50],
    ['amount', 5000],
    ['percentage', 5.25],
    ['percentage', 100],
  ] as const) {
    test(`switching ${value} ${from} explains reset and validates the new unit`, async ({
      page,
      isMobile,
    }) => {
      await restorePension(page, value, from);
      await openPensionCalculator(page, isMobile);
      const pension = page.getByTestId('pension-input');
      const calculate = page.getByTestId('calculate-button');
      await calculate.press('Enter');
      await expect(page.getByTestId('tax-results')).toBeVisible();
      await switchPensionUnit(page, from === 'amount' ? 'percentage' : 'amount');
      await expect(pension).toHaveValue('0.00');
      await expect(page.getByText(/Changing between % and £ resets/)).toBeVisible();
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      await typePension(pension, from === 'amount' ? '100.01' : '10000000.01');
      await expect(pension).toHaveAttribute('aria-invalid', 'true');
      await expect(pension).toHaveAccessibleDescription(/no more than/);
      await calculate.press('Enter');
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      await typePension(pension, from === 'amount' ? '5.25' : '5000.25');
      await expect(pension).not.toHaveAttribute('aria-invalid');
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      await calculate.press('Enter');
      expect(await getYearlyTableValue(page, 'Pension')).toBe(from === 'amount' ? 3150 : 5000.25);
    });
  }
});

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

test.describe('MC-09 pension suggestion @critical', () => {
  async function typeCommittedAmount(field: Locator, text: string) {
    await field.click();
    await expect(field).toBeFocused();
    await field.press('ControlOrMeta+A');
    await field.pressSequentially(text);
    await expect(field).toHaveValue(text);
    await field.press('Enter');
    await expect(field).toHaveValue(
      Number(text).toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  }

  const expected = payrollFixtures.scenarios.find(
    (scenario) => scenario.id === 'salary-guide-100k-base',
  )?.expected;
  if (!expected) throw new Error('Missing independent £100k payroll fixture');

  for (const scenario of [
    {
      period: 'Annually',
      salary: '110000',
      pension: '5000',
      amount: true,
      addition: '5,000',
      total: '10,000.00',
      annualPension: 10000,
      target: 10000,
      annualGross: 110000,
      periodsPerYear: 1,
    },
    {
      period: 'Monthly',
      salary: '10000',
      pension: '5',
      amount: false,
      addition: '14,000',
      total: '1,666.67',
      annualPension: 20000.04,
      target: 20000,
      annualGross: 120000,
      periodsPerYear: 12,
    },
    {
      period: 'Weekly',
      salary: '2000',
      pension: '0',
      amount: true,
      addition: '4,000',
      total: '76.93',
      annualPension: 4000.36,
      target: 4000,
      annualGross: 104000,
      periodsPerYear: 52,
    },
    {
      period: 'Hourly',
      salary: '50',
      pension: '0',
      amount: true,
      addition: '4,000',
      total: '1.93',
      annualPension: 4014.4,
      target: 4000,
      annualGross: 104000,
      periodsPerYear: 2080,
    },
    {
      period: 'Monthly',
      salary: '9333.33',
      pension: '0',
      amount: true,
      addition: '12,000',
      total: '1,000.00',
      annualPension: 12000,
      target: 12000,
      annualGross: 111999.96,
      periodsPerYear: 12,
    },
  ]) {
    test(`${scenario.period}, £${scenario.addition}: annual addition, existing pension and explicit Calculate`, async ({
      page,
    }) => {
      await gotoCalculator(page);
      await selectOption(
        page,
        page.getByRole('combobox', { name: 'Pay period', exact: true }),
        new RegExp(`^${scenario.period}$`),
      );
      await selectOption(page, page.getByTestId('tax-year-select'), /2026.*2027/);
      await page.getByTestId('tax-code-input').fill('');
      await typeCommittedAmount(page.getByTestId('salary-input'), scenario.salary);
      if (scenario.amount) {
        await page.getByTestId('pension-type-select').click();
        await page.getByRole('option').nth(1).click();
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(page.getByTestId('pension-type-select')).toBeFocused();
      }
      await typeCommittedAmount(page.getByTestId('pension-input'), scenario.pension);
      await page.getByTestId('calculate-button').press('Enter');
      const apply = page.getByRole('button', { name: `Add £${scenario.addition} to Pension` });
      await expect(apply).toBeVisible();
      await expect(page.getByText(/each year to avoid this trap/)).toBeVisible();
      await apply.click();

      await expect(page.getByTestId('pension-input')).toHaveValue(scenario.total);
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Email tax calculation results' })).toHaveCount(
        0,
      );
      await expect(page.getByRole('button', { name: /to Pension$/ })).toHaveCount(0);
      await expect(page.getByRole('status')).toContainText(
        'Calculate again to update your results',
      );
      await expect(page.getByRole('status')).toBeVisible();
      if (scenario.annualPension > scenario.target) {
        await expect(page.getByRole('status')).toContainText('Rounded up to the next penny');
      } else {
        await expect(page.getByRole('status')).not.toContainText('Rounded up');
      }
      if (!scenario.amount) {
        await expect(page.getByRole('status')).toContainText(
          'Your existing 5% pension was converted to a £ amount',
        );
      }

      const stored = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('tax-calculator-storage') ?? 'null')?.state.input
            .pensionContribution,
      );
      expect(stored).toBe(Number(scenario.total.replaceAll(',', '')));
      expect(parseCurrencyInput(String(stored))).toEqual({ status: 'valid', value: stored });
      expect(stored * scenario.periodsPerYear).toBeGreaterThanOrEqual(scenario.target);
      expect(stored * scenario.periodsPerYear - scenario.target).toBeLessThan(
        0.01 * scenario.periodsPerYear,
      );
      await page.reload({ waitUntil: 'networkidle' });
      await expect(page.getByTestId('pension-input')).toHaveValue(scenario.total);
      await expect(page.getByTestId('tax-results')).toHaveCount(0);
      expect(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('tax-calculator-storage') ?? 'null')?.state.input
              .pensionContribution,
        ),
      ).toBe(stored);

      await page.getByTestId('calculate-button').press('Enter');
      await expect(page.getByTestId('results-table')).toBeVisible();
      expect(await getYearlyTableValue(page, 'Pension')).toBe(scenario.annualPension);
      expect(await getYearlyTableValue(page, 'Estimated Tax-Free Amount')).toBe(12570);
      if (scenario.period === 'Annually') {
        expect(await getYearlyTableValue(page, 'Total Tax Due')).toBe(expected.incomeTaxAnnual);
        expect(await getYearlyTableValue(page, 'National Insurance')).toBe(
          expected.nationalInsuranceAnnual,
        );
        expect(await getYearlyTableValue(page, 'Net Pay')).toBe(expected.netPayAnnual);
      } else {
        const cashPay = scenario.annualGross - scenario.annualPension;
        expect(cashPay).toBeLessThanOrEqual(100000);
        // Hand-derived changes from the independent £100k fixture: monthly taxable
        // pay is floored to whole pounds before 40% PAYE; NI falls at 2%, rounded monthly.
        const wholePoundsLost =
          Math.floor(100000 / 12 - 1048.26) - Math.floor(cashPay / 12 - 1048.26);
        const tax =
          (Math.round((expected.incomeTaxAnnual ?? NaN) * 100) - wholePoundsLost * 40 * 12) / 100;
        const ni =
          (Math.round(((4189 - 1048) * 0.08 + (cashPay / 12 - 4189) * 0.02) * 100) * 12) / 100;
        expect(await getYearlyTableValue(page, 'Total Tax Due')).toBe(tax);
        expect(await getYearlyTableValue(page, 'National Insurance')).toBe(ni);
        expect(tax).toBeLessThanOrEqual(expected.incomeTaxAnnual ?? NaN);
        expect(ni).toBeLessThanOrEqual(expected.nationalInsuranceAnnual ?? NaN);
        expect(await getYearlyTableValue(page, 'Net Pay')).toBeCloseTo(cashPay - tax - ni, 2);
      }
      await expect(page.getByText('Tax Trap Alert', { exact: true })).toHaveCount(0);
    });
  }
});

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

  test('Additional income keeps its pence instead of being scaled up @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    await page.getByTestId('salary-input').fill('30000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();
    const baseGross = await getYearlyTableValue(page, 'Gross Pay');

    await page.getByText('Additional Income Sources').click();
    await page.getByTestId('add-income-source').click();
    const amount = page.getByTestId('income-source-0-amount');

    // Typed with a decimal point, then pasted with £ and a thousands comma: both are £1,234.56.
    for (const text of ['1234.56', '£1,234.56']) {
      await amount.fill(text);
      await page.getByTestId('calculate-button').click();
      await expect(amount).toHaveValue('1,234.56');
      await expect(page.getByTestId('results-table')).toBeVisible();
      const gross = await getYearlyTableValue(page, 'Gross Pay');
      expect(gross).toBeCloseTo(baseGross + 1234.56, 2);
    }
  });

  test('Rejected amounts show an error, remove old results and are never calculated @critical', async ({
    page,
  }) => {
    await setLandscapeViewportIfPortrait(page);
    await gotoCalculator(page);

    const salary = page.getByTestId('salary-input');
    const results = page.getByTestId('results-table');
    const calculate = page.getByTestId('calculate-button');

    await salary.fill('30000');
    await calculate.click();
    await expect(results).toBeVisible();

    // A negative salary is not turned into a positive one. Results and email go as soon as it is
    // typed, before the field is left, and Calculate activated without moving focus refuses.
    await salary.fill('-500');
    await expect(salary).toBeFocused();
    await expect(results).toBeHidden();
    await expect(page.getByRole('button', { name: 'Email tax calculation results' })).toBeHidden();
    await calculate.dispatchEvent('click');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Correct the invalid amount in Salary' }),
    ).toBeVisible();
    await expect(results).toBeHidden();
    await salary.focus();
    await salary.press('Tab');
    await expect(salary).toHaveValue('-500');
    await expect(salary).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByText('Enter an amount of £0 or more. Negative amounts are not supported.'),
    ).toBeVisible();
    await expect(results).toBeHidden();
    await calculate.click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Correct the invalid amount in Salary' }),
    ).toBeVisible();
    await expect(results).toBeHidden();

    // Correcting it recovers normally.
    await salary.fill('30000');
    await calculate.click();
    await expect(results).toBeVisible();
    await expect(salary).not.toHaveAttribute('aria-invalid');
    const baseGross = await getYearlyTableValue(page, 'Gross Pay');

    // Malformed income text is not treated as £0, and stays visible until dealt with.
    await page.getByText('Additional Income Sources').click();
    await page.getByTestId('add-income-source').click();
    const amount = page.getByTestId('income-source-0-amount');
    await amount.fill('1.2.3');
    await amount.press('Tab');
    await expect(
      page.getByText('Enter an amount in pounds and pence, like 1,234.56.'),
    ).toBeVisible();
    await expect(results).toBeHidden();
    await page.getByText('Additional Income Sources').click();
    await expect(amount).toBeVisible();
    await calculate.click();
    await expect(results).toBeHidden();

    await page.getByRole('button', { name: 'Remove income source 1' }).click();
    await calculate.click();
    await expect(results).toBeVisible();
    expect(await getYearlyTableValue(page, 'Gross Pay')).toBeCloseTo(baseGross, 2);

    // Reset activated without moving focus discards rejected text being typed, so it cannot
    // silently stop blocking while still on screen.
    const pension = page.getByTestId('pension-input');
    await pension.fill('abc');
    await page.getByRole('button', { name: /Reset/ }).dispatchEvent('click');
    await expect(pension).toHaveValue('0.00');
    await expect(pension).not.toHaveAttribute('aria-invalid');
    await pension.blur();
    await expect(pension).toHaveValue('0.00');
    await salary.fill('30000');
    await calculate.click();
    await expect(results).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email tax calculation results' })).toBeVisible();
    await expect(pension).not.toHaveAttribute('aria-invalid');
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
    // Plan 2 (£154) + Postgrad (£145) per month at £50k, with each
    // loan-type deduction rounded down to a whole pound before summing.
    const sl = await getYearlyTableValue(page, 'Student Loan');
    expect(sl).toBe(3588);
  });
});

test('focus, drafts, empty fields and pension unit changes preserve result integrity @critical', async ({
  page,
}) => {
  await gotoCalculator(page);
  await page.getByTestId('salary-input').fill('60000');
  await page.getByTestId('tax-code-input').fill('1257L');
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toBeVisible();
  const salary = page.getByTestId('salary-input');
  await salary.focus();
  await salary.press('Tab');
  await expect(salary).toHaveValue('60,000.00');
  await expect(page.getByTestId('tax-results')).toBeVisible();
  await salary.fill('70000');
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Email tax calculation results' })).toHaveCount(0);
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toBeVisible();
  await salary.fill('');
  await salary.press('Tab');
  await expect(salary).toHaveValue('');
  await expect(salary).toHaveAttribute('aria-invalid', 'true');
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  await salary.fill('60000');
  const pensionType = page.getByTestId('pension-type-select');
  await pensionType.click();
  await page.getByRole('option').last().click();
  await page.getByTestId('pension-input').fill('5000');
  await page.getByTestId('calculate-button').click();
  await pensionType.click();
  await page.getByRole('option').first().click();
  await expect(page.getByTestId('pension-input')).toHaveValue('0.00');
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toBeVisible();
});
