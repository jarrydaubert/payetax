// src/components/organisms/DeepDives.tsx
/**
 * Deep Dives Section
 *
 * 3-column grid of in-depth articles.
 * Displays posts with deepDive: true or falls back to curated slugs.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { ArticleCardDeepDive } from '@/components/molecules/ArticleCard';
import type { BlogPost } from '@/types/blog';

interface DeepDivesProps {
  posts: BlogPost[];
}

export function DeepDives({ posts }: DeepDivesProps) {
  if (posts.length === 0) return null;

  const displayedPosts = posts.slice(0, 6);

  return (
    <section aria-labelledby='deep-dives-heading'>
      <h2
        id='deep-dives-heading'
        className='mb-6 font-display text-xl font-semibold text-white md:text-2xl'
      >
        Deep Dives
      </h2>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {displayedPosts.map((post) => (
          <ArticleCardDeepDive key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default DeepDives;
