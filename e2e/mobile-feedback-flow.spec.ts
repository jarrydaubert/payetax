import { expect, test } from '@playwright/test';
import { dismissCookieBannerIfPresent } from './helpers/calculator-ui';

test.describe('Mobile feedback dialog flow', () => {
  test('opens feedback after the mobile menu exits', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await dismissCookieBannerIfPresent(page);

    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByRole('dialog', { name: /mobile navigation menu/i })).toBeVisible();

    await page.getByTestId('mobile-feedback-button').click();

    await expect(page.getByRole('dialog', { name: /mobile navigation menu/i })).toBeHidden();
    await expect(page.getByRole('dialog', { name: /share your feedback/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /share your feedback/i })).toBeHidden();
  });
});
