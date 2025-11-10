// src/components/molecules/CategoryFilter.tsx
'use client';

import { Tag } from 'lucide-react';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { COLORS, ICON_SIZES, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
 * IMPORTANT: This is a MOLECULE - it does NOT own semantic tags like <section>.
 * The parent page/organism should wrap this in appropriate semantic HTML.
 *
 * Uses TEXT_XL for blog section headings to maintain hierarchy with page titles
 * Button text uses TEXT_SM for standard button typography
 * Icon uses SIZE_5 for emphasis in section heading
 * Button spacing uses GAP_3 for comfortable button groups
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
  const headingId = useId();

  const isActive = (categorySlug?: string) => {
    if (!categorySlug) return !selectedCategory;
    return selectedCategory === categorySlug;
  };

  return (
    <div className='relative z-20 mb-12 md:mb-20' aria-labelledby={headingId}>
      <div className={cn('mb-8 flex items-center justify-center text-center', SPACING.GAP_2)}>
        <Tag className={cn(ICON_SIZES.SIZE_5, COLORS.ACCENT_PURPLE)} aria-hidden='true' />
        <h2 id={headingId} className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_XL)}>
          Browse Topics
        </h2>
      </div>
      <div className='mx-auto max-w-5xl'>
        <div className={cn('flex flex-wrap items-center justify-center', SPACING.GAP_3)}>
          {/* All Posts Button */}
          <button
            type='button'
            onClick={() => onCategoryClick()}
            className={cn(
              'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2.5 font-medium transition-all duration-300',
              SPACING.GAP_2,
              TYPOGRAPHY.TEXT_SM,
              isActive()
                ? `scale-110 bg-action-primary text-white hover:opacity-95 ${SHADOWS.GLOW_ACCENT} hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]`
                : 'border border-border bg-card/50 text-foreground/70 backdrop-blur-xl hover:scale-105 hover:border-primary/50 hover:bg-card/70 hover:text-foreground'
            )}
          >
            <span className='relative z-10'>All Posts</span>
            <Badge
              variant='secondary'
              className={cn(
                'relative z-10 font-mono',
                TYPOGRAPHY.TEXT_XS,
                isActive() &&
                  'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
              )}
            >
              {allPostsCount}
            </Badge>
            {isActive() && (
              <div className='absolute inset-0 bg-action-primary opacity-0 blur transition-opacity group-hover:opacity-100' />
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
                  'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2.5 font-medium transition-all duration-300',
                  SPACING.GAP_2,
                  TYPOGRAPHY.TEXT_SM,
                  isActive(category.slug)
                    ? `scale-110 bg-action-primary text-white hover:opacity-95 ${SHADOWS.GLOW_ACCENT} hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]`
                    : 'border border-border bg-card/50 text-foreground/70 backdrop-blur-xl hover:scale-105 hover:border-primary/50 hover:bg-card/70 hover:text-foreground'
                )}
              >
                <span className='relative z-10'>{category.name}</span>
                <Badge
                  variant='secondary'
                  className={cn(
                    'relative z-10 font-mono',
                    TYPOGRAPHY.TEXT_XS,
                    isActive(category.slug) &&
                      'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                  )}
                >
                  {category.count}
                </Badge>
                {isActive(category.slug) && (
                  <div className='absolute inset-0 bg-action-primary opacity-0 blur transition-opacity group-hover:opacity-100' />
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
