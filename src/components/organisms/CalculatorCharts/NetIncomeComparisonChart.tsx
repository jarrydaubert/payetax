'use client';

import { useId, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import type { TaxYear } from '@/constants/taxRates';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { calculateTax } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface NetIncomeComparisonChartProps {
  results: TaxCalculationResults;
  isScottish?: boolean;
  taxYear?: TaxYear;
  className?: string;
}

/** Fixed salary bands for comparison */
const SALARY_BANDS = [20_000, 30_000, 40_000, 50_000, 75_000, 100_000, 150_000] as const;

/**
 * Compute net income for a given salary using the real tax calculator.
 * Uses salary-only scenario (no pension, student loans, etc.) for comparison clarity.
 */
function computeNetForSalary(
  salary: number,
  isScottish: boolean,
  taxYear: TaxYear,
): { net: number; effectiveRate: number } {
  const result = calculateTax({
    salary,
    payPeriod: 'annually',
    taxYear,
    taxCode: isScottish ? 'S1257L' : '1257L',
    isScottish,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 40,
  });

  const net = result.netPay.annually;
  const effectiveRate = salary > 0 ? ((salary - net) / salary) * 100 : 0;

  return { net, effectiveRate };
}

/**
 * Net Income Comparison Bar Chart
 *
 * Shows real calculated take-home pay across salary bands to visualize
 * the impact of progressive taxation. Uses the actual tax calculator
 * for accurate numbers (not estimates).
 *
 * Displays:
 * - Different salary bands (£20k to £150k)
 * - Gross salary (lighter bar)
 * - Net take-home (darker bar)
 * - Effective deduction rate labels
 * - User's current position highlighted
 *
 * Note: Shows salary-only scenario (no pension/student loans) for clarity.
 */
export function NetIncomeComparisonChart({
  results,
  isScottish = false,
  taxYear = '2025-2026',
  className,
}: NetIncomeComparisonChartProps) {
  const currentSalary = results.grossSalary.annually;
  const descriptionId = useId();

  // Calculate real net income for each band using the tax calculator
  const salaryBands = useMemo(() => {
    return SALARY_BANDS.map((salary) => {
      const { net, effectiveRate } = computeNetForSalary(salary, isScottish, taxYear);

      return {
        salary: `£${(salary / 1000).toFixed(0)}k`,
        salaryValue: salary,
        gross: salary,
        net,
        deductions: salary - net,
        effectiveRate: `${effectiveRate.toFixed(0)}%`,
      };
    });
  }, [isScottish, taxYear]);

  // Find which band is closest to user's salary for highlighting
  const closestBandIndex = useMemo(() => {
    let minDiff = Infinity;
    let closestIdx = -1;
    SALARY_BANDS.forEach((band, idx) => {
      const diff = Math.abs(band - currentSalary);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [currentSalary]);

  // Chart config - stable reference
  const chartConfig = useMemo(
    () => ({
      gross: {
        label: 'Gross Salary',
        color: 'hsl(var(--chart-7))',
      },
      net: {
        label: 'Take Home',
        color: 'hsl(var(--chart-6))',
      },
    }),
    [],
  );

  // Current position stats with division guard
  const currentStats = useMemo(() => {
    if (currentSalary <= 0) {
      return { deductionPct: '0.0', netPay: 0 };
    }
    const deductionPct = ((1 - results.netPay.annually / currentSalary) * 100).toFixed(1);
    return { deductionPct, netPay: results.netPay.annually };
  }, [currentSalary, results.netPay.annually]);

  // SR summary
  const srSummary = `Comparison of gross salary vs take-home pay across ${SALARY_BANDS.length} salary bands from £20,000 to £150,000${isScottish ? ' using Scottish tax rates' : ''}. Your current salary is ${formatCurrency(currentSalary)} with ${formatCurrency(currentStats.netPay)} take-home (${currentStats.deductionPct}% deducted).`;

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>
          Salary vs Take-Home
          {isScottish && (
            <span className='ml-2 font-normal text-muted-foreground text-xs'>(Scottish rates)</span>
          )}
        </CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          Calculated take-home across salary bands (salary only, no pension/loans)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Screen reader summary */}
        <p id={descriptionId} className='sr-only'>
          {srSummary}
        </p>

        <ChartContainer
          config={chartConfig}
          className='h-[250px] w-full'
          role='img'
          aria-label='Bar chart comparing gross salary versus net take-home pay'
          aria-describedby={descriptionId}
        >
          <ResponsiveContainer width='100%' height={250}>
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
                stroke='currentColor'
                tick={{ fill: 'currentColor' }}
                className='text-muted-foreground'
              />

              <YAxis
                tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={45}
                stroke='currentColor'
                tick={{ fill: 'currentColor' }}
                className='text-muted-foreground'
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Salary: ${value}`}
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

              {/* Highlight closest band to user's salary */}
              {closestBandIndex >= 0 && (
                <ReferenceLine
                  x={salaryBands[closestBandIndex]?.salary}
                  stroke='hsl(var(--primary))'
                  strokeDasharray='3 3'
                  strokeWidth={2}
                />
              )}

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
                <LabelList
                  dataKey='effectiveRate'
                  position='top'
                  fontSize={10}
                  fill='currentColor'
                  fontWeight={600}
                  className='fill-foreground'
                />
              </Bar>

              <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ zIndex: 100 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Current position indicator */}
        {currentSalary > 0 && (
          <div className={cn('text-center', SPACING.MT_2)}>
            <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
              Your salary:{' '}
              <span className='font-mono font-semibold text-foreground'>
                {formatCurrency(currentSalary)}
              </span>{' '}
              → Take-home:{' '}
              <span className='font-mono font-semibold text-emerald-600 dark:text-emerald-400'>
                {formatCurrency(currentStats.netPay)}
              </span>{' '}
              (
              <span className='font-semibold text-destructive'>
                {currentStats.deductionPct}% deducted
              </span>
              )
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
