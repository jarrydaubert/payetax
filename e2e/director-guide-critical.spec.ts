/**
 * Director Intelligence Critical Path Tests
 *
 * What bugs will these tests find?
 * - Regressions that stop `/tools/director-guide` from producing results
 * - Survival Mode regressions (profit <= 0 should show Survival panel and hide strategy UI)
 * - VAT warning gating regressions (VAT warnings must show based on revenue even in Survival Mode)
 * - Email flow regressions (dialog opens and POST succeeds)
 * - Currency-input regressions (DI-01): pence scaled or dropped, pasted/formatted amounts
 *   misread, negative/malformed text silently converted, caret jumping during edits
 * - Stale-result regressions (DI-02 minimal): empty or invalid inputs leaving a current-looking
 *   result or an email action on screen
 */

import { type BrowserContext, expect, type Locator, type Page, test } from '@playwright/test';

const DIRECTOR_WELCOME_DISMISS_KEY = 'directorGuideWelcome:dismissed:v1';

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
  await expect
    .poll(async () => {
      if ((await dialog.count()) === 0) {
        return 'closed';
      }

      return (
        (await dialog
          .first()
          .getAttribute('data-state')
          .catch(() => null)) ?? 'open'
      );
    })
    .toBe('closed');
}

async function suppressWelcomeDialog(page: Page): Promise<void> {
  await page.addInitScript((dismissKey) => {
    window.localStorage.setItem(dismissKey, 'true');
  }, DIRECTOR_WELCOME_DISMISS_KEY);
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
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await suppressWelcomeDialog(page);
    await page.goto('/tools/director-guide', { waitUntil: 'domcontentloaded', timeout: 60000 });
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
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await suppressWelcomeDialog(page);
    await page.goto('/tools/director-guide', { waitUntil: 'domcontentloaded', timeout: 60000 });
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

async function openDirectorGuide(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await suppressWelcomeDialog(page);
  await page.goto('/tools/director-guide', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissWelcomeDialogIfPresent(page);
  await ensureInputsPanelIsVisible(page);
}

async function replaceText(input: Locator, text: string): Promise<void> {
  await expect(input).toBeEditable();
  await input.click();
  await input.press('ControlOrMeta+A');
  await input.page().keyboard.insertText(text);
}

/**
 * Pastes through the real clipboard where the browser allows granting clipboard permissions
 * (Chromium); elsewhere inserts the whole string in one input event, as a paste does.
 */
async function pasteInto(
  input: Locator,
  text: string,
  { context, browserName }: { context: BrowserContext; browserName: string },
): Promise<void> {
  await input.click();
  await input.press('ControlOrMeta+A');
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await input.page().evaluate((value) => navigator.clipboard.writeText(value), text);
    await input.press('ControlOrMeta+V');
    return;
  }
  await input.page().keyboard.insertText(text);
}

async function selectEngland(page: Page): Promise<void> {
  await selectDropdownOption(
    page,
    page.locator('[data-testid="director-region-select"]:visible').first(),
    'England',
  );
}

function detailRowValue(page: Page, cardTitle: string, rowLabel: string): Locator {
  return page
    .locator('[data-director-section="director-details"] div.rounded-sm')
    .filter({ has: page.getByText(cardTitle, { exact: true }) })
    .getByText(rowLabel, { exact: true })
    .locator('xpath=following-sibling::span[1]');
}

test.describe('Director Intelligence currency inputs @critical', () => {
  test('pasted and typed pence give an independently derived taxable profit @critical', async ({
    page,
    context,
    browserName,
  }) => {
    await openDirectorGuide(page);

    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
    const expensesInput = visibleInputByTestId(page, 'director-expenses-input');

    // Pasted, formatted amount with a pound sign, comma and pence.
    await pasteInto(revenueInput, '£30,000.80', { context, browserName });
    await expect(revenueInput).toHaveValue('£30,000.80');

    // Typed plain amount with pence: left as typed while editing, formatted on blur.
    await expensesInput.click();
    await expensesInput.pressSequentially('10000.10');
    await expect(expensesInput).toHaveValue('10000.10');
    await expensesInput.blur();
    await expect(expensesInput).toHaveValue('£10,000.10');
    await expect(revenueInput).toHaveValue('£30,000.80');

    await selectEngland(page);
    await closeInputsPanelIfOpen(page);

    await page
      .locator('[data-director-section="director-strategy"]')
      .getByRole('button', { name: /All Dividends/ })
      .click();

    // Independent derivation (recorded in the PR): with no salary, employer NI, pension, losses,
    // BIK or VAT, taxable profit = revenue - expenses = £30,000.80 - £10,000.10 = £20,000.70,
    // displayed to the nearest pound as £20,001. Digit-stripping parsing gives £2,000,070;
    // dropping pence gives £20,000.
    await expect(detailRowValue(page, 'Corporation Tax', 'Salary + Employer NI')).toHaveText('-£0');
    await expect(detailRowValue(page, 'Corporation Tax', 'Taxable Profit')).toHaveText('£20,001');
  });

  test('a mid-string edit keeps the caret and the amount @critical', async ({ page }) => {
    await openDirectorGuide(page);
    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');

    await replaceText(revenueInput, '1234.56');
    await revenueInput.evaluate((el: HTMLInputElement) => el.setSelectionRange(2, 2));
    await page.keyboard.type('9');

    await expect(revenueInput).toHaveValue('12934.56');
    expect(await revenueInput.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(3);

    await revenueInput.blur();
    await expect(revenueInput).toHaveValue('£12,934.56');

    // Editing the formatted amount again: focus shows plain edit text, so adding a digit cannot
    // leave misplaced commas.
    await revenueInput.click();
    await expect(revenueInput).toHaveValue('12934.56');
    await revenueInput.press('Home');
    await page.keyboard.type('1');
    await expect(revenueInput).toHaveValue('112934.56');
    await revenueInput.blur();
    await expect(revenueInput).toHaveValue('£112,934.56');
    await expect(revenueInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('invalid or empty required inputs remove the result and disable email @critical', async ({
    page,
  }) => {
    await openDirectorGuide(page);
    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
    const expensesInput = visibleInputByTestId(page, 'director-expenses-input');
    const emailCta = page.getByRole('button', { name: 'Email My Results' });
    const recommendation = page.locator('[data-director-section="director-recommendation"]');
    const sidebarEmail = page.getByRole('button', { name: 'Email Results', exact: true }).first();

    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);
    await selectEngland(page);
    await expect(recommendation).toBeVisible();
    await expect(emailCta).toBeVisible();
    await expect(sidebarEmail).toBeEnabled();

    // Unsupported negative amount: explained, never converted into another amount.
    await ensureInputsPanelIsVisible(page);
    await replaceText(revenueInput, '-500');
    await revenueInput.blur();
    await expect(revenueInput).toHaveValue('-500');
    await expect(revenueInput).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByText('Enter an amount of £0 or more. Negative amounts are not supported.'),
    ).toBeVisible();
    await expect(page.getByTestId('director-results-paused')).toBeVisible();
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();

    // Correcting the amount restores a current result and email.
    await replaceText(revenueInput, '100000');
    await revenueInput.blur();
    await expect(recommendation).toBeVisible();
    await expect(emailCta).toBeVisible();
    await expect(sidebarEmail).toBeEnabled();

    // Clearing a required input removes the result; empty is not treated as £0.
    await expensesInput.click();
    await expensesInput.press('ControlOrMeta+A');
    await expensesInput.press('Backspace');
    await expensesInput.blur();
    await expect(expensesInput).toHaveValue('');
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();
  });
});
