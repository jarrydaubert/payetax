// src/app/blog/category/[slug]/page.tsx
/**
 * Category-specific blog page using local MDX blog system
 */

import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { ICON_SIZES } from '@/constants/designTokens';
import { IMAGE_SIZES } from '@/constants/images';
import { getBlogCategories, getBlogPosts, getBlogPostsCount } from '@/lib/blog';
import { categoryContent } from '@/lib/categoryContent';
import { formatDate } from '@/lib/utils'; // Now imported from shared utils

// Next.js 16: Route segment config for optimized category pages
export const dynamic = 'force-static'; // Pre-render all category pages at build time
export const dynamicParams = true; // Allow new categories to be created at runtime
export const revalidate = 3600; // ISR: Revalidate every hour for new posts in categories

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
    return { title: 'Category Not Found | TaxInsights by PayeTax' };
  }

  const title = `${category.name} | TaxInsights by PayeTax`;
  const description = `Expert guidance and articles on ${category.name.toLowerCase()} from TaxInsights. Clear UK tax advice with no jargon.`;

  return {
    title,
    description,
    keywords: `${category.name}, UK tax, tax guide, tax advice, PAYE, tax calculator, TaxInsights`,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'TaxInsights by PayeTax',
      url: `https://payetax.co.uk/blog/category/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://payetax.co.uk/blog/category/${slug}`,
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
          headline: `${category.name} - PayeTax Blog`,
          description: `Expert guides on ${category.name.toLowerCase()} for UK taxpayers. Official HMRC rates, practical examples, and tax planning for 2025-26.`,
          url: `https://payetax.co.uk/blog/category/${slug}`,
          author: {
            '@type': 'Organization',
            name: 'PayeTax',
            url: 'https://payetax.co.uk',
          },
        })}
      </Script>

      {/* Breadcrumbs */}
      <nav aria-label='Breadcrumbs' className='mb-8 text-muted-foreground text-small'>
        <ol className='flex items-center space-x-2'>
          <li>
            <Link href='/' className='hover:text-primary'>
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href='/blog' className='hover:text-primary'>
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className='text-primary'>{category.name}</li>
        </ol>
      </nav>

      {/* Header with Category Description */}
      <div className='mb-12'>
        <h1 className='mb-4 text-center font-bold text-title md:text-display'>
          {categoryContent[slug]?.title || `${category.name} Insights`}
        </h1>
        {categoryContent[slug] ? (
          <div className='mx-auto max-w-3xl'>
            <p className='mb-6 text-center text-foreground/90 text-lg leading-relaxed'>
              {categoryContent[slug].description}
            </p>
            <div className='flex flex-wrap justify-center gap-2'>
              {categoryContent[slug].keywords.map((keyword) => (
                <Badge key={keyword} variant='outline' className='text-sm'>
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className='mx-auto max-w-3xl text-center text-large text-muted-foreground'>
            Explore expert articles on {category.name.toLowerCase()} including UK tax updates,
            guidance, and practical advice.
          </p>
        )}
      </div>

      {/* Categories */}
      <div className='mb-12'>
        <h2 className='mb-6 font-bold text-subheading'>Categories</h2>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/blog'
            className='rounded-full border border-border bg-secondary px-4 py-2 font-medium text-foreground transition-colors hover:bg-accent'
          >
            All Posts
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                slug === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-secondary text-foreground hover:bg-accent'
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
                className='overflow-hidden rounded-lg border border-border bg-card shadow-md transition-shadow hover:shadow-lg'
              >
                {post.image && (
                  <Link href={`/blog/${post.slug}`} className='relative block h-48 overflow-hidden'>
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      className='object-cover transition-transform duration-300 hover:scale-105'
                      sizes={IMAGE_SIZES.BLOG_THUMBNAIL}
                    />
                  </Link>
                )}
                <div className='p-6'>
                  <div className='mb-3 flex items-center justify-between text-muted-foreground text-small'>
                    <span className='font-medium text-primary'>
                      {post.categoryData?.name || post.category}
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className='mb-3 font-bold text-xl'>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='text-foreground transition-colors hover:text-primary'
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className='mb-4 line-clamp-3 text-muted-foreground'>{post.excerpt}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-small'>{post.readTime}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='inline-flex items-center font-medium text-primary text-small hover:text-primary/80'
                    >
                      Read more
                      <ChevronRight className={`ml-1 ${ICON_SIZES.SIZE_3_5}`} aria-hidden='true' />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <p className='text-large text-muted-foreground'>
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
              className='rounded-md border border-border bg-secondary px-4 py-2 text-foreground transition-colors hover:bg-accent'
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
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
          {currentPage < totalPages && (
            <Link
              href={`/blog/category/${slug}?page=${currentPage + 1}`}
              className='rounded-md border border-border bg-secondary px-4 py-2 text-foreground transition-colors hover:bg-accent'
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* Additional SEO Content Section */}
      {categoryContent[slug] && posts.length > 0 && (
        <div className='mt-12 rounded-lg border border-border bg-card p-8'>
          <h2 className='mb-6 font-bold text-2xl'>About {category.name}</h2>
          <div className='prose prose-slate dark:prose-invert max-w-none'>
            <p className='mb-4 text-foreground/80 leading-relaxed'>
              Our {category.name.toLowerCase()} articles are written by tax experts and updated
              regularly to reflect the latest HMRC guidance and UK tax law changes. Whether you're
              looking for basic information or detailed guides on specific topics, you'll find
              comprehensive, easy-to-understand content that helps you navigate the UK tax system
              with confidence.
            </p>
            <p className='mb-4 text-foreground/80 leading-relaxed'>
              All information is based on official HMRC rates for the current tax year{' '}
              {new Date().getMonth() >= 3
                ? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                : `${new Date().getFullYear() - 1}/${new Date().getFullYear()}`}
              . We explain complex tax concepts in plain English, providing practical examples and
              actionable advice you can use immediately. Our goal is to help UK taxpayers understand
              their tax obligations, maximize their allowances, and make informed financial
              decisions.
            </p>
          </div>

          {/* Related Topics */}
          <div className='mt-8'>
            <h3 className='mb-4 font-bold text-xl'>Related Topics</h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {categories
                .filter((cat) => cat.slug !== slug)
                .slice(0, 4)
                .map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    className='rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-accent'
                  >
                    <h4 className='mb-2 font-semibold text-foreground'>{cat.name}</h4>
                    <p className='text-muted-foreground text-sm'>
                      {cat.count} {cat.count === 1 ? 'article' : 'articles'}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className='glass mt-12 rounded-lg p-6'>
        <h2 className='mb-3 font-bold text-xl'>Calculate Your UK Tax Now</h2>
        <p className='mb-4'>
          Use our free PAYE tax calculator to determine your take-home pay and plan your finances
          better. Includes all {new Date().getFullYear()}/{new Date().getFullYear() + 1} tax rates,
          National Insurance contributions, and student loan repayments.
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
