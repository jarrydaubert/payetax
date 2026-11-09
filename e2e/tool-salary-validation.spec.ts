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

test('Marriage Allowance uses the 2026–27 basic-rate recipient income with pence', async ({
  page,
}) => {
  await page.goto('/tools/marriage-allowance-calculator');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('2026-27');
  const lower = page.getByRole('textbox', { name: /Lower Earner/ });
  const higher = page.getByRole('textbox', { name: /Higher Earner/ });
  const submit = page.getByRole('button', { name: 'Check Eligibility' });
  const eligible = page.getByRole('heading', { name: 'You Qualify for Marriage Allowance!' });

  // £10,000 is below the Personal Allowance and £30,000.50 is in the rUK basic-rate band.
  await lower.fill('10,000');
  await higher.fill('30,000.50');
  await submit.click();
  await expect(eligible).toBeVisible();

  await higher.fill('£1,2,3');
  await expect(eligible).toHaveCount(0);
  await submit.click();
  await expect(higher).toHaveAccessibleDescription(/Use commas only to separate thousands/);
  await expect(page.getByRole('heading', { name: "You Don't Qualify" })).toHaveCount(0);
});
