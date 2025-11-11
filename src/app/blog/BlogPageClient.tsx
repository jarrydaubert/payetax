// src/app/blog/BlogPageClient.tsx
'use client';

// Optimized Lucide imports (bypasses Turbopack tree-shaking issue with barrel exports)
// Generated via: node scripts/gen-lucide-imports.js
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js';
import BookOpen from 'lucide-react/dist/esm/icons/book-open.js';
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import FileText from 'lucide-react/dist/esm/icons/file-text.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import Star from 'lucide-react/dist/esm/icons/star.js';
import Tag from 'lucide-react/dist/esm/icons/tag.js';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GradientText } from '@/components/atoms/GradientText';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CallToAction from '@/components/ui/CallToAction';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { IMAGE_SIZES } from '@/constants/images';
import { cn } from '@/lib/utils';
import type { BlogCategory, BlogPost } from '@/types/blog';

interface BlogPageClientProps {
  posts: BlogPost[];
  featuredPost: BlogPost | null;
  categories: BlogCategory[];
  totalCount: number;
  allPostsCount: number;
  currentPage: number;
  selectedCategory?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function BlogPageClient({
  posts,
  featuredPost,
  categories,
  totalCount,
  allPostsCount,
  currentPage,
  selectedCategory,
}: BlogPageClientProps) {
  const totalPages = Math.ceil(totalCount / 9);
  const router = useRouter();

  const handleCategoryClick = (categorySlug?: string) => {
    if (categorySlug) {
      router.push(`/blog?category=${categorySlug}`, { scroll: false });
    } else {
      router.push('/blog', { scroll: false });
    }
  };

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 light:bg-white md:bg-gradient-to-br light:md:from-slate-50 md:from-slate-950 light:md:via-purple-50/30 md:via-purple-950/20 light:md:to-slate-100 md:to-slate-950'>
      {/* Animated background grid */}
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] md:opacity-100' />

      {/* Gradient orbs - hidden on mobile for better contrast */}
      <div className='pointer-events-none absolute top-0 right-1/4 hidden h-96 w-96 bg-primary/20 opacity-20 blur-[120px] md:block' />
      <div className='pointer-events-none absolute top-1/3 left-1/4 hidden h-96 w-96 bg-accent/20 opacity-20 blur-[120px] md:block' />

      {/* Hero Section */}
      <section className='relative pt-20 pb-10 md:pt-32 md:pb-20'>
        <div className='container relative z-10 mx-auto max-w-7xl px-4'>
          <div className='text-center'>
            {/* Badge */}
            <Badge
              variant='outline'
              className='mb-8 gap-2 border-primary/30 bg-primary/10 px-6 py-2.5 backdrop-blur-xl'
            >
              <Zap className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>by PayeTax</span>
            </Badge>

            {/* Main Heading */}
            <GradientText
              variant='brand-full'
              as='h1'
              className={cn('mb-6 font-bold leading-tight', TYPOGRAPHY.TEXT_6XL)}
            >
              TaxInsights
            </GradientText>

            {/* Subtitle */}
            <p
              className={cn(
                'mx-auto mb-12 max-w-3xl light:text-foreground/80 text-foreground/70 leading-relaxed light:md:text-foreground/70',
                TYPOGRAPHY.TEXT_LG
              )}
            >
              UK Tax Guidance & Financial Insights. No jargon, just insights.
            </p>

            {/* Category Badge */}
            {selectedCategory && (
              <Badge
                variant='outline'
                className='gap-2 border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-xl'
              >
                <Tag className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                <span className='text-foreground/70'>Viewing: </span>
                <span className='font-semibold'>
                  {categories.find((cat) => cat.slug === selectedCategory)?.name ||
                    selectedCategory}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className='container relative z-10 mx-auto max-w-7xl px-4'>
        {/* Stats Bar - 3D Glass Cards */}
        <div className='-mt-8 relative z-10 mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-3 md:mb-20 md:grid-cols-3 md:gap-6'>
          {[
            {
              icon: FileText,
              value: totalCount,
              label: 'Articles',
              gradient: 'from-primary to-accent',
            },
            {
              icon: TrendingUp,
              value: 'Weekly',
              label: 'Updates',
              gradient: 'from-accent to-primary',
            },
            {
              icon: Star,
              value: 'Free',
              label: 'Always',
              gradient: 'from-primary/80 to-accent/80',
            },
          ].map((stat, _idx) => (
            <div
              key={stat.label}
              className='group relative overflow-hidden rounded-2xl border border-border bg-card/50 light:bg-card p-8 text-center backdrop-blur-xl transition-all duration-300 active:scale-[1.02] light:md:bg-card/50 md:hover:scale-105 md:hover:border-border/60 md:hover:bg-card/70'
            >
              <div
                className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${stat.gradient} opacity-20 blur-3xl transition-opacity group-hover:opacity-30`}
              />
              <stat.icon className='relative mx-auto mb-4 size-10 text-primary' />
              <div className={cn('relative mb-2 font-bold text-foreground', TYPOGRAPHY.TEXT_3XL)}>
                {stat.value}
              </div>
              <div className={cn('relative text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            allPostsCount={allPostsCount}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />
        )}

        {/* Featured Post - Hero Card */}
        {featuredPost && !selectedCategory && currentPage === 1 && (
          <div className='mb-12 md:mb-20'>
            <div className='mb-8 flex items-center justify-center gap-3 text-center'>
              <Sparkles className={`${ICON_SIZES.SIZE_6} text-primary`} aria-hidden='true' />
              <GradientText
                variant='brand'
                as='span'
                className={cn('font-bold', TYPOGRAPHY.TEXT_LG)}
              >
                Featured Article
              </GradientText>
              <Sparkles className={`${ICON_SIZES.SIZE_6} text-primary`} aria-hidden='true' />
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className='group block'>
              <div className='relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-white/10 light:from-primary/5 light:to-accent/5 to-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-2xl md:p-12 md:hover:scale-[1.02]'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/10 group-hover:to-accent/10 group-hover:opacity-100' />

                <div className='relative grid items-center gap-8 md:grid-cols-2'>
                  <div>
                    <div className='mb-6 flex items-center gap-4'>
                      <Badge className='gap-2 bg-primary px-5 py-2 font-bold font-mono shadow-lg'>
                        FEATURED
                      </Badge>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Calendar className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                        <span className={TYPOGRAPHY.TEXT_SM}>
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                      </div>
                    </div>

                    <h2
                      className={cn(
                        'mb-6 font-bold text-foreground leading-tight',
                        TYPOGRAPHY.TEXT_4XL
                      )}
                    >
                      {featuredPost.title}
                    </h2>

                    <p
                      className={cn(
                        'mb-8 light:text-foreground/85 text-foreground/70 leading-relaxed light:md:text-foreground/70',
                        TYPOGRAPHY.TEXT_LG
                      )}
                    >
                      {featuredPost.excerpt}
                    </p>

                    <div className='inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all duration-300 group-hover:gap-4 group-hover:shadow-2xl'>
                      <span>Read Article</span>
                      <ArrowRight
                        className={`${ICON_SIZES.SIZE_5} transition-transform group-hover:translate-x-1`}
                        aria-hidden='true'
                      />
                    </div>
                  </div>

                  {featuredPost.image && (
                    <div className='relative h-80 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10'>
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.imageAlt || featuredPost.title}
                        fill
                        sizes={IMAGE_SIZES.BLOG_HERO}
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid - Glassmorphism Cards */}
        {posts.length > 0 ? (
          <>
            <div className='mb-12 grid gap-4 md:mb-20 md:grid-cols-2 md:gap-8 lg:grid-cols-3'>
              {posts.map((post) => (
                <div key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className='group block h-full'>
                    <article className='group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 light:bg-card backdrop-blur-xl transition-all duration-300 hover:border-primary/50 active:scale-[1.02] light:md:bg-card/50 md:hover:scale-105 md:hover:bg-card/70 md:hover:shadow-2xl'>
                      <div className='absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/10 group-hover:to-accent/10 group-hover:opacity-100' />

                      {post.image && (
                        <div className='relative h-48 overflow-hidden'>
                          <Image
                            src={post.image}
                            alt={post.imageAlt || post.title}
                            fill
                            sizes={IMAGE_SIZES.BLOG_THUMBNAIL}
                            className='object-cover transition-transform duration-500 group-hover:scale-110'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent' />
                        </div>
                      )}

                      <div className='relative p-4 md:p-6'>
                        <div className='mb-4 flex items-center justify-between'>
                          <Badge
                            variant='outline'
                            className={cn(
                              'border-primary/30 bg-primary/20 font-medium font-mono',
                              TYPOGRAPHY.TEXT_XS
                            )}
                          >
                            {post.category}
                          </Badge>
                          <div
                            className={cn(
                              'flex items-center gap-2 text-muted-foreground',
                              TYPOGRAPHY.TEXT_SM
                            )}
                          >
                            <Calendar className={ICON_SIZES.SIZE_3_5} aria-hidden='true' />
                            <span className={TYPOGRAPHY.TEXT_XS}>
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </div>

                        <h3
                          className={cn(
                            'mb-3 font-bold text-foreground leading-tight',
                            TYPOGRAPHY.TEXT_XL
                          )}
                        >
                          {post.title}
                        </h3>

                        <p
                          className={cn(
                            'mb-4 line-clamp-3 light:text-foreground/70 text-muted-foreground leading-relaxed light:md:text-muted-foreground',
                            TYPOGRAPHY.TEXT_SM
                          )}
                        >
                          {post.excerpt}
                        </p>

                        {post.readTime && (
                          <div
                            className={cn(
                              'mb-4 flex items-center gap-2 text-muted-foreground',
                              TYPOGRAPHY.TEXT_SM
                            )}
                          >
                            <Clock className={ICON_SIZES.SIZE_3_5} aria-hidden='true' />
                            <span className={TYPOGRAPHY.TEXT_XS}>{post.readTime} read</span>
                          </div>
                        )}

                        <div className='inline-flex items-center gap-2 font-semibold text-primary transition-all duration-300 group-hover:gap-3'>
                          <span className={TYPOGRAPHY.TEXT_SM}>Read More</span>
                          <ArrowRight className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination - Neon Style */}
            {totalPages > 1 && (
              <div className='relative z-20 mb-20'>
                <div className='mb-8 flex items-center justify-center gap-4'>
                  {currentPage > 1 && (
                    <Link
                      href={`/blog?page=${currentPage - 1}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                      className='rounded-full border border-border bg-card/50 light:bg-card px-6 py-3 font-medium text-foreground backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-500/50 light:md:bg-card/50 md:hover:bg-card/70'
                    >
                      ← Previous
                    </Link>
                  )}

                  <div className='flex items-center gap-3'>
                    <span className='text-muted-foreground'>Page</span>
                    <span className='rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2 font-bold font-mono text-foreground shadow-lg'>
                      {currentPage}
                    </span>
                    <span className='text-muted-foreground'>of {totalPages}</span>
                  </div>

                  {currentPage < totalPages && (
                    <Link
                      href={`/blog?page=${currentPage + 1}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                      className='rounded-full border border-border bg-card/50 light:bg-card px-6 py-3 font-medium text-foreground backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-500/50 light:md:bg-card/50 md:hover:bg-card/70'
                    >
                      Next →
                    </Link>
                  )}
                </div>

                {/* Additional Navigation Links for SEO */}
                <div
                  className={cn(
                    'flex flex-wrap items-center justify-center gap-4 text-muted-foreground',
                    TYPOGRAPHY.TEXT_SM
                  )}
                >
                  <Link href='/' className='transition-colors hover:text-purple-400'>
                    ← Back to Calculator
                  </Link>
                  <span>•</span>
                  <Link href='/blog' className='transition-colors hover:text-purple-400'>
                    All Articles
                  </Link>
                  <span>•</span>
                  <Link
                    href='/blog/category/tax-basics'
                    className='transition-colors hover:text-purple-400'
                  >
                    Tax Basics
                  </Link>
                  <span>•</span>
                  <Link
                    href='/blog/category/tax-tips'
                    className='transition-colors hover:text-purple-400'
                  >
                    Tax Tips
                  </Link>
                  <span>•</span>
                  <Link href='/about' className='transition-colors hover:text-purple-400'>
                    About Us
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <Empty className='mb-20 border bg-card/50 light:bg-card backdrop-blur-xl light:md:bg-card/50'>
            <EmptyMedia variant='icon'>
              <Search />
            </EmptyMedia>
            <EmptyTitle>No Articles Found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any articles matching your criteria. Try browsing all posts or
              selecting a different category.
            </EmptyDescription>
            <EmptyContent>
              <Button asChild size='lg'>
                <Link href='/blog'>
                  <BookOpen className={`mr-2 ${ICON_SIZES.SIZE_5}`} aria-hidden='true' />
                  Browse All Posts
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {/* Additional Content for Page 2+ (SEO) */}
        {currentPage > 1 && !selectedCategory && (
          <div className='mb-12 rounded-2xl border border-border bg-card/50 light:bg-card p-8 backdrop-blur-xl light:md:bg-card/50'>
            <h2 className={cn('mb-6 font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>
              Browse Articles by Category
            </h2>
            <p className='mb-6 light:text-foreground/80 text-foreground/70 light:md:text-foreground/70'>
              Explore our comprehensive collection of UK tax guides organized by topic. From
              understanding basic tax concepts to advanced strategies for reducing your tax bill, we
              cover everything you need to know about UK taxation.
            </p>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className='group rounded-lg border border-border bg-secondary p-6 transition-all duration-300 hover:border-purple-500/50 hover:bg-card/70 hover:shadow-lg'
                >
                  <h3 className='mb-2 font-bold text-foreground transition-colors group-hover:text-purple-400'>
                    {cat.name}
                  </h3>
                  <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    {cat.count} {cat.count === 1 ? 'article' : 'articles'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className='mb-20'>
          <CallToAction variant='newsletter' />
        </div>
      </div>
    </div>
  );
}
