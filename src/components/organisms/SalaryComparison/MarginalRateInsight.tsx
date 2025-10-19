// src/components/organisms/SalaryComparison/MarginalRateInsight.tsx
'use client';

import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MarginalRateInsightProps {
  increase: number;
  netDiff: number;
  marginalRate: number;
  effectiveRate: number;
  className?: string;
}

export function MarginalRateInsight({
  increase,
  netDiff,
  marginalRate,
  effectiveRate,
  className,
}: MarginalRateInsightProps) {
  return (
    <Card className={className}>
      <CardContent className='pt-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex size-12 items-center justify-center rounded-full bg-primary/10'>
              <TrendingUp className='size-6 text-primary' />
            </div>
            <div>
              <h3 className='font-semibold text-lg'>Marginal Rate</h3>
              <p className='text-muted-foreground text-sm'>
                On your {formatCurrency(increase, 0)} increase
              </p>
            </div>
          </div>

          <Badge variant='default' className='h-12 px-6 text-xl sm:ml-auto'>
            {marginalRate}%
          </Badge>
        </div>

        {/* Visual Bar */}
        <div className='mt-6 space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>You keep</span>
            <span className='font-semibold text-green-600 dark:text-green-400'>
              {formatCurrency(netDiff, 0)} ({marginalRate}%)
            </span>
          </div>
          <div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500'
              style={{ width: `${marginalRate}%` }}
            />
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Lost to deductions</span>
            <span className='font-medium text-amber-600 dark:text-amber-400'>
              {formatCurrency(increase - netDiff, 0)} ({effectiveRate}%)
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className='mt-4 text-center text-muted-foreground text-xs'>
          You keep <strong>{marginalRate}%</strong> of the {formatCurrency(increase, 0)} increase.
          The remaining <strong>{effectiveRate}%</strong> goes to tax, NI, and deductions.
        </p>
      </CardContent>
    </Card>
  );
}
