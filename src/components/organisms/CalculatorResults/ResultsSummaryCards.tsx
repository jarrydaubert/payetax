// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { ResultCard } from '@/components/molecules/ResultCard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { SPACING } from '@/constants/designTokens';
import { TAX_RATES, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { calculateTax, type TaxCalculationInput, type TaxCalculationResults } from '@/lib/taxCalculator';
import { convertAnnualToPeriod } from '@/lib/periodCalculator';
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
  taxYear = TAX_YEARS[0],
  input,
}: ResultsSummaryCardsProps) {
  const shouldReduceMotion = useMotionPreference();

  const totalTax = results.incomeTax.annually + results.nationalInsurance.annually;
  const effectiveRate =
    results.grossSalary.annually > 0 ? (totalTax / results.grossSalary.annually) * 100 : 0;

  // Get tax rates for the specified tax year
  const effectiveTaxYear = taxYear ?? '2025-2026';
  const taxRates = TAX_RATES[effectiveTaxYear];
  const basicBand = taxRates?.bands[0];
  const higherBand = taxRates?.bands[1];
  const personalAllowance = taxRates?.personalAllowance ?? 12570;
  const basicRateThreshold = personalAllowance + (basicBand?.threshold ?? 37700); // £50,270
  const paReductionThreshold = taxRates?.personalAllowanceReductionThreshold ?? 100000; // £100,000
  const higherRateThreshold = personalAllowance + (higherBand?.threshold ?? 112570); // £125,140

  // Marginal tax rate: approximate tax/NI/SL rate on the next bit of salary.
  // Prefer dynamic calculation from the user's actual input; fall back to a band approximation.
  const marginalTaxRate = useMemo(() => {
    // Dynamic: compute tax delta for a small salary increase (annualized) to reflect user settings.
    if (input) {
      const deltaAnnual = 100; // Larger than £1 to reduce rounding noise while staying "marginal".
      const deltaInInputPeriod = convertAnnualToPeriod(
        deltaAnnual,
        input.payPeriod,
        input.hoursPerWeek,
      );

      const bumped = calculateTax({
        ...input,
        salary: input.salary + deltaInInputPeriod,
      });

      const baseTax =
        results.incomeTax.annually +
        results.nationalInsurance.annually +
        results.studentLoan.annually;
      const bumpedTax =
        bumped.incomeTax.annually + bumped.nationalInsurance.annually + bumped.studentLoan.annually;

      const deltaTax = bumpedTax - baseTax;
      const rate = (deltaTax / deltaAnnual) * 100;
      // Clamp for display sanity.
      return Math.min(100, Math.max(0, rate));
    }

    // Fallback approximation: band-based marginal tax+NI (ignores pension, student loan, etc.)
    const salary = results.grossSalary.annually;
    if (salary <= personalAllowance) return 0;
    if (salary <= basicRateThreshold) return 28; // 20% IT + 8% NI (2025-26) in basic band
    if (salary <= paReductionThreshold) return 42; // 40% IT + 2% NI
    if (salary <= higherRateThreshold) return 62; // 60% effective + 2% NI
    return 47; // 45% IT + 2% NI
  }, [
    input,
    results.incomeTax.annually,
    results.nationalInsurance.annually,
    results.studentLoan.annually,
    results.grossSalary.annually,
    personalAllowance,
    basicRateThreshold,
    paReductionThreshold,
    higherRateThreshold,
  ]);

  return (
    <TooltipProvider delayDuration={200}>
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
