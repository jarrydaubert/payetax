import { expect, test } from '@playwright/test';

test.describe('SEO and Blog Content E2E Tests', () => {
  test('should load homepage with enhanced structured data', async ({ page }) => {
    await page.goto('/');

    // Check for structured data scripts in head
    const structuredDataScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await structuredDataScripts.count();

    // Should have multiple structured data scripts (organization, website, calculator, etc.)
    expect(scriptCount).toBeGreaterThanOrEqual(4);

    // Verify specific structured data types are present
    const scriptContents = await structuredDataScripts.allTextContents();
    const combinedContent = scriptContents.join(' ');

    expect(combinedContent).toContain('"@type":"Organization"');
    expect(combinedContent).toContain('"@type":"WebSite"');
    expect(combinedContent).toContain('"@type":"FinancialService"');
    expect(combinedContent).toContain('"@type":"HowTo"');
    expect(combinedContent).toContain('"@type":"FAQPage"');
  });

  test('should display enhanced FAQ section', async ({ page }) => {
    await page.goto('/');

    // Check for expanded FAQ content (should have 12+ questions)
    const faqItems = page.locator(
      'text=/How.*tax.*calculated/i, text=/What.*National Insurance/i, text=/marriage allowance/i'
    );
    const faqCount = await faqItems.count();

    // Should have multiple FAQ items including new HMRC-specific ones
    expect(faqCount).toBeGreaterThan(0);

    // Check for specific new FAQ content
    await expect(page.getByText(/marriage allowance/i)).toBeVisible();
    await expect(page.getByText(/scottish tax rates/i)).toBeVisible();
  });

  test('should load new blog post: UK Tax Changes 2025', async ({ page }) => {
    await page.goto('/blog/uk-tax-changes-2025-complete-guide');

    // Check page loads successfully
    await expect(page.getByRole('heading', { name: /uk tax changes 2025/i })).toBeVisible();

    // Check for key content sections
    await expect(page.getByText(/personal allowance/i)).toBeVisible();
    await expect(page.getByText(/pension annual allowance/i)).toBeVisible();
    await expect(page.getByText(/£60,000/)).toBeVisible(); // New pension limit

    // Check for structured data on blog post
    const structuredData = page.locator('script[type="application/ld+json"]');
    const scriptContent = await structuredData.first().textContent();
    expect(scriptContent).toContain('"@type":"Article"');

    // Check for proper metadata
    await expect(page).toHaveTitle(/UK Tax Changes 2025/);

    const metaDescription = page.locator('meta[name="description"]');
    const description = await metaDescription.getAttribute('content');
    expect(description).toContain('2025-2026');
  });

  test('should load new blog post: Scottish vs English Tax Comparison', async ({ page }) => {
    await page.goto('/blog/scottish-vs-english-tax-rates-2025-comparison');

    // Check page loads successfully
    await expect(
      page.getByRole('heading', { name: /scottish vs english tax rates/i })
    ).toBeVisible();

    // Check for comparison content
    await expect(page.getByText(/£26,562/)).toBeVisible(); // Scottish threshold
    await expect(page.getByText(/break.*even/i)).toBeVisible();
    await expect(page.getByText(/council tax/i)).toBeVisible();

    // Check salary examples table
    await expect(page.getByText(/£25,000 salary/i)).toBeVisible();
    await expect(page.getByText(/£75,000 salary/i)).toBeVisible();

    // Verify calculator integration links
    const calculatorLinks = page.getByRole('link', { name: /calculator/i });
    const linkCount = await calculatorLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Check for proper SEO optimization
    await expect(page).toHaveTitle(/Scottish vs English Tax Rates 2025/);
  });

  test('should load new blog post: Student Loan Changes', async ({ page }) => {
    await page.goto('/blog/student-loan-repayment-changes-2025-26');

    // Check page loads successfully
    await expect(page.getByRole('heading', { name: /student loan.*changes/i })).toBeVisible();

    // Check for student loan plan content
    await expect(page.getByText(/plan 2/i)).toBeVisible();
    await expect(page.getByText(/plan 5/i)).toBeVisible();
    await expect(page.getByText(/£27,295/)).toBeVisible(); // Plan 2 threshold
    await expect(page.getByText(/30.year.*forgiveness/i)).toBeVisible();

    // Check for salary examples
    await expect(page.getByText(/£30,000.*salary/i)).toBeVisible();
    await expect(page.getByText(/£50,000.*salary/i)).toBeVisible();

    // Check for calculator integration
    const calculatorLinks = page.getByRole('link', { name: /tax.*calculator/i });
    expect(await calculatorLinks.count()).toBeGreaterThan(0);

    // Verify proper metadata
    await expect(page).toHaveTitle(/Student Loan.*2025/);
  });

  test('should have proper blog navigation and SEO', async ({ page }) => {
    await page.goto('/blog');

    // Check blog page loads
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();

    // Check for new blog posts in listing
    await expect(page.getByText(/UK Tax Changes 2025/i)).toBeVisible();
    await expect(page.getByText(/Scottish vs English/i)).toBeVisible();
    await expect(page.getByText(/Student Loan.*Changes/i)).toBeVisible();

    // Test navigation to new blog post
    await page.getByRole('link', { name: /UK Tax Changes 2025/i }).click();
    await expect(page.getByRole('heading', { name: /uk tax changes 2025/i })).toBeVisible();

    // Check breadcrumb navigation
    const breadcrumbLinks = page.getByRole('navigation').getByRole('link');
    expect(await breadcrumbLinks.count()).toBeGreaterThan(0);
  });

  test('should have calculator integration from blog posts', async ({ page }) => {
    // Start from a blog post
    await page.goto('/blog/scottish-vs-english-tax-rates-2025-comparison');

    // Find and click calculator link
    const calculatorLink = page.getByRole('link', { name: /calculator/i }).first();
    await calculatorLink.click();

    // Should navigate to homepage calculator
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();
    await expect(page.locator('section#calculator')).toBeVisible();

    // Verify calculator is functional
    const salaryInput = page.getByRole('textbox', { name: /gross salary/i });
    await salaryInput.fill('40000');

    const calculateButton = page.getByRole('button', { name: /calculate tax/i });
    await calculateButton.click();

    await expect(page.getByText(/income tax/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have proper SEO meta tags across pages', async ({ page }) => {
    const testPages = [
      { url: '/', titlePattern: /ToolHubX.*UK.*Tax Calculator/i },
      { url: '/blog/uk-tax-changes-2025-complete-guide', titlePattern: /UK Tax Changes 2025/i },
      {
        url: '/blog/scottish-vs-english-tax-rates-2025-comparison',
        titlePattern: /Scottish vs English Tax Rates/i,
      },
      { url: '/blog/student-loan-repayment-changes-2025-26', titlePattern: /Student Loan.*2025/i },
    ];

    for (const testPage of testPages) {
      await page.goto(testPage.url);

      // Check title
      await expect(page).toHaveTitle(testPage.titlePattern);

      // Check meta description exists
      const metaDescription = page.locator('meta[name="description"]');
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(100);

      // Check canonical URL
      const canonicalLink = page.locator('link[rel="canonical"]');
      if ((await canonicalLink.count()) > 0) {
        const canonicalUrl = await canonicalLink.getAttribute('href');
        expect(canonicalUrl).toBeTruthy();
      }

      // Check structured data exists
      const structuredData = page.locator('script[type="application/ld+json"]');
      expect(await structuredData.count()).toBeGreaterThan(0);
    }
  });

  test('should load quickly with new content optimizations', async ({ page }) => {
    const startTime = Date.now();

    // Test homepage load with all new structured data
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /uk tax calculator/i })).toBeVisible();

    const homeLoadTime = Date.now() - startTime;
    expect(homeLoadTime).toBeLessThan(3000);

    // Test blog post load time
    const blogStartTime = Date.now();
    await page.goto('/blog/uk-tax-changes-2025-complete-guide');
    await expect(page.getByRole('heading', { name: /uk tax changes 2025/i })).toBeVisible();

    const blogLoadTime = Date.now() - blogStartTime;
    expect(blogLoadTime).toBeLessThan(3000);
  });

  test('should have working internal links for SEO', async ({ page }) => {
    // Start from tax changes blog post
    await page.goto('/blog/uk-tax-changes-2025-complete-guide');

    // Check for internal links to other content
    const internalLinks = page
      .getByRole('link')
      .filter({ hasText: /calculator|tax.*rates|student.*loan/i });
    const linkCount = await internalLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Test one internal link
    const firstLink = internalLinks.first();
    await firstLink.click();

    // Should navigate successfully
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('toolhubx.uk');
  });

  test('should display social sharing and engagement features', async ({ page }) => {
    await page.goto('/blog/scottish-vs-english-tax-rates-2025-comparison');

    // Check for social sharing elements (if implemented)
    const _socialElements = page.locator('[class*="share"], [aria-label*="share"]');

    // Check for engagement features like read time
    await expect(page.getByText(/\d+\s*min\s*read/i)).toBeVisible();

    // Check for author information
    await expect(page.getByText(/ToolHubX.*Expert/i)).toBeVisible();

    // Check for publication date
    await expect(page.getByText(/2025-08-25|August.*2025/)).toBeVisible();
  });
});
