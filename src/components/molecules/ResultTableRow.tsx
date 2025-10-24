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
        className={`${color} ${isHighlight ? 'font-bold' : ''} sticky left-0 z-10 bg-background`}
      >
        <div className={`flex items-center gap-2 ${isSubRow ? 'pl-6 sm:pl-8' : ''}`}>
          <Icon className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
          <span className='whitespace-nowrap text-xs sm:text-sm'>{category}</span>
        </div>
      </TableCell>
      <TableCell
        className={`text-right font-mono text-xs sm:text-sm ${color} ${
          isHighlight ? 'font-bold' : ''
        }`}
      >
        {percentage}
      </TableCell>
      {visiblePeriods.map((period) => {
        const currentValue = annual / periodOptions[period];
        const whatIfValue = whatIfAnnual ? whatIfAnnual / periodOptions[period] : undefined;

        if (hasWhatIf && whatIfValue !== undefined) {
          // Render Current and What If columns
          return (
            <React.Fragment key={period}>
              <TableCell
                className={`min-w-[110px] bg-blue-500/10 text-right font-mono text-xs sm:min-w-[120px] sm:text-sm md:min-w-[130px] lg:min-w-[140px] xl:min-w-[150px] 2xl:min-w-[160px] ${color} ${
                  isHighlight ? 'font-bold' : ''
                }`}
              >
                {formatCurrency(currentValue)}
              </TableCell>
              <TableCell
                className={`min-w-[110px] bg-purple-500/10 text-right font-mono text-xs sm:min-w-[120px] sm:text-sm md:min-w-[130px] lg:min-w-[140px] xl:min-w-[150px] 2xl:min-w-[160px] ${color} ${
                  isHighlight ? 'font-bold' : ''
                }`}
              >
                {formatCurrency(whatIfValue)}
              </TableCell>
            </React.Fragment>
          );
        }

        // Render single column (normal view)
        return (
          <TableCell
            key={period}
            className={`min-w-[100px] text-right font-mono text-xs sm:min-w-[110px] sm:text-sm md:min-w-[120px] lg:min-w-[130px] xl:min-w-[140px] 2xl:min-w-[150px] ${color} ${
              isHighlight ? 'font-bold' : ''
            }`}
          >
            {formatCurrency(currentValue)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
