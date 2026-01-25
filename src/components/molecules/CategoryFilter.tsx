// src/components/molecules/CategoryFilter.tsx
'use client';

import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/types/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  allPostsCount: number;
  selectedCategory?: string;
  onCategoryClick: (categorySlug?: string) => void;
}

export function CategoryFilter({
  categories,
  allPostsCount,
  selectedCategory,
  onCategoryClick,
}: CategoryFilterProps) {
  const headingId = useId();

  const isActive = (categorySlug?: string) => {
    if (!categorySlug) return !selectedCategory;
    return selectedCategory === categorySlug;
  };

  return (
    <nav className='mb-12' aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={cn('mb-6 text-center font-semibold text-foreground', TYPOGRAPHY.TEXT_XL)}
      >
        Browse Topics
      </h2>
      <div className='mx-auto max-w-5xl'>
        <div className={cn('flex flex-wrap items-center justify-center', SPACING.GAP_2)}>
          {/* All Posts Button */}
          <Button
            variant={isActive() ? 'default' : 'outline'}
            size='sm'
            onClick={() => onCategoryClick()}
            className={SPACING.GAP_2}
          >
            All Posts
            <span
              className={cn(
                'rounded px-1.5 py-0.5 font-mono',
                TYPOGRAPHY.TEXT_XS,
                isActive() ? 'bg-primary-foreground/20' : 'text-muted-foreground'
              )}
            >
              {allPostsCount}
            </span>
          </Button>

          {/* Category Buttons */}
          {categories
            .filter((category) => (category.count || 0) > 0)
            .map((category) => (
              <Button
                key={category.slug}
                variant={isActive(category.slug) ? 'default' : 'outline'}
                size='sm'
                onClick={() => onCategoryClick(category.slug)}
                className={SPACING.GAP_2}
              >
                {category.name}
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 font-mono',
                    TYPOGRAPHY.TEXT_XS,
                    isActive(category.slug) ? 'bg-primary-foreground/20' : 'text-muted-foreground'
                  )}
                >
                  {category.count}
                </span>
              </Button>
            ))}
        </div>
      </div>
    </nav>
  );
}
