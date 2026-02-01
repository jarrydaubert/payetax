/**
 * Money Flow Chart - Horizontal bar chart showing profit allocation
 *
 * Shows how gross profit is allocated between:
 * - Personal take-home (after all taxes)
 * - Company taxes (CT + Employer NI)
 * - Retained in company (what's left)
 */
'use client';

import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import type { TaxYear } from '@/constants/taxRates';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

// TODO: Centralize tax year selection in app config
const TAX_YEAR: TaxYear = '2025-2026';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

export function MoneyFlowChart() {
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

  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // Use grossProfit directly - calculateSalaryScenario handles pension internally
    // when passed as a parameter (it's treated as a cost that reduces taxable profit)
    const profitForCalc = comparison.grossProfit;

    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        profitForCalc,
        region ?? 'rUK',
        TAX_YEAR,
        otherIncome,
        hasEmploymentAllowance,
        studentLoanPlans,
        pensionContribution,
        companyCarBIK,
      );
      return {
        salary: scenario.salary,
        dividends: scenario.dividends,
        corporationTax: scenario.corporationTax,
        employerNI: scenario.employerNI,
        // Use the actual take-home from the scenario (salary - personal taxes)
        personalTakeHome: scenario.takeHome,
        dividendTax: scenario.dividendTax,
        pension: scenario.pension,
      };
    }

    const strategy = comparison.strategies[selectedStrategy];
    return {
      salary: strategy.salary,
      dividends: strategy.dividends,
      corporationTax: strategy.corporationTax,
      employerNI: strategy.employerNI,
      personalTakeHome: strategy.takeHome,
      dividendTax: strategy.dividendTax,
      pension: strategy.pension,
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

  if (!(values && comparison)) return null;

  const grossProfit = comparison.grossProfit;

  // Calculate actual take-home: salary take-home + dividends after dividend tax
  const actualTakeHome = values.personalTakeHome + (values.dividends - values.dividendTax);

  // Company-side taxes: Corporation Tax + Employer NI
  const companyTaxes = values.corporationTax + values.employerNI;

  // What remains in the company after all extractions and taxes
  // Retained = Profit - Salary - ErNI - Dividends - CT - Pension
  const retained = Math.max(
    0,
    grossProfit -
      values.salary -
      values.employerNI -
      values.dividends -
      values.corporationTax -
      values.pension,
  );

  // Helper to clamp percentages for display
  const clampPercent = (val: number, max: number) => Math.max(0, Math.min(100, (val / max) * 100));

  const bars = [
    {
      label: 'Gross Profit',
      value: grossProfit,
      color: 'bg-slate-500',
      percent: 100,
      ariaLabel: `Gross Profit: ${formatCurrency(grossProfit)}, 100% of total`,
    },
    {
      label: 'Your Take-Home',
      value: actualTakeHome,
      color: 'bg-emerald-500',
      percent: clampPercent(actualTakeHome, grossProfit),
      ariaLabel: `Your Take-Home after all taxes: ${formatCurrency(actualTakeHome)}, ${Math.round(clampPercent(actualTakeHome, grossProfit))}% of profit`,
    },
    {
      label: 'Company Taxes',
      value: companyTaxes,
      color: 'bg-amber-500',
      percent: clampPercent(companyTaxes, grossProfit),
      ariaLabel: `Company Taxes (CT + Employer NI): ${formatCurrency(companyTaxes)}, ${Math.round(clampPercent(companyTaxes, grossProfit))}% of profit`,
    },
    {
      label: 'Retained',
      value: retained,
      color: 'bg-blue-500',
      percent: clampPercent(retained, grossProfit),
      ariaLabel: `Retained in Company: ${formatCurrency(retained)}, ${Math.round(clampPercent(retained, grossProfit))}% of profit`,
    },
  ];

  return (
    <div className='rounded-xl border border-white/[0.04] bg-slate-800 p-4'>
      <div className='mb-3 flex items-center gap-2 text-slate-400'>
        <BarChart3 className='size-4' aria-hidden='true' />
        <span className='font-medium text-sm'>Money Flow</span>
      </div>

      <ul className='space-y-2' aria-label='Profit allocation breakdown'>
        {bars.map((bar) => (
          <li
            key={bar.label}
            className='flex items-center gap-3 text-xs'
            aria-label={bar.ariaLabel}
          >
            <span className='w-24 text-slate-500'>{bar.label}</span>
            <div
              className='relative h-4 flex-1 overflow-hidden rounded bg-slate-900'
              role='progressbar'
              aria-valuenow={Math.round(bar.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`absolute inset-y-0 left-0 ${bar.color} transition-all duration-300`}
                style={{ width: `${bar.percent}%` }}
              />
            </div>
            <span className='w-16 text-right font-mono text-slate-300'>
              {formatCurrency(bar.value)}
            </span>
          </li>
        ))}
      </ul>

      {/* Legend for accessibility */}
      <div className='mt-3 flex flex-wrap gap-3 text-slate-500 text-xs'>
        <span className='flex items-center gap-1'>
          <span className='inline-block size-2 rounded-sm bg-emerald-500' aria-hidden='true' />
          After tax
        </span>
        <span className='flex items-center gap-1'>
          <span className='inline-block size-2 rounded-sm bg-amber-500' aria-hidden='true' />
          CT + ErNI
        </span>
        <span className='flex items-center gap-1'>
          <span className='inline-block size-2 rounded-sm bg-blue-500' aria-hidden='true' />
          In company
        </span>
      </div>
    </div>
  );
}
