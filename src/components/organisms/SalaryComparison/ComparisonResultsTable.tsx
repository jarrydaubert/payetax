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
} from '@/components/ui/table';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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

  const renderDiff = React.useCallback((diff: number, isPositive: boolean = diff > 0) => {
    if (diff === 0) return <span className='text-muted-foreground'>—</span>;

    const isGain = isPositive;
    return (
      <div
        className={cn(
          `flex items-center ${SPACING.GAP_1}`,
          isGain ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400',
        )}
      >
        {isGain ? <ArrowUp className='size-3' /> : <ArrowDown className='size-3' />}
        <span className='font-medium'>
          {isGain ? '+' : ''}
          {formatCurrency(diff, 0)}
        </span>
      </div>
    );
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Scroll Indicators */}
      <ScrollIndicator direction='left' visible={showLeftIndicator} />
      <ScrollIndicator direction='right' visible={showRightIndicator} />

      <section
        ref={containerRef}
        className='cursor-grab touch-pan-x overflow-x-auto scroll-smooth rounded-lg border active:cursor-grabbing'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
          WebkitOverflowScrolling: 'touch',
        }}
        aria-label='Salary comparison results - scrollable'
      >
        <Table aria-label='Salary comparison results'>
          <TableHeader>
            <TableRow>
              <TableHead scope='col' className='sticky top-0 z-10 w-[30%] bg-background'>
                Metric
              </TableHead>
              <TableHead scope='col' className='sticky top-0 z-10 bg-background text-right'>
                Current
              </TableHead>
              <TableHead scope='col' className='sticky top-0 z-10 bg-background text-right'>
                New
              </TableHead>
              <TableHead scope='col' className='sticky top-0 z-10 bg-background text-right'>
                Difference
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Gross Salary */}
            <TableRow>
              <TableCell className='font-medium'>Gross Salary</TableCell>
              <TableCell className='text-right'>
                {formatCurrency(currentResults.grossSalary.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(newResults.grossSalary.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(grossDiff, true)}</TableCell>
            </TableRow>

            {/* Income Tax */}
            <TableRow>
              <TableCell className='font-medium'>Income Tax</TableCell>
              <TableCell className='text-right'>
                {formatCurrency(currentResults.incomeTax.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(newResults.incomeTax.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(taxDiff, false)}</TableCell>
            </TableRow>

            {/* National Insurance */}
            <TableRow>
              <TableCell className='font-medium'>National Insurance</TableCell>
              <TableCell className='text-right'>
                {formatCurrency(currentResults.nationalInsurance.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(newResults.nationalInsurance.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>{renderDiff(niDiff, false)}</TableCell>
            </TableRow>

            {/* Student Loan (if applicable) */}
            {(studentLoanDiff !== 0 || currentResults.studentLoan.annually > 0) && (
              <TableRow>
                <TableCell className='font-medium'>Student Loan</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(currentResults.studentLoan.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(newResults.studentLoan.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>{renderDiff(studentLoanDiff, false)}</TableCell>
              </TableRow>
            )}

            {/* Pension (if applicable) */}
            {(pensionDiff !== 0 || currentResults.pensionContribution.annually > 0) && (
              <TableRow>
                <TableCell className='font-medium'>Pension</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(currentResults.pensionContribution.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(newResults.pensionContribution.annually, 0)}
                </TableCell>
                <TableCell className='text-right'>{renderDiff(pensionDiff, false)}</TableCell>
              </TableRow>
            )}

            {/* Net Pay (highlighted) */}
            <TableRow className='border-t-2 bg-muted/30'>
              <TableCell className='font-bold'>Take-Home Pay</TableCell>
              <TableCell className='text-right font-semibold'>
                {formatCurrency(currentResults.netPay.annually, 0)}
              </TableCell>
              <TableCell className='text-right font-semibold'>
                {formatCurrency(newResults.netPay.annually, 0)}
              </TableCell>
              <TableCell className='text-right'>
                <div className={`flex items-center justify-end ${SPACING.GAP_1}`}>
                  {netDiff > 0 ? (
                    <div
                      className={`flex items-center ${SPACING.GAP_1} text-green-600 dark:text-green-400`}
                    >
                      <ArrowUp className={ICON_SIZES.SIZE_4} />
                      <span className={`font-bold ${TYPOGRAPHY.TEXT_LG}`}>
                        +{formatCurrency(netDiff, 0)}
                      </span>
                    </div>
                  ) : netDiff < 0 ? (
                    <div
                      className={`flex items-center ${SPACING.GAP_1} text-amber-600 dark:text-amber-400`}
                    >
                      <ArrowDown className={ICON_SIZES.SIZE_4} />
                      <span className={`font-bold ${TYPOGRAPHY.TEXT_LG}`}>
                        {formatCurrency(netDiff, 0)}
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
