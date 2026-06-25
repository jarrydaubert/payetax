import { expect, test } from '@playwright/test';
import { dismissCookieBannerIfPresent } from './helpers/calculator-ui';

test.describe('Homepage portal stability', () => {
  test('mobile homepage interactions do not raise runtime page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(String(error));
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await dismissCookieBannerIfPresent(page);

    await expect(page.locator('html')).toHaveAttribute('translate', 'no');
    await expect(page.locator('html')).toHaveClass(/notranslate/);
    await expect(page.locator('meta[name="google"]')).toHaveAttribute('content', 'notranslate');

    await page.getByTestId('salary-input').fill('50000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('tax-results')).toBeVisible();

    // Exercise the current mobile-menu handoff without relying on retired features.
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByRole('dialog', { name: /mobile navigation menu/i })).toBeVisible();
    await page
      .getByRole('dialog', { name: /mobile navigation menu/i })
      .getByRole('link', { name: 'Calculator' })
      .click();
    await expect(page.getByRole('dialog', { name: /mobile navigation menu/i })).toBeHidden();
    await expect(page).toHaveURL(/#tax-calculator$/);

    // Exercise homepage body portals after results mount on mobile.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
    );
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    await page.waitForTimeout(250);

    expect(pageErrors).toEqual([]);
  });
});
