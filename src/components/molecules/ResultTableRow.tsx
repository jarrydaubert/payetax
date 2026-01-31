// src/components/molecules/ResultTableRow.tsx
'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

// Create motion component once at module level (Framer Motion best practice)
const MotionTableRow = motion.create(TableRow);

import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn, formatCurrency } from '@/lib/utils';

interface ResultTableRowProps {
  category: string;
  icon: React.ElementType;
  annual: number;
  whatIfAnnual?: number;
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
      className={`border-b transition-colors hover:bg-muted/50 ${
        isHighlight ? 'border-t border-t-border bg-primary/5' : ''
      }`}
      layout={!shouldReduceMotion}
      transition={!shouldReduceMotion ? ANIMATION_TRANSITIONS.layout : undefined}
    >
      <th
        scope='row'
        className={cn(
          color,
          isHighlight && 'font-bold',
          'sticky left-0 z-10 bg-background px-2 py-2.5 text-left font-normal',
          LAYOUT.TABLE_LABEL_WIDTH,
        )}
      >
        <div className={cn('flex items-center', SPACING.GAP_1_5, isSubRow && 'pl-4 sm:pl-6')}>
          <Icon className={cn(ICON_SIZES.SIZE_3_5, 'flex-shrink-0')} aria-hidden='true' />
          <span className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>{category}</span>
        </div>
      </th>
      <TableCell
        className={cn(
          'w-[55px] px-2 py-2.5 text-right font-mono',
          TYPOGRAPHY.TEXT_SM,
          color,
          isHighlight && 'font-bold',
        )}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const divisor = periodOptions[period] ?? 1;
        const currentValue = annual / divisor;
        const whatIfValue = whatIfAnnual !== undefined ? whatIfAnnual / divisor : undefined;

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns with min-width to prevent overlap
          return (
            <React.Fragment key={period}>
              <TableCell
                className={cn(
                  'min-w-[100px] whitespace-nowrap bg-blue-500/10 px-2 py-2.5 text-right font-mono',
                  TYPOGRAPHY.TEXT_SM,
                  color,
                  isHighlight && 'font-bold',
                )}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={cn(
                  'min-w-[100px] whitespace-nowrap bg-purple-500/10 px-2 py-2.5 text-right font-mono',
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
              'min-w-[100px] whitespace-nowrap px-2 py-2.5 text-right font-mono',
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
