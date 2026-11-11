// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ResultCard } from '@/components/molecules/ResultCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import {
  PENSION_METHOD_LABELS,
  type TaxCalculationInput,
  type TaxCalculationResults,
} from '@/lib/types/calculator';
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipState = (card: string) => ({
    tooltipOpen: activeTooltip === card,
    onTooltipOpenChange: (open: boolean) => {
      setActiveTooltip((current) => (open ? card : current === card ? null : current));
    },
  });

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
          className='mb-3 text-sm leading-relaxed text-muted-foreground'
          data-testid='pension-method-result-note'
        >
          <strong>{PENSION_METHOD_LABELS[results.pensionMethod]}.</strong>{' '}
          {results.pensionMethod === 'net-pay'
            ? 'Your pension reduces the pay used for Income Tax. National Insurance and student loan repayments use pay before the contribution.'
            : 'Your pension reduces the pay used for Income Tax, employee National Insurance and student loan repayments. Employer National Insurance savings are excluded.'}{' '}
          Relief at source requires a separate calculation.
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
        className={cn('grid border-b border-border py-4 md:grid-cols-2 lg:grid-cols-5', 'gap-4')}
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
            {...tooltipState('annual')}
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
            {...tooltipState('monthly')}
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
            {...tooltipState('total')}
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
            {...tooltipState('effective')}
            value={`${effectiveRate.toFixed(1)}%`}
            icon={Percent}
            variant='default'
            delay={0.15}
            tooltip='The share of your gross pay that goes towards Income Tax and employee National Insurance.'
          />
        </motion.div>
        <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
          <ResultCard
            label='Marginal Rate Estimate'
            {...tooltipState('marginal')}
            value={`${marginalTaxRate.toFixed(1)}%`}
            icon={TrendingUp}
            variant='info'
            delay={0.2}
            className='md:col-span-2 lg:col-span-1'
            tooltip='The estimated share of an extra £100 a year that would go towards Income Tax, National Insurance and any student loan repayments.'
          />
        </motion.div>
      </motion.section>
      <p
        className='mt-3 text-sm leading-relaxed text-muted-foreground'
        data-testid='summary-result-note'
      >
        Monthly take-home is your yearly estimate divided by 12; actual payslips may vary. Total Tax
        &amp; NI and the effective rate include Income Tax and employee National Insurance only,
        excluding pension contributions and student loan repayments. The marginal rate estimates the
        share of an extra £100 a year taken in Income Tax, employee National Insurance and any
        student loan repayments, using rounded payroll figures; it excludes pension contributions.
      </p>
    </TooltipProvider>
  );
}
