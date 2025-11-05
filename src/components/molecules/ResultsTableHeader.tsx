// src/components/molecules/ResultsTableHeader.tsx
'use client';

import * as React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TYPOGRAPHY } from '@/constants/designTokens';

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
          className={`sticky left-0 z-20 w-[195px] whitespace-nowrap bg-card px-2 py-2.5 font-semibold text-foreground ${TYPOGRAPHY.TEXT_LG}`}
        >
          Payslip
        </TableHead>
        <TableHead
          className={`w-[55px] px-2 py-2.5 text-right font-semibold ${TYPOGRAPHY.TEXT_SM}`}
        >
          %
        </TableHead>
        {hasWhatIfResults
          ? // Two-row header for What If comparison - wider columns needed for Current/What If
            visiblePeriods.map((period) => (
              <TableHead
                key={period}
                className={`min-w-[200px] px-2 py-2.5 text-center font-semibold ${TYPOGRAPHY.TEXT_SM}`}
                colSpan={2}
              >
                {period}
              </TableHead>
            ))
          : // Single-row header for normal view
            visiblePeriods.map((period) => (
              <TableHead
                key={period}
                className={`min-w-[100px] whitespace-nowrap px-2 py-2.5 text-right font-semibold ${TYPOGRAPHY.TEXT_SM}`}
              >
                {period}
              </TableHead>
            ))}
      </TableRow>
      {hasWhatIfResults && (
        <TableRow className='bg-card hover:bg-card'>
          <TableHead className='sticky left-0 z-20 bg-card px-2 py-1.5' colSpan={2} />
          {visiblePeriods.map((period) => (
            <React.Fragment key={period}>
              <TableHead
                className={`min-w-[100px] whitespace-nowrap bg-blue-500/10 px-2 py-2 text-center font-medium ${TYPOGRAPHY.TEXT_SM}`}
              >
                Current
              </TableHead>
              <TableHead
                className={`min-w-[100px] whitespace-nowrap bg-purple-500/10 px-2 py-2 text-center font-medium ${TYPOGRAPHY.TEXT_SM}`}
              >
                What If
              </TableHead>
            </React.Fragment>
          ))}
        </TableRow>
      )}
    </TableHeader>
  );
}
