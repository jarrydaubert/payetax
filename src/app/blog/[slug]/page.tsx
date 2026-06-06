import { ArrowLeft, Calendar, ChevronRight, Clock, RefreshCw, User } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { BlogDisclaimer } from '@/components/molecules/BlogDisclaimer';
import { ReadingProgress } from '@/components/molecules/ReadingProgress';
import { TrackedNavigationLink } from '@/components/molecules/TrackedNavigationLink';
import { BlogArticleAnalytics } from '@/components/organisms/BlogArticleAnalytics';
import { StructuredData } from '@/components/organisms/StructuredData';
import { TableOfContents } from '@/components/organisms/TableOfContents';
import { Button } from '@/components/ui/button';
import { BLUR_DATA_URL, IMAGE_SIZES } from '@/constants/images';
import { getBlogPostBySlug, getBlogPosts, getRelatedPosts } from '@/lib/blog';
import { compileMDXContent, extractFAQs, extractHowToSteps } from '@/lib/mdx';
import { generateMetadata as generateMetadataHelper, LOGO_URL, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

// Cache blog post fetch to deduplicate calls between generateMetadata and page component
const getCachedBlogPost = cache((slug: string) => getBlogPostBySlug(slug));

interface InternalToolLink {
  id: string;
  href: Route | { pathname: Route; hash: string };
  title: string;
  description: string;
}

const BASE_INTERNAL_LINKS: InternalToolLink[] = [
  {
    id: 'paye-calculator',
    href: { pathname: '/', hash: 'tax-calculator' },
    title: 'PAYE Calculator',
    description: 'Estimate your take-home pay in seconds.',
  },
  {
    id: 'director-intelligence',
    href: '/tools/director-guide',
    title: 'Director Intelligence',
    description: 'Compare salary and dividend strategies.',
  },
  {
    id: 'compliance',
    href: '/compliance',
    title: 'Compliance & Methodology',
    description: 'See assumptions, limitations, and policy references.',
  },
];

const CONTEXTUAL_INTERNAL_LINKS: Array<{
  matcher: RegExp;
  link: InternalToolLink;
}> = [
  {
    matcher: /\bscottish|scotland\b/i,
    link: {
      id: 'scottish-calculator',
      href: '/tools/scottish-tax-calculator',
      title: 'Scottish Tax Calculator',
      description: 'Use Scottish bands for accurate estimates.',
    },
  },
  {
    matcher: /\bnational insurance\b|\bni\b/i,
    link: {
      id: 'ni-calculator',
      href: '/tools/national-insurance-calculator',
      title: 'National Insurance Calculator',
      description: 'See employee and employer NI breakdowns.',
    },
  },
  {
    matcher: /\bmarriage allowance\b/i,
    link: {
      id: 'marriage-allowance-calculator',
      href: '/tools/marriage-allowance-calculator',
      title: 'Marriage Allowance Calculator',
      description: 'Check eligibility and estimated savings.',
    },
  },
  {
    matcher: /\btax code\b/i,
    link: {
      id: 'tax-code-decoder',
      href: '/tools/tax-code-decoder',
      title: 'Tax Code Decoder',
      description: 'Understand what your tax code means.',
    },
  },
];

function getInternalToolLinks(post: {
  title: string;
  excerpt: string;
  tags?: string[];
}): InternalToolLink[] {
  const sourceText = `${post.title} ${post.excerpt} ${(post.tags ?? []).join(' ')}`.toLowerCase();
  const links = [...BASE_INTERNAL_LINKS];

  for (const { matcher, link } of CONTEXTUAL_INTERNAL_LINKS) {
    if (matcher.test(sourceText)) {
      links.push(link);
    }
  }

  const uniqueLinks = links.filter(
    (link, index, arr) => arr.findIndex((candidate) => candidate.id === link.id) === index,
  );

  return uniqueLinks.slice(0, 4);
}

function getAbsoluteImageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.startsWith('http') ? image : `${SITE_URL}${image}`;
}

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts({ pageSize: 1000 });
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

  const imageUrl = getAbsoluteImageUrl(post.image);
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const pathname = `/blog/${resolvedParams.slug}`;
  const metadata = generateMetadataHelper({
    title,
    description,
    pathname,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.author ? [post.author] : undefined,
    section: post.categoryData?.name || post.category,
    tags: post.tags,
    ...(imageUrl ? { ogImage: imageUrl } : {}),
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      siteName: 'TaxInsights by PayeTax',
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

function hasVisibleUpdateDate(publishedAt: string, updatedAt?: string): boolean {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() > new Date(publishedAt).getTime();
}

function stripHtmlTags(input: string): string {
  let output = '';
  let insideTag = false;

  for (const char of input) {
    if (char === '<') {
      insideTag = true;
      continue;
    }

    if (char === '>') {
      insideTag = false;
      continue;
    }

    if (!insideTag) {
      output += char;
    }
  }

  return output;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getCachedBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const mdxContent = await compileMDXContent(post.content, {
    slug: post.slug,
    updatedAt: post.updatedAt || post.publishedAt,
  });

  const relatedPosts = await getRelatedPosts(post, 3);

  const faqs = extractFAQs(post.content);

  const howToSteps = extractHowToSteps(post.content);

  // Strip markdown and HTML before counting words.
  const plainText = stripHtmlTags(
    post.content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*_~>\-|]/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const imageUrl = getAbsoluteImageUrl(post.image) ?? LOGO_URL;

  const authorName =
    post.author && post.author !== 'PayeTax Team' ? post.author : 'PayeTax Editorial Team';
  const showUpdatedDate = hasVisibleUpdateDate(post.publishedAt, post.updatedAt);
  const internalToolLinks = getInternalToolLinks(post);

  const articleData = {
    title: post.title,
    description: post.seoDescription || post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    imageUrl,
    publishDate: post.publishedAt,
    modifiedDate: post.updatedAt || post.publishedAt,
    authorName,
    wordCount,
    articleSection: post.category || 'Tax Tips',
  };

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ];

  const howToData =
    howToSteps.length > 0
      ? ({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: post.title,
          description: post.seoDescription || post.excerpt,
          ...(imageUrl ? { image: [imageUrl] } : {}),
          step: howToSteps.map((step) => ({
            '@type': 'HowToStep' as const,
            name: step.name,
            text: step.text,
          })),
        } as const)
      : null;

  return (
    <>
      <StructuredData type='article' articleData={articleData} />
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      {faqs.length > 0 && <StructuredData type='faq' faqs={faqs} />}
      {howToData && <StructuredData type='howto' data={howToData} />}
      <BlogArticleAnalytics slug={post.slug} category={post.categoryData?.name || post.category} />

      <ReadingProgress />
      <div className='min-h-screen bg-ledger-grid pt-20 md:pt-24'>
        <div className='container mx-auto max-w-4xl px-4 pb-12 md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl 2xl:max-w-7xl'>
          <nav aria-label='Breadcrumb' className={cn('mb-8', 'text-sm')}>
            <ol className='flex flex-wrap items-center gap-1 text-muted-foreground'>
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className={'size-4'} aria-hidden='true' />
              </li>
              <li>
                <Link href='/blog' className='hover:text-primary'>
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className={'size-4'} aria-hidden='true' />
              </li>
              <li className='truncate text-foreground' aria-current='page'>
                {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
              </li>
            </ol>
          </nav>

          <article>
            <header className='mb-8 md:mb-12'>
              <div className='mb-4 flex flex-wrap items-center gap-2'>
                <span
                  className={cn(
                    'border border-primary/35 bg-background px-3 py-1 font-medium text-primary uppercase tracking-[0.2em]',
                    'text-xs',
                  )}
                >
                  {post.categoryData?.name || post.category}
                </span>
                {post.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'border border-border bg-card px-2.5 py-1 text-foreground/70',
                      'text-xs',
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1
                className={cn(
                  'mb-4 max-w-4xl font-display font-semibold text-foreground leading-[0.98] md:mb-6',
                  'text-4xl',
                  'md:text-5xl',
                )}
              >
                {post.title}
              </h1>

              <p
                className={cn(
                  'mb-6 text-foreground/80 leading-relaxed md:mb-8',
                  'text-lg',
                  'md:text-xl',
                )}
              >
                {post.excerpt}
              </p>

              <div
                className={cn(
                  'flex flex-wrap items-center gap-4 text-foreground/60 md:gap-6',
                  'text-sm',
                )}
              >
                <div className='flex items-center gap-2'>
                  <Calendar className={'size-4'} aria-hidden='true' />
                  <time>{formatDate(post.publishedAt)}</time>
                </div>
                {showUpdatedDate && post.updatedAt && (
                  <div className='flex items-center gap-2'>
                    <RefreshCw className={'size-4'} aria-hidden='true' />
                    <span>
                      Updated <time>{formatDate(post.updatedAt)}</time>
                    </span>
                  </div>
                )}
                {post.readTime && (
                  <div className='flex items-center gap-2'>
                    <Clock className={'size-4'} aria-hidden='true' />
                    <span>{post.readTime}</span>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <User className={'size-4'} aria-hidden='true' />
                  <span className='flex flex-col'>
                    <span>{authorName}</span>
                    {authorName === 'PayeTax Editorial Team' && (
                      <span className='text-xs'>
                        Calculations verified against official HMRC rates.
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </header>
            {post.image && (
              <div className='relative mb-8 aspect-video overflow-hidden border border-border md:mb-12'>
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
            <div className='relative xl:flex xl:gap-8'>
              <TableOfContents content={post.content} className='w-56 shrink-0' />

              <div
                className={cn(
                  'prose prose-lg dark:prose-invert min-w-0 max-w-none flex-1',
                  'prose-headings:font-display prose-headings:font-semibold prose-headings:text-foreground',
                  'prose-p:text-foreground/90 prose-p:leading-relaxed',
                  'prose-strong:font-semibold prose-strong:text-foreground',
                  'prose-ol:text-foreground/90 prose-ul:text-foreground/90',
                  'prose-li:marker:text-primary/60',
                  'prose-blockquote:border-0 prose-blockquote:p-0 prose-blockquote:not-italic',
                  'prose-table prose-thead:border-0 prose-tr:border-0',
                  'prose-td:p-0 prose-th:p-0 prose-td:align-middle prose-th:align-middle',
                  'prose-code:rounded prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary prose-code:before:content-none prose-code:after:content-none',
                  'prose-pre:border prose-pre:border-foreground/10 prose-pre:bg-foreground/5',
                  'md:prose-xl',
                )}
              >
                {mdxContent}
              </div>
            </div>
            <BlogDisclaimer className='mt-12 md:mt-16' />
            <section className='mt-8 border border-border bg-card p-6 md:p-8'>
              <h3 className='mb-2 font-display font-semibold text-2xl text-foreground'>
                Useful tools for this topic
              </h3>
              <p className={cn('mb-4 text-foreground/70', 'text-sm')}>
                Jump straight into calculators and guides relevant to what you just read.
              </p>
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {internalToolLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className='border border-border bg-background p-3 transition-colors hover:border-primary/55'
                  >
                    <p className='font-medium text-foreground'>{link.title}</p>
                    <p className={cn('text-foreground/70', 'text-xs')}>{link.description}</p>
                  </Link>
                ))}
              </div>
            </section>
            <div className='mt-8 border border-border bg-card p-6 md:p-8'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='mb-2 font-display font-semibold text-2xl text-foreground'>
                    Found this helpful?
                  </h3>
                  <p className={cn('text-foreground/70', 'text-sm')}>
                    Try our free UK tax calculator to see how much you&apos;ll take home.
                  </p>
                </div>
                <Button asChild className='shrink-0'>
                  <Link href='/'>
                    Calculate Your Tax
                    <ArrowLeft className={cn('ml-2 rotate-180', 'size-4')} aria-hidden='true' />
                  </Link>
                </Button>
              </div>
            </div>{' '}
          </article>

          {relatedPosts.length > 0 && (
            <section className='mt-12 border-foreground/10 border-t pt-12 md:mt-16 md:pt-16'>
              <h2
                className={cn(
                  'mb-6 font-display font-semibold text-foreground md:mb-8',
                  'text-2xl',
                )}
              >
                Related Articles
              </h2>
              <div className='grid gap-6 md:grid-cols-3'>
                {relatedPosts.map((relatedPost) => (
                  <TrackedNavigationLink
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    source='blog_related_articles'
                    target={relatedPost.slug}
                    destination={relatedPost.category}
                    className='group border border-border bg-card p-5 transition-colors hover:border-primary/55'
                  >
                    <div className={cn('mb-2 text-primary', 'text-sm')}>{relatedPost.category}</div>
                    <h3
                      className={cn(
                        'mb-2 font-semibold text-foreground transition-colors group-hover:text-primary',
                        'text-base',
                      )}
                    >
                      {relatedPost.title}
                    </h3>
                    <p className={cn('mb-3 line-clamp-2 text-foreground/60', 'text-sm')}>
                      {relatedPost.excerpt}
                    </p>
                    <div className={cn('flex items-center gap-3 text-foreground/50', 'text-xs')}>
                      {relatedPost.readTime && (
                        <div className='flex items-center gap-1'>
                          <Clock className={'size-3.5'} aria-hidden='true' />
                          <span>{relatedPost.readTime}</span>
                        </div>
                      )}
                      <time>{formatDate(relatedPost.publishedAt)}</time>
                    </div>
                  </TrackedNavigationLink>
                ))}
              </div>
            </section>
          )}

          <div className='mt-12 flex justify-center border-foreground/10 border-t pt-8'>
            <Link
              href='/blog'
              className='inline-flex items-center font-medium text-primary transition-colors hover:text-primary/80'
            >
              <ArrowLeft className={cn('mr-2', 'size-4')} aria-hidden='true' />
              Back to All Posts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
