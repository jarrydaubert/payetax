// src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx
'use client';

import { cn } from '@/lib/utils';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';
import { isNormalMode } from '@/lib/validation/directorValidation';

interface DetailCardsProps {
  result: DirectorCalculationResult | null;
  revenue?: number;
  expenses?: number;
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
 * Detail breakdown cards showing salary, dividends, corp tax, and tax summary
 *
 * Note: UI renders facts from engine - doesn't compute tax rules
 * Rates vary by income level, so we use neutral labels
 */
export function DetailCards({ result, revenue = 0, expenses = 0, className }: DetailCardsProps) {
  const isNormal = !!(result && isNormalMode(result));

  return (
    <div className={cn('grid grid-cols-2 gap-4 max-lg:grid-cols-1', className)}>
      {/* Salary Breakdown */}
      <DetailCard
        title='Salary Breakdown'
        badge={isNormal ? 'Via payroll' : undefined}
        isEmpty={!isNormal}
        rows={[
          { label: 'Gross Salary', value: isNormal ? formatCurrency(result.salary) : '—' },
          { label: 'Income Tax', value: isNormal ? '£0' : '—', positive: isNormal },
          { label: 'Employee NI', value: isNormal ? '£0' : '—', positive: isNormal },
          {
            label: 'Employer NI (company cost)',
            value: isNormal ? `-${formatCurrency(result.employerNI)}` : '—',
            negative: isNormal,
          },
        ]}
        total={{
          label: 'Net Salary',
          value: isNormal ? formatCurrency(result.salary) : '—',
        }}
      />

      {/* Dividend Breakdown */}
      <DetailCard
        title='Dividend Breakdown'
        badge={isNormal ? 'Rate varies by band' : undefined}
        isEmpty={!isNormal}
        rows={[
          {
            label: 'Gross Dividends',
            value: isNormal ? formatCurrency(result.dividendsAvailable) : '—',
          },
          {
            label: 'Tax-Free Allowance',
            value: isNormal ? '£500' : '—',
            positive: isNormal,
          },
          {
            label: 'Dividend Tax',
            value: isNormal ? `-${formatCurrency(result.dividendTax)}` : '—',
            negative: isNormal && result.dividendTax > 0,
          },
        ]}
        total={{
          label: 'Net Dividends',
          value: isNormal ? formatCurrency(result.dividendsAvailable - result.dividendTax) : '—',
        }}
      />

      {/* Corporation Tax */}
      <DetailCard
        title='Corporation Tax'
        badge={isNormal ? 'Rate varies by profit' : undefined}
        isEmpty={!isNormal}
        rows={[
          { label: 'Revenue', value: isNormal ? formatCurrency(revenue) : '—' },
          {
            label: 'Business Expenses',
            value: isNormal ? `-${formatCurrency(expenses)}` : '—',
            negative: isNormal && expenses > 0,
          },
          {
            label: 'Salary + Employer NI',
            value: isNormal ? `-${formatCurrency(result.salary + result.employerNI)}` : '—',
            negative: isNormal,
          },
          { label: 'Taxable Profit', value: isNormal ? formatCurrency(result.taxableProfit) : '—' },
        ]}
        total={{
          label: 'Corp Tax Due',
          value: isNormal ? formatCurrency(result.corporationTax) : '—',
        }}
      />

      {/* Tax Summary */}
      <DetailCard
        title='Tax Summary'
        isEmpty={!isNormal}
        rows={[
          {
            label: 'Corporation Tax (company)',
            value: isNormal ? formatCurrency(result.corporationTax) : '—',
          },
          {
            label: 'Employer NI (company)',
            value: isNormal ? formatCurrency(result.employerNI) : '—',
          },
          {
            label: 'Dividend Tax (you)',
            value: isNormal ? formatCurrency(result.dividendTax) : '—',
          },
        ]}
        total={{
          label: 'All Taxes & NI',
          value: isNormal
            ? formatCurrency(result.corporationTax + result.employerNI + result.dividendTax)
            : '—',
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
  isEmpty?: boolean;
}

function DetailCard({ title, badge, rows, total, isEmpty }: DetailCardProps) {
  return (
    <div className='rounded-xl border border-white/5 bg-slate-800 p-5'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <span className='font-semibold text-slate-100'>{title}</span>
        {badge && (
          <span className='rounded bg-cyan-500/10 px-2 py-1 text-cyan-500 text-xs'>{badge}</span>
        )}
      </div>

      {/* Rows */}
      <div className='space-y-0'>
        {rows.map((row) => (
          <div
            key={row.label}
            className='flex items-center justify-between border-b border-white/5 py-2.5 last:border-b-0'
          >
            <span className='text-slate-400 text-sm'>{row.label}</span>
            <span
              className={cn(
                'font-mono text-sm',
                row.positive && 'text-emerald-500',
                row.negative && 'text-red-400',
                !(row.positive || row.negative) && 'text-slate-100',
                isEmpty && 'text-slate-600'
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className='mt-2 flex items-center justify-between border-t border-white/10 pt-3'>
        <span className='font-semibold text-slate-100'>{total.label}</span>
        <span
          className={cn(
            'font-mono text-lg font-semibold',
            total.isError ? 'text-red-400' : 'text-cyan-500',
            isEmpty && 'text-slate-600'
          )}
        >
          {total.value}
        </span>
      </div>
    </div>
  );
}
