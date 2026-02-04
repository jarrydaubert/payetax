// src/components/organisms/LatestArticles.tsx
/**
 * Latest Articles Section
 *
 * Asymmetric 2-column grid with one large featured card and stacked small cards.
 * Responsive:
 * - Mobile: single column
 * - Tablet (md): 2-column equal grid
 * - Desktop (lg): 60/40 asymmetric with featured spanning all rows
 *
 * Note: Displays exactly 4 small cards (lg:row-span-4 is tied to this constraint).
 * If changing the count, update row-span accordingly.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { ArticleCardLarge, ArticleCardSmall } from '@/components/molecules/ArticleCard';
import type { BlogPost } from '@/types/blog';

/** Number of small cards to display (row-span is tied to this) */
const SMALL_CARDS_COUNT = 4;

interface LatestArticlesProps {
  posts: BlogPost[];
}

export function LatestArticles({ posts }: LatestArticlesProps) {
  if (posts.length === 0) return null;

  // Sort by publishedAt descending to ensure latest post is featured
  // This is defensive - upstream should already sort, but we guarantee it here
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const [featuredPost, ...smallPosts] = sortedPosts;
  const displayedSmallPosts = smallPosts.slice(0, SMALL_CARDS_COUNT);

  return (
    // Use aria-label instead of aria-labelledby to avoid static ID issues
    <section aria-label='Latest articles'>
      <h2 className='mb-6 font-display font-semibold text-cyan-500 text-sm uppercase tracking-widest'>
        Latest Articles
      </h2>

      {/* Grid: single column -> 2-col equal (md) -> 60/40 asymmetric (lg) */}
      <ul className='grid gap-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr]' role='list'>
        {/* Large featured card - spans all rows on desktop */}
        {featuredPost && (
          <li className='md:col-span-2 lg:col-span-1 lg:row-span-4'>
            <ArticleCardLarge post={featuredPost} />
          </li>
        )}

        {/* Small cards - auto-flow into right column on desktop */}
        {displayedSmallPosts.map((post) => (
          <li
            key={post.slug || post.id}
            className='md:col-span-1 lg:col-span-1 lg:col-start-2'
          >
            <ArticleCardSmall post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LatestArticles;
