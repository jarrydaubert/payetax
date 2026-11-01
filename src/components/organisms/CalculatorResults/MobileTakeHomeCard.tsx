'use client';

import { useId, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERIOD_LABEL_TO_PAY_PERIOD } from '@/lib/calculatorResultsPresenter';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';

type PayPeriod = TaxCalculationInput['payPeriod'];

interface MobileTakeHomeCardProps {
  results: TaxCalculationResults;
  submittedPeriod: PayPeriod;
}

export function MobileTakeHomeCard({ results, submittedPeriod }: MobileTakeHomeCardProps) {
  const labelId = useId();
  const initialPeriod = submittedPeriod === 'annually' ? 'monthly' : submittedPeriod;
  const [presentation, setPresentation] = useState<{
    results: TaxCalculationResults;
    period: PayPeriod;
  }>({ results, period: initialPeriod });

  // A successful Calculate publishes a new result, even when the inputs are unchanged.
  // Keep this component mounted across breakpoints so resizing cannot reset the view.
  if (presentation.results !== results) {
    setPresentation({ results, period: initialPeriod });
  }

  const period = presentation.period;
  const periodLabel = Object.entries(PERIOD_LABEL_TO_PAY_PERIOD).find(
    ([, value]) => value === period,
  )?.[0];

  return (
    <Card className='flex flex-col gap-2 rounded-sm border-border bg-card p-4 shadow-none lg:hidden'>
      <span id={labelId} className='font-medium text-sm'>
        Take-home pay period
      </span>
      <Select
        value={period}
        onValueChange={(value: PayPeriod) => setPresentation({ results, period: value })}
      >
        <SelectTrigger aria-labelledby={labelId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(PERIOD_LABEL_TO_PAY_PERIOD).map(([label, value]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className='flex flex-col gap-2' aria-live='polite' aria-atomic='true'>
        <p className='font-medium text-foreground/80 text-sm uppercase tracking-[0.12em]'>
          {periodLabel} Take-Home
        </p>
        <p
          className='font-mono font-semibold text-2xl text-foreground tabular-nums'
          data-testid='mobile-take-home'
        >
          {formatCurrency(results.netPay[period])}
        </p>
        <p className='text-muted-foreground text-sm' data-testid='mobile-take-home-context'>
          {period === 'annually'
            ? `${formatCurrency(results.netPay.monthly)} per month`
            : `${formatCurrency(results.netPay.annually)} per year`}
        </p>
      </div>
    </Card>
  );
}
