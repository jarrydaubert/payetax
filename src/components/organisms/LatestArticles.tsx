// src/components/organisms/LatestArticles.tsx
/**
 * Latest Articles Section
 *
 * Asymmetric 2-column grid with one large featured card and stacked small cards.
 * Responsive: single column on mobile, 50/50 on tablet, 60/40 on desktop.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { ArticleCardLarge, ArticleCardSmall } from '@/components/molecules/ArticleCard';
import type { BlogPost } from '@/types/blog';

interface LatestArticlesProps {
  posts: BlogPost[];
}

export function LatestArticles({ posts }: LatestArticlesProps) {
  if (posts.length === 0) return null;

  const [featuredPost, ...smallPosts] = posts;
  const displayedSmallPosts = smallPosts.slice(0, 4);

  return (
    <section aria-labelledby='latest-articles-heading'>
      {/* biome-ignore lint/correctness/useUniqueElementIds: Server component rendered once per page */}
      <h2
        id='latest-articles-heading'
        className='mb-6 font-display font-semibold text-cyan-500 text-sm uppercase tracking-widest'
      >
        Latest Articles
      </h2>

      <div className='grid gap-6 lg:grid-cols-[1.6fr_1fr]'>
        {/* Large featured card */}
        {featuredPost && (
          <div className='lg:row-span-4'>
            <ArticleCardLarge post={featuredPost} />
          </div>
        )}

        {/* Stacked small cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
          {displayedSmallPosts.map((post) => (
            <ArticleCardSmall key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestArticles;
