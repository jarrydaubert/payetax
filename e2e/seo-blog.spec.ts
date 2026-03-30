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
      await expect(acceptCookiesButton)
        .toBeHidden({ timeout: 5000 })
        .catch(() => {});
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

    test('should have primary calculator CTA', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking calculator CTA visibility...');

      const calculatorCta = page.getByRole('link', { name: /open calculator/i });
      await expect(calculatorCta).toBeVisible({ timeout: 10000 });

      const href = (await calculatorCta.getAttribute('href')) ?? '';
      expect(href).toMatch(/\/calculator|#tax-calculator/);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Calculator CTA present');
    });
  });

  test.describe('Blog Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to blog
      await page.goto('/blog', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });

      // Dismiss cookie banner if it appears
      const acceptCookiesButton = page.locator('button:has-text("Accept All")');
      const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
      if (cookieBannerVisible) {
        await acceptCookiesButton.click();
        await expect(acceptCookiesButton)
          .toBeHidden({ timeout: 5000 })
          .catch(() => {});
      }
    });

    test('should load blog page with proper heading', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking blog page heading...');

      // Blog heading copy can evolve; assert a stable, intent-aligned H1.
      const heading = page.locator('main h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      await expect(heading).toContainText(/TaxInsights|UK Tax Guides|PAYE Insights/i);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Blog heading found');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'audit-outputs/test-results/seo-blog-page.png',
        fullPage: false,
      });
    });

    test('should navigate back to calculator from blog', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing navigation back to calculator...');

      // Prefer explicit blog CTA; fallback to general calculator nav link.
      const ctaLink = page.getByRole('link', { name: /try the free calculator/i });
      const navLink = page
        .getByRole('link', { name: /^calculator$/i })
        .or(page.getByRole('link', { name: /open calculator/i }))
        .first();
      const homeLink = (await ctaLink.count()) > 0 ? ctaLink.first() : navLink;

      await expect(homeLink).toBeVisible();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🎯 Clicking calculator link from blog...');

      await homeLink.click();
      await page
        .waitForURL((url) => {
          const pathname = url.pathname;
          return pathname === '/' || pathname.startsWith('/calculator');
        })
        .catch(() => {});
      await page.waitForLoadState('domcontentloaded').catch(() => {});

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

      if (postCount > 0) {
        await expect(blogPosts.first()).toBeVisible();
        // biome-ignore lint/suspicious/noConsole: Test debugging output
        console.log('✅ Blog posts are visible');
        return;
      }

      // Empty-state is valid and should still render a stable UX affordance.
      await expect(page.getByText('No articles found.')).toBeVisible();
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Empty-state message shown when no posts exist');
    });
  });
});
