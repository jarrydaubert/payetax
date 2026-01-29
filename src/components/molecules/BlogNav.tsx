// src/components/molecules/BlogNav.tsx
/**
 * Blog Navigation - Category Groups
 *
 * Horizontal navigation with category groups for blog filtering.
 * Links to category hub pages (e.g., /blog/category/tax-guides).
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Link from 'next/link';

import { NAV_GROUPS } from '@/constants/blogCategories';
import { cn } from '@/lib/utils';

interface BlogNavProps {
  activeGroup?: string;
  className?: string;
}

export function BlogNav({ activeGroup, className }: BlogNavProps) {
  return (
    <nav
      aria-label='Blog categories'
      className={cn('flex items-center gap-1 overflow-x-auto pb-2', className)}
    >
      {/* All Articles */}
      <Link
        href='/blog'
        className={cn(
          'whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-colors',
          !activeGroup
            ? 'bg-cyan-500 text-white'
            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
        )}
        aria-current={!activeGroup ? 'page' : undefined}
      >
        All Articles
      </Link>

      {/* Category Groups */}
      {NAV_GROUPS.map((group) => (
        <Link
          key={group.slug}
          href={`/blog/category/${group.slug}` as `/blog/category/${string}`}
          className={cn(
            'whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-colors',
            activeGroup === group.slug
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
          )}
          aria-current={activeGroup === group.slug ? 'page' : undefined}
        >
          {group.label}
        </Link>
      ))}
    </nav>
  );
}

export default BlogNav;
