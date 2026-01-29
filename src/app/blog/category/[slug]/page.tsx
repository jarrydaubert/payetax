// src/app/blog/category/[slug]/page.tsx
/**
 * Category-specific blog page using local MDX blog system
 * Supports both individual categories AND nav groups (e.g., "tax-guides" = tax-guide + guide)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { BlogNav } from '@/components/molecules/BlogNav';
import {
  getCategoriesForNavGroup,
  getNavGroupBySlug,
  NAV_GROUPS,
  POSTS_PER_PAGE,
} from '@/constants/blogCategories';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/metadata';
import { formatDate } from '@/lib/utils';

// Cache categories fetch to deduplicate calls
const getCachedCategories = cache(() => getBlogCategories());

// Next.js 16: Route segment config
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  // Generate params for both nav groups AND individual categories
  const categories = await getCachedCategories();
  const categoryParams = categories.map((c) => ({ slug: c.slug }));
  const navGroupParams = NAV_GROUPS.map((g) => ({ slug: g.slug }));
  return [...navGroupParams, ...categoryParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a nav group first
  const navGroup = getNavGroupBySlug(slug);
  if (navGroup) {
    const title = `${navGroup.label} | TaxInsights by PayeTax`;
    const description = `Expert ${navGroup.label.toLowerCase()} articles from TaxInsights. Clear UK tax advice with no jargon.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/blog/category/${slug}` },
      openGraph: { title, description, url: `${SITE_URL}/blog/category/${slug}` },
    };
  }

  // Fall back to individual category
  const categories = await getCachedCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return { title: 'Category Not Found | TaxInsights by PayeTax' };
  }

  const title = `${category.name} | TaxInsights by PayeTax`;
  const description = `Expert guidance and articles on ${category.name.toLowerCase()} from TaxInsights.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/category/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/blog/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPage = resolvedSearchParams.page
    ? Number.parseInt(
        Array.isArray(resolvedSearchParams.page)
          ? (resolvedSearchParams.page[0] ?? '1')
          : resolvedSearchParams.page,
        10
      )
    : 1;

  // Check if this is a nav group (e.g., "tax-guides" maps to ["tax-guide", "guide"])
  const navGroup = getNavGroupBySlug(slug);
  const isGroup = !!navGroup;
  const categoryKeys = isGroup ? getCategoriesForNavGroup(slug) : [slug];

  // Fetch posts filtered by category keys (multiple for groups, single for categories)
  const posts = await getBlogPosts({
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
    categories: categoryKeys,
  });

  // Count total posts in these categories
  const allPosts = await getBlogPosts({ categories: categoryKeys, pageSize: 1000 });
  const totalCount = allPosts.length;
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  // 404 if no posts and not first page
  if (posts.length === 0 && currentPage > 1) {
    return notFound();
  }

  // For individual categories, verify it exists
  if (!isGroup) {
    const categories = await getCachedCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return notFound();
  }

  // Display name for header
  const displayName = isGroup
    ? navGroup.label
    : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayName,
        item: `${SITE_URL}/blog/category/${slug}`,
      },
    ],
  };

  return (
    <div className='min-h-screen bg-slate-950'>
      {/* Structured Data */}
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      {/* Header */}
      <div className='border-b border-slate-800 bg-slate-900/50 py-12'>
        <div className='container mx-auto max-w-7xl px-4'>
          {/* Breadcrumbs */}
          <nav aria-label='Breadcrumbs' className='mb-6 text-sm text-slate-400'>
            <ol className='flex items-center gap-2'>
              <li>
                <Link href='/' className='hover:text-white'>
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href='/blog' className='hover:text-white'>
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className='text-cyan-400'>{displayName}</li>
            </ol>
          </nav>

          <h1 className='mb-4 font-display text-3xl font-bold text-white md:text-4xl'>
            {displayName}
          </h1>
          <p className='max-w-2xl text-slate-300'>
            {isGroup
              ? `Browse all ${displayName.toLowerCase()} articles - expert UK tax guidance with no jargon.`
              : `Expert articles on ${displayName.toLowerCase()} including UK tax updates, guidance, and practical advice.`}
          </p>
          <p className='mt-2 text-sm text-slate-500'>
            {totalCount} {totalCount === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>

      {/* Blog Nav */}
      <div className='container mx-auto max-w-7xl px-4 pt-8'>
        <BlogNav activeGroup={isGroup ? slug : undefined} />
      </div>

      {/* Posts Grid */}
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        {posts.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.id}
                className='group rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-slate-700'
              >
                <div className='mb-3 flex items-center gap-2 text-xs text-slate-400'>
                  <span className='font-medium text-cyan-400'>
                    {post.categoryData?.name || post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className='mb-2 font-semibold text-white group-hover:text-cyan-400'>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className='mb-4 line-clamp-2 text-sm text-slate-400'>{post.excerpt}</p>
                <time className='text-xs text-slate-500' dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <p className='text-lg text-slate-400'>No articles found. Check back soon!</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className='mt-12 flex items-center justify-center gap-2' aria-label='Pagination'>
            {currentPage > 1 && (
              <Link
                href={`/blog/category/${slug}?page=${currentPage - 1}`}
                className='rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700'
              >
                Previous
              </Link>
            )}
            <span className='px-4 py-2 text-sm text-slate-400'>
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/blog/category/${slug}?page=${currentPage + 1}`}
                className='rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700'
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
