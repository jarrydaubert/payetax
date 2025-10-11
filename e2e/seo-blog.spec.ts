// e2e/seo-blog.spec.ts
// Essential SEO and meta data tests only

import { expect, test } from '@playwright/test';

test.describe('Essential SEO Tests', () => {
  test('Homepage should have proper meta data and structured data', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/UK.*Tax.*Calculator.*PayeTax/i);

    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check for structured data scripts - we now have 1 script with SoftwareApplication schema
    // (consolidation happened as part of schema optimization)
    const structuredDataScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await structuredDataScripts.count();
    expect(scriptCount).toBeGreaterThanOrEqual(1);

    // Verify key structured data exists
    const scriptContents = await structuredDataScripts.allTextContents();
    const combinedContent = scriptContents.join(' ');
    expect(combinedContent).toContain('"@type":"SoftwareApplication"');
  });

  test('Blog page should be accessible and have proper navigation', async ({ page }) => {
    // Test blog page loads with clean state
    await page.goto('/blog', { waitUntil: 'networkidle' });

    // Should have blog heading - "TaxInsights"
    await expect(page.getByRole('heading', { name: /TaxInsights/i }).first()).toBeVisible({
      timeout: 10000,
    });

    // Should be able to navigate back to calculator - target the specific "Back to Calculator" link
    const homeLink = page.getByRole('link', { name: 'Back to Calculator' });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(
        page
          .getByRole('heading', { name: /free uk paye tax calculator|uk tax calculator/i })
          .first()
      ).toBeVisible();
    }
  });

  test('Key content sections should be visible on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that calculator section is visible
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();

    // Check for tax-related content or headings
    const taxContent = page.getByText(/tax|calculator|paye|national insurance/i);
    const contentCount = await taxContent.count();

    // Should have tax-related content visible on homepage
    expect(contentCount).toBeGreaterThan(0);
  });
});
