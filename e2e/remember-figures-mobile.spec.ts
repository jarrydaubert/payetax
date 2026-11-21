import { expect, type Page, test } from '@playwright/test';
import {
  legacyFigureSnapshots,
  legacyRevenue,
  legacySalary,
} from './fixtures/legacy-figure-snapshots';

const preferenceKey = 'payetax-remember-figures';
const controls = (page: Page) => page.getByRole('region', { name: 'Remember figures' });
const checkbox = (page: Page) =>
  controls(page).getByRole('checkbox', {
    name: 'Remember figures on this device',
  });
const savedDataOptions = (page: Page) =>
  controls(page).getByRole('button', { name: 'Saved data options' });
const feedback = (page: Page) => controls(page).locator('[aria-live="polite"]');
const pending = (page: Page) => feedback(page).filter({ hasText: 'Waiting to save preference' });
const superseded = (page: Page) =>
  feedback(page).filter({ hasText: 'Remembering is still off because saved figures changed' });

async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle' });
  if (route !== '/') await expect(controls(page)).toHaveCount(0);
  if (route !== '/') await openDirectorInputs(page);
  await expect(controls(page)).toHaveCount(1);
  await expect(checkbox(page)).toBeEnabled();
  await expect(checkbox(page)).not.toBeChecked();
}

async function openDirectorInputs(page: Page) {
  await page.getByRole('button', { name: 'Open calculator inputs' }).tap();
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

function figureInput(page: Page, calculator: 'PAYE' | 'Director') {
  if (calculator === 'PAYE') return page.getByTestId('salary-input');
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
    test('the compact disclosure makes Clear a separate touch action below Reset', async ({
      page,
    }) => {
      await open(page, route);
      const options = savedDataOptions(page);
      const clear = controls(page).getByRole('button', { name: 'Clear figures and saved data' });
      await expect(options).toHaveAttribute('aria-expanded', 'false');
      await expect(clear).toBeHidden();
      expect((await options.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      await options.tap();
      await expect(options).toHaveAttribute('aria-expanded', 'true');
      await expect(clear).toHaveCSS('border-top-style', 'solid');
      await expect(clear).toHaveCSS('text-decoration-line', 'none');
      expect((await clear.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      const reset = page.getByRole('button', { name: 'Reset', exact: true });
      expect((await reset.boundingBox())?.y).toBeLessThan(
        (await options.boundingBox())?.y ?? Number.NEGATIVE_INFINITY,
      );

      await checkbox(page).tap();
      await expect(checkbox(page)).toBeChecked();
      await reset.tap();
      await expect(checkbox(page)).toBeChecked();
      await clear.tap();
      await expect(checkbox(page)).not.toBeChecked();
      expect(await preference(page)).toBe(false);
    });

    for (const action of ['restore', 'clear'] as const) {
      test(`legacy figures require an explicit choice before ${action}`, async ({
        page,
      }, testInfo) => {
        await open(page, route);
        const snapshots = legacyFigureSnapshots(await page.evaluate(() => Date.now()));
        await page.evaluate((entries) => {
          for (const [key, snapshot] of Object.entries(entries)) {
            localStorage.setItem(key, JSON.stringify(snapshot));
          }
        }, snapshots);
        await page.reload({ waitUntil: 'networkidle' });
        if (calculator === 'PAYE') {
          await page
            .getByRole('heading', { name: 'Calculate your take-home pay' })
            .scrollIntoViewIfNeeded();
        }
        const review = page.getByRole('button', { name: 'Review saved figures' });
        await expect(review).toBeInViewport();
        await review.tap();

        const remember = checkbox(page);
        const restore = controls(page).getByRole('button', {
          name: 'Restore saved figures and remember',
        });
        const clear = controls(page).getByRole('button', { name: 'Clear figures and start fresh' });
        await expect(restore).toBeFocused();
        await expect(remember).toBeDisabled();
        await expect(remember).not.toBeChecked();
        await expect(controls(page).getByText(/Choose Restore or Clear/)).toBeVisible();
        await expect(remember).toHaveAccessibleDescription(
          /previously saved figures haven’t been loaded. Choose Restore or Clear to enable this checkbox/,
        );
        await expect(remember).not.toHaveCSS('opacity', '1');
        await expect(savedDataOptions(page)).toHaveCount(0);
        await expect(clear).toHaveAccessibleDescription(
          /discards current figures and results in all open tabs and deletes saved figures/,
        );
        const clearBackground = await clear.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        );
        await expect(restore).not.toHaveCSS('background-color', clearBackground);
        await expect(clear).toHaveCSS('border-top-style', 'solid');
        for (const button of [restore, clear]) {
          await expect(button).toBeVisible();
          await expect(button).toHaveCSS('text-decoration-line', 'none');
          expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
        }
        await controls(page).locator('label').tap({ force: true });
        await page.evaluate((key) => navigator.locks.request(key, () => undefined), preferenceKey);
        await expect(remember).toBeDisabled();
        await expect(remember).not.toBeChecked();
        expect(await preference(page)).toBeNull();

        const emptyValue = calculator === 'PAYE' ? '0.00' : '';
        const legacyValue = calculator === 'PAYE' ? '54,321.98' : '£87,654.32';
        const input = figureInput(page, calculator);
        await expect(input).toHaveValue(emptyValue);
        await input.fill('12345');
        await input.blur();
        await controls(page).screenshot({ path: testInfo.outputPath('legacy-choice.png') });
        const consent = await page.evaluate(() => localStorage.getItem('cookie-consent'));
        expect(consent).not.toBeNull();
        await (action === 'restore' ? restore : clear).tap();

        await expect(remember).toBeEnabled();
        await expect(remember).toBeChecked({ checked: action === 'restore' });
        await expect(restore).toHaveCount(0);
        await expect(clear).toHaveCount(0);
        await controls(page).screenshot({ path: testInfo.outputPath(`legacy-${action}.png`) });

        const keys = Object.keys(snapshots);
        const readStorage = () =>
          page.evaluate(
            ({ keys, preferenceKey }) => ({
              snapshots: keys.map(
                (key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.state ?? null,
              ),
              preference: JSON.parse(localStorage.getItem(preferenceKey) ?? 'null'),
              analytics: localStorage.getItem('cookie-consent'),
            }),
            { keys, preferenceKey },
          );
        const storage = await readStorage();
        expect(storage.analytics).toBe(consent);
        expect(storage.preference.enabled).toBe(action === 'restore');
        if (action === 'restore') {
          const rememberId = storage.preference.id;
          expect(storage.snapshots).toEqual([
            expect.objectContaining({
              _rememberId: rememberId,
              input: expect.objectContaining({ salary: legacySalary }),
            }),
            expect.objectContaining({
              _rememberId: rememberId,
              formData: expect.objectContaining({ revenue: legacyRevenue }),
            }),
          ]);
        } else {
          expect(storage.snapshots).toEqual([null, null]);
        }

        const expectedValue = action === 'restore' ? legacyValue : emptyValue;
        await expect(figureInput(page, calculator)).toHaveValue(expectedValue);
        await page.reload({ waitUntil: 'networkidle' });
        if (calculator === 'Director') await openDirectorInputs(page);
        await expect(remember).toBeEnabled();
        await expect(remember).toBeChecked({ checked: action === 'restore' });
        await expect(restore).toHaveCount(0);
        await expect(figureInput(page, calculator)).toHaveValue(expectedValue);
        expect(await readStorage()).toEqual(storage);
      });
    }

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
        if (calculator === 'Director') {
          await page.getByRole('button', { name: 'Close your numbers panel' }).tap();
          await expect(page.getByRole('button', { name: 'Open calculator inputs' })).toBeFocused();
          await openDirectorInputs(page);
          await expect(pending(page)).toBeVisible();
          await expect(checkbox(page)).toBeDisabled();
        }
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

      const input = figureInput(page, calculator);
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
      if (calculator === 'Director') await openDirectorInputs(page);
      await expect(checkbox(page)).toBeChecked();
      await expect(figureInput(page, calculator)).toHaveValue(restoredValue);
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
        await savedDataOptions(other).tap();
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
        if (calculator === 'Director') {
          await page.getByRole('button', { name: 'Close your numbers panel' }).tap();
          await expect(
            page.getByRole('alert').filter({ hasText: 'cannot save figures reliably' }),
          ).toBeVisible();
        }
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
