// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { ResultCard } from '@/components/molecules/ResultCard';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface ResultsSummaryCardsProps {
  results: TaxCalculationResults;
}

export function ResultsSummaryCards({ results }: ResultsSummaryCardsProps) {
  const totalTax = results.incomeTax.annually + results.nationalInsurance.annually;
  const effectiveRate =
    results.grossSalary.annually > 0 ? (totalTax / results.grossSalary.annually) * 100 : 0;

  // Calculate marginal tax rate: for every extra £1, how much do you keep?
  // This shows which tax band you're in
  const calculateMarginalRate = (): number => {
    const salary = results.grossSalary.annually;

    // Tax bands for England/Wales (2025-26)
    if (salary <= 12570) return 0; // No tax
    if (salary <= 50270) return 67.25; // 20% tax + 8% NI + 4.75% pension relief = keep 67.25%
    if (salary <= 100000) return 57.25; // 40% tax + 2% NI = keep 57.25%
    if (salary <= 125140) return 37.25; // 60% effective (allowance taper) + 2% NI = keep 37.25%
    return 52.75; // 45% additional rate + 2% NI = keep 52.75%
  };

  const marginalRate = calculateMarginalRate();

  return (
    <section
      className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'
      aria-live='polite'
      aria-atomic='true'
      aria-label='Tax calculation summary results'
    >
      <ResultCard
        label='Annual Take-Home'
        value={formatCurrency(results.netPay.annually)}
        icon={Wallet}
        variant='success'
        delay={0}
      />
      <ResultCard
        label='Monthly Take-Home'
        value={formatCurrency(results.netPay.monthly)}
        icon={Calendar}
        variant='info'
        delay={0.05}
      />
      <ResultCard
        label='Total Tax & NI'
        value={formatCurrency(totalTax)}
        icon={TrendingDown}
        variant='warning'
        delay={0.1}
      />
      <ResultCard
        label='Effective Tax Rate'
        value={`${effectiveRate.toFixed(1)}%`}
        icon={Percent}
        variant='default'
        delay={0.15}
      />
      <ResultCard
        label='Marginal Tax Rate'
        value={`${(100 - marginalRate).toFixed(1)}%`}
        icon={TrendingUp}
        variant='info'
        delay={0.2}
        className='md:col-span-2 lg:col-span-1'
      />
    </section>
  );
}
