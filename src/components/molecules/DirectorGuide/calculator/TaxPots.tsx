'use client';

import { DIRECTOR_BUDGET_NOTE } from '@/lib/directorFinancialPresentation';
import { formatCurrency } from '@/lib/utils';
import { useActiveDirectorScenario } from './useActiveDirectorScenario';

export function TaxPots() {
  const { financials } = useActiveDirectorScenario();
  if (!financials) return null;

  const { companyTaxBudget, personalBudget } = financials;

  return (
    <div className='space-y-3'>
      <dl className='grid gap-4 md:grid-cols-2'>
        <Budget title='Company tax and NI budget' annual={companyTaxBudget} />
        <Budget title='Personal tax and loan budget' annual={personalBudget} />
      </dl>
      <p className='text-sm text-muted-foreground'>{DIRECTOR_BUDGET_NOTE}</p>
    </div>
  );
}

function Budget({ title, annual }: { title: string; annual: number }) {
  return (
    <div className='rounded-sm border border-border/60 bg-card p-4'>
      <dt className='font-semibold'>{title}</dt>
      <dd className='mt-1 text-sm'>
        <span className='font-mono'>{formatCurrency(annual)}</span> annually
        <span className='text-muted-foreground'> · {formatCurrency(annual / 12)}/mo average</span>
      </dd>
    </div>
  );
}
