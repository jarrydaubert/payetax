/**
 * Summary Cards - Top row of key financial metrics
 *
 * Shows monthly take-home, annual salary, dividends, and corporation tax.
 * Values come from either the slider scenario or selected strategy.
 */
'use client';

import { useMemo } from 'react';
import { GradientText } from '@/components/atoms/GradientText';
import type { TaxYear } from '@/constants/taxRates';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

// TODO: Centralize tax year selection in app config
const TAX_YEAR: TaxYear = '2025-2026';

interface SummaryCardsProps {
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SummaryCards({ className }: SummaryCardsProps) {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();
  const formData = useDirectorFormData();

  // Extract only the fields we need to minimize re-renders
  const {
    region,
    otherIncome,
    pensionContribution,
    hasEmploymentAllowance,
    studentLoanPlans,
    companyCarBIK,
  } = formData;

  // Get active values (from slider or selected strategy)
  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // comparison.grossProfit already has pension deducted (in strategyComparison.ts)
    // Pass it directly - don't subtract pension again
    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit,
        region ?? 'rUK',
        TAX_YEAR,
        otherIncome,
        hasEmploymentAllowance,
        studentLoanPlans,
        pensionContribution,
        companyCarBIK,
      );

      return {
        takeHome: scenario.takeHome,
        salary: scenario.salary,
        dividends: scenario.dividends,
        corporationTax: scenario.corporationTax,
        dividendTax: scenario.dividendTax,
      };
    }

    // Use selected strategy
    const strategy = comparison.strategies[selectedStrategy];
    return {
      takeHome: strategy.takeHome,
      salary: strategy.salary,
      dividends: strategy.dividends,
      corporationTax: strategy.corporationTax,
      dividendTax: strategy.dividendTax,
    };
  }, [
    comparison,
    sliderSalary,
    selectedStrategy,
    region,
    otherIncome,
    pensionContribution,
    hasEmploymentAllowance,
    studentLoanPlans,
    companyCarBIK,
  ]);

  const hasResults = values !== null;

  // Calculate net dividends for display (gross dividends - dividend tax)
  const netDividends = hasResults ? values.dividends - values.dividendTax : 0;

  const cards = [
    {
      label: 'Monthly Take-Home',
      value: hasResults ? formatCurrency(Math.floor(values.takeHome / 12)) : '—',
      subtext: 'After all taxes (illustrative)',
      highlight: true,
      ariaDescription: hasResults
        ? `Monthly take-home pay of ${formatCurrency(Math.floor(values.takeHome / 12))}, calculated after all personal taxes`
        : 'No results available',
    },
    {
      label: 'Annual Salary',
      value: hasResults ? formatCurrency(values.salary) : '—',
      subtext: 'Gross via PAYE',
      ariaDescription: hasResults
        ? `Annual gross salary of ${formatCurrency(values.salary)} paid via PAYE`
        : 'No results available',
    },
    {
      label: 'Annual Dividends',
      value: hasResults ? formatCurrency(values.dividends) : '—',
      subtext: `Gross declared${hasResults && values.dividendTax > 0 ? ` (${formatCurrency(netDividends)} after tax)` : ''}`,
      ariaDescription: hasResults
        ? `Annual gross dividends of ${formatCurrency(values.dividends)}${values.dividendTax > 0 ? `, ${formatCurrency(netDividends)} after dividend tax` : ''}`
        : 'No results available',
    },
    {
      label: 'Corporation Tax',
      value: hasResults ? formatCurrency(values.corporationTax) : '—',
      subtext: 'To set aside for HMRC',
      ariaDescription: hasResults
        ? `Corporation tax of ${formatCurrency(values.corporationTax)} to set aside`
        : 'No results available',
    },
  ];

  return (
    <section
      className={cn('grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-lg:grid-cols-2', className)}
      aria-label='Financial summary'
    >
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} isEmpty={!hasResults} />
      ))}
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
  isEmpty?: boolean;
  ariaDescription: string;
}

function SummaryCard({
  label,
  value,
  subtext,
  highlight,
  isEmpty,
  ariaDescription,
}: SummaryCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-white/5 bg-slate-800 p-5 transition-all hover:-translate-y-0.5 hover:border-white/10',
        highlight &&
          !isEmpty &&
          'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5',
      )}
      aria-label={ariaDescription}
    >
      <div className='mb-2 font-medium text-slate-500 text-xs uppercase tracking-wider'>
        {label}
      </div>
      <div
        className={cn(
          'mb-1 font-semibold text-3xl tracking-tight',
          !highlight && 'text-slate-100',
          isEmpty && 'text-slate-600',
        )}
      >
        {highlight && !isEmpty ? (
          <GradientText variant='custom' className='bg-gradient-to-r from-cyan-500 to-emerald-500'>
            {value}
          </GradientText>
        ) : (
          value
        )}
      </div>
      <div className={cn('text-slate-500 text-xs', isEmpty && 'text-slate-700')}>{subtext}</div>
    </article>
  );
}
