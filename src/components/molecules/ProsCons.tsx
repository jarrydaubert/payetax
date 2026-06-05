/**
 * ProsCons Component
 *
 * Displays pros and cons in a clear, visual format.
 * Used on comparison and alternative pages.
 *
 * @module components/molecules/ProsCons
 */

import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export interface ProsConsProps {
  /** List of pros/strengths */
  pros: string[];
  /** List of cons/weaknesses */
  cons: string[];
  /** Pros heading text */
  prosTitle?: string;
  /** Cons heading text */
  consTitle?: string;
  /** Layout variant */
  variant?: 'side-by-side' | 'stacked';
  /** Optional custom className */
  className?: string;
}

/**
 * ProsCons Component
 *
 * @example Side-by-side layout
 * ```tsx
 * <ProsCons
 *   pros={['Fast', 'Clean design', 'Mobile-first']}
 *   cons={['Limited features', 'No maternity pay']}
 *   variant="side-by-side"
 * />
 * ```
 *
 * @example Stacked layout with custom titles
 * ```tsx
 * <ProsCons
 *   pros={competitor.strengths}
 *   cons={competitor.weaknesses}
 *   prosTitle="What They Do Well"
 *   consTitle="Where They Fall Short"
 *   variant="stacked"
 * />
 * ```
 */
export function ProsCons({
  pros,
  cons,
  prosTitle = 'Pros',
  consTitle = 'Cons',
  variant = 'side-by-side',
  className,
}: ProsConsProps) {
  const isSideBySide = variant === 'side-by-side';

  return (
    <div className={cn(isSideBySide ? 'grid gap-6 md:grid-cols-2' : SPACING.SPACE_Y_6, className)}>
      {/* Pros */}
      <Card className={cn('border-success/30 bg-success/5', SPACING.P_6)}>
        <h3
          className={cn(
            'flex items-center font-bold text-success',
            TYPOGRAPHY.TEXT_LG,
            SPACING.MB_4,
            SPACING.GAP_2,
          )}
        >
          <Check className={ICON_SIZES.SIZE_5} aria-hidden='true' />
          {prosTitle}
        </h3>
        <ul className={SPACING.SPACE_Y_3}>
          {pros.map((pro) => (
            <li key={pro} className={cn('flex items-start text-foreground', SPACING.GAP_3)}>
              <Check
                className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 shrink-0 text-success')}
                aria-hidden='true'
              />
              <span className={TYPOGRAPHY.TEXT_SM}>{pro}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Cons */}
      <Card className={cn('border-warning/30 bg-warning/5', SPACING.P_6)}>
        <h3
          className={cn(
            'flex items-center font-bold text-warning',
            TYPOGRAPHY.TEXT_LG,
            SPACING.MB_4,
            SPACING.GAP_2,
          )}
        >
          <X className={ICON_SIZES.SIZE_5} aria-hidden='true' />
          {consTitle}
        </h3>
        <ul className={SPACING.SPACE_Y_3}>
          {cons.map((con) => (
            <li key={con} className={cn('flex items-start text-foreground', SPACING.GAP_3)}>
              <X
                className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 shrink-0 text-warning')}
                aria-hidden='true'
              />
              <span className={TYPOGRAPHY.TEXT_SM}>{con}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/**
 * Single list variant for advantages
 */
export interface AdvantagesListProps {
  /** List of advantages */
  items: string[];
  /** Heading text */
  title?: string;
  /** Optional custom className */
  className?: string;
}

export function AdvantagesList({
  items,
  title = 'Why PayeTax is Better',
  className,
}: AdvantagesListProps) {
  return (
    <Card className={cn('border-primary/30 bg-primary/5', SPACING.P_6, className)}>
      <h3 className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_LG, SPACING.MB_4)}>{title}</h3>
      <ul className={SPACING.SPACE_Y_3}>
        {items.map((item) => (
          <li key={item} className={cn('flex items-start text-foreground', SPACING.GAP_3)}>
            <Check
              className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 shrink-0 text-primary')}
              aria-hidden='true'
            />
            <span className={TYPOGRAPHY.TEXT_SM}>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

ProsCons.displayName = 'ProsCons';
AdvantagesList.displayName = 'AdvantagesList';
