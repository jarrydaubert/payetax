/**
 * Smoke Tests - Essential Page Load & Navigation
 *
 * What bugs do these tests find?
 * - Build/deployment broke a page (404, 500)
 * - Routing misconfiguration
 * - Critical components not rendering
 * - CSP or security policy blocking content
 */

import { expect, type Page, test } from '@playwright/test';

async function clickCalculatorCta(page: Page): Promise<void> {
  const namedCta = page
    .getByRole('link', { name: /open calculator|see my take home pay/i })
    .first();
  if (await namedCta.isVisible().catch(() => false)) {
    const href = await namedCta.getAttribute('href');
    expect(href).toMatch(/#tax-calculator|\/calculator/);
    await namedCta.click();
    return;
  }

  const fallbackCta = page.locator('a[href="/calculator"], a[href="#tax-calculator"]').first();
  await expect(fallbackCta).toBeVisible();
  const href = await fallbackCta.getAttribute('href');
  expect(href).toMatch(/#tax-calculator|\/calculator/);
  await fallbackCta.click();
}

async function openMainMenuIfCollapsed(page: Page): Promise<void> {
  const desktopBlogLink = page
    .locator('nav[aria-label="Main navigation"] a[href="/blog"]:visible')
    .first();
  if (await desktopBlogLink.isVisible().catch(() => false)) {
    return;
  }

  const menuToggle = page.getByRole('button', { name: /open menu|close menu/i }).first();
  if (await menuToggle.isVisible().catch(() => false)) {
    await menuToggle.click();
  }
}

test.describe('Smoke Tests', () => {
  test('Homepage loads and "Open Calculator" works @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PayeTax|Tax Calculator|PAYE/i);
    await expect(page.locator('h1')).toBeVisible();

    // Home CTA copy differs between variants; assert action, not exact label text.
    await clickCalculatorCta(page);
  });

  test('Blog page loads with posts @smoke', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/TaxInsights|Blog/i);
    await expect(
      page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]').first(),
    ).toBeVisible();
  });

  test('Tools landing page loads @smoke', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('h1')).toContainText(/tools/i);
    await expect(page.getByTestId('tools-link-director-guide')).toBeVisible();
    await expect(page.getByTestId('tools-link-tax-code-decoder')).toBeVisible();
  });

  test('Tax Code Decoder keeps the submitted result until another decode @smoke', async ({
    page,
  }) => {
    await page.goto('/tools/tax-code-decoder');
    const input = page.getByRole('textbox', { name: 'Tax code' });
    const submit = page.getByRole('button', { name: 'Decode', exact: true });
    const example = page.getByRole('button', { name: '1257L', exact: true });
    const resultCode = (code: string) => page.getByRole('heading', { name: code, exact: true });
    const allowance = page.getByText('£12,570', { exact: true });
    const basicRate = page.getByText('Basic rate on all income from this source', { exact: true });
    const invalidCode = page.getByText('Unrecognized or unsupported tax code', { exact: true });

    await example.click();
    await expect(input).toHaveValue('1257L');
    await expect(resultCode('1257L')).toBeVisible();
    await expect(allowance).toBeVisible();

    await input.fill('BR');
    await expect(input).toHaveValue('BR');
    await expect(resultCode('1257L')).toBeVisible();
    await expect(allowance).toBeVisible();
    await expect(basicRate).toHaveCount(0);
    await input.press('Enter');
    await expect(resultCode('BR')).toBeVisible();
    await expect(basicRate).toBeVisible();
    await expect(allowance).toHaveCount(0);

    await input.fill('1257');
    await expect(resultCode('BR')).toBeVisible();
    await expect(invalidCode).toHaveCount(0);
    await input.clear();
    await expect(submit).toBeDisabled();
    await input.press('Enter');
    await expect(resultCode('BR')).toBeVisible();
    await expect(basicRate).toBeVisible();

    await input.fill('1257');
    await submit.click();
    await expect(resultCode('1257')).toBeVisible();
    await expect(invalidCode).toBeVisible();
    await expect(basicRate).toHaveCount(0);

    await input.fill('BR');
    await expect(resultCode('1257')).toBeVisible();
    await expect(invalidCode).toBeVisible();
    await example.click();
    await expect(input).toHaveValue('1257L');
    await expect(resultCode('1257L')).toBeVisible();
    await expect(allowance).toBeVisible();
    await expect(invalidCode).toHaveCount(0);
  });

  test('Scottish calculator CTA opens the main calculator with Scotland selected @smoke', async ({
    page,
  }) => {
    await page.goto('/tools/scottish-tax-calculator');
    await page.evaluate(() => window.localStorage.removeItem('tax-calculator-storage'));
    await page.reload();

    const ctaLink = page.getByRole('link', { name: 'Open Full Scottish Calculator' });

    await expect(ctaLink).toHaveAttribute('href', '/#tax-calculator');
    await ctaLink.click();

    await expect(page).toHaveURL(/\/#tax-calculator$/);
    await expect(page.getByTestId('region-select')).toContainText('Scotland');
  });

  test('About page loads @smoke', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Privacy page loads @smoke', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Compliance page loads @smoke', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Navigation links work @smoke', async ({ page }) => {
    await page.goto('/');
    await openMainMenuIfCollapsed(page);

    // Navigate to Blog
    const blogNavLink = page.locator('a[href="/blog"]:visible').first();
    await expect(blogNavLink).toBeVisible();
    await blogNavLink.click();
    await expect(page).toHaveURL(/\/blog(?:$|[?#])/);

    // Navigate back home via logo
    await page
      .getByRole('link', { name: /payetax/i })
      .first()
      .click();
    await expect(page.locator('h1')).toBeVisible();

    // Ensure primary CTA still navigates to the calculator.
    await clickCalculatorCta(page);
  });

  test('No CSP errors in console @smoke', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.goto('/blog');

    expect(errors).toHaveLength(0);
  });
});
