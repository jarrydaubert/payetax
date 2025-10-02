// src/app/blog/category/[slug]/page.tsx
/**
 * Category-specific blog page using local MDX blog system
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import { getBlogCategories, getBlogPosts, getBlogPostsCount } from '@/lib/blog';
import { formatDate } from '@/lib/utils'; // Now imported from shared utils

// Enable ISR - revalidate every hour for category pages
export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getBlogCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: 'Category Not Found | ToolHubX Blog' };
  }

  const title = `${category.name} | UK Tax Insights & Updates | ToolHubX Blog`;
  const description = `Expert guidance and articles on ${category.name.toLowerCase()} including UK tax news, tips, and updates.`;

  return {
    title,
    description,
    keywords: `${category.name}, UK tax, tax guide, tax advice, PAYE, tax calculator`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://toolhubx.uk/blog/category/${slug}`,
    },
    alternates: {
      canonical: `https://toolhubx.uk/blog/category/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;

  const currentPage = resolvedSearchParams.page
    ? Number.parseInt(
        Array.isArray(resolvedSearchParams.page)
          ? resolvedSearchParams.page[0]
          : resolvedSearchParams.page,
        10
      )
    : 1;
  const pageSize = 12; // Align with main blog page; adjust via BLOG_CONFIG if needed

  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) return notFound();

  const [posts, totalCount] = await Promise.all([
    getBlogPosts({
      page: currentPage,
      pageSize,
      category: slug,
    }),
    getBlogPostsCount(slug),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (posts.length === 0 && currentPage > 1) {
    return notFound();
  }

  return (
    <div className='container mx-auto px-4 py-12'>
      {/* Structured Data Script */}
      <Script type='application/ld+json' strategy='afterInteractive'>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          headline: `${category.name} - ToolHubX Blog`,
          description: `Articles and guides about ${category.name.toLowerCase()} in UK taxation.`,
          url: `https://toolhubx.uk/blog/category/${slug}`,
          author: {
            '@type': 'Organization',
            name: 'ToolHubX',
            url: 'https://toolhubx.uk',
          },
        })}
      </Script>

      {/* Breadcrumbs */}
      <nav aria-label='Breadcrumbs' className='mb-8 text-small text-white/90'>
        <ol className='flex items-center space-x-2'>
          <li>
            <Link href='/' className='hover:text-blue-600 dark:hover:text-blue-400'>
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href='/blog' className='hover:text-blue-600 dark:hover:text-blue-400'>
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className='text-blue-600 dark:text-blue-400'>{category.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className='mb-12 text-center'>
        <h1 className='mb-4 font-bold text-title md:text-display'>{category.name} Insights</h1>
        <p className='mx-auto max-w-3xl text-large text-white/80'>
          Explore expert articles on {category.name.toLowerCase()} including UK tax updates,
          guidance, and practical advice.
        </p>
      </div>

      {/* Categories */}
      <div className='mb-12'>
        <h2 className='mb-6 font-bold text-subheading'>Categories</h2>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/blog'
            className='rounded-full bg-gray-200 px-4 py-2 font-medium transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          >
            All Posts
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                slug === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name} {cat.count ? `(${cat.count})` : ''}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts Grid with Suspense for PPR */}
      <Suspense fallback={<div className='py-16 text-center'>Loading articles...</div>}>
        {posts.length > 0 ? (
          <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.id}
                className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800'
              >
                {post.image && (
                  <Link href={`/blog/${post.slug}`} className='relative block h-48 overflow-hidden'>
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      className='object-cover transition-transform duration-300 hover:scale-105'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </Link>
                )}
                <div className='p-6'>
                  <div className='mb-3 flex items-center justify-between text-small text-white/90'>
                    <span className='font-medium text-blue-600 dark:text-blue-400'>
                      {post.categoryData?.name || post.category}
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className='mb-3 font-bold text-xl'>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className='mb-4 line-clamp-3 text-white'>{post.excerpt}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-small text-white/90'>{post.readTime}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='inline-flex items-center font-medium text-blue-600 text-small hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      Read more
                      <svg
                        className='ml-1 h-3 w-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <p className='text-large text-white/80'>
              No articles found in this category. Check back soon!
            </p>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className='flex items-center justify-center space-x-2' aria-label='Pagination'>
          {currentPage > 1 && (
            <Link
              href={`/blog/category/${slug}?page=${currentPage - 1}`}
              className='rounded-md bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            >
              Previous
            </Link>
          )}
          <div className='flex space-x-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/blog/category/${slug}?page=${page}`}
                className={`rounded-md px-4 py-2 transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
          {currentPage < totalPages && (
            <Link
              href={`/blog/category/${slug}?page=${currentPage + 1}`}
              className='rounded-md bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* CTA */}
      <div className='glass mt-12 rounded-lg p-6'>
        <h2 className='mb-3 font-bold text-xl'>Calculate Your UK Tax Now</h2>
        <p className='mb-4'>
          Use our free PAYE tax calculator to determine your take-home pay and plan your finances
          better.
        </p>
        <Link
          href='/'
          className='inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700'
        >
          Try Tax Calculator
        </Link>
      </div>
    </div>
  );
}
