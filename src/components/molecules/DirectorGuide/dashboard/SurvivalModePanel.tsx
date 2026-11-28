// src/components/molecules/DirectorGuide/dashboard/SurvivalModePanel.tsx
/**
 * Survival Mode Panel
 *
 * Spec: profit <= 0 -> show a distinct state with an illustrative payroll cost.
 * Avoid rendering the normal strategy comparison UI, which becomes misleading with no profit.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { CURRENT_TAX_YEAR, getEmployerNI, TAX_RATES } from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';
import { useStrategyComparison, useSubmittedDirectorForm } from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;
const rates = TAX_RATES[TAX_YEAR];

export function SurvivalModePanel({ className }: { className?: string }) {
  const formData = useSubmittedDirectorForm();
  const comparison = useStrategyComparison();

  if (!(formData && comparison) || comparison.grossProfit > 0) return null;

  const niCreditsSalary = rates.nationalInsurance.lowerEarningsLimit;
  const employerNI = getEmployerNI(niCreditsSalary, TAX_YEAR);

  const pensionForProfit = formData.isPensionAlreadyDeducted ? 0 : formData.pensionContribution;
  // The comparison's post-pension profit is floored at zero for extraction.
  const profitBeforeSalary = comparison.grossProfit - pensionForProfit;

  // Paying a salary can deepen the projected loss.
  const companyLossIfPaySalary = Math.max(0, -(profitBeforeSalary - niCreditsSalary - employerNI));

  return (
    <section
      data-testid='director-survival-mode'
      className={cn('rounded-sm border border-l-4 border-warning/35 bg-card p-6', className)}
    >
      <div className='mb-4 flex items-start gap-3'>
        <div className='mt-0.5 flex size-9 items-center justify-center rounded-sm border border-warning/35 bg-background'>
          <AlertTriangle className='size-5 text-warning' aria-hidden='true' />
        </div>
        <div>
          <h2 className='font-display text-xl font-semibold text-foreground'>Survival Mode</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            This projection shows no current-period profit available for dividends. Before paying
            dividends, check accumulated realised profits and losses in the relevant accounts.{' '}
            <a
              href='https://www.legislation.gov.uk/ukpga/2006/46/part/23'
              className='underline underline-offset-2'
            >
              Check the Companies Act rules
            </a>
          </p>
        </div>
      </div>

      <div className='rounded-sm border border-border/70 bg-background p-4'>
        <div className='mb-2 font-medium text-foreground'>Illustrative payroll cost</div>
        <div className='text-sm text-muted-foreground'>
          This example uses the annual National Insurance Lower Earnings Limit. Pay at this level
          may help build a qualifying year. Other work, voluntary contributions and NI credits may
          also count.{' '}
          <a
            href='https://www.gov.uk/check-national-insurance-record'
            className='underline underline-offset-2'
          >
            Check your National Insurance record
          </a>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          <div className='rounded-sm border border-border/70 bg-background p-3'>
            <div className='text-xs text-muted-foreground'>Company loss (estimate)</div>
            <div className='font-mono font-semibold text-warning'>
              {formatCurrency(Math.round(companyLossIfPaySalary), 0)}
            </div>
          </div>
          <div className='rounded-sm border border-border/70 bg-background p-3'>
            <div className='text-xs text-muted-foreground'>Illustrative gross salary</div>
            <div className='font-mono font-semibold text-success'>
              {formatCurrency(Math.round(niCreditsSalary), 0)}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-4 text-xs text-muted-foreground'>
        Alternative: pay{' '}
        <span className='font-semibold text-foreground'>{formatCurrency(0, 0)}</span> salary (no
        additional company loss created by payroll).
      </div>
    </section>
  );
}
