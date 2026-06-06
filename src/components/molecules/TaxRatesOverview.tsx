// src/components/molecules/TaxRatesOverview.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { TaxRateCard } from '@/components/molecules/TaxRateCard';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay, TAX_RATES } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { calculateTax } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

const EXAMPLE_SALARIES = [20000, 30000, 50000] as const;

function buildQuickExamples() {
  return EXAMPLE_SALARIES.map((salary) => {
    const results = calculateTax({
      salary,
      payPeriod: 'annually',
      taxYear: CURRENT_TAX_YEAR,
      taxCode: '1257L',
      isScottish: false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: 'none',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });

    return {
      label: `${formatCurrency(salary, 0)} salary`,
      value: formatCurrency(Math.round(results.netPay.annually), 0),
      colorClass: 'text-success',
    };
  });
}

/**
 * Tax rates overview molecule
 * Displays current UK tax rates with cards for Income Tax, NI, and quick examples
 * Design tokens: TEXT_4XL for heading, GAP_6 for grid spacing
 * Enhanced with stagger animations (PAYTAX-75: Maximization)
 */
export function TaxRatesOverview() {
  const shouldReduceMotion = useMotionPreference();
  const currentRates = TAX_RATES[CURRENT_TAX_YEAR];
  const currentTaxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '-',
    shortEndYear: true,
  });
  const personalAllowance = currentRates.personalAllowance;
  const basicRateBand = currentRates.bands[0];
  const higherRateBand = currentRates.bands[1];
  const employeeNI = currentRates.nationalInsurance.employee.A;
  const incomeTaxBasicUpper = personalAllowance + (basicRateBand?.threshold ?? 0);
  const incomeTaxHigherUpper = higherRateBand?.threshold ?? 0;
  const quickExamples = buildQuickExamples();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className='border-border/70 border-y bg-ledger-grid py-16'
    >
      <div className={cn('mx-auto max-w-7xl', 'px-4')}>
        <div className='mb-10 text-center'>
          <h2
            className={cn(
              'font-display font-semibold text-foreground leading-tight',
              'mb-3',
              'text-4xl',
            )}
          >
            UK Tax Rates {currentTaxYearDisplay}
          </h2>
          <p className='text-muted-foreground'>
            Quick reference for current tax year rates and thresholds
          </p>
        </div>

        <motion.div
          className={`grid gap-6 md:grid-cols-3`}
          variants={shouldReduceMotion ? undefined : ANIMATION_CONTAINER_VARIANTS.staggerNormal}
          initial='hidden'
          animate='show'
        >
          <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
            <TaxRateCard
              icon={Wallet}
              title='Income Tax Bands'
              items={[
                { label: 'Personal Allowance', value: '0%' },
                {
                  label: `${formatCurrency(personalAllowance + 1, 0)} - ${formatCurrency(incomeTaxBasicUpper, 0)}`,
                  value: `${basicRateBand?.rate ?? 0}%`,
                  colorClass: 'text-success',
                },
                {
                  label: `${formatCurrency(incomeTaxBasicUpper + 1, 0)} - ${formatCurrency(incomeTaxHigherUpper, 0)}`,
                  value: `${higherRateBand?.rate ?? 0}%`,
                  colorClass: 'text-destructive',
                },
                {
                  label: `${formatCurrency(incomeTaxHigherUpper, 0)}+`,
                  value: `${currentRates.bands[2]?.rate ?? 0}%`,
                  colorClass: 'text-destructive',
                },
              ]}
            />
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
            <TaxRateCard
              icon={TrendingUp}
              title='National Insurance'
              items={[
                { label: `£0 - ${formatCurrency(employeeNI.primary.threshold, 0)}`, value: '0%' },
                {
                  label: `${formatCurrency(employeeNI.primary.threshold + 1, 0)} - ${formatCurrency(employeeNI.upper.threshold, 0)}`,
                  value: `${employeeNI.primary.rate}%`,
                  colorClass: 'text-warning',
                },
                {
                  label: `${formatCurrency(employeeNI.upper.threshold, 0)}+`,
                  value: `${employeeNI.upper.rate}%`,
                  colorClass: 'text-warning',
                },
              ]}
              footerNote='Class 1 contributions for employees'
            />
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
            <TaxRateCard
              icon={Calculator}
              title='Quick Examples'
              items={quickExamples}
              footerNote='Annual take-home after tax & NI'
            />
          </motion.div>
        </motion.div>

        <div className={cn('text-center', 'mt-8')}>
          <Link
            href='/blog/scottish-vs-english-tax-rates-2026-comparison'
            className={cn('inline-flex items-center text-primary hover:underline', 'gap-2')}
          >
            Scottish taxpayers: See rate differences →
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
