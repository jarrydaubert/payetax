'use client';

import { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getChartConfig, getIncomeBreakdownData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

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
 * Only displays if multiple income sources exist.
 *
 * Performance: Memoized with React 19, recharts 3.x optimizations
 * Accessibility: Enhanced ARIA labels and keyboard navigation (recharts 3.x)
 */
export const IncomeBreakdownChart = memo(function IncomeBreakdownChart({
  results,
  className,
}: IncomeBreakdownChartProps) {
  const data = getIncomeBreakdownData(results);
  const chartConfig = getChartConfig('income');

  // Don't render if only one income source
  if (!data || data.length < 2) {
    return null;
  }

  const totalIncome = results.grossSalary.annually;

  return (
    <Card className={`border-primary/20 ${className || ''}`}>
      <CardHeader className='pb-3'>
        <CardTitle className='font-semibold text-lg'>Income Sources</CardTitle>
        <CardDescription className='text-sm'>Breakdown by income type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{name}:</span>
                        <span className='font-mono'>{formatCurrency(Number(value))}</span>
                        <span className='text-muted-foreground'>
                          ({((Number(value) / totalIncome) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  />
                }
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
                // recharts 3.x: Optimized animations (reduced from default 400ms)
                animationDuration={300}
                animationBegin={0}
                isAnimationActive={true}
                label={(props: {
                  cx?: number | string;
                  cy?: number | string;
                  midAngle?: number;
                  innerRadius?: number | string;
                  outerRadius?: number | string;
                  percentage?: number;
                }) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;
                  if (
                    cx === undefined ||
                    cy === undefined ||
                    midAngle === undefined ||
                    innerRadius === undefined ||
                    outerRadius === undefined ||
                    percentage === undefined
                  ) {
                    return null;
                  }

                  // Convert to numbers if needed
                  const cxNum = typeof cx === 'string' ? Number.parseFloat(cx) : cx;
                  const cyNum = typeof cy === 'string' ? Number.parseFloat(cy) : cy;
                  const innerRadiusNum =
                    typeof innerRadius === 'string' ? Number.parseFloat(innerRadius) : innerRadius;
                  const outerRadiusNum =
                    typeof outerRadius === 'string' ? Number.parseFloat(outerRadius) : outerRadius;

                  const RADIAN = Math.PI / 180;
                  const radius = innerRadiusNum + (outerRadiusNum - innerRadiusNum) * 0.5;
                  const x = cxNum + radius * Math.cos(-midAngle * RADIAN);
                  const y = cyNum + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill='currentColor'
                      className='fill-foreground'
                      textAnchor={x > cxNum ? 'start' : 'end'}
                      dominantBaseline='central'
                      fontSize={12}
                      fontWeight={600}
                    >
                      {`${percentage.toFixed(0)}%`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Center label showing total */}
        <div className='mt-2 text-center'>
          <p className='text-muted-foreground text-sm'>Total Gross Income</p>
          <p className='font-mono font-semibold text-lg'>{formatCurrency(totalIncome)}</p>
        </div>
      </CardContent>
    </Card>
  );
});
