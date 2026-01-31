'use client';

import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { getChartConfig, getTaxLiabilityData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface TaxLiabilityChartProps {
  results: TaxCalculationResults;
  whatIfResults?: TaxCalculationResults | null;
  className?: string;
}

/**
 * Tax Liability Stacked Bar Chart
 *
 * Shows where gross income goes:
 * - Income Tax (red)
 * - National Insurance (amber)
 * - Student Loan (orange, if applicable)
 * - Pension (purple)
 * - Net Pay (green)
 *
 * When What If results exist, shows two bars for comparison.
 *
 * Performance: Memoized with React.memo to prevent unnecessary re-renders
 */
export const TaxLiabilityChart = memo(function TaxLiabilityChart({
  results,
  whatIfResults,
  className,
}: TaxLiabilityChartProps) {
  const { current, whatIf } = getTaxLiabilityData(results, whatIfResults);
  const chartConfig = getChartConfig('liability');

  // Prepare data for stacked bar chart
  const chartData = whatIf
    ? [
        { scenario: 'Current', ...Object.fromEntries(current.map((d) => [d.category, d.amount])) },
        { scenario: 'What If', ...Object.fromEntries(whatIf.map((d) => [d.category, d.amount])) },
      ]
    : [
        {
          scenario: 'Breakdown',
          ...Object.fromEntries(current.map((d) => [d.category, d.amount])),
        },
      ];

  return (
    <Card className={className || ''}>
      <CardHeader className='pb-3'>
        <CardTitle className={`font-semibold ${TYPOGRAPHY.TEXT_LG}`}>Tax Breakdown</CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          {whatIf ? 'Current vs What If comparison' : 'Where your income goes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='h-[250px] w-full'
          role='img'
          aria-label={
            whatIf
              ? 'Stacked bar chart comparing current versus what-if tax breakdown including income tax, national insurance, student loan, pension, and net pay'
              : 'Stacked bar chart showing tax breakdown including income tax, national insurance, student loan, pension, and net pay'
          }
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='hsl(var(--border))' />
              <XAxis type='number' hide />
              <YAxis
                type='category'
                dataKey='scenario'
                width={60}
                fontSize={12}
                stroke='currentColor'
                tick={{ fill: 'currentColor' }}
                className='text-muted-foreground'
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className={cn('flex items-center', SPACING.GAP_2)}>
                        <span className='font-medium'>{name}:</span>
                        <span className='font-mono'>{formatCurrency(Number(value))}</span>
                      </div>
                    )}
                  />
                }
                wrapperStyle={{ zIndex: 1000 }}
              />

              {/* Stack bars in order: Tax, NI, Student Loan, Pension, Net Pay */}
              <Bar
                dataKey='Income Tax'
                stackId='a'
                fill='hsl(var(--chart-3))'
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey='National Insurance'
                stackId='a'
                fill='hsl(var(--chart-4))'
                radius={[0, 0, 0, 0]}
              />
              {current.some((d) => d.category === 'Student Loan') && (
                <Bar
                  dataKey='Student Loan'
                  stackId='a'
                  fill='hsl(var(--chart-5))'
                  radius={[0, 0, 0, 0]}
                />
              )}
              <Bar dataKey='Pension' stackId='a' fill='hsl(var(--chart-2))' radius={[0, 0, 0, 0]} />
              <Bar dataKey='Net Pay' stackId='a' fill='hsl(var(--chart-6))' radius={[0, 4, 4, 0]} />

              <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ zIndex: 100 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary stats */}
        <div className={cn('flex justify-between', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
          <div>
            <p className='text-muted-foreground'>Total Deductions</p>
            <p className='font-medium font-mono text-destructive'>
              {formatCurrency(
                current
                  .filter((d) => d.category !== 'Net Pay')
                  .reduce((sum, d) => sum + d.amount, 0),
              )}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground'>Take Home</p>
            <p className='font-medium font-mono text-green-600 dark:text-green-400'>
              {formatCurrency(current.find((d) => d.category === 'Net Pay')?.amount || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
