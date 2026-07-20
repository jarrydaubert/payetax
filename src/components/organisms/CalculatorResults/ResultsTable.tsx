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
import { CURRENT_TAX_YEAR, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { useMouseDragScroll } from '@/hooks/useMouseDragScroll';
import { trackEvent } from '@/lib/analytics';
import {
  buildResultsTableRows,
  type ResultsTableRowKind,
  type ResultsTableRowViewModel,
} from '@/lib/calculatorResultsPresenter';
import { calculateOptimalPension } from '@/lib/pensionOptimizer';
import { parseTaxCode } from '@/lib/tax';
import type { TaxCalculationResults } from '@/lib/types/calculator';
import { cn } from '@/lib/utils';

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
  marriageAllowance?: {
    isMarried?: boolean;
    partnerGrossWage?: number;
    taxCode?: string;
    isScottish?: boolean;
  };
}

interface RowPresentation {
  icon: React.ElementType;
  color: string;
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

const rowPresentation: Record<ResultsTableRowKind, RowPresentation> = {
  gross: { icon: PoundSterling, color: 'text-foreground' },
  employment: { icon: Building, color: 'text-muted-foreground' },
  otherIncome: { icon: Coins, color: 'text-muted-foreground' },
  taxFree: { icon: Shield, color: 'text-foreground' },
  taxable: { icon: Scale, color: 'text-foreground' },
  incomeTax: { icon: Calculator, color: 'text-destructive' },
  taxBand: { icon: Percent, color: 'text-destructive' },
  studentLoan: { icon: GraduationCap, color: 'text-destructive' },
  nationalInsurance: { icon: CreditCard, color: 'text-warning' },
  pension: { icon: PiggyBank, color: 'text-accent-foreground' },
  nonTaxableAllowance: { icon: Coins, color: 'text-primary' },
  netPay: { icon: Wallet, color: 'text-success' },
  employerNI: { icon: Building, color: 'text-muted-foreground' },
  yearChange: { icon: TrendingUp, color: 'text-success' },
};

function getRowPresentation(row: ResultsTableRowViewModel): RowPresentation {
  if (row.kind === 'yearChange' && row.annual < 0) {
    return { icon: TrendingUp, color: 'text-destructive' };
  }

  return rowPresentation[row.kind];
}

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
  marriageAllowance,
}: ResultsTableProps) {
  const {
    isMarried = false,
    partnerGrossWage = 0,
    taxCode = '1257L',
    isScottish = false,
  } = marriageAllowance ?? {};
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

    // Preserve the existing M/M1 UI gate while deriving both markers from the
    // shared grammar instead of reinterpreting the raw code locally.
    const parsedTaxCode = parseTaxCode(taxCode, 0);
    const hasMarriageCode = parsedTaxCode.letter === 'M' || parsedTaxCode.suffix === 'M1';
    if (hasMarriageCode) return false;

    // Get tax constants for the current year
    const taxConstants = TAX_RATES[(taxYear || CURRENT_TAX_YEAR) as TaxYear];
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
  const currentTaxYear = taxYear || CURRENT_TAX_YEAR; // e.g., "2025-2026"
  const currentYearStart = Number.parseInt(currentTaxYear.split('-')[0] || '', 10); // 2025
  const previousYearLabel = currentYearStart - 1; // 2024

  const handlePeriodToggle = (period: string) => {
    if (!onVisiblePeriodsChange) return;

    const currentlyVisible = visiblePeriods.includes(period);
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

    trackEvent({
      action: 'result_viewed',
      category: 'engagement',
      label: period,
      custom_data: {
        selected: !currentlyVisible,
        visible_period_count: newPeriods.length,
      },
    });

    onVisiblePeriodsChange(newPeriods);
  };

  const tableRows = buildResultsTableRows({
    results,
    allowancesDeductions,
    studentLoans,
    previousYearResults,
    whatIfResults,
    previousYearLabel: String(previousYearLabel),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn('w-full', 'space-y-4')}
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
      <div className='relative -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full'>
        {/* Scroll Indicators - must be positioned absolutely to overlay the card */}
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        <Card className='relative w-full overflow-hidden rounded-sm border-border bg-card shadow-none'>
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
          <section
            ref={containerRef}
            className='scroll-area-thin w-full cursor-grab overflow-x-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing [&.is-dragging]:cursor-grabbing [&.is-dragging]:select-none [&.is-dragging_*]:select-none'
            aria-label='Tax calculation results table - scrollable'
            aria-describedby={scrollHintId}
            data-testid='results-table-container'
          >
            <table
              data-testid='results-table'
              className={cn(
                'w-full min-w-[42rem] table-fixed caption-bottom sm:min-w-full',
                whatIfResults && 'min-w-[64rem]',
                'text-[0.8125rem] xl:text-sm',
              )}
            >
              <colgroup>
                <col className='w-[10.5rem] xl:w-[11.5rem]' />
                <col className='w-12 xl:w-14' />
                {visiblePeriods.map((period) =>
                  whatIfResults ? (
                    <React.Fragment key={period}>
                      <col />
                      <col />
                    </React.Fragment>
                  ) : (
                    <col key={period} />
                  ),
                )}
              </colgroup>
              <caption className='sr-only'>
                Tax calculation breakdown showing gross pay, deductions, and take-home pay across
                different time periods
              </caption>
              <ResultsTableHeader
                visiblePeriods={visiblePeriods}
                hasWhatIfResults={!!whatIfResults}
              />
              <TableBody>
                {tableRows.map((row) => {
                  const presentation = getRowPresentation(row);

                  return (
                    <ResultTableRow
                      key={row.id}
                      category={row.category}
                      icon={presentation.icon}
                      annual={row.annual}
                      whatIfAnnual={row.whatIfAnnual}
                      valuesByPeriod={row.valuesByPeriod}
                      whatIfValuesByPeriod={row.whatIfValuesByPeriod}
                      percentage={row.percentage}
                      color={presentation.color}
                      isHighlight={row.isHighlight}
                      isSubRow={row.isSubRow}
                      visiblePeriods={visiblePeriods}
                      periodOptions={periodOptions}
                    />
                  );
                })}
              </TableBody>
            </table>
          </section>
        </Card>
      </div>

      {/* Tax Trap Inline Alert */}
      {taxTrapOptimization && onApplyPensionOptimization && (
        <div className={'mt-4'}>
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
        <div className={'mt-4'}>
          <MarriageAllowanceAlert
            userSalary={results.grossSalary.annually}
            partnerSalary={partnerGrossWage}
            hasMarriageCode={false}
            taxYear={taxYear as TaxYear}
            isScottish={isScottish}
          />
        </div>
      )}
    </motion.div>
  );
}
