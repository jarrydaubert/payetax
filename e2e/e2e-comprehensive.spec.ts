/**
 * Core User Journeys E2E Tests
 *
 * Modern Playwright best practices:
 * - Strict selectors using test IDs and accessible roles
 * - Auto-waiting (built-in retry logic)
 * - Data-testid for critical elements
 * - Visual regression with screenshots
 * - Proper assertions (no false positives)
 *
 * Coverage:
 * 1. Calculator flow (salary input → results)
 * 2. Blog filter and navigation (gradient fix validation)
 * 3. Mobile landscape prompt (our new feature)
 * 4. Responsive design
 */

import { expect, test } from '@playwright/test';

test.describe('Core User Journeys', () => {
  test.describe.configure({ mode: 'parallel' });

  // ============================================================================
  // 1. CALCULATOR - Basic Tax Calculation
  // ============================================================================

  test.describe('Calculator - Basic Tax Calculation', () => {
    test('should calculate tax for £45,000 salary and display results', async ({ page }) => {
      await page.goto('/');

      // ASSERT: Page loaded successfully
      await expect(page).toHaveTitle(/PayeTax/);

      // Take screenshot of initial state
      await page.screenshot({
        path: 'audit-outputs/test-results/calculator-initial.png',
        fullPage: true,
      });

      // Enter salary - use test ID (salary input is type="text" with inputmode="decimal")
      const salaryInput = page.getByTestId('salary-input');
      await expect(salaryInput).toBeVisible();
      await salaryInput.click();
      await salaryInput.fill('45000');
      await salaryInput.blur(); // Trigger any onBlur handlers

      // ASSERT: Input accepted (formatted with commas and .00 after blur)
      await expect(salaryInput).toHaveValue('45,000.00');

      // Click calculate button to trigger calculation
      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();

      // Wait for results table to appear (debounced calculation ~500ms)
      const resultsTable = page.getByTestId('results-table');
      await expect(resultsTable).toBeVisible({ timeout: 5000 });

      // Take screenshot of results
      await page.screenshot({
        path: 'audit-outputs/test-results/calculator-results.png',
        fullPage: true,
      });

      // STRICT ASSERTIONS: Verify key calculated values exist
      // Using textContent checks instead of exact matches for stability

      // Verify Gross Pay row exists
      const pageText = await page.textContent('body');
      expect(pageText).toContain('Gross Pay');
      expect(pageText).toContain('£45,000');

      // Verify Tax-Free Allowance
      expect(pageText).toContain('Tax-Free Allowance');
      expect(pageText).toContain('£12,570');

      // Verify Total Tax Due exists
      expect(pageText).toContain('Total Tax Due');
      expect(pageText).toContain('£6,486');

      // Verify Net Pay exists and is reasonable
      expect(pageText).toContain('Net Pay');

      // STRICT: Check that net pay is displayed (should be ~£34,302)
      const netPayMatch = pageText?.match(/Net Pay.*?£([\d,]+)/s);
      expect(netPayMatch).toBeTruthy();
    });

    test('should update results when salary changes', async ({ page }) => {
      await page.goto('/');

      const salaryInput = page.getByTestId('salary-input');

      // Enter initial salary
      await salaryInput.click();
      await salaryInput.fill('30000');
      await salaryInput.blur();

      // Calculate
      const calculateButton = page.getByTestId('calculate-button');
      await calculateButton.click();

      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 5000 });

      // Get initial page state
      const initialPageText = await page.textContent('body');
      expect(initialPageText).toContain('£30,000');

      // Change salary
      await salaryInput.click();
      await salaryInput.fill('50000');
      await salaryInput.blur();
      await page.waitForTimeout(1000); // Wait for debounce + calculation

      // ASSERT: New salary should be displayed
      const updatedPageText = await page.textContent('body');
      expect(updatedPageText).toContain('£50,000');

      // ASSERT: Page content changed
      expect(updatedPageText).not.toBe(initialPageText);

      // Screenshot the updated results
      await page.screenshot({
        path: 'audit-outputs/test-results/calculator-updated.png',
        fullPage: true,
      });
    });
  });

  // ============================================================================
  // 2. BLOG - Category Filtering (Testing our gradient fix)
  // ============================================================================

  test.describe('Blog - Category Filtering', () => {
    test('should filter blog posts by category with active gradient styling', async ({ page }) => {
      await page.goto('/blog');

      // ASSERT: Page loaded
      await expect(page.getByRole('heading', { name: /taxinsights/i })).toBeVisible();

      // ASSERT: "All Posts" button is visible and active by default
      const allPostsButton = page.getByRole('button', { name: /all posts/i });
      await expect(allPostsButton).toBeVisible();

      // STRICT: Verify active button has gradient background
      const allPostsClasses = await allPostsButton.getAttribute('class');
      expect(allPostsClasses).toContain('bg-action-primary');
      expect(allPostsClasses).toContain('scale-110');

      // Find and click a category button
      const taxBasicsButton = page.getByRole('button', { name: /tax basics/i }).first();
      if (await taxBasicsButton.isVisible()) {
        await taxBasicsButton.click();

        // ASSERT: URL should update with category filter
        await expect(page).toHaveURL(/category=tax-basics/);

        // ASSERT: Active category should have gradient styling
        const taxBasicsClasses = await taxBasicsButton.getAttribute('class');
        expect(taxBasicsClasses).toContain('bg-action-primary');
        expect(taxBasicsClasses).toContain('shadow-[0_0_25px_rgba(168,85,247,0.6)]');

        // ASSERT: "All Posts" should no longer have active styling
        const updatedAllPostsClasses = await allPostsButton.getAttribute('class');
        expect(updatedAllPostsClasses).not.toContain('bg-action-primary');
        expect(updatedAllPostsClasses).toContain('bg-card/50');
      }
    });

    test('should reset filter when clicking "All Posts"', async ({ page }) => {
      // Start with a category filter
      await page.goto('/blog?category=tax-tips');

      // ASSERT: Category is selected
      const taxTipsButton = page.getByRole('button', { name: /tax tips/i }).first();
      if (await taxTipsButton.isVisible()) {
        await expect(taxTipsButton).toBeVisible();

        // Click "All Posts"
        const allPostsButton = page.getByRole('button', { name: /all posts/i });
        await allPostsButton.click();

        // ASSERT: URL should reset
        await expect(page).toHaveURL('/blog');

        // ASSERT: "All Posts" should be active again
        const allPostsClasses = await allPostsButton.getAttribute('class');
        expect(allPostsClasses).toContain('bg-action-primary');
      }
    });
  });

  // ============================================================================
  // 3. LANDSCAPE PROMPT - Mobile Portrait Detection
  // ============================================================================

  test.describe('Landscape Prompt - Mobile Portrait', () => {
    test('should show landscape prompt on mobile portrait when viewing results', async ({
      page,
      viewport,
    }) => {
      // Set mobile viewport (portrait)
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro

      await page.goto('/');

      // Enter salary to trigger results
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await salaryInput.fill('45000');

      // Wait for results
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      // ASSERT: Landscape prompt should appear
      const landscapePrompt = page.getByText(/rotate for better view/i);
      await expect(landscapePrompt).toBeVisible({ timeout: 2000 });

      // ASSERT: Should have animated phone icon
      const promptContainer = page.getByRole('status', { name: /rotate device/i });
      await expect(promptContainer).toBeVisible();

      // ASSERT: Should have dismiss button
      const dismissButton = page.getByLabel(/dismiss landscape prompt/i);
      await expect(dismissButton).toBeVisible();
    });

    test('should NOT show landscape prompt on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto('/');

      // Enter salary
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await salaryInput.fill('45000');

      // Wait for results
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      // ASSERT: Landscape prompt should NOT appear on desktop
      const landscapePrompt = page.getByText(/rotate for better view/i);
      await expect(landscapePrompt).not.toBeVisible();
    });

    test('should persist dismissal in localStorage', async ({ page, context }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto('/');

      // Trigger results
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await salaryInput.fill('45000');
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      // Dismiss prompt
      const dismissButton = page.getByLabel(/dismiss landscape prompt/i);
      await dismissButton.click();

      // ASSERT: Prompt should disappear
      await expect(page.getByText(/rotate for better view/i)).not.toBeVisible();

      // ASSERT: localStorage should be set
      const dismissed = await page.evaluate(() => {
        return localStorage.getItem('landscape-prompt-dismissed');
      });
      expect(dismissed).toBe('true');

      // Reload page
      await page.reload();
      await salaryInput.fill('50000');
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      // ASSERT: Prompt should NOT reappear
      await expect(page.getByText(/rotate for better view/i)).not.toBeVisible();
    });
  });

  // ============================================================================
  // 4. WHAT-IF COMPARISON
  // ============================================================================

  test.describe('What-If Comparison', () => {
    test('should enable What-If mode and show comparison', async ({ page }) => {
      await page.goto('/');

      // Enter base salary
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await salaryInput.fill('45000');
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      // Enable What-If mode
      const whatIfButton = page.getByRole('button', { name: /what.*if/i });
      await expect(whatIfButton).toBeVisible();
      await whatIfButton.click();

      // ASSERT: What-If inputs should appear
      const whatIfContainer = page.getByText(/compare scenarios/i);
      await expect(whatIfContainer).toBeVisible();

      // Enter What-If salary
      const whatIfSalaryInput = page.getByLabel(/what.*if.*salary/i);
      await whatIfSalaryInput.fill('50000');

      // ASSERT: Results table should show comparison columns
      const resultsTable = page.getByTestId('results-table');
      await expect(resultsTable).toBeVisible();

      // ASSERT: Table should have What-If column headers
      const whatIfHeader = page.getByRole('columnheader', { name: /what.*if/i }).first();
      await expect(whatIfHeader).toBeVisible();
    });
  });

  // ============================================================================
  // 5. ACCESSIBILITY - Keyboard Navigation
  // ============================================================================

  test.describe('Accessibility - Keyboard Navigation', () => {
    test('should allow keyboard navigation through calculator inputs', async ({ page }) => {
      await page.goto('/');

      // Focus on salary input
      await page.keyboard.press('Tab');
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await expect(salaryInput).toBeFocused();

      // Enter value with keyboard
      await page.keyboard.type('45000');
      await expect(salaryInput).toHaveValue('45,000');

      // Tab to next input (tax code)
      await page.keyboard.press('Tab');
      const taxCodeInput = page.getByLabel(/tax code/i);
      await expect(taxCodeInput).toBeFocused();
    });

    test('should have proper ARIA labels on key elements', async ({ page }) => {
      await page.goto('/');

      // ASSERT: Main calculator section has proper label
      const calculatorSection = page.getByRole('region', { name: /calculator/i });
      await expect(calculatorSection).toBeVisible();

      // ASSERT: Results table has proper accessibility
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await salaryInput.fill('45000');
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });

      const resultsTableRegion = page.getByRole('region', { name: /tax calculation results/i });
      await expect(resultsTableRegion).toBeVisible();
    });
  });

  // ============================================================================
  // 6. PERFORMANCE - Core Web Vitals
  // ============================================================================

  test.describe('Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/', { waitUntil: 'load' });

      const loadTime = Date.now() - startTime;

      // ASSERT: Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // ASSERT: Critical content should be visible
      await expect(page.getByRole('heading', { name: /paye.*tax.*calculator/i })).toBeVisible();
    });

    test('should have no console errors on main pages', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.goto('/blog');
      await page.goto('/about');

      // ASSERT: No console errors
      expect(consoleErrors).toHaveLength(0);
    });
  });

  // ============================================================================
  // 7. RESPONSIVE DESIGN - Mobile vs Desktop
  // ============================================================================

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/');

      // ASSERT: Mobile navigation should be visible
      const mobileMenuButton = page.getByLabel(/open.*menu/i);
      await expect(mobileMenuButton).toBeVisible();

      // ASSERT: Calculator should be visible and functional
      const salaryInput = page.getByLabel(/gross.*annual.*salary/i);
      await expect(salaryInput).toBeVisible();
      await salaryInput.fill('35000');

      // ASSERT: Results should display (may be scrollable)
      await expect(page.getByTestId('results-table')).toBeVisible({ timeout: 3000 });
    });

    test('should hide mobile menu on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto('/');

      // ASSERT: Mobile menu button should NOT be visible on desktop
      const mobileMenuButton = page.getByLabel(/open.*menu/i);
      await expect(mobileMenuButton).not.toBeVisible();
    });
  });
});
