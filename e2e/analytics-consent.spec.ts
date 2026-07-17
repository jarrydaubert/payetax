import { expect, type Page, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

type AnalyticsWindow = Window & {
  dataLayer?: ArrayLike<unknown>[];
  gtag?: unknown;
};

function pageViewCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const dataLayer = (window as AnalyticsWindow).dataLayer ?? [];
    return dataLayer.filter((entry) => {
      const command = Array.from(entry);
      return command[0] === 'event' && command[1] === 'page_view';
    }).length;
  });
}

test('keeps GA absent before consent and owns navigation through withdrawal and re-acceptance', async ({
  context,
  page,
}) => {
  let googleScriptRequests = 0;
  await context.route('https://www.googletagmanager.com/**', async (route) => {
    googleScriptRequests += 1;
    await route.fulfill({ contentType: 'application/javascript', body: '' });
  });

  await page.goto('/');
  await expect(page.getByTestId('cookie-banner')).toBeVisible();

  expect(googleScriptRequests).toBe(0);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        dataLayer: (window as AnalyticsWindow).dataLayer,
        gtag: (window as AnalyticsWindow).gtag,
      })),
    )
    .toEqual({ dataLayer: undefined, gtag: undefined });

  await page.getByTestId('cookie-accept-all').click();
  await expect.poll(() => googleScriptRequests).toBe(1);
  await expect.poll(() => pageViewCount(page)).toBe(1);

  await page.getByRole('link', { name: 'Tools', exact: true }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect.poll(() => pageViewCount(page)).toBe(2);

  await page.getByTestId('nav-logo').click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => pageViewCount(page)).toBe(3);

  await context.addCookies([
    { name: '_ga', value: 'GA1.1.111.222', url: page.url() },
    { name: '_ga_TEST', value: 'GS1.1.333', url: page.url() },
    { name: 'theme', value: 'dark', url: page.url() },
  ]);
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-reject-all').click();

  await expect
    .poll(() =>
      page.evaluate(() => ({
        disabled: Object.entries(window).find(([key]) => key.startsWith('ga-disable-G-'))?.[1],
        cookies: document.cookie,
      })),
    )
    .toEqual({ disabled: true, cookies: 'theme=dark' });

  await page.getByRole('link', { name: 'Tools', exact: true }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect.poll(() => pageViewCount(page)).toBe(3);

  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-accept-all').click();

  await expect
    .poll(() =>
      page.evaluate(
        () => Object.entries(window).find(([key]) => key.startsWith('ga-disable-G-'))?.[1],
      ),
    )
    .toBe(false);
  await expect.poll(() => pageViewCount(page)).toBe(4);
});

test('cancels a pending banner when another tab records a decision', async ({ context, page }) => {
  await page.goto('/');
  await expect(page.getByTestId('cookie-banner')).toBeVisible();

  const secondPage = await context.newPage();
  await secondPage.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('cookie-reject-all').click();

  await secondPage.waitForTimeout(700);
  await expect(secondPage.getByTestId('cookie-banner')).toBeHidden();
  await expect
    .poll(() => secondPage.evaluate(() => localStorage.getItem('cookie-consent')))
    .toBe(JSON.stringify({ analytics: false }));
});

test('does not replay a page view queued before withdrawal when gtag loads after re-acceptance', async ({
  context,
  page,
}) => {
  let releaseGoogleScript!: () => void;
  const googleScriptGate = new Promise<void>((resolve) => {
    releaseGoogleScript = resolve;
  });
  let googleScriptRequests = 0;

  await context.route('https://www.googletagmanager.com/**', async (route) => {
    googleScriptRequests += 1;
    await googleScriptGate;
    await route.fulfill({ contentType: 'application/javascript', body: '' });
  });

  await page.goto('/');
  await page.getByTestId('cookie-accept-all').click();
  await expect.poll(() => googleScriptRequests).toBe(1);
  expect(await pageViewCount(page)).toBe(0);

  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-reject-all').click();
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-accept-all').click();

  releaseGoogleScript();
  await expect.poll(() => pageViewCount(page)).toBe(1);

  await page.getByRole('link', { name: 'Tools', exact: true }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect.poll(() => pageViewCount(page)).toBe(2);
});

test('localStorage.clear in another tab stops GA and reopens the banner', async ({
  context,
  page,
}) => {
  await context.route('https://www.googletagmanager.com/**', async (route) => {
    await route.fulfill({ contentType: 'application/javascript', body: '' });
  });

  await page.goto('/');
  await page.getByTestId('cookie-accept-all').click();
  await expect.poll(() => pageViewCount(page)).toBe(1);

  const secondPage = await context.newPage();
  await secondPage.goto('/');
  await expect.poll(() => pageViewCount(secondPage)).toBe(1);
  await context.addCookies([{ name: '_ga', value: 'GA1.1.111.222', url: secondPage.url() }]);

  await page.evaluate(() => localStorage.clear());

  await expect(secondPage.getByTestId('cookie-banner')).toBeVisible();
  await expect
    .poll(() =>
      secondPage.evaluate(() => ({
        disabled: Object.entries(window).find(([key]) => key.startsWith('ga-disable-G-'))?.[1],
        cookies: document.cookie,
      })),
    )
    .toEqual({ disabled: true, cookies: '' });
});

test('retries a failed gtag load after withdrawal and re-acceptance without replay', async ({
  context,
  page,
}) => {
  let googleScriptRequests = 0;
  await context.route('https://www.googletagmanager.com/**', async (route) => {
    googleScriptRequests += 1;
    if (googleScriptRequests === 1) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({ contentType: 'application/javascript', body: '' });
  });

  await page.goto('/');
  await page.getByTestId('cookie-accept-all').click();
  await expect.poll(() => googleScriptRequests).toBe(1);
  expect(await pageViewCount(page)).toBe(0);

  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-reject-all').click();
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-accept-all').click();

  await expect.poll(() => googleScriptRequests).toBe(2);
  await expect.poll(() => pageViewCount(page)).toBe(1);
});
