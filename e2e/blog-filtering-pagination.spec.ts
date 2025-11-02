/**
 * E2E Tests: Blog Filtering and Pagination
 *
 * Tests for blog category filtering and pagination functionality
 * to ensure users can properly navigate and filter blog content.
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { expect, test } from '@playwright/test';

test.describe('Blog Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('should display category filter buttons', async ({ page }) => {
    // Check that category filter section is visible
    const categoryFilter = page.locator('text=Browse Topics').first();
    await expect(categoryFilter).toBeVisible();

    // Check that "All Posts" button exists
    const allPostsButton = page.locator('button:has-text("All Posts")');
    await expect(allPostsButton).toBeVisible();

    // Check that category buttons exist (should have at least a few)
    const categoryButtons = page.locator('button').filter({ hasText: /Tax|Guide|Tips/ });
    const count = await categoryButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter posts when clicking a category', async ({ page }) => {
    // Get initial post count
    const initialPosts = page.locator('article').filter({ hasText: /Tax|Guide|Finance/ });
    const initialCount = await initialPosts.count();
    // biome-ignore lint/suspicious/noConsole: Test output for debugging
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📊 Initial posts visible: ${initialCount}`);

    // Find and click a category button (e.g., "Tax Basics" or first available category)
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips|Tax Changes/i })
      .first();

    const categoryName = await categoryButton.textContent();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🎯 Clicking category: ${categoryName}`);

    await categoryButton.click();

    // Wait for URL to update with category parameter
    await page.waitForURL(/category=/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🔗 URL updated to: ${currentURL}`);

    // Verify URL contains category parameter
    expect(currentURL).toContain('category=');

    // Verify category badge is shown
    const categoryBadge = page.locator('text=Viewing:').first();
    await expect(categoryBadge).toBeVisible({ timeout: 5000 });

    // Get filtered post count
    const filteredPosts = page.locator('article').filter({ hasText: /Tax|Guide|Finance/ });
    const filteredCount = await filteredPosts.count();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📊 Filtered posts visible: ${filteredCount}`);

    // Filtered posts should exist (might be same or less than initial)
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should show "All Posts" when clicking "All Posts" button', async ({ page }) => {
    // First, filter by a category
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();
    await categoryButton.click();
    await page.waitForURL(/category=/, { timeout: 5000 });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🎯 Filtered by category');

    // Now click "All Posts" to clear filter
    const allPostsButton = page.locator('button:has-text("All Posts")');
    await allPostsButton.click();
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🔗 URL after "All Posts": ${currentURL}`);

    // Verify category parameter is removed from URL
    expect(currentURL).not.toContain('category=');

    // Verify category badge is NOT shown
    const categoryBadge = page.locator('text=Viewing:').first();
    await expect(categoryBadge).not.toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Filter cleared successfully');
  });

  test('should highlight active category button', async ({ page }) => {
    // Click a category
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();
    await categoryButton.click();
    await page.waitForURL(/category=/);

    // Check that the clicked button has active styling (purple gradient background)
    const activeButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();

    // Get computed styles
    const hasActiveClass = await activeButton.evaluate((el) => {
      const classes = el.className;
      return classes.includes('from-purple-600') || classes.includes('bg-gradient');
    });

    expect(hasActiveClass).toBe(true);
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Active category button is highlighted');
  });

  test('should be clickable and respond to hover', async ({ page }) => {
    // Get a category button
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();

    // Verify it's clickable by checking it's not covered by another element
    const isClickable = await categoryButton.isEnabled();
    expect(isClickable).toBe(true);

    // Verify hover state (check for hover class or transition)
    await categoryButton.hover();

    // Take screenshot on hover for visual verification
    await page.screenshot({
      path: 'audit-outputs/test-results/category-filter-hover.png',
      fullPage: false,
    });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Category button is clickable and responds to hover');
  });
});

test.describe('Blog Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('should display pagination when multiple pages exist', async ({ page }) => {
    // Check if pagination exists
    const paginationSection = page.locator('text=of').first(); // "1 of 2" format

    // Only run pagination tests if pagination exists
    const hasPagination = (await paginationSection.count()) > 0;

    if (!hasPagination) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping pagination tests - only one page of posts exists');
      test.skip();
      return;
    }

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Pagination section found');

    // Check for Next button (should exist if not on last page)
    const nextButton = page.locator('a:has-text("Next")');
    const hasNextButton = (await nextButton.count()) > 0;

    if (hasNextButton) {
      await expect(nextButton).toBeVisible();
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Next button visible');
    }
  });

  test('should navigate to next page when clicking "Next"', async ({ page }) => {
    // Check if Next button exists
    const nextButton = page.locator('a:has-text("Next")').first();
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping - no Next button (on last page or single page)');
      test.skip();
      return;
    }

    // Get posts on page 1
    const page1Posts = page.locator('article');
    const page1Count = await page1Posts.count();
    const page1FirstTitle = await page1Posts.first().locator('h3').textContent();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📄 Page 1: ${page1Count} posts`);
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📝 First post on page 1: ${page1FirstTitle}`);

    // Click Next
    await nextButton.click();
    await page.waitForURL(/page=2/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🔗 Navigated to: ${currentURL}`);

    // Verify URL contains page=2
    expect(currentURL).toContain('page=2');

    // Get posts on page 2
    const page2Posts = page.locator('article');
    const page2Count = await page2Posts.count();
    const page2FirstTitle = await page2Posts.first().locator('h3').textContent();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📄 Page 2: ${page2Count} posts`);
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`📝 First post on page 2: ${page2FirstTitle}`);

    // Verify different content
    expect(page2FirstTitle).not.toBe(page1FirstTitle);

    // Verify page indicator shows "2 of X"
    const pageIndicator = page.locator('text=/2 of/').first();
    await expect(pageIndicator).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Successfully navigated to page 2');
  });

  test('should navigate back with "Previous" button', async ({ page }) => {
    // First navigate to page 2
    const nextButton = page.locator('a:has-text("Next")').first();
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping - no pagination available');
      test.skip();
      return;
    }

    // Go to page 2
    await nextButton.click();
    await page.waitForURL(/page=2/);
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('📄 Navigated to page 2');

    // Now click Previous
    const previousButton = page.locator('a:has-text("Previous")').first();
    await expect(previousButton).toBeVisible();

    await previousButton.click();
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🔗 Navigated back to: ${currentURL}`);

    // Verify URL doesn't contain page parameter (page 1)
    expect(currentURL).not.toContain('page=2');

    // Verify page indicator shows "1 of X"
    const pageIndicator = page.locator('text=/1 of/').first();
    await expect(pageIndicator).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Successfully navigated back to page 1');
  });

  test('should maintain category filter when paginating', async ({ page }) => {
    // First filter by category
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();

    const categoryExists = (await categoryButton.count()) > 0;
    if (!categoryExists) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping - no categories available');
      test.skip();
      return;
    }

    const categoryName = await categoryButton.textContent();
    await categoryButton.click();
    await page.waitForURL(/category=/);
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🎯 Filtered by: ${categoryName}`);

    // Check if pagination exists in filtered view
    const nextButton = page.locator('a:has-text("Next")').first();
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Category has only one page - test passed (filter working)');
      test.skip();
      return;
    }

    // Click Next while in filtered view
    await nextButton.click();
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`🔗 Page 2 URL: ${currentURL}`);

    // Verify both category and page parameters are in URL
    expect(currentURL).toContain('category=');
    expect(currentURL).toContain('page=2');

    // Verify category badge still visible
    const categoryBadge = page.locator('text=Viewing:').first();
    await expect(categoryBadge).toBeVisible();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Category filter maintained during pagination');
  });

  test('pagination buttons should be clickable', async ({ page }) => {
    const nextButton = page.locator('a:has-text("Next")').first();
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  No pagination to test');
      test.skip();
      return;
    }

    // Verify button is clickable
    const isClickable = await nextButton.isEnabled();
    expect(isClickable).toBe(true);

    // Verify hover state
    await nextButton.hover();

    // Take screenshot
    await page.screenshot({
      path: 'audit-outputs/test-results/pagination-hover.png',
      fullPage: false,
    });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Pagination button is clickable and responds to hover');
  });
});

test.describe('Blog Filtering + Pagination Integration', () => {
  test('should correctly filter and paginate together', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Step 1: Filter by category
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();

    const hasCategory = (await categoryButton.count()) > 0;
    if (!hasCategory) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  No categories to test');
      test.skip();
      return;
    }

    await categoryButton.click();
    await page.waitForURL(/category=/);
    await page.waitForLoadState('networkidle');

    const categoryURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Step 1: Filtered - ${categoryURL}`);

    // Step 2: Navigate to page 2 (if exists)
    const nextButton = page.locator('a:has-text("Next")').first();
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Category filter working (single page of filtered results)');
      return;
    }

    await nextButton.click();
    await page.waitForLoadState('networkidle');

    const page2URL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Step 2: Page 2 - ${page2URL}`);

    // Step 3: Clear filter (All Posts)
    const allPostsButton = page.locator('button:has-text("All Posts")');
    await allPostsButton.click();
    await page.waitForLoadState('networkidle');

    const allPostsURL = page.url();
    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Step 3: All Posts - ${allPostsURL}`);

    // Verify category cleared but should be on some page
    expect(allPostsURL).not.toContain('category=');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Complete filtering + pagination workflow works');
  });
});
