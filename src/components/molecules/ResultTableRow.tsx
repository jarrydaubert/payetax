// src/components/molecules/ResultTableRow.tsx
'use client';

import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface ResultTableRowProps {
  category: string;
  icon: React.ElementType;
  annual: number;
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
  percentage,
  color,
  isHighlight = false,
  isSubRow = false,
  visiblePeriods,
  periodOptions,
}: ResultTableRowProps) {
  return (
    <TableRow
      className={`border-b transition-colors hover:bg-muted/50 ${
        isHighlight ? 'border-t-2 border-t-primary bg-primary/5' : ''
      }`}
    >
      <TableCell
        className={`${color} ${isHighlight ? 'font-bold' : ''} ${
          isSubRow ? 'pl-6 sm:pl-8' : ''
        } sticky left-0 z-10 bg-background`}
      >
        <div className='flex items-center gap-2'>
          <Icon className='h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4' />
          <span className='text-xs sm:text-sm'>{category}</span>
          {isHighlight && (
            <Badge variant='default' className='text-xs'>
              Final
            </Badge>
          )}
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
        const periodValue = annual / periodOptions[period];
        return (
          <TableCell
            key={period}
            className={`text-right font-mono text-xs sm:text-sm ${color} ${
              isHighlight ? 'font-bold' : ''
            }`}
          >
            {formatCurrency(periodValue)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
