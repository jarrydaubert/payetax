// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
import { RATES_LAST_VERIFIED } from '@/constants/freshness';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/metadata';

export const revalidate = 86400;

type SitemapFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: SitemapFrequency;
  priority: number;
}

function normaliseSitemapEntry(entry: SitemapEntry): MetadataRoute.Sitemap[number] {
  return {
    ...entry,
    priority: Number(entry.priority.toFixed(2)),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const taxContentLastModified = `${RATES_LAST_VERIFIED}T00:00:00.000Z`;

  const staticPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: taxContentLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: taxContentLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
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
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/tax-code-decoder`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/scottish-tax-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/national-insurance-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/marriage-allowance-calculator`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/director-guide`,
      lastModified: taxContentLastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ];

  let blogPosts: SitemapEntry[] = [];
  try {
    const posts = await getBlogPosts({ pageSize: 1000 });
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: 'monthly',
      priority: post.featured ? 0.85 : 0.7,
    }));
  } catch {
    blogPosts = [];
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
        priority: 0.55,
      }));
  } catch {
    categoryPages = [];
  }

  return [...staticPages, ...blogPosts, ...categoryPages].map(normaliseSitemapEntry);
}
