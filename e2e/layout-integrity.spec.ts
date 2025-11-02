/**
 * E2E Tests: Layout Integrity and Responsive Design
 *
 * Tests calculator layout across different viewport sizes to ensure
 * proper responsive design and usability on all devices.
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { expect, test } from '@playwright/test';

test.describe('Layout Integrity Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss cookie banner if it appears
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🍪 Cookie banner dismissed');
    }
  });

  test.describe('Mobile Layout (375x667 - iPhone SE)', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📱 Set viewport to mobile (375x667)');
    });

    test('should display calculator components on mobile', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking mobile calculator layout...');

      // Check calculator components are accessible on mobile
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator('[data-testid="salary-input"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ All calculator components visible on mobile');

      // Take screenshot
      await page.screenshot({
        path: 'audit-outputs/test-results/layout-mobile.png',
        fullPage: true,
      });
    });

    test('should allow calculation workflow on mobile', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing mobile calculation workflow...');

      // Verify basic calculation workflow works on mobile
      const salaryInput = page.locator('[data-testid="salary-input"]');
      await salaryInput.fill('30000');

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📝 Entered salary: £30,000');

      await page.waitForTimeout(300); // Allow for auto-calculation debounce

      await page.locator('[data-testid="calculate-button"]').click();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🎯 Clicked calculate button');

      await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Mobile calculation workflow successful');
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing mobile touch interactions...');

      const salaryInput = page.locator('[data-testid="salary-input"]');

      // Tap input (simulating touch)
      await salaryInput.tap();
      await salaryInput.fill('25000');

      const inputValue = await salaryInput.inputValue();
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📝 Input value after touch: ${inputValue}`);

      expect(inputValue).toMatch(/25[,]?000/);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Touch interactions working on mobile');
    });
  });

  test.describe('Tablet Layout (768x1024 - iPad)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📱 Set viewport to tablet (768x1024)');
    });

    test('should display calculator components on tablet', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking tablet calculator layout...');

      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator('[data-testid="salary-input"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ All calculator components visible on tablet');

      // Take screenshot
      await page.screenshot({
        path: 'audit-outputs/test-results/layout-tablet.png',
        fullPage: true,
      });
    });

    test('should allow calculation workflow on tablet', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing tablet calculation workflow...');

      await page.locator('[data-testid="salary-input"]').fill('40000');
      await page.waitForTimeout(300);
      await page.locator('[data-testid="calculate-button"]').click();
      await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Tablet calculation workflow successful');
    });
  });

  test.describe('Desktop Layout (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🖥️  Set viewport to desktop (1920x1080)');
    });

    test('should display calculator components on desktop', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking desktop calculator layout...');

      // Check calculator layout on desktop
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator('[data-testid="salary-input"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ All calculator components visible on desktop');

      // Take screenshot
      await page.screenshot({
        path: 'audit-outputs/test-results/layout-desktop.png',
        fullPage: true,
      });
    });

    test('should allow calculation workflow on desktop', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing desktop calculation workflow...');

      // Verify calculation workflow
      await page.locator('[data-testid="salary-input"]').fill('50000');

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📝 Entered salary: £50,000');

      await page.locator('[data-testid="calculate-button"]').click();

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🎯 Clicked calculate button');

      await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Desktop calculation workflow successful');
    });

    test('should have proper grid layout on desktop', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Checking desktop grid layout...');

      const calculatorSection = page.locator('[data-testid="calculator-section"]');
      await expect(calculatorSection).toBeVisible({ timeout: 10000 });

      // Check grid layout properties
      const hasGridLayout = await calculatorSection.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.display === 'grid' || styles.display.includes('grid');
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📊 Grid layout detected: ${hasGridLayout}`);

      // Desktop should have proper spacing and layout
      expect(hasGridLayout).toBe(true);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Desktop grid layout verified');
    });
  });

  test.describe('Layout Integration Tests', () => {
    test('should maintain layout integrity when switching viewports', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing layout integrity across viewport changes...');

      // Start on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Layout intact on mobile (375x667)');

      // Switch to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Layout intact on tablet (768x1024)');

      // Switch to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible({
        timeout: 10000,
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Layout intact on desktop (1920x1080)');

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Layout integrity maintained across all viewports');
    });

    test('should complete full calculation on all viewports', async ({ page }) => {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🔍 Testing full calculation workflow across viewports...');

      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        // biome-ignore lint/suspicious/noConsole: Test debugging output
        console.log(`🎯 Testing on ${viewport.name} (${viewport.width}x${viewport.height})...`);

        // Enter salary and calculate
        const salaryInput = page.locator('[data-testid="salary-input"]');
        await salaryInput.clear();
        await salaryInput.fill('35000');
        await page.waitForTimeout(300);

        await page.locator('[data-testid="calculate-button"]').click();

        // Verify results appear
        await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });

        // biome-ignore lint/suspicious/noConsole: Test debugging output
        console.log(`✅ Calculation successful on ${viewport.name}`);
      }

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Full workflow verified on all viewports');
    });
  });
});
