import { expect, test } from '@playwright/test';

test.describe('Modern Tax Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Add cache-busting parameter to avoid shared state between parallel tests
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);
  });

  test('should load the calculator page with modern components', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/PayeTax/);

    // Check main heading is visible using working selector - use first() to avoid strict mode violation
    await expect(
      page.getByRole('heading', { name: /free uk paye tax calculator|uk tax calculator/i }).first()
    ).toBeVisible();

    // Check calculator components are present using data-testids
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();
    await expect(page.locator('input[data-testid="salary-input"]')).toBeVisible();
  });

  test('should handle form interactions effectively', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test form input interactions
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });

    // Test input functionality
    await salaryInput.clear();
    await salaryInput.fill('30000');
    const inputValue = await salaryInput.inputValue();
    expect(inputValue).toMatch(/30[,]?000/); // Account for number formatting

    // Test calculate button is clickable
    const calculateButton = page.getByTestId('calculate-button');
    await expect(calculateButton).toBeVisible();
    await expect(calculateButton).toBeEnabled();
  });

  test('should display tax results container', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify tax results container exists
    const taxResults = page.locator('[data-testid="tax-results"]');
    await expect(taxResults).toBeVisible({ timeout: 10000 });

    // Verify it has some content (even if just the placeholder text or results table)
    const hasContent = await taxResults.textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent).toMatch(/(Display Periods|Category|Gross Pay|Ready to Calculate)/); // Should contain results table or placeholder
  });

  test('should handle responsive design effectively', async ({ page }) => {
    // Test mobile viewport with responsive components
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check responsive components adapt to mobile
    await expect(
      page.getByRole('heading', { name: /free uk paye tax calculator|uk tax calculator/i }).first()
    ).toBeVisible();

    // Test mobile form interaction
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });

    // Verify input is still functional on mobile
    await salaryInput.clear();
    await salaryInput.fill('25000');
    const inputValue = await salaryInput.inputValue();
    expect(inputValue).toMatch(/25[,]?000/); // Account for number formatting

    // Check mobile-friendly results container
    const taxResults = page.locator('[data-testid="tax-results"]');
    await expect(taxResults).toBeVisible({ timeout: 10000 });
  });

  test('should meet accessibility standards', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give page time to fully render

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check for proper labels on form inputs
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });

    // Verify input has accessible attributes
    const hasAriaLabel = await salaryInput.getAttribute('aria-label');
    const hasLabel = await salaryInput.getAttribute('id');
    expect(hasAriaLabel || hasLabel).toBeTruthy();
  });

  test('should meet performance standards', async ({ page }) => {
    const startTime = Date.now();

    // Navigate and measure load time with modern optimizations
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByRole('heading', { name: /free uk paye tax calculator|uk tax calculator/i }).first()
    ).toBeVisible();

    const loadTime = Date.now() - startTime;
    // Modern React should provide reasonable loading
    expect(loadTime).toBeLessThan(15000);

    // Test interaction performance
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });

    const interactionStartTime = Date.now();
    await salaryInput.click();
    await salaryInput.fill('30000');
    const interactionTime = Date.now() - interactionStartTime;

    // Should provide responsive interactions
    expect(interactionTime).toBeLessThan(3000);
  });

  test('should handle form validation gracefully', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give page time to fully render

    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });

    // Test with invalid input
    await salaryInput.clear();
    await salaryInput.fill('invalid-salary');

    // Button should still be present (validation may prevent calculation but UI should remain stable)
    const calculateButton = page.getByTestId('calculate-button');
    await expect(calculateButton).toBeVisible();

    // Tax results container should still be present
    const taxResults = page.locator('[data-testid="tax-results"]');
    await expect(taxResults).toBeVisible({ timeout: 5000 });
  });
});
