// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
import { getAllCompetitorSlugs } from '@/data/competitors';
import { getAllScenarioSlugs } from '@/data/scenarios';
import { getAllUseCaseSlugs } from '@/data/useCases';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';

type SitemapFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: SitemapFrequency;
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://payetax.co.uk';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95, // TaxInsights is a major publication
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/compliance`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Competitor comparison pages
    {
      url: `${baseUrl}/best-uk-tax-calculators`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Tool landing pages
    {
      url: `${baseUrl}/tools/tax-code-decoder`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/scottish-tax-calculator`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/national-insurance-calculator`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/marriage-allowance-calculator`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/director-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/embed-widget`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Expanded salary pages for comprehensive SEO coverage (150+ pages)
  // High-volume salaries with known search data
  const highVolumeSalaries: Record<number, number> = {
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

  // All programmatic salaries (matches generateStaticParams in calculator/[salary]/page.tsx)
  const allSalaries = [
    // Entry-level (£18k-£25k)
    18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000,
    // Lower-mid (£26k-£35k)
    26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000,
    // Mid range (£36k-£50k)
    36000, 37000, 38000, 39000, 40000, 41000, 42000, 43000, 44000, 45000, 46000, 47000, 48000,
    49000, 50000,
    // Upper-mid (£51k-£75k)
    51000, 52000, 53000, 54000, 55000, 56000, 57000, 58000, 59000, 60000, 61000, 62000, 63000,
    64000, 65000, 66000, 67000, 68000, 69000, 70000, 71000, 72000, 73000, 74000, 75000,
    // Higher earners (£76k-£100k)
    76000, 77000, 78000, 79000, 80000, 82000, 85000, 87000, 90000, 92000, 95000, 97000, 100000,
    // Tax trap zone (£100k-£125k)
    101000, 102000, 103000, 104000, 105000, 106000, 107000, 108000, 109000, 110000, 111000, 112000,
    113000, 114000, 115000, 116000, 117000, 118000, 119000, 120000, 121000, 122000, 123000, 124000,
    125000,
    // High earners (£125k+)
    130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000,
    190000, 195000, 200000,
    // Executive
    210000, 220000, 225000, 230000, 240000, 250000, 275000, 300000, 325000, 350000, 375000, 400000,
    450000, 500000,
  ];

  const salaryPages: SitemapEntry[] = allSalaries.map((salary) => {
    const volume = highVolumeSalaries[salary] || 50; // Default low volume for unlisted
    return {
      url: `${baseUrl}/calculator/${salary}-after-tax`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      // Priority based on search volume (0.65-0.9 range)
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
  } catch (_error) {}

  let categoryPages: SitemapEntry[] = [];
  try {
    const categories = await getBlogCategories();
    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (_error) {}

  // Fallbacks (derived from sample data if fetch fails)
  if (blogPosts.length === 0 && categoryPages.length === 0) {
    blogPosts = [
      {
        url: `${baseUrl}/blog/understanding-uk-tax-codes`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog/beginners-guide-to-uk-taxation`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
    categoryPages = [
      {
        url: `${baseUrl}/blog/category/tax-basics`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog/category/tax-tips`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  }

  // Competitor comparison pages (dynamic)
  const competitorSlugs = getAllCompetitorSlugs();
  const competitorPages: SitemapEntry[] = competitorSlugs.flatMap((slug) => [
    {
      url: `${baseUrl}/alternatives/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/vs/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.7,
    },
  ]);

  // Scenario pages (tax optimization guides)
  const scenarioSlugs = getAllScenarioSlugs();
  const scenarioPages: SitemapEntry[] = [
    // Scenario hub
    {
      url: `${baseUrl}/scenarios`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 0.85,
    },
    // Individual scenarios
    ...scenarioSlugs.map((slug) => ({
      url: `${baseUrl}/scenarios/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    })),
  ];

  // Use case pages (audience-specific landing pages)
  const useCaseSlugs = getAllUseCaseSlugs();
  const useCasePages: SitemapEntry[] = useCaseSlugs.map((slug) => ({
    url: `${baseUrl}/best-for/${slug}`,
    lastModified: currentDate,
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
