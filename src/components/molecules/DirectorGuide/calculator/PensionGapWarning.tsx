// src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx
/**
 * State Pension Status - Shows pension qualification status based on salary
 *
 * Salary zones:
 * - £0 - £4,999: No employer National Insurance, no pension credits
 * - £5,000 - £6,499: Paying employer NI but NOT earning pension credits (inefficient!)
 * - £6,500+: Earning State Pension credits (good)
 */
'use client';

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';

const TAX_YEAR = CURRENT_TAX_YEAR;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function PensionGapWarning() {
  const { comparison, activeScenario } = useActiveDirectorScenario();

  const currentSalary = useMemo(() => {
    if (!activeScenario) return 0;
    return activeScenario.salary;
  }, [activeScenario]);

  // Thresholds from tax rates
  const secondaryThreshold = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary.threshold; // £5,000
  const lowerEarningsLimit = TAX_RATES[TAX_YEAR].nationalInsurance.lowerEarningsLimit; // £6,500
  const niRate = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary.rate / 100; // 15%

  // Determine status
  const inGapZone = currentSalary >= secondaryThreshold && currentSalary < lowerEarningsLimit;
  const qualifiesForPension = currentSalary >= lowerEarningsLimit;

  // Calculate gap zone costs
  const employerNIBeingPaid = inGapZone
    ? Math.round((currentSalary - secondaryThreshold) * niRate)
    : 0;
  const extraNeededForPension = lowerEarningsLimit - currentSalary;
  const extraMonthlyCost =
    extraNeededForPension > 0 ? Math.round((extraNeededForPension * niRate) / 12) : 0;

  if (!comparison || comparison.grossProfit <= 0 || !activeScenario) return null;

  // Qualifies for pension - green success state
  if (qualifiesForPension) {
    return (
      <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4'>
        <div className='flex items-start gap-3'>
          <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-emerald-500' />
          <div className='space-y-1 text-sm'>
            <p className='font-medium text-emerald-400'>State Pension: Qualifying Year</p>
            <p className='text-slate-400'>
              Your {formatCurrency(currentSalary)} salary is above{' '}
              {formatCurrency(lowerEarningsLimit)}, so this year counts toward your State Pension
              entitlement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // In the gap zone - amber warning state
  if (inGapZone) {
    return (
      <div className='rounded-xl border border-amber-500/30 bg-amber-500/5 p-4'>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-500' />
          <div className='space-y-2 text-sm'>
            <p className='font-medium text-amber-400'>Warning: Inefficient Salary Zone</p>
            <p className='text-slate-400'>
              At {formatCurrency(currentSalary)} salary, your company pays{' '}
              {formatCurrency(employerNIBeingPaid)}/year in employer National Insurance, but you're{' '}
              <strong className='text-slate-300'>not earning any State Pension credits</strong>.
            </p>
            <p className='text-slate-400'>
              Increase to {formatCurrency(lowerEarningsLimit)} (+{formatCurrency(extraMonthlyCost)}
              /month employer cost) to make this a qualifying year for your pension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Below threshold - neutral info state
  return (
    <div className='rounded-xl border border-white/[0.04] bg-[#1e293b] p-4'>
      <div className='flex items-start gap-3'>
        <XCircle className='mt-0.5 size-5 shrink-0 text-slate-500' />
        <div className='space-y-1 text-sm'>
          <p className='font-medium text-slate-400'>State Pension: No Credits This Year</p>
          <p className='text-slate-500'>
            {currentSalary === 0 ? (
              <>
                With £0 salary, you pay no employer National Insurance but also earn no State
                Pension credits.
              </>
            ) : (
              <>
                Your {formatCurrency(currentSalary)} salary is below{' '}
                {formatCurrency(secondaryThreshold)}, so there's no employer National Insurance cost
                — but also no pension credits.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
