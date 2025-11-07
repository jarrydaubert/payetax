/**
 * Manual Verification E2E Test
 * Confirms TaxInsights navigation and blog filtering work as expected
 * NO MOCKS - Real browser interactions
 */

import { expect, test } from '@playwright/test';

test.describe('Manual Verification - User Experience', () => {
  test('VERIFY: Click TaxInsights in navbar → loads blog page correctly', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Wait for React to hydrate
    await page.waitForTimeout(1000);
    const taxInsightsLink = page.locator('nav a[href="/blog"]').filter({ hasText: /TaxInsights/i });

    // Verify it exists
    await expect(taxInsightsLink).toBeVisible();

    // Get the href to verify it points to /blog
    const href = await taxInsightsLink.getAttribute('href');
    expect(href).toBe('/blog');
    await Promise.all([page.waitForURL('**/blog'), taxInsightsLink.click()]);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/blog');
    const h1 = await page.locator('h1').textContent();
    expect(h1).toContain('TaxInsights');
    const blogPosts = page.locator('article, [class*="blog-post"], [class*="post-card"]');
    const postCount = await blogPosts.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test('VERIFY: Blog category filtering buttons work correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/blog');
    await page.waitForLoadState('networkidle');
    const categoryButtons = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips|Tax Changes/i });
    const buttonCount = await categoryButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    const allPosts = page.locator('article, [class*="blog-post"], [class*="post-card"]');
    const initialCount = await allPosts.count();
    const firstButton = categoryButtons.first();
    const categoryText = await firstButton.textContent();

    await firstButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Allow UI to update
    const filteredUrl = page.url();
    expect(filteredUrl).toContain('category=');
    const filteredPosts = page.locator('article, [class*="blog-post"], [class*="post-card"]');
    const filteredCount = await filteredPosts.count();

    // Verify filtering happened (either fewer posts or same if all belong to category)
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    const activeButton = page
      .locator('button[class*="bg-primary"], button[class*="text-primary-foreground"]')
      .filter({ hasText: new RegExp(categoryText || '', 'i') });

    if ((await activeButton.count()) > 0) {
    }
    const allPostsButton = page.locator('button').filter({ hasText: /All Posts/i });

    if ((await allPostsButton.count()) > 0) {
      await allPostsButton.click();
      await page.waitForLoadState('networkidle');

      const clearedUrl = page.url();
      expect(clearedUrl).toBe('http://localhost:3000/blog');

      const allPostsAgain = page.locator('article, [class*="blog-post"], [class*="post-card"]');
      const finalCount = await allPostsAgain.count();
      expect(finalCount).toBe(initialCount);
    }
  });

  test('VERIFY: No JavaScript errors in console', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const taxInsightsLink = page.locator('nav a').filter({ hasText: /TaxInsights/i });
    await taxInsightsLink.click();
    await page.waitForLoadState('networkidle');
    const categoryButton = page.locator('button').filter({ hasText: /Tax/i }).first();
    if ((await categoryButton.count()) > 0) {
      await categoryButton.click();
      await page.waitForLoadState('networkidle');
    }

    if (errors.length > 0) {
    }

    // No critical errors expected
    const criticalErrors = errors.filter(
      (e) => !(e.includes('DevTools') || e.includes('Extension') || e.includes('favicon'))
    );

    expect(criticalErrors.length).toBe(0);
  });
});
