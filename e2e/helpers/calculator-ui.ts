import { expect, type Page } from '@playwright/test';

export async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const acceptCookiesButton = page.locator('button:has-text("Accept All")');
  const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
  if (cookieBannerVisible) {
    await acceptCookiesButton.click();
  }
}

export async function ensureCalculatorVisible(page: Page): Promise<void> {
  const edit = page.getByRole('button', { name: 'Edit inputs', exact: true });
  if (await edit.isVisible().catch(() => false)) await edit.click();
  const salaryInput = page.getByTestId('salary-input').first();
  const alreadyVisible = await salaryInput.isVisible().catch(() => false);
  if (alreadyVisible) return;

  const becameVisibleWithoutNavigation = await salaryInput
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (becameVisibleWithoutNavigation) return;

  const openCalculatorCta = page
    .getByRole('link', { name: /open calculator|see my take home pay|show my take home pay/i })
    .first();

  if (await openCalculatorCta.isVisible().catch(() => false)) {
    await openCalculatorCta.click();
  } else {
    const fallbackAnchor = page
      .locator('a[href="#tax-calculator"], a[href="/#tax-calculator"]')
      .first();
    if (await fallbackAnchor.isVisible().catch(() => false)) {
      await fallbackAnchor.click();
    }
  }

  const becameVisible = await salaryInput.isVisible().catch(() => false);
  if (becameVisible) return;

  // Fallback to canonical calculator page to keep tests deterministic.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(salaryInput).toBeVisible({ timeout: 15000 });
}

/** Follow the mobile edit boundary and reveal optional controls for tests that use them. */
export async function editCalculatorInputs(page: Page): Promise<void> {
  const edit = page.getByRole('button', { name: 'Edit inputs', exact: true });
  if (await edit.isVisible().catch(() => false)) await edit.click();
  const adjustments = page
    .locator('details')
    .filter({ has: page.locator('summary').filter({ hasText: 'Allowances and exemptions' }) });
  if ((await adjustments.count()) && !((await adjustments.getAttribute('open')) !== null)) {
    await adjustments.locator('summary').click();
  }
}

/** Open the actual comparison journey instead of reading a hidden matrix. */
export async function showPeriodComparison(page: Page, period?: string): Promise<void> {
  const comparison = page.getByTestId('period-comparison');
  await expect(comparison).toBeAttached();
  if (!(await comparison.isVisible())) {
    await page.getByRole('button', { name: 'Compare all 7 periods', exact: true }).click();
  }
  await expect(comparison).toBeVisible();
  await expect(comparison.getByRole('columnheader').first()).toBeVisible();
  const second = page.getByRole('combobox', { name: 'Second period', exact: true });
  if (period && period !== 'Yearly' && (await second.isVisible().catch(() => false))) {
    const values: Record<string, string> = {
      Monthly: 'monthly',
      '4-Weekly': 'fourWeekly',
      Fortnightly: 'fortnightly',
      Weekly: 'weekly',
      Daily: 'daily',
      Hourly: 'hourly',
    };
    const value = values[period];
    if (value) await second.selectOption(value);
  }
}
