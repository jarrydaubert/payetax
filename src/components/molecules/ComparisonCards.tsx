/**
 * ComparisonCards Component
 *
 * Displays side-by-side comparison cards (Do vs Don't, Good vs Bad, etc.)
 * Used on privacy page to show what we do vs don't do.
 *
 * @module components/molecules/ComparisonCards
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { CheckCircle, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Individual comparison item
 */
export interface ComparisonItem {
  /** Icon for the category */
  icon: LucideIcon;
  /** Title of the category */
  title: string;
  /** List of items */
  items: string[];
  /** Visual variant (positive or negative) */
  variant: 'positive' | 'negative';
}

/**
 * ComparisonCards component props
 */
export interface ComparisonCardsProps {
  /** Left side comparison (typically "don't do" or negative) */
  left: ComparisonItem;
  /** Right side comparison (typically "do" or positive) */
  right: ComparisonItem;
  /** Optional custom className */
  className?: string;
}

/**
 * ComparisonCards Component
 *
 * Side-by-side cards showing what to do vs what not to do.
 *
 * @example
 * ```tsx
 * <ComparisonCards
 *   left={{
 *     icon: X,
 *     title: "What We DON'T Do",
 *     items: ['Store your salary', 'Track your usage', 'Sell your data'],
 *     variant: 'negative',
 *   }}
 *   right={{
 *     icon: CheckCircle,
 *     title: 'What We DO',
 *     items: ['Respect your privacy', 'Use official HMRC rates', 'Stay transparent'],
 *     variant: 'positive',
 *   }}
 * />
 * ```
 */
export function ComparisonCards({ left, right, className }: ComparisonCardsProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 md:gap-8', className)}>
      <ComparisonCard item={left} />
      <ComparisonCard item={right} />
    </div>
  );
}

/**
 * Individual comparison card
 */
interface ComparisonCardProps {
  item: ComparisonItem;
}

function ComparisonCard({ item }: ComparisonCardProps) {
  const { icon: Icon, title, items, variant } = item;

  const isNegative = variant === 'negative';
  const ListIcon = isNegative ? UserX : CheckCircle;

  const cardClasses = cn(
    'h-full overflow-hidden p-8',
    isNegative
      ? 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10'
      : 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10'
  );

  const iconContainerClasses = cn(
    `flex ${ICON_SIZES.SIZE_12} items-center justify-center rounded-xl shadow-lg`,
    isNegative ? 'bg-destructive' : 'bg-primary'
  );

  const iconClasses = cn(
    ICON_SIZES.SIZE_6,
    isNegative ? 'text-destructive-foreground' : 'text-primary-foreground'
  );

  const listIconClasses = cn(
    `mt-0.5 ${ICON_SIZES.SIZE_5} flex-shrink-0`,
    isNegative ? 'text-destructive' : 'text-primary'
  );

  return (
    <Card className={cardClasses}>
      {/* Header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className={iconContainerClasses}>
          <Icon className={iconClasses} aria-hidden='true' />
        </div>
        <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>{title}</h3>
      </div>

      {/* List */}
      <ul className='space-y-3'>
        {items.map((text) => (
          <li key={text} className='flex items-start gap-3 text-muted-foreground'>
            <ListIcon className={listIconClasses} aria-hidden='true' />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

ComparisonCards.displayName = 'ComparisonCards';
