// src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx
'use client';

import { cn } from '@/lib/utils';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';
import { isNormalMode } from '@/lib/validation/directorValidation';

interface SummaryCardsProps {
  result: DirectorCalculationResult | null;
  className?: string;
}

/**
 * Formats a number as GBP currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Top row of summary cards showing key metrics
 */
export function SummaryCards({ result, className }: SummaryCardsProps) {
  const isNormal = result && isNormalMode(result);

  // Calculate retained profit (company tax pot is what's left in company)
  const retainedProfit = isNormal ? result.companyTaxPot : 0;

  const cards = [
    {
      label: 'Monthly Take-Home',
      value: isNormal ? formatCurrency(result.averageMonthlyPay) : '—',
      subtext: 'Optimised for tax efficiency',
      highlight: true,
    },
    {
      label: 'Annual Salary',
      value: isNormal ? formatCurrency(result.salary) : '—',
      subtext: 'At NI threshold',
    },
    {
      label: 'Annual Dividends',
      value: isNormal ? formatCurrency(result.dividendsAvailable) : '—',
      subtext: 'After corp tax',
    },
    {
      label: 'Company Pot',
      value: isNormal ? formatCurrency(retainedProfit) : '—',
      subtext: 'Corp tax to set aside',
    },
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1', className)}>
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} isEmpty={!result} />
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
          'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5'
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
          isEmpty && 'text-slate-600'
        )}
      >
        {value}
      </div>
      <div className={cn('text-slate-500 text-xs', isEmpty && 'text-slate-700')}>{subtext}</div>
    </div>
  );
}
