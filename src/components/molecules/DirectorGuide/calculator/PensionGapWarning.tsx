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
import { CURRENT_TAX_YEAR, getEmployerNI, getEmployerNIRate, TAX_RATES } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';

const TAX_YEAR = CURRENT_TAX_YEAR;

export function PensionGapWarning() {
  const { comparison, activeScenario } = useActiveDirectorScenario();

  const currentSalary = useMemo(() => {
    if (!activeScenario) return 0;
    return activeScenario.salary;
  }, [activeScenario]);

  // Thresholds from tax rates
  const secondaryThreshold = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary.threshold;
  const lowerEarningsLimit = TAX_RATES[TAX_YEAR].nationalInsurance.lowerEarningsLimit;
  const niRate = getEmployerNIRate(TAX_YEAR);

  // Determine status
  const inGapZone = currentSalary >= secondaryThreshold && currentSalary < lowerEarningsLimit;
  const qualifiesForPension = currentSalary >= lowerEarningsLimit;

  // Calculate gap zone costs
  const employerNIBeingPaid = inGapZone ? Math.round(getEmployerNI(currentSalary, TAX_YEAR)) : 0;
  const extraNeededForPension = lowerEarningsLimit - currentSalary;
  const extraMonthlyCost =
    extraNeededForPension > 0 ? Math.round((extraNeededForPension * niRate) / 12) : 0;

  if (!comparison || comparison.grossProfit <= 0 || !activeScenario) return null;

  // Qualifies for pension - green success state
  if (qualifiesForPension) {
    return (
      <div className='rounded-sm border border-success/30 bg-success/5 p-4'>
        <div className='flex items-start gap-3'>
          <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-success' />
          <div className='space-y-1 text-sm'>
            <p className='font-medium text-success'>State Pension: Qualifying Year</p>
            <p className='text-muted-foreground'>
              Your {formatCurrency(currentSalary, 0)} salary is above{' '}
              {formatCurrency(lowerEarningsLimit, 0)}, so this year counts toward your State Pension
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
      <div className='rounded-sm border border-warning/30 bg-warning/5 p-4'>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='mt-0.5 size-5 shrink-0 text-warning' />
          <div className='space-y-2 text-sm'>
            <p className='font-medium text-warning'>Warning: Inefficient Salary Zone</p>
            <p className='text-muted-foreground'>
              At {formatCurrency(currentSalary, 0)} salary, your company pays{' '}
              {formatCurrency(employerNIBeingPaid, 0)}/year in employer National Insurance, but
              you're{' '}
              <strong className='text-foreground'>not earning any State Pension credits</strong>.
            </p>
            <p className='text-muted-foreground'>
              Increase to {formatCurrency(lowerEarningsLimit, 0)} (+
              {formatCurrency(extraMonthlyCost, 0)}
              /month employer cost) to make this a qualifying year for your pension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Below threshold - neutral info state
  return (
    <div className='rounded-sm border border-border/50 bg-card p-4'>
      <div className='flex items-start gap-3'>
        <XCircle className='mt-0.5 size-5 shrink-0 text-muted-foreground' />
        <div className='space-y-1 text-sm'>
          <p className='font-medium text-muted-foreground'>State Pension: No Credits This Year</p>
          <p className='text-muted-foreground'>
            {currentSalary === 0 ? (
              <>
                With £0 salary, you pay no employer National Insurance but also earn no State
                Pension credits.
              </>
            ) : (
              <>
                Your {formatCurrency(currentSalary, 0)} salary is below{' '}
                {formatCurrency(secondaryThreshold, 0)}, so there's no employer National Insurance
                cost — but also no pension credits.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
