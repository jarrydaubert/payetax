// src/components/organisms/WhatIfComparison/WhatIfComparisonDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Building,
  Calculator,
  Coins,
  CreditCard,
  GraduationCap,
  Minus,
  Percent,
  PiggyBank,
  PoundSterling,
  Scale,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { PeriodSelectorCard } from '@/components/molecules/PeriodSelectorCard';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { useMouseDragScroll } from '@/hooks/useMouseDragScroll';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

interface WhatIfComparisonDisplayProps {
  currentResults: TaxCalculationResults;
  whatIfResults: TaxCalculationResults;
  className?: string;
}

interface ResultRowData {
  category: string;
  icon: React.ElementType;
  currentAnnual: number;
  whatIfAnnual: number;
  percentage: string;
  color: string;
  isHighlight?: boolean;
  isSubRow?: boolean;
}

// Period options with type safety
const PERIOD_OPTIONS = {
  Yearly: 1,
  Monthly: 12,
  '4-Weekly': 13,
  Fortnightly: 26,
  Weekly: 52,
  Daily: 260,
  Hourly: 1950,
} as const;

type Period = keyof typeof PERIOD_OPTIONS;

const ALL_PERIODS: Period[] = [
  'Yearly',
  'Monthly',
  '4-Weekly',
  'Fortnightly',
  'Weekly',
  'Daily',
  'Hourly',
];

/**
 * What If Comparison Display
 * Shows Current vs What If results in the same table format as ResultsTable
 */
export function WhatIfComparisonDisplay({
  currentResults,
  whatIfResults,
  className,
}: WhatIfComparisonDisplayProps) {
  // Use granular selectors to avoid unnecessary re-renders
  const studentLoanPlans = useCalculatorStore((state) => state.input.studentLoanPlans);
  const allowancesDeductions = useCalculatorStore((state) => state.input.allowancesDeductions);
  const shouldReduceMotion = useMotionPreference();

  const [visiblePeriods, setVisiblePeriods] = React.useState<Period[]>([
    'Yearly',
    'Monthly',
    'Weekly',
  ]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { showLeftIndicator, showRightIndicator } = useHorizontalScrollIndicator(containerRef, [
    visiblePeriods,
  ]);

  // Enable mouse drag scrolling for better UX
  useMouseDragScroll(containerRef);

  // Unique ID for accessibility
  const scrollHintId = React.useId();

  // Stable callback using functional state update
  const handlePeriodToggle = React.useCallback((period: string) => {
    setVisiblePeriods((prev) => {
      const typedPeriod = period as Period;
      if (prev.includes(typedPeriod)) {
        return prev.filter((p) => p !== typedPeriod);
      }
      // Maintain order by filtering ALL_PERIODS
      return ALL_PERIODS.filter((p) => prev.includes(p) || p === typedPeriod);
    });
  }, []);

  const calculatePercentage = React.useCallback((amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  }, []);

  // Normalize studentLoanPlans to array (defensive, even though type is correct)
  const studentLoans = Array.isArray(studentLoanPlans) ? studentLoanPlans : [];

  const currentGross = currentResults.grossSalary.annually;
  const whatIfGross = whatIfResults.grossSalary.annually;

  // Calculate deltas for summary
  const netPayDeltaMonthly = (whatIfResults.netPay.annually - currentResults.netPay.annually) / 12;
  const taxDeltaAnnual = whatIfResults.incomeTax.annually - currentResults.incomeTax.annually;
  const grossDeltaAnnual = whatIfGross - currentGross;

  // Build rate-keyed map for what-if tax bands (robust against different band orders/lengths)
  const whatIfBandsByRate = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const band of whatIfResults.taxBands) {
      map.set(band.rate, band.amount);
    }
    return map;
  }, [whatIfResults.taxBands]);

  // Build table rows (memoized to avoid rebuild on every render)
  const tableRows = React.useMemo<ResultRowData[]>(() => {
    return [
      {
        category: 'Gross Pay',
        icon: PoundSterling,
        currentAnnual: currentGross,
        whatIfAnnual: whatIfGross,
        percentage: '100%',
        color: 'text-foreground',
      },
      {
        category: 'Tax-Free Allowance',
        icon: Shield,
        currentAnnual: currentResults.taxFreeAmount,
        whatIfAnnual: whatIfResults.taxFreeAmount,
        percentage: calculatePercentage(currentResults.taxFreeAmount, currentGross),
        color: 'text-foreground',
      },
      {
        category: 'Total Taxable',
        icon: Scale,
        currentAnnual: currentResults.taxableIncome,
        whatIfAnnual: whatIfResults.taxableIncome,
        percentage: calculatePercentage(currentResults.taxableIncome, currentGross),
        color: 'text-foreground',
      },
      {
        category: 'Total Tax Due',
        icon: Calculator,
        currentAnnual: currentResults.incomeTax.annually,
        whatIfAnnual: whatIfResults.incomeTax.annually,
        percentage: calculatePercentage(currentResults.incomeTax.annually, currentGross),
        color: 'text-destructive',
      },
      // Tax Band Breakdown - match by rate, not array index
      ...currentResults.taxBands.map((band) => ({
        category: `${band.rate}% Rate`,
        icon: Percent,
        currentAnnual: band.amount,
        whatIfAnnual: whatIfBandsByRate.get(band.rate) ?? 0,
        percentage: calculatePercentage(band.amount, currentGross),
        color: 'text-destructive',
        isSubRow: true,
      })),
      // Student Loans
      ...(studentLoans.length > 0
        ? [
            {
              category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
              icon: GraduationCap,
              currentAnnual: currentResults.studentLoan.annually,
              whatIfAnnual: whatIfResults.studentLoan.annually,
              percentage: calculatePercentage(currentResults.studentLoan.annually, currentGross),
              color: 'text-destructive',
            },
          ]
        : []),
      {
        category: 'National Insurance',
        icon: CreditCard,
        currentAnnual: currentResults.nationalInsurance.annually,
        whatIfAnnual: whatIfResults.nationalInsurance.annually,
        percentage: calculatePercentage(currentResults.nationalInsurance.annually, currentGross),
        color: 'text-warning',
      },
      {
        category: 'Pension [You]',
        icon: PiggyBank,
        currentAnnual: currentResults.pensionContribution.annually,
        whatIfAnnual: whatIfResults.pensionContribution.annually,
        percentage: calculatePercentage(currentResults.pensionContribution.annually, currentGross),
        color: 'text-accent-foreground',
      },
      {
        category: 'Non-taxable allowance(s)',
        icon: Coins,
        currentAnnual: allowancesDeductions,
        // Note: Allowances are input-based and don't change between scenarios in this context
        whatIfAnnual: allowancesDeductions,
        percentage: calculatePercentage(allowancesDeductions, currentGross),
        color: 'text-primary',
      },
      {
        category: 'Net Pay',
        icon: Wallet,
        currentAnnual: currentResults.netPay.annually,
        whatIfAnnual: whatIfResults.netPay.annually,
        percentage: calculatePercentage(currentResults.netPay.annually, currentGross),
        color: 'text-success',
        isHighlight: true,
      },
      {
        category: 'Employers NI',
        icon: Building,
        currentAnnual: currentResults.employerNI,
        whatIfAnnual: whatIfResults.employerNI,
        percentage: calculatePercentage(currentResults.employerNI, currentGross),
        color: 'text-muted-foreground',
      },
    ];
  }, [
    currentResults,
    whatIfResults,
    currentGross,
    whatIfGross,
    whatIfBandsByRate,
    studentLoans,
    allowancesDeductions,
    calculatePercentage,
  ]);

  return (
    <motion.div
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
      className={cn(SPACING.SPACE_Y_4, className)}
    >
      {/* Header */}
      <div className='text-center'>
        <h3 className={`font-semibold ${TYPOGRAPHY.TEXT_LG}`}>Current vs What If Comparison</h3>
        <p className={`text-muted-foreground ${TYPOGRAPHY.TEXT_SM}`}>
          Side-by-side comparison of your scenarios
        </p>
      </div>

      {/* Delta Summary Card */}
      <Card className='overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5'>
        <div className='p-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
            {/* Net Pay Delta - Primary */}
            <div className='flex flex-col items-center justify-center rounded-lg bg-background/50 p-4 text-center'>
              <span className={cn('mb-1 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                Take-Home Difference
              </span>
              <div className='flex items-center gap-2'>
                {netPayDeltaMonthly > 0 ? (
                  <TrendingUp className='size-6 text-success' />
                ) : netPayDeltaMonthly < 0 ? (
                  <TrendingDown className='size-6 text-destructive' />
                ) : (
                  <Minus className='size-6 text-muted-foreground' />
                )}
                <span
                  className={cn(
                    'font-bold',
                    TYPOGRAPHY.TEXT_2XL,
                    netPayDeltaMonthly > 0
                      ? 'text-success'
                      : netPayDeltaMonthly < 0
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                  )}
                >
                  {netPayDeltaMonthly >= 0 ? '+' : ''}
                  {formatCurrency(netPayDeltaMonthly, 0)}
                </span>
              </div>
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>per month</span>
            </div>

            {/* Gross Salary Delta */}
            <div className='flex flex-col items-center justify-center rounded-lg bg-background/50 p-3 text-center'>
              <span className={cn('mb-1 text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                Gross Salary
              </span>
              <div className='flex items-center gap-1'>
                {grossDeltaAnnual > 0 ? (
                  <ArrowUp className='size-4 text-foreground' />
                ) : grossDeltaAnnual < 0 ? (
                  <ArrowDown className='size-4 text-foreground' />
                ) : null}
                <span className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>
                  {grossDeltaAnnual >= 0 ? '+' : ''}
                  {formatCurrency(grossDeltaAnnual, 0)}
                </span>
              </div>
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>per year</span>
            </div>

            {/* Tax Delta */}
            <div className='flex flex-col items-center justify-center rounded-lg bg-background/50 p-3 text-center'>
              <span className={cn('mb-1 text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                Tax Difference
              </span>
              <div className='flex items-center gap-1'>
                {taxDeltaAnnual > 0 ? (
                  <ArrowUp className='size-4 text-destructive' />
                ) : taxDeltaAnnual < 0 ? (
                  <ArrowDown className='size-4 text-success' />
                ) : null}
                <span
                  className={cn(
                    'font-semibold',
                    TYPOGRAPHY.TEXT_LG,
                    taxDeltaAnnual > 0
                      ? 'text-destructive'
                      : taxDeltaAnnual < 0
                        ? 'text-success'
                        : '',
                  )}
                >
                  {taxDeltaAnnual >= 0 ? '+' : ''}
                  {formatCurrency(taxDeltaAnnual, 0)}
                </span>
              </div>
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>per year</span>
            </div>
          </div>

          {/* Contextual Message */}
          {netPayDeltaMonthly !== 0 && (
            <p className={cn('mt-3 text-center text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
              {netPayDeltaMonthly > 0 ? (
                <>
                  With this change, you&apos;d take home{' '}
                  <span className='font-semibold text-success'>
                    {formatCurrency(Math.abs(netPayDeltaMonthly), 0)} more
                  </span>{' '}
                  each month ({formatCurrency(Math.abs(netPayDeltaMonthly * 12), 0)} per year).
                </>
              ) : (
                <>
                  With this change, you&apos;d take home{' '}
                  <span className='font-semibold text-destructive'>
                    {formatCurrency(Math.abs(netPayDeltaMonthly), 0)} less
                  </span>{' '}
                  each month ({formatCurrency(Math.abs(netPayDeltaMonthly * 12), 0)} per year).
                </>
              )}
            </p>
          )}
        </div>
      </Card>

      {/* Period Selection */}
      <PeriodSelectorCard
        periods={ALL_PERIODS}
        visiblePeriods={visiblePeriods}
        onPeriodToggle={handlePeriodToggle}
      />

      {/* Results Table with Scroll Indicators */}
      <div className='relative -mx-2 sm:mx-0'>
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        {/* Screen reader hint for scrollable region */}
        <div id={scrollHintId} className='sr-only'>
          Horizontally scrollable table. Use swipe, scroll, or click and drag to view all columns.
        </div>

        <Card className='overflow-hidden'>
          <section
            ref={containerRef}
            className='scroll-area-thin cursor-grab touch-pan-x overflow-x-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing'
            aria-label='What If comparison table'
            aria-describedby={scrollHintId}
          >
            <Table>
              <TableHeader>
                <TableRow className='bg-card hover:bg-card'>
                  <TableHead
                    scope='col'
                    className='sticky top-0 left-0 z-20 min-w-40 bg-card font-semibold sm:min-w-44'
                  >
                    Category
                  </TableHead>
                  <TableHead
                    scope='col'
                    className='sticky top-0 z-10 min-w-16 bg-card text-right font-semibold'
                    title='Percentage of current gross salary'
                  >
                    % of Gross
                  </TableHead>
                  {visiblePeriods.map((period) => (
                    <TableHead
                      key={period}
                      scope='col'
                      className='sticky top-0 z-10 min-w-44 bg-card text-center font-semibold sm:min-w-48'
                      colSpan={2}
                    >
                      {period}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow className='bg-card hover:bg-card'>
                  <TableHead className='sticky top-0 left-0 z-20 bg-card' colSpan={2} />
                  {visiblePeriods.map((period) => (
                    <React.Fragment key={period}>
                      <TableHead
                        scope='col'
                        className={cn(
                          'sticky top-0 z-10 min-w-24 bg-primary/10 text-right font-medium sm:min-w-28',
                          TYPOGRAPHY.TEXT_XS,
                        )}
                      >
                        Current
                      </TableHead>
                      <TableHead
                        scope='col'
                        className={cn(
                          'sticky top-0 z-10 min-w-24 bg-accent/10 text-right font-medium sm:min-w-28',
                          TYPOGRAPHY.TEXT_XS,
                        )}
                      >
                        What If
                      </TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) => {
                  const Icon = row.icon;
                  return (
                    <TableRow
                      key={`${row.category}-${index}`}
                      className={`border-b transition-colors hover:bg-muted/50 ${
                        row.isHighlight ? 'border-t-2 border-t-primary bg-primary/5' : ''
                      }`}
                    >
                      {/* Category - use bg-card for consistency with header */}
                      <TableCell
                        className={`${row.color} ${row.isHighlight ? 'font-bold' : ''} sticky left-0 z-10 bg-card`}
                      >
                        <div
                          className={`flex items-center ${SPACING.GAP_2} ${row.isSubRow ? 'pl-6 sm:pl-8' : ''}`}
                        >
                          <Icon
                            className={`${ICON_SIZES.SIZE_4} flex-shrink-0`}
                            aria-hidden='true'
                          />
                          <span className={`${TYPOGRAPHY.TEXT_XS} sm:${TYPOGRAPHY.TEXT_SM}`}>
                            {row.category}
                          </span>
                        </div>
                      </TableCell>

                      {/* Percentage */}
                      <TableCell
                        className={`text-right font-mono ${TYPOGRAPHY.TEXT_XS} sm:${TYPOGRAPHY.TEXT_SM} ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                      >
                        {row.percentage}
                      </TableCell>

                      {/* Period Values (Current vs What If) */}
                      {visiblePeriods.map((period) => {
                        const divisor = PERIOD_OPTIONS[period];
                        const currentValue = row.currentAnnual / divisor;
                        const whatIfValue = row.whatIfAnnual / divisor;

                        return (
                          <React.Fragment key={period}>
                            {/* Current Value */}
                            <TableCell
                              className={`bg-primary/5 text-right font-mono ${TYPOGRAPHY.TEXT_XS} sm:${TYPOGRAPHY.TEXT_SM} ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                            >
                              {formatCurrency(currentValue, 0)}
                            </TableCell>

                            {/* What If Value */}
                            <TableCell
                              className={`bg-accent/5 text-right font-mono ${TYPOGRAPHY.TEXT_XS} sm:${TYPOGRAPHY.TEXT_SM} ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                            >
                              {formatCurrency(whatIfValue, 0)}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        </Card>
      </div>

      {/* Footer Notes */}
      <div className={`mt-4 flex flex-col items-center ${SPACING.GAP_2}`}>
        <p className={`text-center text-muted-foreground ${TYPOGRAPHY.TEXT_XS}`}>
          Left columns show your current scenario. Right columns show your "What If" scenario.
          Values are rounded to the nearest pound.
        </p>
        {showRightIndicator && (
          <div
            className={`flex items-center ${SPACING.GAP_2} rounded-full bg-primary/5 px-3 py-1.5 font-medium text-muted-foreground ${TYPOGRAPHY.TEXT_XS} md:hidden`}
          >
            <span aria-hidden='true'>👈</span>
            <span>Swipe to see all periods</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
