/**
 * Blog Tests - Essential Functionality
 *
 * What bugs do these tests find?
 * - Category filtering broken
 * - Blog posts not rendering
 * - URL routing for categories broken
 */

import { expect, test } from '@playwright/test';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('displays blog posts', async ({ page }) => {
    const posts = page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]');
    await expect(posts.first()).toBeVisible();
    expect(await posts.count()).toBeGreaterThan(0);
  });

  test('category filtering works', async ({ page }) => {
    // Find and click a category
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();
    await categoryButton.click();

    // Verify URL updated
    await page.waitForURL(/category=/, { timeout: 5000 });
    expect(page.url()).toContain('category=');
  });

  test('can navigate to individual blog post', async ({ page }) => {
    const firstPost = page.locator('a[href^="/blog/"]').first();
    await firstPost.click();

    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.locator('article, main')).toBeVisible();
  });

  test('All Posts resets filter', async ({ page }) => {
    // Apply a filter first
    const categoryButton = page.locator('button').filter({ hasText: /Tax/i }).first();
    await categoryButton.click();
    await page.waitForURL(/category=/);

    // Click All Posts
    await page.locator('button:has-text("All Posts")').click();

    // URL should not have category param
    await expect(page).toHaveURL(/\/blog$/);
  });
});
