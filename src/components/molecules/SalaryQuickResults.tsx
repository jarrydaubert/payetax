// src/components/molecules/SalaryQuickResults.tsx
'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
      <Card className={cn('p-6', 'sm:p-8')}>
        <div className={'space-y-6'}>
          {/* Main Take-Home */}
          <div className='text-center'>
            <p className={cn('text-muted-foreground uppercase tracking-wide', 'text-sm')}>
              Monthly Take-Home Pay
            </p>
            <p className={cn('font-bold text-primary', 'mt-2', 'text-4xl')}>
              £{results.netPay.monthly.toLocaleString('en-GB')}
            </p>
            <p className={cn('text-muted-foreground', 'mt-2', 'text-sm')}>
              After tax and National Insurance
            </p>
          </div>

          {/* Quick Breakdown */}
          <div className={cn('grid grid-cols-2 border-t', 'gap-4', 'pt-4')}>
            <div>
              <p className={cn('text-muted-foreground', 'text-xs')}>Annual Take-Home</p>
              <p className={cn('font-semibold', 'text-xl')}>
                £{results.netPay.annually.toLocaleString('en-GB')}
              </p>
            </div>
            <div>
              <p className={cn('text-muted-foreground', 'text-xs')}>Weekly Take-Home</p>
              <p className={cn('font-semibold', 'text-xl')}>
                £{results.netPay.weekly.toLocaleString('en-GB')}
              </p>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className={cn('border-t', 'space-y-3', 'pt-4')}>
            <div className='flex justify-between'>
              <span className={cn('text-muted-foreground', 'text-sm')}>Gross Salary</span>
              <span className='font-medium'>£{formattedSalary}</span>
            </div>
            <div className='flex justify-between text-destructive'>
              <span className={'text-sm'}>Income Tax</span>
              <span className='font-medium'>
                -£{results.incomeTax.annually.toLocaleString('en-GB')}
              </span>
            </div>
            <div className='flex justify-between text-destructive'>
              <span className={'text-sm'}>National Insurance</span>
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
          <div className={cn('rounded-lg bg-muted/50', 'p-4')}>
            <div className='flex items-center justify-between'>
              <span className={'text-sm'}>Effective Tax Rate</span>
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
      <Card className={cn('mt-4', 'p-4')}>
        <h2 className={cn('flex items-center font-semibold', 'mb-3', 'gap-2')}>
          <TrendingUp className={'size-4'} aria-hidden='true' />
          Popular Salaries Nearby
        </h2>
        <div className={cn('grid grid-cols-2', 'gap-2')}>
          {comparisons.map((comp) => (
            <Link
              key={comp.amount}
              href='/'
              className={cn(
                'rounded-md px-3 py-2 text-center',
                'text-sm',
                'border border-border hover:border-primary',
                'transition-colors hover:bg-primary/5',
              )}
            >
              <span className={cn('text-muted-foreground', 'text-xs')}>{comp.label}</span>
              <br />£{comp.amount.toLocaleString('en-GB')}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
