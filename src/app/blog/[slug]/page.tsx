// src/app/blog/[slug]/page.tsx

import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ContentSection from '@/components/ui/ContentSection';
import PageContainer from '@/components/ui/PageContainer';
import { IMAGE_SIZES } from '@/constants/images';
import { getBlogPostBySlug, getBlogPosts, getRelatedPosts } from '@/lib/blog';
import { compileMDXContent } from '@/lib/mdx';

// Next.js 16: Route segment config for optimized blog posts
export const dynamic = 'force-static'; // Pre-render all blog posts at build time
export const dynamicParams = true; // Allow new posts to be created at runtime
export const revalidate = 86400; // ISR: Revalidate every 24 hours for fresh tax content

// Generate static params for all blog posts at build time
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
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: 'Post Not Found | PayeTax Blog' };
  }

  return {
    // Use seoTitle for shorter, optimized title tags (avoids SEO title length issues)
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords?.join(', '),
    alternates: {
      canonical: `https://payetax.co.uk/blog/${resolvedParams.slug}`,
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
      images: post.image ? [{ url: post.image, alt: post.imageAlt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.image ? [post.image] : undefined,
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
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Compile MDX content (returns function component)
  const MDXContent = await compileMDXContent(post.content);

  // Get related posts
  const relatedPosts = await getRelatedPosts(post, 3);

  return (
    <div className='pt-16 md:pt-20'>
      <PageContainer maxWidth='4xl' includeNavbarSpacing={false}>
        {/* Header */}
        <div className='mb-6 md:mb-8'>
          <Link
            href='/blog'
            className='mb-6 inline-flex items-center text-primary transition-colors hover:text-primary/80'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article>
          <header className='mb-6 md:mb-8'>
            <div className='mb-4 flex items-center gap-2'>
              <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs'>
                {post.categoryData?.name || post.category}
              </span>
              {post.tags &&
                post.tags.length > 0 &&
                post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className='glass rounded-full px-2 py-1 text-foreground/90 text-xs'
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <h1 className='mb-6 font-bold text-4xl text-foreground leading-tight'>{post.title}</h1>

            <p className='mb-6 text-foreground/90 text-xl leading-relaxed'>{post.excerpt}</p>

            <div className='mb-8 flex items-center gap-6 text-foreground/90 text-sm'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              {post.readTime && (
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  <span>{post.readTime}</span>
                </div>
              )}
              {post.author && (
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  <span>{post.author}</span>
                </div>
              )}
            </div>

            {post.image && (
              <div className='relative mb-6 h-64 overflow-hidden rounded-xl md:mb-8 md:h-96'>
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  sizes={IMAGE_SIZES.POST_HERO}
                  className='object-cover'
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <ContentSection glass className='mb-6 md:mb-8'>
            <div className='prose prose-lg max-w-none'>
              <MDXContent />
            </div>
          </ContentSection>

          {/* Article Footer */}
          <div className='glass-card mb-8 border border-foreground/10'>
            <div className='glass-card-inner p-6'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='mb-2 font-semibold text-foreground'>Found this helpful?</h3>
                  <p className='text-foreground text-sm'>
                    Try our free UK tax calculator to see how much you'll take home.
                  </p>
                </div>
                <Button asChild>
                  <Link href='/'>
                    Calculate Your Tax
                    <ArrowLeft className='ml-2 h-4 w-4 rotate-180' />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className='mb-12'>
            <h2 className='mb-6 font-bold text-2xl text-foreground'>Related Articles</h2>
            <div className='grid gap-4 md:grid-cols-3 md:gap-6'>
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className='glass-card group border border-foreground/10 transition-all active:scale-[1.02] md:hover:border-primary/50'
                >
                  <div className='glass-card-inner p-6'>
                    <div className='mb-2 text-primary text-sm'>{relatedPost.category}</div>
                    <h3 className='mb-3 font-semibold text-foreground text-xl group-hover:text-primary'>
                      {relatedPost.title}
                    </h3>
                    <p className='mb-4 line-clamp-2 text-foreground/80 text-sm'>
                      {relatedPost.excerpt}
                    </p>
                    <div className='flex items-center gap-4 text-foreground/60 text-xs'>
                      {relatedPost.readTime && (
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <span>{relatedPost.readTime}</span>
                        </div>
                      )}
                      <time>{formatDate(relatedPost.publishedAt)}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className='flex justify-center border-foreground/10 border-t pt-8'>
          <Link
            href='/blog'
            className='inline-flex items-center font-medium text-primary hover:text-primary/80'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to All Posts
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
