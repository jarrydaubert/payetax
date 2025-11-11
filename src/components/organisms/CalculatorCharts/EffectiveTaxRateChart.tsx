'use client';

import { memo, useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TYPOGRAPHY } from '@/constants/designTokens';
import { getChartConfig, getEffectiveTaxRateData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface EffectiveTaxRateChartProps {
  results: TaxCalculationResults;
  isScottish?: boolean;
  className?: string;
}

/**
 * Effective Tax Rate Area Chart
 *
 * Shows how effective tax rate changes across a salary range (±30% from current):
 * - Effective tax rate (total deductions / gross)
 * - Marginal tax rate (rate on next £1 earned)
 * - Current salary position highlighted
 *
 * Helps users understand progressive taxation and optimal salary points.
 *
 * Performance: Memoized with React.memo to prevent unnecessary re-renders
 */
export const EffectiveTaxRateChart = memo(function EffectiveTaxRateChart({
  results,
  isScottish = false,
  className,
}: EffectiveTaxRateChartProps) {
  const currentSalary = results.grossSalary.annually;
  const data = getEffectiveTaxRateData(currentSalary, results, isScottish);
  const chartConfig = getChartConfig('rate');

  // Generate unique IDs for gradients to avoid conflicts when component is rendered multiple times
  const effectiveGradientId = useId();
  const marginalGradientId = useId();

  // Calculate current effective rate for display
  const currentEffectiveRate = useMemo(() => {
    const totalDeductions =
      results.incomeTax.annually +
      results.nationalInsurance.annually +
      results.studentLoan.annually;
    return ((totalDeductions / currentSalary) * 100).toFixed(1);
  }, [results, currentSalary]);

  return (
    <Card className={className}>
      <CardHeader className='pb-2'>
        <CardTitle className={`font-semibold ${TYPOGRAPHY.TEXT_BASE}`}>
          Tax Rate Progression
        </CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          Effective vs marginal rates across salary range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='h-[200px] w-full'
          role='img'
          aria-label='Area chart showing effective and marginal tax rates across salary range with current position highlighted'
        >
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={effectiveGradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(var(--chart-3))' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='hsl(var(--chart-3))' stopOpacity={0} />
                </linearGradient>
                <linearGradient id={marginalGradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(var(--chart-4))' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='hsl(var(--chart-4))' stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray='3 3' opacity={0.3} stroke='hsl(var(--border))' />

              <XAxis
                dataKey='salary'
                type='number'
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                fontSize={10}
                stroke='currentColor'
                tick={{ fill: 'currentColor' }}
                className='text-muted-foreground'
              />

              <YAxis
                domain={[0, 50]}
                tickFormatter={(value) => `${value}%`}
                fontSize={10}
                width={35}
                stroke='currentColor'
                tick={{ fill: 'currentColor' }}
                className='text-muted-foreground'
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatCurrency(Number(value))}
                    formatter={(value, name) => (
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{name}:</span>
                        <span className='font-mono'>{value}%</span>
                      </div>
                    )}
                  />
                }
                wrapperStyle={{ zIndex: 1000 }}
              />

              {/* Current salary indicator */}
              <ReferenceLine
                x={currentSalary}
                stroke='hsl(var(--primary))'
                strokeDasharray='3 3'
                label={{
                  value: 'You',
                  position: 'top',
                  fontSize: 10,
                  fill: 'hsl(var(--primary))',
                }}
              />

              {/* Effective rate area */}
              <Area
                type='monotone'
                dataKey='effectiveTaxRate'
                name='Effective Rate'
                stroke='hsl(var(--chart-3))'
                fill={`url(#${effectiveGradientId})`}
                strokeWidth={2}
              />

              {/* Marginal rate line */}
              <Line
                type='stepAfter'
                dataKey='marginalTaxRate'
                name='Marginal Rate'
                stroke='hsl(var(--chart-4))'
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
              />

              <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ zIndex: 100 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Current stats */}
        <div className={`mt-2 flex justify-between ${TYPOGRAPHY.TEXT_SM}`}>
          <div>
            <p className='text-muted-foreground'>Your Effective Rate</p>
            <p className='font-mono font-semibold text-destructive'>{currentEffectiveRate}%</p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground'>Your Take Home</p>
            <p className='font-mono font-semibold text-green-600 dark:text-green-400'>
              {(100 - Number(currentEffectiveRate)).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
