// src/components/organisms/SalaryComparison/MarginalRateInsight.tsx
'use client';

import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn, formatCurrency } from '@/lib/utils';

interface MarginalRateInsightProps {
  /** Gross salary increase amount */
  increase: number;
  /** Net take-home increase amount */
  netDiff: number;
  className?: string;
}

/**
 * Displays insight into how much of a salary increase the user actually keeps
 * after tax, NI, and other deductions.
 *
 * Derives keep rate and lost rate from the provided amounts to ensure consistency.
 * Properly handles edge cases like negative values and percentages > 100%.
 */
export function MarginalRateInsight({ increase, netDiff, className }: MarginalRateInsightProps) {
  // Clamp inputs to safe values
  const safeIncrease = Math.max(0, increase);
  const safeNet = Math.max(0, Math.min(netDiff, safeIncrease));

  // Derive amounts
  const keepAmount = safeNet;
  const lostAmount = safeIncrease - keepAmount;

  // Derive rates (avoid division by zero)
  const keepRate = safeIncrease > 0 ? (keepAmount / safeIncrease) * 100 : 0;
  const lostRate = 100 - keepRate;

  // Clamp for display and styling
  const keepRateClamped = Math.min(100, Math.max(0, keepRate));
  const keepRateDisplay = Math.round(keepRateClamped);
  const lostRateDisplay = Math.round(Math.min(100, Math.max(0, lostRate)));

  // Handle edge case: no increase
  if (safeIncrease === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className='pt-6'>
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center sm:justify-between',
            SPACING.GAP_4,
          )}
        >
          <div className={cn('flex items-center', SPACING.GAP_3)}>
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-primary/10',
                ICON_SIZES.SIZE_12,
              )}
            >
              <TrendingUp className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
            </div>
            <div>
              <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Marginal Take-Home</h3>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                On your {formatCurrency(safeIncrease, 0)} increase
              </p>
            </div>
          </div>

          <Badge
            variant='default'
            className={cn('h-12 sm:ml-auto', SPACING.PX_6, TYPOGRAPHY.TEXT_XL)}
          >
            {keepRateDisplay}%
          </Badge>
        </div>

        {/* Visual Bar with accessibility */}
        <div className={cn('mt-6', SPACING.SPACE_Y_2)}>
          <div className={cn('flex justify-between', TYPOGRAPHY.TEXT_SM)}>
            <span className='text-muted-foreground'>You keep</span>
            <span className='font-semibold text-success'>
              {formatCurrency(keepAmount, 0)} ({keepRateDisplay}%)
            </span>
          </div>
          <div
            role='progressbar'
            aria-label='Portion of raise kept as take-home pay'
            aria-valuenow={keepRateDisplay}
            aria-valuemin={0}
            aria-valuemax={100}
            className='h-3 w-full overflow-hidden rounded-full bg-muted'
          >
            <div
              className='h-full bg-success transition-all duration-500'
              style={{ width: `${keepRateClamped}%` }}
            />
          </div>
          <div className={cn('flex justify-between', TYPOGRAPHY.TEXT_SM)}>
            <span className='text-muted-foreground'>Lost to deductions</span>
            <span className='font-medium text-warning'>
              {formatCurrency(lostAmount, 0)} ({lostRateDisplay}%)
            </span>
          </div>
        </div>

        {/* Explanation - use foreground color for emphasis */}
        <p className={cn('text-center text-muted-foreground', SPACING.MT_4, TYPOGRAPHY.TEXT_XS)}>
          You keep <span className='font-semibold text-foreground'>{keepRateDisplay}%</span> of the{' '}
          {formatCurrency(safeIncrease, 0)} increase. The remaining{' '}
          <span className='font-semibold text-foreground'>{lostRateDisplay}%</span> goes to tax, NI,
          and deductions.
        </p>
      </CardContent>
    </Card>
  );
}
