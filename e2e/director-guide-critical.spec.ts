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

import { readFile } from 'node:fs/promises';
import { type BrowserContext, expect, type Locator, type Page, test } from '@playwright/test';
import type { TaxYear } from '../src/constants/taxRates';
import { calculateStrategyComparison } from '../src/lib/tax/strategyComparison';
import { formatCurrency } from '../src/lib/utils';
import type { DirectorEmailInput } from '../src/lib/validation/emailValidation';
import { checkVisibleInputHelp } from './helpers/input-help';

const DIRECTOR_WELCOME_DISMISS_KEY = 'directorGuideWelcome:dismissed:v1';

test.describe('Director privacy controls @critical', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('direct entry offers consent and keyboard-accessible privacy routes', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/tools/director-guide');
    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    if (isMobile) {
      await page.getByRole('button', { name: 'Open calculator inputs' }).click();
      const drawer = page.getByRole('dialog', { name: 'Your Numbers' });
      await expect(drawer).toBeVisible();
      await expect(page.getByRole('complementary', { name: 'Cookie preferences' })).toHaveCount(0);
      await drawer.getByRole('button', { name: 'View results' }).press('Tab');
      expect(
        await page.evaluate(
          () => document.activeElement?.closest('[data-testid="cookie-banner"]') !== null,
        ),
      ).toBe(false);
      await drawer.getByRole('button', { name: 'Close your numbers panel' }).click();
    }
    await page.getByTestId('cookie-reject-all').click();

    const navigation = page.getByRole('navigation', { name: 'Privacy and compliance' });
    const privacy = navigation.getByRole('link', { name: 'Privacy', exact: true });
    const settings = navigation.getByRole('button', { name: 'Cookie Settings' });
    const compliance = navigation.getByRole('link', { name: 'Compliance', exact: true });
    await expect(privacy).toBeInViewport();
    await expect(settings).toBeInViewport();
    await expect(compliance).toBeInViewport();
    await privacy.focus();
    await page.keyboard.press('Tab');
    await expect(settings).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Privacy Overview' });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('switch', { name: 'Enable analytics cookies' }),
    ).not.toBeChecked();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(settings).toBeFocused();

    await privacy.click();
    await expect(page).toHaveURL(/\/privacy$/);
    await page.goBack();
    await expect(navigation).toBeVisible();
    await compliance.click();
    await expect(page).toHaveURL(/\/compliance$/);
  });
});

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

test.describe('Director result currentness @critical', () => {
  async function showScenarioA(page: Page) {
    await openDirectorGuide(page);
    await page.waitForLoadState('load');
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await page
      .getByRole('textbox', { name: 'Company Accounting Period End' })
      .filter({ visible: true })
      .fill('2026-12-31');
    await closeInputsPanelIfOpen(page);
    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Download .ics' })).toBeVisible();
    await expect(profit(page, '£80,000')).toBeVisible();
  }

  function editScenarioB(page: Page, tryDownloading = false) {
    // Dispatch the input as one browser task so the paused clock need not run actionability RAFs.
    return page
      .getByTestId('director-revenue-input')
      .first()
      .evaluate((input, tryDownloading) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (!setter) throw new Error('Missing native input setter');
        const download = [...document.querySelectorAll('button')].find((button) =>
          button.textContent?.includes('Download .ics'),
        );
        setter.call(input, '120000');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (!tryDownloading) return 0;
        if (!download) throw new Error('Missing the previous scenario calendar button');
        let downloads = 0;
        const createObjectURL = URL.createObjectURL;
        try {
          URL.createObjectURL = (blob) => {
            downloads += 1;
            return createObjectURL(blob);
          };
          download.click();
        } finally {
          URL.createObjectURL = createObjectURL;
        }
        return downloads;
      }, tryDownloading);
  }

  function profit(page: Page, amount: string) {
    return page.getByRole('listitem', { name: `Gross Profit: ${amount}, 100% of total` });
  }

  async function expectResultsWithheld(page: Page) {
    await expect(page.locator('[data-director-section]')).toHaveCount(0);
    await expect(page.getByText('Save this breakdown for your records')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Email My Results' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Download .ics' })).toHaveCount(0);
    const sidebarEmail = page.getByRole('button', { name: 'Email Results', exact: true });
    if (await sidebarEmail.isVisible()) await expect(sidebarEmail).toBeDisabled();
  }

  async function expectScenarioB(page: Page) {
    await expect(profit(page, '£100,000')).toBeVisible();
    await expect(profit(page, '£80,000')).toHaveCount(0);
    await expect(
      page.getByRole('status').filter({ hasText: 'Results are up to date.' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download .ics' })).toBeVisible();
    const email = page.getByRole('button', { name: 'Email My Results' });
    await expect(email).toBeEnabled();
    await email.click();
    await page.getByLabel('Email address').fill('director-regression@example.com');
    const request = page.waitForRequest('**/api/send-director-results');
    await page.getByRole('button', { name: 'Send Results' }).click();
    expect((await request).postDataJSON().input).toMatchObject({
      mode: 'annual',
      revenue: 120000,
      expenses: 20000,
    });
  }

  test.beforeEach(async ({ page }) => {
    await page.route('**/_vercel/{insights,speed-insights}/script.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await page.route('/api/send-director-results', (route) =>
      route.fulfill({ json: { success: true } }),
    );
  });

  test('withholds the previous scenario during the debounce', async ({ page }, testInfo) => {
    await showScenarioA(page);
    const now = new Date();
    await page.clock.install({ time: now });
    await page.clock.pauseAt(new Date(now.getTime() + 1000));
    const staleDownloads = await editScenarioB(page, true);

    await expectResultsWithheld(page);
    await expect(page.getByRole('status').filter({ hasText: 'Updating results' })).toBeVisible();
    expect(staleDownloads).toBe(0);

    await page.clock.runFor(250);
    await page.clock.resume();
    await expect(profit(page, '£100,000')).toBeVisible();
    await testInfo.attach('updated-results', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await expectScenarioB(page);
  });

  test('JGF-137: a delayed send cannot confirm an invalidated scenario', async ({
    page,
  }, testInfo) => {
    const reply = Promise.withResolvers<void>();
    const handled = Promise.withResolvers<void>();
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => diagnostics.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      // Next dev preloads this stylesheet even when the error page is never used.
      if (message.type() === 'warning' && /global-error\.css.*was preloaded/.test(text)) return;
      // WebKit ignores the site's existing virtual-keyboard viewport hint.
      if (text === 'Viewport argument key "interactive-widget" not recognized and ignored.') return;
      if (['warning', 'error'].includes(message.type())) diagnostics.push(text);
    });
    await page.route(
      '/api/send-director-results',
      async (route) => {
        await reply.promise;
        try {
          await route.fulfill({ json: { success: true } });
          handled.resolve();
        } catch (error) {
          handled.reject(error);
        }
      },
      { times: 1 },
    );

    await showScenarioA(page);
    await page.getByRole('button', { name: 'Email My Results' }).click();
    const dialog = page.getByRole('dialog', { name: 'Email Your Results' });
    await dialog.getByLabel('Email address').fill('scenario-a@example.com');
    const request = page.waitForRequest('**/api/send-director-results');
    await dialog.getByRole('button', { name: 'Send Results' }).click();
    expect((await request).postDataJSON().input.revenue).toBe(100000);
    await expect(dialog.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    await testInfo.attach('scenario-a-sending', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // The modal traps user input; drive the underlying input event as the audit did with the store.
    await page
      .getByTestId('director-revenue-input')
      .first()
      .evaluate((input) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (!setter) throw new Error('Missing native input setter');
        setter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(dialog).toBeHidden();
    await expectResultsWithheld(page);
    reply.resolve();
    await handled.promise;

    await ensureInputsPanelIsVisible(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 120000);
    await closeInputsPanelIfOpen(page);
    await expect(profit(page, '£100,000')).toBeVisible();
    await page.getByRole('button', { name: 'Email My Results' }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Results sent to|scenario-a@example.com/)).toHaveCount(0);
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog.getByLabel('Email address')).toHaveValue('');
    await testInfo.attach('scenario-b-fresh-form', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await dialog.getByLabel('Email address').fill('scenario-b@example.com');
    const nextRequest = page.waitForRequest('**/api/send-director-results');
    await dialog.getByRole('button', { name: 'Send Results' }).click();
    expect((await nextRequest).postDataJSON().input.revenue).toBe(120000);
    await expect(dialog.getByText(/Results sent to scenario-b@example.com/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
    await expect(dialog).toBeHidden();
    expect(diagnostics).toEqual([]);
  });

  test('withholds the previous scenario after a calculation exception and can retry', async ({
    page,
  }, testInfo) => {
    const faultAttribute = 'data-test-director-failure';
    let injections = 0;
    const pageErrors: string[] = [];
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      if (
        message.type() === 'error' &&
        text !== 'Viewport argument key "interactive-widget" not recognized and ignored.'
      )
        diagnostics.push(text);
    });
    await page.route('**/_next/static/chunks/app/tools/director-guide/*.js', async (route) => {
      const response = await route.fetch();
      const source = await response.text();
      // The store's catch sits immediately after the try containing its engine calls.
      // Inject before the first calculation in that try, without adding a production test switch.
      const calculation = /try\{(let \w+=\w+\.ytdSalary\+\w+\.ytdDividends\+\w+\.ytdDrawings)/g;
      const body = source.replace(calculation, (_, firstStatement) => {
        injections += 1;
        return `try{if(document.documentElement.hasAttribute("${faultAttribute}")){document.documentElement.removeAttribute("${faultAttribute}");throw Error("Controlled Director failure")} ${firstStatement}`;
      });
      await route.fulfill(body === source ? { response } : { response, body });
    });
    await showScenarioA(page);
    expect(injections, 'The production Director fault anchor must match exactly once').toBe(1);
    await page
      .locator('html')
      .evaluate((html, attribute) => html.setAttribute(attribute, ''), faultAttribute);
    await editScenarioB(page);
    await expect(page.locator('html')).not.toHaveAttribute(faultAttribute);

    await expectResultsWithheld(page);
    const alert = page.getByTestId('director-dashboard-main').getByRole('alert');
    await expect(alert).toContainText('Unable to calculate director pay');
    await expect(page.getByText('Controlled Director failure')).toHaveCount(0);
    await testInfo.attach('inline-calculation-failure', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(alert).toHaveCount(0);
    await expectScenarioB(page);
    expect(pageErrors).toEqual([]);
    expect(diagnostics).toEqual(['Director calculation failed.']);
  });
});

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
    const reason = page.getByRole('status', { name: 'Email availability' });
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
      /Results changed|Email is paused while results update/,
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
    const sidebar = page.getByRole('navigation', { name: 'Sidebar navigation' });
    if (await sidebar.isVisible()) {
      await sidebar.getByRole('button', { name: 'Expand sidebar' }).click();
      await expect(
        sidebar.getByText('Enter your numbers to calculate results before emailing them.'),
      ).toBeVisible();
      await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
    }
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await page
      .getByRole('textbox', { name: 'Company Accounting Period End' })
      .filter({ visible: true })
      .fill('2026-12-31');
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
    await expect(page.getByRole('heading', { name: 'Safe Monthly Draw' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Email availability' })).toHaveText(
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
    await expect(page.getByRole('heading', { name: 'Safe Monthly Draw' })).toHaveCount(0);
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
    const annual = await checkVisibleInputHelp(page);
    expect(annual).toContain('tooltip-trigger-directorPensionDeducted');
    expect(annual).toContain('tooltip-trigger-directorYearEnd');
    await visibleButton('Monthly').click();
    const monthly = await checkVisibleInputHelp(page);
    expect(monthly).toContain('tooltip-trigger-directorRunwayMonths');
    expect(new Set([...annual, ...monthly]).size).toBe(26);
    await expect(page.getByRole('dialog', { name: 'Your Numbers' })).toBeVisible();
  });

  test('DI-07: the calendar requires a valid explicit accounting period end @critical', async ({
    page,
  }) => {
    await openDirectorGuide(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
    await selectEngland(page);
    await closeInputsPanelIfOpen(page);

    const keyDates = page.locator('[data-director-section="director-key-dates"]');
    const downloadButton = keyDates.getByRole('button', { name: 'Download .ics' });
    await expect(keyDates).toContainText('Enter your accounting period end');
    await expect(downloadButton).toHaveCount(0);
    const personalDate = keyDates
      .getByText(/Self Assessment \(/)
      .locator('..')
      .locator('.font-mono');
    // The 2026/27 personal tax year ends 5 April 2027. Its standard deadline is 31 January 2028.
    const expectedPersonalDate = '31 Jan 2028';
    await expect(personalDate).toHaveText(expectedPersonalDate);

    const periodEnd = page
      .getByRole('textbox', { name: 'Company Accounting Period End' })
      .filter({ visible: true });
    await ensureInputsPanelIsVisible(page);
    await periodEnd.fill('2026-12-31');
    await closeInputsPanelIfOpen(page);
    await expect(keyDates).toContainText('1 Oct 2027');
    await expect(keyDates).toContainText('31 Dec 2027');
    await expect(personalDate).toHaveText(expectedPersonalDate);

    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('payetax-key-dates-2026.ics');
    const calendarPath = await download.path();
    if (!calendarPath) throw new Error('Missing calendar download');
    const calendar = await readFile(calendarPath, 'utf8');
    expect(calendar).toContain('UID:ct-payment-20271001@payetax.co.uk\r\n');
    expect(calendar).toContain('DTSTART;VALUE=DATE:20271001\r\nDTEND;VALUE=DATE:20271002\r\n');
    expect(calendar).toContain('UID:ct-return-20271231@payetax.co.uk\r\n');
    expect(calendar).toContain('DTSTART;VALUE=DATE:20271231\r\nDTEND;VALUE=DATE:20280101\r\n');
    expect(calendar).toContain('UID:self-assessment-20280131@payetax.co.uk\r\n');
    expect(calendar).toContain('DTSTART;VALUE=DATE:20280131\r\nDTEND;VALUE=DATE:20280201\r\n');

    await ensureInputsPanelIsVisible(page);
    await periodEnd.fill('2026-02-29');
    await expect(periodEnd).toHaveAccessibleDescription(/Enter a valid date/);
    await closeInputsPanelIfOpen(page);
    await expect(keyDates).toContainText('Correct the accounting period end');
    await expect(keyDates).not.toContainText('1 Oct 2027');
    await expect(downloadButton).toHaveCount(0);
    await expect(personalDate).toHaveText(expectedPersonalDate);
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
