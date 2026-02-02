/**
 * Smoke Tests - Essential Page Load & Navigation
 *
 * What bugs do these tests find?
 * - Build/deployment broke a page (404, 500)
 * - Routing misconfiguration
 * - Critical components not rendering
 * - CSP or security policy blocking content
 */

import { expect, test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Homepage loads and "Open Calculator" works @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PayeTax|Tax Calculator|PAYE/i);
    await expect(page.locator('h1')).toBeVisible();

    // Home is a marketing page; calculator lives at /calculator.
    await expect(page.getByRole('link', { name: /open calculator/i })).toBeVisible();
    await page.getByRole('link', { name: /open calculator/i }).click();

    // Depending on the CTA, we either navigate to /calculator or jump to the in-page calculator section.
    await expect(page).toHaveURL(/(\/calculator|#tax-calculator)/);
    await expect(page.getByTestId('salary-input')).toBeVisible();
  });

  test('Blog page loads with posts @smoke', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/TaxInsights|Blog/i);
    await expect(
      page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]').first(),
    ).toBeVisible();
  });

  test('Tools landing page loads @smoke', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('h1')).toContainText(/tools/i);
    await expect(page.getByTestId('tools-link-director-guide')).toBeVisible();
    await expect(page.getByTestId('tools-link-tax-code-decoder')).toBeVisible();
  });

  test('About page loads @smoke', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Privacy page loads @smoke', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Compliance page loads @smoke', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Navigation links work @smoke', async ({ page }) => {
    await page.goto('/');

    // Navigate to Blog
    await page
      .locator('nav a')
      .filter({ hasText: /blog|taxinsights/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/blog/);

    // Navigate back home via logo
    await page.locator('a[href="/"]').first().click();
    await expect(page.locator('h1')).toBeVisible();

    // Ensure primary CTA still navigates to the calculator.
    await page.getByRole('link', { name: /open calculator/i }).click();
    await expect(page).toHaveURL(/(\/calculator|#tax-calculator)/);
    await expect(page.getByTestId('salary-input')).toBeVisible();
  });

  test('No CSP errors in console @smoke', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.goto('/blog');

    expect(errors).toHaveLength(0);
  });
});
