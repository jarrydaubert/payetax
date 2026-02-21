// src/components/organisms/SalaryComparison/ComparisonResultsTable.tsx
'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/ui/table';
import { SPACING } from '@/constants/designTokens';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { useMouseDragScroll } from '@/hooks/useMouseDragScroll';
import type { ComparisonResults } from '@/lib/salaryComparison';
import { cn, formatCurrency } from '@/lib/utils';

interface ComparisonResultsTableProps {
  results: ComparisonResults;
  className?: string;
}

export function ComparisonResultsTable({ results, className }: ComparisonResultsTableProps) {
  const {
    currentResults,
    newResults,
    grossDiff,
    taxDiff,
    niDiff,
    studentLoanDiff,
    pensionDiff,
    netDiff,
  } = results;

  // Enable horizontal scroll with drag
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { showLeftIndicator, showRightIndicator } = useHorizontalScrollIndicator(containerRef);
  useMouseDragScroll(containerRef);

  // Unique ID for accessibility
  const scrollHintId = React.useId();

  /**
   * Render a difference cell with appropriate direction indicator
   * @param diff - The signed difference (new - current)
   * @param higherIsBetter - true if positive diff is good (e.g., gross salary), false if bad (e.g., tax)
   */
  const renderDiff = React.useCallback((diff: number, higherIsBetter: boolean) => {
    if (diff === 0) return <span className='text-muted-foreground'>—</span>;

    // Determine if this is a gain (good outcome) based on direction preference
    const isGain = higherIsBetter ? diff > 0 : diff < 0;
    const amount = Math.abs(diff);

    return (
      <div
        className={cn(
          'flex items-center justify-end',
          SPACING.GAP_1,
          isGain ? 'text-success' : 'text-warning',
        )}
      >
        {isGain ? <ArrowUp className='size-4' /> : <ArrowDown className='size-4' />}
        <span className='font-medium'>{formatCurrency(amount, 0)}</span>
      </div>
    );
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Scroll Indicators */}
      <ScrollIndicator direction='left' visible={showLeftIndicator} />
      <ScrollIndicator direction='right' visible={showRightIndicator} />

      {/* Screen reader hint for scrollable region */}
      <div id={scrollHintId} className='sr-only'>
        Horizontally scrollable table. Use swipe, scroll, or click and drag to view all columns.
      </div>

      <section
        ref={containerRef}
        className='scroll-area-thin cursor-grab touch-pan-x overflow-x-auto scroll-smooth rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing'
        aria-label='Salary comparison results'
        aria-describedby={scrollHintId}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope='col' className='sticky top-0 z-10 min-w-32 bg-background'>
                Metric
              </TableHead>
              <TableHead
                scope='col'
                className='sticky top-0 z-10 whitespace-nowrap bg-background text-right'
              >
                Current
              </TableHead>
              <TableHead
                scope='col'
                className='sticky top-0 z-10 whitespace-nowrap bg-background text-right'
              >
                New
              </TableHead>
              <TableHead
                scope='col'
                className='sticky top-0 z-10 whitespace-nowrap bg-background text-right'
              >
                Difference
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Gross Salary */}
            <TableRow>
              <TableCell className='font-medium'>Gross Salary</TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(currentResults.grossSalary.annually, 0)}
              </TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(newResults.grossSalary.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(grossDiff, true)}</TableCell>
            </TableRow>

            {/* Income Tax */}
            <TableRow>
              <TableCell className='font-medium'>Income Tax</TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(currentResults.incomeTax.annually, 0)}
              </TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(newResults.incomeTax.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(taxDiff, false)}</TableCell>
            </TableRow>

            {/* National Insurance */}
            <TableRow>
              <TableCell className='font-medium'>National Insurance</TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(currentResults.nationalInsurance.annually, 0)}
              </TableCell>
              <TableCell className='whitespace-nowrap text-right'>
                {formatCurrency(newResults.nationalInsurance.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(niDiff, false)}</TableCell>
            </TableRow>

            {/* Student Loan (if applicable) */}
            {(studentLoanDiff !== 0 || currentResults.studentLoan.annually > 0) && (
              <TableRow>
                <TableCell className='font-medium'>Student Loan</TableCell>
                <TableCell className='whitespace-nowrap text-right'>
                  {formatCurrency(currentResults.studentLoan.annually, 0)}
                </TableCell>
                <TableCell className='whitespace-nowrap text-right'>
                  {formatCurrency(newResults.studentLoan.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>{renderDiff(studentLoanDiff, false)}</TableCell>
              </TableRow>
            )}

            {/* Pension (if applicable) */}
            {(pensionDiff !== 0 || currentResults.pensionContribution.annually > 0) && (
              <TableRow>
                <TableCell className='font-medium'>Pension</TableCell>
                <TableCell className='whitespace-nowrap text-right'>
                  {formatCurrency(currentResults.pensionContribution.annually, 0)}
                </TableCell>
                <TableCell className='whitespace-nowrap text-right'>
                  {formatCurrency(newResults.pensionContribution.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>{renderDiff(pensionDiff, false)}</TableCell>
              </TableRow>
            )}

            {/* Net Pay (highlighted) - reuses renderDiff for consistency */}
            <TableRow className='border-t-2 bg-muted/30'>
              <TableCell className='font-bold'>Take-Home Pay</TableCell>
              <TableCell className='whitespace-nowrap text-right font-semibold'>
                {formatCurrency(currentResults.netPay.annually, 0)}
              </TableCell>
              <TableCell className='whitespace-nowrap text-right font-semibold'>
                {formatCurrency(newResults.netPay.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>
                {netDiff === 0 ? (
                  <span className='text-muted-foreground'>—</span>
                ) : (
                  <div
                    className={cn(
                      'flex items-center justify-end',
                      SPACING.GAP_1,
                      netDiff > 0 ? 'text-success' : 'text-warning',
                    )}
                  >
                    {netDiff > 0 ? (
                      <ArrowUp className='size-5' />
                    ) : (
                      <ArrowDown className='size-5' />
                    )}
                    <span className='font-bold text-lg'>
                      {formatCurrency(Math.abs(netDiff), 0)}
                    </span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
