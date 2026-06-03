// src/app/llms.txt/route.ts

import {
  HMRC_INCOME_TAX_RATES_URL,
  HMRC_NI_RATES_URL,
  HMRC_STUDENT_LOAN_REPAYMENT_URL,
  REVENUE_SCOTLAND_INCOME_TAX_URL,
} from '@/constants/sources';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/metadata';
import type { BlogCategory, BlogPost } from '@/types/blog';

export const dynamic = 'force-static';
export const revalidate = 3600;

function sanitize(text: string): string {
  return text.replace(/\n/g, ' ').replace(/\[/g, '\\[').replace(/\]/g, '\\]').trim();
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
    posts = [];
    categories = [];
  }

  const postsByCategory = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const categoryPosts = postsByCategory.get(post.category) || [];
    categoryPosts.push(post);
    postsByCategory.set(post.category, categoryPosts);
  }

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

  const lastUpdated = new Date().toISOString().split('T')[0];
  const currentTaxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, { separator: '-' });

  const llmsTxt = `# PayeTax

> UK PAYE calculator and R&D project using official HMRC rates for ${currentTaxYearDisplay}. Calculate income tax, National Insurance, student loans, pensions, and take-home pay. Interactive calculations run in the browser.

Last updated: ${lastUpdated}

PayeTax is a deterministic UK tax calculation project focused on accuracy, privacy, and explaining payroll reality. It is not a broad finance app, a sales funnel, or a tax adviser.

## Main Pages

- [Calculator](${SITE_URL}): Main PAYE tax calculator with real-time calculations
- [Blog](${SITE_URL}/blog): Supporting UK tax explainers and project notes with ${posts.length} articles across ${categories.length} categories
- [Tools](${SITE_URL}/tools): Focused tax tools
- [About](${SITE_URL}/about): Project background and operating principles
- [Compliance](${SITE_URL}/compliance): Tax-rate sources and calculation limits
- [Privacy Policy](${SITE_URL}/privacy): Privacy policy and data handling

## Tools

- [Director Intelligence](${SITE_URL}/tools/director-guide): Salary vs dividend comparison for UK company directors
- [Tax Code Decoder](${SITE_URL}/tools/tax-code-decoder): Decode and understand HMRC tax codes
- [Scottish Tax Calculator](${SITE_URL}/tools/scottish-tax-calculator): Scottish income tax calculations
- [National Insurance Calculator](${SITE_URL}/tools/national-insurance-calculator): NI contribution calculations
- [Marriage Allowance Calculator](${SITE_URL}/tools/marriage-allowance-calculator): Marriage Allowance eligibility and estimated savings

## Tax Sources

- [HMRC Income Tax Rates](${HMRC_INCOME_TAX_RATES_URL})
- [HMRC National Insurance Rates](${HMRC_NI_RATES_URL})
- [Revenue Scotland Tax Rates](${REVENUE_SCOTLAND_INCOME_TAX_URL})
- [Student Loan Repayment Thresholds](${HMRC_STUDENT_LOAN_REPAYMENT_URL})

${blogSections}

## Technical Details

- Framework: Next.js, React, TypeScript
- Hosting: Vercel
- Analytics: basic consent-gated GA4
- Error monitoring: Sentry, with optional Sentry-to-Linear webhook
- Privacy: interactive calculations run in-browser; salary inputs are not stored
- PWA: installable progressive web app

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Current retained public routes
- [Compliance](${SITE_URL}/compliance): HMRC compliance and tax rate verification
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
