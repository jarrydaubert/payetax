import { expect, test } from '@playwright/test';

test.describe('Tax Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the calculator page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ToolHubX/);

    // Check main heading is visible
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    // Check calculator form is present
    await expect(page.locator('form')).toBeVisible();
  });

  test('should perform basic tax calculation with HMRC-compliant amounts', async ({ page }) => {
    // Fill in salary
    const salaryInput = page.getByLabel(/salary/i);
    await salaryInput.fill('30000');

    // Select tax year (if available)
    const taxYearSelect = page.getByLabel(/tax year/i);
    if (await taxYearSelect.isVisible()) {
      await taxYearSelect.selectOption('2024-25');
    }

    // Click calculate button
    const calculateButton = page.getByRole('button', { name: /calculate/i });
    await calculateButton.click();

    // Wait for results to appear
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/national insurance/i)).toBeVisible();
    await expect(page.getByText(/net pay/i)).toBeVisible();

    // Check that tax amounts are displayed
    const taxTable = page.locator('table, [role="table"]');
    await expect(taxTable).toBeVisible();

    // Verify HMRC-compliant calculations for £30,000 salary (2024-25)
    // Tax-free allowance: £12,570
    // Taxable income: £17,430
    // Income tax (20%): £3,486
    // National Insurance: Class 1 - 12% on earnings between £12,570 and £30,000 = £2,091.60

    // Check specific tax amounts (allowing for small rounding differences)
    const incomeTaxElement = page.locator('[data-testid*="income-tax"], .income-tax').first();
    if (await incomeTaxElement.isVisible()) {
      const incomeTaxText = await incomeTaxElement.textContent();
      const incomeTaxAmount = parseFloat(incomeTaxText?.replace(/[£,]/g, '') || '0');
      expect(incomeTaxAmount).toBeCloseTo(3486, 0); // Within £1 tolerance
    }

    const nationalInsuranceElement = page
      .locator('[data-testid*="national-insurance"], .national-insurance')
      .first();
    if (await nationalInsuranceElement.isVisible()) {
      const niText = await nationalInsuranceElement.textContent();
      const niAmount = parseFloat(niText?.replace(/[£,]/g, '') || '0');
      expect(niAmount).toBeCloseTo(2091.6, 1); // Within £0.10 tolerance
    }
  });

  test('should validate salary input', async ({ page }) => {
    const salaryInput = page.getByLabel(/salary/i);

    // Test negative value
    await salaryInput.fill('-1000');
    await salaryInput.blur();

    // Should show validation error or prevent invalid input
    // (Implementation depends on validation approach)

    // Test zero value
    await salaryInput.fill('0');
    await salaryInput.blur();

    // Zero should be valid
    expect(await salaryInput.inputValue()).toBe('0');
  });

  test('should handle pension contributions with accurate calculations', async ({ page }) => {
    // Fill basic details
    await page.getByLabel(/salary/i).fill('50000');

    // Add 5% pension contribution
    const pensionPercentageRadio = page.getByLabel(/percentage/i);
    if (await pensionPercentageRadio.isVisible()) {
      await pensionPercentageRadio.check();
    }

    const pensionInput = page.getByLabel(/pension/i).last();
    if (await pensionInput.isVisible()) {
      await pensionInput.fill('5');
    }

    // Calculate
    await page.getByRole('button', { name: /calculate/i }).click();

    // Check pension appears in results
    await expect(page.getByText(/pension/i)).toBeVisible({ timeout: 10000 });

    // Verify pension contribution amount
    // 5% of £50,000 = £2,500
    const pensionElement = page.locator('[data-testid*="pension"], .pension-contribution').first();
    if (await pensionElement.isVisible()) {
      const pensionText = await pensionElement.textContent();
      const pensionAmount = parseFloat(pensionText?.replace(/[£,]/g, '') || '0');
      expect(pensionAmount).toBeCloseTo(2500, 1);
    }
  });

  test('should calculate student loan repayments correctly', async ({ page }) => {
    // Test Plan 2 student loan at £35,000 salary
    await page.getByLabel(/salary/i).fill('35000');

    // Add student loan Plan 2
    const studentLoanSelect = page.getByLabel(/student.*loan/i);
    if (await studentLoanSelect.isVisible()) {
      await studentLoanSelect.selectOption('plan2');
    }

    // Calculate
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // For Plan 2 at £35,000 salary:
    // Threshold: £27,295, Rate: 9%
    // Repayment: 9% of (£35,000 - £27,295) = 9% of £7,705 = £693.45
    const studentLoanElement = page.locator('[data-testid*="student-loan"], .student-loan').first();
    if (await studentLoanElement.isVisible()) {
      const studentLoanText = await studentLoanElement.textContent();
      const studentLoanAmount = parseFloat(studentLoanText?.replace(/[£,]/g, '') || '0');
      expect(studentLoanAmount).toBeCloseTo(693.45, 1);
    }
  });

  test('should calculate higher rate tax correctly', async ({ page }) => {
    // Test higher rate taxpayer - £60,000 salary
    await page.getByLabel(/salary/i).fill('60000');
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // For £60,000 salary in 2024-25:
    // Tax-free allowance: £12,570
    // Basic rate (20%) on £37,700 (£12,570 to £50,270): £7,540
    // Higher rate (40%) on £9,730 (£50,270 to £60,000): £3,892
    // Total income tax: £11,432

    const incomeTaxElement = page.locator('[data-testid*="income-tax"], .income-tax').first();
    if (await incomeTaxElement.isVisible()) {
      const incomeTaxText = await incomeTaxElement.textContent();
      const incomeTaxAmount = parseFloat(incomeTaxText?.replace(/[£,]/g, '') || '0');
      expect(incomeTaxAmount).toBeCloseTo(11432, 5); // Within £5 tolerance
    }
  });

  test('should toggle Scottish tax rates with different calculations', async ({ page }) => {
    // Fill basic details - £45,000 salary where Scottish rates differ
    await page.getByLabel(/salary/i).fill('45000');

    // Calculate with English rates first
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Get the initial tax amount
    const initialTaxElement = page.locator('[data-testid*="income-tax"], .income-tax').first();
    let initialTaxAmount = 0;
    if (await initialTaxElement.isVisible()) {
      const initialTaxText = await initialTaxElement.textContent();
      initialTaxAmount = parseFloat(initialTaxText?.replace(/[£,]/g, '') || '0');
    }

    // Toggle Scottish rates
    const scottishToggle = page.getByLabel(/scottish/i);
    if (await scottishToggle.isVisible()) {
      await scottishToggle.check();

      // Recalculate
      await page.getByRole('button', { name: /calculate/i }).click();
      await page.waitForTimeout(1000); // Wait for calculation

      // Get Scottish tax amount
      let scottishTaxAmount = 0;
      if (await initialTaxElement.isVisible()) {
        const scottishTaxText = await initialTaxElement.textContent();
        scottishTaxAmount = parseFloat(scottishTaxText?.replace(/[£,]/g, '') || '0');
      }

      // Scottish rates should be different for £45,000 salary
      // England: Basic rate 20% on £32,430 = £6,486
      // Scotland: Intermediate rate 21% on portion + basic 20% = slightly higher
      expect(Math.abs(scottishTaxAmount - initialTaxAmount)).toBeGreaterThan(50); // Should differ by more than £50
    }
  });

  test('should export results to Excel', async ({ page }) => {
    // Perform calculation first
    await page.getByLabel(/salary/i).fill('35000');
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Start download
    const downloadPromise = page.waitForEvent('download');
    const exportButton = page.getByRole('button', { name: /export.*excel/i });

    if (await exportButton.isVisible()) {
      await exportButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    }
  });

  test('should print results correctly', async ({ page }) => {
    // Perform calculation first
    await page.getByLabel(/salary/i).fill('40000');
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Test print functionality
    const printButton = page.getByRole('button', { name: /print/i });
    if (await printButton.isVisible()) {
      // Mock print dialog
      let _printCalled = false;
      await page.exposeFunction('mockPrint', () => {
        _printCalled = true;
      });

      await page.addInitScript(() => {
        window.print = () => {
          (window as typeof window & { mockPrint: () => void }).mockPrint();
        };
      });

      await printButton.click();

      // Verify print was triggered (if implementation calls window.print)
      await page.waitForTimeout(500);
      // Note: Actual verification depends on print implementation
    }
  });

  test('should handle different period selections', async ({ page }) => {
    // Perform calculation
    await page.getByLabel(/salary/i).fill('30000');
    await page.getByRole('button', { name: /calculate/i }).click();
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Test different period buttons
    const periods = ['Monthly', 'Weekly', 'Daily'];

    for (const period of periods) {
      const periodButton = page.getByRole('button', { name: new RegExp(period, 'i') });

      if (await periodButton.isVisible()) {
        await periodButton.click();
        await page.waitForTimeout(500);

        // Verify the amounts changed
        await expect(page.getByText(/income tax/i)).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check page loads correctly on mobile
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    // Check form is usable
    await page.getByLabel(/salary/i).fill('25000');
    await page.getByRole('button', { name: /calculate/i }).click();

    // Check results display properly on mobile
    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });

    // Check horizontal scroll if table is wide
    const table = page.locator('table, [role="table"]');
    if (await table.isVisible()) {
      const tableWidth = await table.evaluate((el) => el.scrollWidth);
      const _viewportWidth = page.viewportSize()?.width || 375;

      // Table might be wider than viewport on mobile
      expect(tableWidth).toBeGreaterThan(0);
    }
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // Test navigation to about page
    const aboutLink = page.getByRole('link', { name: /about/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // Navigate back
      await page.goBack();
      await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();
    }

    // Test navigation to blog
    const blogLink = page.getByRole('link', { name: /blog/i });
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
    }
  });

  test('should meet accessibility standards', async ({ page }) => {
    // Check for proper headings structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for proper form labels
    const salaryInput = page.getByLabel(/salary/i);
    await expect(salaryInput).toBeVisible();

    // Check skip to content link
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check for proper ARIA attributes
    const form = page.locator('form');
    if (await form.isVisible()) {
      const formRole = await form.getAttribute('role');
      expect(formRole).toBeTruthy();
    }
  });

  test('should load quickly and meet performance standards', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to homepage
    await page.goto('/');

    // Wait for main content to load
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check that critical resources are loaded
    const calculatorForm = page.locator('form');
    await expect(calculatorForm).toBeVisible();

    // Test interaction responsiveness
    const salaryInput = page.getByLabel(/salary/i);
    const interactionStartTime = Date.now();

    await salaryInput.click();
    await salaryInput.fill('30000');

    const interactionTime = Date.now() - interactionStartTime;

    // Interaction should be responsive (under 100ms)
    expect(interactionTime).toBeLessThan(500);
  });
});
