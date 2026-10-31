// src/components/molecules/ResultsTableHeader.tsx
'use client';

import * as React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ResultsTableHeaderProps {
  visiblePeriods: string[];
  hasWhatIfResults: boolean;
}

/**
 * Table header molecule for ResultsTable
 * Handles both single-column and What If comparison layouts
 * Design tokens: TEXT_LG for main header, TEXT_SM for period headers
 */
export function ResultsTableHeader({ visiblePeriods, hasWhatIfResults }: ResultsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className='border-border bg-card hover:bg-card'>
        {/* IMPORTANT: Use TEXT_LG to match other section headings
            ("Enter Income Tax Details" and "Display Periods" both use TEXT_LG)
            This maintains consistent visual hierarchy across all main sections */}
        <TableHead
          className={cn(
            'sticky left-0 z-20 min-w-[10.5rem] border-r border-border bg-card font-semibold whitespace-nowrap text-foreground xl:min-w-[11.5rem]',
            'px-2',
            'py-2.5',
            'text-base',
            'sm:text-lg',
          )}
        >
          Breakdown
        </TableHead>
        <TableHead
          className={cn(
            'border-r border-border text-right font-semibold text-muted-foreground',
            'px-2',
            'py-2.5',
            'text-xs xl:text-sm',
          )}
        >
          %
        </TableHead>
        {hasWhatIfResults
          ? // Two-row header for What If comparison - wider columns needed for Current/What If
            visiblePeriods.map((period) => (
              <TableHead
                key={period}
                className={cn(
                  'min-w-[17rem] border-r border-border text-center font-semibold text-muted-foreground',
                  'px-2',
                  'py-2.5',
                  'text-xs xl:text-sm',
                )}
                colSpan={2}
              >
                {period}
              </TableHead>
            ))
          : // Single-row header for normal view
            visiblePeriods.map((period) => (
              <TableHead
                key={period}
                className={cn(
                  'min-w-[8.5rem] text-right font-semibold whitespace-nowrap text-muted-foreground',
                  'px-1.5 xl:px-2',
                  'py-2.5',
                  'text-xs xl:text-sm',
                )}
              >
                {period}
              </TableHead>
            ))}
      </TableRow>
      {hasWhatIfResults && (
        <TableRow className='border-border bg-card hover:bg-card'>
          <TableHead
            className={cn('sticky left-0 z-20 border-r border-border bg-card', 'px-2', 'py-1.5')}
            colSpan={2}
          />
          {visiblePeriods.map((period) => (
            <React.Fragment key={period}>
              <TableHead
                className={cn(
                  'min-w-[8.5rem] bg-primary/10 text-center font-medium whitespace-nowrap text-muted-foreground',
                  'px-2',
                  'py-2',
                  'text-sm',
                )}
              >
                Current
                <span className='sr-only'> scenario values</span>
              </TableHead>
              <TableHead
                className={cn(
                  'min-w-[8.5rem] bg-accent/10 text-center font-medium whitespace-nowrap text-muted-foreground',
                  'px-2',
                  'py-2',
                  'text-sm',
                )}
              >
                What If
                <span className='sr-only'> scenario values</span>
              </TableHead>
            </React.Fragment>
          ))}
        </TableRow>
      )}
    </TableHeader>
  );
}
