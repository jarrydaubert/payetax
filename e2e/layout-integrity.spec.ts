// e2e/layout-integrity.spec.ts
// Essential responsive and layout tests only

import { expect, test } from '@playwright/test';

test.describe('Essential Layout Tests', () => {
  test('Calculator should be usable on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Ensure completely fresh page load with network idle
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Allow any dynamic loading to complete

    // Check calculator components are accessible on mobile
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="salary-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible({ timeout: 5000 });

    // Verify basic calculation workflow works on mobile
    await page.locator('[data-testid="salary-input"]').fill('30000');
    await page.waitForTimeout(300); // Allow for auto-calculation debounce
    await page.locator('[data-testid="calculate-button"]').click();
    await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('Calculator should be usable on desktop', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Check calculator layout on desktop
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="salary-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible();

    // Verify calculation workflow
    await page.locator('[data-testid="salary-input"]').fill('50000');
    await page.locator('[data-testid="calculate-button"]').click();
    await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });
  });
});
