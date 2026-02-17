// src/app/blog/category/[slug]/page.tsx
/**
 * Category-specific blog page using local MDX blog system
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { POSTS_PER_PAGE } from '@/constants/blogCategories';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import { cn, formatDate } from '@/lib/utils';

// Cache categories fetch to deduplicate calls
const getCachedCategories = cache(() => getBlogCategories());

// Next.js 16: Route segment config
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCachedCategories();
  return categories
    .filter((category) => (category.count ?? 0) > 0)
    .map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Math.max(1, Number.parseInt(pageValue ?? '1', 10) || 1);
  const canonicalPath = page > 1 ? `/blog/category/${slug}?page=${page}` : `/blog/category/${slug}`;

  const categories = await getCachedCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return { title: 'Category Not Found | TaxInsights by PayeTax' };
  }

  const title = `${category.name} | TaxInsights by PayeTax`;
  const articleCount = category.count ?? 0;
  const description = `UK ${category.name.toLowerCase()} guides and PAYE explainers from TaxInsights by PayeTax. ${articleCount} ${articleCount === 1 ? 'article' : 'articles'} with practical HMRC-aligned advice.`;
  const metadata = generateMetadataHelper({
    title,
    description,
    keywords: `${category.name.toLowerCase()}, uk tax guides, paye guides, tax insights`,
    pathname: canonicalPath,
    ogImage: '/images/og-image.png',
    noIndex: articleCount === 0,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      siteName: 'TaxInsights by PayeTax',
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
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const currentPage = Math.max(1, Number.parseInt(pageValue ?? '1', 10) || 1);

  // Verify category exists
  const categories = await getCachedCategories();
  const category = categories.find((c) => c.slug === slug);
  const nonEmptyCategories = categories.filter((item) => (item.count ?? 0) > 0);
  if (!category) return notFound();

  // Fetch posts filtered by category
  const posts = await getBlogPosts({
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
    categories: [slug],
  });

  // Count total posts in this category
  const allPosts = await getBlogPosts({ categories: [slug], pageSize: 1000 });
  const totalCount = allPosts.length;
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  if (totalCount === 0) {
    return notFound();
  }

  // 404 if no posts and not first page
  if (posts.length === 0 && currentPage > 1) {
    return notFound();
  }

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
        name: category.name,
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
      <div className='border-slate-800 border-b bg-slate-900/50 py-12'>
        <div className='container mx-auto max-w-7xl px-4'>
          {/* Breadcrumbs */}
          <nav aria-label='Breadcrumbs' className='mb-6 text-slate-400 text-sm'>
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
              <li className='text-cyan-400'>{category.name}</li>
            </ol>
          </nav>

          <h1 className='mb-4 font-bold font-display text-3xl text-white md:text-4xl'>
            {category.name}
          </h1>
          <p className='max-w-2xl text-slate-300'>
            Expert articles on {category.name.toLowerCase()} including UK tax updates, guidance, and
            practical advice.
          </p>
          <p className='mt-2 text-slate-500 text-sm'>
            {totalCount} {totalCount === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className='border-slate-800 border-b'>
        <div className='container mx-auto max-w-7xl px-4 py-6'>
          <nav aria-label='Browse blog categories'>
            <ul className='grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
              <li>
                <Link
                  href='/blog'
                  className='block rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-center text-slate-200 text-sm transition hover:border-cyan-500/50 hover:text-white'
                >
                  All Articles
                </Link>
              </li>
              {[...nonEmptyCategories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/blog/category/${cat.slug}`}
                      aria-current={cat.slug === slug ? 'page' : undefined}
                      className={cn(
                        'block rounded-full border px-4 py-2 text-center text-sm transition',
                        cat.slug === slug
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-cyan-500/50 hover:text-white',
                      )}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
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
                <div className='mb-3 flex items-center gap-2 text-slate-400 text-xs'>
                  <span className='font-medium text-cyan-400'>
                    {post.categoryData?.name || post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className='mb-2 font-semibold text-white group-hover:text-cyan-400'>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className='mb-4 line-clamp-2 text-slate-400 text-sm'>{post.excerpt}</p>
                <time className='text-slate-500 text-xs' dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <p className='text-lg text-slate-400'>No articles found in this category yet.</p>
            <Link href='/blog' className='mt-4 inline-block text-cyan-400 hover:text-cyan-300'>
              ← Browse all articles
            </Link>
          </div>
        )}

        <NewsletterCTA
          className='mx-auto mt-10 max-w-4xl'
          title='Get Tax Articles in Your Inbox'
          description='Subscribe for new UK tax explainers, deadline reminders, and PAYE updates.'
        />

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
            <span className='px-4 py-2 text-slate-400 text-sm'>
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
