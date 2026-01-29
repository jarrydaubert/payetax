// src/components/organisms/AllPostsGrid.tsx
/**
 * All Posts Grid - Server Component
 *
 * Displays paginated blog posts in a grid layout.
 * Uses server-side pagination for SEO-friendly URLs.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Image from 'next/image';
import Link from 'next/link';

import { BlogPagination } from '@/components/molecules/BlogPagination';
import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';
import { getCategoryBlurDataUrl, getCategoryFallbackSvg } from '@/lib/blog/imageFallback';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface AllPostsGridProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export function AllPostsGrid({ posts, currentPage, totalPages, totalPosts }: AllPostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className='py-16 text-center'>
        <p className='text-lg text-slate-400'>No articles found.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby='all-posts-heading' className='py-12'>
      <div className='container mx-auto max-w-7xl px-4'>
        {/* Section Header */}
        <div className='mb-8 flex items-center justify-between'>
          <h2
            id='all-posts-heading'
            className='font-display font-semibold text-white text-xl md:text-2xl'
          >
            All Articles
          </h2>
          <p className='text-slate-400 text-sm'>
            {totalPosts} article{totalPosts !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Posts Grid */}
        <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Pagination */}
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </section>
  );
}

interface PostCardProps {
  post: BlogPost;
}

function PostCard({ post }: PostCardProps) {
  const categoryKey = (post.category as CategoryKey) || 'tax-basics';
  const categoryConfig = BLOG_CATEGORIES[categoryKey] ?? BLOG_CATEGORIES['tax-basics'];

  const imageSrc = post.image ?? getCategoryFallbackSvg(categoryKey);
  const blurDataUrl = getCategoryBlurDataUrl(categoryKey);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5'
      )}
    >
      <Link href={`/blog/${post.slug}`} className='block'>
        {/* Image */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={post.imageAlt ?? post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            loading='lazy'
            placeholder='blur'
            blurDataURL={blurDataUrl}
          />

          {/* Category badge */}
          <span
            className='absolute top-3 left-3 rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider'
            style={{
              backgroundColor: categoryConfig.color,
              color: categoryConfig.textColor,
            }}
          >
            {categoryConfig.label}
          </span>
        </div>

        {/* Content */}
        <div className='p-4'>
          <h3 className='mb-2 line-clamp-2 font-display font-semibold text-base text-white transition-colors group-hover:text-cyan-400'>
            {post.title}
          </h3>

          <p className='mb-3 line-clamp-2 text-slate-400 text-sm'>{post.excerpt}</p>

          {/* Meta */}
          <div className='flex items-center gap-2 text-slate-500 text-xs'>
            <span>{post.readTime}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default AllPostsGrid;
