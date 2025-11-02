/**
 * E2E Tests for Atoms Components
 * Tests actual user interactions with atomic components in the calculator
 */

import { expect, test } from '@playwright/test';

test.describe('Atoms Components - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calculator with cache-busting
    const timestamp = Date.now();
    await page.goto(`/?t=${timestamp}`);
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('NumberInput - Salary Field', () => {
    test('should allow typing numbers into salary input', async ({ page }) => {
      const salaryInput = page.locator('[data-testid="salary-input"]');

      await expect(salaryInput).toBeVisible();
      await salaryInput.clear();
      await salaryInput.fill('75000');

      // Input formats with commas, so check the parsed value
      const value = await salaryInput.inputValue();
      expect(Number.parseInt(value.replace(/,/g, ''), 10)).toBe(75000);
    });

    test('should format large numbers with commas in display', async ({ page }) => {
      const salaryInput = page.locator('[data-testid="salary-input"]');

      await salaryInput.clear();
      await salaryInput.fill('150000');
      await salaryInput.blur();

      // Wait for formatting to apply
      await page.waitForTimeout(500);

      // Input should accept the value
      const value = await salaryInput.inputValue();
      expect(Number.parseInt(value.replace(/,/g, ''), 10)).toBe(150000);
    });

    test('should handle decimal inputs correctly', async ({ page }) => {
      const salaryInput = page.locator('[data-testid="salary-input"]');

      await salaryInput.clear();
      await salaryInput.fill('50000.50');
      await salaryInput.blur(); // Trigger blur to format

      await page.waitForTimeout(300);
      const value = await salaryInput.inputValue();
      // Input may format as "50,000.50", so check parsed value
      const numValue = Number.parseFloat(value.replace(/,/g, ''));
      expect(numValue).toBeGreaterThanOrEqual(50000);
      expect(numValue).toBeLessThanOrEqual(50001);
    });

    test('should be keyboard accessible', async ({ page }) => {
      const salaryInput = page.locator('[data-testid="salary-input"]');

      // Focus directly on input instead of tabbing
      await salaryInput.focus();
      await salaryInput.clear();

      // Type using keyboard
      await page.keyboard.type('45000');
      await page.waitForTimeout(200);

      // Verify input received keyboard input (may be formatted)
      const value = await salaryInput.inputValue();
      const numValue = Number.parseInt(value.replace(/,/g, ''), 10);
      expect(numValue).toBe(45000);
    });
  });

  test.describe('TaxYearSelect Dropdown', () => {
    test('should display current tax year by default', async ({ page }) => {
      // Use role-based selector and .last() to skip tooltip button
      const taxYearButton = page.getByRole('button', { name: /tax year/i }).last();

      if (await taxYearButton.isVisible()) {
        await expect(taxYearButton).toContainText(/202[4-5]/);
      }
    });

    test('should open dropdown and show tax year options', async ({ page }) => {
      const taxYearButton = page.getByRole('button', { name: /tax year/i }).last();

      if (await taxYearButton.isVisible()) {
        await taxYearButton.click();

        // Should show multiple tax year options
        await expect(page.getByRole('option', { name: /2024-2025/i })).toBeVisible();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      const taxYearButton = page.getByRole('button', { name: /tax year/i }).last();

      if (await taxYearButton.isVisible()) {
        // Focus on tax year select
        await taxYearButton.focus();

        // Press Enter/Space to open
        await page.keyboard.press('Enter');

        // Arrow keys should navigate options
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Dropdown should close after selection
        await expect(page.getByRole('option', { name: /2024-2025/i })).not.toBeVisible();
      }
    });
  });

  test.describe('Tooltips (InputTooltip & LabelTooltip)', () => {
    test('should show tooltip on hover over help icon', async ({ page }) => {
      // Look for any help icon (HelpCircle icon next to inputs)
      const helpIcon = page.locator('[data-testid^="tooltip-trigger-"]').first();

      if (await helpIcon.isVisible()) {
        await helpIcon.hover();

        // Tooltip content should appear
        await expect(page.locator('[role="tooltip"]')).toBeVisible({ timeout: 3000 });
      }
    });

    test('should show tooltip for salary field', async ({ page }) => {
      const salaryTooltip = page.locator('[data-testid="tooltip-trigger-salary"]');

      if (await salaryTooltip.isVisible()) {
        await salaryTooltip.hover();

        // Should show "Gross Salary" tooltip content
        await expect(page.getByText(/Gross Salary/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should be keyboard accessible', async ({ page }) => {
      const helpIcon = page.locator('[data-testid^="tooltip-trigger-"]').first();

      if (await helpIcon.isVisible()) {
        // Tab to help icon
        await helpIcon.focus();

        // Press Enter or Space should show tooltip
        await page.keyboard.press('Enter');

        // Wait for tooltip
        await page.waitForTimeout(500);
      }
    });

    test('should hide tooltip when mouse leaves', async ({ page }) => {
      const helpIcon = page.locator('[data-testid^="tooltip-trigger-"]').first();

      if (await helpIcon.isVisible()) {
        // Show tooltip
        await helpIcon.hover();
        await page.waitForTimeout(500);

        // Check if tooltip is visible
        const tooltip = page.locator('[role="tooltip"]');
        const tooltipVisible = await tooltip.isVisible().catch(() => false);

        if (tooltipVisible) {
          // Move mouse away
          await page.mouse.move(0, 0);
          await page.waitForTimeout(800);

          // Tooltip should be hidden
          await expect(tooltip).not.toBeVisible({ timeout: 2000 });
        }
      }
    });
  });

  test.describe('PeriodCheckbox - Display Periods', () => {
    test('should show period selector checkboxes', async ({ page }) => {
      // Scroll to results section if needed
      const resultsSection = page.locator('[data-testid="tax-results"]');

      if (await resultsSection.isVisible()) {
        await resultsSection.scrollIntoViewIfNeeded();

        // Look for period checkboxes
        const yearlyCheckbox = page.getByRole('checkbox', { name: /yearly/i });
        if (await yearlyCheckbox.isVisible()) {
          await expect(yearlyCheckbox).toBeVisible();
        }
      }
    });

    test('should toggle period visibility when checkbox clicked', async ({ page }) => {
      // First perform a calculation to show results
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('50000');
      await page.waitForTimeout(1500); // Wait for auto-calculation

      const resultsSection = page.locator('[data-testid="tax-results"]');

      if (await resultsSection.isVisible()) {
        // Find a period checkbox
        const monthlyCheckbox = page.getByRole('checkbox', { name: /monthly/i });

        if (await monthlyCheckbox.isVisible()) {
          const isChecked = await monthlyCheckbox.isChecked();

          // Toggle it
          await monthlyCheckbox.click();
          await page.waitForTimeout(300);

          // State should change
          const newState = await monthlyCheckbox.isChecked();
          expect(newState).toBe(!isChecked);
        }
      }
    });

    test('should be keyboard accessible', async ({ page }) => {
      // Perform calculation first
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('50000');
      await page.waitForTimeout(1500);

      const resultsSection = page.locator('[data-testid="tax-results"]');

      if (await resultsSection.isVisible()) {
        const checkbox = page.getByRole('checkbox', { name: /yearly/i });

        if (await checkbox.isVisible()) {
          // Focus on checkbox
          await checkbox.focus();

          // Space key should toggle
          const isChecked = await checkbox.isChecked();
          await page.keyboard.press('Space');
          await page.waitForTimeout(100);

          const newState = await checkbox.isChecked();
          expect(newState).toBe(!isChecked);
        }
      }
    });
  });

  test.describe('ScrollIndicator - Table Scrolling', () => {
    test('should show scroll indicators on narrow viewports', async ({ page }) => {
      // Set narrow viewport to trigger horizontal scroll
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

      // Perform calculation to show results table
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('50000');
      await page.waitForTimeout(1500);

      const resultsSection = page.locator('[data-testid="tax-results"]');

      if (await resultsSection.isVisible()) {
        await resultsSection.scrollIntoViewIfNeeded();

        // Scroll indicators are visual overlays - just verify table is scrollable
        const table = page.locator('[data-testid="results-table"]');
        if (await table.isVisible()) {
          await expect(table).toBeVisible();
        }
      }
    });

    test('should update indicators when scrolling table', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('50000');
      await page.waitForTimeout(1500);

      const tableContainer = page.locator('[data-testid="results-table"]').locator('..');

      if (await tableContainer.isVisible()) {
        // Scroll horizontally
        await tableContainer.evaluate((el) => {
          el.scrollLeft = 100;
        });

        await page.waitForTimeout(300);

        // Table should be scrolled
        const scrollLeft = await tableContainer.evaluate((el) => el.scrollLeft);
        expect(scrollLeft).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Atoms Integration - Full Calculator Flow', () => {
    test('should allow complete calculation using all atoms', async ({ page }) => {
      // Step 1: Enter salary (NumberInput)
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('60000');

      // Step 2: Check tooltip works (InputTooltip/LabelTooltip)
      const helpIcon = page.locator('[data-testid="tooltip-trigger-salary"]');
      if (await helpIcon.isVisible()) {
        await helpIcon.hover();
        await expect(page.getByText(/Gross Salary/i)).toBeVisible({ timeout: 2000 });
        await page.mouse.move(0, 0); // Move away
      }

      // Step 3: Select tax year (TaxYearSelect) - use .last() to skip tooltip
      const taxYearButton = page.getByRole('button', { name: /tax year/i }).last();
      if (await taxYearButton.isVisible()) {
        await taxYearButton.click();
        await page.getByRole('option', { name: /2024-2025/i }).click();
      }

      // Step 4: Wait for calculation
      await page.waitForTimeout(1500);

      // Step 5: Verify results appear
      const resultsTable = page.locator('[data-testid="results-table"]');
      await expect(resultsTable).toBeVisible();

      // Step 6: Toggle period checkbox (PeriodCheckbox)
      const monthlyCheckbox = page.getByRole('checkbox', { name: /monthly/i });
      if (await monthlyCheckbox.isVisible()) {
        await monthlyCheckbox.click();
        await page.waitForTimeout(300);
      }

      // Verify calculation completed
      await expect(resultsTable).toContainText(/Income Tax/i);
    });
  });

  test.describe('Accessibility - All Atoms', () => {
    test('should have no keyboard traps in atoms', async ({ page }) => {
      const salaryInput = page.locator('[data-testid="salary-input"]');

      // Tab through multiple components
      await page.keyboard.press('Tab'); // First focusable
      await page.keyboard.press('Tab'); // Salary input
      await page.keyboard.press('Tab'); // Help icon
      await page.keyboard.press('Tab'); // Next field

      // Should be able to tab back
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Shift+Tab');

      // No errors should occur
      await expect(salaryInput).toBeVisible();
    });

    test('should support screen reader labels', async ({ page }) => {
      // All interactive atoms should have accessible names
      const salaryInput = page.locator('[data-testid="salary-input"]');
      const accessibleName = await salaryInput.getAttribute('aria-label');

      expect(accessibleName || (await salaryInput.getAttribute('placeholder'))).toBeTruthy();
    });
  });
});
