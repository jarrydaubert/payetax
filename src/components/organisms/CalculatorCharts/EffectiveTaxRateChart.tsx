'use client';

import { useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/atoms/ui/chart';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { getChartConfig, getEffectiveTaxRateData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface EffectiveTaxRateChartProps {
  results: TaxCalculationResults;
  isScottish?: boolean;
  className?: string;
}

/** Tax trap zone thresholds */
const TAX_TRAP_START = 100_000;
const TAX_TRAP_END = 125_140;

/**
 * Effective Tax Rate Area Chart
 *
 * Shows how effective tax rate changes across a salary range (±30% from current):
 * - Effective tax rate (income tax + NI + student loan / gross)
 * - Marginal tax rate (rate on next £1 earned)
 * - Current salary position highlighted
 * - £100k-£125,140 tax trap zone highlighted
 *
 * Helps users understand progressive taxation and optimal salary points.
 *
 * Note: "Effective rate" here includes income tax, NI, and student loans.
 * This differs from some definitions that only include income tax.
 */
export function EffectiveTaxRateChart({
  results,
  isScottish = false,
  className,
}: EffectiveTaxRateChartProps) {
  const currentSalary = results.grossSalary.annually;

  // Generate unique IDs for gradients to avoid conflicts across instances
  const effectiveGradientId = useId();
  const marginalGradientId = useId();
  const descriptionId = useId();

  // Memoize expensive data generation
  const data = useMemo(
    () => getEffectiveTaxRateData(currentSalary, results, isScottish),
    [currentSalary, results, isScottish],
  );

  // Chart config is stable - memoize to prevent rerender cascades
  const chartConfig = useMemo(() => getChartConfig('rate'), []);

  // Calculate current effective rate for display
  const { effectiveRate, netRate } = useMemo(() => {
    // Guard against division by zero
    if (currentSalary <= 0) {
      return { effectiveRate: '0.0', netRate: '100.0' };
    }

    const totalDeductions =
      results.incomeTax.annually +
      results.nationalInsurance.annually +
      results.studentLoan.annually;
    const rate = (totalDeductions / currentSalary) * 100;
    return {
      effectiveRate: rate.toFixed(1),
      netRate: (100 - rate).toFixed(1),
    };
  }, [results, currentSalary]);

  // Check if tax trap zone is visible in chart range
  const showTaxTrap = useMemo(() => {
    const range = currentSalary * 0.3;
    const minSalary = Math.max(10000, currentSalary - range);
    const maxSalary = currentSalary + range;
    return maxSalary >= TAX_TRAP_START && minSalary <= TAX_TRAP_END;
  }, [currentSalary]);

  // Screen reader summary
  const srSummary = `At ${formatCurrency(currentSalary)}, your effective deduction rate is ${effectiveRate}% (income tax, National Insurance, and student loans). ${
    showTaxTrap && currentSalary >= TAX_TRAP_START && currentSalary <= TAX_TRAP_END
      ? 'You are currently in the £100k-£125k tax trap zone where marginal rates spike to around 60%.'
      : ''
  }`;

  return (
    <Card className={className}>
      <CardHeader className='pb-2'>
        <CardTitle className={cn('font-semibold', TYPOGRAPHY.TEXT_BASE)}>
          Tax Rate Progression
        </CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          Effective vs marginal rates across salary range
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Screen reader summary */}
        <p id={descriptionId} className='sr-only'>
          {srSummary}
        </p>

        <ChartContainer
          config={chartConfig}
          className='h-[200px] w-full'
          role='img'
          aria-label='Area chart showing effective and marginal tax rates across salary range'
          aria-describedby={descriptionId}
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
                // Dynamic domain to show full range including 60% tax trap
                domain={[0, 70]}
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
                    labelFormatter={(_, payload) => {
                      // Safely extract salary from payload
                      const salary = payload?.[0]?.payload?.salary;
                      return typeof salary === 'number' ? formatCurrency(salary) : '';
                    }}
                    formatter={(value: number | string, name: string) => (
                      <div className={cn('flex items-center', SPACING.GAP_2)}>
                        <span className='font-medium'>{name}:</span>
                        <span className='font-mono'>{value}%</span>
                      </div>
                    )}
                  />
                }
                wrapperStyle={{ zIndex: 1000 }}
              />

              {/* Tax trap zone highlight (£100k-£125,140) */}
              {showTaxTrap && (
                <ReferenceArea
                  x1={TAX_TRAP_START}
                  x2={TAX_TRAP_END}
                  fill='hsl(var(--destructive))'
                  fillOpacity={0.1}
                  stroke='hsl(var(--destructive))'
                  strokeOpacity={0.3}
                  strokeDasharray='3 3'
                />
              )}

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
        <div className={cn('flex justify-between', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
          <div>
            <p className='text-muted-foreground'>Effective Deduction Rate</p>
            <p className='font-mono font-semibold text-destructive'>{effectiveRate}%</p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground'>Net Income Rate</p>
            <p className='font-mono font-semibold text-emerald-600 dark:text-emerald-400'>
              {netRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
