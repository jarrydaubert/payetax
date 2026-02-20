import { expect, type Page } from '@playwright/test';

export async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const acceptCookiesButton = page.locator('button:has-text("Accept All")');
  const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
  if (cookieBannerVisible) {
    await acceptCookiesButton.click();
  }
}

export async function ensureCalculatorVisible(page: Page): Promise<void> {
  const salaryInput = page.getByTestId('salary-input').first();
  const alreadyVisible = await salaryInput.isVisible().catch(() => false);
  if (alreadyVisible) return;

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
  await page.goto('/calculator/45000-after-tax', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(salaryInput).toBeVisible({ timeout: 15000 });
}
