// src/components/molecules/ResultsTableHeader.tsx
'use client';

import * as React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
      <TableRow className='bg-card hover:bg-card'>
        {/* IMPORTANT: Use TEXT_LG to match other section headings
            ("Enter Income Tax Details" and "Display Periods" both use TEXT_LG)
            This maintains consistent visual hierarchy across all main sections */}
        <TableHead
          className={cn(
            'sticky left-0 z-20 w-48 whitespace-nowrap bg-card font-semibold text-foreground',
            SPACING.PX_2,
            'py-2.5',
            TYPOGRAPHY.TEXT_LG,
          )}
        >
          Payslip
        </TableHead>
        <TableHead
          className={cn(
            'w-14 text-right font-semibold',
            SPACING.PX_2,
            'py-2.5',
            TYPOGRAPHY.TEXT_SM,
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
                  'min-w-48 text-center font-semibold',
                  SPACING.PX_2,
                  'py-2.5',
                  TYPOGRAPHY.TEXT_SM,
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
                  'min-w-24 whitespace-nowrap text-right font-semibold',
                  SPACING.PX_2,
                  'py-2.5',
                  TYPOGRAPHY.TEXT_SM,
                )}
              >
                {period}
              </TableHead>
            ))}
      </TableRow>
      {hasWhatIfResults && (
        <TableRow className='bg-card hover:bg-card'>
          <TableHead
            className={cn('sticky left-0 z-20 bg-card', SPACING.PX_2, 'py-1.5')}
            colSpan={2}
          />
          {visiblePeriods.map((period) => (
            <React.Fragment key={period}>
              <TableHead
                className={cn(
                  'min-w-24 whitespace-nowrap bg-primary/10 text-center font-medium',
                  SPACING.PX_2,
                  SPACING.PY_2,
                  TYPOGRAPHY.TEXT_SM,
                )}
              >
                Current
                <span className='sr-only'> scenario values</span>
              </TableHead>
              <TableHead
                className={cn(
                  'min-w-24 whitespace-nowrap bg-accent/10 text-center font-medium',
                  SPACING.PX_2,
                  SPACING.PY_2,
                  TYPOGRAPHY.TEXT_SM,
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
