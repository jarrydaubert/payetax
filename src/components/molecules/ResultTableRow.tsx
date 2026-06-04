// src/components/molecules/ResultTableRow.tsx
'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { PayPeriod } from '@/constants/taxRates';

// Create motion component once at module level (Framer Motion best practice)
const MotionTableRow = motion.create(TableRow);

import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { ARBITRARY, ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { PERIOD_LABEL_TO_PAY_PERIOD } from '@/lib/calculatorResultsPresenter';
import { cn, formatCurrency } from '@/lib/utils';

interface ResultTableRowProps {
  category: string;
  icon: React.ElementType;
  annual: number;
  whatIfAnnual?: number;
  valuesByPeriod?: Partial<Record<PayPeriod, number>>;
  whatIfValuesByPeriod?: Partial<Record<PayPeriod, number>>;
  percentage: string;
  color: string;
  isHighlight?: boolean;
  isSubRow?: boolean;
  visiblePeriods: string[];
  periodOptions: Record<string, number>;
}

/**
 * Table row component for displaying a single calculation result.
 * Handles icon, category name, percentage, and values across multiple time periods.
 * Follows atomic design pattern - molecule for consistent row rendering.
 * Uses design tokens: SIZE_3_5 for compact table icons, TEXT_SM for all text, GAP_1_5 for tight spacing
 * Enhanced with layout animations (PAYTAX-75 Phase 3: Framer Motion Maximization)
 */
export function ResultTableRow({
  category,
  icon: Icon,
  annual,
  whatIfAnnual,
  valuesByPeriod,
  whatIfValuesByPeriod,
  percentage,
  color,
  isHighlight = false,
  isSubRow = false,
  visiblePeriods,
  periodOptions,
}: ResultTableRowProps) {
  const shouldReduceMotion = useMotionPreference();
  const hasWhatIf = whatIfAnnual !== undefined;

  // Use static TableRow if motion is reduced, otherwise use animated version
  const RowComponent = shouldReduceMotion ? TableRow : MotionTableRow;

  return (
    <RowComponent
      className={cn(
        'border-border/80 border-b transition-colors hover:bg-secondary/60',
        isHighlight && 'border-primary/40 border-y bg-primary/10 hover:bg-primary/10',
      )}
      layout={!shouldReduceMotion}
      transition={!shouldReduceMotion ? ANIMATION_TRANSITIONS.layout : undefined}
    >
      <th
        scope='row'
        className={cn(
          color,
          isHighlight && 'font-bold',
          'sticky left-0 z-10 border-border/80 border-r bg-card px-2.5 py-3 text-left font-normal',
          ARBITRARY.TABLE_LABEL_WIDTH,
        )}
      >
        <div className={cn('flex items-center', SPACING.GAP_1_5, isSubRow && 'pl-4 sm:pl-6')}>
          <Icon className={cn(ICON_SIZES.SIZE_3_5, 'flex-shrink-0')} aria-hidden='true' />
          <span className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>{category}</span>
        </div>
      </th>
      <TableCell
        className={cn(
          'w-14 border-border/60 border-r px-2.5 py-3 text-right font-mono tabular-nums',
          TYPOGRAPHY.TEXT_SM,
          color,
          isHighlight && 'font-bold',
        )}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const divisor = periodOptions[period] ?? 1;
        const periodKey = PERIOD_LABEL_TO_PAY_PERIOD[period];
        const currentValue =
          (periodKey ? valuesByPeriod?.[periodKey] : undefined) ?? annual / divisor;
        const whatIfValue =
          (periodKey ? whatIfValuesByPeriod?.[periodKey] : undefined) ??
          (whatIfAnnual !== undefined ? whatIfAnnual / divisor : undefined);

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns with min-width to prevent overlap
          return (
            <React.Fragment key={period}>
              <TableCell
                className={cn(
                  'min-w-28 whitespace-nowrap bg-primary/10 px-2.5 py-3 text-right font-mono tabular-nums',
                  TYPOGRAPHY.TEXT_SM,
                  color,
                  isHighlight && 'font-bold',
                )}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={cn(
                  'min-w-28 whitespace-nowrap bg-success/10 px-2.5 py-3 text-right font-mono tabular-nums',
                  TYPOGRAPHY.TEXT_SM,
                  color,
                  isHighlight && 'font-bold',
                )}
              >
                {formatCurrency(whatIfValue)}
              </TableCell>
            </React.Fragment>
          );
        }

        // Render single column (normal view) with min-width
        return (
          <TableCell
            key={period}
            className={cn(
              'min-w-28 whitespace-nowrap px-2.5 py-3 text-right font-mono tabular-nums',
              TYPOGRAPHY.TEXT_SM,
              color,
              isHighlight && 'font-bold',
            )}
          >
            {formatCurrency(currentValue)}
          </TableCell>
        );
      })}
    </RowComponent>
  );
}
