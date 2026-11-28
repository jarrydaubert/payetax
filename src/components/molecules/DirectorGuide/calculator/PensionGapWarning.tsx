'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';

export function PensionGapWarning() {
  const { activeScenario } = useActiveDirectorScenario();
  if (!activeScenario) return null;

  const lowerEarningsLimit = TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit;
  const reachesLimit = activeScenario.salary >= lowerEarningsLimit;

  return (
    <div className='space-y-1 rounded-sm border border-border/50 bg-card p-4 text-sm'>
      <p className='font-medium text-foreground'>State Pension and this salary</p>
      <p className='text-muted-foreground'>
        The projected salary of {formatCurrency(activeScenario.salary, 0)}{' '}
        {reachesLimit ? 'reaches' : 'is below'} the annual Lower Earnings Limit of{' '}
        {formatCurrency(lowerEarningsLimit, 0)}.{' '}
        {reachesLimit ? 'Pay at this level may help build a qualifying year. ' : null}
        Other work, voluntary contributions and NI credits may also count.{' '}
        <a
          href='https://www.gov.uk/check-national-insurance-record'
          className='underline underline-offset-2'
        >
          Check your National Insurance record
        </a>
      </p>
    </div>
  );
}
