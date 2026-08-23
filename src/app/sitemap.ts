// src/app/sitemap.ts

import type { MetadataRoute } from 'next';
import { RATES_LAST_VERIFIED } from '@/constants/freshness';
import { PRIVACY_LAST_UPDATED_ISO } from '@/constants/pages/privacyPageData';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { getLatestContentDate } from '@/lib/contentDates';
import { SITE_URL } from '@/lib/metadata';
import type { BlogPost } from '@/types/blog';

export const revalidate = 86400;

type SitemapFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency: SitemapFrequency;
  priority: number;
}

function normaliseSitemapEntry(entry: SitemapEntry): MetadataRoute.Sitemap[number] {
  return {
    ...entry,
    priority: Number(entry.priority.toFixed(2)),
  };
}

function toUtcSitemapDate(value: string): string {
  const normalisedValue = value.includes('T') ? value : `${value}T00:00:00.000Z`;
  const parsed = new Date(normalisedValue);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const taxContentLastModified = toUtcSitemapDate(RATES_LAST_VERIFIED);
  const aboutLastModified = toUtcSitemapDate('2026-06-19');
  const installLastModified = toUtcSitemapDate('2026-06-07');
  const privacyLastModified = toUtcSitemapDate(PRIVACY_LAST_UPDATED_ISO);

  let blogPosts: SitemapEntry[] = [];
  let posts: BlogPost[] = [];
  let blogContentLastModified = taxContentLastModified;
  try {
    posts = await getBlogPosts({ pageSize: 1000 });
    const latestBlogDate = getLatestContentDate(
      posts.flatMap((post) => [post.publishedAt, post.updatedAt]),
    );
    blogContentLastModified = latestBlogDate
      ? toUtcSitemapDate(latestBlogDate)
      : taxContentLastModified;
    blogPosts = posts.map((post) => {
      const postLastModified = getLatestContentDate([post.publishedAt, post.updatedAt]);

      return {
        url: `${baseUrl}/blog/${post.slug}`,
        ...(postLastModified ? { lastModified: toUtcSitemapDate(postLastModified) } : {}),
        changeFrequency: 'monthly',
        priority: post.featured ? 0.85 : 0.7,
      };
    });
  } catch {
    blogPosts = [];
  }

  const staticPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: taxContentLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: blogContentLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: aboutLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: privacyLastModified,
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
      lastModified: installLastModified,
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

  let categoryPages: SitemapEntry[] = [];
  try {
    const categories = await getBlogCategories();
    categoryPages = categories
      .filter((category) => (typeof category.count === 'number' ? category.count > 0 : true))
      .map((category) => {
        const categoryLastModified = getLatestContentDate(
          posts
            .filter((post) => post.category === category.slug)
            .flatMap((post) => [post.publishedAt, post.updatedAt]),
        );

        return {
          url: `${baseUrl}/blog/category/${category.slug}`,
          ...(categoryLastModified ? { lastModified: toUtcSitemapDate(categoryLastModified) } : {}),
          changeFrequency: 'weekly',
          priority: 0.55,
        };
      });
  } catch {
    categoryPages = [];
  }

  return [...staticPages, ...blogPosts, ...categoryPages].map(normaliseSitemapEntry);
}
