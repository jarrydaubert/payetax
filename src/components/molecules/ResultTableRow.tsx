// src/components/molecules/ResultTableRow.tsx
'use client';

import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
  const hasWhatIf = whatIfAnnual !== undefined;
  return (
    <TableRow
      className={`border-b transition-colors hover:bg-muted/50 ${
        isHighlight ? 'border-t border-t-border bg-primary/5' : ''
      }`}
    >
      <TableCell
        className={`${color} ${isHighlight ? 'font-bold' : ''} sticky left-0 z-10 w-[195px] bg-background px-2 py-2.5`}
      >
        <div className={cn('flex items-center', SPACING.GAP_1_5, isSubRow && 'pl-4 sm:pl-6')}>
          <Icon className={cn(ICON_SIZES.SIZE_3_5, 'flex-shrink-0')} aria-hidden='true' />
          <span className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>{category}</span>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          'w-[55px] px-2 py-2.5 text-right font-mono',
          TYPOGRAPHY.TEXT_SM,
          color,
          isHighlight && 'font-bold'
        )}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const currentValue = annual / periodOptions[period];
        const whatIfValue =
          whatIfAnnual !== undefined ? whatIfAnnual / periodOptions[period] : undefined;

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns with min-width to prevent overlap
          return (
            <React.Fragment key={period}>
              <TableCell
                className={cn(
                  'min-w-[100px] whitespace-nowrap bg-blue-500/10 px-2 py-2.5 text-right font-mono',
                  TYPOGRAPHY.TEXT_SM,
                  color,
                  isHighlight && 'font-bold'
                )}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={cn(
                  'min-w-[100px] whitespace-nowrap bg-purple-500/10 px-2 py-2.5 text-right font-mono',
                  TYPOGRAPHY.TEXT_SM,
                  color,
                  isHighlight && 'font-bold'
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
              isHighlight && 'font-bold'
            )}
          >
            {formatCurrency(currentValue)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
