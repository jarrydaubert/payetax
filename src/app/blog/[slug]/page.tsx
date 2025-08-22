// src/app/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import PageContainer from '@/components/ui/PageContainer';
import ContentSection from '@/components/ui/ContentSection';
import BlogContent from '@/components/blog/BlogContent';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return { title: 'Post Not Found | ToolHubX Blog' };
  }

  return {
    title: `${post.title} | ToolHubX Blog`,
    description: post.excerpt,
    keywords: post.seoKeywords?.join(', '),
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: post.image ? [{ url: post.image, alt: post.imageAlt || post.title }] : undefined,
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

  return (
    <div className="pt-20">
      <PageContainer maxWidth="4xl" includeNavbarSpacing={false}>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-xs text-primary bg-primary/10 rounded-full font-medium">
                {post.categoryData?.name || post.category}
              </span>
              {post.tags && post.tags.length > 0 && (
                <>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs text-white/90 glass rounded-full">
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-6 text-sm text-white/90 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              )}
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              )}
            </div>

            {post.image && (
              <div className="relative h-96 rounded-xl overflow-hidden mb-8">
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <ContentSection glass className="mb-8">
            <BlogContent content={post.content} />
          </ContentSection>

          {/* Article Footer */}
          <div className="glass-card border border-foreground/10 mb-8">
            <div className="glass-card-inner p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Found this helpful?</h3>
                  <p className="text-sm text-white">
                    Try our free UK tax calculator to see how much you'll take home.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Calculate Your Tax
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="flex justify-center pt-8 border-t border-foreground/10">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Posts
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
