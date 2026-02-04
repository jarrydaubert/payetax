// src/app/llms.txt/route.ts
// LLMs.txt - AI Search Engine Optimization (AEO)
// Helps ChatGPT, Claude, Perplexity, and other AI tools understand the site
// Dynamic: Automatically includes all blog posts grouped by category

import { getBlogCategories, getBlogPosts } from '@/lib/blog';

// Force static generation with hourly revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

/** Sanitize text for Markdown - escape brackets, remove newlines */
function sanitize(text: string): string {
  return text.replace(/\n/g, ' ').replace(/\[/g, '\\[').replace(/\]/g, '\\]').trim();
}

export async function GET() {
  const [posts, categories] = await Promise.all([
    getBlogPosts({ pageSize: 1000 }),
    getBlogCategories(),
  ]);

  // Group posts by category slug (same key used for lookup)
  const postsByCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const categoryPosts = postsByCategory.get(post.category) || [];
    categoryPosts.push(post);
    postsByCategory.set(post.category, categoryPosts);
  }

  // Build blog sections dynamically
  const blogSections = categories
    .map((category) => {
      const categoryPosts = postsByCategory.get(category.slug) || [];
      if (categoryPosts.length === 0) return '';

      const postLinks = categoryPosts
        .map((post) => {
          const title = sanitize(post.title);
          const excerpt = sanitize(post.excerpt).slice(0, 150);
          return `- [${title}](https://payetax.co.uk/blog/${post.slug}): ${excerpt}${post.excerpt.length > 150 ? '...' : ''}`;
        })
        .join('\n');

      return `## Blog Posts - ${category.name}\n\n${postLinks}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const lastUpdated = new Date().toISOString().split('T')[0];

  const llmsTxt = `# PayeTax

> Free UK PAYE tax calculator with official HMRC rates for 2025-2026. Calculate income tax, National Insurance, student loans, and take-home pay instantly. Privacy-first with interactive calculations in your browser.

Last updated: ${lastUpdated}

PayeTax is a comprehensive UK tax calculator providing accurate PAYE calculations using official HMRC rates. The calculator supports England, Wales, Northern Ireland, and Scottish tax systems, with features including student loan repayments (all plans), pension contributions, marriage allowance, and blind person's allowance.

Interactive calculations run in your browser and tax inputs aren't stored; some pages precompute results server-side for SEO or email delivery. The tool is free, requires no registration, and tax rates are updated when HMRC publishes changes.

## Main Pages

- [Calculator](https://payetax.co.uk): Main PAYE tax calculator with real-time calculations for income tax, NI, student loans, pensions, and take-home pay
- [Blog - TaxInsights](https://payetax.co.uk/blog): UK tax guides and HMRC updates with ${posts.length} articles across ${categories.length} categories
- [About](https://payetax.co.uk/about): Mission, values, and technology behind PayeTax
- [Compliance](https://payetax.co.uk/compliance): HMRC compliance, current tax rates, and data sources
- [Privacy Policy](https://payetax.co.uk/privacy): Privacy policy - in-browser calculations, no stored salary inputs

## Tools

- [Director Guide](https://payetax.co.uk/tools/director-guide): Salary vs dividend comparison tool for UK company directors - compares extraction scenarios and tax impact
- [Tax Code Decoder](https://payetax.co.uk/tools/tax-code-decoder): Decode and understand your HMRC tax code - explains what each letter and number means
- [Scottish Tax Calculator](https://payetax.co.uk/tools/scottish-tax-calculator): Dedicated calculator for Scottish 6-band income tax rates
- [National Insurance Calculator](https://payetax.co.uk/tools/national-insurance-calculator): Calculate NI contributions for employees, employers, and self-employed
- [Marriage Allowance Calculator](https://payetax.co.uk/tools/marriage-allowance-calculator): Check eligibility and calculate tax savings from transferring allowance to spouse

## Tax Rates

For current 2025-2026 tax rates (income tax bands, National Insurance thresholds, Scottish rates, student loan repayment thresholds), see our [Compliance page](https://payetax.co.uk/compliance) which links to official HMRC sources.

Key rate sources:
- [HMRC Income Tax Rates](https://www.gov.uk/income-tax-rates)
- [HMRC National Insurance Rates](https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions)
- [Revenue Scotland Tax Rates](https://www.revenue.scot/taxes/income-tax)
- [Student Loan Repayment Thresholds](https://www.gov.uk/repaying-your-student-loan)

${blogSections}

## Technical Details

- Framework: Next.js 16, React 19, TypeScript
- Hosting: Vercel Edge Network
- Performance: Lighthouse 95+ (mobile), 100 (desktop)
- Privacy: Interactive calculations in-browser; tax inputs aren't stored; optional anonymized analytics
- Accessibility: WCAG 2.1 AA compliant
- PWA: Installable progressive web app

## Optional

- [Sitemap](https://payetax.co.uk/sitemap.xml): Complete site structure
- [Compliance](https://payetax.co.uk/compliance): HMRC compliance and tax rate verification
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
