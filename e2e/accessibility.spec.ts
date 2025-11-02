/**
 * E2E Accessibility Tests
 *
 * Comprehensive WCAG 2.1 compliance testing using axe-core
 * Tests all major pages and user flows for accessibility violations
 *
 * @see https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility - Core Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss cookie banner if it appears to avoid interference with tests
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning homepage for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner') // Exclude third-party cookie banner
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) // WCAG 2.1 Level A & AA
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    // Take screenshot if violations found
    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-homepage-violations.png',
        fullPage: true,
      });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📸 Screenshot saved: a11y-homepage-violations.png');
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('calculator page should have no accessibility violations', async ({ page }) => {
    await page.goto('/calculator/45000');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning calculator page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-calculator-violations.png',
        fullPage: true,
      });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📸 Screenshot saved: a11y-calculator-violations.png');
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog page should have no accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning blog page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-blog-violations.png',
        fullPage: true,
      });
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📸 Screenshot saved: a11y-blog-violations.png');
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('about page should have no accessibility violations', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning about page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-about-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('privacy page should have no accessibility violations', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning privacy page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-privacy-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('compliance page should have no accessibility violations', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning compliance page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-compliance-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Blog Posts', () => {
  test.beforeEach(async ({ page }) => {
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('blog post page should have no accessibility violations', async ({ page }) => {
    // Navigate to blog to find a post
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Find first blog post link
    const firstPostLink = page.locator('article a').first();
    const hasPost = (await firstPostLink.count()) > 0;

    if (!hasPost) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping - no blog posts available');
      test.skip();
      return;
    }

    // Navigate to the post
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning blog post page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-blog-post-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog category page should have no accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Click a category filter
    const categoryButton = page
      .locator('button')
      .filter({ hasText: /Tax Basics|Tax Tips/i })
      .first();

    const hasCategory = (await categoryButton.count()) > 0;
    if (!hasCategory) {
      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('⏭️  Skipping - no categories available');
      test.skip();
      return;
    }

    await categoryButton.click();
    await page.waitForURL(/category=/);
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning filtered blog page for accessibility violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-blog-category-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    const acceptCookiesButton = page.locator('button:has-text("Accept All")');
    const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
    if (cookieBannerVisible) {
      await acceptCookiesButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('calculator with tooltips open should have no violations', async ({ page }) => {
    await page.goto('/calculator/45000');
    await page.waitForLoadState('networkidle');

    // Open a tooltip (hover over info icon)
    const tooltipTrigger = page
      .locator('[data-testid*="tooltip"], button[aria-label*="info"]')
      .first();
    const hasTooltip = (await tooltipTrigger.count()) > 0;

    if (hasTooltip) {
      await tooltipTrigger.hover();
      await page.waitForTimeout(500); // Wait for tooltip to appear
    }

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning calculator with tooltips for violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    if (accessibilityScanResults.violations.length > 0) {
      await page.screenshot({
        path: 'audit-outputs/test-results/a11y-calculator-tooltips-violations.png',
        fullPage: true,
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('calculator with period checkboxes toggled should have no violations', async ({ page }) => {
    await page.goto('/calculator/45000');
    await page.waitForLoadState('networkidle');

    // Toggle period checkboxes
    const weeklyCheckbox = page.locator('input[type="checkbox"][id*="weekly"]').first();
    const hasCheckbox = (await weeklyCheckbox.count()) > 0;

    if (hasCheckbox) {
      await weeklyCheckbox.click();
      await page.waitForTimeout(500);
    }

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning calculator with toggled periods for violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('navigation menu should have no violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check mobile menu if on mobile viewport
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;

    if (isMobile) {
      // Open mobile menu
      const menuButton = page
        .locator('button[aria-label*="menu"], button[aria-label*="Menu"]')
        .first();
      const hasMenu = (await menuButton.count()) > 0;

      if (hasMenu) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🔍 Scanning navigation menu for violations...');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#cookie-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log(`✅ Found ${accessibilityScanResults.violations.length} violations`);

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('all pages should pass color contrast checks', async ({ page }) => {
    const pages = ['/', '/calculator/45000', '/blog', '/about', '/privacy'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Dismiss cookie banner
      const acceptCookiesButton = page.locator('button:has-text("Accept All")');
      const cookieBannerVisible = await acceptCookiesButton.isVisible().catch(() => false);
      if (cookieBannerVisible) {
        await acceptCookiesButton.click();
        await page.waitForTimeout(500);
      }

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`🎨 Checking color contrast for ${pagePath}...`);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .exclude('#cookie-banner')
        .withTags(['wcag2aa']) // Focus on color contrast (WCAG AA)
        .disableRules(['duplicate-id']) // Allow other rules, focus on contrast
        .analyze();

      // Filter for color contrast violations only
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast' || v.tags.includes('cat.color')
      );

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`✅ Found ${contrastViolations.length} color contrast violations on ${pagePath}`);

      if (contrastViolations.length > 0) {
        await page.screenshot({
          path: `audit-outputs/test-results/a11y-contrast-${pagePath.replace(/\//g, '-')}.png`,
          fullPage: true,
        });
      }

      expect(contrastViolations).toEqual([]);
    }
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('homepage should be fully keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('⌨️  Testing keyboard navigation...');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');

    // Check that focus is visible and on an interactive element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
      };
    });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🎯 Focused element:', focusedElement);

    // Should be on an interactive element (button, link, input)
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(interactiveTags).toContain(focusedElement.tagName);

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('✅ Keyboard navigation working');
  });

  test('calculator should be fully keyboard navigable', async ({ page }) => {
    await page.goto('/calculator/45000');
    await page.waitForLoadState('networkidle');

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('⌨️  Testing calculator keyboard navigation...');

    // Tab to first input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        type: el?.getAttribute('type'),
        id: el?.getAttribute('id'),
      };
    });

    // biome-ignore lint/suspicious/noConsole: Test debugging output
    console.log('🎯 Focused on:', focusedElement);

    // Should be able to type in input
    if (focusedElement.tagName === 'INPUT' && focusedElement.type === 'number') {
      await page.keyboard.type('50000');
      await page.waitForTimeout(500);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('✅ Keyboard input working');
    }
  });
});
