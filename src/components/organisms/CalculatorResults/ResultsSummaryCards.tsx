// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { Calendar, Percent, TrendingDown, Wallet } from 'lucide-react';
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

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
    </div>
  );
}
