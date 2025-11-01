'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useChartColors } from '@/hooks/useChartColors';
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
 */
export function IncomeBreakdownChart({ results, className }: IncomeBreakdownChartProps) {
  const data = getIncomeBreakdownData(results);
  const chartConfig = getChartConfig('income');
  const chartColors = useChartColors();

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
          <ResponsiveContainer width='100%' height='100%'>
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
                label={(props) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={chartColors.foreground}
                      textAnchor={x > cx ? 'start' : 'end'}
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
}
