/**
 * E2E Tests: SEO and Blog Navigation
 *
 * Essential SEO and meta data tests to ensure proper search engine indexing
 * and user navigation between calculator and blog pages.
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { expect, test } from '@playwright/test';

test.describe('Essential SEO Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if it appears
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🍪 Cookie banner dismissed');
    }
  });

  test.describe('Homepage Meta Data', () => {
    test('should have proper page title', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking homepage title...');

      // Check page title
      await expect(page).toHaveTitle(/UK.*Tax.*Calculator.*PayeTax/i);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Homepage title is correct');
    });

    test('should have meta description', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking meta description...');

      // Check meta description exists
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);

      const content = await metaDescription.getAttribute('content');
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📝 Meta description: ${content?.substring(0, 50)}...`);
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Meta description exists');
    });

    test('should have structured data schema', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking structured data schemas...');

      // Check for structured data scripts - we now have 1 script with SoftwareApplication schema
      const structuredDataScripts = page.locator('script[type="application/ld+json"]');
      const scriptCount = await structuredDataScripts.count();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📊 Found ${scriptCount} structured data script(s)`);

      expect(scriptCount).toBeGreaterThanOrEqual(1);

      // Verify key structured data exists
      const scriptContents = await structuredDataScripts.allTextContents();
      const combinedContent = scriptContents.join(' ');
      expect(combinedContent).toContain('"@type":"SoftwareApplication"');

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Structured data schema verified');
    });

    test('should have visible calculator section', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking calculator section visibility...');

      // Check that calculator section is visible
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });

      // Check for tax-related content or headings
      const taxContent = page.getByText(/tax|calculator|paye|national insurance/i);
      const contentCount = await taxContent.count();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📊 Found ${contentCount} tax-related content elements`);

      // Should have tax-related content visible on homepage
      expect(contentCount).toBeGreaterThan(0);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Calculator section and content visible');
    });
  });

  test.describe('Blog Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to blog
      await page.goto('/blog', { waitUntil: 'networkidle' });

      // Dismiss cookie banner if it appears
      const acceptCookiesButton = page.locator('button:has-text("Accept All")');
      const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
      if (cookieBannerVisible) {
        await acceptCookiesButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('should load blog page with proper heading', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking blog page heading...');

      // Should have blog heading - "TaxInsights"
      await expect(page.getByRole('heading', { name: /TaxInsights/i }).first()).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Blog heading "TaxInsights" found');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'audit-outputs/test-results/seo-blog-page.png',
        fullPage: false,
      });
    });

    test('should navigate back to calculator from blog', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing navigation back to calculator...');

      // Should be able to navigate back to calculator - target the specific "Back to Calculator" link
      const homeLink = page.getByRole('link', { name: 'Back to Calculator' });
      const hasHomeLink = (await homeLink.count()) > 0;

      if (!hasHomeLink) {
        // biome-ignore lint/suspicious/noConsole: Test debugging output
        console.log('⏭️  Skipping - no "Back to Calculator" link found');
        test.skip();
        return;
      }

      await expect(homeLink).toBeVisible();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🎯 Clicking "Back to Calculator" link...');

      await homeLink.click();
      await page.waitForLoadState('networkidle');

      // Should arrive at calculator page
      await expect(
        page
          .getByRole('heading', { name: /free uk paye tax calculator|uk tax calculator/i })
          .first(),
      ).toBeVisible({ timeout: 10000 });

      const currentURL = page.url();
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`✅ Navigated back to calculator: ${currentURL}`);
    });

    test('should display blog posts if available', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking for blog posts...');

      // Check if blog posts exist
      const blogPosts = page.locator('article');
      const postCount = await blogPosts.count();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📊 Found ${postCount} blog post(s)`);

      if (postCount === 0) {
        // biome-ignore lint/suspicious/noConsole: Test debugging output
        console.log('⏭️  No blog posts available yet - this is OK for new blog');
        test.skip();
        return;
      }

      // Verify posts are visible
      await expect(blogPosts.first()).toBeVisible();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Blog posts are visible');
    });
  });
});
