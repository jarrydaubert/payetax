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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm';

const cardSurface = cn(
  'group relative overflow-hidden rounded-sm border border-border bg-card transition-colors',
  'hover:border-primary/55',
);

const categoryBadge =
  'absolute top-3 left-3 border border-primary/35 bg-background/90 px-2.5 py-1 font-semibold text-[11px] text-primary uppercase tracking-[0.22em] sm:top-4 sm:left-4 sm:px-3 sm:text-xs sm:tracking-wider';

const cardTitle =
  'font-display font-semibold text-foreground leading-tight transition-colors group-hover:text-primary';

/**
 * Large Article Card
 * Used as the featured card in the Latest Articles grid
 */
export function ArticleCardLarge({ post, className, priority = false }: ArticleCardProps) {
  const { categoryConfig, imageSrc, blurDataUrl, href, alt, formattedDate } = deriveCardModel(post);

  return (
    <article className={cn(cardSurface, className)}>
      <Link href={href} className={cn('block', focusStyles)}>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 60vw'
            placeholder='blur'
            blurDataURL={blurDataUrl}
            priority={priority}
          />

          {/* Category badge */}
          <span className={categoryBadge}>{categoryConfig.label}</span>
        </div>

        {/* Content */}
        <div className='p-4 sm:p-5'>
          <h3 className={cn('mb-2 line-clamp-2 text-[1.35rem] sm:text-lg md:text-xl', cardTitle)}>
            {post.title}
          </h3>

          <p className='mb-3 line-clamp-3 text-muted-foreground text-sm leading-6 sm:mb-4 sm:line-clamp-2'>
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs'>
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
    <article className={cn(cardSurface, className)}>
      <Link href={href} className={cn('flex gap-3 p-3 sm:gap-4', focusStyles)}>
        {/* Thumbnail - square */}
        <div className='relative size-[4.5rem] shrink-0 overflow-hidden border border-border sm:size-20'>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className='object-cover'
            sizes='80px'
            placeholder='blur'
            blurDataURL={blurDataUrl}
          />

          {/* Category badge overlay */}
          <span className='absolute bottom-1 left-1 border border-primary/35 bg-background/90 px-1.5 py-0.5 font-semibold text-[10px] text-primary uppercase sm:text-xs'>
            {categoryConfig.label.split(' ')[0]}
          </span>
        </div>

        {/* Content */}
        <div className='flex flex-1 flex-col justify-center py-1'>
          <h3 className={cn('mb-1 line-clamp-2 text-[0.95rem] leading-5 sm:text-sm', cardTitle)}>
            {post.title}
          </h3>

          {/* Meta */}
          <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs'>
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
    <article className={cn(cardSurface, className)}>
      <Link href={href} className={cn('block', focusStyles)}>
        {/* Image container - 16:10 aspect ratio */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            placeholder='blur'
            blurDataURL={blurDataUrl}
          />

          {/* Category badge */}
          <span className={categoryBadge}>{categoryConfig.label}</span>
        </div>

        {/* Content */}
        <div className='p-4'>
          <h3 className={cn('mb-2 line-clamp-2 text-base', cardTitle)}>{post.title}</h3>

          <p className='mb-3 line-clamp-2 text-muted-foreground text-sm'>{post.excerpt}</p>

          {/* Meta */}
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <span>{post.readTime}</span>
            <span aria-hidden='true'>|</span>
            <time dateTime={post.publishedAt}>{formattedDateShort}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
