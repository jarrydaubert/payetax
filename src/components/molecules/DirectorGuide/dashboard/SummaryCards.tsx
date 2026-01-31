// src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx
/**
 * Summary Cards - Top row of key metrics with dark theme
 *
 * Restored from pre-merge design, rewired to use new strategy comparison store.
 */
'use client';

import { useMemo } from 'react';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';

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

  // Get active values (from slider or selected strategy)
  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // If using slider, calculate custom scenario
    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - (formData.pensionContribution || 0),
        formData.region ?? 'rUK',
        TAX_YEAR,
        formData.otherIncome,
        formData.hasEmploymentAllowance,
        formData.studentLoanPlans,
        formData.pensionContribution,
        formData.companyCarBIK,
      );

      return {
        takeHome: scenario.takeHome,
        salary: scenario.salary,
        dividends: scenario.dividends,
        corporationTax: scenario.corporationTax,
      };
    }

    // Use selected strategy
    const strategy = comparison.strategies[selectedStrategy];
    return {
      takeHome: strategy.takeHome,
      salary: strategy.salary,
      dividends: strategy.dividends,
      corporationTax: strategy.corporationTax,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  const hasResults = values !== null;

  const cards = [
    {
      label: 'Monthly Take-Home',
      value: hasResults ? formatCurrency(Math.round(values.takeHome / 12)) : '—',
      subtext: 'Optimised for tax efficiency',
      highlight: true,
    },
    {
      label: 'Annual Salary',
      value: hasResults ? formatCurrency(values.salary) : '—',
      subtext: 'Via PAYE payroll',
    },
    {
      label: 'Annual Dividends',
      value: hasResults ? formatCurrency(values.dividends) : '—',
      subtext: 'After corp tax',
    },
    {
      label: 'Company Tax Pot',
      value: hasResults ? formatCurrency(values.corporationTax) : '—',
      subtext: 'Corp tax to set aside',
    },
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-lg:grid-cols-2', className)}>
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} isEmpty={!hasResults} />
      ))}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
  isEmpty?: boolean;
}

function SummaryCard({ label, value, subtext, highlight, isEmpty }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/5 bg-slate-800 p-5 transition-all hover:-translate-y-0.5 hover:border-white/10',
        highlight &&
          !isEmpty &&
          'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5',
      )}
    >
      <div className='mb-2 font-medium text-slate-500 text-xs uppercase tracking-wider'>
        {label}
      </div>
      <div
        className={cn(
          'mb-1 font-semibold text-3xl tracking-tight',
          highlight && !isEmpty
            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'
            : 'text-slate-100',
          isEmpty && 'text-slate-600',
        )}
      >
        {value}
      </div>
      <div className={cn('text-slate-500 text-xs', isEmpty && 'text-slate-700')}>{subtext}</div>
    </div>
  );
}
