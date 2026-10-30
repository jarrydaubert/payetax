// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { ResultCard } from '@/components/molecules/ResultCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { cn, formatCurrency } from '@/lib/utils';
import { MobileTakeHomeCard } from './MobileTakeHomeCard';

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
      {results.pensionContribution.annually > 0 && (
        <p
          className='mb-3 text-muted-foreground text-sm leading-relaxed'
          data-testid='pension-method-result-note'
        >
          We estimate all pension contributions as salary sacrifice, reducing pay used for Income
          Tax, employee National Insurance and student loan repayments. If your pension uses net pay
          or relief at source, take-home may be too high. Employer National Insurance savings are
          not included.
        </p>
      )}
      {Boolean(input?.incomeSources?.length) && (
        <Alert variant='warning' className='mb-3' data-testid='additional-income-result-note'>
          <AlertTriangle className='size-4' aria-hidden='true' />
          <AlertTitle>Additional income accuracy</AlertTitle>
          <AlertDescription>
            Other income can affect your tax-free allowance, tax bands and student loan repayments.
            These estimates may understate what you owe.
          </AlertDescription>
        </Alert>
      )}
      <MobileTakeHomeCard results={results} submittedPeriod={input?.payPeriod ?? 'annually'} />
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
            tooltip='Your yearly pay after Income Tax, National Insurance, pension contributions and student loan repayments.'
          />
        </motion.div>
        <motion.div
          className='hidden lg:block'
          variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}
        >
          <ResultCard
            label='Monthly Take-Home'
            value={formatCurrency(results.netPay.monthly)}
            icon={Calendar}
            variant='info'
            delay={0.05}
            tooltip='Your estimated yearly take-home pay divided by 12. Your actual monthly payslip may vary.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Total Tax & NI'
            value={formatCurrency(totalTax)}
            icon={TrendingDown}
            variant='warning'
            delay={0.1}
            tooltip='Your yearly Income Tax and employee National Insurance combined. Pension contributions and student loan repayments are separate.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Effective Tax Rate'
            value={`${effectiveRate.toFixed(1)}%`}
            icon={Percent}
            variant='default'
            delay={0.15}
            tooltip='The share of your gross pay that goes towards Income Tax and employee National Insurance.'
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
            tooltip='The estimated share of an extra £100 a year that would go towards Income Tax, National Insurance and any student loan repayments.'
          />
        </motion.div>
      </motion.section>
    </TooltipProvider>
  );
}
