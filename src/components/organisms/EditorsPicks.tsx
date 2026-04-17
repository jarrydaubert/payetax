// src/components/organisms/EditorsPicks.tsx
/**
 * Editor's Picks Sidebar
 *
 * Numbered list of curated articles.
 * - Desktop: Sticky sidebar
 * - Tablet: Below main content
 * - Mobile: Native details/summary accordion (zero CLS)
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface EditorsPicksProps {
  posts: BlogPost[];
  className?: string;
}

export function EditorsPicks({ posts, className }: EditorsPicksProps) {
  if (posts.length === 0) return null;

  const displayedPosts = posts.slice(0, 5);

  return (
    <div className={cn(className)}>
      {/* Desktop/Tablet: Regular display */}
      <div className='hidden md:block'>
        <EditorsPicksList posts={displayedPosts} />
      </div>

      {/* Mobile: Native accordion using details/summary (zero CLS) */}
      <details className='group md:hidden'>
        <summary
          className='flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-4 py-3.5 text-foreground hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          aria-label="Toggle Editor's Picks section"
        >
          <span className='font-display font-semibold text-primary/90 text-sm uppercase tracking-[0.2em]'>
            Editor&apos;s Picks
          </span>
          <span className='text-muted-foreground transition-transform group-open:rotate-180'>
            <svg
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </span>
        </summary>
        <div className='mt-3'>
          {/* Hide heading on mobile since summary already says "Editor's Picks" */}
          <EditorsPicksList posts={displayedPosts} showHeading={false} />
        </div>
      </details>
    </div>
  );
}

interface EditorsPicksListProps {
  posts: BlogPost[];
  /** Whether to show the h2 heading (default: true, set false in mobile accordion) */
  showHeading?: boolean;
}

function EditorsPicksList({ posts, showHeading = true }: EditorsPicksListProps) {
  return (
    <div className='rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5'>
      {showHeading && (
        <h2 className='mb-5 font-display font-semibold text-primary text-xs uppercase tracking-[0.28em] sm:mb-6 sm:text-sm sm:tracking-widest'>
          Editor&apos;s Picks
        </h2>
      )}

      <ol className='space-y-3 sm:space-y-4'>
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className='group flex items-start gap-3'
              prefetch={false}
            >
              {/* Number */}
              <span className='flex-shrink-0 font-bold font-display text-[1.6rem] text-primary/80 transition-colors group-hover:text-primary sm:text-2xl'>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className='pt-1'>
                <h3 className='line-clamp-2 font-medium text-[0.95rem] text-foreground leading-5 transition-colors group-hover:text-primary sm:text-sm'>
                  {post.title}
                </h3>
                {post.readTime && (
                  <span className='mt-1 text-muted-foreground text-xs'>{post.readTime}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Sticky wrapper for desktop sidebar
 */
export function EditorsPicksSticky({ posts, className }: EditorsPicksProps) {
  return (
    <div className={cn('lg:sticky lg:top-24', className)}>
      <EditorsPicks posts={posts} />
    </div>
  );
}

export default EditorsPicks;
