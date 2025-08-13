// src/app/blog/page.tsx
/**
 * Blog index page with local MDX blog system
 * Displays featured posts, post grid, and categories
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogCategories, getBlogPosts, getBlogPostsCount, getFeaturedPost } from '@/lib/blog';

/**
 * Generate metadata for the blog index page
 */
export const metadata: Metadata = {
  title: 'UK Tax Insights & Updates | ToolHubX Blog',
  description:
    'Stay informed with the latest UK tax news, expert guidance, and practical advice for taxpayers. Explore articles on PAYE, self-assessment, tax codes, and more.',
  keywords:
    'UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips',
  alternates: {
    canonical: 'https://toolhubx.uk/blog',
  },
  openGraph: {
    title: 'UK Tax Insights & Updates | ToolHubX Blog',
    description: 'Expert tax guidance, practical advice, and the latest updates on UK taxation.',
    url: 'https://toolhubx.uk/blog',
    type: 'website',
    images: ['/images/blog-og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Tax Insights & Updates | ToolHubX Blog',
    description: 'Expert tax guidance, practical advice, and the latest updates on UK taxation.',
    images: ['/images/blog-twitter-image.jpg'],
  },
};

/**
 * Format date in a human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Blog page component
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // Parse page number from search params
  const currentPage = params.page
    ? Number.parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10)
    : 1;
  const selectedCategory = params.category
    ? Array.isArray(params.category)
      ? params.category[0]
      : params.category
    : undefined;

  // Fetch blog data
  const [posts, featuredPost, categories] = await Promise.all([
    getBlogPosts({
      page: currentPage,
      pageSize: 12,
      category: selectedCategory,
    }),
    getFeaturedPost(),
    getBlogCategories(),
  ]);

  // Get proper total count
  const totalCount = await getBlogPostsCount(selectedCategory);
  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">UK Tax Insights & Updates</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Expert guidance, practical advice, and the latest updates on UK taxation. Stay informed
          with our comprehensive articles on PAYE, self-assessment, tax codes, and more.
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && !selectedCategory && currentPage === 1 && (
        <div className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {featuredPost.image && (
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt || featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
                Featured
              </span>
              <h2 className="text-3xl font-bold mb-4">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{featuredPost.excerpt}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>{formatDate(featuredPost.publishedAt)}</span>
                <span className="mx-2">•</span>
                <span>{featuredPost.readTime}</span>
                {featuredPost.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>By {featuredPost.author}</span>
                  </>
                )}
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Read Article
                <svg
                  className="ml-2 w-4 h-4"
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
        </div>
      )}

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog?category=${category.slug}`}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name} {category.count ? `(${category.count})` : ''}
            </Link>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
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
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.readTime}</span>
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
            {selectedCategory
              ? 'No articles found in this category.'
              : 'No articles found. Check back soon!'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2" aria-label="Pagination">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}${
                selectedCategory ? `&category=${selectedCategory}` : ''
              }`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </Link>
          )}

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/blog?page=${page}${
                  selectedCategory ? `&category=${selectedCategory}` : ''
                }`}
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
              href={`/blog?page=${currentPage + 1}${
                selectedCategory ? `&category=${selectedCategory}` : ''
              }`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
