// src/components/molecules/ResultTableRow.tsx
'use client';

import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

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
        <div className={`flex items-center gap-1.5 ${isSubRow ? 'pl-4 sm:pl-6' : ''}`}>
          <Icon className='h-3.5 w-3.5 flex-shrink-0' aria-hidden='true' />
          <span className='whitespace-nowrap text-sm'>{category}</span>
        </div>
      </TableCell>
      <TableCell
        className={`text-right font-mono text-sm ${color} ${
          isHighlight ? 'font-bold' : ''
        } w-[55px] px-2 py-2.5`}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const currentValue = annual / periodOptions[period];
        const whatIfValue = whatIfAnnual ? whatIfAnnual / periodOptions[period] : undefined;

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns with min-width to prevent overlap
          return (
            <React.Fragment key={period}>
              <TableCell
                className={`min-w-[100px] bg-blue-500/10 text-right font-mono text-sm ${color} ${
                  isHighlight ? 'font-bold' : ''
                } whitespace-nowrap px-2 py-2.5`}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={`min-w-[100px] bg-purple-500/10 text-right font-mono text-sm ${color} ${
                  isHighlight ? 'font-bold' : ''
                } whitespace-nowrap px-2 py-2.5`}
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
            className={`min-w-[100px] text-right font-mono text-sm ${color} ${
              isHighlight ? 'font-bold' : ''
            } whitespace-nowrap px-2 py-2.5`}
          >
            {formatCurrency(currentValue)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
