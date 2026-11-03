import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
]) {
  test.describe(`Tool calculator links at ${viewport.width}px`, () => {
    test.use({ viewport });

    for (const tool of [
      {
        route: '/tools/scottish-tax-calculator',
        name: 'Open Full Scottish Calculator',
        href: '/#tax-calculator',
      },
      { route: '/tools/tax-code-decoder', name: 'Open Tax Calculator', href: '/' },
    ]) {
      test(`${tool.route} has one keyboard-operable calculator link`, async ({ page }) => {
        await page.goto(tool.route);
        await page.waitForLoadState('networkidle');
        const link = page.getByRole('link', { name: tool.name, exact: true });
        await expect(link).toHaveAttribute('href', tool.href);
        await expect(link.locator('button, a, input, [tabindex]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: tool.name, exact: true })).toHaveCount(0);
        await link.focus();
        await expect(link).toBeFocused();
        const results = await new AxeBuilder({ page }).withRules(['nested-interactive']).analyze();
        expect(results.violations).toEqual([]);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(tool.href);
        if (tool.route.includes('scottish')) {
          await expect(page.getByTestId('region-select')).toHaveText('Scotland');
        }
        await expect(page.getByTestId('salary-input').first()).toBeVisible();
      });
    }
  });
}
