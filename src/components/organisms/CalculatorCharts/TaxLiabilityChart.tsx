'use client';

import { useId, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
import { getChartConfig, getTaxLiabilityData } from '@/lib/chartUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface TaxLiabilityChartProps {
  results: TaxCalculationResults;
  whatIfResults?: TaxCalculationResults | null;
  className?: string;
}

/**
 * Canonical category keys for tax liability chart.
 * Must match exactly what getTaxLiabilityData returns.
 */
const CATEGORY_KEYS = {
  INCOME_TAX: 'Income Tax',
  NATIONAL_INSURANCE: 'National Insurance',
  STUDENT_LOAN: 'Student Loan',
  PENSION: 'Pension',
  NET_PAY: 'Net Pay',
} as const;

type CategoryKey = (typeof CATEGORY_KEYS)[keyof typeof CATEGORY_KEYS];

/** Categories that represent actual deductions (tax/NI/loans), excluding pension and net pay */
const DEDUCTION_CATEGORIES: CategoryKey[] = [
  CATEGORY_KEYS.INCOME_TAX,
  CATEGORY_KEYS.NATIONAL_INSURANCE,
  CATEGORY_KEYS.STUDENT_LOAN,
];

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
 * Note: "Total Tax & NI" excludes pension contributions as they're
 * not government deductions. Pension is shown separately.
 */
export function TaxLiabilityChart({ results, whatIfResults, className }: TaxLiabilityChartProps) {
  const descriptionId = useId();

  // Get data from chart utils
  const { current, whatIf } = useMemo(
    () => getTaxLiabilityData(results, whatIfResults),
    [results, whatIfResults],
  );

  // Chart config - stable reference
  const chartConfig = useMemo(() => getChartConfig('liability'), []);

  // Check if student loan exists in EITHER dataset (not just current)
  const hasStudentLoan = useMemo(() => {
    const currentHas = current.some((d) => d.category === CATEGORY_KEYS.STUDENT_LOAN);
    const whatIfHas = whatIf?.some((d) => d.category === CATEGORY_KEYS.STUDENT_LOAN) ?? false;
    return currentHas || whatIfHas;
  }, [current, whatIf]);

  // Prepare data for stacked bar chart
  const chartData = useMemo(() => {
    const toRecord = (data: typeof current) =>
      Object.fromEntries(data.map((d) => [d.category, d.amount]));

    return whatIf
      ? [
          { scenario: 'Current', ...toRecord(current) },
          { scenario: 'What If', ...toRecord(whatIf) },
        ]
      : [{ scenario: 'Breakdown', ...toRecord(current) }];
  }, [current, whatIf]);

  // Calculate max value for stable domain
  const maxValue = useMemo(() => {
    const currentTotal = current.reduce((sum, d) => sum + d.amount, 0);
    const whatIfTotal = whatIf?.reduce((sum, d) => sum + d.amount, 0) ?? 0;
    return Math.max(currentTotal, whatIfTotal);
  }, [current, whatIf]);

  // Summary stats - separate tax/NI deductions from pension
  const summaryStats = useMemo(() => {
    const taxAndNI = current
      .filter((d) => DEDUCTION_CATEGORIES.includes(d.category as CategoryKey))
      .reduce((sum, d) => sum + d.amount, 0);

    const pension = current.find((d) => d.category === CATEGORY_KEYS.PENSION)?.amount ?? 0;

    const netPay = current.find((d) => d.category === CATEGORY_KEYS.NET_PAY)?.amount ?? 0;

    return { taxAndNI, pension, netPay };
  }, [current]);

  // SR summary
  const srSummary = whatIf
    ? `Tax breakdown comparison showing current versus what-if scenarios. Current: ${formatCurrency(summaryStats.taxAndNI)} in tax and NI, ${formatCurrency(summaryStats.pension)} pension, ${formatCurrency(summaryStats.netPay)} take-home.`
    : `Tax breakdown: ${formatCurrency(summaryStats.taxAndNI)} in tax and NI, ${formatCurrency(summaryStats.pension)} pension, ${formatCurrency(summaryStats.netPay)} take-home.`;

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Tax Breakdown</CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          {whatIf ? 'Current vs What If comparison' : 'Where your income goes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Screen reader summary */}
        <p id={descriptionId} className='sr-only'>
          {srSummary}
        </p>

        <ChartContainer
          config={chartConfig}
          className='h-64 w-full'
          role='img'
          aria-label={
            whatIf
              ? 'Stacked bar chart comparing current versus what-if tax breakdown'
              : 'Stacked bar chart showing tax breakdown'
          }
          aria-describedby={descriptionId}
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='hsl(var(--border))' />
              <XAxis type='number' hide domain={[0, maxValue > 0 ? maxValue : 'auto']} />
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
                    formatter={(value: number | string, name: string) => (
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
                dataKey={CATEGORY_KEYS.INCOME_TAX}
                stackId='a'
                fill='hsl(var(--chart-3))'
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey={CATEGORY_KEYS.NATIONAL_INSURANCE}
                stackId='a'
                fill='hsl(var(--chart-4))'
                radius={[0, 0, 0, 0]}
              />
              {hasStudentLoan && (
                <Bar
                  dataKey={CATEGORY_KEYS.STUDENT_LOAN}
                  stackId='a'
                  fill='hsl(var(--chart-5))'
                  radius={[0, 0, 0, 0]}
                />
              )}
              <Bar
                dataKey={CATEGORY_KEYS.PENSION}
                stackId='a'
                fill='hsl(var(--chart-2))'
                radius={[0, 0, 0, 0]}
              />
              {/* Net Pay is always last, so it gets the rounded corners */}
              <Bar
                dataKey={CATEGORY_KEYS.NET_PAY}
                stackId='a'
                fill='hsl(var(--chart-6))'
                radius={[0, 4, 4, 0]}
              />

              <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ zIndex: 100 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary stats - separate tax/NI from pension */}
        <div className={cn('flex justify-between', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
          <div>
            <p className='text-muted-foreground'>Tax & NI</p>
            <p className='font-medium font-mono text-destructive'>
              {formatCurrency(summaryStats.taxAndNI)}
            </p>
          </div>
          {summaryStats.pension > 0 && (
            <div className='text-center'>
              <p className='text-muted-foreground'>Pension</p>
              <p className='font-medium font-mono text-muted-foreground'>
                {formatCurrency(summaryStats.pension)}
              </p>
            </div>
          )}
          <div className='text-right'>
            <p className='text-muted-foreground'>Take Home</p>
            <p className='font-medium font-mono text-success'>
              {formatCurrency(summaryStats.netPay)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
