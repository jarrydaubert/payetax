// src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx
'use client';

import { cn } from '@/lib/utils';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';
import { isNormalMode } from '@/lib/validation/directorValidation';

interface MoneyFlowChartProps {
  result: DirectorCalculationResult | null;
  revenue?: number;
  expenses?: number;
  className?: string;
}

/**
 * Visual bar chart showing money flow breakdown
 */
export function MoneyFlowChart({
  result,
  revenue = 0,
  expenses = 0,
  className,
}: MoneyFlowChartProps) {
  const isNormal = result && isNormalMode(result);

  // Calculate bar heights as percentage of revenue
  const maxValue = revenue || 1;
  const salary = isNormal ? result.salary : 0;
  const companyTaxPot = isNormal ? result.companyTaxPot : 0;

  const bars = [
    { label: 'Revenue', value: revenue, height: 100 },
    { label: 'Expenses', value: expenses, height: (expenses / maxValue) * 100 },
    { label: 'Salary', value: salary, height: (salary / maxValue) * 100 },
    {
      label: 'Corp Tax',
      value: isNormal ? result.corporationTax : 0,
      height: isNormal ? (result.corporationTax / maxValue) * 100 : 0,
    },
    {
      label: 'Dividends',
      value: isNormal ? result.dividendsAvailable : 0,
      height: isNormal ? (result.dividendsAvailable / maxValue) * 100 : 0,
    },
    {
      label: 'Tax Pot',
      value: companyTaxPot,
      height: (companyTaxPot / maxValue) * 100,
    },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div
      className={cn(
        'col-span-2 rounded-xl border border-white/5 bg-slate-800 p-5 max-lg:col-span-1',
        className
      )}
    >
      {/* Header */}
      <div className='mb-4'>
        <span className='font-semibold text-slate-100'>Money Flow Breakdown</span>
      </div>

      {/* Chart */}
      <div className='flex h-44 items-end justify-around gap-2 rounded-lg bg-gradient-to-b from-slate-900 to-slate-800 p-4'>
        {bars.map((bar) => (
          <div key={bar.label} className='group flex flex-col items-center gap-2'>
            <div
              className='w-10 rounded-t bg-gradient-to-t from-cyan-500 to-emerald-500 opacity-80 transition-all group-hover:scale-y-105 group-hover:opacity-100'
              style={{
                height: `${Math.max(bar.height, 2)}%`,
                transformOrigin: 'bottom',
              }}
              title={`${bar.label}: ${formatCurrency(bar.value)}`}
            />
            <span className='text-slate-500 text-xs'>{bar.label}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='mt-4 flex flex-wrap justify-center gap-4 text-xs'>
        {bars.map((bar) => (
          <div key={bar.label} className='flex items-center gap-1.5 text-slate-400'>
            <span className='font-medium'>{bar.label}:</span>
            <span className='font-mono text-slate-300'>{formatCurrency(bar.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
