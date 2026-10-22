/**
 * Smoke Tests - Essential Page Load & Navigation
 *
 * What bugs do these tests find?
 * - Build/deployment broke a page (404, 500)
 * - Routing misconfiguration
 * - Critical components not rendering
 * - CSP or security policy blocking content
 */

import { expect, type Page, test } from '@playwright/test';

async function expectCalculatorAvailable(page: Page): Promise<void> {
  const salary = page.getByTestId('salary-input');
  await expect(salary).toBeVisible();
  await expect(salary).toBeEnabled();
}

async function openMainMenuIfCollapsed(page: Page): Promise<void> {
  const desktopBlogLink = page
    .locator('nav[aria-label="Main navigation"] a[href="/blog"]:visible')
    .first();
  if (await desktopBlogLink.isVisible().catch(() => false)) {
    return;
  }

  const menuToggle = page.getByRole('button', { name: /open menu|close menu/i }).first();
  if (await menuToggle.isVisible().catch(() => false)) {
    await menuToggle.click();
  }
}

test.describe('Smoke Tests', () => {
  test('Homepage loads with the calculator available @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PayeTax|Tax Calculator|PAYE/i);
    await expect(page.locator('h1')).toBeVisible();

    // The calculator is available directly on the homepage.
    await expectCalculatorAvailable(page);
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

  test('Scottish calculator CTA opens the main calculator with Scotland selected @smoke', async ({
    page,
  }) => {
    await page.goto('/tools/scottish-tax-calculator');
    await page.evaluate(() => window.localStorage.removeItem('tax-calculator-storage'));
    await page.reload();

    const ctaButton = page.getByRole('button', { name: 'Open Full Scottish Calculator' });
    const ctaLink = ctaButton.locator('xpath=ancestor::a');

    await expect(ctaLink).toHaveAttribute('href', '/#tax-calculator');
    await ctaButton.click();

    await expect(page).toHaveURL(/\/#tax-calculator$/);
    await expect(page.getByTestId('region-select')).toContainText('Scotland');
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
    await openMainMenuIfCollapsed(page);

    // Navigate to Blog
    const blogNavLink = page.locator('a[href="/blog"]:visible').first();
    await expect(blogNavLink).toBeVisible();
    await blogNavLink.click();
    await expect(page).toHaveURL(/\/blog(?:$|[?#])/);

    // Navigate back home via logo
    await page
      .getByRole('link', { name: /payetax/i })
      .first()
      .click();
    await expect(page.locator('h1')).toBeVisible();

    // Ensure the calculator is available after navigating home.
    await expectCalculatorAvailable(page);
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
