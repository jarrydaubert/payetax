// src/components/organisms/SalaryComparison/MarginalRateInsight.tsx
'use client';

import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn, formatCurrency } from '@/lib/utils';

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
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center sm:justify-between',
            SPACING.GAP_4
          )}
        >
          <div className={cn('flex items-center', SPACING.GAP_3)}>
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-primary/10',
                ICON_SIZES.SIZE_12
              )}
            >
              <TrendingUp className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
            </div>
            <div>
              <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Marginal Rate</h3>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                On your {formatCurrency(increase, 0)} increase
              </p>
            </div>
          </div>

          <Badge variant='default' className='h-12 px-6 text-xl sm:ml-auto'>
            {marginalRate}%
          </Badge>
        </div>

        {/* Visual Bar */}
        <div className={cn('mt-6', SPACING.SPACE_Y_2)}>
          <div className={cn('flex justify-between', TYPOGRAPHY.TEXT_SM)}>
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
          <div className={cn('flex justify-between', TYPOGRAPHY.TEXT_SM)}>
            <span className='text-muted-foreground'>Lost to deductions</span>
            <span className='font-medium text-amber-600 dark:text-amber-400'>
              {formatCurrency(increase - netDiff, 0)} ({effectiveRate}%)
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className={cn('mt-4 text-center text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
          You keep <strong>{marginalRate}%</strong> of the {formatCurrency(increase, 0)} increase.
          The remaining <strong>{effectiveRate}%</strong> goes to tax, NI, and deductions.
        </p>
      </CardContent>
    </Card>
  );
}
