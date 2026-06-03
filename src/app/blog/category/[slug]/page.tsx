// src/app/blog/category/[slug]/page.tsx
/**
 * Category-specific blog page using local MDX blog system
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { StructuredData } from '@/components/organisms/StructuredData';
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

  return (
    <div className='min-h-screen bg-background'>
      {/* Structured Data */}
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: category.name, url: `${SITE_URL}/blog/category/${slug}` },
        ]}
      />
      <StructuredData
        type='itemlist'
        itemList={{
          listName: `${category.name} Articles`,
          listDescription: `UK tax guides in the ${category.name} category.`,
          items: posts.map((post, index) => ({
            name: post.title,
            url: `${SITE_URL}/blog/${post.slug}`,
            description: post.excerpt,
            position: index + 1,
          })),
        }}
      />

      {/* Header + Filters */}
      <div className='container mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8'>
        {/* Breadcrumbs */}
        <nav aria-label='Breadcrumbs' className='mb-4 text-muted-foreground text-sm'>
          <ol className='flex items-center gap-2'>
            <li>
              <Link href='/' className='hover:text-foreground'>
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href='/blog' className='hover:text-foreground'>
                Blog
              </Link>
            </li>
            <li>/</li>
            <li className='text-primary'>{category.name}</li>
          </ol>
        </nav>

        <div className='mb-6 flex items-baseline gap-3'>
          <h1 className='font-bold font-display text-3xl text-foreground md:text-4xl'>
            {category.name}
          </h1>
          <span className='text-muted-foreground text-sm'>
            {totalCount} {totalCount === 1 ? 'article' : 'articles'}
          </span>
        </div>

        {/* Category Filters */}
        <nav aria-label='Browse blog categories' className='mb-10'>
          <ul className='flex flex-wrap gap-2'>
            <li>
              <Link
                href='/blog'
                className='block rounded-full border border-border/70 bg-card/70 px-4 py-2 text-center text-foreground text-sm transition hover:border-primary/50 hover:text-foreground'
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
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border/70 bg-card/70 text-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      {/* Posts Grid */}
      <div className='container mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8'>
        {posts.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.id}
                className='group rounded-xl border border-border/60 bg-card/70 p-5 transition-colors hover:border-primary/50'
              >
                <div className='mb-3 flex items-center gap-2 text-muted-foreground text-xs'>
                  <span className='font-medium text-primary'>
                    {post.categoryData?.name || post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className='mb-2 font-semibold text-foreground group-hover:text-primary'>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className='mb-4 line-clamp-2 text-muted-foreground text-sm'>{post.excerpt}</p>
                <time className='text-muted-foreground text-xs' dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <p className='text-lg text-muted-foreground'>No articles found in this category yet.</p>
            <Link href='/blog' className='mt-4 inline-block text-primary hover:text-primary/90'>
              ← Browse all articles
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className='mt-12 flex items-center justify-center gap-2' aria-label='Pagination'>
            {currentPage > 1 && (
              <Link
                href={`/blog/category/${slug}?page=${currentPage - 1}`}
                className='rounded-lg border border-border/70 bg-card px-4 py-2 text-foreground text-sm hover:bg-card/80'
              >
                Previous
              </Link>
            )}
            <span className='px-4 py-2 text-muted-foreground text-sm'>
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/blog/category/${slug}?page=${currentPage + 1}`}
                className='rounded-lg border border-border/70 bg-card px-4 py-2 text-foreground text-sm hover:bg-card/80'
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
      <div className='container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'> </div>
    </div>
  );
}
