// src/components/organisms/CalculatorResults/ResultsTable.tsx
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
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { LandscapePrompt } from '@/components/molecules/LandscapePrompt';
import { MarriageAllowanceAlert } from '@/components/molecules/MarriageAllowanceAlert';
import { PeriodSelectorCard } from '@/components/molecules/PeriodSelectorCard';
import { ResultsTableHeader } from '@/components/molecules/ResultsTableHeader';
import { ResultTableRow } from '@/components/molecules/ResultTableRow';
import { TaxTrapInlineAlert } from '@/components/molecules/TaxTrapInlineAlert';
import { Card } from '@/components/ui/card';
import { TableBody } from '@/components/ui/table';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { TAX_RATES, type TaxYear } from '@/constants/taxRates';
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
      results.pensionContribution.annually,
    );
  }, [results.grossSalary.annually, results.pensionContribution.annually]);

  // Marriage allowance eligibility check
  const marriageAllowanceEligible = React.useMemo(() => {
    // Must be married - partnerGrossWage can be 0 (that's a valid eligible case!)
    if (!isMarried) return false;
    if (partnerGrossWage == null) return false;

    // Check if user already has M code (already claiming)
    const hasMarriageCode = taxCode.toUpperCase().includes('M');
    if (hasMarriageCode) return false;

    // Get tax constants for the current year
    const taxConstants = TAX_RATES[(taxYear || '2025-2026') as TaxYear];
    const basicBand = taxConstants?.bands[0];
    if (!(taxConstants && basicBand)) return false;
    const personalAllowance = taxConstants.personalAllowance;
    const basicRateUpper = personalAllowance + basicBand.threshold;

    // Partner must earn less than Personal Allowance
    if (partnerGrossWage >= personalAllowance) return false;

    // User must be a basic rate taxpayer
    const userSalary = results.grossSalary.annually;
    if (userSalary <= personalAllowance || userSalary > basicRateUpper) return false;

    // User is eligible!
    return true;
  }, [isMarried, partnerGrossWage, taxCode, results.grossSalary.annually, taxYear]);

  // Extract current year from taxYear to show "Net Change from 2024" instead of "Previous Year"
  // Default to current tax year if not provided
  const currentTaxYear = taxYear || '2025-2026'; // e.g., "2025-2026"
  const currentYearStart = Number.parseInt(currentTaxYear.split('-')[0] || '', 10); // 2025
  const previousYearLabel = currentYearStart - 1; // 2024

  // Format the previous year row label (only used when previousYearResults exists)
  const previousYearRowLabel = `Net Change from ${previousYearLabel}`;

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
    const percentage = Math.abs((amount / total) * 100);
    // Cap percentage display at 999.9% for readability
    // (e.g., Tax-Free Allowance of £12,570 on £1 salary would be 1,257,000%)
    const cappedPercentage = Math.min(percentage, 999.9);
    return `${cappedPercentage.toFixed(1)}%`;
  };

  // Use total gross income (employment + other income) for percentage calculations
  // If incomeBreakdown exists, use the total field; otherwise fall back to grossSalary
  const grossAnnual = results.incomeBreakdown?.total || results.grossSalary.annually;
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
      whatIfAnnual: whatIfResults?.incomeBreakdown?.total || whatIfResults?.grossSalary.annually,
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
                    grossAnnual,
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
      color: 'text-destructive',
      isHighlight: false,
    },
    // Tax Band Breakdown
    ...results.taxBands.map((band, idx) => ({
      category: `${band.rate}% Rate`,
      icon: Percent,
      annual: band.amount,
      whatIfAnnual: whatIfResults?.taxBands[idx]?.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      color: 'text-destructive',
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
            color: 'text-destructive',
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
      color: 'text-accent-foreground',
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
    // Only show year change row when we have previous year data
    ...(previousYearResults
      ? [
          {
            category: previousYearRowLabel,
            icon: TrendingUp,
            annual: yearChange,
            whatIfAnnual: whatIfYearChange,
            percentage: yearChangePercentage,
            color: yearChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive',
            isHighlight: false,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={`w-full ${SPACING.SPACE_Y_4}`}
    >
      {/* Landscape Prompt - Shows on mobile portrait to encourage rotation for better table viewing */}
      <LandscapePrompt />

      {/* Period Selection */}
      <PeriodSelectorCard
        periods={Object.keys(periodOptions)}
        visiblePeriods={visiblePeriods}
        onPeriodToggle={handlePeriodToggle}
      />

      {/* Results Table with Scroll Indicators */}
      <div className='relative -mx-2 w-full sm:mx-0'>
        {/* Scroll Indicators - must be positioned absolutely to overlay the card */}
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        <Card className='relative w-full overflow-hidden'>
          {/* Screen reader hint for scrollable region */}
          <div id={scrollHintId} className='sr-only'>
            Use horizontal scroll, swipe, or click and drag to view all pay periods. Navigate
            through the table to see yearly, monthly, weekly, and other breakdowns.
          </div>

          {/* 
            IMPORTANT: This container has scroll-behavior: smooth for regular scrolling UX
            The useMouseDragScroll hook handles this correctly by using scrollTo({ behavior: 'auto' })
            during drag operations. If drag scroll breaks, check the hook implementation - it MUST use
            scrollTo() method, NOT direct scrollLeft assignment! See useMouseDragScroll.ts for details.
          */}
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: tabIndex required for keyboard scrolling of overflow container */}
          <section
            ref={containerRef}
            tabIndex={0}
            className='w-full cursor-grab overflow-x-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing'
            style={{
              scrollbarWidth: 'auto',
              scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
            aria-label='Tax calculation results table - scrollable'
            aria-describedby={scrollHintId}
            data-testid='results-table-container'
          >
            <table
              data-testid='results-table'
              className={`table-drag-scroll w-full caption-bottom ${TYPOGRAPHY.TEXT_SM}`}
              style={{ tableLayout: 'auto', minWidth: '100%' }}
            >
              <caption className='sr-only'>
                Tax calculation breakdown showing gross pay, deductions, and take-home pay across
                different time periods
              </caption>
              <ResultsTableHeader
                visiblePeriods={visiblePeriods}
                hasWhatIfResults={!!whatIfResults}
              />
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
            </table>
          </section>
        </Card>
      </div>

      {/* Tax Trap Inline Alert */}
      {taxTrapOptimization && onApplyPensionOptimization && (
        <div className={SPACING.MT_4}>
          <TaxTrapInlineAlert
            salary={results.grossSalary.annually}
            suggestedPension={taxTrapOptimization.suggested}
            onApplyPension={onApplyPensionOptimization}
            taxYear={taxYear as TaxYear}
          />
        </div>
      )}

      {/* Marriage Allowance Alert */}
      {marriageAllowanceEligible && (
        <div className={SPACING.MT_4}>
          <MarriageAllowanceAlert
            userSalary={results.grossSalary.annually}
            partnerSalary={partnerGrossWage}
            hasMarriageCode={false}
            taxYear={taxYear as TaxYear}
          />
        </div>
      )}
    </motion.div>
  );
}
