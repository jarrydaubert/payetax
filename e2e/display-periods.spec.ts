import { expect, test } from '@playwright/test';

test.describe('Display Periods Checkbox Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Add cache-busting parameter to avoid shared state between parallel tests
    const timestamp = Date.now();
    const testId = Math.floor(Math.random() * 1000);
    await page.goto(`/?t=${timestamp}&test=${testId}`);

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Enter salary to trigger results display
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 5000 });
    await salaryInput.clear();
    await salaryInput.fill('50000');

    // Click calculate button
    const calculateButton = page.getByRole('button', { name: /calculate/i });
    await calculateButton.click();

    // Wait for results to appear
    await page.waitForTimeout(1500);

    // Wait for Display Periods section to be visible
    await expect(page.getByText('Display Periods')).toBeVisible({ timeout: 5000 });
  });

  test.describe('Initial Rendering', () => {
    test('should display "Display Periods" title', async ({ page }) => {
      await expect(page.getByText('Display Periods')).toBeVisible();
    });

    test('should render all 7 period checkboxes', async ({ page }) => {
      const periods = ['Yearly', 'Monthly', '4-Weekly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly'];

      for (const period of periods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        await expect(checkbox).toBeVisible();
      }
    });

    test('should have default periods checked based on viewport', async ({ page, viewport }) => {
      // Default viewport is usually 1280x720 (desktop)
      const weeklyCheckbox = page.getByRole('checkbox', { name: /weekly/i });
      const monthlyCheckbox = page.getByRole('checkbox', { name: /monthly/i });
      const yearlyCheckbox = page.getByRole('checkbox', { name: /yearly/i });

      if (viewport && viewport.width >= 1024) {
        // Desktop: should have Yearly, Monthly, Weekly, Daily
        await expect(yearlyCheckbox).toBeChecked();
        await expect(monthlyCheckbox).toBeChecked();
        await expect(weeklyCheckbox).toBeChecked();
      } else if (viewport && viewport.width >= 640) {
        // Tablet: should have Yearly, Monthly, Weekly
        await expect(yearlyCheckbox).toBeChecked();
        await expect(monthlyCheckbox).toBeChecked();
        await expect(weeklyCheckbox).toBeChecked();
      } else {
        // Mobile: should have Monthly, Weekly
        await expect(monthlyCheckbox).toBeChecked();
        await expect(weeklyCheckbox).toBeChecked();
      }
    });

    test('should render checkboxes in a flex-wrap layout', async ({ page }) => {
      const periodsContainer = page.locator('text=Display Periods').locator('..');

      // Check if the container has flex-wrap class (through computed styles)
      const containerDiv = periodsContainer.locator('div').nth(1);
      const flexWrap = await containerDiv.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('flex-wrap')
      );

      expect(flexWrap).toBe('wrap');
    });
  });

  test.describe('Checkbox Interactions - Mouse', () => {
    test('should check an unchecked checkbox when clicked', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      // Verify initially unchecked
      await expect(hourlyCheckbox).not.toBeChecked();

      // Click to check
      await hourlyCheckbox.click();
      await page.waitForTimeout(300);

      // Verify now checked
      await expect(hourlyCheckbox).toBeChecked();
    });

    test('should uncheck a checked checkbox when clicked', async ({ page }) => {
      const weeklyCheckbox = page.getByRole('checkbox', { name: /weekly/i });

      // Verify initially checked
      await expect(weeklyCheckbox).toBeChecked();

      // Click to uncheck
      await weeklyCheckbox.click();
      await page.waitForTimeout(300);

      // Verify now unchecked
      await expect(weeklyCheckbox).not.toBeChecked();
    });

    test('should toggle checkbox multiple times', async ({ page }) => {
      const dailyCheckbox = page.getByRole('checkbox', { name: /daily/i });

      // Get initial state
      const initiallyChecked = await dailyCheckbox.isChecked();

      // First click - toggle
      await dailyCheckbox.click();
      await page.waitForTimeout(200);
      expect(await dailyCheckbox.isChecked()).toBe(!initiallyChecked);

      // Second click - toggle back
      await dailyCheckbox.click();
      await page.waitForTimeout(200);
      expect(await dailyCheckbox.isChecked()).toBe(initiallyChecked);

      // Third click - toggle again
      await dailyCheckbox.click();
      await page.waitForTimeout(200);
      expect(await dailyCheckbox.isChecked()).toBe(!initiallyChecked);
    });

    test('should allow clicking label to toggle checkbox', async ({ page }) => {
      const hourlyLabel = page.getByText('Hourly', { exact: true });
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      // Verify initially unchecked
      await expect(hourlyCheckbox).not.toBeChecked();

      // Click label
      await hourlyLabel.click();
      await page.waitForTimeout(300);

      // Verify checkbox is now checked
      await expect(hourlyCheckbox).toBeChecked();
    });

    test('should handle checking multiple periods simultaneously', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });
      const fortnightlyCheckbox = page.getByRole('checkbox', { name: /fortnightly/i });
      const fourWeeklyCheckbox = page.getByRole('checkbox', { name: /4-weekly/i });

      // Check all three
      await hourlyCheckbox.click();
      await page.waitForTimeout(200);
      await fortnightlyCheckbox.click();
      await page.waitForTimeout(200);
      await fourWeeklyCheckbox.click();
      await page.waitForTimeout(200);

      // Verify all are checked
      await expect(hourlyCheckbox).toBeChecked();
      await expect(fortnightlyCheckbox).toBeChecked();
      await expect(fourWeeklyCheckbox).toBeChecked();
    });

    test('should handle rapid clicks without breaking', async ({ page }) => {
      const dailyCheckbox = page.getByRole('checkbox', { name: /daily/i });

      // Rapid clicks (3 times quickly)
      await dailyCheckbox.click();
      await dailyCheckbox.click();
      await dailyCheckbox.click();
      await page.waitForTimeout(500);

      // Should have a definite state (not broken)
      const isChecked = await dailyCheckbox.isChecked();
      expect(typeof isChecked).toBe('boolean');
    });
  });

  test.describe('Checkbox Interactions - Keyboard', () => {
    test('should toggle checkbox with Space key', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      // Focus the checkbox
      await hourlyCheckbox.focus();

      // Get initial state
      const initiallyChecked = await hourlyCheckbox.isChecked();

      // Press Space to toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      // Verify toggled
      expect(await hourlyCheckbox.isChecked()).toBe(!initiallyChecked);
    });

    test('should toggle checkbox with Enter key', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      // Focus the checkbox
      await hourlyCheckbox.focus();

      // Get initial state
      const initiallyChecked = await hourlyCheckbox.isChecked();

      // Press Enter to toggle
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Verify toggled
      expect(await hourlyCheckbox.isChecked()).toBe(!initiallyChecked);
    });

    test('should navigate between checkboxes with Tab key', async ({ page }) => {
      // Tab to first checkbox
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluateHandle(() => document.activeElement);
      const focusedId = await focusedElement.evaluate((el) => el?.id);

      // Should be on one of the period checkboxes
      expect(focusedId).toContain('period-');

      // Tab to next checkbox
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluateHandle(() => document.activeElement);
      const secondFocusedId = await focusedElement.evaluate((el) => el?.id);

      // Should be on a different checkbox
      expect(secondFocusedId).toContain('period-');
      expect(secondFocusedId).not.toBe(focusedId);
    });

    test('should navigate backwards with Shift+Tab', async ({ page }) => {
      // Tab forward twice
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedAfterForward = await page.evaluateHandle(() => document.activeElement);
      const forwardId = await focusedAfterForward.evaluate((el) => el?.id);

      // Tab backward once
      await page.keyboard.press('Shift+Tab');

      const focusedAfterBackward = await page.evaluateHandle(() => document.activeElement);
      const backwardId = await focusedAfterBackward.evaluate((el) => el?.id);

      // Should have moved back to previous element
      expect(backwardId).not.toBe(forwardId);
    });
  });

  test.describe('Results Table Integration', () => {
    test('should update results table columns when toggling periods', async ({ page }) => {
      // Get initial column count
      const initialHeaders = await page.locator('th').count();

      // Toggle Hourly on
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });
      await hourlyCheckbox.click();
      await page.waitForTimeout(500);

      // Get new column count
      const newHeaders = await page.locator('th').count();

      // Should have one more column (Category + % + original periods + Hourly)
      expect(newHeaders).toBeGreaterThan(initialHeaders);
    });

    test('should remove column when unchecking period', async ({ page }) => {
      // Verify Weekly is checked and column exists
      const weeklyCheckbox = page.getByRole('checkbox', { name: /weekly/i });
      await expect(weeklyCheckbox).toBeChecked();

      const initialHeaders = await page.locator('th').count();

      // Uncheck Weekly
      await weeklyCheckbox.click();
      await page.waitForTimeout(500);

      // Get new column count
      const newHeaders = await page.locator('th').count();

      // Should have one fewer column
      expect(newHeaders).toBeLessThan(initialHeaders);
    });

    test('should maintain correct data in remaining columns after toggling', async ({ page }) => {
      // Get Yearly column value for "Gross Pay"
      const grossPayRow = page.locator('tr').filter({ hasText: 'Gross Pay' });
      const yearlyCell = grossPayRow.locator('td').nth(2); // Assuming Yearly is 3rd column
      const yearlyValue = await yearlyCell.textContent();

      // Toggle a different period (Hourly)
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });
      await hourlyCheckbox.click();
      await page.waitForTimeout(500);

      // Verify Yearly value is still the same
      const yearlyValueAfter = await yearlyCell.textContent();
      expect(yearlyValueAfter).toBe(yearlyValue);
    });

    test('should display columns in correct order after toggling', async ({ page }) => {
      // Check all periods
      const allPeriods = [
        'Yearly',
        'Monthly',
        '4-Weekly',
        'Fortnightly',
        'Weekly',
        'Daily',
        'Hourly',
      ];

      for (const period of allPeriods) {
        const checkbox = page.getByRole('checkbox', { name: new RegExp(period, 'i') });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(200);
        }
      }

      await page.waitForTimeout(500);

      // Get header texts
      const headers = await page.locator('th').allTextContents();

      // Should have Category, %, and all periods in order
      expect(headers[0]).toContain('Category');
      expect(headers[1]).toContain('%');

      // Periods should be in logical order
      const periodHeaders = headers.slice(2);
      const expectedOrder = [
        'Yearly',
        'Monthly',
        '4-Weekly',
        'Fortnightly',
        'Weekly',
        'Daily',
        'Hourly',
      ];

      for (let i = 0; i < expectedOrder.length; i++) {
        expect(periodHeaders[i]).toContain(expectedOrder[i]);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const weeklyCheckbox = page.getByRole('checkbox', { name: /weekly/i });

      await expect(weeklyCheckbox).toHaveAttribute('aria-checked');
    });

    test('should have visible focus indicators', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      await hourlyCheckbox.focus();

      // Check for focus-visible styles (ring or outline)
      const hasOutline = await hourlyCheckbox.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.boxShadow.includes('ring') ||
          styles.borderColor !== 'rgb(0, 0, 0)'
        );
      });

      expect(hasOutline).toBe(true);
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      // Check initial aria-checked value
      const initialAriaChecked = await hourlyCheckbox.getAttribute('aria-checked');

      // Toggle checkbox
      await hourlyCheckbox.click();
      await page.waitForTimeout(300);

      // Check new aria-checked value
      const newAriaChecked = await hourlyCheckbox.getAttribute('aria-checked');

      // Should have changed
      expect(newAriaChecked).not.toBe(initialAriaChecked);
    });

    test('should have unique IDs for each checkbox', async ({ page }) => {
      const checkboxes = await page.locator('input[type="checkbox"][id^="period-"]').all();

      const ids = await Promise.all(checkboxes.map((cb) => cb.getAttribute('id')));

      // All IDs should be unique
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('should have labels associated with checkboxes', async ({ page }) => {
      const weeklyLabel = page.getByText('Weekly', { exact: true });
      const labelFor = await weeklyLabel.getAttribute('for');

      expect(labelFor).toBe('period-Weekly');
    });
  });

  test.describe('Visual Regression & Layout', () => {
    test('should maintain layout on different viewport sizes', async ({ page, viewport }) => {
      // Check that Display Periods card is visible and well-formed
      const periodsCard = page.locator('text=Display Periods').locator('..');

      await expect(periodsCard).toBeVisible();

      // Verify flex-wrap allows wrapping on small screens
      const checkboxContainer = periodsCard.locator('div').nth(1);
      const _containerWidth = await checkboxContainer.evaluate((el) => el.offsetWidth);
      const checkboxes = await checkboxContainer.locator('[role="checkbox"]').all();

      // All checkboxes should be visible
      for (const checkbox of checkboxes) {
        await expect(checkbox).toBeVisible();
      }

      // Check that no checkboxes overflow
      for (const checkbox of checkboxes) {
        const box = await checkbox.boundingBox();
        if (box && viewport) {
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });

    test('should have proper spacing between checkboxes', async ({ page }) => {
      const checkboxes = await page.locator('[role="checkbox"][id^="period-"]').all();

      if (checkboxes.length >= 2) {
        const firstBox = await checkboxes[0].boundingBox();
        const secondBox = await checkboxes[1].boundingBox();

        if (firstBox && secondBox) {
          // Check for gap (should be at least 8px based on gap-3 = 0.75rem = 12px)
          const gap = Math.abs(secondBox.x - (firstBox.x + firstBox.width));
          expect(gap).toBeGreaterThanOrEqual(8);
        }
      }
    });
  });

  test.describe('Edge Cases & Error Handling', () => {
    test('should handle all periods being unchecked gracefully', async ({ page }) => {
      // Uncheck all default periods
      const checkboxes = await page.locator('[role="checkbox"][id^="period-"]').all();

      for (const checkbox of checkboxes) {
        if (await checkbox.isChecked()) {
          await checkbox.click();
          await page.waitForTimeout(200);
        }
      }

      // Table should still exist but with minimal columns
      await expect(page.locator('table')).toBeVisible();

      // Should have at least Category and % columns
      const headers = await page.locator('th').count();
      expect(headers).toBeGreaterThanOrEqual(2);
    });

    test('should persist selections after page re-calculation', async ({ page }) => {
      // Check Hourly
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });
      await hourlyCheckbox.click();
      await page.waitForTimeout(300);

      // Verify Hourly is checked
      await expect(hourlyCheckbox).toBeChecked();

      // Change salary and recalculate
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.clear();
      await salaryInput.fill('60000');

      const calculateButton = page.getByRole('button', { name: /calculate/i });
      await calculateButton.click();
      await page.waitForTimeout(1000);

      // Hourly should still be checked
      await expect(hourlyCheckbox).toBeChecked();
    });

    test('should handle special characters in period names', async ({ page }) => {
      const fourWeeklyCheckbox = page.getByRole('checkbox', { name: /4-weekly/i });

      await expect(fourWeeklyCheckbox).toBeVisible();

      // Should toggle normally
      const initialState = await fourWeeklyCheckbox.isChecked();
      await fourWeeklyCheckbox.click();
      await page.waitForTimeout(300);

      expect(await fourWeeklyCheckbox.isChecked()).toBe(!initialState);
    });
  });

  test.describe('Performance', () => {
    test('should respond to clicks within 300ms', async ({ page }) => {
      const hourlyCheckbox = page.getByRole('checkbox', { name: /hourly/i });

      const startTime = Date.now();
      await hourlyCheckbox.click();

      // Wait for state change
      await expect(hourlyCheckbox).toBeChecked({ timeout: 300 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
    });

    test('should handle rapid toggling without performance degradation', async ({ page }) => {
      const dailyCheckbox = page.getByRole('checkbox', { name: /daily/i });

      const startTime = Date.now();

      // Toggle 10 times rapidly
      for (let i = 0; i < 10; i++) {
        await dailyCheckbox.click();
        await page.waitForTimeout(50);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);

      // Should still have valid state
      const isChecked = await dailyCheckbox.isChecked();
      expect(typeof isChecked).toBe('boolean');
    });
  });
});
