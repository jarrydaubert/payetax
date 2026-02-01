// src/app/blog/[slug]/page.tsx

import { ArrowLeft, Calendar, ChevronRight, Clock, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { BlogDisclaimer } from '@/components/molecules/BlogDisclaimer';
import { ReadingProgress } from '@/components/molecules/ReadingProgress';
import { TableOfContents } from '@/components/organisms/TableOfContents';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { BLUR_DATA_URL, IMAGE_SIZES } from '@/constants/images';
import { getBlogPostBySlug, getBlogPosts, getRelatedPosts } from '@/lib/blog';
import { compileMDXContent, extractFAQs } from '@/lib/mdx';
import { LOGO_URL, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

// Cache blog post fetch to deduplicate calls between generateMetadata and page component
const getCachedBlogPost = cache((slug: string) => getBlogPostBySlug(slug));

/** Normalize image URL - handles both relative and absolute paths */
function getAbsoluteImageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.startsWith('http') ? image : `${SITE_URL}${image}`;
}

// Next.js 16: Route segment config for optimized blog posts
export const dynamic = 'force-static'; // Static generation with ISR
export const dynamicParams = true; // Unknown slugs generated on-demand (not just at build time)
export const revalidate = 86400; // ISR: Revalidate every 24 hours for fresh tax content

// Generate static params for blog posts at build time
// Note: With dynamicParams=true, slugs not in this list are generated on-demand
export async function generateStaticParams() {
  const posts = await getBlogPosts({ pageSize: 1000 }); // Cap at 1000; beyond this uses on-demand generation
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getCachedBlogPost(resolvedParams.slug);

  if (!post) {
    return { title: 'Post Not Found | PayeTax Blog' };
  }

  // Normalize image URL once for consistent usage
  const imageUrl = getAbsoluteImageUrl(post.image);

  return {
    // Use seoTitle for shorter, optimized title tags (avoids SEO title length issues)
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords?.join(', '),
    alternates: {
      canonical: `${SITE_URL}/blog/${resolvedParams.slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      siteName: 'TaxInsights by PayeTax',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: imageUrl ? [{ url: imageUrl, alt: post.imageAlt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getCachedBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Compile MDX content (returns function component)
  const MDXContent = await compileMDXContent(post.content);

  // Get related posts
  const relatedPosts = await getRelatedPosts(post, 3);

  // Extract FAQs from content for schema.org FAQPage markup
  const faqs = extractFAQs(post.content);

  // Calculate word count from content (strip markdown/HTML for accurate count)
  const plainText = post.content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Replace links with text
    .replace(/[#*_~>\-|]/g, '') // Remove markdown symbols
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  // Normalize image URL for consistent usage across metadata and JSON-LD
  const imageUrl = getAbsoluteImageUrl(post.image);

  // Generate Article structured data for SEO
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.seoKeywords?.join(', '),
    inLanguage: 'en-GB',
    wordCount,
    articleSection: post.category || 'Tax Tips',
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  // FAQ structured data for rich snippets (only if FAQs exist)
  const faqStructuredData =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* Structured Data */}
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      {/* FAQ Schema for rich snippets (conditionally rendered) */}
      {faqStructuredData && (
        <script
          type='application/ld+json'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      <ReadingProgress />
      <div className='min-h-screen pt-20 md:pt-24'>
        {/* Clean, seamless container - wider on xl for sidebar TOC */}
        <div className='container mx-auto max-w-4xl px-4 pb-12 md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl 2xl:max-w-7xl'>
          {/* Breadcrumb Navigation */}
          <nav aria-label='Breadcrumb' className={cn('mb-8', TYPOGRAPHY.TEXT_SM)}>
            <ol className='flex flex-wrap items-center gap-1 text-muted-foreground'>
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className={ICON_SIZES.SIZE_4} aria-hidden='true' />
              </li>
              <li>
                <Link href='/blog' className='hover:text-primary'>
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className={ICON_SIZES.SIZE_4} aria-hidden='true' />
              </li>
              <li className='truncate text-foreground' aria-current='page'>
                {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
              </li>
            </ol>
          </nav>

          {/* Article */}
          <article>
            {/* Header */}
            <header className='mb-8 md:mb-12'>
              {/* Category & Tags */}
              <div className='mb-4 flex flex-wrap items-center gap-2'>
                <span
                  className={cn(
                    'rounded-full bg-primary/10 px-3 py-1 font-medium text-primary',
                    TYPOGRAPHY.TEXT_XS,
                  )}
                >
                  {post.categoryData?.name || post.category}
                </span>
                {post.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full bg-foreground/5 px-2.5 py-1 text-foreground/70',
                      TYPOGRAPHY.TEXT_XS,
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1
                className={cn(
                  'mb-4 font-bold text-foreground leading-tight md:mb-6',
                  TYPOGRAPHY.TEXT_4XL,
                  'md:text-5xl',
                )}
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              <p
                className={cn(
                  'mb-6 text-foreground/80 leading-relaxed md:mb-8',
                  TYPOGRAPHY.TEXT_LG,
                  'md:text-xl',
                )}
              >
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div
                className={cn(
                  'flex flex-wrap items-center gap-4 text-foreground/60 md:gap-6',
                  TYPOGRAPHY.TEXT_SM,
                )}
              >
                <div className='flex items-center gap-2'>
                  <Calendar className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                  <time>{formatDate(post.publishedAt)}</time>
                </div>
                {post.readTime && (
                  <div className='flex items-center gap-2'>
                    <Clock className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                    <span>{post.readTime}</span>
                  </div>
                )}
                {post.author && (
                  <div className='flex items-center gap-2'>
                    <User className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                    <span>{post.author}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Hero Image */}
            {post.image && (
              <div className='relative -mx-4 mb-8 aspect-video overflow-hidden md:-mx-6 md:mb-12 md:rounded-xl lg:-mx-8'>
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  sizes={IMAGE_SIZES.POST_HERO}
                  className='object-cover'
                  priority={!post.image.includes('placeholder')}
                  placeholder='blur'
                  blurDataURL={BLUR_DATA_URL}
                />
              </div>
            )}

            {/* Content with sidebar TOC on desktop */}
            <div className='relative xl:flex xl:gap-12'>
              {/* Table of Contents - sticky sidebar on xl screens */}
              <TableOfContents content={post.content} className='w-56 shrink-0' />

              {/* Article Content - clean prose styling */}
              <div
                className={cn(
                  'prose prose-lg dark:prose-invert min-w-0 max-w-none flex-1',
                  // Improved typography for desktop readability
                  'prose-headings:font-bold prose-headings:text-foreground',
                  'prose-p:text-foreground/90 prose-p:leading-relaxed',
                  'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                  'prose-strong:font-semibold prose-strong:text-foreground',
                  'prose-ol:text-foreground/90 prose-ul:text-foreground/90',
                  'prose-li:marker:text-primary/60',
                  'prose-blockquote:border-primary/30 prose-blockquote:text-foreground/80',
                  'prose-code:rounded prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary prose-code:before:content-none prose-code:after:content-none',
                  'prose-pre:border prose-pre:border-foreground/10 prose-pre:bg-foreground/5',
                  'md:prose-xl',
                )}
              >
                <MDXContent />
              </div>
            </div>

            {/* Financial Disclaimer - Required for HMRC compliance */}
            <BlogDisclaimer className='mt-12 md:mt-16' />

            {/* CTA Section */}
            <div className='mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='mb-2 font-semibold text-foreground'>Found this helpful?</h3>
                  <p className={cn('text-foreground/70', TYPOGRAPHY.TEXT_SM)}>
                    Try our free UK tax calculator to see how much you&apos;ll take home.
                  </p>
                </div>
                <Button asChild className='shrink-0'>
                  <Link href='/'>
                    Calculate Your Tax
                    <ArrowLeft
                      className={cn('ml-2 rotate-180', ICON_SIZES.SIZE_4)}
                      aria-hidden='true'
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className='mt-12 border-foreground/10 border-t pt-12 md:mt-16 md:pt-16'>
              <h2 className={cn('mb-6 font-bold text-foreground md:mb-8', TYPOGRAPHY.TEXT_2XL)}>
                Related Articles
              </h2>
              <div className='grid gap-6 md:grid-cols-3'>
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className='group rounded-lg border border-foreground/10 p-5 transition-all hover:border-primary/30 hover:bg-primary/5'
                  >
                    <div className={cn('mb-2 text-primary', TYPOGRAPHY.TEXT_SM)}>
                      {relatedPost.category}
                    </div>
                    <h3
                      className={cn(
                        'mb-2 font-semibold text-foreground transition-colors group-hover:text-primary',
                        TYPOGRAPHY.TEXT_BASE,
                      )}
                    >
                      {relatedPost.title}
                    </h3>
                    <p className={cn('mb-3 line-clamp-2 text-foreground/60', TYPOGRAPHY.TEXT_SM)}>
                      {relatedPost.excerpt}
                    </p>
                    <div
                      className={cn(
                        'flex items-center gap-3 text-foreground/50',
                        TYPOGRAPHY.TEXT_XS,
                      )}
                    >
                      {relatedPost.readTime && (
                        <div className='flex items-center gap-1'>
                          <Clock className={ICON_SIZES.SIZE_3_5} aria-hidden='true' />
                          <span>{relatedPost.readTime}</span>
                        </div>
                      )}
                      <time>{formatDate(relatedPost.publishedAt)}</time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer Navigation */}
          <div className='mt-12 flex justify-center border-foreground/10 border-t pt-8'>
            <Link
              href='/blog'
              className='inline-flex items-center font-medium text-primary transition-colors hover:text-primary/80'
            >
              <ArrowLeft className={cn('mr-2', ICON_SIZES.SIZE_4)} aria-hidden='true' />
              Back to All Posts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
