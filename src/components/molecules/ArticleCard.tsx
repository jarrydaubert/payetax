// src/components/molecules/ArticleCard.tsx
/**
 * Article Card Components
 *
 * Two variants for the blog redesign:
 * - ArticleCardLarge: Featured card with large image (16:10 aspect ratio)
 * - ArticleCardSmall: Compact card with square thumbnail
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Image from 'next/image';
import Link from 'next/link';

import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';
import { getCategoryBlurDataUrl, getCategoryFallbackSvg } from '@/lib/blog/imageFallback';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface ArticleCardProps {
  post: BlogPost;
  className?: string;
}

/**
 * Large Article Card
 * Used as the featured card in the Latest Articles grid
 */
export function ArticleCardLarge({ post, className }: ArticleCardProps) {
  const categoryKey = (post.category as CategoryKey) || 'tax-basics';
  const categoryConfig = BLOG_CATEGORIES[categoryKey] ?? BLOG_CATEGORIES['tax-basics'];

  const imageSrc = post.image ?? getCategoryFallbackSvg(categoryKey);
  const blurDataUrl = getCategoryBlurDataUrl(categoryKey);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={`/blog/${post.slug}`} className='block'>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={post.imageAlt ?? post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 60vw'
            placeholder='blur'
            blurDataURL={blurDataUrl}
          />

          {/* Category badge */}
          <span
            className='absolute top-4 left-4 rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-wider'
            style={{
              backgroundColor: categoryConfig.color,
              color: categoryConfig.textColor,
            }}
          >
            {categoryConfig.label}
          </span>
        </div>

        {/* Content */}
        <div className='p-5'>
          <h3 className='mb-2 line-clamp-2 font-display font-semibold text-lg text-white transition-colors group-hover:text-cyan-400 md:text-xl'>
            {post.title}
          </h3>

          <p className='mb-4 line-clamp-2 text-slate-400 text-sm'>{post.excerpt}</p>

          {/* Meta */}
          <div className='flex items-center gap-3 text-slate-500 text-xs'>
            <span>{post.readTime}</span>
            <span>|</span>
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

/**
 * Small Article Card
 * Used for stacked cards in the Latest Articles grid
 */
export function ArticleCardSmall({ post, className }: ArticleCardProps) {
  const categoryKey = (post.category as CategoryKey) || 'tax-basics';
  const categoryConfig = BLOG_CATEGORIES[categoryKey] ?? BLOG_CATEGORIES['tax-basics'];

  const imageSrc = post.image ?? getCategoryFallbackSvg(categoryKey);
  const blurDataUrl = getCategoryBlurDataUrl(categoryKey);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={`/blog/${post.slug}`} className='flex gap-4 p-3'>
        {/* Thumbnail - square */}
        <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md'>
          <Image
            src={imageSrc}
            alt={post.imageAlt ?? post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 80px, 80px'
            placeholder='blur'
            blurDataURL={blurDataUrl}
          />

          {/* Category badge overlay */}
          <span
            className='absolute bottom-1 left-1 rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase'
            style={{
              backgroundColor: categoryConfig.color,
              color: categoryConfig.textColor,
            }}
          >
            {categoryConfig.label.split(' ')[0]}
          </span>
        </div>

        {/* Content */}
        <div className='flex flex-1 flex-col justify-center py-1'>
          <h3 className='mb-1 line-clamp-2 font-display font-semibold text-sm text-white transition-colors group-hover:text-cyan-400'>
            {post.title}
          </h3>

          {/* Meta */}
          <div className='flex items-center gap-2 text-slate-500 text-xs'>
            <span>{post.readTime}</span>
            <span>|</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Deep Dive Article Card
 * Used in the Deep Dives section - 3 column equal grid
 */
export function ArticleCardDeepDive({ post, className }: ArticleCardProps) {
  const categoryKey = (post.category as CategoryKey) || 'tax-basics';
  const categoryConfig = BLOG_CATEGORIES[categoryKey] ?? BLOG_CATEGORIES['tax-basics'];

  const imageSrc = post.image ?? getCategoryFallbackSvg(categoryKey);
  const blurDataUrl = getCategoryBlurDataUrl(categoryKey);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={`/blog/${post.slug}`} className='block'>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={post.imageAlt ?? post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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
            <span>|</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ArticleCardLarge;
