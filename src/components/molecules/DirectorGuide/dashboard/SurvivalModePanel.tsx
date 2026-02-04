// src/components/molecules/DirectorGuide/dashboard/SurvivalModePanel.tsx
/**
 * Survival Mode Panel
 *
 * Spec: profit <= 0 -> show a distinct state with an NI-credits threshold example.
 * Avoid rendering the normal strategy comparison UI, which becomes misleading with no profit.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useDirectorFormData, useStrategyComparison } from '@/store/directorGuideStore';

const TAX_YEAR: TaxYear = '2025-2026';
const rates = TAX_RATES[TAX_YEAR];

const formatGBP = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export function SurvivalModePanel({ className }: { className?: string }) {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  if (!comparison || comparison.grossProfit > 0) return null;

  const niCreditsSalary = rates.nationalInsurance.lowerEarningsLimit; // ~£6,500 in 2025-26
  const employerThreshold = rates.nationalInsurance.employer.A.secondary.threshold;
  const employerRate = rates.nationalInsurance.employer.A.secondary.rate / 100;
  const employerNI = Math.max(0, (niCreditsSalary - employerThreshold) * employerRate);

  const pensionForProfit = formData.isPensionAlreadyDeducted ? 0 : formData.pensionContribution;
  const profitBeforeSalary =
    (formData.revenue ?? 0) - (formData.expenses ?? 0) - (pensionForProfit ?? 0);

  // Profit <= 0 means no distributable profit; paying salary can deepen the loss.
  const companyLossIfPaySalary = Math.max(0, -(profitBeforeSalary - niCreditsSalary - employerNI));

  const noteIfOtherPAYE = formData.hasOtherPAYEEmployment
    ? 'If you have another PAYE job, NI may apply differently than shown here.'
    : null;

  return (
    <section
      data-testid='director-survival-mode'
      className={cn(
        'rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-6',
        className,
      )}
    >
      <div className='mb-4 flex items-start gap-3'>
        <div className='mt-0.5 flex size-9 items-center justify-center rounded-xl bg-amber-500/15'>
          <AlertTriangle className='size-5 text-amber-400' aria-hidden='true' />
        </div>
        <div>
          <h2 className='font-semibold text-slate-100 text-xl'>Survival Mode</h2>
          <p className='mt-1 text-slate-400 text-sm'>
            Your company has no distributable profit this year. Dividends aren&apos;t possible.
          </p>
        </div>
      </div>

      <div className='rounded-xl border border-white/[0.06] bg-[#0b1220]/40 p-4'>
        <div className='mb-2 font-medium text-slate-100'>NI credits threshold (illustrative)</div>
        <div className='text-slate-400 text-sm'>
          NI credits typically require earnings around{' '}
          <span className='font-semibold text-slate-200'>{formatGBP(niCreditsSalary)}</span>. This
          example shows the trade-off if you pay a salary to keep a qualifying year (even if it
          creates a company loss).
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <div className='rounded-lg border border-white/[0.06] bg-slate-950/40 p-3'>
            <div className='text-slate-500 text-xs'>Company loss (estimate)</div>
            <div className='font-mono font-semibold text-amber-300'>
              {formatGBP(companyLossIfPaySalary)}
            </div>
          </div>
          <div className='rounded-lg border border-white/[0.06] bg-slate-950/40 p-3'>
            <div className='text-slate-500 text-xs'>Take-home (approx)</div>
            <div className='font-mono font-semibold text-emerald-300'>
              {formatGBP(niCreditsSalary)}
            </div>
          </div>
          <div className='rounded-lg border border-white/[0.06] bg-slate-950/40 p-3'>
            <div className='text-slate-500 text-xs'>NI credits</div>
            <div className='font-mono font-semibold text-slate-200'>Yes (qualifying year)</div>
          </div>
        </div>

        {noteIfOtherPAYE && <p className='mt-3 text-slate-500 text-xs'>{noteIfOtherPAYE}</p>}
      </div>

      <div className='mt-4 text-slate-500 text-xs'>
        Alternative: pay <span className='font-semibold text-slate-300'>{formatGBP(0)}</span> salary
        (no additional company loss created by payroll), but you may miss an NI qualifying year.
      </div>
    </section>
  );
}
