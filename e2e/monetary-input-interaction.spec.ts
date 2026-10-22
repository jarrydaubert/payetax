import { expect, type Locator, type Page, test } from '@playwright/test';
import { dismissCookieBannerIfPresent, ensureCalculatorVisible } from './helpers/calculator-ui';

async function activate(control: Locator, touch: boolean) {
  if (touch) await control.tap();
  else await control.click();
}

async function openCalculator(page: Page, touch: boolean) {
  await page.goto('/#tax-calculator');
  await page.waitForLoadState('networkidle');
  await dismissCookieBannerIfPresent(page);
  await ensureCalculatorVisible(page);
  // A visible SSR input is not proof its React event handlers are ready.
  await activate(page.getByTestId('married-checkbox'), touch);
  await expect(page.getByTestId('partner-salary-input')).toBeVisible();
}

async function enterAt(field: Locator, position: 'left' | 'middle' | 'right', touch: boolean) {
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  if (!box) throw new Error('Amount field has no bounding box');
  const x = position === 'left' ? 8 : position === 'middle' ? box.width / 2 : box.width - 8;
  const options = { position: { x, y: box.height / 2 } };
  if (touch) await field.tap(options);
  else await field.click(options);
}

for (const initial of ['0.00', '25,000.00']) {
  for (const position of ['left', 'middle', 'right'] as const) {
    test(`MC-01 replaces ${initial} from ${position} pointer entry`, async ({ page, isMobile }) => {
      await openCalculator(page, isMobile);
      const salary = page.getByTestId('salary-input');
      if (initial !== '0.00') {
        await salary.click();
        await salary.press('ControlOrMeta+A');
        await salary.pressSequentially('25000');
        await salary.press('Tab');
      }
      await expect(salary).toHaveValue(initial);
      await enterAt(salary, position, isMobile);
      await salary.pressSequentially('30000');
      await expect(salary).toHaveValue('30000');
      await activate(page.getByTestId('calculate-button'), isMobile);
      await expect(salary).toHaveValue('30,000.00');
      const gross = page
        .getByTestId('results-table')
        .getByRole('row')
        .filter({ hasText: 'Gross Pay' });
      await expect(gross.getByRole('cell').nth(1)).toHaveText('£30,000.00');
    });
  }
}

test('MC-01 focus, keyboard, clearing, Enter, Reset and focus return', async ({
  page,
  isMobile,
}) => {
  await openCalculator(page, isMobile);
  const salary = page.getByTestId('salary-input');
  await activate(page.getByTestId('married-checkbox'), isMobile);
  await expect(page.getByTestId('partner-salary-input')).toBeHidden();
  await page.getByTestId('tax-code-input').pressSequentially('1257L');
  await enterAt(salary, 'middle', isMobile);
  await salary.pressSequentially('60000');
  await salary.press('Enter');
  await expect(salary).toHaveValue('60,000.00');
  await page.getByTestId('calculate-button').press('Enter');
  const results = page.getByTestId('results-table');
  await expect(results).toBeVisible();
  // Independent hand-derived fixture: salary-guide-60k-base (2026/27, 1257L).
  const net = results.getByRole('row').filter({ hasText: 'Net Pay' });
  await expect(net.getByRole('cell').nth(1)).toHaveText('£45,365.28');
  await enterAt(salary, 'right', isMobile);
  await salary.press('Tab');
  await expect(salary).toHaveValue('60,000.00');
  await expect(results).toBeVisible();

  // Tab backwards into the amount from the following control, then replace using real keys.
  await page.keyboard.press('Shift+Tab');
  await expect(salary).toBeFocused();
  await salary.pressSequentially('30000');
  await salary.press('Tab');
  await expect(salary).toHaveValue('30,000.00');
  await expect(results).toBeHidden();
  await enterAt(salary, 'left', isMobile);
  await salary.press('Backspace');
  await salary.press('Tab');
  await expect(salary).toHaveValue('');
  await expect(salary).toHaveAttribute('aria-invalid', 'true');
  await activate(page.getByTestId('calculate-button'), isMobile);
  await expect(results).toBeHidden();
  await activate(page.getByRole('button', { name: /Reset/ }), isMobile);
  await expect(salary).toHaveValue('0.00');
  await enterAt(salary, 'right', isMobile);
  await salary.pressSequentially('30000');
  await salary.press('Enter');
  await expect(salary).toHaveValue('30,000.00');
  await page.getByTestId('calculate-button').press('Enter');
  await expect(results).toBeVisible();
});

test('MC-01 mounted amounts keep pence and rejected text recoverable', async ({
  page,
  isMobile,
}) => {
  await openCalculator(page, isMobile);
  await activate(page.getByTestId('pension-type-select'), isMobile);
  await activate(page.getByRole('option').last(), isMobile);
  await activate(page.getByText('Additional Income Sources', { exact: true }), isMobile);
  await activate(page.getByTestId('add-income-source'), isMobile);

  for (const id of [
    'salary-input',
    'pension-input',
    'non-taxable-allowances-input',
    'partner-salary-input',
    'income-source-0-amount',
  ]) {
    const field = page.getByTestId(id);
    await enterAt(field, 'right', isMobile);
    await field.pressSequentially('1234.56');
    await field.press('Tab');
    await expect(field).toHaveValue('1,234.56');
    for (const invalid of ['-500', '1.2.3']) {
      await enterAt(field, 'middle', isMobile);
      await field.pressSequentially(invalid);
      await field.press('Tab');
      await expect(field).toHaveValue(invalid);
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      // Invalid text remains editable; explicit select-all is intentional recovery.
      await enterAt(field, 'left', isMobile);
      await field.press('ControlOrMeta+A');
      await field.pressSequentially('1234.56');
      await field.press('Tab');
      await expect(field).toHaveValue('1,234.56');
      await expect(field).not.toHaveAttribute('aria-invalid');
    }
  }
});
test('MC-01 subsequent clicks permit caret edits and native keyboard selection', async ({
  page,
  isMobile,
}) => {
  await openCalculator(page, isMobile);
  const salary = page.getByTestId('salary-input');
  await enterAt(salary, 'right', isMobile);
  await salary.pressSequentially('25000');
  await salary.press('Tab');
  await enterAt(salary, 'middle', isMobile);
  await enterAt(salary, 'right', isMobile);
  const selection = await salary.evaluate((el: HTMLInputElement) => [
    el.selectionStart,
    el.selectionEnd,
  ]);
  // Rapid touch taps may invoke native word selection instead of placing a collapsed caret.
  if (isMobile)
    expect([
      [9, 9],
      [0, 9],
    ]).toContainEqual(selection);
  else expect(selection).toEqual([9, 9]);
  await salary.press('Home');
  await salary.press('Shift+ArrowRight');
  await salary.pressSequentially('3');
  await salary.press('Tab');
  await expect(salary).toHaveValue('35,000.00');

  await enterAt(salary, 'left', isMobile);
  // insertText exercises the browser's multi-character insertion path used for pasted text;
  // it does not exercise the operating system clipboard or a paste event.
  await page.keyboard.insertText('£1,234.56');
  await salary.press('Tab');
  await expect(salary).toHaveValue('1,234.56');
});
