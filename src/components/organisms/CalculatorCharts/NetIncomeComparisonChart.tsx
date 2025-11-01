'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import { useChartColors } from '@/hooks/useChartColors';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface NetIncomeComparisonChartProps {
  results: TaxCalculationResults;
  className?: string;
}

/**
 * Net Income Comparison Bar Chart
 *
 * Shows salary ranges vs actual take-home pay to visualize
 * the impact of progressive taxation. Displays:
 * - Different salary bands (£20k, £30k, £40k, £50k, £75k, £100k, £150k)
 * - Gross salary (lighter bar)
 * - Net take-home (darker bar on top)
 * - Gap between them shows total deductions
 *
 * More exciting than an effective rate line chart!
 */
export function NetIncomeComparisonChart({ results, className }: NetIncomeComparisonChartProps) {
  const currentSalary = results.grossSalary.annually;
  const chartColors = useChartColors();

  // Calculate data points for different salary levels
  const salaryBands = React.useMemo(() => {
    const bands = [20000, 30000, 40000, 50000, 75000, 100000, 150000];

    return bands.map((salary) => {
      // Simplified calculation - in reality you'd recalculate the full tax
      // For demo, we'll estimate based on typical deduction percentages
      let deductionRate: number;

      if (salary <= 12570) deductionRate = 0;
      else if (salary <= 50270)
        deductionRate = 0.25; // ~20% tax + 8% NI
      else if (salary <= 100000)
        deductionRate = 0.35; // ~30% tax + some higher NI
      else if (salary <= 125140)
        deductionRate = 0.42; // Personal allowance taper
      else deductionRate = 0.45; // ~45% effective at high salaries

      const deductions = salary * deductionRate;
      const netIncome = salary - deductions;
      const effectiveRate = ((deductions / salary) * 100).toFixed(1);

      // Highlight the user's current salary band
      const isCurrentBand = Math.abs(salary - currentSalary) < 10000;

      return {
        salary: `£${(salary / 1000).toFixed(0)}k`,
        salaryValue: salary,
        gross: salary,
        net: netIncome,
        deductions: deductions,
        effectiveRate: `${effectiveRate}%`,
        isCurrentBand,
      };
    });
  }, [currentSalary]);

  const chartConfig = {
    gross: {
      label: 'Gross Salary',
      color: 'hsl(var(--chart-7))',
    },
    net: {
      label: 'Take Home',
      color: 'hsl(var(--chart-6))',
    },
  };

  return (
    <Card className={`border-primary/20 ${className || ''}`}>
      <CardHeader className='pb-3'>
        <CardTitle className='font-semibold text-lg'>Salary vs Take-Home</CardTitle>
        <CardDescription className='text-sm'>
          See the gap between gross and net across salary bands
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={salaryBands} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                opacity={0.3}
                stroke='hsl(var(--border))'
              />

              <XAxis
                dataKey='salary'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke={chartColors.mutedForeground}
                tick={{ fill: chartColors.mutedForeground }}
              />

              <YAxis
                tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={45}
                stroke={chartColors.mutedForeground}
                tick={{ fill: chartColors.mutedForeground }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Salary: ${value}`}
                    formatter={(value, name) => (
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{name}:</span>
                        <span className='font-mono'>{formatCurrency(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />

              {/* Gross salary bars (background) */}
              <Bar
                dataKey='gross'
                name='Gross Salary'
                fill='hsl(var(--chart-7))'
                radius={[4, 4, 0, 0]}
                opacity={0.25}
              />

              {/* Net income bars (foreground) */}
              <Bar dataKey='net' name='Take Home' fill='hsl(var(--chart-6))' radius={[4, 4, 0, 0]}>
                {/* Show effective rate on top of bars - uses CSS variable for theme-aware color */}
                <LabelList
                  dataKey='effectiveRate'
                  position='top'
                  fontSize={10}
                  fill={chartColors.foreground}
                  fontWeight={600}
                />
              </Bar>

              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Current position indicator */}
        <div className='mt-2 text-center'>
          <p className='text-muted-foreground text-xs'>
            Your salary:{' '}
            <span className='font-mono font-semibold text-foreground'>
              {formatCurrency(currentSalary)}
            </span>{' '}
            → Take-home:{' '}
            <span className='font-mono font-semibold text-green-600 dark:text-green-400'>
              {formatCurrency(results.netPay.annually)}
            </span>{' '}
            (
            <span className='font-semibold text-red-600 dark:text-red-400'>
              {((1 - results.netPay.annually / currentSalary) * 100).toFixed(1)}% deducted
            </span>
            )
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
