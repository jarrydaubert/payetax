// src/app/blog/page.tsx

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CallToAction from '@/components/ui/CallToAction';
import { getBlogCategories, getBlogPosts, getBlogPostsCount, getFeaturedPost } from '@/lib/blog';

// Enable ISR - revalidate every hour for blog listing page
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'UK Tax Insights & Updates | ToolHubX Blog',
  description:
    'Stay informed with the latest UK tax news, expert guidance, and practical advice for taxpayers. PAYE, self-assessment, tax codes, and more.',
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
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

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
    getBlogPostsCount(selectedCategory), // Filtered count for pagination
    getBlogPostsCount(), // Total count for "All Posts" button
  ]);

  const totalPages = Math.ceil(totalCount / 9);

  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-7xl px-4'>
        {/* Header */}
        <div className='mb-16'>
          <Link
            href='/'
            className='group mb-8 inline-flex items-center text-purple-400 transition-colors hover:text-purple-300'
          >
            <ArrowLeft className='group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform' />
            Back to Calculator
          </Link>

          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2'>
              <BookOpen className='h-4 w-4 text-blue-400' />
              <span className='font-medium text-blue-300 text-sm'>Tax Insights Blog</span>
            </div>

            <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                UK Tax Insights
              </span>
              <br />
              <span className='text-white'>& Updates</span>
            </h1>

            <p className='mx-auto max-w-3xl text-gray-300 text-xl leading-relaxed'>
              Expert guidance, practical advice, and the latest updates on UK taxation. Stay
              informed and make better financial decisions.
            </p>

            {selectedCategory && (
              <div className='mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2'>
                <Tag className='h-4 w-4 text-purple-400' />
                <span className='text-gray-300 text-sm'>Category: </span>
                <span className='font-medium text-sm text-white'>
                  {categories.find((cat) => cat.slug === selectedCategory)?.name ||
                    selectedCategory}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className='mx-auto mb-16 grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='glass-card p-6 text-center'>
            <FileText className='mx-auto mb-3 h-8 w-8 text-blue-400' />
            <div className='mb-1 font-bold text-2xl text-white'>{totalCount}</div>
            <div className='text-gray-300 text-sm'>Expert Articles</div>
          </div>
          <div className='glass-card p-6 text-center'>
            <TrendingUp className='mx-auto mb-3 h-8 w-8 text-purple-400' />
            <div className='mb-1 font-bold text-2xl text-white'>Weekly</div>
            <div className='text-gray-300 text-sm'>Updates</div>
          </div>
          <div className='glass-card p-6 text-center'>
            <Star className='mx-auto mb-3 h-8 w-8 text-yellow-400' />
            <div className='mb-1 font-bold text-2xl text-white'>Free</div>
            <div className='text-gray-300 text-sm'>Always</div>
          </div>
        </div>

        {/* Categories Filter - Improved Spacing */}
        {categories.length > 0 && (
          <div className='mb-20'>
            <h2 className='mb-8 text-center font-semibold text-white text-xl'>Browse by Topic</h2>
            <div className='mx-auto max-w-5xl'>
              <div className='blog-filters'>
                <Link
                  href='/blog#categories'
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-center font-medium text-sm transition-all duration-300 ${
                    !selectedCategory
                      ? 'scale-105 transform bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'glass-card border border-white/10 text-white/80 hover:scale-105 hover:border-white/20 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span>All Posts</span>
                  <span className='ml-2 rounded-full bg-white/20 px-2 py-0.5 font-bold text-xs'>
                    {allPostsCount}
                  </span>
                </Link>
                {categories
                  .filter((category) => (category.count || 0) > 0)
                  .map((category) => (
                    <Link
                      key={category.slug}
                      href={`/blog?category=${category.slug}#categories`}
                      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-center font-medium text-sm transition-all duration-300 ${
                        selectedCategory === category.slug
                          ? 'scale-105 transform bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'glass-card border border-white/10 text-white/80 hover:scale-105 hover:border-white/20 hover:text-white hover:shadow-md'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className='ml-2 rounded-full bg-white/20 px-2 py-0.5 font-bold text-xs'>
                        {category.count}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && !selectedCategory && currentPage === 1 && (
          <div className='mb-16'>
            <div className='mb-8 text-center'>
              <div className='mb-2 inline-flex items-center gap-2 text-yellow-400'>
                <Sparkles className='h-5 w-5' />
                <span className='font-semibold'>Featured Article</span>
                <Sparkles className='h-5 w-5' />
              </div>
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className='group block'>
              <div className='glass-card border-yellow-400 border-l-4 p-8 transition-colors duration-200 hover:border-yellow-300 md:p-12'>
                <div className='grid items-center gap-8 md:grid-cols-2'>
                  <div>
                    <div className='mb-6 flex items-center gap-4'>
                      <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 font-bold text-black text-sm'>
                        FEATURED
                      </div>
                      <div className='flex items-center gap-2 text-gray-300'>
                        <Calendar className='h-4 w-4' />
                        <span className='text-sm'>{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                    </div>

                    <h2 className='mb-6 font-bold text-3xl text-white leading-tight group-hover:text-gradient md:text-4xl'>
                      {featuredPost.title}
                    </h2>

                    <p className='mb-8 text-gray-300 text-lg leading-relaxed'>
                      {featuredPost.excerpt}
                    </p>

                    <div className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white transition-shadow group-hover:shadow-lg'>
                      <span>Read Full Article</span>
                      <ArrowLeft className='h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1' />
                    </div>
                  </div>

                  {featuredPost.image && (
                    <div className='relative h-80 overflow-hidden rounded-xl shadow-2xl'>
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.imageAlt || featuredPost.title}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className='mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className='group block'>
                  <article className='glass-card h-full transition-colors duration-200 hover:border-white/30'>
                    {post.image && (
                      <div className='relative h-48 overflow-hidden rounded-t-xl'>
                        <Image
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          fill
                          className='object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                      </div>
                    )}

                    <div className='p-6'>
                      <div className='mb-4 flex items-center justify-between'>
                        <span className='rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 font-medium text-purple-300 text-sm'>
                          {post.category}
                        </span>
                        <div className='flex items-center gap-2 text-gray-300 text-sm'>
                          <Calendar className='h-3 w-3' />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>

                      <h3 className='mb-3 font-bold text-white text-xl leading-tight transition-colors group-hover:text-purple-300'>
                        {post.title}
                      </h3>

                      <p className='mb-4 line-clamp-3 text-gray-300 text-sm leading-relaxed'>
                        {post.excerpt}
                      </p>

                      {post.readTime && (
                        <div className='mb-4 flex items-center gap-2 text-gray-300 text-sm'>
                          <Clock className='h-3 w-3' />
                          <span>{post.readTime} read</span>
                        </div>
                      )}

                      <div className='inline-flex items-center gap-2 font-medium text-purple-400 transition-all hover:text-purple-300 group-hover:gap-3'>
                        <span>Read More</span>
                        <ArrowLeft className='h-4 w-4 rotate-180' />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mb-16 flex items-center justify-center gap-4'>
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}${selectedCategory ? `&category=${selectedCategory}` : ''}#categories`}
                    className='glass-card rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200 hover:border-white/30'
                  >
                    ← Previous
                  </Link>
                )}

                <div className='flex items-center gap-2'>
                  <span className='px-4 py-2 text-gray-300'>Page</span>
                  <span className='rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-bold text-white'>
                    {currentPage}
                  </span>
                  <span className='px-4 py-2 text-gray-300'>of {totalPages}</span>
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}${selectedCategory ? `&category=${selectedCategory}` : ''}#categories`}
                    className='glass-card rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200 hover:border-white/30'
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='glass-card mb-16 p-16 text-center'>
            <FileText className='mx-auto mb-6 h-16 w-16 text-gray-300' />
            <h3 className='mb-4 font-bold text-2xl text-white'>No Articles Found</h3>
            <p className='mx-auto mb-8 max-w-md text-gray-300'>
              We couldn't find any articles matching your criteria. Try browsing all posts or
              selecting a different category.
            </p>
            <Link
              href='/blog'
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white transition-shadow hover:shadow-lg'
            >
              <span>Browse All Posts</span>
            </Link>
          </div>
        )}

        {/* Newsletter CTA */}
        <CallToAction variant='newsletter' />
      </div>
    </div>
  );
}
