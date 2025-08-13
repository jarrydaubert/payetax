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
    <div className="container mx-auto px-4 py-12">
      {/* Structured Data Script */}
      <Script id="category-schema" type="application/ld+json" strategy="afterInteractive">
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
      <nav aria-label="Breadcrumbs" className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className="text-blue-600 dark:text-blue-400">{category.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name} Insights</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore expert articles on {category.name.toLowerCase()} including UK tax updates,
          guidance, and practical advice.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            All Posts
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                slug === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name} {cat.count ? `(${cat.count})` : ''}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts Grid with Suspense for PPR */}
      <Suspense fallback={<div className="text-center py-16">Loading articles...</div>}>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {post.image && (
                  <Link href={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {post.categoryData?.name || post.category}
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.readTime}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center"
                    >
                      Read more
                      <svg
                        className="ml-1 w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No articles found in this category. Check back soon!
            </p>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2" aria-label="Pagination">
          {currentPage > 1 && (
            <Link
              href={`/blog/category/${slug}?page=${currentPage - 1}`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </Link>
          )}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/blog/category/${slug}?page=${page}`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
          {currentPage < totalPages && (
            <Link
              href={`/blog/category/${slug}?page=${currentPage + 1}`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 mt-12 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Calculate Your UK Tax Now</h2>
        <p className="mb-4">
          Use our free PAYE tax calculator to determine your take-home pay and plan your finances
          better.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex"
        >
          Try Tax Calculator
        </Link>
      </div>
    </div>
  );
}
