// src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx
/**
 * Detail Cards - 4 breakdown cards (Salary, Dividend, Corp Tax, Tax Summary)
 *
 * Rewired to use new strategy comparison store.
 * Matches the mockup design.
 */
'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useDirectorFormValue } from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;
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
  const { activeScenario, comparison, isProfitWhatIfActive, scenarioGrossProfitBeforePension } =
    useActiveDirectorScenario();
  const revenue = useDirectorFormValue((state) => state.revenue) || 0;
  const expenses = useDirectorFormValue((state) => state.expenses) || 0;

  if (!(activeScenario && comparison)) return null;
  const taxableProfit =
    (comparison.grossProfitAfterPension ?? comparison.grossProfit) -
    activeScenario.salary -
    activeScenario.employerNI;

  return (
    <div className={cn('grid grid-cols-2 gap-4 max-lg:grid-cols-1', className)}>
      {/* Salary Breakdown */}
      <DetailCard
        title='Salary Breakdown'
        badge='Via payroll'
        rows={[
          { label: 'Gross Salary', value: formatCurrency(activeScenario.salary) },
          {
            label: 'Income Tax',
            value: formatCurrency(activeScenario.incomeTax),
            positive: activeScenario.incomeTax === 0,
          },
          {
            label: 'Employee NI',
            value: formatCurrency(activeScenario.employeeNI),
            positive: activeScenario.employeeNI === 0,
          },
          {
            label:
              activeScenario.companyCarBIK > 0
                ? 'Employer NI + Class 1A (company)'
                : 'Employer NI (company cost)',
            value:
              activeScenario.employerNI > 0
                ? `-${formatCurrency(activeScenario.employerNI)}`
                : '£0',
            negative: activeScenario.employerNI > 0,
          },
        ]}
        total={{
          label: 'Net Salary',
          value: formatCurrency(
            activeScenario.salary - activeScenario.incomeTax - activeScenario.employeeNI,
          ),
        }}
      />

      {/* Dividend Breakdown */}
      <DetailCard
        title='Dividend Breakdown'
        badge='Rate varies by band'
        rows={[
          { label: 'Gross Dividends', value: formatCurrency(activeScenario.dividends) },
          {
            label: 'Dividend Allowance',
            value: `${formatCurrency(DIVIDEND_ALLOWANCE)} tax-free`,
            positive: true,
          },
          {
            label: 'Taxable Amount',
            value: formatCurrency(Math.max(0, activeScenario.dividends - DIVIDEND_ALLOWANCE)),
          },
          {
            label: 'Dividend Tax',
            value:
              activeScenario.dividendTax > 0
                ? `-${formatCurrency(activeScenario.dividendTax)}`
                : '£0',
            negative: activeScenario.dividendTax > 0,
          },
        ]}
        total={{
          label: 'Net Dividends',
          value: formatCurrency(activeScenario.dividends - activeScenario.dividendTax),
        }}
      />

      {/* Corporation Tax */}
      <DetailCard
        title='Corporation Tax'
        badge='Rate varies by profit'
        rows={[
          ...(isProfitWhatIfActive
            ? [
                {
                  label: 'Scenario Gross Profit',
                  value: formatCurrency(scenarioGrossProfitBeforePension),
                },
              ]
            : [
                { label: 'Revenue', value: formatCurrency(revenue) },
                {
                  label: 'Business Expenses',
                  value: expenses > 0 ? `-${formatCurrency(expenses)}` : '£0',
                  negative: expenses > 0,
                },
              ]),
          {
            label: 'Salary + Employer NI',
            value: `-${formatCurrency(activeScenario.salary + activeScenario.employerNI)}`,
            negative: true,
          },
          { label: 'Taxable Profit', value: formatCurrency(taxableProfit) },
        ]}
        total={{
          label: 'Corp Tax Due',
          value: formatCurrency(activeScenario.corporationTax),
        }}
      />

      {/* Tax Summary */}
      <DetailCard
        title='Tax Summary'
        rows={[
          {
            label: 'Corporation Tax (company)',
            value: formatCurrency(activeScenario.corporationTax),
          },
          {
            label:
              activeScenario.companyCarBIK > 0
                ? 'Employer NI + Class 1A (company)'
                : 'Employer NI (company)',
            value: formatCurrency(activeScenario.employerNI),
          },
          { label: 'Dividend Tax (you)', value: formatCurrency(activeScenario.dividendTax) },
          {
            label: 'Personal Tax (salary)',
            value: formatCurrency(activeScenario.incomeTax + activeScenario.employeeNI),
          },
        ]}
        total={{
          label: 'All Taxes & NI',
          value: formatCurrency(
            activeScenario.corporationTax +
              activeScenario.employerNI +
              activeScenario.dividendTax +
              activeScenario.incomeTax +
              activeScenario.employeeNI,
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
