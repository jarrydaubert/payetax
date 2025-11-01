// src/components/organisms/WhatIfComparison/WhatIfComparisonDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Building,
  Calculator,
  Coins,
  CreditCard,
  GraduationCap,
  Percent,
  PiggyBank,
  PoundSterling,
  Scale,
  Shield,
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
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { useMouseDragScroll } from '@/hooks/useMouseDragScroll';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';
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

const periodOptions: Record<string, number> = {
  Yearly: 1,
  Monthly: 12,
  '4-Weekly': 13,
  Fortnightly: 26,
  Weekly: 52,
  Daily: 260,
  Hourly: 1950,
};

/**
 * What If Comparison Display
 * Shows Current vs What If results in the same table format as ResultsTable
 */
export function WhatIfComparisonDisplay({
  currentResults,
  whatIfResults,
  className,
}: WhatIfComparisonDisplayProps) {
  const input = useCalculatorStore((state) => state.input);
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
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

  const handlePeriodToggle = (period: string) => {
    const newPeriods = visiblePeriods.includes(period)
      ? visiblePeriods.filter((p) => p !== period)
      : (() => {
          const allPeriods = [
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ];
          const combined = [...visiblePeriods, period];
          return allPeriods.filter((p) => combined.includes(p));
        })();
    setVisiblePeriods(newPeriods);
  };

  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  };

  const studentLoans = input.studentLoanPlan !== 'none' ? [input.studentLoanPlan] : [];
  const allowancesDeductions = input.allowancesDeductions || 0;

  const currentGross = currentResults.grossSalary.annually;
  const whatIfGross = whatIfResults.grossSalary.annually;

  // Build table rows
  const tableRows: ResultRowData[] = [
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
      color: 'text-red-600 dark:text-red-400',
    },
    // Tax Band Breakdown (Current)
    ...currentResults.taxBands.map((band, idx) => ({
      category: `${band.rate}% Rate (Current)`,
      icon: Percent,
      currentAnnual: band.amount,
      whatIfAnnual: whatIfResults.taxBands[idx]?.amount || 0,
      percentage: calculatePercentage(band.amount, currentGross),
      color: 'text-red-600 dark:text-red-400',
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
            color: 'text-orange-600 dark:text-orange-400',
          },
        ]
      : []),
    {
      category: 'National Insurance',
      icon: CreditCard,
      currentAnnual: currentResults.nationalInsurance.annually,
      whatIfAnnual: whatIfResults.nationalInsurance.annually,
      percentage: calculatePercentage(currentResults.nationalInsurance.annually, currentGross),
      color: 'text-amber-600 dark:text-yellow-400',
    },
    {
      category: 'Pension [You]',
      icon: PiggyBank,
      currentAnnual: currentResults.pensionContribution.annually,
      whatIfAnnual: whatIfResults.pensionContribution.annually,
      percentage: calculatePercentage(currentResults.pensionContribution.annually, currentGross),
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      category: 'Allowances/Deductions',
      icon: Coins,
      currentAnnual: allowancesDeductions,
      whatIfAnnual: allowancesDeductions,
      percentage: calculatePercentage(allowancesDeductions, currentGross),
      color: 'text-teal-600 dark:text-teal-400',
    },
    {
      category: 'Net Pay',
      icon: Wallet,
      currentAnnual: currentResults.netPay.annually,
      whatIfAnnual: whatIfResults.netPay.annually,
      percentage: calculatePercentage(currentResults.netPay.annually, currentGross),
      color: 'text-green-600 dark:text-green-400',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${className || ''}`}
    >
      {/* Header */}
      <div className='text-center'>
        <h3 className='font-semibold text-lg'>Current vs What If Comparison</h3>
        <p className='text-muted-foreground text-sm'>Side-by-side comparison of your scenarios</p>
      </div>

      {/* Period Selection */}
      <PeriodSelectorCard
        periods={Object.keys(periodOptions)}
        visiblePeriods={visiblePeriods}
        onPeriodToggle={handlePeriodToggle}
      />

      {/* Results Table with Scroll Indicators */}
      <div className='-mx-2 relative sm:mx-0'>
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        <Card className='overflow-hidden border-primary/20'>
          <section
            ref={containerRef}
            className='cursor-grab touch-pan-x overflow-x-auto scroll-smooth active:cursor-grabbing'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
              WebkitOverflowScrolling: 'touch',
            }}
            aria-label='What If comparison table - scrollable horizontally'
          >
            <Table aria-label='What If comparison results'>
              <TableHeader>
                <TableRow className='bg-card hover:bg-card'>
                  <TableHead
                    scope='col'
                    className='sticky top-0 left-0 z-20 min-w-[160px] bg-card font-semibold sm:min-w-[180px]'
                  >
                    Category
                  </TableHead>
                  <TableHead
                    scope='col'
                    className='sticky top-0 z-10 min-w-[50px] bg-card text-right font-semibold'
                  >
                    %
                  </TableHead>
                  {visiblePeriods.map((period) => (
                    <TableHead
                      key={period}
                      scope='col'
                      className='sticky top-0 z-10 min-w-[180px] bg-card text-center font-semibold sm:min-w-[200px]'
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
                        className='sticky top-0 z-10 min-w-[90px] bg-blue-500/10 text-right font-medium text-xs sm:min-w-[100px]'
                      >
                        Current
                      </TableHead>
                      <TableHead
                        scope='col'
                        className='sticky top-0 z-10 min-w-[90px] bg-purple-500/10 text-right font-medium text-xs sm:min-w-[100px]'
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
                      {/* Category */}
                      <TableCell
                        className={`${row.color} ${row.isHighlight ? 'font-bold' : ''} sticky left-0 z-10 bg-background`}
                      >
                        <div
                          className={`flex items-center gap-2 ${row.isSubRow ? 'pl-6 sm:pl-8' : ''}`}
                        >
                          <Icon className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
                          <span className='text-xs sm:text-sm'>{row.category}</span>
                        </div>
                      </TableCell>

                      {/* Percentage */}
                      <TableCell
                        className={`text-right font-mono text-xs sm:text-sm ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                      >
                        {row.percentage}
                      </TableCell>

                      {/* Period Values (Current vs What If) */}
                      {visiblePeriods.map((period) => {
                        const currentValue = row.currentAnnual / periodOptions[period];
                        const whatIfValue = row.whatIfAnnual / periodOptions[period];

                        return (
                          <React.Fragment key={period}>
                            {/* Current Value */}
                            <TableCell
                              className={`bg-blue-500/5 text-right font-mono text-xs sm:text-sm ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                            >
                              {formatCurrency(currentValue)}
                            </TableCell>

                            {/* What If Value */}
                            <TableCell
                              className={`bg-purple-500/5 text-right font-mono text-xs sm:text-sm ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
                            >
                              {formatCurrency(whatIfValue)}
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
      <div className='mt-4 flex flex-col items-center gap-2'>
        <p className='text-center text-muted-foreground text-xs'>
          *Blue columns show your current scenario. Purple columns show your "What If" scenario.
        </p>
        {showRightIndicator && (
          <div className='flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 font-medium text-muted-foreground text-xs md:hidden'>
            <span>👈 Swipe to see all periods</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
