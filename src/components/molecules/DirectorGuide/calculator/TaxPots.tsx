// src/components/molecules/DirectorGuide/calculator/TaxPots.tsx
/**
 * Tax Pots - Company and Personal tax pots to set aside
 *
 * Dark theme with cyan/emerald accents.
 */
'use client';

import { useMemo } from 'react';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import {
  useDirectorFormSlice,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function TaxPots() {
  const formData = useDirectorFormSlice((state) => ({
    region: state.region,
    otherIncome: state.otherIncome,
    hasEmploymentAllowance: state.hasEmploymentAllowance,
    studentLoanPlans: state.studentLoanPlans,
    pensionContribution: state.pensionContribution,
    companyCarBIK: state.companyCarBIK,
  }));
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();

  // Calculate active scenario values
  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // If using slider, calculate custom scenario
    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - formData.pensionContribution,
        formData.region ?? 'rUK',
        TAX_YEAR,
        formData.otherIncome,
        formData.hasEmploymentAllowance,
        formData.studentLoanPlans,
        formData.pensionContribution,
        formData.companyCarBIK,
      );

      return {
        corporationTax: scenario.corporationTax,
        incomeTax: scenario.incomeTax,
        dividendTax: scenario.dividendTax,
        studentLoan: scenario.studentLoan,
      };
    }

    // Use selected strategy
    const strategy = comparison.strategies[selectedStrategy];
    return {
      corporationTax: strategy.corporationTax,
      incomeTax: strategy.incomeTax,
      dividendTax: strategy.dividendTax,
      studentLoan: strategy.studentLoan,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  if (!values) return null;

  const personalTotal = values.incomeTax + values.dividendTax + values.studentLoan;

  // Monthly set-aside amounts (annual ÷ 12)
  const monthlyCompanyPot = Math.round(values.corporationTax / 12);
  const monthlyPersonalPot = Math.round(personalTotal / 12);

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Company Tax Pot */}
        <div className='rounded-xl border border-cyan-500/30 bg-slate-800 p-5'>
          <div className='mb-4'>
            <h3 className='font-semibold text-cyan-400 text-sm'>Company Tax Pot</h3>
            <p className='text-slate-500 text-xs'>Set aside in company account</p>
          </div>
          <div className='space-y-1.5 text-sm'>
            <div className='flex justify-between text-slate-300'>
              <span>Corporation Tax</span>
              <span className='font-mono'>{formatCurrency(values.corporationTax)}</span>
            </div>
            <div className='flex justify-between border-white/5 border-t pt-2'>
              <span className='font-medium text-slate-100'>Monthly</span>
              <span className='font-mono font-semibold text-cyan-400'>
                {formatCurrency(monthlyCompanyPot)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Personal Tax Pot */}
        <div className='rounded-xl border border-purple-500/30 bg-slate-800 p-5'>
          <div className='mb-4'>
            <h3 className='font-semibold text-purple-400 text-sm'>Personal Tax Pot</h3>
            <p className='text-slate-500 text-xs'>Set aside for Self Assessment</p>
          </div>
          <div className='space-y-1.5 text-sm'>
            <div className='flex justify-between text-slate-300'>
              <span>Income Tax</span>
              <span className='font-mono'>{formatCurrency(values.incomeTax)}</span>
            </div>
            <div className='flex justify-between text-slate-300'>
              <span>Dividend Tax</span>
              <span className='font-mono'>{formatCurrency(values.dividendTax)}</span>
            </div>
            {values.studentLoan > 0 && (
              <div className='flex justify-between text-slate-300'>
                <span>Student Loan</span>
                <span className='font-mono'>{formatCurrency(values.studentLoan)}</span>
              </div>
            )}
            <div className='flex justify-between border-white/5 border-t pt-2'>
              <span className='font-medium text-slate-100'>Monthly</span>
              <span className='font-mono font-semibold text-purple-400'>
                {formatCurrency(monthlyPersonalPot)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer per spec */}
      <p className='text-center text-slate-600 text-xs'>
        Illustrative set-aside for budgeting — not HMRC payment amounts. See Key Dates for actual
        due dates.
      </p>
    </div>
  );
}
