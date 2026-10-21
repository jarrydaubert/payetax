// src/components/molecules/ResultTableRow.tsx
'use client';

import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { PayPeriod } from '@/constants/taxRates';

import { getResultPeriodValue, PERIOD_LABEL_TO_PAY_PERIOD } from '@/lib/calculatorResultsPresenter';
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
  hoursPerWeek?: number;
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
  hoursPerWeek = 37.5,
}: ResultTableRowProps) {
  const hasWhatIf = whatIfAnnual !== undefined;

  return (
    <TableRow
      role='row'
      className={cn(
        'border-border/80 border-b transition-colors hover:bg-secondary/60',
        isHighlight && 'border-primary/40 border-y bg-primary/10 hover:bg-primary/10',
      )}
    >
      <th
        // biome-ignore lint/a11y/noRedundantRoles: Preserve row-header semantics in the CSS-grid paired layout on WebKit.
        role='rowheader'
        scope='row'
        className={cn(
          color,
          isHighlight && 'font-bold',
          'sticky left-0 z-10 min-w-[10.5rem] border-border/80 border-r bg-card px-2 py-2.5 text-left font-normal xl:min-w-[11.5rem]',
        )}
      >
        <div className={cn('flex items-start', 'gap-1.5', isSubRow && 'pl-3 sm:pl-4')}>
          <Icon className={cn('size-3.5', 'flex-shrink-0')} aria-hidden='true' />
          <span className={cn('min-w-0 leading-tight', 'text-[0.8125rem] xl:text-sm')}>
            {category}
          </span>
        </div>
      </th>
      <TableCell
        className={cn(
          'border-border/60 border-r px-2 py-2.5 text-right font-mono tabular-nums',
          'text-[0.8125rem] xl:text-sm',
          color,
          isHighlight && 'font-bold',
        )}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const divisor = periodOptions[period] ?? 1;
        const periodKey = PERIOD_LABEL_TO_PAY_PERIOD[period];
        const currentValue = periodKey
          ? getResultPeriodValue(annual, valuesByPeriod, periodKey, hoursPerWeek)
          : annual / divisor;
        const whatIfValue =
          whatIfAnnual !== undefined
            ? periodKey
              ? getResultPeriodValue(whatIfAnnual, whatIfValuesByPeriod, periodKey, hoursPerWeek)
              : whatIfAnnual / divisor
            : undefined;

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns with min-width to prevent overlap
          return (
            <React.Fragment key={period}>
              <TableCell
                className={cn(
                  'min-w-[8rem] whitespace-nowrap bg-primary/10 px-2 py-2.5 text-right font-mono tabular-nums',
                  'text-[0.8125rem] xl:text-sm',
                  color,
                  isHighlight && 'font-bold',
                )}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={cn(
                  'min-w-[8rem] whitespace-nowrap bg-success/10 px-2 py-2.5 text-right font-mono tabular-nums',
                  'text-[0.8125rem] xl:text-sm',
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
              'min-w-[8rem] whitespace-nowrap px-1.5 py-2.5 text-right font-mono tabular-nums xl:px-2',
              'text-[0.8125rem] xl:text-sm',
              color,
              isHighlight && 'font-bold',
            )}
          >
            {formatCurrency(currentValue)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
