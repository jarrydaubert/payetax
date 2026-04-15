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
import { cn, formatCurrency } from '@/lib/utils';
import { useDirectorFormValue } from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;
const DIVIDEND_ALLOWANCE = TAX_RATES[TAX_YEAR].dividendAllowance;

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
          { label: 'Gross Salary', value: formatCurrency(activeScenario.salary, 0) },
          {
            label: 'Income Tax',
            value: formatCurrency(activeScenario.incomeTax, 0),
            positive: activeScenario.incomeTax === 0,
          },
          {
            label: 'Employee NI',
            value: formatCurrency(activeScenario.employeeNI, 0),
            positive: activeScenario.employeeNI === 0,
          },
          {
            label:
              activeScenario.companyCarBIK > 0
                ? 'Employer NI + Class 1A (company)'
                : 'Employer NI (company cost)',
            value:
              activeScenario.employerNI > 0
                ? `-${formatCurrency(activeScenario.employerNI, 0)}`
                : '£0',
            negative: activeScenario.employerNI > 0,
          },
        ]}
        total={{
          label: 'Net Salary',
          value: formatCurrency(
            activeScenario.salary - activeScenario.incomeTax - activeScenario.employeeNI,
            0,
          ),
        }}
      />

      {/* Dividend Breakdown */}
      <DetailCard
        title='Dividend Breakdown'
        badge='Rate varies by band'
        rows={[
          { label: 'Gross Dividends', value: formatCurrency(activeScenario.dividends, 0) },
          {
            label: 'Dividend Allowance',
            value: `${formatCurrency(DIVIDEND_ALLOWANCE, 0)} tax-free`,
            positive: true,
          },
          {
            label: 'Taxable Amount',
            value: formatCurrency(Math.max(0, activeScenario.dividends - DIVIDEND_ALLOWANCE), 0),
          },
          {
            label: 'Dividend Tax',
            value:
              activeScenario.dividendTax > 0
                ? `-${formatCurrency(activeScenario.dividendTax, 0)}`
                : '£0',
            negative: activeScenario.dividendTax > 0,
          },
        ]}
        total={{
          label: 'Net Dividends',
          value: formatCurrency(activeScenario.dividends - activeScenario.dividendTax, 0),
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
                  value: formatCurrency(scenarioGrossProfitBeforePension, 0),
                },
              ]
            : [
                { label: 'Revenue', value: formatCurrency(revenue, 0) },
                {
                  label: 'Business Expenses',
                  value: expenses > 0 ? `-${formatCurrency(expenses, 0)}` : '£0',
                  negative: expenses > 0,
                },
              ]),
          {
            label: 'Salary + Employer NI',
            value: `-${formatCurrency(activeScenario.salary + activeScenario.employerNI, 0)}`,
            negative: true,
          },
          { label: 'Taxable Profit', value: formatCurrency(taxableProfit, 0) },
        ]}
        total={{
          label: 'Corp Tax Due',
          value: formatCurrency(activeScenario.corporationTax, 0),
        }}
      />

      {/* Tax Summary */}
      <DetailCard
        title='Tax Summary'
        rows={[
          {
            label: 'Corporation Tax (company)',
            value: formatCurrency(activeScenario.corporationTax, 0),
          },
          {
            label:
              activeScenario.companyCarBIK > 0
                ? 'Employer NI + Class 1A (company)'
                : 'Employer NI (company)',
            value: formatCurrency(activeScenario.employerNI, 0),
          },
          { label: 'Dividend Tax (you)', value: formatCurrency(activeScenario.dividendTax, 0) },
          {
            label: 'Personal Tax (salary)',
            value: formatCurrency(activeScenario.incomeTax + activeScenario.employeeNI, 0),
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
            0,
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
    <div className='rounded-xl border border-border/60 bg-card/80 p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <span className='font-semibold text-foreground'>{title}</span>
        {badge && (
          <span className='rounded border border-primary/30 bg-primary/10 px-2 py-1 text-primary text-xs'>
            {badge}
          </span>
        )}
      </div>

      <div>
        {rows.map((row) => (
          <div
            key={row.label}
            className='flex items-center justify-between border-border/50 border-b py-2.5 last:border-b-0'
          >
            <span className='text-muted-foreground text-sm'>{row.label}</span>
            <span
              className={cn(
                'font-mono text-sm',
                row.positive && 'text-success',
                row.negative && 'text-destructive',
                !(row.positive || row.negative) && 'text-foreground',
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className='mt-2 flex items-center justify-between border-border/70 border-t pt-3'>
        <span className='font-semibold text-foreground'>{total.label}</span>
        <span
          className={cn(
            'font-mono font-semibold text-lg',
            total.isError ? 'text-destructive' : 'text-primary',
          )}
        >
          {total.value}
        </span>
      </div>
    </div>
  );
}
