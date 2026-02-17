// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
import { getAllCompetitorSlugs } from '@/data/competitors';
import { getAllScenarioSlugs } from '@/data/scenarios';
import { getAllUseCaseSlugs } from '@/data/useCases';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';

// Revalidate daily - blog content can change
export const revalidate = 86400;

type SitemapFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: SitemapFrequency;
  priority: number;
}

// Use env var for preview deployments, fallback to production
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://payetax.co.uk');

// Crawl-budget strategy:
// Prioritize high-intent salary URLs instead of submitting the full long-tail set.
const PRIORITY_SALARIES = [
  18000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000,
  85000, 90000, 95000, 100000, 101000, 105000, 110000, 115000, 120000, 125000, 130000, 140000,
  150000, 175000, 200000, 250000, 300000, 500000,
];

// High-volume salaries with known search data
const SALARY_SEARCH_VOLUME_HINT: Record<number, number> = {
  80000: 620,
  90000: 530,
  70000: 480,
  100000: 450,
  60000: 390,
  50000: 350,
  40000: 320,
  30000: 280,
  35000: 250,
  45000: 230,
  55000: 210,
  65000: 190,
  75000: 180,
  105000: 170,
  115000: 170,
  85000: 160,
  95000: 150,
  125000: 140,
  110000: 130,
  120000: 120,
};

const PRIORITY_COMPETITOR_SLUGS = [
  'gov-uk-calculator',
  'salary-calculator',
  'listentotaxman',
  'moneysavingexpert',
  'xero-calculator',
  'sage-calculator',
  'quickbooks-calculator',
  'reed-calculator',
  'freelancer-calculator',
  'contractor-calculator',
  'taxscouts',
  'salarybot',
];
const MAX_COMPETITOR_SLUGS_IN_SITEMAP = 12;

function selectCompetitorSlugsForSitemap(allSlugs: string[]): string[] {
  const prioritized = PRIORITY_COMPETITOR_SLUGS.filter((slug) => allSlugs.includes(slug));
  if (prioritized.length >= MAX_COMPETITOR_SLUGS_IN_SITEMAP) {
    return prioritized.slice(0, MAX_COMPETITOR_SLUGS_IN_SITEMAP);
  }

  const fallback = allSlugs
    .filter((slug) => !prioritized.includes(slug))
    .slice(0, MAX_COMPETITOR_SLUGS_IN_SITEMAP - prioritized.length);

  return [...prioritized, ...fallback];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  // Keep static routes stable; update this when static content is materially changed.
  const staticPagesDate = '2026-02-10T00:00:00.000Z';

  // Static pages - use stable date (update when content changes)
  const staticPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: staticPagesDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: staticPagesDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticPagesDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/compliance`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/install`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/best-uk-tax-calculators`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/best-for`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/tax-code-decoder`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/scottish-tax-calculator`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/national-insurance-calculator`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/marriage-allowance-calculator`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/director-guide`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

  const salaryPages: SitemapEntry[] = PRIORITY_SALARIES.map((salary) => {
    const volume = SALARY_SEARCH_VOLUME_HINT[salary] || 50;
    return {
      url: `${baseUrl}/calculator/${salary}-after-tax`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: Math.min(0.9, 0.65 + volume / 2000),
    };
  });

  let blogPosts: SitemapEntry[] = [];
  try {
    const posts = await getBlogPosts({ pageSize: 1000 }); // Fetch all; loop pages if >1000
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: 'monthly',
      priority: post.featured ? 0.9 : 0.8, // Featured posts get higher priority
    }));
  } catch (_error) {
    // Silently fail - fallback content will be used below
  }

  let categoryPages: SitemapEntry[] = [];
  try {
    const categories = await getBlogCategories();
    categoryPages = categories
      .filter((category) => (typeof category.count === 'number' ? category.count > 0 : true))
      .map((category) => ({
        url: `${baseUrl}/blog/category/${category.slug}`,
        lastModified: staticPagesDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch (_error) {
    // Silently fail - fallback content will be used below
  }

  // Fallbacks (derived from sample data if fetch fails)
  if (blogPosts.length === 0 && categoryPages.length === 0) {
    blogPosts = [
      {
        url: `${baseUrl}/blog/understanding-uk-tax-codes`,
        lastModified: staticPagesDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog/beginners-guide-to-uk-taxation`,
        lastModified: staticPagesDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
    categoryPages = [
      {
        url: `${baseUrl}/blog/category/tax-basics`,
        lastModified: staticPagesDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog/category/tax-tips`,
        lastModified: staticPagesDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  }

  // Competitor comparison pages
  const competitorSlugs = selectCompetitorSlugsForSitemap(getAllCompetitorSlugs());
  const competitorPages: SitemapEntry[] = competitorSlugs.flatMap((slug) => [
    {
      url: `${baseUrl}/alternatives/${slug}`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/vs/${slug}`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.7,
    },
  ]);

  // Scenario pages (tax optimization guides)
  const scenarioSlugs = getAllScenarioSlugs();
  const scenarioPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/scenarios`,
      lastModified: staticPagesDate,
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 0.85,
    },
    ...scenarioSlugs.map((slug) => ({
      url: `${baseUrl}/scenarios/${slug}`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    })),
  ];

  // Use case pages (audience-specific landing pages)
  const useCaseSlugs = getAllUseCaseSlugs();
  const useCasePages: SitemapEntry[] = useCaseSlugs.map((slug) => ({
    url: `${baseUrl}/best-for/${slug}`,
    lastModified: staticPagesDate,
    changeFrequency: 'monthly' as SitemapFrequency,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...salaryPages,
    ...blogPosts,
    ...categoryPages,
    ...competitorPages,
    ...scenarioPages,
    ...useCasePages,
  ];
}
