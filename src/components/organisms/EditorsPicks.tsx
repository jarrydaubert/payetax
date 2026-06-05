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
          className='flex cursor-pointer items-center justify-between rounded-sm border border-border bg-card px-4 py-3.5 text-foreground hover:border-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          aria-label="Toggle Editor's Picks section"
        >
          <span className='font-semibold text-primary text-sm uppercase tracking-[0.24em]'>
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
    <div className='rounded-sm border border-border bg-card p-4 sm:p-5'>
      {showHeading && (
        <h2 className='mb-5 font-semibold text-primary text-xs uppercase tracking-[0.28em] sm:mb-6 sm:text-sm sm:tracking-widest'>
          Editor&apos;s Picks
        </h2>
      )}

      <ol className='divide-y divide-border'>
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className='group flex items-start gap-3 py-3 first:pt-0 last:pb-0'
              prefetch={false}
            >
              {/* Number */}
              <span className='flex-shrink-0 font-mono text-primary text-xs tabular-nums tracking-[0.2em] transition-colors group-hover:text-primary/80'>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div>
                <h3 className='line-clamp-2 font-display font-semibold text-[0.98rem] text-foreground leading-5 transition-colors group-hover:text-primary'>
                  {post.title}
                </h3>
                {post.readTime && (
                  <span className='mt-1 block text-muted-foreground text-xs'>{post.readTime}</span>
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
