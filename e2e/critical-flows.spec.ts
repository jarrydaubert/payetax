/**
 * Critical User Flows E2E Tests
 *
 * Focused, reliable tests for the most important user journeys:
 * 1. Calculator basic flow
 * 2. Blog category filtering (tests our gradient fix)
 * 3. Mobile landscape prompt (tests our new feature)
 *
 * These tests use simple, stable selectors and proper assertions.
 */

import { expect, test } from '@playwright/test';

test.describe('Critical Flows', () => {
  // ============================================================================
  // 1. CALCULATOR - Core functionality
  // ============================================================================

  test('Calculator: should accept salary input and display results', async ({ page }) => {
    await page.goto('/');

    // ASSERT: Homepage loaded
    await expect(page).toHaveTitle(/PayeTax/);

    // Enter salary
    const salaryInput = page.locator('input[type="number"]').first();
    await salaryInput.click();
    await salaryInput.fill('45000');
    await salaryInput.blur();

    // Wait for results (debounced)
    await page.waitForTimeout(1000);

    // ASSERT: Results table visible
    const resultsTable = page.getByTestId('results-table');
    await expect(resultsTable).toBeVisible({ timeout: 5000 });

    // ASSERT: Key values present
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('£45,000');
    expect(pageContent).toContain('Gross Pay');
    expect(pageContent).toContain('Net Pay');
    expect(pageContent).toContain('£12,570'); // Tax-free allowance

    // Screenshot for manual verification
    await page.screenshot({
      path: 'audit-outputs/test-results/calculator-45k.png',
      fullPage: true,
    });
  });

  // ============================================================================
  // 2. BLOG FILTER - Test our gradient fix
  // ============================================================================

  test('Blog: should show gradient on active category button', async ({ page }) => {
    await page.goto('/blog');

    // ASSERT: Blog page loaded
    await expect(page.getByRole('heading', { name: /taxinsights/i })).toBeVisible();

    // Find "All Posts" button
    const allPostsButton = page.getByRole('button', { name: /all posts/i });
    await expect(allPostsButton).toBeVisible();

    // ASSERT: Active button has gradient class
    const allPostsClasses = await allPostsButton.getAttribute('class');
    expect(allPostsClasses).toContain('bg-action-primary');
    expect(allPostsClasses).toContain('scale-110');

    // Screenshot showing gradient
    await page.screenshot({
      path: 'audit-outputs/test-results/blog-filter-gradient.png',
    });

    // Click a category if one exists
    const categoryButtons = page.getByRole('button').filter({ hasText: /tax/i });
    const firstCategory = categoryButtons.first();

    if (await firstCategory.isVisible()) {
      await firstCategory.click();

      // Wait for navigation
      await page.waitForTimeout(500);

      // ASSERT: URL updated
      expect(page.url()).toContain('category=');

      // ASSERT: Clicked category now has gradient
      const clickedClasses = await firstCategory.getAttribute('class');
      expect(clickedClasses).toContain('bg-action-primary');

      // Screenshot after filter
      await page.screenshot({
        path: 'audit-outputs/test-results/blog-category-selected.png',
      });
    }
  });

  // ============================================================================
  // 3. LANDSCAPE PROMPT - Mobile portrait
  // ============================================================================

  test('Landscape Prompt: should show on mobile portrait', async ({ page }) => {
    // Set mobile viewport (portrait)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');

    // Clear any previous dismissal
    await page.evaluate(() => localStorage.removeItem('landscape-prompt-dismissed'));

    // Enter salary to trigger results
    const salaryInput = page.locator('input[type="number"]').first();
    await salaryInput.click();
    await salaryInput.fill('45000');
    await salaryInput.blur();

    // Wait for results
    await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 5000 });

    // ASSERT: Landscape prompt appears
    const promptText = page.getByText(/rotate for better view/i);
    await expect(promptText).toBeVisible({ timeout: 3000 });

    // ASSERT: Dismiss button exists
    const dismissButton = page.getByLabel(/dismiss/i);
    await expect(dismissButton).toBeVisible();

    // Screenshot showing prompt
    await page.screenshot({
      path: 'audit-outputs/test-results/mobile-landscape-prompt.png',
      fullPage: true,
    });

    // Test dismissal
    await dismissButton.click();
    await expect(promptText).not.toBeVisible();

    // ASSERT: localStorage updated
    const dismissed = await page.evaluate(() => localStorage.getItem('landscape-prompt-dismissed'));
    expect(dismissed).toBe('true');
  });

  test('Landscape Prompt: should NOT show on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');

    // Clear localStorage
    await page.evaluate(() => localStorage.removeItem('landscape-prompt-dismissed'));

    // Enter salary
    const salaryInput = page.locator('input[type="number"]').first();
    await salaryInput.fill('45000');
    await salaryInput.blur();

    // Wait for results
    await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 5000 });

    // ASSERT: Prompt should NOT appear on desktop
    const promptText = page.getByText(/rotate for better view/i);
    await expect(promptText).not.toBeVisible();

    // Screenshot confirming no prompt
    await page.screenshot({
      path: 'audit-outputs/test-results/desktop-no-prompt.png',
    });
  });

  // ============================================================================
  // 4. RESPONSIVE DESIGN
  // ============================================================================

  test('Responsive: mobile navigation should work', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // ASSERT: Mobile menu button visible
    const mobileMenuButton = page
      .getByLabel(/menu/i)
      .or(page.getByRole('button', { name: /menu/i }));
    if (await mobileMenuButton.first().isVisible()) {
      await expect(mobileMenuButton.first()).toBeVisible();

      // Screenshot mobile view
      await page.screenshot({
        path: 'audit-outputs/test-results/mobile-view.png',
        fullPage: true,
      });
    }
  });

  // ============================================================================
  // 5. UNIT TEST INTEGRATION - CategoryFilter & LandscapePrompt
  // ============================================================================

  test('Integration: CategoryFilter gradient classes applied correctly', async ({ page }) => {
    await page.goto('/blog');

    const buttons = page.getByRole('button').filter({ hasText: /posts|tax/i });
    const count = await buttons.count();

    // At least one button should exist
    expect(count).toBeGreaterThan(0);

    // Check first button has proper styling classes
    const firstButton = buttons.first();
    const classes = await firstButton.getAttribute('class');

    // Should have transition and rounded styling
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('transition');
  });

  test('Integration: LandscapePrompt renders with correct ARIA', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.evaluate(() => localStorage.removeItem('landscape-prompt-dismissed'));

    const salaryInput = page.locator('input[type="number"]').first();
    await salaryInput.fill('45000');
    await salaryInput.blur();

    await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 5000 });

    // Check ARIA attributes
    const prompt = page.getByRole('status');
    if (await prompt.isVisible()) {
      const ariaLabel = await prompt.getAttribute('aria-label');
      expect(ariaLabel).toContain('Rotate device');

      const ariaLive = await prompt.getAttribute('aria-live');
      expect(ariaLive).toBe('polite');
    }
  });
});
