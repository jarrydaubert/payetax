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
      priority: 0.9,
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
      priority: 0.3,
    },
  ];

  let blogPosts: SitemapEntry[] = [];
  try {
    const posts = await getBlogPosts({ pageSize: 1000 }); // Fetch all; loop pages if >1000
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
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

  return [...staticPages, ...blogPosts, ...categoryPages];
}
