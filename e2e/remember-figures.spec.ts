import { expect, type Page, test } from '@playwright/test';
import fixtures from '../src/test/payeVerificationFixtures/uk-baseline-2026-27.json';

const preference = 'payetax-remember-figures';
const payeKey = 'tax-calculator-storage';
const directorKey = 'director-guide-storage';
const checkbox = (page: Page) =>
  page.getByRole('checkbox', { name: 'Remember figures on this device (PAYE and Director)' });
const clear = (page: Page) => page.getByRole('button', { name: 'Clear figures and saved data' });
const salary = (page: Page) => page.getByTestId('salary-input');
const revenue = (page: Page) =>
  page.locator('[data-testid="director-revenue-input"]:visible').first();

async function open(page: Page, route = '/') {
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(checkbox(page)).toBeVisible();
}

async function expectSavedSalary(page: Page, value: number) {
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').state?.input.salary,
        payeKey,
      ),
    )
    .toBe(value);
}

test.beforeEach(async ({ context }) => {
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await context.addInitScript(() =>
    localStorage.setItem('directorGuideWelcome:dismissed:v1', 'true'),
  );
});

test('off by default; opt-in survives reload; clear-data preserves analytics and the independent PAYE result @critical', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page);
  await expect(checkbox(page)).not.toBeChecked();
  await salary(page).fill('40000');
  await salary(page).blur();
  expect(await page.evaluate((key) => localStorage.getItem(key), payeKey)).toBeNull();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(salary(page)).toHaveValue('0.00');
  await page.screenshot({ path: testInfo.outputPath('paye-off.png'), fullPage: true });
  await checkbox(page).press('Space');
  await expect(checkbox(page)).toBeChecked();
  await salary(page).fill('40000');
  await page.getByTestId('tax-code-input').fill('1257L');
  await page.getByTestId('calculate-button').click();
  const expected = fixtures.scenarios.find((scenario) => scenario.id === 'uk-40k-1257L')?.expected
    .netPayAnnual;
  expect(expected).toBe(32322.04);
  await expect(page.getByTestId('results-table')).toContainText('£32,322.04');
  await expectSavedSalary(page, 40000);
  await page.screenshot({ path: testInfo.outputPath('paye-remembered.png'), fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(salary(page)).toHaveValue('40,000.00');
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toBeVisible();
  const consent = await page.evaluate(() => [
    localStorage.getItem('cookie-consent'),
    localStorage.getItem('cookie-consent-timestamp'),
  ]);
  await clear(page).click();
  await expect(checkbox(page)).not.toBeChecked();
  await expect(salary(page)).toHaveValue('0.00');
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  expect(
    await page.evaluate(() => [
      localStorage.getItem('cookie-consent'),
      localStorage.getItem('cookie-consent-timestamp'),
    ]),
  ).toEqual(consent);
  expect(await page.evaluate((key) => localStorage.getItem(key), payeKey)).toBeNull();
  await page.screenshot({ path: testInfo.outputPath('paye-cleared.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('legacy figures remain quarantined across reload and edits until restore-or-clear @critical', async ({
  page,
}) => {
  await open(page);
  await page.evaluate(
    ({ payeKey, directorKey }) => {
      localStorage.setItem(
        payeKey,
        JSON.stringify({
          state: {
            input: {
              salary: 54321.98,
              pensionContribution: 5000,
              pensionContributionType: 'percentage',
            },
          },
          version: 0,
        }),
      );
      localStorage.setItem(
        directorKey,
        JSON.stringify({ state: { formData: { revenue: 87654.32 } }, version: 4 }),
      );
    },
    { payeKey, directorKey },
  );
  await page.reload({ waitUntil: 'networkidle' });
  const restore = page.getByRole('button', { name: 'Restore saved figures and remember' });
  await expect(restore).toBeVisible();
  await expect(salary(page)).toHaveValue('0.00');
  await salary(page).fill('123');
  await salary(page).blur();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(salary(page)).toHaveValue('0.00');
  await restore.click();
  await expect(salary(page)).toHaveValue('54,321.98');
  await expect(page.getByTestId('pension-input')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('tax-results')).toHaveCount(0);
  await clear(page).click();
  await expect
    .poll(() =>
      page.evaluate(
        ({ payeKey, directorKey }) => [
          localStorage.getItem(payeKey),
          localStorage.getItem(directorKey),
        ],
        { payeKey, directorKey },
      ),
    )
    .toEqual([null, null]);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(restore).toHaveCount(0);
});

test('Director and PAYE tabs clear live figures and cannot recreate erased snapshots @critical', async ({
  page,
  context,
}, testInfo) => {
  await open(page);
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await salary(page).fill('54321.98');
  await salary(page).blur();
  const other = await context.newPage();
  await open(other, '/tools/director-guide');
  await expect(checkbox(other)).toBeChecked();
  await revenue(other).fill('87654.32');
  await revenue(other).blur();
  await other.screenshot({ path: testInfo.outputPath('director-remembered.png'), fullPage: true });
  await other.reload({ waitUntil: 'networkidle' });
  await expect(revenue(other)).toHaveValue('£87,654.32');
  // Erasure must also discard a focused draft in another tab.
  await revenue(other).focus();
  await revenue(other).fill('99999.99');
  await clear(page).click();
  await expect(checkbox(other)).not.toBeChecked();
  await revenue(other).blur();
  await expect(revenue(other)).toHaveValue('');
  await expect(salary(page)).toHaveValue('0.00');
  await other.screenshot({ path: testInfo.outputPath('director-cleared.png'), fullPage: true });
  await revenue(other).fill('22222.22');
  await revenue(other).blur();
  expect(
    await page.evaluate(
      ({ payeKey, directorKey }) => [
        localStorage.getItem(payeKey),
        localStorage.getItem(directorKey),
      ],
      { payeKey, directorKey },
    ),
  ).toEqual([null, null]);
  await other.reload({ waitUntil: 'networkidle' });
  await expect(revenue(other)).toHaveValue('');
});

test('expired and tax-year-rollover snapshots are deleted on reload @critical', async ({
  page,
}) => {
  await open(page);
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await salary(page).fill('54321.98');
  await salary(page).blur();
  await expectSavedSalary(page, 54321.98);
  await page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
    saved.state._savedAt = Date.now() - 31 * 86400000;
    localStorage.setItem(key, JSON.stringify(saved));
  }, payeKey);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(checkbox(page)).toBeChecked();
  await expect(salary(page)).toHaveValue('0.00');
  expect(await page.evaluate((key) => localStorage.getItem(key), payeKey)).toBeNull();
  await salary(page).fill('54321.98');
  await salary(page).blur();
  await expectSavedSalary(page, 54321.98);
  await page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
    saved.state._calendarYear -= 1;
    localStorage.setItem(key, JSON.stringify(saved));
  }, payeKey);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(salary(page)).toHaveValue('0.00');
  expect(await page.evaluate((key) => localStorage.getItem(key), payeKey)).toBeNull();
});

test('blocked storage keeps calculations usable and reports erasure limits @critical', async ({
  page,
}) => {
  await open(page);
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await salary(page).fill('54321.98');
  await salary(page).blur();
  await expectSavedSalary(page, 54321.98);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.removeItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await salary(page).fill('40000');
  await salary(page).blur();
  await expect(salary(page)).toHaveValue('40,000.00');
  await expect(checkbox(page)).not.toBeChecked();
  await page.getByTestId('calculate-button').click();
  await expect(page.getByTestId('tax-results')).toBeVisible();
  await clear(page).click();
  await expect(salary(page)).toHaveValue('0.00');
  await expect(
    page.getByRole('alert').filter({ hasText: 'saved data could not be fully removed' }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), payeKey)).toContain('54321.98');
  await salary(page).fill('40000');
  await salary(page).blur();
  await expect(salary(page)).toHaveValue('40,000.00');
});

test('explicit retry resumes remembering after a transient quota failure without clearing results @critical', async ({
  page,
}, testInfo) => {
  await open(page);
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  const consent = await page.evaluate((key) => localStorage.getItem(key), preference);
  const storage = await page.evaluateHandle((snapshotKey) => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === snapshotKey) throw new DOMException('Full', 'QuotaExceededError');
      setItem.call(this, key, value);
    };
    return () => {
      Storage.prototype.setItem = setItem;
    };
  }, payeKey);
  const alert = page.getByRole('alert').filter({ hasText: 'cannot save figures reliably' });
  const controls = page.getByRole('region', { name: 'Remember figures' });
  await salary(page).fill('40000');
  await page.getByTestId('tax-code-input').fill('1257L');
  await expect(checkbox(page)).not.toBeChecked();
  await expect(alert).toBeVisible();
  await page.getByTestId('calculate-button').press('Enter');
  const results = page.getByTestId('results-table');
  await expect(results).toContainText('£32,322.04');
  await controls.screenshot({ path: testInfo.outputPath('remembering-unavailable.png') });

  await storage.evaluate((restore) => restore());
  await storage.dispose();
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await expect(alert).toHaveCount(0);
  await expect(salary(page)).toHaveValue('40,000.00');
  await expect(results).toContainText('£32,322.04');
  await expectSavedSalary(page, 40000);
  expect(await page.evaluate((key) => localStorage.getItem(key), preference)).toBe(consent);
  await controls.screenshot({ path: testInfo.outputPath('remembering-recovered.png') });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(salary(page)).toHaveValue('40,000.00');
  await expect(results).toHaveCount(0);
});

test('remembering controls remain usable on a narrow Director screen and privacy wording matches @critical', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/tools/director-guide');
  await checkbox(page).press('Space');
  await expect(checkbox(page)).toBeChecked();
  await checkbox(page).press('Space');
  await expect(checkbox(page)).not.toBeChecked();
  await page.screenshot({ path: testInfo.outputPath('director-mobile.png'), fullPage: true });
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').enabled, preference),
  ).toBe(false);
  await page.goto('/privacy', { waitUntil: 'networkidle' });
  await expect(page.getByText('payetax-remember-figures', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('privacy-mobile.png'), fullPage: true });
});

test('a restore queued behind cross-tab erasure cannot recreate legacy figures @critical', async ({
  page,
  context,
}) => {
  await context.addInitScript(
    ({ payeKey, preference }) => {
      // Seed once across tabs. A second page must not independently recreate erased data.
      if (!(localStorage.getItem(preference) || localStorage.getItem(payeKey))) {
        localStorage.setItem(
          payeKey,
          JSON.stringify({ state: { input: { salary: 54321.98 } }, version: 0 }),
        );
      }
    },
    { payeKey, preference },
  );
  await open(page);
  const other = await context.newPage();
  await open(other);
  const restore = other.getByRole('button', { name: 'Restore saved figures and remember' });
  await expect(restore).toBeVisible();

  // Hold the same lock long enough to queue both explicit actions in a known order.
  const lock = await page.evaluateHandle(
    (name) =>
      new Promise<{ release: () => void }>((acquired, reject) => {
        navigator.locks
          .request(name, () => new Promise<void>((release) => acquired({ release })))
          .catch(reject);
      }),
    preference,
  );
  try {
    await clear(page).click();
    await restore.click();
  } finally {
    await lock.evaluate((gate) => gate.release());
    await lock.dispose();
  }

  await expect(restore).toHaveCount(0);
  await expect(checkbox(other)).not.toBeChecked();
  await expect(salary(other)).toHaveValue('0.00');
  expect(await other.evaluate((key) => localStorage.getItem(key), payeKey)).toBeNull();
});
