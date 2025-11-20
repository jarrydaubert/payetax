/**
 * Critical Navigation E2E Tests
 * Tests all navbar and footer links work correctly
 * NO MOCKS - Real navigation testing
 *
 * PAYTAX-76 Follow-up: CSP and Navigation Issues
 */

import { expect, test } from '@playwright/test';

test.describe('Navbar Navigation - Critical Links', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should have working logo link to home', async ({ page }) => {
    // Click logo
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
    await logo.click();

    // Verify we're on home page
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('h1')).toContainText(/UK PAYE|Take-Home Pay/i);
  });

  test('should navigate to Calculator from navbar', async ({ page }) => {
    // Find and click Calculator link
    const calculatorLink = page.locator('nav a[href="/"]').filter({ hasText: /calculator/i });

    if ((await calculatorLink.count()) > 0) {
      await calculatorLink.first().click();
      await page.waitForLoadState('networkidle');

      // Verify calculator page loaded
      await expect(page).toHaveURL(/\/(calculator)?/);
      await expect(page.getByTestId('salary-input')).toBeVisible();
    }
  });

  test('CRITICAL: should navigate to Blog/TaxInsights from navbar', async ({ page }) => {
    // Look for Blog or TaxInsights link in navbar
    const blogLink = page.locator('nav a').filter({ hasText: /blog|tax insights|taxinsights/i });
    const count = await blogLink.count();

    if (count === 0) {
      // Try alternative selectors
      const _allNavLinks = await page.locator('nav a').allTextContents();
    }

    await expect(blogLink.first()).toBeVisible({ timeout: 5000 });
    await blogLink.first().click();
    await page.waitForLoadState('networkidle');

    // Verify blog page loaded
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator('h1')).toContainText(/TaxInsights|blog/i);
  });

  test('should navigate to About from navbar', async ({ page }) => {
    const aboutLink = page.locator('nav a[href="/about"]');

    if ((await aboutLink.count()) > 0) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL('http://localhost:3000/about');
      // About page has heading "Tax Calculations Built for Privacy"
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should not have CSP eval errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Navigate to blog to test TaxInsights
    const blogLink = page
      .locator('nav a')
      .filter({ hasText: /blog|tax insights/i })
      .first();
    if ((await blogLink.count()) > 0) {
      await blogLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Check for CSP violations
    const cspErrors = consoleErrors.filter(
      (error) =>
        error.includes('Content Security Policy') ||
        error.includes('unsafe-eval') ||
        error.includes("'eval'")
    );

    if (cspErrors.length > 0) {
    }

    expect(cspErrors.length).toBe(0);
  });
});

test.describe('Footer Navigation - Critical Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present to prevent click blocking
    const acceptButton = page
      .locator('button')
      .filter({ hasText: /accept|ok/i })
      .first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should have working Blog link in footer', async ({ page }) => {
    const footerBlogLink = page.locator('footer a[href="/blog"]');
    await expect(footerBlogLink).toBeVisible();

    await footerBlogLink.click({ force: true });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('http://localhost:3000/blog');
  });

  test('should have working About link in footer', async ({ page }) => {
    const footerAboutLink = page.locator('footer a[href="/about"]');
    await expect(footerAboutLink).toBeVisible();

    await footerAboutLink.click({ force: true });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('http://localhost:3000/about');
  });

  test('should have working Privacy link in footer', async ({ page }) => {
    const privacyLink = page.locator('footer a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();

    await privacyLink.click({ force: true });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('http://localhost:3000/privacy');
  });

  test('should have working Compliance link in footer', async ({ page }) => {
    const complianceLink = page.locator('footer a[href="/compliance"]');

    if ((await complianceLink.count()) > 0) {
      await complianceLink.click({ force: true });
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL('http://localhost:3000/compliance');
    }
  });

  test('all footer links should be clickable', async ({ page }) => {
    const footerLinks = page.locator('footer a[href^="/"]');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify all are visible and have href
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = footerLinks.nth(i);
      await expect(link).toBeVisible();

      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should open mobile menu and navigate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner first
    const acceptButton = page
      .locator('button')
      .filter({ hasText: /accept|ok/i })
      .first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(300);
    }

    // Look for mobile menu button
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i]'
    );

    if ((await menuButton.count()) > 0) {
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for menu animation

      // Try to click blog link in mobile menu
      const mobileBlogLink = page
        .locator('a')
        .filter({ hasText: /blog|tax insights/i })
        .first();

      if (await mobileBlogLink.isVisible()) {
        await mobileBlogLink.click({ force: true });
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/\/blog/);
      }
    }
  });
});

test.describe('Direct URL Navigation', () => {
  test('should load blog page directly', async ({ page }) => {
    await page.goto('http://localhost:3000/blog');
    await page.waitForLoadState('networkidle');

    // Should load without errors
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/blog');
  });

  test('should load about page directly', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/about');
  });

  test('should load calculator page directly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Calculator should load and have a heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Should be on home/calculator page
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
