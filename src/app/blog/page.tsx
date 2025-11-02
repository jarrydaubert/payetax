// src/app/blog/page.tsx

import type { Metadata } from 'next';
import { getBlogCategories, getBlogPosts, getBlogPostsCount, getFeaturedPost } from '@/lib/blog';
import { BlogPageClient } from './BlogPageClient';

// Next.js 16: Route segment config for optimized blog listing
// Changed to dynamic to support query params (category, page) in dev
export const dynamic = 'force-dynamic'; // Dynamic rendering to respect search params
export const revalidate = 3600; // ISR: Revalidate every hour for new posts

export const metadata: Metadata = {
  title: 'TaxInsights by PayeTax | UK Tax Guidance',
  description:
    'Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights for 2025-26. Clear explanations, no jargon.',
  keywords:
    'TaxInsights, UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips, financial advice',
  alternates: {
    canonical: 'https://payetax.co.uk/blog',
  },
  openGraph: {
    title: 'TaxInsights by PayeTax | UK Tax Guidance',
    description:
      'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, self-assessment guides, and practical financial insights.',
    url: 'https://payetax.co.uk/blog',
    type: 'website',
    siteName: 'TaxInsights by PayeTax',
    images: ['/images/blog/taxinsights-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaxInsights by PayeTax',
    description:
      'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, and practical financial insights.',
    images: ['/images/blog/taxinsights-og.jpg'],
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const currentPage = params.page
    ? Number.parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10)
    : 1;
  const selectedCategory = params.category
    ? Array.isArray(params.category)
      ? params.category[0]
      : params.category
    : undefined;

  const [posts, featuredPost, categories, totalCount, allPostsCount] = await Promise.all([
    getBlogPosts({
      page: currentPage,
      pageSize: 9,
      category: selectedCategory,
    }),
    getFeaturedPost(),
    getBlogCategories(),
    getBlogPostsCount(selectedCategory),
    getBlogPostsCount(),
  ]);

  return (
    <BlogPageClient
      posts={posts}
      featuredPost={featuredPost}
      categories={categories}
      totalCount={totalCount}
      allPostsCount={allPostsCount}
      currentPage={currentPage}
      selectedCategory={selectedCategory}
    />
  );
}
