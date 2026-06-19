// src/components/organisms/EditorsPicks.tsx
/**
 * Editor's Picks Sidebar
 *
 * Numbered list of curated articles rendered once in the DOM so crawlers and
 * assistive tech do not receive duplicate responsive copies.
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
  const countLabel = `${displayedPosts.length} curated ${displayedPosts.length === 1 ? 'read' : 'reads'}`;

  return (
    <aside aria-label="Editor's picks" className={cn(className)}>
      <div className='mb-4 flex items-baseline justify-between gap-3 sm:mb-6'>
        <h2 className='font-semibold text-primary text-xs uppercase tracking-[0.28em] sm:text-sm sm:tracking-widest'>
          Editor&apos;s Picks
        </h2>
        <p className='whitespace-nowrap text-muted-foreground text-xs'>{countLabel}</p>
      </div>

      <div className='overflow-hidden rounded-sm border border-border bg-card'>
        <EditorsPicksList posts={displayedPosts} />
      </div>
    </aside>
  );
}

interface EditorsPicksListProps {
  posts: BlogPost[];
}

function EditorsPicksList({ posts }: EditorsPicksListProps) {
  return (
    <ol className='divide-y divide-border'>
      {posts.map((post, index) => {
        const categoryLabel = post.categoryData?.name ?? post.category.replace(/-/g, ' ');

        return (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className='group grid grid-cols-[1.75rem_1fr] gap-3 px-3.5 py-3 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4'
              prefetch={false}
            >
              <span className='flex size-7 items-center justify-center rounded-sm border border-border bg-background font-mono font-semibold text-[0.68rem] text-primary tabular-nums transition-colors group-hover:border-primary/45'>
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className='min-w-0'>
                <span className='line-clamp-2 font-semibold text-foreground text-sm leading-5 transition-colors group-hover:text-primary'>
                  {post.title}
                </span>
                <span className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs'>
                  <span className='capitalize'>{categoryLabel}</span>
                  {post.readTime && (
                    <>
                      <span aria-hidden='true'>|</span>
                      <span>{post.readTime}</span>
                    </>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
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
