// src/app/blog/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllPostsGrid } from '@/components/organisms/AllPostsGrid';
import { EditorsPicksSticky } from '@/components/organisms/EditorsPicks';
import { LatestArticles } from '@/components/organisms/LatestArticles';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { StructuredData } from '@/components/organisms/StructuredData';
import { POSTS_PER_PAGE } from '@/constants/blogCategories';
import {
  getBlogCategories,
  getBlogPosts,
  getBlogPostsCount,
  getEditorsPicks,
  getLatestPosts,
} from '@/lib/blog';
import { generateMetadata as generateMetadataHelper, LOGO_URL, SITE_URL } from '@/lib/metadata';

// ⚠️ CRITICAL: DO NOT CHANGE THIS CONFIGURATION WITHOUT TESTING
// This config has been carefully tuned for Next.js 15/16 compatibility
// History: force-static broke query params, force-dynamic caused hydration issues
// Current config (dynamicParams: true + revalidate) is the ONLY working solution
// See: BLOG-NAVIGATION-FIX.md for full explanation and testing requirements
// Last verified working: November 13, 2025
// Tests to run before changing: npx playwright test e2e/blog-filtering-pagination.spec.ts
export const revalidate = 3600; // ISR: Revalidate every hour for new posts
export const dynamicParams = true; // Allow dynamic search params - REQUIRED for filtering/pagination

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * Dynamic metadata with self-referential canonical URLs
 * Per spec: Each ?page=N gets its own canonical to prevent de-indexing
 */
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const totalPosts = await getBlogPostsCount();
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const isOutOfRange = page > totalPages;
  const canonicalPage = isOutOfRange ? 1 : page;

  // Self-referential canonical URL path (page 1 = /blog, page 2+ = /blog?page=N)
  const canonicalPath = canonicalPage > 1 ? `/blog?page=${canonicalPage}` : '/blog';

  // Note: rel="prev/next" link hints removed - Next.js `other` field outputs <meta> not <link>
  // If needed in future, use a custom <head> component to render actual <link> tags

  const title =
    page > 1 ? `TaxInsights by PayeTax | Page ${page}` : 'TaxInsights by PayeTax | UK Tax Guidance';
  const description =
    'Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights for 2025-26. Clear explanations, no jargon.';
  const metadata = generateMetadataHelper({
    title,
    description,
    keywords:
      'TaxInsights, UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips',
    pathname: canonicalPath,
    noIndex: isOutOfRange,
    ogImage: '/images/blog/taxinsights-og.jpg',
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      description:
        'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, self-assessment guides, and practical financial insights.',
      siteName: 'TaxInsights by PayeTax',
    },
    twitter: {
      ...metadata.twitter,
      description:
        'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, and practical financial insights.',
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  // Fetch all data in parallel
  const [editorsPicks, totalPosts, latestPosts, categories] = await Promise.all([
    getEditorsPicks(5), // For sidebar
    getBlogPostsCount(), // Total count for pagination
    getLatestPosts(5), // For latest articles section
    getBlogCategories(),
  ]);
  const nonEmptyCategories = categories.filter((category) => (category.count ?? 0) > 0);

  // Get paginated posts for All Posts section
  const paginatedPosts = await getBlogPosts({
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
  });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (currentPage > Math.max(1, totalPages)) {
    notFound();
  }

  // Get all posts for structured data (limited to 10)
  const recentPosts = await getBlogPosts({ pageSize: 10 });

  // Generate structured data for blog index
  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'TaxInsights by PayeTax',
    description:
      'Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    blogPost: recentPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      image: post.image
        ? `${SITE_URL}${post.image.startsWith('/') ? post.image : `/${post.image}`}`
        : `${SITE_URL}/images/og-image.png`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Organization',
        name: 'PayeTax',
      },
    })),
  };

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogStructuredData).replace(/<\/script/gi, '<\\/script'),
        }}
      />
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
        ]}
      />

      {/* Blog layout */}
      <div className='min-h-screen bg-background'>
        {/* Header: H1 + Category Filters */}
        <div className='container mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8'>
          <div className='max-w-3xl'>
            <p className='mb-3 font-semibold text-primary/90 text-xs uppercase tracking-[0.28em] sm:mb-4'>
              TaxInsights by PayeTax
            </p>
            <h1 className='max-w-[14ch] font-bold font-display text-3xl text-foreground leading-tight sm:max-w-none sm:text-4xl'>
              UK Tax Guides &amp; PAYE Insights
            </h1>
            <p className='mt-3 max-w-2xl text-muted-foreground text-sm leading-6 sm:mt-4 sm:text-base'>
              Clear UK tax explainers, financial-year updates, and practical guides that point
              readers back to the right calculator or tool.
            </p>
          </div>

          {/* Category Filters */}
          <nav aria-label='Browse blog categories' className='mt-6 mb-8 sm:mt-8 sm:mb-10'>
            <ul className='flex flex-wrap gap-2 sm:gap-3'>
              <li>
                <Link
                  href='/blog'
                  aria-current='page'
                  className='block rounded-full border border-primary/70 bg-primary/15 px-3.5 py-2 text-center font-medium text-primary text-sm shadow-[0_0_0_1px_rgba(96,165,250,0.12)] sm:px-4'
                >
                  All Articles
                </Link>
              </li>
              {[...nonEmptyCategories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/blog/category/${category.slug}`}
                      className='block rounded-full border border-border/70 bg-card/80 px-3.5 py-2 text-center text-foreground text-sm transition hover:border-primary/50 hover:bg-card hover:text-foreground sm:px-4'
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        {/* Latest Articles + Editor's Picks Sidebar */}
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-6 sm:gap-8 lg:grid-cols-[1fr_300px]'>
            <div>
              <LatestArticles posts={latestPosts} />
            </div>
            <div className='hidden lg:block'>
              <EditorsPicksSticky posts={editorsPicks} />
            </div>
          </div>

          {/* Mobile Editor's Picks */}
          <div className='mt-8 sm:mt-12 lg:hidden'>
            <EditorsPicksSticky posts={editorsPicks} />
          </div>
        </div>

        {/* All Posts — paginated grid */}
        <div className='border-border/60 border-t'>
          <AllPostsGrid
            posts={paginatedPosts}
            currentPage={currentPage}
            totalPages={totalPages}
            totalPosts={totalPosts}
          />
        </div>

        {/* Newsletter CTA */}
        <div className='container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <NewsletterCTA className='mx-auto max-w-4xl' />
        </div>
      </div>
    </>
  );
}
