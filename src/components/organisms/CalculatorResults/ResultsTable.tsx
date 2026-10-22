// src/components/organisms/CalculatorResults/ResultsTable.tsx
'use client';

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
import { PeriodSelectorCard } from '@/components/molecules/PeriodSelectorCard';
import { ResultsTableHeader } from '@/components/molecules/ResultsTableHeader';
import { ResultTableRow } from '@/components/molecules/ResultTableRow';
import { Card } from '@/components/ui/card';
import { TableBody } from '@/components/ui/table';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { trackEvent } from '@/lib/analytics';
import {
  buildResultsTableRows,
  PERIOD_LABEL_TO_PAY_PERIOD,
  type ResultsTableRowKind,
  type ResultsTableRowViewModel,
} from '@/lib/calculatorResultsPresenter';
import { CURRENT_TAX_YEAR } from '@/lib/tax';
import type { TaxCalculationResults } from '@/lib/types/calculator';
import { cn } from '@/lib/utils';
import { CalculatorInsights } from './CalculatorInsights';
import { ResultPeriodSelect } from './ResultPeriodSelect';

interface ResultsTableProps {
  results: TaxCalculationResults;
  responsive?: boolean;
  hoursPerWeek?: number;
  showInsights?: boolean;
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

const TABLE_FIXED_COLUMNS_WIDTH_REM = 15;
const TABLE_PERIOD_COLUMN_WIDTH_REM = 8;

const rowPresentation: Record<ResultsTableRowKind, RowPresentation> = {
  gross: { icon: PoundSterling, color: 'text-foreground' },
  employment: { icon: Building, color: 'text-muted-foreground' },
  otherIncome: { icon: Coins, color: 'text-muted-foreground' },
  taxFree: { icon: Shield, color: 'text-foreground' },
  taxCodeAdjustment: { icon: Scale, color: 'text-foreground' },
  taxable: { icon: Scale, color: 'text-foreground' },
  incomeTax: { icon: Calculator, color: 'text-foreground' },
  taxBand: { icon: Percent, color: 'text-foreground' },
  studentLoan: { icon: GraduationCap, color: 'text-foreground' },
  nationalInsurance: { icon: CreditCard, color: 'text-foreground' },
  pension: { icon: PiggyBank, color: 'text-accent-foreground' },
  nonTaxableAllowance: { icon: Coins, color: 'text-primary' },
  netPay: { icon: Wallet, color: 'text-success' },
  employerNI: { icon: Building, color: 'text-muted-foreground' },
  yearChange: { icon: TrendingUp, color: 'text-success' },
};

function getRowPresentation(row: ResultsTableRowViewModel): RowPresentation {
  if (row.kind === 'yearChange' && row.annual < 0) {
    return { icon: TrendingUp, color: 'text-foreground' };
  }

  return rowPresentation[row.kind];
}

export function ResultsTable({
  results,
  allowancesDeductions = 0,
  studentLoans = [],
  previousYearResults = null,
  whatIfResults = null,
  visiblePeriods: requestedPeriods = ['Yearly', 'Monthly', 'Weekly'],
  responsive = false,
  hoursPerWeek = 37.5,
  showInsights = true,
  onVisiblePeriodsChange,
  taxYear,
  onApplyPensionOptimization,
  marriageAllowance,
}: ResultsTableProps) {
  const taxCode = marriageAllowance?.taxCode ?? '';
  // Generate unique ID for accessibility
  const scrollHintId = React.useId();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const isWide = useMediaQuery('(min-width: 1280px)');
  const [pairedPeriods, setPairedPeriods] = React.useState(['Yearly', 'Monthly']);
  const paired = responsive && !isWide;
  const visiblePeriods = paired ? pairedPeriods : requestedPeriods;

  // Extract current year from taxYear to show "Net Change from 2024" instead of "Previous Year"
  // Default to current tax year if not provided
  const currentTaxYear = taxYear || CURRENT_TAX_YEAR; // e.g., "2025-2026"
  const currentYearStart = Number.parseInt(currentTaxYear.split('-')[0] || '', 10); // 2025
  const previousYearLabel = currentYearStart - 1; // 2024

  const handlePeriodToggle = (period: string) => {
    if (!onVisiblePeriodsChange) return;

    if (visiblePeriods.length === 1 && visiblePeriods.includes(period)) return;
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

  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    event.currentTarget.scrollBy({
      left: direction * Math.max(80, event.currentTarget.clientWidth * 0.25),
      behavior: 'auto',
    });
  };

  const tableRows = buildResultsTableRows({
    results,
    allowancesDeductions,
    studentLoans,
    previousYearResults,
    whatIfResults,
    previousYearLabel: String(previousYearLabel),
    taxCode,
  });
  const valuesPerPeriod = whatIfResults ? 2 : 1;
  const tableMinWidthRem =
    TABLE_FIXED_COLUMNS_WIDTH_REM +
    visiblePeriods.length * valuesPerPeriod * TABLE_PERIOD_COLUMN_WIDTH_REM;

  return (
    <div className={cn('flex w-full flex-col gap-4', paired && 'paye-comparison--paired')}>
      {/* Period Selection */}
      {paired ? (
        <div className='flex flex-wrap gap-4'>
          <ResultPeriodSelect
            label='First period'
            value={PERIOD_LABEL_TO_PAY_PERIOD[pairedPeriods[0] ?? 'Yearly'] ?? 'annually'}
            exclude={PERIOD_LABEL_TO_PAY_PERIOD[pairedPeriods[1] ?? 'Monthly']}
            onChange={(value) =>
              setPairedPeriods([
                Object.keys(PERIOD_LABEL_TO_PAY_PERIOD).find(
                  (label) => PERIOD_LABEL_TO_PAY_PERIOD[label] === value,
                ) ?? 'Yearly',
                pairedPeriods[1] ?? 'Monthly',
              ])
            }
          />
          <ResultPeriodSelect
            label='Second period'
            value={PERIOD_LABEL_TO_PAY_PERIOD[pairedPeriods[1] ?? 'Monthly'] ?? 'monthly'}
            exclude={PERIOD_LABEL_TO_PAY_PERIOD[pairedPeriods[0] ?? 'Yearly']}
            onChange={(value) =>
              setPairedPeriods([
                pairedPeriods[0] ?? 'Yearly',
                Object.keys(PERIOD_LABEL_TO_PAY_PERIOD).find(
                  (label) => PERIOD_LABEL_TO_PAY_PERIOD[label] === value,
                ) ?? 'Monthly',
              ])
            }
          />
        </div>
      ) : (
        <details className='statement-disclosure'>
          <summary>Choose comparison columns</summary>
          <PeriodSelectorCard
            periods={Object.keys(periodOptions)}
            visiblePeriods={visiblePeriods}
            onPeriodToggle={handlePeriodToggle}
          />
        </details>
      )}

      {/* Comparison keeps values selectable, without overlays covering monetary figures. */}
      <div className='relative w-full min-w-0'>
        <Card
          className={cn(
            'relative w-full rounded-sm border-border bg-card shadow-none',
            !paired && 'overflow-hidden',
          )}
        >
          {/* Screen reader hint for scrollable region */}
          <div id={scrollHintId} className='sr-only'>
            Use the Left and Right Arrow keys, horizontal scroll or swipe to view all pay periods.
            Navigate through the table to see yearly, monthly, weekly, and other breakdowns.
          </div>

          <section
            ref={containerRef}
            className={cn(
              'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              !paired && 'scroll-area-thin overflow-x-auto',
            )}
            aria-label='Tax calculation results table - scrollable'
            aria-describedby={scrollHintId}
            data-testid='results-table-container'
            // biome-ignore lint/a11y/noNoninteractiveTabindex: A focusable overflow region lets keyboard users scroll the financial table.
            tabIndex={0}
            onKeyDown={handleTableKeyDown}
          >
            <table
              data-testid='results-table'
              className={cn('w-full caption-bottom', 'text-[0.8125rem] xl:text-sm')}
              style={paired ? undefined : { minWidth: `${tableMinWidthRem}rem` }}
              // biome-ignore lint/a11y/noRedundantRoles: Preserve table semantics when the paired layout uses CSS grid in WebKit.
              role='table'
            >
              <colgroup>
                <col className='w-[10.5rem] xl:w-[11.5rem]' />
                <col className='w-12 xl:w-14' />
                {visiblePeriods.map((period) =>
                  whatIfResults ? (
                    <React.Fragment key={period}>
                      <col className='w-[8rem]' />
                      <col className='w-[8rem]' />
                    </React.Fragment>
                  ) : (
                    <col key={period} className='w-[8rem]' />
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
                      hoursPerWeek={hoursPerWeek}
                    />
                  );
                })}
              </TableBody>
            </table>
          </section>
        </Card>
      </div>

      <p className='text-muted-foreground text-xs'>
        Percentages are shares of gross pay; the previous-year change is relative to previous
        take-home.
      </p>
      {showInsights && (
        <CalculatorInsights
          results={results}
          taxYear={taxYear}
          marriageAllowance={marriageAllowance}
          onApplyPensionOptimization={onApplyPensionOptimization}
        />
      )}
    </div>
  );
}
