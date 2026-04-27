// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
import { RATES_LAST_VERIFIED } from '@/constants/freshness';
import { getAllCompetitorSlugs } from '@/data/competitors';
import { getAllScenarioSlugs } from '@/data/scenarios';
import { getAllUseCaseSlugs } from '@/data/useCases';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { INDEXABLE_SALARIES, SALARY_SEARCH_VOLUME_HINT } from '@/lib/seo/salaryPages';

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

function roundPriority(priority: number): number {
  return Number(priority.toFixed(2));
}

function normaliseSitemapEntry(entry: SitemapEntry): MetadataRoute.Sitemap[number] {
  return {
    ...entry,
    priority: roundPriority(entry.priority),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const taxContentLastModified = `${RATES_LAST_VERIFIED}T00:00:00.000Z`;

  // Most static routes surface current tax-year assumptions, so use the verified rate date
  // instead of an arbitrary manual sitemap date.
  const staticPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: taxContentLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: taxContentLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: taxContentLastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/compliance`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/install`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/best-uk-tax-calculators`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/best-for`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/tax-code-decoder`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/scottish-tax-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/national-insurance-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/marriage-allowance-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/director-guide`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

  const salaryPages: SitemapEntry[] = INDEXABLE_SALARIES.map((salary) => {
    const volume = SALARY_SEARCH_VOLUME_HINT[salary] || 50;
    return {
      url: `${baseUrl}/calculator/${salary}-after-tax`,
      lastModified: taxContentLastModified,
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
        lastModified: taxContentLastModified,
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
        lastModified: taxContentLastModified,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog/beginners-guide-to-uk-taxation`,
        lastModified: taxContentLastModified,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
    categoryPages = [
      {
        url: `${baseUrl}/blog/category/tax-basics`,
        lastModified: taxContentLastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog/category/tax-tips`,
        lastModified: taxContentLastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  }

  // Competitor comparison pages
  const competitorSlugs = selectCompetitorSlugsForSitemap(getAllCompetitorSlugs());
  const competitorPages: SitemapEntry[] = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: taxContentLastModified,
    changeFrequency: 'monthly' as SitemapFrequency,
    priority: 0.75,
  }));

  // Scenario pages (tax optimization guides)
  const scenarioSlugs = getAllScenarioSlugs();
  const scenarioPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/scenarios`,
      lastModified: taxContentLastModified,
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 0.85,
    },
    ...scenarioSlugs.map((slug) => ({
      url: `${baseUrl}/scenarios/${slug}`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    })),
  ];

  // Use case pages (audience-specific landing pages)
  const useCaseSlugs = getAllUseCaseSlugs();
  const useCasePages: SitemapEntry[] = useCaseSlugs.map((slug) => ({
    url: `${baseUrl}/best-for/${slug}`,
    lastModified: taxContentLastModified,
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
  ].map(normaliseSitemapEntry);
}
