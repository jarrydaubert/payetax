import { expect, type Page, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

function events(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => {
    const entries = (window as Window & { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [];
    return entries.map((entry) => Array.from(entry)).filter((entry) => entry[0] === 'event');
  });
}

test('PAYE completion events exclude financial data and URL queries through withdrawal', async ({
  context,
  page,
}) => {
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.goto(
    '/?privacy_canary=73123&utm_source=results_email&utm_medium=email&utm_campaign=salary73123&gclid=click73123#tax-calculator',
  );
  await page.getByTestId('cookie-accept-all').click();
  await expect.poll(() => events(page)).not.toEqual([]);
  await page.getByTestId('salary-input').fill('45000');
  await page.getByTestId('salary-input').blur();
  await page.getByTestId('calculate-button').press('Enter');
  await expect(page.getByTestId('tax-results')).toBeVisible();
  await expect
    .poll(async () => (await events(page)).some((e) => e[1] === 'calculator_completed'))
    .toBe(true);
  const payload = JSON.stringify(await events(page));
  expect(payload).not.toMatch(
    /73123|45000|35k_50k|salary_range|has_pension|has_student_loan|tax_year/,
  );
  expect(payload).not.toContain('campaign_source');
  for (const event of await events(page)) {
    expect(event[2]).toMatchObject({
      page_location: new URL('/', page.url()).href,
      page_referrer: '',
    });
  }
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await page.getByTestId('cookie-modal-reject-all').click();
  const before = (await events(page)).filter((e) => e[1] === 'calculator_completed').length;
  await page.getByTestId('salary-input').fill('55000');
  await page.getByTestId('salary-input').blur();
  await page.getByTestId('calculate-button').press('Enter');
  await expect(page.getByTestId('tax-results')).toBeVisible();
  expect((await events(page)).filter((e) => e[1] === 'calculator_completed')).toHaveLength(before);
});

for (const [source, campaign] of [
  ['results_email', 'results_followup'],
  ['director_results_email', 'director_recalculate'],
]) {
  test(`preserves only approved ${source} campaign attribution after consent`, async ({
    context,
    page,
  }) => {
    await context.route('https://www.googletagmanager.com/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await page.goto(
      `/?utm_source=${source}&utm_medium=email&utm_campaign=${campaign}&salary=73123&gclid=click73123&utm_content=73123`,
    );
    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    expect(await events(page)).toEqual([]);
    await page.getByTestId('cookie-accept-all').click();
    await expect.poll(() => events(page)).not.toEqual([]);
    const config = await page.evaluate(() => {
      const commands = (window as Window & { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [];
      return commands.map((entry) => Array.from(entry)).find((entry) => entry[0] === 'config')?.[2];
    });
    const attribution = {
      campaign_source: source,
      campaign_medium: 'email',
      campaign_name: campaign,
    };
    expect(config).toMatchObject(attribution);
    for (const event of await events(page)) expect(event[2]).toMatchObject(attribution);
    expect(JSON.stringify({ config, events: await events(page) })).not.toMatch(/73123|gclid|utm_/);
  });
}

test('Director retains completion counts without profit bands, VAT warnings or result conditions', async ({
  context,
  page,
}) => {
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/');
  await page.getByTestId('cookie-accept-all').click();
  await page.getByRole('link', { name: 'Director Intelligence', exact: true }).click();
  await page.getByTestId('director-revenue-input').fill('120000');
  await page.getByTestId('director-expenses-input').fill('10000');
  await page.getByTestId('director-expenses-input').blur();
  await page.getByTestId('director-region-select').click();
  await page.getByRole('option', { name: /England/ }).click();
  await expect
    .poll(async () => (await events(page)).some((e) => e[1] === 'pro_calculator_completed'))
    .toBe(true);
  const directorEvents = (await events(page)).filter((e) =>
    /^(guide_|pro_|director_)/.test(String(e[1])),
  );
  expect(JSON.stringify(directorEvents)).not.toMatch(
    /120000|10000|100k_250k|under_25k|_bucket|vat-mandatory|survival|recommended|includes_vat|region/,
  );
  expect(directorEvents.find((e) => e[1] === 'pro_calculator_completed')?.[2]).toMatchObject({
    label: 'shown',
  });
});
