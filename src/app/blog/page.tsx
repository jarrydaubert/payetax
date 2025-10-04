// src/app/blog/page.tsx

import type { Metadata } from 'next';
import { getBlogCategories, getBlogPosts, getBlogPostsCount, getFeaturedPost } from '@/lib/blog';
import { BlogPageClient } from './BlogPageClient';

// Enable ISR - revalidate every hour for blog listing page
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'UK Tax Insights & Updates | PayeTax Blog',
  description:
    'Stay informed with the latest UK tax news, expert guidance, and practical advice for taxpayers. PAYE, self-assessment, tax codes, and more.',
  keywords:
    'UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips',
  alternates: {
    canonical: 'https://payetax.co.uk/blog',
  },
  openGraph: {
    title: 'UK Tax Insights & Updates | PayeTax Blog',
    description: 'Expert tax guidance, practical advice, and the latest updates on UK taxation.',
    url: 'https://payetax.co.uk/blog',
    type: 'website',
    images: ['/images/blog-og-image.jpg'],
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
