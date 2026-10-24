import { expect, test } from '@playwright/test';
import { openCalculatorForAmountEntry } from './helpers/calculator-ui';

// Trusted touch movement requires Chromium's DevTools protocol; WebKit cannot drive this gesture.
// The WebKit project excludes this file, while its tap/replacement coverage stays in the shared spec.
test.use({ viewport: { width: 393, height: 727 }, isMobile: true, hasTouch: true });

test('MC-01 a touch pan starting on an amount scrolls without focusing it', async ({ page }) => {
  await openCalculatorForAmountEntry(page, true);
  const cdp = await page.context().newCDPSession(page);
  async function pan(x: number, y: number) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 6; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - step * 25 }],
      });
      // Let the browser/compositor recognise movement between trusted touch updates.
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
      );
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  // Chromium may drop its first injected gesture. Warm up away from any form control.
  await pan(389, 500);
  const salary = page.getByTestId('salary-input');
  await salary.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(salary).not.toBeFocused();
  const before = await page.evaluate(() => window.scrollY);
  const box = await salary.boundingBox();
  if (!box) throw new Error('Salary has no bounding box');
  await salary.evaluate((el) => {
    el.setAttribute('data-pan-events', '');
    for (const name of ['pointerdown', 'pointercancel', 'focus']) {
      el.addEventListener(name, (event) => {
        el.setAttribute(
          'data-pan-events',
          `${el.getAttribute('data-pan-events')}${name}:${event.isTrusted};`,
        );
      });
    }
  });
  await pan(box.x + box.width / 2, box.y + box.height / 2);
  await expect(salary).toHaveAttribute('data-pan-events', /pointerdown:true;.*pointercancel:true;/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 50);
  await expect(salary).not.toBeFocused();
  await expect(salary).not.toHaveAttribute('data-pan-events', /focus:/);
  await expect(salary).toHaveValue('0.00');

  // Panning must not poison the following tap or its amount replacement.
  await salary.tap();
  await expect(salary).toBeFocused();
  await salary.pressSequentially('30000');
  await salary.press('Tab');
  await expect(salary).toHaveValue('30,000.00');
});
