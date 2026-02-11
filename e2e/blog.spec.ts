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
    await page.goto('/blog', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
  });

  test('displays blog posts', async ({ page }) => {
    const posts = page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]');
    await expect(posts.first()).toBeVisible();
    expect(await posts.count()).toBeGreaterThan(0);
  });

  test('category filtering works', async ({ page }) => {
    // Click the first category group in the dedicated blog category nav.
    const categoryLink = page
      .getByRole('navigation', { name: /blog categories/i })
      .locator('a[href^="/blog/category/"]')
      .first();
    await categoryLink.click();

    // Verify URL updated to category route
    await expect(page).toHaveURL(/\/blog\/category\/[^/?#]+(?:\?.*)?$/);
  });

  test('can navigate to individual blog post', async ({ page }) => {
    const firstPost = page
      .locator('main a[href^="/blog/"]:not([href*="/category/"]):not([href="/blog"])')
      .first();
    await firstPost.click();

    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('article')).toBeVisible();
  });

  test('All Posts resets filter', async ({ page }) => {
    // Apply a filter first
    const categoryLink = page
      .getByRole('navigation', { name: /blog categories/i })
      .locator('a[href^="/blog/category/"]')
      .first();
    await categoryLink.click();
    await expect(page).toHaveURL(/\/blog\/category\//);

    // Click All Articles
    await page
      .getByRole('navigation', { name: /blog categories/i })
      .getByRole('link', { name: 'All Articles' })
      .click();

    // URL should not have category param
    await expect(page).toHaveURL(/\/blog(?:\?.*)?$/);
  });
});
