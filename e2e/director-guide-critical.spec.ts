/**
 * Director Intelligence Critical Path Tests
 *
 * What bugs will these tests find?
 * - Regressions that stop `/tools/director-guide` from producing results
 * - Survival Mode regressions (profit <= 0 should show Survival panel and hide strategy UI)
 * - VAT warning gating regressions (VAT warnings must show based on revenue even in Survival Mode)
 * - Email flow regressions (dialog opens and POST succeeds)
 */

import { expect, type Locator, type Page, test } from '@playwright/test';

function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.-]/g, '') || '0');
}

function visibleInputByTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]:visible`).first();
}

async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) {
      return candidate;
    }
  }
  return null;
}

async function expectNumericValue(input: Locator, expected: number): Promise<void> {
  await expect.poll(async () => parseCurrency(await input.inputValue())).toBe(expected);
}

async function fillCurrencyInput(input: Locator, value: number): Promise<void> {
  await expect(input).toBeEditable();
  await input.click();
  await input.press('Meta+A').catch(() => {});
  await input.press('Control+A').catch(() => {});
  await input.press('Delete').catch(() => {});
  await input.page().keyboard.insertText(String(value));
  await input.blur();
}

async function selectDropdownOption(
  page: Page,
  trigger: Locator,
  optionName: string,
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
      await option.evaluate((el) => (el as HTMLElement).click());
    }
  }
}

async function dismissWelcomeDialogIfPresent(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Welcome to the Director Pay Calculator' });
  const isVisible = await dialog.isVisible({ timeout: 1500 }).catch(() => false);
  if (!isVisible) return;

  await page.getByRole('button', { name: "Got it, let's start" }).click();
  await expect(dialog).toBeHidden();
}

async function ensureInputsPanelIsVisible(page: Page): Promise<void> {
  const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
  if (await revenueInput.isVisible().catch(() => false)) {
    return;
  }

  const openInputsButton = page.getByRole('button', { name: /open calculator inputs/i });
  if (await openInputsButton.isVisible().catch(() => false)) {
    await openInputsButton.click();
  }

  await expect(revenueInput).toBeVisible();
}

async function closeInputsPanelIfOpen(page: Page): Promise<void> {
  const closeInputsButton = page.getByRole('button', { name: /close your numbers panel/i }).first();
  if (await closeInputsButton.isVisible().catch(() => false)) {
    await closeInputsButton.click();
  }
  await expect(page.getByRole('dialog', { name: 'Your Numbers' })).toHaveCount(0);
}

async function ensureLearnPanelIsVisible(page: Page): Promise<void> {
  const vatWarnings = page.getByText('VAT Registration Required');
  if ((await firstVisible(vatWarnings)) !== null) {
    return;
  }

  const openLearnButtons = page.getByRole('button', { name: /show learn panel/i });
  const openLearnButton = await firstVisible(openLearnButtons);
  if (openLearnButton) {
    await openLearnButton.click();
  }

  await expect
    .poll(async () => ((await firstVisible(vatWarnings)) ? 'visible' : 'hidden'))
    .toBe('visible');
}

test.describe('Director Intelligence critical @critical', () => {
  test('Normal mode: calculates and can email results @critical', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await dismissWelcomeDialogIfPresent(page);
    await ensureInputsPanelIsVisible(page);

    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
    const expensesInput = visibleInputByTestId(page, 'director-expenses-input');

    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);

    // Guard against controlled-currency inputs sometimes missing the onChange (flaky in CI when typing fast).
    await expectNumericValue(revenueInput, 100000);
    await expectNumericValue(expensesInput, 20000);

    await selectDropdownOption(
      page,
      page.locator('[data-testid="director-region-select"]:visible').first(),
      'England',
    );

    await closeInputsPanelIfOpen(page);

    // Mock email endpoint to avoid sending real emails.
    await page.route('/api/send-director-results', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    // Auto-calculate kicks in; email CTA should be available from the results area.
    const emailResultsButton = page.getByRole('button', { name: 'Email My Results' });
    await emailResultsButton.scrollIntoViewIfNeeded();
    await expect(emailResultsButton).toBeVisible();

    await emailResultsButton.click();
    await expect(page.getByLabel('Email address')).toBeVisible();

    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /Send Results/i }).click();

    // Dialog should close on success.
    await expect(page.getByLabel('Email address')).toBeHidden();
  });

  test('Survival mode: shows Survival panel and VAT warning (ungated) @critical', async ({
    page,
  }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await dismissWelcomeDialogIfPresent(page);
    await ensureInputsPanelIsVisible(page);

    // Zero profit: Survival Mode.
    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
    const expensesInput = visibleInputByTestId(page, 'director-expenses-input');

    await fillCurrencyInput(revenueInput, 90000);
    await fillCurrencyInput(expensesInput, 90000);
    await expectNumericValue(revenueInput, 90000);
    await expectNumericValue(expensesInput, 90000);

    await selectDropdownOption(
      page,
      page.locator('[data-testid="director-region-select"]:visible').first(),
      'England',
    );

    await closeInputsPanelIfOpen(page);

    await expect(page.getByTestId('director-survival-mode')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose Your Strategy' })).toBeHidden();

    // VAT warning text should still be present for high-revenue survival cases.
    await ensureLearnPanelIsVisible(page);
  });
});
