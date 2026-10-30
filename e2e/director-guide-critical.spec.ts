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
import type { TaxYear } from '../src/constants/taxRates';
import { calculateStrategyComparison } from '../src/lib/tax/strategyComparison';
import { formatCurrency } from '../src/lib/utils';
import type { DirectorEmailInput } from '../src/lib/validation/emailValidation';
import { checkVisibleInputHelp } from './helpers/input-help';

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

  await option.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
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
  const drawer = page.getByRole('dialog', { name: 'Your Numbers', includeHidden: true });
  const closeInputsButton = page.getByRole('button', { name: /close your numbers panel/i }).first();
  if ((await drawer.count()) > 0) {
    await expect(closeInputsButton).toBeVisible();
    await closeInputsButton.press('Enter');
  }
  await expect(drawer).toHaveCount(0);
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
  test('DI-05: only matching scenarios can email, with recovery after each divergence @critical', async ({
    page,
  }) => {
    const requests: { input: DirectorEmailInput; taxYear: TaxYear }[] = [];
    await page.route('/api/send-director-results', async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
    });
    await openDirectorGuide(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await closeInputsPanelIfOpen(page);

    const email = page.getByRole('button', { name: 'Email My Results', exact: true });
    const sidebarEmail = page.getByRole('button', { name: 'Email Results', exact: true }).first();
    const reason = page.getByTestId('director-dashboard-main').getByRole('status');
    const strategySection = page.locator('[data-director-section="director-strategy"]');
    const recommended = strategySection
      .getByRole('button')
      .filter({ hasText: 'Highest Take-Home' });
    const expectBlocked = async (message: RegExp) => {
      await expect(email).toBeDisabled();
      await expect(reason).toHaveText(message);
      // Native disabled controls must not open the dialog, including programmatic clicks.
      await email.evaluate((el: HTMLButtonElement) => el.click());
      if (await sidebarEmail.isVisible()) {
        await expect(sidebarEmail).toBeDisabled();
        await sidebarEmail.evaluate((el: HTMLButtonElement) => el.click());
      }
      await expect(page.getByRole('dialog', { name: 'Email Your Results' })).toHaveCount(0);
      expect(requests).toHaveLength(0);
    };

    await expect(email).toBeEnabled();
    // Same-value edits (including a trailing decimal point) must not leave email paused.
    await ensureInputsPanelIsVisible(page);
    const revenue = visibleInputByTestId(page, 'director-revenue-input');
    await replaceText(revenue, '100000.');
    await revenue.blur();
    await closeInputsPanelIfOpen(page);
    await expect(email).toBeEnabled();
    const salarySlider = page.getByTestId('director-salary-slider').getByRole('slider');
    await salarySlider.focus();
    await salarySlider.press('ArrowRight');
    await expectBlocked(/what-if salary/);
    await recommended.click();
    await expect(email).toBeEnabled();

    const profitSlider = page.getByTestId('director-profit-slider').getByRole('slider');
    await profitSlider.focus();
    await profitSlider.press('ArrowRight');
    await expectBlocked(/what-if company profit/);
    await page
      .locator('[data-director-section="director-slider"]')
      .getByRole('button', { name: 'Reset', exact: true })
      .click();
    await expect(email).toBeEnabled();

    await strategySection.getByRole('button', { name: /All Salary/ }).click();
    await expectBlocked(/recommended strategy/);
    await recommended.click();
    await expect(email).toBeEnabled();

    await page.getByRole('button', { name: 'Minimize NI', exact: true }).click();
    await expectBlocked(/selected objective/);
    await page.getByRole('button', { name: 'Maximize take-home', exact: true }).click();
    await expect(email).toBeEnabled();

    await email.click();
    await expect(page.getByText(/Company key dates are not included/)).toBeVisible();
    await page.getByLabel('Email address').fill('di05@example.com');
    await page.getByRole('button', { name: 'Send Results', exact: true }).click();
    await expect(page.getByText(/Results sent to di05@example.com/)).toBeVisible();
    expect(requests).toHaveLength(1);
    const request = requests[0];
    expect(request.input.revenue).toBe(100000);
    expect(request.input.expenses).toBe(20000);
    // Parity check using exactly the input/year the existing email server receives.
    const exported = calculateStrategyComparison(request.input, request.taxYear);
    const reported = exported.strategies[exported.recommended];
    await page
      .getByRole('dialog', { name: 'Email Your Results' })
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click();
    await expect(page.locator('[data-director-section="director-summary"]')).toContainText(
      formatCurrency(reported.salary, 0),
    );
    await expect(page.locator('[data-director-section="director-summary"]')).toContainText(
      formatCurrency(reported.dividends, 0),
    );
    await expect(page.locator('[data-director-section="director-summary"]')).toContainText(
      formatCurrency(reported.corporationTax, 0),
    );
    await expect(page.locator('[data-director-section="director-recommendation"]')).toContainText(
      formatCurrency(reported.takeHome, 0),
    );
  });

  test('DI-05: an open dialog rejects a submit in the same task as an input edit @critical', async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route('/api/send-director-results', async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true } });
    });
    await openDirectorGuide(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await closeInputsPanelIfOpen(page);
    await page.getByRole('button', { name: 'Email My Results' }).click();
    await page.getByLabel('Email address').fill('di05@example.com');
    await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>(
        '[data-testid="director-revenue-input"]',
      );
      const form = document.querySelector<HTMLFormElement>('[role="dialog"] form');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (!(input && form && setter)) throw new Error('Missing Director input/email form');
      setter.call(input, '110000');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await expect(page.getByRole('alert')).toHaveText(
      /Results changed|Email is paused until results have updated/,
    );
    await expect(page.getByRole('button', { name: 'Send Results' })).toBeEnabled();
    expect(requests).toEqual([]);
  });

  test('DI-05: year-end changes recover and monthly cash projections stay blocked @critical', async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route('/api/send-director-results', async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true } });
    });
    await openDirectorGuide(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await selectDropdownOption(
      page,
      page.getByRole('combobox', { name: 'Company Year-End' }).filter({ visible: true }),
      '31 December',
    );
    await closeInputsPanelIfOpen(page);
    const email = page.getByRole('button', { name: 'Email My Results' });
    await expect(email).toBeEnabled();
    await ensureInputsPanelIsVisible(page);
    await page
      .getByRole('button', { name: 'Monthly', exact: true })
      .filter({ visible: true })
      .click();
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Monthly Contract Income' }).filter({ visible: true }),
      10000,
    );
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Monthly Business Expenses' }).filter({ visible: true }),
      2000,
    );
    await closeInputsPanelIfOpen(page);
    await expect(email).toBeDisabled();
    await expect(page.getByTestId('director-dashboard-main').getByRole('status')).toHaveText(
      /cash-aware monthly draw/,
    );
    await email.evaluate((el: HTMLButtonElement) => el.click());
    expect(requests).toEqual([]);
    const openInputs = page.getByRole('button', { name: /open calculator inputs/i });
    if (await openInputs.isVisible()) await openInputs.click();
    await page
      .getByRole('button', { name: 'Annual', exact: true })
      .filter({ visible: true })
      .click();
    await closeInputsPanelIfOpen(page);
    await expect(email).toBeEnabled();
  });

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
  await expect(input).toBeFocused();
  // Wait for currency focus formatting before selecting; otherwise the format update can
  // collapse the selection in WebKit and delete/replace only one digit.
  await expect(input).not.toHaveValue(/^£/);
  await input.press('ControlOrMeta+A');
  await expect
    .poll(() =>
      input.evaluate(
        (el: HTMLInputElement) => el.selectionStart === 0 && el.selectionEnd === el.value.length,
      ),
    )
    .toBe(true);
  if (text === '') await input.press('Backspace');
  else await input.page().keyboard.insertText(text);
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
    const sidebarEmail = page
      .getByRole('button', { name: 'Email Results', exact: true, includeHidden: true })
      .first();

    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);
    await selectEngland(page);
    await closeInputsPanelIfOpen(page);
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
      page
        .getByText('Enter an amount of £0 or more. Negative amounts are not supported.')
        .filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByTestId('director-results-paused')).toBeVisible();
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();

    // Correcting the amount restores a current result and email.
    await replaceText(revenueInput, '100000');
    await revenueInput.blur();
    await closeInputsPanelIfOpen(page);
    await expect(recommendation).toBeVisible();
    await expect(emailCta).toBeVisible();
    await expect(sidebarEmail).toBeEnabled();

    // Clearing a required input removes the result; empty is not treated as £0.
    await ensureInputsPanelIsVisible(page);
    await replaceText(expensesInput, '');
    await expensesInput.blur();
    await expect(expensesInput).toHaveValue('');
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();
  });
});

test.describe('Director input help @critical', () => {
  test.use({ hasTouch: true });

  test('help works in annual, full and monthly inputs, including the mobile drawer', async ({
    page,
  }) => {
    await openDirectorGuide(page);
    const visibleButton = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true });
    const help = visibleButton('Help for Business Expenses');
    const content = page.getByTestId('tooltip-content-directorExpenses');
    await expect(content).toHaveCount(0);
    await help.tap();
    await expect(content).toBeVisible();
    await expect(content).toHaveAccessibleDescription(/Leave out your own salary/);
    const drawer = page.getByRole('dialog', { name: 'Your Numbers' });
    if (await drawer.isVisible()) {
      await expect(drawer.getByTestId('tooltip-content-directorExpenses')).toBeVisible();
    }
    await help.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(help).toBeFocused();
    await help.press('Enter');
    await expect(content).toBeVisible();
    await content.getByRole('button', { name: 'Close help' }).press('Enter');
    await expect(content).toHaveCount(0);
    await help.tap();
    await visibleInputByTestId(page, 'director-expenses-input').tap();
    await expect(content).toHaveCount(0);
    await expect(visibleInputByTestId(page, 'director-expenses-input')).toBeFocused();
    await visibleButton('Full Inputs').click();
    await visibleButton('Advanced Options').click();
    await visibleButton('Help for Employer Pension').tap();
    await expect(page.getByTestId('tooltip-content-directorPension')).toBeVisible();
    await page
      .getByRole('region', { name: 'Help for Employer Pension' })
      .getByRole('button', { name: 'Close help' })
      .tap();
    await expect(page.getByTestId('tooltip-content-directorPension')).toHaveCount(0);
    await visibleButton('Monthly').click();
    await visibleButton('Help for Monthly Business Expenses').tap();
    await expect(page.getByTestId('tooltip-content-directorMonthlyExpenses')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Help for Monthly Business Expenses' }),
    ).toHaveAccessibleDescription(/Leave out your own salary/);
    await page.keyboard.press('Escape');
    await expect(page.locator('aside [id$="-hint"]')).toHaveCount(0);
    await expect(page.getByText('Typical gross invoicing per month')).toHaveCount(0);
    await expect(page.getByText('Excluding modelled director salary and employer NI')).toHaveCount(
      0,
    );
  });

  test('every Director input help control works at 375px in annual and monthly modes', async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 375, height: 812 });
    await openDirectorGuide(page);
    const visibleButton = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true });
    await visibleButton('Full Inputs').click();
    await visibleButton('Advanced Options').click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Employer Pension', exact: true })
        .filter({ visible: true }),
      1000,
    );
    await selectDropdownOption(
      page,
      page
        .getByRole('combobox', { name: 'Company Year-End', exact: true })
        .filter({ visible: true }),
      'Other',
    );
    const annual = await checkVisibleInputHelp(page);
    expect(annual).toContain('tooltip-trigger-directorPensionDeducted');
    expect(annual).toContain('tooltip-trigger-directorYearEndCustom');
    await visibleButton('Monthly').click();
    const monthly = await checkVisibleInputHelp(page);
    expect(monthly).toContain('tooltip-trigger-directorRunwayMonths');
    expect(new Set([...annual, ...monthly]).size).toBe(27);
    await expect(page.getByRole('dialog', { name: 'Your Numbers' })).toBeVisible();
  });

  test('material Director estimate warnings appear with results', async ({ page }) => {
    await openDirectorGuide(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await page.locator('[data-testid="director-includes-vat-checkbox"]:visible').check();
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await page
      .getByLabel('Other PAYE employment?', { exact: true })
      .filter({ visible: true })
      .check();
    await page
      .getByRole('button', { name: 'Advanced Options', exact: true })
      .filter({ visible: true })
      .click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Employer Pension', exact: true })
        .filter({ visible: true }),
      1000,
    );
    await closeInputsPanelIfOpen(page);
    const notes = page.getByTestId('director-estimate-notes');
    await expect(notes).toContainText('VAT has not been removed');
    await expect(notes).toContainText('employee National Insurance from the first pound');
    await expect(notes).toContainText(
      'Jobs with separate employers usually have separate thresholds',
    );
    await expect(notes).toContainText('may overstate your NI');
    await expect(notes).toContainText('Check with your payroll provider');
    await expect(notes).toContainText('annual allowance across all your pensions');
    await expect(notes).toContainText('may mean a personal tax charge, which is not included');
    await expect(notes).toContainText(
      'Unused allowance from the previous three tax years may help',
    );
    await expect(notes).toContainText('high income or some pension withdrawals can reduce');
    await expect(notes).not.toContainText('restrict the relief');
  });
});
