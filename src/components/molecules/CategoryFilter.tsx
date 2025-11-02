// src/components/molecules/CategoryFilter.tsx
'use client';

import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/types/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  allPostsCount: number;
  selectedCategory?: string;
  onCategoryClick: (categorySlug?: string) => void;
}

/**
 * Category filter component for blog posts
 * Uses shadcn Badge component with enhanced styling for active/inactive states
 *
 * @param categories - Array of blog categories with counts
 * @param allPostsCount - Total number of posts across all categories
 * @param selectedCategory - Currently selected category slug
 * @param onCategoryClick - Callback when a category is clicked
 */
export function CategoryFilter({
  categories,
  allPostsCount,
  selectedCategory,
  onCategoryClick,
}: CategoryFilterProps) {
  const isActive = (categorySlug?: string) => {
    if (!categorySlug) return !selectedCategory;
    return selectedCategory === categorySlug;
  };

  return (
    <div className='relative z-20 mb-12 md:mb-20'>
      <div className='mb-8 flex items-center justify-center gap-2 text-center'>
        <Tag className='size-5 text-purple-400' />
        <h2 className='font-semibold text-foreground text-xl'>Browse Topics</h2>
      </div>
      <div className='mx-auto max-w-5xl'>
        <div className='flex flex-wrap items-center justify-center gap-3'>
          {/* All Posts Button */}
          <button
            type='button'
            onClick={() => onCategoryClick()}
            className={cn(
              'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300',
              isActive()
                ? 'scale-110 bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                : 'border border-border bg-card/50 text-foreground/70 backdrop-blur-xl hover:scale-105 hover:border-purple-500/50 hover:bg-card/70 hover:text-foreground'
            )}
          >
            <span className='relative z-10'>All Posts</span>
            <Badge
              variant='secondary'
              className={cn(
                'relative z-10 font-mono text-xs',
                isActive() && 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              {allPostsCount}
            </Badge>
            {isActive() && (
              <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 blur transition-opacity group-hover:opacity-100' />
            )}
          </button>

          {/* Category Buttons */}
          {categories
            .filter((category) => (category.count || 0) > 0)
            .map((category) => (
              <button
                key={category.slug}
                type='button'
                onClick={() => onCategoryClick(category.slug)}
                className={cn(
                  'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300',
                  isActive(category.slug)
                    ? 'scale-110 bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                    : 'border border-border bg-card/50 text-foreground/70 backdrop-blur-xl hover:scale-105 hover:border-purple-500/50 hover:bg-card/70 hover:text-foreground'
                )}
              >
                <span className='relative z-10'>{category.name}</span>
                <Badge
                  variant='secondary'
                  className={cn(
                    'relative z-10 font-mono text-xs',
                    isActive(category.slug) && 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {category.count}
                </Badge>
                {isActive(category.slug) && (
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 blur transition-opacity group-hover:opacity-100' />
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
