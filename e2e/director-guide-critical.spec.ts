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
import { CURRENT_TAX_YEAR, type TaxYear } from '../src/constants/taxRates';
import { calculateStrategyComparison } from '../src/lib/tax/strategyComparison';
import { formatCurrency } from '../src/lib/utils';
import type { DirectorEmailInput } from '../src/lib/validation/emailValidation';
import {
  contractor,
  recruiter,
  referenceTaxYear,
} from '../src/test/directorReferenceFixtures/referenceCompanies';
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
  await replaceText(input, String(value));
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

async function ensureInputsPanelIsVisible(
  page: Page,
  input = visibleInputByTestId(page, 'director-revenue-input'),
): Promise<void> {
  if (await input.isVisible().catch(() => false)) {
    return;
  }

  const openInputsButton = page.getByRole('button', { name: /open calculator inputs/i });
  if (await openInputsButton.isVisible().catch(() => false)) {
    await openInputsButton.click();
  }

  await expect(input).toBeVisible();
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

function currentCalculateButton(page: Page) {
  return page.getByRole('button', { name: 'Calculate', exact: true });
}

async function dragScenarioSlider(page: Page, testId: string, fraction: number) {
  const track = page.getByTestId(testId).filter({ visible: true });
  const thumb = track.getByRole('slider');
  await thumb.scrollIntoViewIfNeeded();
  const trackBox = await track.boundingBox();
  const thumbBox = await thumb.boundingBox();
  if (!(trackBox && thumbBox)) throw new Error('Expected a visible scenario slider');
  const y = thumbBox.y + thumbBox.height / 2;
  await page.mouse.move(thumbBox.x + thumbBox.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(trackBox.x + trackBox.width * fraction, y, { steps: 8 });
  await page.mouse.up();
}

async function calculateAndView(page: Page) {
  if (!(await currentCalculateButton(page).isVisible())) {
    await page.getByRole('button', { name: 'Open calculator inputs' }).click();
  }
  await currentCalculateButton(page).click();
  await closeInputsPanelIfOpen(page);
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

test('JGF-150: a complete draft does not publish until Calculate @critical', async ({ page }) => {
  await openDirectorGuide(page);
  await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 100000);
  await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 20000);
  await page.clock.install();
  await selectEngland(page);
  await page.clock.runFor(400);
  await closeInputsPanelIfOpen(page);

  await expect(page.locator('[data-director-section="director-recommendation"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Email My Results' })).toHaveCount(0);
  await ensureInputsPanelIsVisible(page);
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  await closeInputsPanelIfOpen(page);

  await expect(page.locator('[data-director-section="director-recommendation"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Email My Results' })).toBeEnabled();
});

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
    await calculateAndView(page);
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

  test('JGF-150: restores named drafts and publishes the exact All Salary only on Calculate', async ({
    page,
  }, testInfo) => {
    await showScenarioA(page);
    const hero = page.locator('[data-director-section="director-recommendation"]');
    await expect(hero).toContainText('£12,570 salary + £52,476 dividends');

    await ensureInputsPanelIsVisible(page);
    const strategy = page.getByRole('combobox', { name: 'Strategy', exact: true });
    await selectDropdownOption(page, strategy, 'All Salary');
    await expectResultsWithheld(page);
    const salaryDraft = page.getByRole('slider', { name: 'Custom salary' });
    await expect(salaryDraft).toHaveAttribute('aria-valuenow', '0');
    await expect(salaryDraft).toHaveAttribute('aria-valuemax', '80000');
    const remember = page.getByRole('checkbox', {
      name: 'Remember figures on this device (PAYE and Director)',
    });
    await remember.press('Space');
    await expect(remember).toBeChecked();
    await calculateAndView(page);

    async function expectAllSalary() {
      await expect(hero).toContainText('£70,217 salary + £0 dividends');
      await expect(page.getByRole('region', { name: 'Summary cards' })).toContainText('£70,217');
      await expect(detailRowValue(page, 'Salary Breakdown', 'Gross Salary')).toHaveText('£70,217');
      await expect(detailRowValue(page, 'Dividend Breakdown', 'Gross Dividends')).toHaveText('£0');
      const card = page
        .getByRole('region', { name: 'Strategy comparison' })
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', { name: 'All Salary', exact: true }),
        });
      await expect(card).toContainText('Displayed Result');
      await expect(page.getByRole('button', { name: 'Email My Results' })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Download .ics' })).toBeVisible();
    }

    await expectAllSalary();
    await testInfo.attach('submitted-all-salary', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await page.reload();
    await ensureInputsPanelIsVisible(page);
    await expect(strategy).toHaveText('All Salary');
    await expectNumericValue(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await expectResultsWithheld(page);
    await calculateAndView(page);
    await expectAllSalary();
  });

  test('JGF-150: Custom salary, profit reset and objective stay drafts', async ({ page }) => {
    await showScenarioA(page);
    await ensureInputsPanelIsVisible(page);
    const salary = page.getByRole('slider', { name: 'Custom salary' });
    const profitAdjustment = page.getByRole('slider', { name: 'Company profit adjustment' });
    await expect(salary).toHaveAttribute('aria-valuenow', '0');
    await expect(salary).toHaveAttribute('aria-valuemax', '80000');
    await dragScenarioSlider(page, 'director-salary-slider', 0.6);
    const requestedSalary = await salary.getAttribute('aria-valuenow');
    expect(Number(requestedSalary)).toBeGreaterThan(44000);
    expect(Number(requestedSalary)).toBeLessThan(70217);
    await expectResultsWithheld(page);
    await dragScenarioSlider(page, 'director-profit-slider', 0.15);
    await expect(profitAdjustment).not.toHaveAttribute('aria-valuenow', '0');
    await profitAdjustment.press('Home');
    await profitAdjustment.press('ArrowRight');
    await expect(profitAdjustment).toHaveAttribute('aria-valuenow', '-45');
    await expect(salary).toHaveAttribute('aria-valuenow', requestedSalary ?? '');
    await expectResultsWithheld(page);
    await currentCalculateButton(page).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'company budget or minimum salary' }),
    ).toBeVisible();
    await expect(salary).toHaveAttribute('aria-valuenow', requestedSalary ?? '');
    await expect(profitAdjustment).toHaveAttribute('aria-valuenow', '-45');

    await page.getByRole('button', { name: 'Reset profit adjustment' }).click();
    await expect(profitAdjustment).toHaveAttribute('aria-valuenow', '0');
    await expect(salary).toHaveAttribute('aria-valuenow', requestedSalary ?? '');
    await expectResultsWithheld(page);
    await calculateAndView(page);
    await expect(page.getByRole('heading', { name: 'Custom salary', exact: true })).toBeVisible();
    const hero = page.locator('[data-director-section="director-recommendation"]');
    const amounts = await hero.textContent();
    await ensureInputsPanelIsVisible(page);
    await selectDropdownOption(
      page,
      page.getByRole('combobox', { name: 'Comparison objective' }),
      'Minimize NI',
    );
    await page
      .getByRole('textbox', { name: 'Company Accounting Period End' })
      .filter({ visible: true })
      .fill('2027-03-31');
    await expectResultsWithheld(page);
    await calculateAndView(page);
    await expect(hero).toHaveText(amounts ?? '');
    await expect(page.getByRole('region', { name: 'Strategy comparison' })).toContainText(
      'Lowest NI',
    );
    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeDisabled();

    await ensureInputsPanelIsVisible(page);
    await selectDropdownOption(
      page,
      page.getByRole('combobox', { name: 'Strategy', exact: true }),
      'Recommended strategy',
    );
    await expect(salary).toHaveAttribute('aria-valuenow', '0');
    await expectResultsWithheld(page);
    await calculateAndView(page);
    await expect(hero.getByRole('region', { name: 'Recommended pay strategy' })).toContainText(
      '£12,570 salary + £52,476 dividends',
    );
  });

  test('JGF-150: monthly simulations use the submitted period and running costs', async ({
    page,
    isMobile,
  }) => {
    await showScenarioA(page);
    await ensureInputsPanelIsVisible(page);
    const button = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true });
    const amount = (name: string) =>
      page.getByRole('textbox', { name, exact: true }).filter({ visible: true });
    await button('Monthly').click();
    await fillCurrencyInput(amount('Monthly Contract Income'), 4000);
    await fillCurrencyInput(amount('Monthly Business Expenses'), 1000);
    await fillCurrencyInput(amount('Cash In Bank'), 0);
    await fillCurrencyInput(amount('Minimum Monthly Draw'), 900);
    await selectDropdownOption(
      page,
      page.getByRole('combobox', { name: 'Contract Start Month' }).filter({ visible: true }),
      'October',
    );
    const profitAdjustment = page.getByRole('slider', { name: 'Company profit adjustment' });
    await profitAdjustment.press('Home');
    for (let step = 0; step < 5; step += 1) await profitAdjustment.press('ArrowRight');
    await expect(profitAdjustment).toHaveAttribute('aria-valuenow', '-25');
    await expectResultsWithheld(page);
    await calculateAndView(page);

    await expect(detailRowValue(page, 'Corporation Tax', 'Scenario Gross Profit')).toHaveText(
      '£13,500',
    );
    await expect(detailRowValue(page, 'Corporation Tax', 'Revenue')).toHaveCount(0);
    await expect(page.getByText('£5,700', { exact: true })).toBeVisible();
    await expect(page.getByText('£900/mo below your spending target')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeDisabled();
    const learn = page.getByRole('button', { name: /show learn panel/i }).filter({ visible: true });
    await learn.click();
    const visibleLearn = isMobile
      ? page.getByRole('dialog', { name: 'Learn' })
      : page
          .getByRole('complementary')
          .filter({ has: page.getByRole('heading', { name: 'Assumptions' }) });
    await expect(visibleLearn.getByText('Monthly projection (6 months remaining)')).toBeVisible();
    await expect(visibleLearn.getByText('Profit simulation', { exact: true })).toBeVisible();
    await expect(visibleLearn.getByText('-25%', { exact: true })).toBeVisible();
    if (isMobile) await visibleLearn.getByRole('button', { name: 'Close learn panel' }).click();

    const openInputs = page.getByRole('button', { name: 'Open calculator inputs' });
    if (await openInputs.isVisible()) await openInputs.click();
    await button('Reset profit adjustment').click();
    await button('Annual').click();
    await expectNumericValue(visibleInputByTestId(page, 'director-revenue-input'), 100000);
    await expectResultsWithheld(page);
    await calculateAndView(page);
    await expect(profit(page, '£80,000')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Monthly Draw Estimate' })).toHaveCount(0);
  });

  test('JGF-150: Compare My Setup requires Apply or discard, and Reset withholds results', async ({
    page,
  }) => {
    await showScenarioA(page);
    await ensureInputsPanelIsVisible(page);
    const fullInputs = page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true });
    await fullInputs.click();
    const setup = page
      .getByRole('textbox', { name: 'Your Current Salary' })
      .filter({ visible: true });
    await fillCurrencyInput(setup, 15000);
    await expectResultsWithheld(page);
    await currentCalculateButton(page).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Apply or discard your changes' }),
    ).toBeVisible();

    const apply = page
      .getByRole('button', { name: 'Apply', exact: true })
      .filter({ visible: true });
    await apply.click();
    await expectResultsWithheld(page);
    await calculateAndView(page);
    const strategyResults = page.getByRole('region', { name: 'Strategy comparison' });
    await expect(strategyResults).toContainText('£15,000');
    await ensureInputsPanelIsVisible(page);
    if (!(await setup.isVisible())) await fullInputs.click();
    await replaceText(setup, '-500');
    await setup.blur();
    await expect(setup).toHaveAttribute('aria-invalid', 'true');
    await currentCalculateButton(page).click();
    await expectResultsWithheld(page);
    await page.getByRole('button', { name: 'Reset Draft', exact: true }).click();
    await expectNumericValue(setup, 15000);
    await expect(setup).not.toHaveAttribute('aria-invalid', 'true');
    await expectResultsWithheld(page);
    await page.locator('aside:visible').getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(visibleInputByTestId(page, 'director-revenue-input')).toHaveValue('');
    await expectResultsWithheld(page);
  });

  test('withholds previous results and blocks a same-task calendar click until Calculate', async ({
    page,
  }, testInfo) => {
    await showScenarioA(page);
    const now = new Date();
    await page.clock.install({ time: now });
    await page.clock.pauseAt(new Date(now.getTime() + 1000));
    const staleDownloads = await editScenarioB(page, true);

    await expectResultsWithheld(page);
    await expect(
      page.getByRole('status').filter({ hasText: 'Select Calculate in Your Numbers' }),
    ).toBeVisible();
    expect(staleDownloads).toBe(0);

    await page.clock.runFor(250);
    await page.clock.resume();
    await expectResultsWithheld(page);
    await calculateAndView(page);
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
    await calculateAndView(page);
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
    await page.route('**/_next/static/chunks/**/*.js', async (route) => {
      const response = await route.fetch();
      const source = await response.text();
      // Match the live strategy engine's first three input reads in the minified chunk.
      const calculation =
        /\{(?=(?:let|const|var) \w+=\((\w+)\.ytdSalary\?\?0\)\+\(\1\.ytdDividends\?\?0\)\+\(\1\.ytdDrawings\?\?0\))/g;
      const body = source.replace(calculation, (start) => {
        injections += 1;
        return `${start}if(document.documentElement.hasAttribute("${faultAttribute}")){document.documentElement.removeAttribute("${faultAttribute}");throw Error("Controlled Director failure")}`;
      });
      await route.fulfill(body === source ? { response } : { response, body });
    });
    await showScenarioA(page);
    expect(injections, 'The production Director fault anchor must match exactly once').toBe(1);
    await page
      .locator('html')
      .evaluate((html, attribute) => html.setAttribute(attribute, ''), faultAttribute);
    await editScenarioB(page);
    await expect(page.locator('html')).toHaveAttribute(faultAttribute, '');
    if (!(await currentCalculateButton(page).isVisible())) await ensureInputsPanelIsVisible(page);
    await currentCalculateButton(page).click();
    await expect(page.locator('html')).not.toHaveAttribute(faultAttribute);

    await expectResultsWithheld(page);
    const alert = page.getByRole('alert').filter({ hasText: 'Unable to calculate director pay' });
    await expect(alert).toContainText('Unable to calculate director pay');
    await expect(page.getByText('Controlled Director failure')).toHaveCount(0);
    await testInfo.attach('inline-calculation-failure', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await calculateAndView(page);
    await expect(alert).toHaveCount(0);
    await expectScenarioB(page);
    expect(pageErrors).toEqual([]);
    expect(diagnostics).toEqual(['Director calculation failed.']);
  });
});

test.describe('Director Intelligence critical @critical', () => {
  for (const { revenue, salary, employerNI } of [
    { revenue: 10000, salary: '£9,348', employerNI: '£652' },
    { revenue: 13000, salary: '£11,957', employerNI: '£1,043' },
  ]) {
    test(`JGF-56: renders affordable pay and zero dividends at £${revenue} revenue`, async ({
      page,
    }) => {
      await openDirectorGuide(page);
      await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), revenue);
      await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
      await selectEngland(page);
      await calculateAndView(page);

      await expect(page.getByTestId('director-survival-mode')).toHaveCount(0);
      await expect(detailRowValue(page, 'Salary Breakdown', 'Gross Salary')).toHaveText(salary);
      await expect(detailRowValue(page, 'Tax Summary', 'Employer NI (company)')).toHaveText(
        employerNI,
      );
      await expect(detailRowValue(page, 'Dividend Breakdown', 'Gross Dividends')).toHaveText('£0');
    });
  }

  test('JGF-44: extra Income Tax from taper is included in take-home and shown separately', async ({
    page,
  }) => {
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => diagnostics.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      if (text === 'Viewport argument key "interactive-widget" not recognized and ignored.') return;
      if (['warning', 'error'].includes(message.type())) diagnostics.push(text);
    });
    await page.route('**/_vercel/{insights,speed-insights}/script.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );

    await openDirectorGuide(page);
    await selectEngland(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 40000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Other Personal Income', exact: true })
        .filter({ visible: true }),
      100000,
    );
    await page.getByRole('button', { name: 'Advanced Options' }).filter({ visible: true }).click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Your Current Dividends', exact: true })
        .filter({ visible: true }),
      32400,
    );
    await page
      .getByRole('button', { name: 'Apply', exact: true })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);

    const strategies = page.getByRole('region', { name: 'Strategy comparison' });
    const allDividends = strategies.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'All Dividends', exact: true }),
    });
    const yourSetup = strategies.getByRole('heading', { name: 'Your Setup' }).locator('../../..');
    // £32,400 less £11,665.61 dividend tax and £5,028 tax from the lost allowance.
    await expect(allDividends).toContainText('£15,706');
    await expect(yourSetup).toContainText('£15,706');
    await expect(
      detailRowValue(page, 'Tax Summary', 'Extra Income Tax on other income'),
    ).toHaveText('£5,028');
    await expect(detailRowValue(page, 'Salary Breakdown', 'Income Tax')).toHaveText('£2,000');
    expect(diagnostics).toEqual([]);
  });

  test('JGF-47: other employment loan liability is excluded from director take-home', async ({
    page,
  }) => {
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => diagnostics.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      if (text === 'Viewport argument key "interactive-widget" not recognized and ignored.') return;
      if (['warning', 'error'].includes(message.type())) diagnostics.push(text);
    });
    await page.route('**/_vercel/{insights,speed-insights}/script.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );

    await openDirectorGuide(page);
    await page.waitForLoadState('load');
    await selectEngland(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 40000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Other Personal Income', exact: true })
        .filter({ visible: true }),
      40000,
    );
    await page
      .getByRole('switch', { name: 'Other PAYE employment?' })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Advanced Options' }).filter({ visible: true }).click();
    await page
      .getByRole('checkbox', { name: 'Plan 2', exact: true })
      .filter({ visible: true })
      .check();
    const loanHelp = page.getByRole('button', { name: 'Help for Student Loans' }).filter({
      visible: true,
    });
    await loanHelp.click();
    await expect(page.getByTestId('tooltip-content-directorStudentLoans')).toContainText(
      'We treat Other Personal Income as earnings.',
    );
    await page.keyboard.press('Escape');
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Your Current Dividends', exact: true })
        .filter({ visible: true }),
      32400,
    );
    await page
      .getByRole('button', { name: 'Apply', exact: true })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);

    const strategies = page.getByRole('region', { name: 'Strategy comparison' });
    const allDividends = strategies.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'All Dividends', exact: true }),
    });
    const yourSetup = strategies.getByRole('heading', { name: 'Your Setup' }).locator('../../..');
    // £32,400 dividends less £8,961.75 dividend tax and 9% of the dividends (£2,916).
    // The £40,000 of other employment income already covers the Plan 2 threshold.
    for (const card of [allDividends, yourSetup]) {
      await expect(
        card.getByText('Take-Home', { exact: true }).locator('xpath=following-sibling::span'),
      ).toHaveText('£20,522');
    }
    await page.getByRole('button', { name: 'Show learn panel' }).filter({ visible: true }).click();
    await expect(
      page.getByText(/all unearned income counts/).filter({ visible: true }),
    ).toBeVisible();
    expect(diagnostics).toEqual([]);
  });

  test('JGF-42: another PAYE job preserves the annual director NI threshold', async ({
    page,
  }, testInfo) => {
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => diagnostics.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      if (text === 'Viewport argument key "interactive-widget" not recognized and ignored.') return;
      if (['warning', 'error'].includes(message.type())) diagnostics.push(text);
    });
    await page.route('**/_vercel/{insights,speed-insights}/script.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await openDirectorGuide(page);
    await page.waitForLoadState('load');
    await selectEngland(page);
    // £12,570 salary + (£12,570 − £5,000) × 15% employer NI uses the entire budget.
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 13705.5);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    const fullInputs = page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true });
    await fullInputs.click();
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Other Personal Income', exact: true })
        .filter({ visible: true }),
      30000,
    );
    await page.getByRole('button', { name: 'Advanced Options' }).filter({ visible: true }).click();
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Minimum Salary', exact: true }).filter({ visible: true }),
      12570,
    );
    await fillCurrencyInput(
      page
        .getByRole('textbox', { name: 'Your Current Salary', exact: true })
        .filter({ visible: true }),
      12570,
    );
    await page
      .getByRole('button', { name: 'Apply', exact: true })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);

    const employeeNI = detailRowValue(page, 'Salary Breakdown', 'Employee NI');
    await expect(detailRowValue(page, 'Salary Breakdown', 'Gross Salary')).toHaveText('£12,570');
    await expect(employeeNI).toHaveText('£0');
    const notes = page.getByRole('region', { name: 'About this estimate' });
    await expect(notes).toHaveCount(0);
    await testInfo.attach('other-paye-off', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    await ensureInputsPanelIsVisible(page);
    const otherPAYE = page
      .getByRole('switch', { name: 'Other PAYE employment?' })
      .filter({ visible: true });
    if (!(await otherPAYE.isVisible())) await fullInputs.click();
    await otherPAYE.click();
    await expect(otherPAYE).toBeChecked();
    await calculateAndView(page);
    await expect(employeeNI).toHaveText('£0');
    const strategies = page.getByRole('region', { name: 'Strategy comparison' });
    // The £30,000 external pay leaves this salary in the 20% Income Tax band.
    // £12,570 − £2,514 Income Tax − £0 employee NI = £10,056 take-home.
    for (const name of ['All Salary', 'Baseline Mix']) {
      const card = strategies.getByRole('article').filter({
        has: page.getByRole('heading', { name, exact: true }),
      });
      await expect(card).toContainText('£10,056');
    }
    const yourSetup = strategies.getByRole('heading', { name: 'Your Setup' }).locator('../../..');
    await expect(yourSetup).toContainText('£10,056');
    await expect(yourSetup).toContainText('Within £10 of max take-home reference');
    await expect(notes).toContainText(
      'your other job has a separate National Insurance calculation',
    );
    await expect(notes).toContainText('if your earnings must be combined');
    await testInfo.attach('other-paye-on', {
      body: await notes.screenshot(),
      contentType: 'image/png',
    });
    const showLearn = await firstVisible(page.getByRole('button', { name: /show learn panel/i }));
    if (showLearn) await showLearn.click();
    await expect(
      page
        .getByText(/Jobs with unrelated employers normally have separate/)
        .filter({ visible: true }),
    ).toBeVisible();
    expect(diagnostics).toEqual([]);
  });

  test('JGF-45: honours the salary minimum and reports when it becomes unaffordable', async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      // WebKit ignores the site's existing virtual-keyboard viewport hint.
      if (text === 'Viewport argument key "interactive-widget" not recognized and ignored.') return;
      if (['warning', 'error'].includes(message.type())) errors.push(text);
    });
    await page.route('**/_vercel/{insights,speed-insights}/script.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await openDirectorGuide(page);
    await selectEngland(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 200000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Advanced Options' }).filter({ visible: true }).click();
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Minimum Salary', exact: true }).filter({ visible: true }),
      60000,
    );
    await calculateAndView(page);

    const salary = detailRowValue(page, 'Salary Breakdown', 'Gross Salary');
    const warning = page.getByRole('status').filter({ hasText: 'short of your minimum' });
    const strategies = page.getByRole('region', { name: 'Strategy comparison' });
    const displayed = strategies.getByRole('article').filter({
      has: page.getByText('Displayed Result', { exact: true }),
    });
    const mix = strategies.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'Baseline Mix', exact: true }),
    });
    const allDividends = strategies.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'All Dividends', exact: true }),
    });
    await expect(allDividends).toContainText(
      'Comparison only. Zero salary does not meet your minimum.',
    );
    // The mix meets the floor with £131,750 taxable profit less £31,163.75 CT.
    await expect(mix).toContainText('£60,000');
    await expect(mix).toContainText('£100,586');
    // All Salary also meets the floor and has the higher take-home of the feasible strategies.
    await expect(displayed).toContainText('All Salary');
    await expect(salary).toHaveText('£174,565');
    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeDisabled();
    await expect(warning).toHaveCount(0);
    await testInfo.attach('feasible-minimum', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // No EA or BIK. At £57,000 profit, (57,000 + 750) / 1.15 gives £50,217.39.
    await ensureInputsPanelIsVisible(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 57000);
    await calculateAndView(page);
    await expect(warning).toHaveText(
      'The highest affordable salary is £50,217.39, which falls £9,782.61 short of your minimum.',
    );
    await expect(displayed).toContainText('Baseline Mix');
    await expect(salary).toHaveText('£50,217');
    await expect(strategies.getByRole('button')).toHaveCount(0);
    await expect(strategies.getByRole('slider')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeEnabled();
    await testInfo.attach('unaffordable-minimum', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    expect(errors).toEqual([]);
  });

  test('JGF-43: reserves Class 1A before dividends and shows a company shortfall', async ({
    page,
  }) => {
    await openDirectorGuide(page);
    await selectEngland(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 80000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Advanced Options' }).filter({ visible: true }).click();
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Company Car BIK' }).filter({ visible: true }),
      10000,
    );
    await calculateAndView(page);

    const allDividends = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'All Dividends', exact: true }),
    });
    // £61,447.50 rounds to £61,448 on the strategy card.
    await expect(
      allDividends
        .getByText('Dividends', { exact: true })
        .locator('xpath=following-sibling::span[1]'),
    ).toHaveText('£61,448');
    await expect(
      allDividends
        .getByText('Total NI', { exact: true })
        .locator('xpath=following-sibling::span[1]'),
    ).toHaveText('£1,500');

    await ensureInputsPanelIsVisible(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 1000);
    const fullInputs = page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true });
    if (
      !(await page
        .getByRole('textbox', { name: 'Your Current Salary' })
        .filter({ visible: true })
        .isVisible())
    ) {
      await fullInputs.click();
    }
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Your Current Salary' }).filter({ visible: true }),
      1000,
    );
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Your Current Dividends' }).filter({ visible: true }),
      100,
    );
    await page
      .getByRole('button', { name: 'Apply', exact: true })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);
    const shortfall = page
      .getByRole('status')
      .filter({ hasText: 'Class 1A National Insurance bill' });
    await expect(shortfall).toContainText('£500.00. The full-year strategies have £0 available');
    await expect(detailRowValue(page, 'Dividend Breakdown', 'Gross Dividends')).toHaveText('£0');
    await expect(page.getByText('Exceeds Profit', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        /Your salary, dividends and company taxes exceed available profit by £1,600.00/,
      ),
    ).toBeVisible();
  });

  test('DI-27: the already-paid disclosure follows the displayed recommendation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await suppressWelcomeDialog(page);
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await ensureInputsPanelIsVisible(page);
    await selectEngland(page);
    const revenue = visibleInputByTestId(page, 'director-revenue-input');
    await replaceText(revenue, '21000');
    await revenue.blur();
    const expenses = visibleInputByTestId(page, 'director-expenses-input');
    await replaceText(expenses, '1000');
    await expenses.blur();
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'YTD Salary' }).filter({ visible: true }),
      12570.01,
    );
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'YTD Dividends' }).filter({ visible: true }),
      6000,
    );
    await calculateAndView(page);

    const strategies = page.getByRole('region', { name: 'Strategy comparison' });
    const conflict = strategies.getByRole('status');
    await expect(conflict).toContainText(
      'Salary already paid (£12,570.01) exceeds this scenario’s full-year salary (£12,570.00).',
    );
    await expect(conflict).toContainText(
      'Dividends already paid (£6,000.00) exceed this scenario’s full-year dividends (£5,098.54).',
    );

    const openInputs = page.getByRole('button', { name: 'Open calculator inputs' });
    if (await openInputs.isVisible()) {
      await openInputs.click();
      await page
        .getByRole('button', { name: 'Full Inputs', exact: true })
        .filter({ visible: true })
        .click();
    }
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'YTD Salary' }).filter({ visible: true }),
      12570,
    );
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'YTD Dividends' }).filter({ visible: true }),
      5000,
    );
    await calculateAndView(page);
    await expect(conflict).toBeEmpty();
    await expect(
      strategies.getByText(/Salary and dividends are full-year estimates/),
    ).toBeVisible();
  });

  test('DI-05: email matches the recommendation and stays blocked for unsupported results @critical', async ({
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
    await calculateAndView(page);

    const email = page.getByRole('button', { name: 'Email My Results', exact: true });
    const sidebarEmail = page.getByRole('button', { name: 'Email Results', exact: true }).first();
    const reason = page.getByRole('status', { name: 'Email availability' });
    const expectBlocked = async (message: RegExp, sent: number) => {
      await expect(email).toBeDisabled();
      await expect(reason).toHaveText(message);
      // Native disabled controls must not open the dialog, including programmatic clicks.
      await email.evaluate((el: HTMLButtonElement) => el.click());
      if (await sidebarEmail.isVisible()) {
        await expect(sidebarEmail).toBeDisabled();
        await sidebarEmail.evaluate((el: HTMLButtonElement) => el.click());
      }
      await expect(page.getByRole('dialog', { name: 'Email Your Results' })).toHaveCount(0);
      expect(requests).toHaveLength(sent);
    };

    await expect(email).toBeEnabled();
    // Same-value edits (including a trailing decimal point) must not leave email paused.
    await ensureInputsPanelIsVisible(page);
    const revenue = visibleInputByTestId(page, 'director-revenue-input');
    await replaceText(revenue, '100000.');
    await revenue.blur();
    await closeInputsPanelIfOpen(page);
    await expect(email).toBeEnabled();
    await email.click();
    const dialog = page.getByRole('dialog', { name: 'Email Your Results' });
    await expect(dialog).toHaveAccessibleDescription(
      /send your email address and calculator inputs to our server to recalculate your results\. Brevo receives your email address and the resulting breakdown/,
    );
    const privacyPolicy = dialog.getByRole('link', { name: 'privacy policy', exact: true });
    await expect(privacyPolicy).toBeVisible();
    await expect(privacyPolicy).toHaveAttribute('href', '/privacy');
    await expect(dialog.getByText(/Company key dates are not included/)).toBeVisible();
    await dialog.getByLabel('Email address').fill('di05@example.com');
    expect(requests).toHaveLength(0);
    await dialog.getByRole('button', { name: 'Send Results', exact: true }).click();
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

    await ensureInputsPanelIsVisible(page);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 500000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 0);
    await calculateAndView(page);
    await expect(page.getByRole('heading', { name: 'Take it all as salary' })).toBeVisible();
    await expectBlocked(/unavailable for this setup/, 1);
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
    await calculateAndView(page);
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
    await expect(page.getByRole('dialog', { name: 'Email Your Results' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Email My Results' })).toHaveCount(0);
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
        sidebar.getByText('Calculate a current scenario before emailing results.'),
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
    await calculateAndView(page);
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
    await calculateAndView(page);
    await expect(email).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Monthly Draw Estimate' })).toBeVisible();
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
    await calculateAndView(page);
    await expect(email).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Monthly Draw Estimate' })).toHaveCount(0);
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

    await calculateAndView(page);

    // Mock email endpoint to avoid sending real emails.
    await page.route('/api/send-director-results', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    // The email action is available for the submitted result.
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

    await calculateAndView(page);

    await expect(page.getByTestId('director-survival-mode')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compare Strategies' })).toBeHidden();

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
    'England, Wales, or Northern Ireland',
  );
}

function detailRowValue(page: Page, cardTitle: string, rowLabel: string): Locator {
  return page
    .locator('[data-director-section="director-details"] div.rounded-sm')
    .filter({ has: page.getByText(cardTitle, { exact: true }) })
    .getByText(rowLabel, { exact: true })
    .locator('xpath=following-sibling::span[1]');
}

test.describe('Director resolved monthly financials @critical', () => {
  async function openPensionInputs(page: Page) {
    await page
      .getByRole('button', { name: 'Full Inputs', exact: true })
      .filter({ visible: true })
      .click();
    const advanced = page
      .getByRole('button', { name: 'Advanced Options' })
      .filter({ visible: true });
    if ((await advanced.getAttribute('aria-expanded')) === 'false') await advanced.click();
  }

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await suppressWelcomeDialog(page);
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await ensureInputsPanelIsVisible(page);
    await selectEngland(page);
  });

  test('DI-06: breakdown follows the projection, pension and mode switches', async ({ page }) => {
    const mode = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true });
    const amount = (name: string) =>
      page.getByRole('textbox', { name, exact: true }).filter({ visible: true });
    const company = (label: string) => detailRowValue(page, 'Corporation Tax', label);
    await mode('Monthly').click();
    await fillCurrencyInput(amount('Monthly Contract Income'), 4000);
    await fillCurrencyInput(amount('Monthly Business Expenses'), 1000);
    await calculateAndView(page);

    // April through March: £48,000 - £12,000 - £12,570 salary - £1,135.50 NI.
    await expect(company('Revenue')).toHaveText('£48,000');
    await expect(company('Business Expenses')).toHaveText('-£12,000');
    await expect(company('Salary + Employer NI')).toHaveText('-£13,706');
    await expect(company('Taxable Profit')).toHaveText('£22,295');
    await expect(company('Corp Tax Due')).toHaveText('£4,236');

    const openInputs = page.getByRole('button', { name: 'Open calculator inputs' });
    if (await openInputs.isVisible()) await openInputs.click();
    await selectDropdownOption(
      page,
      page.getByRole('combobox', { name: 'Contract Start Month' }).filter({ visible: true }),
      'October',
    );
    await openPensionInputs(page);
    await fillCurrencyInput(amount('Employer Pension'), 3000);
    await calculateAndView(page);

    // October through March: £24,000 - £6,000 - £3,000 pension - £13,705.50 payroll.
    await expect(company('Revenue')).toHaveText('£24,000');
    await expect(company('Business Expenses')).toHaveText('-£6,000');
    await expect(company('Employer Pension')).toHaveText('-£3,000');
    await expect(company('Taxable Profit')).toHaveText('£1,295');
    await expect(company('Corp Tax Due')).toHaveText('£246');

    if (await openInputs.isVisible()) await openInputs.click();
    await mode('Annual').click();
    await fillCurrencyInput(visibleInputByTestId(page, 'director-revenue-input'), 27000);
    await fillCurrencyInput(visibleInputByTestId(page, 'director-expenses-input'), 7000);
    await calculateAndView(page);
    await expect(company('Revenue')).toHaveText('£27,000');
    await expect(company('Business Expenses')).toHaveText('-£7,000');
    await expect(company('Taxable Profit')).toHaveText('£3,295');

    if (await openInputs.isVisible()) await openInputs.click();
    await mode('Monthly').click();
    await calculateAndView(page);
    await expect(company('Revenue')).toHaveText('£24,000');
    await expect(company('Business Expenses')).toHaveText('-£6,000');
    await expect(company('Taxable Profit')).toHaveText('£1,295');

    if (await openInputs.isVisible()) await openInputs.click();
    await openPensionInputs(page);
    await page
      .getByRole('checkbox', { name: 'Already included in business expenses' })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);
    await expect(company('Taxable Profit')).toHaveText('£4,295');
    await expect(company('Corp Tax Due')).toHaveText('£816');
    await expect(company('Employer Pension')).toHaveCount(0);
  });

  test('DI-06: survival loss includes the projected trading loss and undeducted pension', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Monthly', exact: true })
      .filter({ visible: true })
      .click();
    const income = page
      .getByRole('textbox', { name: 'Monthly Contract Income' })
      .filter({ visible: true });
    const expenses = page
      .getByRole('textbox', { name: 'Monthly Business Expenses' })
      .filter({ visible: true });
    await fillCurrencyInput(income, 2000);
    await fillCurrencyInput(expenses, 2000);
    await calculateAndView(page);

    const survival = page.getByTestId('director-survival-mode');
    const loss = survival
      .getByText('Company loss (estimate)', { exact: true })
      .locator('xpath=following-sibling::div');
    // No trading loss: £6,708 salary plus (£6,708 - £5,000) × 15% employer NI.
    await expect(loss).toHaveText('£6,964');

    const openInputs = page.getByRole('button', { name: 'Open calculator inputs' });
    if (await openInputs.isVisible()) await openInputs.click();
    await fillCurrencyInput(expenses, 3000);
    await calculateAndView(page);
    // £1,000 monthly trading loss for 12 months plus the same illustrative payroll.
    await expect(loss).toHaveText('£18,964');

    if (await openInputs.isVisible()) await openInputs.click();
    await openPensionInputs(page);
    await fillCurrencyInput(
      page.getByRole('textbox', { name: 'Employer Pension' }).filter({ visible: true }),
      3000,
    );
    await calculateAndView(page);
    await expect(loss).toHaveText('£21,964');

    if (await openInputs.isVisible()) await openInputs.click();
    await openPensionInputs(page);
    await page
      .getByRole('checkbox', { name: 'Already included in business expenses' })
      .filter({ visible: true })
      .click();
    await calculateAndView(page);
    await expect(loss).toHaveText('£18,964');
  });
});

const referenceWholePounds = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

function expectDirectorReferenceYear() {
  expect(CURRENT_TAX_YEAR, 'Director reference year requires a fixture review').toBe(
    referenceTaxYear,
  );
}

test('JGF-170 A: compares affordably funded low-profit recruiter strategies @critical', async ({
  page,
}) => {
  expectDirectorReferenceYear();
  await openDirectorGuide(page);
  // Wait for hydration before entering the first amounts, as in the other Director journeys.
  await page.waitForLoadState('networkidle');
  await selectEngland(page);
  await fillCurrencyInput(
    visibleInputByTestId(page, 'director-revenue-input'),
    recruiter.input.revenue,
  );
  await fillCurrencyInput(
    visibleInputByTestId(page, 'director-expenses-input'),
    recruiter.input.expenses,
  );

  const button = (name: string) =>
    page.getByRole('button', { name, exact: true }).filter({ visible: true });
  const amount = (name: string) =>
    page.getByRole('textbox', { name, exact: true }).filter({ visible: true });
  const date = amount('Company Accounting Period End');
  await date.fill(recruiter.input.accountingPeriodEnd);
  await date.blur();
  const strategies = page.getByRole('region', { name: 'Strategy comparison' });
  await expect(strategies).toHaveCount(0);
  await calculateAndView(page);
  await expect(strategies.getByRole('heading', { name: 'Your Setup' })).toBeVisible();
  await expect(strategies.getByText('Not set.', { exact: true })).toBeVisible();

  await ensureInputsPanelIsVisible(page);
  await button('Full Inputs').click();
  await fillCurrencyInput(amount('Your Current Salary'), recruiter.input.yourSetupSalary);
  await fillCurrencyInput(amount('Your Current Dividends'), recruiter.input.yourSetupDividends);
  await button('Apply').click();
  await expect(strategies).toHaveCount(0);
  await calculateAndView(page);

  const currency = referenceWholePounds.format;
  const cases = [
    ['All Salary', recruiter.expected.allSalary],
    ['All Dividends', recruiter.expected.allDividends],
    ['Your Setup', recruiter.expected.yourSetup],
  ] as const;
  for (const [name, expected] of cases) {
    const heading = strategies.getByRole('heading', { name, exact: true });
    const card =
      name === 'Your Setup'
        ? heading.locator('../../..')
        : strategies
            .getByRole('article')
            .filter({ has: page.getByRole('heading', { name, exact: true }) });
    for (const [label, value] of [
      ['Salary', expected.salary],
      ['Dividends', expected.dividends],
      ['Total NI', expected.employerNI + expected.employeeNI],
      ['Take-Home', expected.takeHome],
    ] as const) {
      await expect(
        card
          .getByText(label, { exact: true })
          .locator('..')
          .getByText(currency(value), { exact: true }),
      ).toBeVisible();
    }
  }
  await expect(detailRowValue(page, 'Corporation Tax', 'Corp Tax Due')).toHaveText(
    currency(recruiter.expected.allSalary.corporationTax),
  );

  await ensureInputsPanelIsVisible(page);
  await selectDropdownOption(
    page,
    page.getByRole('combobox', { name: 'Strategy', exact: true }).filter({ visible: true }),
    'All Dividends',
  );
  await calculateAndView(page);
  await expect(detailRowValue(page, 'Corporation Tax', 'Taxable Profit')).toHaveText(
    currency(recruiter.expected.allDividends.taxableProfit),
  );
  await expect(detailRowValue(page, 'Corporation Tax', 'Corp Tax Due')).toHaveText(
    currency(recruiter.expected.allDividends.corporationTax),
  );
});

test('JGF-37 / JGF-170 C: uses only the submitted cash and reserves to cap the draw @critical', async ({
  page,
}) => {
  expectDirectorReferenceYear();
  await openDirectorGuide(page);
  await page.waitForLoadState('networkidle');
  await selectEngland(page);
  const amount = (name: string) =>
    page.getByRole('textbox', { name, exact: true }).filter({ visible: true });
  const commitments = amount('Additional committed cash');
  const bank = amount('Cash In Bank');
  const strategy = page
    .getByRole('combobox', { name: 'Strategy', exact: true })
    .filter({ visible: true });
  const panel = page.getByRole('heading', { name: 'Monthly Draw Estimate' }).locator('..');
  const draw = panel.getByText('Estimated draw this month', { exact: true }).locator('..');
  const poundsAndPence = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const currency = (value: number) =>
    (Number.isInteger(value) ? referenceWholePounds : poundsAndPence).format(value);
  const { blank, explicitZero, payable, exhausted, bufferShort, zeroBank, withPayroll } =
    contractor.cash;
  const expectDraw = async (
    expected: (typeof contractor.cash)[keyof typeof contractor.cash]['expected'],
  ) => {
    const value = currency(expected.safeMonthlyDraw);
    await expect(draw.getByText(value, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('article', { name: `Estimated draw this month of ${value}`, exact: true }),
    ).toBeVisible();
    await expect(panel.getByText(currency(expected.requiredBuffer), { exact: true })).toBeVisible();
    if (expected.spendingShortfall > 0) {
      await expect(panel).toContainText(
        `${currency(expected.spendingShortfall)}/mo below your spending target`,
      );
    } else {
      await expect(panel.getByText(/below your spending target/)).toHaveCount(0);
    }
    await expect(panel).toContainText(
      expected.shortfall > 0 ? `Shortfall ${currency(expected.shortfall)}` : 'On track',
    );
  };

  await page
    .getByRole('button', { name: 'Monthly', exact: true })
    .filter({ visible: true })
    .click();
  await fillCurrencyInput(amount('Monthly Contract Income'), contractor.input.monthlyIncome);
  await fillCurrencyInput(amount('Monthly Business Expenses'), contractor.input.monthlyExpenses);
  await fillCurrencyInput(bank, blank.input.cashInBank);
  await fillCurrencyInput(amount('Minimum Monthly Draw'), contractor.input.minimumMonthlyDraw);
  const runway = page
    .getByRole('spinbutton', { name: 'Runway Target (months)' })
    .filter({ visible: true });
  await runway.fill(String(contractor.input.runwayMonths));
  const date = amount('Company Accounting Period End');
  await date.fill(contractor.input.accountingPeriodEnd);
  await date.blur();
  await expect(
    page.getByRole('combobox', { name: 'Contract Start Month' }).filter({ visible: true }),
  ).toHaveText('April');
  await selectDropdownOption(page, strategy, 'All Dividends');
  await expect(commitments).toHaveValue('');
  await expect(commitments).toHaveAccessibleDescription(/costs covered by your buffer/);
  await calculateAndView(page);

  await expectDraw(blank.expected);
  await expect(panel).toContainText('Additional commitments were left blank');
  await expect(
    page.getByRole('article', {
      name: `Corporation tax of ${currency(contractor.expected.allDividends.corporationTax)} to set aside`,
      exact: true,
    }),
  ).toBeVisible();

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(commitments, payable.input.additionalCommittedCash);
  await expect(bank).toHaveValue(currency(blank.input.cashInBank));
  await closeInputsPanelIfOpen(page);
  await expectDraw(blank.expected);
  await expect(panel).toContainText('Additional commitments were left blank');
  await expect(
    page.getByRole('status').filter({ hasText: 'Showing results from your last calculation' }),
  ).toBeVisible();
  await calculateAndView(page);
  await expectDraw(payable.expected);
  await expect(panel).toContainText(
    `deducts ${currency(payable.input.additionalCommittedCash)} in additional commitments`,
  );

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(commitments, -1);
  await expect(commitments).toHaveAttribute('aria-invalid', 'true');
  await expect(commitments).toHaveAccessibleDescription(/Negative amounts are not supported/);
  await currentCalculateButton(page).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Check 1 field before calculating.' }),
  ).toBeVisible();
  await closeInputsPanelIfOpen(page);
  await expectDraw(payable.expected);

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(commitments, exhausted.input.additionalCommittedCash);
  await calculateAndView(page);
  await expectDraw(exhausted.expected);

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(commitments, bufferShort.input.additionalCommittedCash);
  await calculateAndView(page);
  await expectDraw(bufferShort.expected);

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(commitments, explicitZero.input.additionalCommittedCash);
  await calculateAndView(page);
  await expectDraw(explicitZero.expected);
  await expect(panel.getByText(/Additional commitments were left blank/)).toHaveCount(0);
  await expect(panel).toContainText('deducts £0 in additional commitments');

  await ensureInputsPanelIsVisible(page, bank);
  await replaceText(commitments, '');
  await commitments.blur();
  await calculateAndView(page);
  await expectDraw(blank.expected);
  await expect(panel).toContainText('Additional commitments were left blank');

  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(bank, zeroBank.input.cashInBank);
  await calculateAndView(page);
  await expectDraw(zeroBank.expected);

  // Keep the legacy recruiter's useful proof that employer NI reduces the monthly buffer.
  await ensureInputsPanelIsVisible(page, bank);
  await fillCurrencyInput(bank, withPayroll.input.cashInBank);
  await selectDropdownOption(page, strategy, 'Baseline Mix');
  await calculateAndView(page);
  await expectDraw(withPayroll.expected);
  await expect(detailRowValue(page, 'Tax Summary', 'Employer NI (company)')).toHaveText(
    referenceWholePounds.format(contractor.expected.optimalMix.employerNI),
  );
});

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
    await expensesInput.pressSequentially('10000.95');
    await expect(expensesInput).toHaveValue('10000.95');
    await expensesInput.blur();
    await expect(expensesInput).toHaveValue('£10,000.95');
    await expect(revenueInput).toHaveValue('£30,000.80');

    await selectEngland(page);
    await calculateAndView(page);

    // £30,000.80 - £10,000.95 - £12,570 salary - £1,135.50 employer NI = £6,294.35.
    await expect(detailRowValue(page, 'Corporation Tax', 'Salary + Employer NI')).toHaveText(
      '-£13,706',
    );
    await expect(detailRowValue(page, 'Corporation Tax', 'Taxable Profit')).toHaveText('£6,294');
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

  test('summarizes multiple invalid inputs and publishes corrected figures only on Calculate @critical', async ({
    page,
  }) => {
    await openDirectorGuide(page);
    const revenueInput = visibleInputByTestId(page, 'director-revenue-input');
    const expensesInput = visibleInputByTestId(page, 'director-expenses-input');
    const periodEnd = page
      .getByRole('textbox', { name: 'Company Accounting Period End' })
      .filter({ visible: true });
    const pension = page
      .getByRole('textbox', { name: 'Employer Pension' })
      .filter({ visible: true });
    const emailCta = page.getByRole('button', { name: 'Email My Results' });
    const recommendation = page.locator('[data-director-section="director-recommendation"]');
    const calendar = page.getByRole('button', { name: 'Download .ics' });
    const sidebarEmail = page
      .getByRole('button', { name: 'Email Results', exact: true, includeHidden: true })
      .first();

    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);
    await selectEngland(page);
    await periodEnd.fill('2026-12-31');
    await calculateAndView(page);
    await expect(recommendation).toBeVisible();
    await expect(
      page.getByRole('listitem', { name: 'Gross Profit: £80,000, 100% of total' }),
    ).toBeVisible();
    await expect(emailCta).toBeEnabled();
    await expect(sidebarEmail).toBeEnabled();
    await expect(calendar).toBeVisible();

    await ensureInputsPanelIsVisible(page);
    await replaceText(revenueInput, '-500');
    await revenueInput.blur();
    await periodEnd.fill('2026-02-29');
    await replaceText(expensesInput, '');
    await expensesInput.blur();
    await page.getByRole('button', { name: 'Add More Detail', exact: true }).click();
    await page.getByRole('button', { name: 'Advanced Options' }).click();
    await replaceText(pension, '-300');
    await pension.blur();
    await page.getByRole('button', { name: 'Advanced Options' }).click();
    await page.getByRole('button', { name: 'Quick Start', exact: true }).click();
    await expect(pension).toBeHidden();
    const summary = page.getByRole('alert').filter({ hasText: 'before calculating' });
    await expect(summary).toHaveCount(0);
    await expect(page.getByTestId('director-results-paused')).toBeVisible();
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();
    await expect(calendar).toHaveCount(0);

    await currentCalculateButton(page).click();
    await expect(summary).toHaveText('Check 4 fields before calculating.');
    await expect(summary).toBeFocused();
    const checkPension = page.getByRole('button', { name: 'Employer Pension', exact: true });
    await expect(page.getByRole('button', { name: 'Annual Revenue', exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Business Expenses', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Company Accounting Period End', exact: true }),
    ).toBeVisible();
    await expect(revenueInput).toHaveValue('-500');
    await expect(revenueInput).toHaveAttribute('aria-invalid', 'true');
    await expect(revenueInput).toHaveAccessibleDescription(/Negative amounts are not supported/);
    await expect(expensesInput).toHaveValue('');
    await expect(periodEnd).toHaveValue('2026-02-29');
    await expect(periodEnd).toHaveAccessibleDescription(/Enter a valid date/);
    await checkPension.press('Enter');
    await expect(pension).toBeFocused();
    await expect(pension).toHaveValue('-300');
    await expect(pension).toHaveAccessibleDescription(/Negative amounts are not supported/);
    await expect
      .poll(() =>
        pension.evaluate((field) => {
          const { x, y, width, height } = field.getBoundingClientRect();
          return document.elementFromPoint(x + width / 2, y + height / 2) === field;
        }),
      )
      .toBe(true);

    await fillCurrencyInput(pension, 0);
    await expect(summary).toHaveText('Check 3 fields before calculating.');
    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);
    await periodEnd.fill('2026-12-31');
    await expect(summary).toHaveCount(0);
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(calendar).toHaveCount(0);

    await periodEnd.fill('2026-1');
    await fillCurrencyInput(page.getByRole('textbox', { name: 'Your Current Salary' }), 500);
    await expect(summary).toHaveCount(0);
    await periodEnd.fill('2026-12-31');
    await page.getByRole('button', { name: 'Reset Draft', exact: true }).click();
    await expect(recommendation).toHaveCount(0);

    await page.getByRole('button', { name: 'Monthly', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Please correct the highlighted amounts' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Annual', exact: true }).click();
    await fillCurrencyInput(revenueInput, 120000);
    await fillCurrencyInput(expensesInput, 25000);
    await calculateAndView(page);
    await expect(recommendation).toBeVisible();
    await expect(
      page.getByRole('listitem', { name: 'Gross Profit: £95,000, 100% of total' }),
    ).toBeVisible();
    await expect(emailCta).toBeEnabled();
    await expect(sidebarEmail).toBeEnabled();
    await expect(calendar).toBeVisible();

    await ensureInputsPanelIsVisible(page);
    await page.getByRole('button', { name: 'Full Inputs', exact: true }).click();
    await fillCurrencyInput(page.getByRole('textbox', { name: 'Your Current Salary' }), 500);
    await replaceText(revenueInput, '-500');
    await revenueInput.blur();
    await periodEnd.fill('2026-02-29');
    await currentCalculateButton(page).click();
    await expect(summary).toContainText('Check 2 fields before calculating.');
    await expect(summary).toContainText(
      'Apply or discard your changes in Compare My Setup before calculating.',
    );
    await expect(currentCalculateButton(page)).toHaveAccessibleDescription(
      /Check 2 fields before calculating\.\s*Apply or discard your changes in Compare My Setup/,
    );
    await page
      .getByRole('button', { name: 'Reset', exact: true })
      .filter({ visible: true })
      .last()
      .click();
    await expect(revenueInput).toHaveValue('');
    await expect(expensesInput).toHaveValue('');
    await expect(periodEnd).toHaveValue('');
    await expect(summary).toHaveCount(0);
    await expect(recommendation).toHaveCount(0);
    await expect(emailCta).toHaveCount(0);
    await expect(sidebarEmail).toBeDisabled();
    await expect(calendar).toHaveCount(0);
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
    await calculateAndView(page);

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
    await calculateAndView(page);
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
    await currentCalculateButton(page).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Enter a valid company accounting period end' }),
    ).toBeVisible();
    await closeInputsPanelIfOpen(page);
    await expect(keyDates).toHaveCount(0);
    await expect(downloadButton).toHaveCount(0);
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
    await calculateAndView(page);
    const notes = page.getByTestId('director-estimate-notes');
    await expect(notes).toContainText('VAT has not been removed');
    await expect(notes).toContainText(
      'your other job has a separate National Insurance calculation',
    );
    await expect(notes).toContainText('if your earnings must be combined');
    await expect(notes).toContainText('annual maximum across jobs');
    await expect(notes).toContainText('annual allowance across all your pensions');
    await expect(notes).toContainText('may mean a personal tax charge, which is not included');
    await expect(notes).toContainText(
      'Unused allowance from the previous three tax years may help',
    );
    await expect(notes).toContainText('high income or some pension withdrawals can reduce');
    await expect(notes).not.toContainText('restrict the relief');
  });
});
