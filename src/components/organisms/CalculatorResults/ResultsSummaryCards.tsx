// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { ResultCard } from '@/components/molecules/ResultCard';
import {
  ANIMATION_CONTAINER_VARIANTS,
  ANIMATION_VARIANTS,
} from '@/constants/animationTokens';
import { SPACING } from '@/constants/designTokens';
import { TAX_RATES, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface ResultsSummaryCardsProps {
  results: TaxCalculationResults;
  /** Tax year to use for rates and thresholds (defaults to latest available tax year) */
  taxYear?: TaxYear;
}

export function ResultsSummaryCards({ results, taxYear = TAX_YEARS[0] }: ResultsSummaryCardsProps) {
  const shouldReduceMotion = useMotionPreference();

  const totalTax = results.incomeTax.annually + results.nationalInsurance.annually;
  const effectiveRate =
    results.grossSalary.annually > 0 ? (totalTax / results.grossSalary.annually) * 100 : 0;

  // Get tax rates for the specified tax year
  const taxRates = TAX_RATES[taxYear];
  const personalAllowance = taxRates.personalAllowance;
  const basicRateThreshold = personalAllowance + taxRates.bands[0].threshold; // £50,270
  const paReductionThreshold = taxRates.personalAllowanceReductionThreshold; // £100,000
  const higherRateThreshold = personalAllowance + taxRates.bands[1].threshold; // £125,140

  // Calculate marginal tax rate: for every extra £1, how much do you keep?
  // This shows which tax band you're in
  const calculateMarginalRate = (): number => {
    const salary = results.grossSalary.annually;

    // Tax bands for England/Wales (2025-26) - using constants from taxRates.ts
    if (salary <= personalAllowance) return 0; // No tax
    if (salary <= basicRateThreshold) return 67.25; // 20% tax + 8% NI + 4.75% pension relief = keep 67.25%
    if (salary <= paReductionThreshold) return 57.25; // 40% tax + 2% NI = keep 57.25%
    if (salary <= higherRateThreshold) return 37.25; // 60% effective (allowance taper) + 2% NI = keep 37.25%
    return 52.75; // 45% additional rate + 2% NI = keep 52.75%
  };

  const marginalRate = calculateMarginalRate();

  return (
    <motion.section
      className={cn('grid md:grid-cols-2 lg:grid-cols-5', SPACING.GAP_4)}
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
        tooltip='The amount you receive in your bank account each month. This is your annual take-home divided by 12.'
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
        value={`${(100 - marginalRate).toFixed(1)}%`}
        icon={TrendingUp}
        variant='info'
        delay={0.2}
        className='md:col-span-2 lg:col-span-1'
        tooltip='The percentage of tax you pay on each additional £1 you earn. This depends on which tax band you are in and helps you understand the value of pay rises or bonuses.'
        />
      </motion.div>
    </motion.section>
  );
}
