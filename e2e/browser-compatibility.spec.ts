import { expect, test } from '@playwright/test';

/**
 * Browser Compatibility Test Suite
 * Tests core functionality across different browsers and devices
 */

// CSS properties that may have browser-specific differences
const _CSS_PROPERTIES_TO_TEST = [
  'backdrop-filter',
  'transform',
  'transition',
  'border-radius',
  'box-shadow',
  'display: grid',
  'display: flex',
];

// Browser-specific feature detection
const MODERN_FEATURES = [
  'IntersectionObserver',
  'ResizeObserver',
  'fetch',
  'Promise',
  'URLSearchParams',
  'localStorage',
  'sessionStorage',
];

test.describe('Browser Compatibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should render correctly on all browsers', async ({ page, browserName }) => {
    // Check that the main calculator is visible
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();

    // Check that critical UI elements are rendered
    await expect(page.locator('input[data-testid="salary-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible();

    // Take a screenshot for visual regression testing
    await page.screenshot({
      path: `test-results/browser-compatibility-${browserName}.png`,
      fullPage: true,
    });
  });

  test('should support modern CSS features', async ({ page, browserName }) => {
    // Check that CSS grid is supported
    const gridSupport = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.display = 'grid';
      return testElement.style.display === 'grid';
    });

    expect(gridSupport).toBe(true);

    // Check that flexbox is supported
    const flexSupport = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.display = 'flex';
      return testElement.style.display === 'flex';
    });

    expect(flexSupport).toBe(true);

    // Check backdrop-filter support (may fail on older browsers)
    const backdropFilterSupported = await page.evaluate(() => {
      const testElement = document.createElement('div');
      return 'backdropFilter' in testElement.style || 'webkitBackdropFilter' in testElement.style;
    });

    // Log result but don't fail test for this (progressive enhancement)
    console.log(`${browserName}: backdrop-filter supported: ${backdropFilterSupported}`);
  });

  test('should support required JavaScript features', async ({ page, browserName }) => {
    const featureSupport = await page.evaluate((features) => {
      const results: Record<string, boolean> = {};

      for (const feature of features) {
        try {
          switch (feature) {
            case 'IntersectionObserver':
              results[feature] = 'IntersectionObserver' in window;
              break;
            case 'ResizeObserver':
              results[feature] = 'ResizeObserver' in window;
              break;
            case 'fetch':
              results[feature] = 'fetch' in window;
              break;
            case 'Promise':
              results[feature] = 'Promise' in window;
              break;
            case 'URLSearchParams':
              results[feature] = 'URLSearchParams' in window;
              break;
            case 'localStorage':
              results[feature] = 'localStorage' in window && window.localStorage !== null;
              break;
            case 'sessionStorage':
              results[feature] = 'sessionStorage' in window && window.sessionStorage !== null;
              break;
            default:
              results[feature] = false;
          }
        } catch (_error) {
          results[feature] = false;
        }
      }

      return results;
    }, MODERN_FEATURES);

    // All these features should be supported in modern browsers
    for (const [feature, supported] of Object.entries(featureSupport)) {
      console.log(`${browserName}: ${feature} supported: ${supported}`);

      // Critical features must be supported
      if (['fetch', 'Promise', 'localStorage'].includes(feature)) {
        expect(supported).toBe(true);
      }
    }
  });

  test('should handle form interactions consistently', async ({ page }) => {
    // Fill salary input
    await page.fill('input[data-testid="salary-input"]', '50000');

    // Verify value was set correctly (account for formatting)
    const salaryValue = await page.inputValue('input[data-testid="salary-input"]');
    expect(salaryValue.replace(/[^\d]/g, '')).toBe('50000'); // Remove formatting

    // Test select dropdown (shadcn Select component)
    const payPeriodSelect = page.getByLabel(/pay period/i);
    await payPeriodSelect.click();
    await page.getByRole('option', { name: /monthly/i }).click();
    // Verify by checking if the trigger shows the selected value
    await expect(payPeriodSelect).toContainText(/monthly/i);

    // Test calculate button click
    await page.click('[data-testid="calculate-button"]');

    // Wait for results to appear
    await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle responsive design correctly', async ({ page, viewport }) => {
    if (!viewport) return;

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.waitForTimeout(1000); // Allow time for responsive changes

    // Check that mobile layout is applied
    const isMobileLayout = await page.evaluate(() => {
      return window.innerWidth < 768;
    });

    expect(isMobileLayout).toBe(true);

    // Ensure important elements are still visible and usable
    await expect(page.locator('input[data-testid="salary-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForTimeout(1000);

    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(1000);

    // All elements should still be visible
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();
  });

  test('should load fonts and images correctly', async ({ page, browserName }) => {
    // Wait for fonts to load
    await page.waitForFunction(
      () => {
        return document.fonts.ready.then(() => true);
      },
      { timeout: 10000 }
    );

    // Check that custom fonts are loaded (if any)
    const fontsLoaded = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.body);
      const fontFamily = computedStyle.fontFamily;
      // Should not fall back to generic font only
      return !fontFamily.includes('serif') || fontFamily.includes(',');
    });

    console.log(`${browserName}: Fonts loaded correctly: ${fontsLoaded}`);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.images);
      return images.filter((img) => !img.complete || img.naturalHeight === 0).length;
    });

    expect(brokenImages).toBe(0);
  });

  test('should handle errors gracefully', async ({ page, browserName }) => {
    // Test JavaScript error handling
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    // Test with invalid input - wait for element and use more reliable selector
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 10000 });
    await salaryInput.fill('invalid');
    await page.locator('[data-testid="calculate-button"]').click();

    // Wait a moment for any errors to occur
    await page.waitForTimeout(2000);

    // Log any JS errors but don't fail the test if they're handled gracefully
    if (jsErrors.length > 0) {
      console.log(`${browserName}: JavaScript errors detected:`, jsErrors);
    }

    // The page should still be functional
    await expect(page.locator('[data-testid="calculator-section"]')).toBeVisible();
  });

  test('should support accessibility features', async ({ page, browserName }) => {
    // Check for proper ARIA labels
    const ariaLabels = await page.evaluate(() => {
      const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
      return elementsWithAriaLabel.length;
    });

    expect(ariaLabels).toBeGreaterThan(0);

    // Check for proper form labels
    const inputsWithLabels = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      let labeledInputs = 0;

      for (const input of inputs) {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label');
        const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');

        if (hasLabel || hasAriaLabel || hasAriaLabelledBy) {
          labeledInputs++;
        }
      }

      return { total: inputs.length, labeled: labeledInputs };
    });

    console.log(
      `${browserName}: Input accessibility: ${inputsWithLabels.labeled}/${inputsWithLabels.total} inputs properly labeled`
    );

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('should maintain performance across browsers', async ({ page, browserName }) => {
    const startTime = Date.now();

    // Perform a typical user workflow - wait for elements to be ready
    const salaryInput = page.locator('[data-testid="salary-input"]');
    await expect(salaryInput).toBeVisible({ timeout: 10000 });
    await salaryInput.fill('45000');

    const payPeriodSelect = page.locator('select[data-testid="pay-period-select"]');
    if (await payPeriodSelect.isVisible()) {
      await payPeriodSelect.selectOption('annually');
    }

    await page.locator('[data-testid="calculate-button"]').click();

    // Wait for results
    await expect(page.locator('[data-testid="tax-results"]')).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`${browserName}: Calculation workflow completed in ${duration}ms`);

    // Should complete within reasonable time (10 seconds is very generous)
    expect(duration).toBeLessThan(10000);
  });

  test.describe('Network conditions', () => {
    test('should work on slow connections', async ({ page, browserName }) => {
      // This test specifically runs on the chrome-slow-3g project
      if (browserName !== 'chromium') {
        test.skip();
        return;
      }

      const startTime = Date.now();

      // The page should already be loaded, but let's test interactions
      await page.fill('input[data-testid="salary-input"]', '35000');
      await page.click('[data-testid="calculate-button"]');

      // Wait for results - should work even on slow connection
      await expect(page.locator('[data-testid="tax-results"]')).toBeVisible({ timeout: 15000 });

      const endTime = Date.now();
      console.log(`Slow 3G: Interaction completed in ${endTime - startTime}ms`);
    });
  });
});

test.describe('Cross-browser visual consistency', () => {
  test('should render calculator layout consistently', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any animations or transitions to complete
    await page.waitForTimeout(2000);

    // Fill out the form to show calculated results
    await page.fill('input[data-testid="salary-input"]', '40000');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="tax-results"]')).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({
      path: `test-results/visual-${browserName}.png`,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 800 },
    });

    // Basic layout checks that should be consistent
    const calculatorBounds = await page.locator('[data-testid="calculator-section"]').boundingBox();
    expect(calculatorBounds).not.toBeNull();
    expect(calculatorBounds?.width).toBeGreaterThan(300);
    expect(calculatorBounds?.height).toBeGreaterThan(200);
  });
});
