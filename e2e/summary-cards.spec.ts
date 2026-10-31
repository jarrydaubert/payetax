import { expect, type Page, test } from '@playwright/test';
import payrollFixtures from '../src/test/payeVerificationFixtures/salary-guides-payroll-2026-27.json';
import { openCalculatorForAmountEntry } from './helpers/calculator-ui';

const labels = [
  'Annual Take-Home',
  'Monthly Take-Home',
  'Total Tax & NI',
  'Effective Tax Rate',
  'Marginal Rate Estimate',
];
const summary = (page: Page) =>
  page.getByRole('region', { name: 'Tax calculation summary results', exact: true });

const runtimeIssues = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  // Vercel serves these scripts only on hosted deployments.
  await page.route(/\/_vercel\/(insights|speed-insights)\/script\.js$/, (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  const issues: string[] = [];
  runtimeIssues.set(page, issues);
  page.on('pageerror', (error) => issues.push(error.message));
  page.on('console', (message) => {
    // WebKit does not implement this existing Chromium viewport option.
    if (message.text() === 'Viewport argument key "interactive-widget" not recognized and ignored.')
      return;
    if (message.type() === 'error' || message.type() === 'warning') issues.push(message.text());
  });
});
test.afterEach(({ page }) => {
  expect(runtimeIssues.get(page) ?? [], 'browser errors and warnings').toEqual([]);
});

async function calculate(page: Page, touch: boolean) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCalculatorForAmountEntry(page, touch);
  await page.getByRole('button', { name: /reset/i }).click();
  await page.getByTestId('salary-input').fill('40000');
  await page.getByTestId('tax-code-input').fill('1257L');
  await page.getByTestId('calculate-button').click();
  await expect(summary(page)).toBeVisible();
  await expect(page).toHaveTitle(/PayeTax/i);
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('nextjs-error-overlay')).toHaveCount(0);
  const fixture = payrollFixtures.scenarios.find((item) => item.id === 'salary-guide-40k-base');
  if (!fixture) throw new Error('Missing independent payroll fixture');
  const net = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
    fixture.expected.netPayAnnual,
  );
  await expect(summary(page).getByText(net, { exact: true })).toBeVisible();
  await expect(page.getByTestId('summary-result-note')).toBeVisible();
  // Wait for the existing entrance animation before capturing the static cards.
  await expect
    .poll(() =>
      summary(page)
        .locator('[style*="opacity"]')
        .evaluateAll((elements) =>
          elements.every((element) => getComputedStyle(element).opacity === '1'),
        ),
    )
    .toBe(true);
}

test.describe('Summary card mouse and keyboard', () => {
  test.use({ hasTouch: false, isMobile: false, viewport: { width: 1440, height: 1000 } });
  test.beforeEach(async ({ page }) => {
    await calculate(page, false);
    expect(
      await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches),
    ).toBe(true);
  });

  test('all five hover tooltips persist on content and dismiss with Escape or pointer exit', async ({
    page,
  }) => {
    await page.screenshot({ path: test.info().outputPath('desktop-static.png'), fullPage: false });
    for (const label of labels) {
      const card = summary(page).getByRole('button', { name: new RegExp(label) });
      await card.hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      const tooltipId = await tooltip.getAttribute('id');
      if (!tooltipId) throw new Error('Tooltip has no accessible identifier');
      await expect(card).toHaveAttribute('aria-describedby', tooltipId);
      // Radix's semantic tooltip is inside its visible content wrapper.
      await tooltip.locator('..').hover();
      await page.waitForTimeout(800);
      await expect(tooltip).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(tooltip).toHaveCount(0);
      await page.mouse.move(0, 0, { steps: 10 });
      await card.hover();
      await expect(tooltip).toBeVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(350);
      await expect(tooltip).toHaveCount(0);
      await page.mouse.move(0, 0, { steps: 10 });
      await card.hover();
      await expect(tooltip).toBeVisible();
      if (label === 'Marginal Rate Estimate') {
        await page.screenshot({
          path: test.info().outputPath('desktop-hover.png'),
          fullPage: false,
        });
      }
      await page.mouse.move(0, 0, { steps: 10 });
      await expect(tooltip).toHaveCount(0);
    }
  });

  test('click then re-hover and pointer exit dismiss help on every card', async ({
    page,
    browserName,
  }) => {
    for (const label of labels) {
      const card = summary(page).getByRole('button', { name: new RegExp(label) });
      await card.click();
      if (browserName === 'chromium') await expect(card).toBeFocused();
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await page.mouse.move(0, 0, { steps: 10 });
      await card.hover();
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await page.mouse.move(0, 0, { steps: 10 });
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    }
    await page.screenshot({ path: test.info().outputPath('after-click-rehover-exit.png') });
  });

  test('keyboard focus and hovering a second card never leave two explanations open', async ({
    page,
  }) => {
    const first = summary(page).getByRole('button').first();
    const second = summary(page).getByRole('button').nth(1);
    await first.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await second.hover();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await expect(page.getByRole('tooltip')).toHaveText(/divided by 12/);
    await expect(first).not.toHaveAttribute('aria-describedby');
    await page.mouse.move(0, 0, { steps: 10 });
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await expect(page.getByRole('tooltip')).toHaveText(/yearly pay after/);
    await second.hover();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await expect(page.getByRole('tooltip')).toHaveText(/divided by 12/);
    await page.screenshot({ path: test.info().outputPath('single-explanation.png') });
  });

  test('Enter and Space toggle help consistently after keyboard and mouse focus', async ({
    page,
  }) => {
    const card = summary(page).getByRole('button').first();
    await card.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    for (const key of ['Enter', 'Space']) {
      await page.keyboard.press(key);
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(card).toBeFocused();
      await page.keyboard.press(key);
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect(card).toHaveAccessibleDescription(/yearly pay after/);
      await page.evaluate(() => window.scrollBy(0, 30));
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await page.evaluate(() => window.scrollBy(0, -30));
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await card.click();
      // Safari does not focus buttons on click; explicitly focus before sending keys.
      await card.focus();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await page.keyboard.press(key);
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect(card).toBeFocused();
    }
  });

  test('Tab and Shift+Tab expose help; Escape retains focus; blur dismisses', async ({ page }) => {
    const first = summary(page).getByRole('button').first();
    await first.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    for (const label of labels) {
      const card = summary(page).getByRole('button', { name: new RegExp(label) });
      await expect(card).toBeFocused();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(card).toHaveAccessibleDescription(/\S/);
      await page.evaluate(() => window.scrollBy(0, 20));
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(card).toBeFocused();
      await page.keyboard.press('Tab');
    }
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Shift+Tab');
    await expect(summary(page).getByRole('button').last()).toBeFocused();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath('desktop-keyboard.png'),
      fullPage: false,
    });
    await page.keyboard.press('Shift+Tab');
    await expect(summary(page).getByRole('button').nth(3)).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText(/share of your gross pay/);
  });

  test('narrow mouse viewport retains hover help and input help stays click-only', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    const card = summary(page).getByRole('button', { name: /Annual Take-Home/ });
    await card.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.mouse.move(0, 0, { steps: 10 });
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const help = page.getByRole('button', { name: 'Help for Pension', exact: true });
    const content = page.getByRole('region', { name: 'Help for Pension', exact: true });
    await help.hover();
    await expect(content).toHaveCount(0);
    await help.click();
    await expect(content).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
  });
});

test.describe('Summary cards with a touch primary pointer', () => {
  test.use({ hasTouch: true });
  for (const width of [393, 1440]) {
    test(`static cards at ${width}px with no hidden controls or tap help`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await calculate(page, true);
      expect(
        await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches),
      ).toBe(false);
      const cards = summary(page);
      await expect(
        cards.locator('button, a, input, select, textarea, [tabindex], [role="button"], [title]'),
      ).toHaveCount(0);
      for (const label of labels) {
        const card = cards.getByText(label, { exact: true });
        if (await card.isVisible()) {
          await card.tap();
          await expect(page.getByRole('tooltip')).toHaveCount(0);
          await expect(page.getByRole('region', { name: /^Help for .*Take-Home/ })).toHaveCount(0);
        }
      }
      await expect(page.getByTestId('summary-result-note')).toContainText('extra £100 a year');
      await page.screenshot({
        path: test.info().outputPath(`touch-${width}.png`),
        fullPage: false,
      });
      // Input-panel help retains v5.2.2 tap, keyboard and dismissal behaviour.
      const help = page.getByRole('button', { name: 'Help for Pension', exact: true });
      const content = page.getByRole('region', { name: 'Help for Pension', exact: true });
      await help.tap();
      await expect(content).toBeVisible();
      await content.getByRole('button', { name: 'Close help' }).tap();
      await expect(content).toHaveCount(0);
      await help.focus();
      await page.keyboard.press('Enter');
      await expect(content).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(content).toHaveCount(0);
      await expect(help).toBeFocused();
    });
  }
});
