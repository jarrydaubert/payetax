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
      {/* biome-ignore lint/correctness/useUniqueElementIds: Server component rendered once per page */}
      <h2
        id='deep-dives-heading'
        className='mb-6 font-display font-semibold text-cyan-500 text-sm uppercase tracking-widest'
      >
        Deep Dives
      </h2>

      <ul className='grid w-full list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3'>
        {displayedPosts.map((post) => (
          <li key={post.slug} className='h-full'>
            <ArticleCardDeepDive post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DeepDives;
