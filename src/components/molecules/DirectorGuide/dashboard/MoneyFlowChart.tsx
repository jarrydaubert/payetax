// src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx
/**
 * Money Flow Chart - Simple horizontal bar chart
 */
'use client';

import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function MoneyFlowChart() {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();
  const formData = useDirectorFormData();

  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

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
        formData.companyCarBIK
      );
      return {
        salary: scenario.salary,
        dividends: scenario.dividends,
        corporationTax: scenario.corporationTax,
        employerNI: scenario.employerNI,
      };
    }

    const strategy = comparison.strategies[selectedStrategy];
    return {
      salary: strategy.salary,
      dividends: strategy.dividends,
      corporationTax: strategy.corporationTax,
      employerNI: strategy.employerNI,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  if (!(values && comparison)) return null;

  const grossProfit = comparison.grossProfit;
  const takeHome = values.salary + values.dividends;
  const totalTax = values.corporationTax + values.employerNI;

  const bars = [
    { label: 'Gross Profit', value: grossProfit, color: 'bg-slate-500', percent: 100 },
    {
      label: 'Take-Home',
      value: takeHome,
      color: 'bg-emerald-500',
      percent: (takeHome / grossProfit) * 100,
    },
    {
      label: 'Total Tax',
      value: totalTax,
      color: 'bg-red-500',
      percent: (totalTax / grossProfit) * 100,
    },
  ];

  return (
    <div className='rounded-xl border border-white/[0.04] bg-[#1e293b] p-4'>
      <div className='mb-3 flex items-center gap-2 text-slate-400'>
        <BarChart3 className='size-4' />
        <span className='font-medium text-sm'>Money Flow</span>
      </div>

      <div className='space-y-2'>
        {bars.map((bar) => (
          <div key={bar.label} className='flex items-center gap-3 text-xs'>
            <span className='w-20 text-slate-500'>{bar.label}</span>
            <div className='relative h-4 flex-1 overflow-hidden rounded bg-slate-800'>
              <div
                className={`absolute inset-y-0 left-0 ${bar.color} transition-all duration-300`}
                style={{ width: `${bar.percent}%` }}
              />
            </div>
            <span className='w-16 text-right font-mono text-slate-300'>
              {formatCurrency(bar.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
