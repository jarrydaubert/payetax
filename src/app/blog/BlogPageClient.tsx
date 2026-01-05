// src/app/blog/BlogPageClient.tsx
'use client';

// Optimized Lucide imports (bypasses Turbopack tree-shaking issue with barrel exports)
// Generated via: node scripts/gen-lucide-imports.js
import BookOpen from 'lucide-react/dist/esm/icons/book-open.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useId, useMemo, useState } from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/atoms/EmptyState';
import { BlogSearch } from '@/components/molecules/BlogSearch';
import CallToAction from '@/components/molecules/CallToAction';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { IMAGE_SIZES } from '@/constants/images';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { BlogCategory, BlogPost } from '@/types/blog';

interface BlogPageClientProps {
  featuredPost: BlogPost | null;
  categories: BlogCategory[];
  allPosts: BlogPost[];
}

const PAGE_SIZE = 12;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function BlogPageClient({ featuredPost, categories, allPosts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const postsSectionId = useId();

  // Filter and paginate posts client-side
  const { filteredPosts, totalPages } = useMemo(() => {
    const filtered = selectedCategory
      ? allPosts.filter((post) => post.category === selectedCategory)
      : allPosts;
    return {
      filteredPosts: filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [allPosts, selectedCategory, currentPage]);

  const handleCategoryClick = useCallback(
    (categorySlug?: string) => {
      setSelectedCategory(categorySlug);
      setCurrentPage(1);

      // Track category filter usage
      trackEvent({
        action: 'blog_category_filter',
        category: 'blog',
        label: categorySlug || 'all',
        custom_data: {
          previous_category: selectedCategory || 'all',
          new_category: categorySlug || 'all',
        },
      });
    },
    [selectedCategory]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      document.getElementById(postsSectionId)?.scrollIntoView({ behavior: 'smooth' });

      // Track pagination usage
      trackEvent({
        action: 'blog_pagination',
        category: 'blog',
        label: `page_${page}`,
        value: page,
        custom_data: {
          previous_page: currentPage,
          new_page: page,
          total_pages: totalPages,
          category_filter: selectedCategory || 'all',
        },
      });
    },
    [currentPage, totalPages, selectedCategory, postsSectionId]
  );

  const handlePostClick = useCallback((post: BlogPost) => {
    trackEvent({
      action: 'blog_post_click',
      category: 'blog',
      label: post.slug,
      custom_data: {
        post_title: post.title,
        post_category: post.category,
        is_featured: false,
      },
    });
  }, []);

  const handleFeaturedPostClick = useCallback((post: BlogPost) => {
    trackEvent({
      action: 'blog_post_click',
      category: 'blog',
      label: post.slug,
      custom_data: {
        post_title: post.title,
        post_category: post.category,
        is_featured: true,
      },
    });
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative flex items-center justify-center py-16 md:py-20'>
        <div className='relative z-10 mx-auto max-w-5xl px-4 text-center'>
          {/* Main Heading */}
          <h1
            className={cn(
              'mx-auto mb-6 max-w-4xl font-bold text-foreground tracking-tight',
              TYPOGRAPHY.TEXT_4XL,
              'sm:text-5xl md:text-6xl'
            )}
          >
            TaxInsights
            <br />
            <span className='text-gradient'>by PayeTax</span>
          </h1>

          {/* Subtitle */}
          <p className={cn('mx-auto mb-10 max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
            UK Tax Guidance & Financial Insights. No jargon, just insights.
          </p>

          {/* Search */}
          <div className='relative z-50 mx-auto mb-8 max-w-md'>
            <BlogSearch posts={allPosts} />
          </div>

          {/* Features */}
          <div
            className={cn(
              'mt-8 flex flex-wrap items-center justify-center gap-8 text-muted-foreground',
              TYPOGRAPHY.TEXT_SM
            )}
          >
            {[`${allPosts.length} Articles`, 'Weekly Updates', 'Always Free'].map((feature) => (
              <div key={feature} className='flex items-center gap-2'>
                <div className='h-1.5 w-1.5 rounded-full bg-primary' />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='container mx-auto max-w-7xl px-4'>
        {/* Categories Filter */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            allPostsCount={allPosts.length}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />
        )}

        {/* Featured Post */}
        {featuredPost && !selectedCategory && currentPage === 1 && (
          <div className='mb-12 md:mb-16'>
            <h2
              className={cn('mb-6 text-center font-semibold text-foreground', TYPOGRAPHY.TEXT_XL)}
            >
              Featured Article
            </h2>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className='group block'
              onClick={() => handleFeaturedPostClick(featuredPost)}
            >
              <div className='overflow-hidden rounded-xl border-2 border-primary/30 bg-card transition-colors hover:border-primary/50'>
                <div className='grid items-center gap-6 md:grid-cols-2'>
                  {featuredPost.image && (
                    <div className='relative h-64 overflow-hidden md:h-80'>
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.imageAlt || featuredPost.title}
                        fill
                        sizes={IMAGE_SIZES.BLOG_HERO}
                        priority={true}
                        className='object-cover'
                      />
                    </div>
                  )}
                  <div className='p-6'>
                    <div className='mb-3 flex items-center gap-3 text-muted-foreground'>
                      <Badge variant='secondary' className='font-mono'>
                        {featuredPost.categoryData?.name || featuredPost.category}
                      </Badge>
                      <span className={TYPOGRAPHY.TEXT_SM}>
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                    </div>
                    <h3
                      className={cn(
                        'mb-3 font-bold text-foreground group-hover:text-primary',
                        TYPOGRAPHY.TEXT_2XL
                      )}
                    >
                      {featuredPost.title}
                    </h3>
                    <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_BASE)}>
                      {featuredPost.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div id={postsSectionId}>
          {filteredPosts.length > 0 ? (
            <>
              <div className='mb-12 grid gap-6 md:mb-16 md:grid-cols-2 lg:grid-cols-3'>
                {filteredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className='group block'
                    onClick={() => handlePostClick(post)}
                  >
                    <article className='h-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50'>
                      {post.image && (
                        <div className='relative h-48 overflow-hidden'>
                          <Image
                            src={post.image}
                            alt={post.imageAlt || post.title}
                            fill
                            sizes={IMAGE_SIZES.BLOG_THUMBNAIL}
                            loading='lazy'
                            className='object-cover'
                          />
                        </div>
                      )}

                      <div className='p-5'>
                        <div className='mb-3 flex items-center justify-between'>
                          <Badge
                            variant='secondary'
                            className={cn('font-mono', TYPOGRAPHY.TEXT_XS)}
                          >
                            {post.category}
                          </Badge>
                          <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>

                        <h3
                          className={cn(
                            'mb-2 font-bold text-foreground group-hover:text-primary',
                            TYPOGRAPHY.TEXT_LG
                          )}
                        >
                          {post.title}
                        </h3>

                        <p
                          className={cn(
                            'mb-3 line-clamp-2 text-muted-foreground',
                            TYPOGRAPHY.TEXT_SM
                          )}
                        >
                          {post.excerpt}
                        </p>

                        {post.readTime && (
                          <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                            {post.readTime}
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mb-16 flex items-center justify-center gap-4'>
                  {currentPage > 1 && (
                    <Button variant='outline' onClick={() => handlePageChange(currentPage - 1)}>
                      Previous
                    </Button>
                  )}

                  <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    Page {currentPage} of {totalPages}
                  </span>

                  {currentPage < totalPages && (
                    <Button variant='outline' onClick={() => handlePageChange(currentPage + 1)}>
                      Next
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <Empty className='mb-16 border bg-card'>
              <EmptyMedia variant='icon'>
                <Search />
              </EmptyMedia>
              <EmptyTitle>No Articles Found</EmptyTitle>
              <EmptyDescription>
                We couldn't find any articles matching your criteria. Try browsing all posts or
                selecting a different category.
              </EmptyDescription>
              <EmptyContent>
                <Button onClick={() => handleCategoryClick(undefined)}>
                  <BookOpen className={`mr-2 ${ICON_SIZES.SIZE_5}`} aria-hidden='true' />
                  Browse All Posts
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className='mb-16'>
          <CallToAction variant='newsletter' />
        </div>
      </div>
    </div>
  );
}
