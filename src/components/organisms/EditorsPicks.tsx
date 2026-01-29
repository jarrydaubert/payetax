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
    <aside className={cn('', className)}>
      {/* Desktop/Tablet: Regular display */}
      <div className='hidden md:block'>
        <EditorsPicksList posts={displayedPosts} />
      </div>

      {/* Mobile: Native accordion using details/summary (zero CLS) */}
      <details className='group md:hidden'>
        <summary className='flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/50 p-4 text-white hover:bg-slate-800/70'>
          <span className='font-display font-semibold'>Editor&apos;s Picks</span>
          <span className='text-slate-400 transition-transform group-open:rotate-180'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </span>
        </summary>
        <div className='mt-2'>
          <EditorsPicksList posts={displayedPosts} />
        </div>
      </details>
    </aside>
  );
}

interface EditorsPicksListProps {
  posts: BlogPost[];
}

function EditorsPicksList({ posts }: EditorsPicksListProps) {
  return (
    <div className='rounded-xl border border-slate-700/50 bg-slate-800/50 p-5'>
      <h2 className='mb-4 font-display font-semibold text-lg text-white'>Editor&apos;s Picks</h2>

      <ol className='space-y-4'>
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className='group flex items-start gap-3'>
              {/* Number */}
              <span className='flex-shrink-0 font-bold font-display text-2xl text-slate-600 transition-colors group-hover:text-cyan-500'>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className='pt-1'>
                <h3 className='line-clamp-2 font-medium text-sm text-white transition-colors group-hover:text-cyan-400'>
                  {post.title}
                </h3>
                <span className='mt-1 text-slate-500 text-xs'>{post.readTime}</span>
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
