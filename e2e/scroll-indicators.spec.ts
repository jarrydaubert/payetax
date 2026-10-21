import { expect, test } from '@playwright/test';
import { showPeriodComparison } from './helpers/calculator-ui';

test('financial figures remain selectable for copying without drag interception', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByTestId('salary-input').fill('60000');
  await page.getByTestId('tax-code-input').fill('1257L');
  await page.getByTestId('calculate-button').click();
  await showPeriodComparison(page);
  const value = page
    .getByTestId('results-table')
    .getByRole('row')
    .filter({ hasText: 'Income Tax' })
    .first()
    .locator('td')
    .nth(1);
  await value.scrollIntoViewIfNeeded();
  const bounds = await value.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    return { left: rect.left, right: rect.right, y: rect.top + rect.height / 2 };
  });
  await page.mouse.move(bounds.left, bounds.y);
  await page.mouse.down();
  await page.mouse.move(bounds.right, bounds.y, { steps: 12 });
  await page.mouse.up();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain('£11,424.72');
  await expect(
    page.locator('[data-testid="scroll-indicator-left"], [data-testid="scroll-indicator-right"]'),
  ).toHaveCount(0);
});
