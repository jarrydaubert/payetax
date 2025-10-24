// src/components/organisms/CalculatorResults/ResultsTable.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  Calculator,
  ChevronDown,
  Coins,
  CreditCard,
  GraduationCap,
  Percent,
  PiggyBank,
  PoundSterling,
  Scale,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { MarriageAllowanceAlert } from '@/components/molecules/MarriageAllowanceAlert';
import { PeriodSelectorCard } from '@/components/molecules/PeriodSelectorCard';
import { ResultTableRow } from '@/components/molecules/ResultTableRow';
import { TaxTrapInlineAlert } from '@/components/molecules/TaxTrapInlineAlert';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { useMouseDragScroll } from '@/hooks/useMouseDragScroll';
import { calculateOptimalPension } from '@/lib/pensionOptimizer';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

interface ResultsTableProps {
  results: TaxCalculationResults;
  allowancesDeductions?: number;
  studentLoans?: string[];
  previousYearResults?: TaxCalculationResults | null;
  whatIfResults?: TaxCalculationResults | null;
  visiblePeriods?: string[];
  onVisiblePeriodsChange?: (periods: string[]) => void;
  taxYear?: string;
  onApplyPensionOptimization?: (amount: number) => void;
  // Marriage allowance detection
  isMarried?: boolean;
  partnerGrossWage?: number;
  taxCode?: string;
}

interface ResultRowData {
  category: string;
  icon: React.ElementType;
  annual: number;
  whatIfAnnual?: number;
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

export function ResultsTable({
  results,
  allowancesDeductions = 0,
  studentLoans = [],
  previousYearResults = null,
  whatIfResults = null,
  visiblePeriods = ['Yearly', 'Monthly', 'Weekly'],
  onVisiblePeriodsChange,
  taxYear,
  onApplyPensionOptimization,
  isMarried = false,
  partnerGrossWage = 0,
  taxCode = '1257L',
}: ResultsTableProps) {
  // Generate unique ID for accessibility
  const scrollHintId = React.useId();

  // Scroll indicators - recheck when periods change
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { showLeftIndicator, showRightIndicator } = useHorizontalScrollIndicator(containerRef, [
    visiblePeriods,
  ]);

  // Enable mouse drag scrolling for better UX
  useMouseDragScroll(containerRef);

  // Tax trap detection - pass current pension to check if trap is already avoided
  const taxTrapOptimization = React.useMemo(() => {
    return calculateOptimalPension(
      results.grossSalary.annually,
      results.pensionContribution.annually
    );
  }, [results.grossSalary.annually, results.pensionContribution.annually]);

  // Marriage allowance eligibility check
  const marriageAllowanceEligible = React.useMemo(() => {
    if (!(isMarried && partnerGrossWage)) return false;

    // Check if user already has M code (already claiming)
    const hasMarriageCode = taxCode.toUpperCase().includes('M');
    if (hasMarriageCode) return false;

    // Partner must earn less than Personal Allowance (£12,570)
    const personalAllowance = 12570;
    if (partnerGrossWage >= personalAllowance) return false;

    // User must be a basic rate taxpayer
    // Basic rate threshold: £12,570 - £50,270
    const userSalary = results.grossSalary.annually;
    if (userSalary <= personalAllowance || userSalary > 50270) return false;

    // User is eligible!
    return true;
  }, [isMarried, partnerGrossWage, taxCode, results.grossSalary.annually]);

  // Extract current year from taxYear to show "Net Change from 2024" instead of "Previous Year"
  // Default to current tax year if not provided
  const currentTaxYear = taxYear || '2025-2026'; // e.g., "2025-2026"
  const currentYearStart = Number.parseInt(currentTaxYear.split('-')[0] || '', 10); // 2025
  const previousYearLabel = currentYearStart - 1; // 2024

  // Format the previous year row label
  const previousYearRowLabel = previousYearResults
    ? `Net Change from ${previousYearLabel}`
    : `Net Change from ${previousYearLabel}`;

  const handlePeriodToggle = (period: string) => {
    if (!onVisiblePeriodsChange) return;

    const newPeriods = visiblePeriods.includes(period)
      ? visiblePeriods.filter((p) => p !== period)
      : (() => {
          // Add period and sort by logical order
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

    onVisiblePeriodsChange(newPeriods);
  };

  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  };

  const grossAnnual = results.grossSalary.annually;
  const taxFreeAllowance = results.taxFreeAmount;
  const taxableIncome = results.taxableIncome;
  const allowancesAmount = allowancesDeductions;

  // Calculate year-over-year change
  const yearChange = previousYearResults
    ? results.netPay.annually - previousYearResults.netPay.annually
    : 0;
  const yearChangePercentage = previousYearResults
    ? calculatePercentage(yearChange, previousYearResults.netPay.annually)
    : '0.0%';

  // Calculate What If year-over-year change
  const whatIfYearChange =
    previousYearResults && whatIfResults
      ? whatIfResults.netPay.annually - previousYearResults.netPay.annually
      : undefined;

  const tableRows: ResultRowData[] = [
    {
      category: 'Gross Pay',
      icon: PoundSterling,
      annual: grossAnnual,
      whatIfAnnual: whatIfResults?.grossSalary.annually,
      percentage: '100%',
      color: 'text-foreground',
      isHighlight: false,
    },
    // Add income breakdown if multiple sources exist
    ...(results.incomeBreakdown
      ? [
          {
            category: 'Employment Income',
            icon: Building,
            annual: results.incomeBreakdown.employment,
            whatIfAnnual: whatIfResults?.incomeBreakdown?.employment,
            percentage: calculatePercentage(results.incomeBreakdown.employment, grossAnnual),
            color: 'text-muted-foreground',
            isHighlight: false,
            isSubRow: true,
          },
          ...(results.incomeBreakdown.nonEmployment > 0
            ? [
                {
                  category: 'Other Income (No NI)',
                  icon: Coins,
                  annual: results.incomeBreakdown.nonEmployment,
                  whatIfAnnual: whatIfResults?.incomeBreakdown?.nonEmployment,
                  percentage: calculatePercentage(
                    results.incomeBreakdown.nonEmployment,
                    grossAnnual
                  ),
                  color: 'text-muted-foreground',
                  isHighlight: false,
                  isSubRow: true,
                },
              ]
            : []),
        ]
      : []),
    {
      category: 'Tax-Free Allowance',
      icon: Shield,
      annual: taxFreeAllowance,
      whatIfAnnual: whatIfResults?.taxFreeAmount,
      percentage: calculatePercentage(taxFreeAllowance, grossAnnual),
      color: 'text-foreground',
      isHighlight: false,
    },
    {
      category: 'Total Taxable',
      icon: Scale,
      annual: taxableIncome,
      whatIfAnnual: whatIfResults?.taxableIncome,
      percentage: calculatePercentage(taxableIncome, grossAnnual),
      color: 'text-foreground',
      isHighlight: false,
    },
    {
      category: 'Total Tax Due',
      icon: Calculator,
      annual: results.incomeTax.annually,
      whatIfAnnual: whatIfResults?.incomeTax.annually,
      percentage: calculatePercentage(results.incomeTax.annually, grossAnnual),
      color: 'text-red-600 dark:text-red-400',
      isHighlight: false,
    },
    // Tax Band Breakdown
    ...results.taxBands.map((band, idx) => ({
      category: `${band.rate}% Rate`,
      icon: Percent,
      annual: band.amount,
      whatIfAnnual: whatIfResults?.taxBands[idx]?.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      color: 'text-red-600 dark:text-red-400',
      isHighlight: false,
      isSubRow: true,
    })),
    // Student Loans
    ...(studentLoans.length > 0
      ? [
          {
            category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
            icon: GraduationCap,
            annual: results.studentLoan.annually,
            whatIfAnnual: whatIfResults?.studentLoan.annually,
            percentage: calculatePercentage(results.studentLoan.annually, grossAnnual),
            color: 'text-orange-600 dark:text-orange-400',
            isHighlight: false,
          },
        ]
      : []),
    {
      category: 'National Insurance',
      icon: CreditCard,
      annual: results.nationalInsurance.annually,
      whatIfAnnual: whatIfResults?.nationalInsurance.annually,
      percentage: calculatePercentage(results.nationalInsurance.annually, grossAnnual),
      color: 'text-amber-600 dark:text-yellow-400',
      isHighlight: false,
    },
    {
      category: 'Pension',
      icon: PiggyBank,
      annual: results.pensionContribution.annually,
      whatIfAnnual: whatIfResults?.pensionContribution.annually,
      percentage: calculatePercentage(results.pensionContribution.annually, grossAnnual),
      color: 'text-purple-600 dark:text-purple-400',
      isHighlight: false,
    },
    {
      category: 'Allowances/Deductions',
      icon: Coins,
      annual: allowancesAmount,
      whatIfAnnual: whatIfResults ? allowancesAmount : undefined,
      percentage: calculatePercentage(allowancesAmount, grossAnnual),
      color: 'text-teal-600 dark:text-teal-400',
      isHighlight: false,
    },
    {
      category: 'Net Pay',
      icon: Wallet,
      annual: results.netPay.annually,
      whatIfAnnual: whatIfResults?.netPay.annually,
      percentage: calculatePercentage(results.netPay.annually, grossAnnual),
      color: 'text-green-600 dark:text-green-400',
      isHighlight: true,
    },
    {
      category: 'Employers NI',
      icon: Building,
      annual: results.employerNI,
      whatIfAnnual: whatIfResults?.employerNI,
      percentage: calculatePercentage(results.employerNI, grossAnnual),
      color: 'text-muted-foreground',
      isHighlight: false,
    },
    {
      category: previousYearRowLabel,
      icon: TrendingUp,
      annual: yearChange,
      whatIfAnnual: whatIfYearChange,
      percentage: yearChangePercentage,
      color:
        yearChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      isHighlight: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className='w-full space-y-4'
    >
      {/* Period Selection */}
      <PeriodSelectorCard
        periods={Object.keys(periodOptions)}
        visiblePeriods={visiblePeriods}
        onPeriodToggle={handlePeriodToggle}
      />

      {/* Results Table with Scroll Indicators */}
      <div className='-mx-2 relative w-full sm:mx-0'>
        {/* Scroll Indicators - must be positioned absolutely to overlay the card */}
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        <Card className='relative w-full overflow-hidden border-primary/20'>
          {/* biome-ignore lint/a11y/useSemanticElements: div needed for ref and scroll functionality */}
          <div
            ref={containerRef}
            className='w-full cursor-grab overflow-x-auto scroll-smooth active:cursor-grabbing'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            role='region'
            aria-label='Tax calculation results table - scrollable'
            aria-describedby={scrollHintId}
          >
            <Table data-testid='results-table' className='table-drag-scroll w-full min-w-full'>
              <TableHeader>
                <TableRow className='bg-card hover:bg-card'>
                  <TableHead className='sticky left-0 z-20 w-auto whitespace-nowrap bg-card pt-3 pr-4 pb-2 font-semibold text-foreground text-lg'>
                    Payslip
                  </TableHead>
                  <TableHead className='min-w-[50px] text-right font-semibold'>%</TableHead>
                  {whatIfResults
                    ? // Two-row header for What If comparison
                      visiblePeriods.map((period) => (
                        <TableHead
                          key={period}
                          className='text-center font-semibold text-sm'
                          colSpan={2}
                        >
                          {period}
                        </TableHead>
                      ))
                    : // Single-row header for normal view
                      visiblePeriods.map((period) => (
                        <TableHead
                          key={period}
                          className='min-w-[100px] text-right font-semibold sm:min-w-[110px] md:min-w-[120px] lg:min-w-[130px] xl:min-w-[140px] 2xl:min-w-[150px]'
                        >
                          {period}
                        </TableHead>
                      ))}
                </TableRow>
                {whatIfResults && (
                  <TableRow className='bg-card hover:bg-card'>
                    <TableHead className='sticky left-0 z-20 bg-card py-1' colSpan={2} />
                    {visiblePeriods.map((period) => (
                      <React.Fragment key={period}>
                        <TableHead className='min-w-[110px] bg-blue-500/10 py-1 text-center font-medium text-sm sm:min-w-[120px] md:min-w-[130px] lg:min-w-[140px] xl:min-w-[150px] 2xl:min-w-[160px]'>
                          Current
                        </TableHead>
                        <TableHead className='min-w-[110px] bg-purple-500/10 py-1 text-center font-medium text-sm sm:min-w-[120px] md:min-w-[130px] lg:min-w-[140px] xl:min-w-[150px] 2xl:min-w-[160px]'>
                          What If
                        </TableHead>
                      </React.Fragment>
                    ))}
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) => (
                  <ResultTableRow
                    key={`${row.category}-${index}`}
                    category={row.category}
                    icon={row.icon}
                    annual={row.annual}
                    whatIfAnnual={row.whatIfAnnual}
                    percentage={row.percentage}
                    color={row.color}
                    isHighlight={row.isHighlight}
                    isSubRow={row.isSubRow}
                    visiblePeriods={visiblePeriods}
                    periodOptions={periodOptions}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Scroll hints - BELOW TABLE */}
      <AnimatePresence>
        {(showLeftIndicator || showRightIndicator) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='mt-4 flex flex-col items-center gap-2'
          >
            {/* Mobile hint - swipe gesture */}
            <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 font-medium text-foreground text-sm shadow-sm md:hidden'>
              {showLeftIndicator && (
                <motion.div
                  animate={{ x: [4, -4, 4] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <span className='text-lg'>👈</span>
                </motion.div>
              )}
              <span>Swipe to see all periods</span>
              {showRightIndicator && (
                <motion.div
                  animate={{ x: [-4, 4, -4] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <span className='text-lg'>👉</span>
                </motion.div>
              )}
            </div>

            {/* Desktop hint - drag and scroll */}
            <div className='hidden items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-5 py-3 font-medium text-foreground text-sm shadow-sm md:flex'>
              {showLeftIndicator && (
                <motion.div
                  animate={{ x: [4, -4, 4] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronDown className='-rotate-90 size-5 text-primary' />
                </motion.div>
              )}
              <span>🖱️ Drag or scroll horizontally to see all periods</span>
              {showRightIndicator && (
                <motion.div
                  animate={{ x: [-4, 4, -4] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronDown className='size-5 rotate-90 text-primary' />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tax Trap Inline Alert */}
      {taxTrapOptimization && onApplyPensionOptimization && (
        <div className='mt-4'>
          <TaxTrapInlineAlert
            salary={results.grossSalary.annually}
            suggestedPension={taxTrapOptimization.suggested}
            onApplyPension={onApplyPensionOptimization}
          />
        </div>
      )}

      {/* Marriage Allowance Alert */}
      {marriageAllowanceEligible && (
        <div className='mt-4'>
          <MarriageAllowanceAlert
            userSalary={results.grossSalary.annually}
            partnerSalary={partnerGrossWage}
            hasMarriageCode={false}
          />
        </div>
      )}
    </motion.div>
  );
}
