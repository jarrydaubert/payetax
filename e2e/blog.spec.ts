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
    // Find and click a category group link
    const categoryLink = page
      .locator('a')
      .filter({ hasText: /Tax Guides|Student Loans|News/i })
      .first();
    await categoryLink.click();

    // Verify URL updated to category route
    await page.waitForURL(/\/blog\/category\//, { timeout: 5000 });
    expect(page.url()).toContain('/blog/category/');
  });

  test('can navigate to individual blog post', async ({ page }) => {
    const firstPost = page.locator('a[href^="/blog/"]').first();
    await firstPost.click();

    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('article')).toBeVisible();
  });

  test('All Posts resets filter', async ({ page }) => {
    // Apply a filter first
    const categoryLink = page
      .locator('a')
      .filter({ hasText: /Tax Guides|News/i })
      .first();
    await categoryLink.click();
    await page.waitForURL(/\/blog\/category\//);

    // Click All Articles
    await page.locator('a:has-text("All Articles")').click();

    // URL should not have category param
    await expect(page).toHaveURL(/\/blog$/);
  });
});
