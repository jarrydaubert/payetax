// src/app/llms.txt/route.ts
// LLMs.txt - AI Search Engine Optimization (AEO)
// Helps ChatGPT, Claude, Perplexity, and other AI search tools understand your site
// Dynamic: Automatically includes all blog posts grouped by category

import { getBlogCategories, getBlogPosts } from '@/lib/blog';

// Revalidate every hour (same as blog)
export const revalidate = 3600;

export async function GET() {
  // Fetch all blog posts and categories dynamically
  const [posts, categories] = await Promise.all([
    getBlogPosts({ pageSize: 1000 }),
    getBlogCategories(),
  ]);

  // Group posts by category
  const postsByCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const categoryPosts = postsByCategory.get(post.category) || [];
    categoryPosts.push(post);
    postsByCategory.set(post.category, categoryPosts);
  }

  // Build blog posts sections dynamically
  const blogSections = categories
    .map((category) => {
      const categoryPosts = postsByCategory.get(category.slug) || [];
      if (categoryPosts.length === 0) return '';

      const postLinks = categoryPosts
        .map(
          (post) =>
            `- [${post.title}](https://payetax.co.uk/blog/${post.slug}): ${post.excerpt.slice(0, 150)}${post.excerpt.length > 150 ? '...' : ''}`
        )
        .join('\n');

      return `## Blog Posts - ${category.name}\n\n${postLinks}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const llmsTxt = `# PayeTax

> Free UK PAYE tax calculator with official HMRC rates for 2025-2026. Calculate income tax, National Insurance, student loans, and take-home pay instantly. Privacy-first with all calculations running client-side.

PayeTax is a comprehensive UK tax calculator providing accurate PAYE calculations using official HMRC rates. The calculator supports England, Wales, Northern Ireland, and Scottish tax systems, with features including student loan repayments (all plans), pension contributions, marriage allowance, and blind person's allowance.

All calculations are performed entirely in your browser with zero data collection or server-side storage. The tool is free, requires no registration, and is regularly updated within 24 hours of any HMRC rate changes.

## Main Pages

- [Calculator](https://payetax.co.uk): Main PAYE tax calculator with real-time calculations for income tax, NI, student loans, pensions, and take-home pay
- [Blog - TaxInsights](https://payetax.co.uk/blog): UK tax guides, HMRC updates, and financial advice with ${posts.length} articles across ${categories.length} categories
- [About](https://payetax.co.uk/about): Mission, values, and technology behind PayeTax with focus on privacy-first, open-source philosophy
- [Privacy Policy](https://payetax.co.uk/privacy): Privacy policy explaining client-side calculations with zero server-side data storage
- [Compliance](https://payetax.co.uk/compliance): HMRC compliance, tax rate verification, and data sources

## Tax Rates (2025-2026)

**Income Tax (England, Wales, Northern Ireland):**
- Personal Allowance: £12,570 (0%)
- Basic Rate: £12,571 - £50,270 (20%)
- Higher Rate: £50,271 - £125,140 (40%)
- Additional Rate: £125,141+ (45%)

**Scottish Income Tax:**
- Personal Allowance: £12,570 (0%)
- Starter Rate: £12,571 - £15,397 (19%)
- Basic Rate: £15,398 - £27,491 (20%)
- Intermediate Rate: £27,492 - £43,662 (21%)
- Higher Rate: £43,663 - £75,000 (42%)
- Advanced Rate: £75,001 - £125,140 (45%)
- Top Rate: £125,141+ (48%)

**National Insurance (Class 1):**
- Primary Threshold: £12,570
- Rate £12,570 - £50,270: 12%
- Rate £50,270+: 2%

**Student Loan Repayment Thresholds:**
- Plan 1: £24,990 (9%)
- Plan 2: £27,295 (9%)
- Plan 4: £31,395 (9%)
- Plan 5: £25,000 (9%)
- Postgraduate: £21,000 (6%)

${blogSections}

## Technical Details

- Framework: Next.js 16, React 19, TypeScript
- Hosting: Vercel Edge Network
- Performance: Lighthouse 95+ (mobile), 100 (desktop)
- Privacy: Client-side calculations only, zero data collection
- Accessibility: WCAG 2.1 AA compliant
- PWA: Installable progressive web app
- Open Source: Transparent calculation formulas

## Data Sources

- [HM Revenue & Customs](https://www.gov.uk/government/organisations/hm-revenue-customs): Official UK tax authority
- [Revenue Scotland](https://www.revenue.scot): Scottish tax rates
- [Student Loans Company](https://www.gov.uk/government/organisations/student-loans-company): Loan repayment thresholds
- [Gov.UK](https://www.gov.uk): Official government guidance

## Optional

- [Sitemap](https://payetax.co.uk/sitemap.xml): Complete site structure
- [Compliance Page](https://payetax.co.uk/compliance): HMRC compliance and tax rate verification details
- [Privacy Policy](https://payetax.co.uk/privacy): Detailed privacy and data handling policy
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour (matches revalidate)
    },
  });
}
