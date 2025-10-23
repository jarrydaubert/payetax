// src/app/blog/BlogPageClient.tsx
'use client';

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Search,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { IMAGE_SIZES } from '@/lib/constants/images';
import { Button } from '@/components/ui/button';
import CallToAction from '@/components/ui/CallToAction';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950'>
      {/* Animated background grid */}
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]' />

      {/* Gradient orbs */}
      <div className='pointer-events-none absolute top-0 right-1/4 h-96 w-96 bg-purple-500/20 opacity-20 blur-[120px]' />
      <div className='pointer-events-none absolute top-1/3 left-1/4 h-96 w-96 bg-cyan-500/20 opacity-20 blur-[120px]' />

      {/* Hero Section */}
      <section className='relative pt-20 pb-10 md:pt-32 md:pb-20'>
        <div className='container relative z-10 mx-auto max-w-7xl px-4'>
          <div className='text-center'>
            {/* Badge */}
            <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 backdrop-blur-xl'>
              <Zap className='size-5 text-purple-400' />
              <span className='bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold text-sm text-transparent'>
                by PayeTax
              </span>
            </div>

            {/* Main Heading */}
            <h1 className='mb-6 font-bold text-6xl leading-tight'>
              <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent'>
                TaxInsights
              </span>
            </h1>

            {/* Subtitle */}
            <p className='mx-auto mb-12 max-w-3xl text-foreground/70 text-lg leading-relaxed'>
              UK Tax Guidance & Financial Insights. No jargon, just insights.
            </p>

            {/* Category Badge */}
            {selectedCategory && (
              <div className='inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 backdrop-blur-xl'>
                <Tag className='size-4 text-cyan-400' />
                <span className='text-foreground/70 text-sm'>Viewing: </span>
                <span className='font-semibold text-cyan-400 text-sm'>
                  {categories.find((cat) => cat.slug === selectedCategory)?.name ||
                    selectedCategory}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className='container relative z-10 mx-auto max-w-7xl px-4'>
        {/* Stats Bar - 3D Glass Cards */}
        <div className='-mt-8 mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-3 md:mb-20 md:grid-cols-3 md:gap-6'>
          {[
            {
              icon: FileText,
              value: totalCount,
              label: 'Articles',
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              icon: TrendingUp,
              value: 'Weekly',
              label: 'Updates',
              gradient: 'from-cyan-500 to-blue-500',
            },
            {
              icon: Star,
              value: 'Free',
              label: 'Always',
              gradient: 'from-orange-500 to-yellow-500',
            },
          ].map((stat, _idx) => (
            <div
              key={stat.label}
              className='group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-8 text-center backdrop-blur-xl transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-border/60 md:hover:bg-card/70'
            >
              <div
                className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${stat.gradient} opacity-20 blur-3xl transition-opacity group-hover:opacity-30`}
              />
              <stat.icon className='relative mx-auto mb-4 size-10 text-purple-400' />
              <div className='relative mb-2 font-bold text-3xl text-foreground'>{stat.value}</div>
              <div className='relative text-muted-foreground text-sm'>{stat.label}</div>
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
              <Sparkles className='size-6 text-yellow-400' />
              <span className='bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text font-bold text-lg text-transparent'>
                Featured Article
              </span>
              <Sparkles className='size-6 text-yellow-400' />
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className='group block'>
              <div className='relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-yellow-500/50 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] md:p-12 md:hover:scale-[1.02]'>
                <div className='absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-orange-500/0 opacity-0 transition-opacity duration-500 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 group-hover:opacity-100' />

                <div className='relative grid items-center gap-8 md:grid-cols-2'>
                  <div>
                    <div className='mb-6 flex items-center gap-4'>
                      <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-2 font-bold font-mono text-black text-sm shadow-lg'>
                        FEATURED
                      </div>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Calendar className='size-4' />
                        <span className='text-sm'>{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                    </div>

                    <h2 className='mb-6 font-bold text-4xl text-foreground leading-tight transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text group-hover:text-transparent'>
                      {featuredPost.title}
                    </h2>

                    <p className='mb-8 text-foreground/70 text-lg leading-relaxed'>
                      {featuredPost.excerpt}
                    </p>

                    <div className='inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 font-semibold text-black shadow-lg transition-all duration-300 group-hover:gap-4 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]'>
                      <span>Read Article</span>
                      <ArrowRight className='size-5 transition-transform group-hover:translate-x-1' />
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
                    <article className='group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 active:scale-[1.02] md:hover:scale-105 md:hover:bg-card/70 md:hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'>
                      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:from-purple-500/10 group-hover:to-cyan-500/10 group-hover:opacity-100' />

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
                          <span className='rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 font-medium font-mono text-purple-300 text-xs'>
                            {post.category}
                          </span>
                          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                            <Calendar className='size-3' />
                            <span className='text-xs'>{formatDate(post.publishedAt)}</span>
                          </div>
                        </div>

                        <h3 className='mb-3 font-bold text-foreground text-xl leading-tight transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent'>
                          {post.title}
                        </h3>

                        <p className='mb-4 line-clamp-3 text-muted-foreground text-sm leading-relaxed'>
                          {post.excerpt}
                        </p>

                        {post.readTime && (
                          <div className='mb-4 flex items-center gap-2 text-muted-foreground text-sm'>
                            <Clock className='size-3' />
                            <span className='text-xs'>{post.readTime} read</span>
                          </div>
                        )}

                        <div className='inline-flex items-center gap-2 font-semibold text-purple-400 transition-all duration-300 group-hover:gap-3 group-hover:text-cyan-400'>
                          <span className='text-sm'>Read More</span>
                          <ArrowRight className='size-4' />
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination - Neon Style */}
            {totalPages > 1 && (
              <div className='mb-20'>
                <div className='mb-8 flex items-center justify-center gap-4'>
                  {currentPage > 1 && (
                    <Link
                      href={`/blog?page=${currentPage - 1}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                      className='rounded-full border border-border bg-card/50 px-6 py-3 font-medium text-foreground backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:bg-card/70'
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
                      className='rounded-full border border-border bg-card/50 px-6 py-3 font-medium text-foreground backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:bg-card/70'
                    >
                      Next →
                    </Link>
                  )}
                </div>

                {/* Additional Navigation Links for SEO */}
                <div className='flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-sm'>
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
          <Empty className='mb-20 border bg-card/50 backdrop-blur-xl'>
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
                  <BookOpen className='mr-2 size-5' />
                  Browse All Posts
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {/* Additional Content for Page 2+ (SEO) */}
        {currentPage > 1 && !selectedCategory && (
          <div className='mb-12 rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-xl'>
            <h2 className='mb-6 font-bold text-2xl text-foreground'>Browse Articles by Category</h2>
            <p className='mb-6 text-foreground/70'>
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
                  <p className='text-muted-foreground text-sm'>
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
