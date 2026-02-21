'use client';

import { useId, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
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
import { getChartConfig, getIncomeBreakdownData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface IncomeBreakdownChartProps {
  results: TaxCalculationResults;
  className?: string;
}

/**
 * Income Breakdown Donut Chart
 *
 * Shows the proportion of income from different sources:
 * - Employment income (subject to NI)
 * - Other income (dividends, rental, etc - no NI)
 *
 * Only displays if multiple income sources exist (2+ with non-zero values).
 *
 * Note: "Total" is computed from the sum of displayed slices to ensure
 * percentages always add up to 100%.
 */
export function IncomeBreakdownChart({ results, className }: IncomeBreakdownChartProps) {
  const descriptionId = useId();

  // Memoize data generation
  const data = useMemo(() => getIncomeBreakdownData(results), [results]);

  // Chart config is stable - memoize to prevent rerender cascades
  const chartConfig = useMemo(() => getChartConfig('income'), []);

  // Don't render if only one income source (or no data)
  if (!data || data.length < 2) {
    return null;
  }

  // Compute total from actual data (not grossSalary) to ensure consistency
  const totalIncome = data.reduce((sum, item) => sum + item.value, 0);

  // Build SR-only summary
  const srSummary = data
    .map((item) => {
      const pct = totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(0) : '0';
      return `${item.name}: ${formatCurrency(item.value)} (${pct}%)`;
    })
    .join(', ');

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Income Sources</CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>Breakdown by income type</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Screen reader summary */}
        <p id={descriptionId} className='sr-only'>
          Income breakdown: {srSummary}. Total: {formatCurrency(totalIncome)}.
        </p>

        <ChartContainer
          config={chartConfig}
          className='h-64 w-full'
          role='img'
          aria-label='Pie chart showing breakdown of income sources'
          aria-describedby={descriptionId}
        >
          <ResponsiveContainer width='100%' height={256}>
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value: number | string, name: string) => {
                      const numValue = Number(value);
                      // Guard against division by zero
                      const pct =
                        totalIncome > 0 ? ((numValue / totalIncome) * 100).toFixed(1) : '0.0';
                      return (
                        <div className={cn('flex items-center', SPACING.GAP_2)}>
                          <span className='font-medium'>{name}:</span>
                          <span className='font-mono'>{formatCurrency(numValue)}</span>
                          <span className='text-muted-foreground'>({pct}%)</span>
                        </div>
                      );
                    }}
                  />
                }
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Pie
                data={data}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius='60%'
                outerRadius='80%'
                paddingAngle={2}
                animationDuration={300}
                animationBegin={0}
                isAnimationActive={true}
                label={(props) => {
                  // Extract label props with safe typing
                  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
                    cx?: number;
                    cy?: number;
                    midAngle?: number;
                    innerRadius?: number;
                    outerRadius?: number;
                    percent?: number;
                  };

                  // Guard against undefined values
                  if (
                    cx === undefined ||
                    cy === undefined ||
                    midAngle === undefined ||
                    innerRadius === undefined ||
                    outerRadius === undefined ||
                    percent === undefined
                  ) {
                    return null;
                  }

                  // Hide labels for tiny slices (< 8%) to avoid clutter
                  if (percent < 0.08) return null;

                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill='currentColor'
                      className='fill-foreground'
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline='central'
                      fontSize={12}
                      fontWeight={600}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ zIndex: 100 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Center label showing total */}
        <div className={cn('text-center', SPACING.MT_2)}>
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>Total Income</p>
          <p className={cn('font-mono font-semibold', TYPOGRAPHY.TEXT_LG)}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
