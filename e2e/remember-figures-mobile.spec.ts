import { expect, type Page, test } from '@playwright/test';

const preferenceKey = 'payetax-remember-figures';
const controls = (page: Page) => page.getByRole('region', { name: 'Remember figures' });
const checkbox = (page: Page) =>
  controls(page).getByRole('checkbox', {
    name: 'Remember figures on this device (PAYE and Director)',
  });
const feedback = (page: Page) => controls(page).locator('[aria-live="polite"]');
const pending = (page: Page) => feedback(page).filter({ hasText: 'Waiting to save preference' });
const superseded = (page: Page) =>
  feedback(page).filter({ hasText: 'Remembering is still off because saved figures changed' });

async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(checkbox(page)).toBeEnabled();
  await expect(checkbox(page)).not.toBeChecked();
}

function preference(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.enabled ?? null,
    preferenceKey,
  );
}

function queuedRequests(page: Page) {
  return page.evaluate(async (key) => {
    const { pending } = await navigator.locks.query();
    return pending?.filter((lock) => lock.name === key).length ?? 0;
  }, preferenceKey);
}

async function holdLock(page: Page) {
  const lock = await page.evaluateHandle(
    (key) =>
      new Promise<{ release: () => void }>((acquired, reject) => {
        navigator.locks
          .request(key, () => new Promise<void>((release) => acquired({ release })))
          .catch(reject);
      }),
    preferenceKey,
  );
  return async () => {
    await lock.evaluate(({ release }) => release());
    await lock.dispose();
  };
}

async function figureInput(page: Page, calculator: 'PAYE' | 'Director') {
  if (calculator === 'PAYE') return page.getByTestId('salary-input');
  await page.getByRole('button', { name: 'Open calculator inputs' }).tap();
  return page.getByRole('dialog', { name: 'Your Numbers' }).getByTestId('director-revenue-input');
}

test.beforeEach(async ({ context }) => {
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await context.addInitScript(() =>
    localStorage.setItem('directorGuideWelcome:dismissed:v1', 'true'),
  );
});

for (const [calculator, route, restoredValue] of [
  ['PAYE', '/', '42,001.23'],
  ['Director', '/tools/director-guide', '£42,001.23'],
] as const) {
  test.describe(calculator, () => {
    test('box tap shows pending feedback, then saves consent and figures across reload', async ({
      page,
      context,
    }) => {
      const other = await context.newPage();
      await open(other, route);
      await open(page, route);
      await page.bringToFront();
      const release = await holdLock(other);
      try {
        const queuedBeforeTap = await queuedRequests(page);
        await checkbox(page).tap();
        await expect(pending(page)).toBeVisible();
        await expect(checkbox(page)).toBeDisabled();
        await expect(checkbox(page)).not.toBeChecked();
        expect(await queuedRequests(page)).toBe(queuedBeforeTap + 1);
        // Deliver a second touch even though the checkbox is marked aria-disabled.
        await controls(page).locator('label').tap({ force: true });
        await expect(pending(page)).toBeVisible();
        expect(await queuedRequests(page)).toBe(queuedBeforeTap + 1);
        expect(await preference(page)).toBeNull();
      } finally {
        await release();
      }
      await expect(pending(page)).toHaveCount(0);
      await expect(checkbox(page)).toBeChecked();
      expect(await preference(page)).toBe(true);

      const input = await figureInput(page, calculator);
      await input.fill('42001.23');
      await input.blur();
      await expect(input).toHaveValue(restoredValue);
      await expect
        .poll(() =>
          page.evaluate((name) => {
            const key = name === 'PAYE' ? 'tax-calculator-storage' : 'director-guide-storage';
            const saved = JSON.parse(localStorage.getItem(key) ?? 'null')?.state;
            return name === 'PAYE' ? saved?.input?.salary : saved?.formData?.revenue;
          }, calculator),
        )
        .toBe(42001.23);

      await page.reload();
      await expect(checkbox(page)).toBeChecked();
      await expect(await figureInput(page, calculator)).toHaveValue(restoredValue);
      if (calculator === 'Director') {
        await page.getByRole('button', { name: 'Close your numbers panel' }).tap();
      }
      const cookieConsent = await page.evaluate(() => localStorage.getItem('cookie-consent'));
      await controls(page).locator('label').tap();
      await expect(checkbox(page)).not.toBeChecked();
      expect(await preference(page)).toBe(false);
      expect(
        await page.evaluate(() => [
          localStorage.getItem('tax-calculator-storage'),
          localStorage.getItem('director-guide-storage'),
          localStorage.getItem('cookie-consent'),
        ]),
      ).toEqual([null, null, cookieConsent]);
    });

    test('label tap reports when a competing clear supersedes opt-in', async ({
      page,
      context,
    }) => {
      const other = await context.newPage();
      await open(other, route);
      await open(page, route);
      const release = await holdLock(other);
      try {
        await controls(other).getByRole('button', { name: 'Clear figures and saved data' }).tap();
        await controls(page).locator('label').tap();
        await expect(pending(page)).toBeVisible();
      } finally {
        await release();
      }
      await expect(superseded(page)).toBeVisible();
      await expect(pending(page)).toHaveCount(0);
      await expect(checkbox(page)).toBeEnabled();
      await expect(checkbox(page)).not.toBeChecked();
      expect(await preference(page)).toBe(false);
      await checkbox(page).tap();
      await expect(checkbox(page)).toBeChecked();
      await expect(superseded(page)).toHaveCount(0);
      expect(await preference(page)).toBe(true);
    });

    for (const failure of ['Web Lock rejection', 'storage write failure'] as const) {
      test(`tap reports ${failure} and leaves consent off`, async ({ page }) => {
        await open(page, route);
        await page.evaluate(
          ({ failure, preferenceKey }) => {
            const error = new DOMException('Blocked for test', 'SecurityError');
            if (failure === 'Web Lock rejection') {
              // WebKit can collect the navigator.locks wrapper between evaluation and tap.
              Object.defineProperty(Object.getPrototypeOf(navigator.locks), 'request', {
                value: () => Promise.reject(error),
              });
              return;
            }
            const setItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function (key, value) {
              if (key === preferenceKey) throw error;
              setItem.call(this, key, value);
            };
          },
          { failure, preferenceKey },
        );

        await checkbox(page).tap();
        await expect(controls(page).getByRole('alert')).toContainText(
          'cannot save figures reliably',
        );
        await expect(pending(page)).toHaveCount(0);
        await expect(superseded(page)).toHaveCount(0);
        await expect(checkbox(page)).toBeEnabled();
        await expect(checkbox(page)).not.toBeChecked();
        expect(await preference(page)).toBeNull();
      });
    }
  });
}

test('Space retains checkbox focus while remembering and after it saves', async ({
  page,
  context,
}) => {
  const other = await context.newPage();
  await open(other, '/');
  await open(page, '/');
  await page.bringToFront();
  const release = await holdLock(other);
  try {
    await checkbox(page).press('Space');
    await expect(pending(page)).toBeVisible();
    await expect(checkbox(page)).toBeFocused();
    await expect(checkbox(page)).not.toBeChecked();
  } finally {
    await release();
  }
  await expect(checkbox(page)).toBeChecked();
  await expect(checkbox(page)).toBeEnabled();
  await expect(checkbox(page)).toBeFocused();
});
