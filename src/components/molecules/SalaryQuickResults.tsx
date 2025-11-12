// src/components/molecules/SalaryQuickResults.tsx
'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

interface SalaryQuickResultsProps {
  salary: number;
  results: TaxCalculationResults;
  comparisons: Array<{ amount: number; label: string }>;
}

/**
 * Quick results card molecule for salary landing pages
 * Shows monthly/annual take-home, tax breakdown, and salary comparisons
 */
export function SalaryQuickResults({ salary, results, comparisons }: SalaryQuickResultsProps) {
  const formattedSalary = salary.toLocaleString('en-GB');

  return (
    <div className='lg:sticky lg:top-24 lg:self-start'>
      <h1
        className={cn(
          'mb-2 font-bold',
          TYPOGRAPHY.TEXT_2XL,
          `sm:${TYPOGRAPHY.TEXT_3XL}`,
          `lg:${TYPOGRAPHY.TEXT_4XL}`
        )}
      >
        £{formattedSalary} Salary After Tax
      </h1>
      <p className={cn('text-muted-foreground', SPACING.MB_6)}>
        UK take-home pay calculator for 2025-26 tax year
      </p>

      <Card className={cn(SPACING.P_6, 'sm:p-8')}>
        <div className={SPACING.SPACE_Y_6}>
          {/* Main Take-Home */}
          <div className='text-center'>
            <p className={cn('text-muted-foreground uppercase tracking-wide', TYPOGRAPHY.TEXT_SM)}>
              Monthly Take-Home Pay
            </p>
            <p className={cn('font-bold text-primary', SPACING.MT_2, TYPOGRAPHY.TEXT_4XL)}>
              £{results.netPay.monthly.toLocaleString('en-GB')}
            </p>
            <p className={cn('text-muted-foreground', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
              After tax and National Insurance
            </p>
          </div>

          {/* Quick Breakdown */}
          <div className={cn('grid grid-cols-2 border-t', SPACING.GAP_4, SPACING.PT_4)}>
            <div>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>Annual Take-Home</p>
              <p className={cn('font-semibold', TYPOGRAPHY.TEXT_XL)}>
                £{results.netPay.annually.toLocaleString('en-GB')}
              </p>
            </div>
            <div>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>Weekly Take-Home</p>
              <p className={cn('font-semibold', TYPOGRAPHY.TEXT_XL)}>
                £{results.netPay.weekly.toLocaleString('en-GB')}
              </p>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className={cn('border-t', SPACING.SPACE_Y_3, SPACING.PT_4)}>
            <div className='flex justify-between'>
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>Gross Salary</span>
              <span className='font-medium'>£{formattedSalary}</span>
            </div>
            <div className='flex justify-between text-destructive'>
              <span className={TYPOGRAPHY.TEXT_SM}>Income Tax</span>
              <span className='font-medium'>
                -£{results.incomeTax.annually.toLocaleString('en-GB')}
              </span>
            </div>
            <div className='flex justify-between text-destructive'>
              <span className={TYPOGRAPHY.TEXT_SM}>National Insurance</span>
              <span className='font-medium'>
                -£{results.nationalInsurance.annually.toLocaleString('en-GB')}
              </span>
            </div>
            <div className='flex justify-between border-t pt-2 font-semibold'>
              <span>Net Pay (Annual)</span>
              <span className='text-primary'>
                £{results.netPay.annually.toLocaleString('en-GB')}
              </span>
            </div>
          </div>

          {/* Effective Tax Rate */}
          <div className={cn('rounded-lg bg-muted/50', SPACING.P_4)}>
            <div className='flex items-center justify-between'>
              <span className={TYPOGRAPHY.TEXT_SM}>Effective Tax Rate</span>
              <Badge variant='secondary' className='font-mono'>
                {(
                  ((results.incomeTax.annually + results.nationalInsurance.annually) / salary) *
                  100
                ).toFixed(1)}
                %
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Compare Salaries */}
      <Card className={cn(SPACING.MT_4, SPACING.P_4)}>
        <h2 className={cn('flex items-center font-semibold', SPACING.MB_3, SPACING.GAP_2)}>
          <TrendingUp className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          Compare Similar Salaries
        </h2>
        <div className={cn('grid grid-cols-2', SPACING.GAP_2)}>
          {comparisons.map((comp) => (
            <Link
              key={comp.amount}
              href={`/calculator/${comp.amount}-after-tax`}
              className={cn(
                'rounded-md px-3 py-2 text-center',
                TYPOGRAPHY.TEXT_SM,
                'border border-border hover:border-primary',
                'transition-colors hover:bg-primary/5'
              )}
            >
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>{comp.label}</span>
              <br />£{comp.amount.toLocaleString('en-GB')}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
