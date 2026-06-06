// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { ResultCard } from '@/components/molecules/ResultCard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { cn, formatCurrency } from '@/lib/utils';

interface ResultsSummaryCardsProps {
  results: TaxCalculationResults;
  /** Tax year to use for rates and thresholds (defaults to latest available tax year) */
  taxYear?: TaxYear;
  /**
   * Original calculator input (used to compute a dynamic marginal tax rate).
   * When omitted, we fall back to a simple band-based approximation.
   */
  input?: TaxCalculationInput;
}

export function ResultsSummaryCards({
  results,
  taxYear = TAX_YEARS[0] as TaxYear,
  input,
}: ResultsSummaryCardsProps) {
  const shouldReduceMotion = useMotionPreference();

  const totalTax = results.incomeTax.annually + results.nationalInsurance.annually;
  const effectiveRate =
    results.grossSalary.annually > 0 ? (totalTax / results.grossSalary.annually) * 100 : 0;

  const marginalTaxRate = useMemo(
    () => calculateMarginalTaxRate({ results, taxYear, input }),
    [input, results, taxYear],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <motion.section
        className={cn('grid border-border border-b py-4 md:grid-cols-2 lg:grid-cols-5', 'gap-4')}
        variants={shouldReduceMotion ? undefined : ANIMATION_CONTAINER_VARIANTS.staggerFast}
        initial='hidden'
        animate='show'
        aria-live='polite'
        aria-atomic='true'
        aria-label='Tax calculation summary results'
      >
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Annual Take-Home'
            value={formatCurrency(results.netPay.annually)}
            icon={Wallet}
            variant='success'
            delay={0}
            tooltip='Your total yearly salary after income tax, National Insurance, and other deductions have been taken out.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Monthly Take-Home'
            value={formatCurrency(results.netPay.monthly)}
            icon={Calendar}
            variant='info'
            delay={0.05}
            tooltip='The amount you receive in your bank account each month after income tax, National Insurance, and other deductions.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Total Tax & NI'
            value={formatCurrency(totalTax)}
            icon={TrendingDown}
            variant='warning'
            delay={0.1}
            tooltip='The combined total of income tax and National Insurance contributions you pay annually. This money funds public services like the NHS and state pension.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Effective Tax Rate'
            value={`${effectiveRate.toFixed(1)}%`}
            icon={Percent}
            variant='default'
            delay={0.15}
            tooltip='The overall percentage of your gross salary that goes to tax and NI. This is your total tax divided by your gross salary.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Marginal Tax Rate'
            value={`${marginalTaxRate.toFixed(1)}%`}
            icon={TrendingUp}
            variant='info'
            delay={0.2}
            className='md:col-span-2 lg:col-span-1'
            tooltip="An estimate of the tax/NI (and student loan, if applicable) you'd pay on additional salary. Calculated by increasing your salary by £100/year and measuring the change."
          />
        </motion.div>
      </motion.section>
    </TooltipProvider>
  );
}
