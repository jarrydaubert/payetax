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
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { getCategoryBlurDataUrl, getCategoryFallbackSvg } from '@/lib/blog/imageFallback';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

/** Number of images to prioritize for LCP */
const PRIORITY_IMAGE_COUNT = 3;

/** Validate and normalize category key with fallback */
function getValidCategoryKey(category: string | undefined): CategoryKey {
  if (category && category in BLOG_CATEGORIES) {
    return category as CategoryKey;
  }
  return 'tax-basics';
}

interface AllPostsGridProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export function AllPostsGrid({ posts, currentPage, totalPages, totalPosts }: AllPostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className={cn('text-center', SPACING.PY_16)}>
        <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>No articles found.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby='all-posts-heading' className={SPACING.PY_12}>
      <div className={LAYOUT.CONTAINER}>
        {/* Section Header */}
        <div className={cn('flex items-center justify-between', SPACING.MB_8)}>
          {/* biome-ignore lint/correctness/useUniqueElementIds: Server component rendered once per page */}
          <h2
            id='all-posts-heading'
            className='font-semibold text-primary text-xs uppercase tracking-[0.28em] sm:text-sm sm:tracking-widest'
          >
            All Articles
          </h2>
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
            {totalPosts.toLocaleString('en-GB')} article{totalPosts !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Posts Grid */}
        <ul
          className={cn(
            'grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3',
            SPACING.GAP_6,
            SPACING.MB_12,
          )}
        >
          {posts.map((post, idx) => (
            <li key={post.slug} className='h-full'>
              <PostCard post={post} priority={idx < PRIORITY_IMAGE_COUNT} />
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          scrollToId='all-posts-heading'
        />
      </div>
    </section>
  );
}

interface PostCardProps {
  post: BlogPost;
  /** Whether to prioritize this image for LCP */
  priority?: boolean;
}

function PostCard({ post, priority = false }: PostCardProps) {
  // Validate category key once with fallback
  const categoryKey = getValidCategoryKey(post.category);
  const categoryConfig = BLOG_CATEGORIES[categoryKey];

  const imageSrc = post.image ?? getCategoryFallbackSvg(categoryKey);
  const blurDataUrl = getCategoryBlurDataUrl(categoryKey);

  // Format date deterministically (UTC to avoid server/client mismatch)
  const publishedDate = new Date(post.publishedAt);
  const formattedDate = publishedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-sm bg-card transition-colors',
        'border border-border hover:border-primary/55',
      )}
    >
      <Link href={`/blog/${post.slug}`} className='block'>
        {/* Image */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={imageSrc}
            alt={post.imageAlt ?? post.title}
            fill
            className='object-cover'
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            priority={priority}
            placeholder={blurDataUrl ? 'blur' : 'empty'}
            blurDataURL={blurDataUrl}
          />

          {/* Category badge */}
          <span className='absolute top-3 left-3 border border-primary/35 bg-background/90 px-2.5 py-0.5 font-semibold text-primary text-xs uppercase tracking-wider'>
            {categoryConfig.label}
          </span>
        </div>

        {/* Content */}
        <div className={SPACING.P_4}>
          <h3
            className={cn(
              'line-clamp-2 font-display font-semibold text-foreground transition-colors group-hover:text-primary',
              SPACING.MB_2,
              TYPOGRAPHY.TEXT_BASE,
            )}
          >
            {post.title}
          </h3>

          <p className={cn('line-clamp-2 text-muted-foreground', SPACING.MB_3, TYPOGRAPHY.TEXT_SM)}>
            {post.excerpt}
          </p>

          {/* Meta */}
          <div
            className={cn(
              'flex items-center text-muted-foreground',
              SPACING.GAP_2,
              TYPOGRAPHY.TEXT_XS,
            )}
          >
            <span>{post.readTime}</span>
            <span aria-hidden='true'>•</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default AllPostsGrid;
