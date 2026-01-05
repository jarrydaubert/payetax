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
  test('Homepage loads with calculator', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PayeTax|Tax Calculator|PAYE/i);
    await expect(page.getByTestId('salary-input')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Blog page loads with posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/TaxInsights|Blog/i);
    await expect(
      page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]').first()
    ).toBeVisible();
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Compliance page loads', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
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
    await expect(page.getByTestId('salary-input')).toBeVisible();
  });

  test('No CSP errors in console', async ({ page }) => {
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
