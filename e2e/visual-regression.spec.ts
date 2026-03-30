/**
 * Visual regression pilot
 *
 * What bugs do these tests find?
 * - Homepage hero layout drift
 * - Calculator results presentation regressions on the homepage flow
 * - Director Intelligence dashboard layout regressions in the main results surface
 */

import { expect, type Locator, type Page, test } from '@playwright/test';
import { dismissCookieBannerIfPresent, ensureCalculatorVisible } from './helpers/calculator-ui';

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

test.describe('Visual regression pilot @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  });

  test('homepage hero stays visually stable', async ({ page, browserName }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);

    await expect(page.getByTestId('homepage-hero')).toHaveScreenshot('homepage-hero.png', {
      animations: 'disabled',
      caret: 'hide',
      ...(browserName === 'webkit' ? { maxDiffPixelRatio: 0.015 } : {}),
    });
  });

  test('homepage calculator results stay visually stable', async ({ page }) => {
    await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await dismissCookieBannerIfPresent(page);
    await ensureCalculatorVisible(page);

    await page.getByTestId('salary-input').fill('45000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('results-table')).toBeVisible();

    const calculatorShell = page.getByTestId('homepage-calculator');
    await calculatorShell.scrollIntoViewIfNeeded();

    await expect(calculatorShell).toHaveScreenshot('homepage-calculator-results.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('director dashboard main results stay visually stable', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'networkidle' });
    await dismissCookieBannerIfPresent(page);
    await dismissWelcomeDialogIfPresent(page);

    const revenueInput = page.getByTestId('director-revenue-input').first();
    const expensesInput = page.getByTestId('director-expenses-input').first();

    await fillCurrencyInput(revenueInput, 100000);
    await fillCurrencyInput(expensesInput, 20000);
    await selectDropdownOption(page, page.getByTestId('director-region-select').first(), 'England');

    await expect(page.getByRole('button', { name: 'Email My Results' })).toBeVisible();

    const dashboardMain = page.getByTestId('director-dashboard-main');
    await dashboardMain.scrollIntoViewIfNeeded();

    await expect(dashboardMain).toHaveScreenshot('director-dashboard-main.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });
});
