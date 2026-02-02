/**
 * Director Guide Critical Path Tests
 *
 * What bugs will these tests find?
 * - Regressions that stop `/tools/director-guide` from producing results
 * - Survival Mode regressions (profit <= 0 should show Survival panel and hide strategy UI)
 * - VAT warning gating regressions (VAT warnings must show based on revenue even in Survival Mode)
 * - Email flow regressions (dialog opens and POST succeeds)
 */

import { expect, test } from '@playwright/test';

function formatGBP(value: number): string {
  return `£${value.toLocaleString('en-GB')}`;
}

test.describe('Director Guide critical @critical', () => {
  test('Normal mode: calculates and can email results @critical', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'domcontentloaded' });

    const revenueInput = page.getByTestId('director-revenue-input');
    const expensesInput = page.getByTestId('director-expenses-input');

    await revenueInput.fill('100000');
    await expensesInput.fill('20000');

    // Guard against controlled-currency inputs sometimes missing the onChange (flaky in CI when typing fast).
    await expect(revenueInput).toHaveValue(formatGBP(100000));
    await expect(expensesInput).toHaveValue(formatGBP(20000));

    await page.getByTestId('director-region-select').click();
    await page.getByRole('option', { name: 'England' }).click();

    // Auto-calculate kicks in; strategy UI should appear.
    await expect(page.getByRole('heading', { name: 'Choose Your Strategy' })).toBeVisible();

    // Mock email endpoint to avoid sending real emails.
    await page.route('/api/send-director-results', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.getByRole('button', { name: /Email My Results/i }).click();
    await expect(page.getByLabel('Email address')).toBeVisible();

    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /Send Results/i }).click();

    // Dialog should close on success.
    await expect(page.getByLabel('Email address')).toBeHidden();
  });

  test('Survival mode: shows Survival panel and VAT warning (ungated) @critical', async ({ page }) => {
    await page.goto('/tools/director-guide', { waitUntil: 'domcontentloaded' });

    // Zero profit: Survival Mode.
    const revenueInput = page.getByTestId('director-revenue-input');
    const expensesInput = page.getByTestId('director-expenses-input');

    await revenueInput.fill('90000');
    await expensesInput.fill('90000');
    await expect(revenueInput).toHaveValue(formatGBP(90000));
    await expect(expensesInput).toHaveValue(formatGBP(90000));

    await page.getByTestId('director-region-select').click();
    await page.getByRole('option', { name: 'England' }).click();

    await expect(page.getByTestId('director-survival-mode')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose Your Strategy' })).toBeHidden();

    // VAT warnings should be based on revenue, even in Survival Mode.
    await expect(page.getByText('VAT Registration Required')).toBeVisible();
  });
});
