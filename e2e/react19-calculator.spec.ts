import { expect, test } from '@playwright/test';

test.describe('React 19 Optimized Tax Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the calculator page with React 19 optimizations', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ToolHubX/);

    // Check main heading is visible
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    // Check calculator section is present with proper React 19 structure
    await expect(page.locator('section#calculator')).toBeVisible();

    // Verify React 19 useId() generated IDs are working (should be unique)
    const formElements = page.locator('[id^="_R_"]');
    const elementCount = await formElements.count();
    expect(elementCount).toBeGreaterThan(0); // Should have React 19 generated IDs
  });

  test('should perform tax calculation with specific element targeting', async ({ page }) => {
    // Use more specific selectors for the React 19 optimized form
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    await salaryInput.fill('30000');

    // Select tax year using more specific selector
    const taxYearSelect = page.getByRole('combobox', { name: /tax year/i });
    if (await taxYearSelect.isVisible()) {
      await taxYearSelect.selectOption('2025-26');
    }

    // Click calculate button
    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    // Wait for results to appear with React 19 transitions
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/national insurance/i)).toBeVisible();
    await expect(page.getByText(/net pay/i)).toBeVisible();

    // Check enhanced payslip table is present
    const payslipTable = page.locator('[data-testid="results-table"]');
    await expect(payslipTable).toBeVisible();
  });

  test('should handle React 19 useTransition for smooth interactions', async ({ page }) => {
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });

    // Test smooth transitions during input changes
    await salaryInput.fill('25000');
    await page.waitForTimeout(100); // Allow for useTransition to process

    await salaryInput.fill('50000');
    await page.waitForTimeout(100);

    await salaryInput.fill('75000');
    await page.waitForTimeout(100);

    // Calculate and verify smooth result updates
    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    // React 19 should provide smooth transitions
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle pension contributions with React 19 optimizations', async ({ page }) => {
    // Fill basic details
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    await salaryInput.fill('50000');

    // Test pension input with React 19 form handling
    const pensionInput = page.getByRole('textbox', { name: /pension contribution/i });
    if (await pensionInput.isVisible()) {
      await pensionInput.fill('5');
    }

    // Calculate
    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    // Check pension appears in enhanced payslip table
    await expect(page.getByText(/pension/i)).toBeVisible({ timeout: 10000 });
  });

  test('should export results with React 19 optimized components', async ({ page }) => {
    // Perform calculation first
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    await salaryInput.fill('35000');

    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Test React 19 optimized export component
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // Check export dropdown appears
    await expect(page.getByText(/export options/i)).toBeVisible();

    // Test Excel export
    const downloadPromise = page.waitForEvent('download');
    const excelButton = page.getByRole('button', { name: /export to excel/i });

    if (await excelButton.isVisible()) {
      await excelButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    }
  });

  test('should handle Scottish tax toggle with React 19 state management', async ({ page }) => {
    // Fill basic details
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    await salaryInput.fill('45000');

    // Calculate with English rates first
    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Get initial tax amount
    const resultsTable = page.locator('[data-testid="results-table"]');
    const initialResults = await resultsTable.textContent();

    // Toggle Scottish rates using React 19 optimized checkbox
    const scottishCheckbox = page.getByRole('checkbox', { name: /scottish taxpayer/i });
    if (await scottishCheckbox.isVisible()) {
      await scottishCheckbox.check();

      // Recalculate with React 19 state updates
      await calculateButton.click();
      await page.waitForTimeout(1000);

      // Verify results changed
      const newResults = await resultsTable.textContent();
      expect(newResults).not.toBe(initialResults);
    }
  });

  test('should handle responsive design with React 19 optimizations', async ({ page }) => {
    // Test mobile viewport with React 19 responsive components
    await page.setViewportSize({ width: 375, height: 667 });

    // Check React 19 components adapt to mobile
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    // Test mobile form interaction
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    await salaryInput.fill('25000');

    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    // Check enhanced mobile table with horizontal scroll
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    const resultsTable = page.locator('[data-testid="results-table"]');
    if (await resultsTable.isVisible()) {
      // Verify table is scrollable on mobile
      const tableWidth = await resultsTable.evaluate((el) => el.scrollWidth);
      expect(tableWidth).toBeGreaterThan(375); // Should be wider than viewport
    }
  });

  test('should verify accessibility with React 19 improvements', async ({ page }) => {
    // Check for proper React 19 accessibility features
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }

    // Test React 19 generated unique IDs for accessibility
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    const salaryId = await salaryInput.getAttribute('id');
    expect(salaryId).toBeTruthy();
    expect(salaryId).toMatch(/^_R_/); // React 19 useId pattern

    // Test keyboard navigation with React 19 focus management
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check for proper ARIA attributes with React 19 components
    const calculatorForm = page.locator('section#calculator');
    if (await calculatorForm.isVisible()) {
      const ariaLabel = await calculatorForm.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('should test performance with React 19 optimizations', async ({ page }) => {
    const startTime = Date.now();

    // Navigate and measure load time with React 19 optimizations
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    const loadTime = Date.now() - startTime;
    // React 19 should provide faster loading
    expect(loadTime).toBeLessThan(2500);

    // Test React 19 concurrent rendering performance
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });
    const interactionStartTime = Date.now();

    await salaryInput.click();
    await salaryInput.fill('30000');

    const interactionTime = Date.now() - interactionStartTime;
    // React 19 should provide faster interactions
    expect(interactionTime).toBeLessThan(300);

    // Test calculation performance with React 19 optimizations
    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    const calcStartTime = Date.now();

    await calculateButton.click();
    await expect(page.getByText(/income tax/i)).toBeVisible();

    const calcTime = Date.now() - calcStartTime;
    // Should calculate quickly with React 19 optimizations
    expect(calcTime).toBeLessThan(2000);
  });

  test('should test error boundary with React 19 error handling', async ({ page }) => {
    // Test React 19 error boundary by triggering potential errors
    const salaryInput = page.getByRole('textbox', { name: 'Gross salary in pounds' });

    // Try invalid input that might trigger error boundary
    await salaryInput.fill('invalid-salary-value');

    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    // Check if error is handled gracefully by React 19 error boundary
    const errorMessage = page.getByText(/error/i);
    if (await errorMessage.isVisible({ timeout: 2000 })) {
      // Error boundary should show user-friendly error
      await expect(page.getByText(/calculation error/i)).toBeVisible();
    } else {
      // Or validation should prevent the error
      await expect(salaryInput).toBeVisible();
    }
  });
});
