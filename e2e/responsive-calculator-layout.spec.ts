import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { dismissCookieBannerIfPresent } from './helpers/calculator-ui';

const viewports = [
  { width: 2560, height: 1440 },
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
  { width: 852, height: 393 },
  { width: 320, height: 720 },
  { width: 1279, height: 900 },
  { width: 1280, height: 900 },
];

for (const viewport of viewports) {
  test(`pay statement and comparison at ${viewport.width} × ${viewport.height} @critical`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await dismissCookieBannerIfPresent(page);
    await page.getByTestId('salary-input').fill('60000');
    await page.getByTestId('tax-code-input').fill('1257L');
    await page.getByTestId('calculate-button').click();
    const amount = page.getByTestId('take-home-amount');
    // Independent 2026/27 60k / 1257L fixture, not a generated golden expectation.
    await expect(amount).toHaveText('£3,780.44');
    await expect(
      page.getByTestId('pay-statement').getByRole('row', { name: 'Income Tax £952.06' }),
    ).toBeVisible();
    expect(
      await amount.evaluate((element) => {
        for (let parent: Element | null = element; parent; parent = parent.parentElement) {
          if (getComputedStyle(parent).opacity === '0') return false;
        }
        return true;
      }),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('button', { name: 'Compare all 7 periods', exact: true }).click();
    const comparison = page.getByTestId('results-table');
    await expect(comparison).toBeVisible();
    if (viewport.width >= 1280) {
      for (const period of [
        'Yearly',
        'Monthly',
        '4-Weekly',
        'Fortnightly',
        'Weekly',
        'Daily',
        'Hourly',
      ]) {
        await expect(
          comparison.getByRole('columnheader', { name: period, exact: true }),
        ).toBeVisible();
      }
      expect(
        await page
          .getByTestId('results-table-container')
          .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      ).toBe(true);
    } else {
      await page
        .getByRole('combobox', { name: 'First period', exact: true })
        .selectOption('fourWeekly');
      await page
        .getByRole('combobox', { name: 'Second period', exact: true })
        .selectOption('hourly');
      await expect(
        comparison.getByRole('columnheader', { name: '4-Weekly', exact: true }),
      ).toBeVisible();
      await expect(
        comparison.getByRole('columnheader', { name: 'Hourly', exact: true }),
      ).toBeVisible();
      expect(
        await comparison.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      ).toBe(true);
    }
    await page.getByRole('button', { name: 'Back to pay statement' }).click();
    await expect(page.getByTestId('tax-results')).toBeFocused();
    await page.getByRole('combobox', { name: 'View by', exact: true }).selectOption('annually');
    await expect(amount).toHaveText('£45,365.28');
    expect(errors).toEqual([]);
  });
}

for (const theme of ['light', 'dark']) {
  test(`statement accessibility and large amounts in ${theme} theme @critical`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await dismissCookieBannerIfPresent(page);
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle('dark', dark),
      theme === 'dark',
    );
    await page.getByTestId('salary-input').fill('10000000');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('take-home-amount')).toContainText('£');
    const violations = (
      await new AxeBuilder({ page })
        .include('[data-testid="calculator-section"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations;
    expect(violations).toEqual([]);
    for (const cell of await page.getByTestId('pay-statement').locator('td').all()) {
      expect(
        await cell.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const text = range.getBoundingClientRect();
          const bounds = element.getBoundingClientRect();
          return text.left >= bounds.left && text.right <= bounds.right;
        }),
      ).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
