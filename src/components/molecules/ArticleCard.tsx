/**
 * Article Card Components
 *
 * Three variants for the blog redesign:
 * - ArticleCardLarge: Featured card with large image (16:10 aspect ratio)
 * - ArticleCardSmall: Compact card with square thumbnail
 * - ArticleCardDeepDive: 3-column grid cards
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Image from 'next/image';
import Link from 'next/link';

import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';
import { getPostBlurDataUrl, getPostImageSrc } from '@/lib/blog/imageFallback';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface ArticleCardProps {
  post: BlogPost;
  className?: string;
  /** Mark as priority for LCP optimization (use sparingly - above fold only) */
  priority?: boolean;
}

/**
 * Type guard for CategoryKey
 * Returns true if the value is a valid category key
 */
function isCategoryKey(value: unknown): value is CategoryKey {
  return typeof value === 'string' && value in BLOG_CATEGORIES;
}

/**
 * Normalize category to a valid CategoryKey with fallback
 */
function normalizeCategoryKey(category: string | undefined): CategoryKey {
  if (isCategoryKey(category)) {
    return category;
  }
  // Could log invalid categories here for monitoring
  return 'tax-basics';
}

/**
 * Derived UI model for article cards
 * Extracts common logic to avoid duplication across variants
 */
function deriveCardModel(post: BlogPost) {
  const categoryKey = normalizeCategoryKey(post.category);
  const categoryConfig = BLOG_CATEGORIES[categoryKey];

  return {
    categoryKey,
    categoryConfig,
    imageSrc: getPostImageSrc(post.image, categoryKey),
    blurDataUrl: getPostBlurDataUrl(post.image, categoryKey),
    href: `/blog/${post.slug}` as const,
    alt: post.imageAlt ?? post.title,
    // Format date server-side to avoid hydration mismatches
    formattedDate: formatPublishedDate(post.publishedAt),
    formattedDateShort: formatPublishedDateShort(post.publishedAt),
  };
}

/**
 * Format date for display (full format: "1 Feb 2026")
 * Uses fixed locale to avoid hydration mismatches
 */
function formatPublishedDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC', // Use UTC to avoid timezone shifts
  });
}

/**
 * Format date for compact display (short format: "1 Feb")
 */
function formatPublishedDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Common focus styles for card links */
const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-xl';

/**
 * Large Article Card
 * Used as the featured card in the Latest Articles grid
 */
export function ArticleCardLarge({ post, className, priority = false }: ArticleCardProps) {
  const { categoryConfig, imageSrc, blurDataUrl, href, alt, formattedDate } = deriveCardModel(post);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={href} className={cn('block', focusStyles)}>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 60vw'
            placeholder='blur'
            blurDataURL={blurDataUrl}
            priority={priority}
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
            <span aria-hidden='true'>|</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
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
  const { categoryConfig, imageSrc, blurDataUrl, href, alt, formattedDateShort } =
    deriveCardModel(post);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={href} className={cn('flex gap-4 p-3', focusStyles)}>
        {/* Thumbnail - square */}
        <div className='relative size-20 shrink-0 overflow-hidden rounded-md'>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='80px'
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
            <span aria-hidden='true'>|</span>
            <time dateTime={post.publishedAt}>{formattedDateShort}</time>
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
  const { categoryConfig, imageSrc, blurDataUrl, href, alt, formattedDateShort } =
    deriveCardModel(post);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-800/50 transition-all duration-200',
        'border border-slate-700/50 hover:border-cyan-500/50',
        'motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <Link href={href} className={cn('block', focusStyles)}>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={alt}
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
            <span aria-hidden='true'>|</span>
            <time dateTime={post.publishedAt}>{formattedDateShort}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
