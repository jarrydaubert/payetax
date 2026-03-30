// src/app/llms.txt/route.ts
// LLMs.txt - AI Search Engine Optimization (AEO)
// Helps ChatGPT, Claude, Perplexity, and other AI tools understand the site
// Dynamic: Automatically includes all blog posts grouped by category

import {
  HMRC_INCOME_TAX_RATES_URL,
  HMRC_NI_RATES_URL,
  HMRC_STUDENT_LOAN_REPAYMENT_URL,
  REVENUE_SCOTLAND_INCOME_TAX_URL,
} from '@/constants/sources';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import { getAllCompetitorSlugs } from '@/data/competitors';
import { getAllScenarioSlugs } from '@/data/scenarios';
import { getAllUseCaseSlugs } from '@/data/useCases';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/metadata';
import type { BlogCategory, BlogPost } from '@/types/blog';

// Force static generation with hourly revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

/** Sanitize text for Markdown - escape brackets, remove newlines */
function sanitize(text: string): string {
  return text.replace(/\n/g, ' ').replace(/\[/g, '\\[').replace(/\]/g, '\\]').trim();
}

function titleizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .replace(/\bUk\b/g, 'UK')
    .replace(/\bGov\b/g, 'GOV')
    .replace(/\bHmrc\b/g, 'HMRC');
}

export async function GET() {
  let posts: BlogPost[] = [];
  let categories: BlogCategory[] = [];

  try {
    const [fetchedPosts, fetchedCategories] = await Promise.all([
      getBlogPosts({ pageSize: 1000 }),
      getBlogCategories(),
    ]);
    posts = fetchedPosts as BlogPost[];
    categories = fetchedCategories;
  } catch {
    // Keep llms.txt available even if blog data fetch fails
    posts = [];
    categories = [];
  }

  // Group posts by category slug (same key used for lookup)
  const postsByCategory = new Map<string, BlogPost[]>();
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
          return `- [${title}](${SITE_URL}/blog/${post.slug}): ${excerpt}${post.excerpt.length > 150 ? '...' : ''}`;
        })
        .join('\n');

      return `## Blog Posts - ${category.name}\n\n${postLinks}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const useCasePages = getAllUseCaseSlugs()
    .map((slug) => `- [${titleizeSlug(slug)}](${SITE_URL}/best-for/${slug})`)
    .join('\n');

  const scenarioPages = getAllScenarioSlugs()
    .map((slug) => `- [${titleizeSlug(slug)}](${SITE_URL}/scenarios/${slug})`)
    .join('\n');

  const competitorPages = getAllCompetitorSlugs()
    .map((slug) => `- [${titleizeSlug(slug)} Alternative](${SITE_URL}/alternatives/${slug})`)
    .join('\n');

  const lastUpdated = new Date().toISOString().split('T')[0];
  const currentTaxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, { separator: '-' });

  const llmsTxt = `# PayeTax

> Free UK PAYE tax calculator with official HMRC rates for ${currentTaxYearDisplay}. Calculate income tax, National Insurance, student loans, and take-home pay instantly. Privacy-first with interactive calculations in your browser.

Last updated: ${lastUpdated}

PayeTax is a comprehensive UK tax calculator providing accurate PAYE calculations using official HMRC rates. The calculator supports England, Wales, Northern Ireland, and Scottish tax systems, with features including student loan repayments (all plans), pension contributions, marriage allowance, and blind person's allowance.

Interactive calculations run in your browser and tax inputs aren't stored; some pages precompute results server-side for SEO or email delivery. The tool is free, requires no registration, and tax rates are updated when HMRC publishes changes.

## Main Pages

- [Calculator](${SITE_URL}): Main PAYE tax calculator with real-time calculations for income tax, NI, student loans, pensions, and take-home pay
- [Blog - TaxInsights](${SITE_URL}/blog): UK tax guides and HMRC updates with ${posts.length} articles across ${categories.length} categories
- [Best UK Tax Calculators](${SITE_URL}/best-uk-tax-calculators): Comparison of major UK tax calculators and use-case recommendations
- [Best For](${SITE_URL}/best-for): Audience-specific tax calculator pages (freelancers, contractors, students, and more)
- [Scenarios](${SITE_URL}/scenarios): Pre-calculated tax scenarios for common UK salary and planning situations
- [Alternatives](${SITE_URL}/alternatives): Competitor alternative pages and side-by-side comparisons
- [About](${SITE_URL}/about): Mission, values, and technology behind PayeTax
- [Compliance](${SITE_URL}/compliance): HMRC compliance, current tax rates, and data sources
- [Privacy Policy](${SITE_URL}/privacy): Privacy policy - in-browser calculations, no stored salary inputs

## Tools

- [Director Intelligence](${SITE_URL}/tools/director-guide): Salary vs dividend comparison tool for UK company directors - compares extraction scenarios and tax impact
- [Tax Code Decoder](${SITE_URL}/tools/tax-code-decoder): Decode and understand your HMRC tax code - explains what each letter and number means
- [Scottish Tax Calculator](${SITE_URL}/tools/scottish-tax-calculator): Dedicated calculator for Scottish 6-band income tax rates
- [National Insurance Calculator](${SITE_URL}/tools/national-insurance-calculator): Calculate NI contributions for employees, employers, and self-employed
- [Marriage Allowance Calculator](${SITE_URL}/tools/marriage-allowance-calculator): Check eligibility and calculate tax savings from transferring allowance to spouse

## Best For Pages

${useCasePages}

## Scenario Pages

${scenarioPages}

## Comparison Pages

${competitorPages}

## Tax Rates

For current ${currentTaxYearDisplay} tax rates (income tax bands, National Insurance thresholds, Scottish rates, student loan repayment thresholds), see our [Compliance page](${SITE_URL}/compliance) which links to official HMRC sources.

Key rate sources:
- [HMRC Income Tax Rates](${HMRC_INCOME_TAX_RATES_URL})
- [HMRC National Insurance Rates](${HMRC_NI_RATES_URL})
- [Revenue Scotland Tax Rates](${REVENUE_SCOTLAND_INCOME_TAX_URL})
- [Student Loan Repayment Thresholds](${HMRC_STUDENT_LOAN_REPAYMENT_URL})

${blogSections}

## Technical Details

- Framework: Next.js 16, React 19, TypeScript
- Hosting: Vercel Edge Network
- Performance: Lighthouse 95+ (mobile), 100 (desktop)
- Privacy: Interactive calculations in-browser; tax inputs aren't stored; optional anonymized analytics
- Accessibility: WCAG 2.1 AA compliant
- PWA: Installable progressive web app

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Complete site structure
- [Compliance](${SITE_URL}/compliance): HMRC compliance and tax rate verification
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
