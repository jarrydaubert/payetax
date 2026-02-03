// src/app/blog/page.tsx

import type { Metadata } from 'next';
import { BlogNav } from '@/components/molecules/BlogNav';
import { PullQuote } from '@/components/molecules/PullQuote';
import { AllPostsGrid } from '@/components/organisms/AllPostsGrid';
import { DeepDives } from '@/components/organisms/DeepDives';
import { EditorsPicksSticky } from '@/components/organisms/EditorsPicks';
import { LatestArticles } from '@/components/organisms/LatestArticles';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { POSTS_PER_PAGE } from '@/constants/blogCategories';
import { getCurrentQuote } from '@/constants/pullQuotes';
import {
  getBlogPosts,
  getBlogPostsCount,
  getDeepDives,
  getEditorsPicks,
  getLatestPosts,
} from '@/lib/blog';
import { LOGO_URL, SITE_URL } from '@/lib/metadata';

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

  // Self-referential canonical URL (page 1 = /blog, page 2+ = /blog?page=N)
  const canonicalUrl = page > 1 ? `${SITE_URL}/blog?page=${page}` : `${SITE_URL}/blog`;

  // Note: rel="prev/next" link hints removed - Next.js `other` field outputs <meta> not <link>
  // If needed in future, use a custom <head> component to render actual <link> tags

  const title =
    page > 1 ? `TaxInsights by PayeTax | Page ${page}` : 'TaxInsights by PayeTax | UK Tax Guidance';

  return {
    title,
    description:
      'Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights for 2025-26. Clear explanations, no jargon.',
    keywords:
      'TaxInsights, UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips, financial advice',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description:
        'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, self-assessment guides, and practical financial insights.',
      url: canonicalUrl,
      type: 'website',
      siteName: 'TaxInsights by PayeTax',
      images: [`${SITE_URL}/images/blog/taxinsights-og.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description:
        'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, and practical financial insights.',
      images: [`${SITE_URL}/images/blog/taxinsights-og.jpg`],
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  // Fetch all data in parallel for magazine layout
  const [editorsPicks, deepDives, totalPosts, latestPosts] = await Promise.all([
    getEditorsPicks(5), // For sidebar
    getDeepDives(6), // For deep dives section
    getBlogPostsCount(), // Total count for pagination
    getLatestPosts(5), // For latest articles section
  ]);

  // Get paginated posts for All Posts section
  const paginatedPosts = await getBlogPosts({
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
  });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Get current pull quote
  const pullQuote = getCurrentQuote();

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />

      {/* Magazine-style layout */}
      <div className='min-h-screen bg-slate-950'>
        {/* Main Content with Sidebar */}
        <div className='container mx-auto max-w-7xl px-4 py-12'>
          <h1 className='sr-only'>TaxInsights by PayeTax</h1>
          <div className='grid gap-8 lg:grid-cols-[1fr_300px]'>
            {/* Main Content Column */}
            <div className='space-y-12'>
              {/* Latest Articles */}
              <LatestArticles posts={latestPosts} />

              {/* Pull Quote */}
              <PullQuote text={pullQuote.text} attribution={pullQuote.attribution} />

              {/* Deep Dives */}
              <DeepDives posts={deepDives} />

              {/* Category Navigation - Below Deep Dives */}
              <div className='pt-4'>
                <BlogNav />
              </div>
            </div>

            {/* Sidebar - Editor's Picks (mt-12 aligns with Latest Articles content) */}
            <div className='hidden lg:mt-12 lg:block'>
              <EditorsPicksSticky posts={editorsPicks} />
            </div>
          </div>

          {/* Mobile Editor's Picks - Below main content */}
          <div className='mt-12 lg:hidden'>
            <EditorsPicksSticky posts={editorsPicks} />
          </div>
        </div>

        {/* All Posts Section - Server-side pagination */}
        <div className='border-slate-800 border-t'>
          <AllPostsGrid
            posts={paginatedPosts}
            currentPage={currentPage}
            totalPages={totalPages}
            totalPosts={totalPosts}
          />
        </div>

        {/* CTAs - Below All Posts */}
        <div className='container mx-auto max-w-7xl px-4 py-16'>
          {/* Newsletter CTA */}
          <NewsletterCTA />

          {/* Calculator CTA */}
          <div className='mt-8 text-center'>
            <p className='mb-4 text-slate-400'>Ready to see your exact take-home pay?</p>
            <a
              href='/'
              className='inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900/50 px-6 py-3 font-medium text-cyan-400 transition-all hover:border-cyan-500/50 hover:bg-slate-800/50'
            >
              Try the Free Calculator
              <svg
                className='size-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
