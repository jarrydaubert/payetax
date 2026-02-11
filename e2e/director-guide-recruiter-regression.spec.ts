import { expect, type Locator, type Page, test } from '@playwright/test';

function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.-]/g, '') || '0');
}

async function expectNumericValue(input: Locator, expected: number): Promise<void> {
  await expect.poll(async () => parseCurrency(await input.inputValue())).toBe(expected);
}

async function fillCurrencyInput(input: Locator, value: number): Promise<void> {
  await expect(input).toBeEditable();
  await input.fill('');
  await input.type(String(value));
  await input.blur();
}

async function dismissWelcomeDialogIfPresent(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Welcome to the Director Pay Calculator' });
  const isVisible = await dialog.isVisible({ timeout: 1500 }).catch(() => false);
  if (!isVisible) return;

  await page.getByRole('button', { name: "Got it, let's start" }).click();
  await expect(dialog).toBeHidden();
}

async function selectEnglandRegion(page: Page): Promise<void> {
  await page.getByTestId('director-region-select').click();
  await page.getByRole('option', { name: 'England' }).click();
}

test.describe('Director Guide recruiter regression', () => {
  test('annual recruiter case keeps expected strategy outputs', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await dismissWelcomeDialogIfPresent(page);
    await page.locator('aside').getByRole('button', { name: 'Annual', exact: true }).click();

    const revenueInput = page.getByTestId('director-revenue-input');
    const expensesInput = page.getByTestId('director-expenses-input');

    await fillCurrencyInput(revenueInput, 10311);
    await fillCurrencyInput(expensesInput, 2499);
    await expectNumericValue(revenueInput, 10311);
    await expectNumericValue(expensesInput, 2499);

    await selectEnglandRegion(page);

    await expect(page.getByRole('heading', { name: 'Choose Your Strategy' })).toBeVisible();

    const allSalaryCard = page.getByRole('button', { name: /All Salary/i });
    const allDividendsCard = page.getByRole('button', { name: /All Dividends/i });

    await expect(allSalaryCard).toContainText(/£7,445/);
    await expect(allDividendsCard).toContainText(/£6,328/);

    await expect(page.getByText('Your Setup')).toBeVisible();
    await expect(page.getByText(/Not set\./i)).toBeVisible();
  });

  test('monthly recruiter case keeps safe draw and buffer shortfall outputs', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await dismissWelcomeDialogIfPresent(page);

    await page.locator('aside').getByRole('button', { name: 'Monthly' }).click();

    const monthlyIncomeInput = page.getByRole('textbox', { name: 'Monthly Contract Income' });
    const monthlyExpensesInput = page.getByRole('textbox', { name: 'Monthly Business Expenses' });
    const cashInBankInput = page.getByRole('textbox', { name: 'Cash In Bank' });
    const minimumDrawInput = page.getByRole('textbox', { name: 'Minimum Monthly Draw' });
    const runwayMonthsInput = page.getByRole('spinbutton', { name: 'Runway Target (months)' });

    await fillCurrencyInput(monthlyIncomeInput, 859);
    await fillCurrencyInput(monthlyExpensesInput, 200);

    await page.getByRole('combobox', { name: 'Contract Start Month' }).click();
    await page.getByRole('option', { name: 'April' }).click();

    await fillCurrencyInput(cashInBankInput, 889);
    await fillCurrencyInput(minimumDrawInput, 533);
    await runwayMonthsInput.fill('3');
    await runwayMonthsInput.blur();

    await expectNumericValue(monthlyIncomeInput, 859);
    await expectNumericValue(monthlyExpensesInput, 200);
    await expectNumericValue(cashInBankInput, 889);
    await expectNumericValue(minimumDrawInput, 533);
    await expectNumericValue(runwayMonthsInput, 3);

    await selectEnglandRegion(page);

    await expect(page.getByRole('heading', { name: 'Choose Your Strategy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Safe Monthly Draw' })).toBeVisible();
    await expect(page.getByText('£533/mo')).toBeVisible();
    await expect(page.getByText('£2,199')).toBeVisible();
    await expect(page.getByText('Shortfall £1,310')).toBeVisible();
  });
});
