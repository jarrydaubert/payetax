import { expect, test } from '@playwright/test';

test('NI preserves pence in the 2026–27 annual estimate and on category changes', async ({
  page,
}) => {
  await page.goto('/tools/national-insurance-calculator');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('2026-27');
  const salary = page.getByRole('textbox', { name: 'Annual salary' });
  const result = page.getByText('Your NI (Employee)', { exact: true }).locator('..');

  // HMRC 2026–27 annual thresholds: (£30,000.50 − £12,570) × 8% = £1,394.44.
  // The tool displays the annual estimate rounded to whole pounds.
  await salary.fill('30,000.50');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  await expect(result.getByText('£1,394', { exact: true })).toBeVisible();

  // Under-21 category M has the same employee rate but a £50,270 employer threshold.
  await page.getByRole('button', { name: 'Category M', exact: true }).click();
  await expect(result.getByText('£1,394', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Employer NI', { exact: true }).locator('..').getByText('£0', { exact: true }),
  ).toBeVisible();

  await salary.fill('-5000');
  await expect(result).toHaveCount(0);
  await page.getByRole('button', { name: 'Category A', exact: true }).click();
  await expect(salary).toHaveAccessibleDescription(/Negative amounts are not supported/);
  await expect(result).toHaveCount(0);
});

test('Marriage Allowance shows regional eligibility and annual household cost', async ({
  page,
}) => {
  // Wait for the client form before filling the server-rendered input controls.
  await page.goto('/tools/marriage-allowance-calculator', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('2026-27');
  const lower = page.getByRole('textbox', { name: /Lower Earner/ });
  const higher = page.getByRole('textbox', { name: /Higher Earner/ });
  const submit = page.getByRole('button', { name: 'Check Eligibility' });
  const results = page.getByRole('heading', { name: 'Estimated annual household impact' });
  const scotland = page.getByRole('region', { name: 'Scotland' });
  const ruk = page.getByRole('region', { name: 'England, Wales and Northern Ireland' });

  // Scottish higher rate begins above £43,662. The rUK basic-rate limit is £50,270.
  await lower.fill('8,000');
  await higher.fill('43,662');
  await submit.click();
  await expect(scotland.getByText('Eligible on these incomes', { exact: true })).toBeVisible();
  await higher.fill('43,663');
  await expect(results).toHaveCount(0);
  await submit.click();
  await expect(scotland.getByText('Ineligible on these incomes', { exact: true })).toBeVisible();
  await expect(ruk.getByText('Eligible on these incomes', { exact: true })).toBeVisible();
  await expect(ruk.getByText('Recipient tax relief').locator('..')).toContainText('£252.00');

  // At the Scottish starter rate, the recipient has £1,280 × 19% of tax to reduce.
  await higher.fill('13,850');
  await submit.click();
  await expect(scotland.getByText('Recipient tax relief').locator('..')).toContainText('£243.20');

  // rUK annual relief is £430 × 20%; the transferor pays £1,190 × 20% extra.
  await lower.fill('12,500');
  await higher.fill('13,000');
  await submit.click();
  await expect(ruk.getByText('Net household cost').locator('..')).toContainText('£152.00');
  await expect(page.getByText(/wages only, standard Personal Allowances/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'GOV.UK backdating guidance' })).toBeVisible();
  await expect(page.getByText(/for a total of up to/)).toHaveCount(0);

  await lower.fill('30,000');
  await higher.fill('40,000');
  await submit.click();
  await expect(ruk.getByText('No net household change').locator('..')).toContainText('£0.00');
  await expect(scotland.getByText('Net household cost').locator('..')).toContainText('£12.60');

  await lower.fill('45,000');
  await submit.click();
  await expect(lower).toHaveAccessibleDescription(/Enter the lower annual income here/);
  await expect(results).toHaveCount(0);
  await lower.fill('30,000');

  await higher.fill('£1,2,3');
  await expect(results).toHaveCount(0);
  await submit.click();
  await expect(higher).toHaveAccessibleDescription(/Use commas only to separate thousands/);
  await expect(results).toHaveCount(0);
});
