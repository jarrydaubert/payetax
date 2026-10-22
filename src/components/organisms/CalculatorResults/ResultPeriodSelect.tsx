'use client';

import { useId } from 'react';
import { PERIOD_LABEL_TO_PAY_PERIOD } from '@/lib/calculatorResultsPresenter';
import type { PayPeriod } from '@/lib/tax';

export function ResultPeriodSelect({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: PayPeriod;
  onChange: (period: PayPeriod) => void;
  exclude?: PayPeriod;
}) {
  const id = useId();
  return (
    <div className='flex min-w-0 flex-wrap items-center gap-2'>
      <label htmlFor={id} className='text-muted-foreground text-sm'>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const period = event.target.value;
          if (Object.values(PERIOD_LABEL_TO_PAY_PERIOD).some((candidate) => candidate === period)) {
            onChange(period as PayPeriod);
          }
        }}
        className='h-11 min-w-0 rounded-sm border border-input bg-background px-3 text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        {Object.entries(PERIOD_LABEL_TO_PAY_PERIOD)
          .filter(([, period]) => period !== exclude)
          .map(([name, period]) => (
            <option key={period} value={period}>
              {name}
            </option>
          ))}
      </select>
    </div>
  );
}
