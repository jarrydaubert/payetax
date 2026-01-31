// src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx
/**
 * Detail Cards - 4 breakdown cards (Salary, Dividend, Corp Tax, Tax Summary)
 *
 * Rewired to use new strategy comparison store.
 * Matches the mockup design.
 */
'use client';

import { useMemo } from 'react';
import { TAX_RATES } from '@/constants/taxRates';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';
const DIVIDEND_ALLOWANCE = TAX_RATES[TAX_YEAR].dividendAllowance;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DetailCardsProps {
  className?: string;
}

export function DetailCards({ className }: DetailCardsProps) {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();
  const formData = useDirectorFormData();

  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    if (sliderSalary !== null && formData.region) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - (formData.pensionContribution || 0),
        formData.region,
        TAX_YEAR,
        formData.otherIncome,
        formData.hasEmploymentAllowance,
        formData.studentLoanPlans,
        formData.pensionContribution,
        formData.companyCarBIK,
      );

      return {
        salary: scenario.salary,
        dividends: scenario.dividends,
        employerNI: scenario.employerNI,
        employeeNI: scenario.employeeNI,
        incomeTax: scenario.incomeTax,
        corporationTax: scenario.corporationTax,
        dividendTax: scenario.dividendTax,
        taxableProfit: comparison.grossProfit - scenario.salary - scenario.employerNI,
      };
    }

    const strategy = comparison.strategies[selectedStrategy];
    return {
      salary: strategy.salary,
      dividends: strategy.dividends,
      employerNI: strategy.employerNI,
      employeeNI: strategy.employeeNI,
      incomeTax: strategy.incomeTax,
      corporationTax: strategy.corporationTax,
      dividendTax: strategy.dividendTax,
      taxableProfit: comparison.grossProfit - strategy.salary - strategy.employerNI,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  if (!(values && comparison)) return null;

  const revenue = formData.revenue || 0;
  const expenses = formData.expenses || 0;

  return (
    <div className={cn('grid grid-cols-2 gap-4 max-lg:grid-cols-1', className)}>
      {/* Salary Breakdown */}
      <DetailCard
        title='Salary Breakdown'
        badge='Via payroll'
        rows={[
          { label: 'Gross Salary', value: formatCurrency(values.salary) },
          {
            label: 'Income Tax',
            value: formatCurrency(values.incomeTax),
            positive: values.incomeTax === 0,
          },
          {
            label: 'Employee NI',
            value: formatCurrency(values.employeeNI),
            positive: values.employeeNI === 0,
          },
          {
            label: 'Employer NI (company cost)',
            value: values.employerNI > 0 ? `-${formatCurrency(values.employerNI)}` : '£0',
            negative: values.employerNI > 0,
          },
        ]}
        total={{
          label: 'Net Salary',
          value: formatCurrency(values.salary - values.incomeTax - values.employeeNI),
        }}
      />

      {/* Dividend Breakdown */}
      <DetailCard
        title='Dividend Breakdown'
        badge='Rate varies by band'
        rows={[
          { label: 'Gross Dividends', value: formatCurrency(values.dividends) },
          {
            label: 'Dividend Allowance',
            value: `${formatCurrency(DIVIDEND_ALLOWANCE)} tax-free`,
            positive: true,
          },
          {
            label: 'Taxable Amount',
            value: formatCurrency(Math.max(0, values.dividends - DIVIDEND_ALLOWANCE)),
          },
          {
            label: 'Dividend Tax',
            value: values.dividendTax > 0 ? `-${formatCurrency(values.dividendTax)}` : '£0',
            negative: values.dividendTax > 0,
          },
        ]}
        total={{
          label: 'Net Dividends',
          value: formatCurrency(values.dividends - values.dividendTax),
        }}
      />

      {/* Corporation Tax */}
      <DetailCard
        title='Corporation Tax'
        badge='Rate varies by profit'
        rows={[
          { label: 'Revenue', value: formatCurrency(revenue) },
          {
            label: 'Business Expenses',
            value: expenses > 0 ? `-${formatCurrency(expenses)}` : '£0',
            negative: expenses > 0,
          },
          {
            label: 'Salary + Employer NI',
            value: `-${formatCurrency(values.salary + values.employerNI)}`,
            negative: true,
          },
          { label: 'Taxable Profit', value: formatCurrency(values.taxableProfit) },
        ]}
        total={{
          label: 'Corp Tax Due',
          value: formatCurrency(values.corporationTax),
        }}
      />

      {/* Tax Summary */}
      <DetailCard
        title='Tax Summary'
        rows={[
          { label: 'Corporation Tax (company)', value: formatCurrency(values.corporationTax) },
          { label: 'Employer NI (company)', value: formatCurrency(values.employerNI) },
          { label: 'Dividend Tax (you)', value: formatCurrency(values.dividendTax) },
          {
            label: 'Personal Tax (salary)',
            value: formatCurrency(values.incomeTax + values.employeeNI),
          },
        ]}
        total={{
          label: 'All Taxes & NI',
          value: formatCurrency(
            values.corporationTax +
              values.employerNI +
              values.dividendTax +
              values.incomeTax +
              values.employeeNI,
          ),
          isError: true,
        }}
      />
    </div>
  );
}

interface DetailRow {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}

interface DetailCardProps {
  title: string;
  badge?: string;
  rows: DetailRow[];
  total: {
    label: string;
    value: string;
    isError?: boolean;
  };
}

function DetailCard({ title, badge, rows, total }: DetailCardProps) {
  return (
    <div className='rounded-xl border border-white/[0.04] bg-[#1e293b] p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <span className='font-semibold text-slate-100'>{title}</span>
        {badge && (
          <span className='rounded bg-cyan-500/10 px-2 py-1 text-cyan-500 text-xs'>{badge}</span>
        )}
      </div>

      <div className='space-y-0'>
        {rows.map((row) => (
          <div
            key={row.label}
            className='flex items-center justify-between border-white/[0.04] border-b py-2.5 last:border-b-0'
          >
            <span className='text-slate-400 text-sm'>{row.label}</span>
            <span
              className={cn(
                'font-mono text-sm',
                row.positive && 'text-emerald-500',
                row.negative && 'text-red-400',
                !(row.positive || row.negative) && 'text-slate-100',
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className='mt-2 flex items-center justify-between border-white/[0.08] border-t pt-3'>
        <span className='font-semibold text-slate-100'>{total.label}</span>
        <span
          className={cn(
            'font-mono font-semibold text-lg',
            total.isError ? 'text-red-400' : 'text-cyan-500',
          )}
        >
          {total.value}
        </span>
      </div>
    </div>
  );
}
