// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
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
  ];

  // High-priority salary pages (based on search volume)
  const salaryPages: SitemapEntry[] = [
    // Top search volume salaries get highest priority
    { salary: 80000, volume: 620 },
    { salary: 90000, volume: 530 },
    { salary: 70000, volume: 480 },
    { salary: 100000, volume: 450 },
    { salary: 60000, volume: 390 },
    { salary: 50000, volume: 350 },
    { salary: 105000, volume: 170 },
    { salary: 115000, volume: 170 },
    { salary: 125000, volume: 140 },
    { salary: 40000, volume: 320 },
    { salary: 30000, volume: 280 },
    { salary: 35000, volume: 250 },
    { salary: 45000, volume: 230 },
    { salary: 55000, volume: 210 },
    { salary: 65000, volume: 190 },
    { salary: 75000, volume: 180 },
    { salary: 85000, volume: 160 },
    { salary: 95000, volume: 150 },
    { salary: 110000, volume: 130 },
    { salary: 120000, volume: 120 },
  ].map(({ salary, volume }) => ({
    url: `${baseUrl}/calculator/${salary}-after-tax`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as SitemapFrequency,
    // Priority based on search volume (0.7-0.9 range)
    priority: Math.min(0.9, 0.7 + (volume / 3000)),
  }));

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

  return [...staticPages, ...salaryPages, ...blogPosts, ...categoryPages];
}
