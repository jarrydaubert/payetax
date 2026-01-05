// src/components/molecules/TaxRatesOverview.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { TaxRateCard } from '@/components/molecules/TaxRateCard';
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';

/**
 * Tax rates overview molecule
 * Displays current UK tax rates with cards for Income Tax, NI, and quick examples
 * Design tokens: TEXT_4XL for heading, GAP_6 for grid spacing
 * Enhanced with stagger animations (PAYTAX-75: Maximization)
 */
export function TaxRatesOverview() {
  const shouldReduceMotion = useMotionPreference();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className='bg-gradient-to-br from-primary/5 to-accent/5 py-16'
    >
      <div className={cn('mx-auto max-w-7xl', SPACING.PX_4)}>
        <div className='mb-10 text-center'>
          <h2
            className={cn(
              'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
              SPACING.MB_3,
              TYPOGRAPHY.TEXT_4XL
            )}
          >
            UK Tax Rates 2025-26
          </h2>
          <p className='text-muted-foreground'>
            Quick reference for current tax year rates and thresholds
          </p>
        </div>

        <motion.div
          className={`grid ${SPACING.GAP_6} md:grid-cols-3`}
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
                  label: '£12,571 - £50,270',
                  value: '20%',
                  colorClass: 'text-green-600 dark:text-green-400',
                },
                {
                  label: '£50,271 - £125,140',
                  value: '40%',
                  colorClass: 'text-destructive',
                },
                {
                  label: '£125,140+',
                  value: '45%',
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
                { label: '£0 - £12,570', value: '0%' },
                {
                  label: '£12,571 - £50,270',
                  value: '12%',
                  colorClass: 'text-amber-600 dark:text-amber-400',
                },
                {
                  label: '£50,270+',
                  value: '2%',
                  colorClass: 'text-amber-600 dark:text-amber-400',
                },
              ]}
              footerNote='Class 1 contributions for employees'
            />
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}>
            <TaxRateCard
              icon={Calculator}
              title='Quick Examples'
              items={[
                {
                  label: '£20,000 salary',
                  value: '£17,294',
                  colorClass: 'text-green-600 dark:text-green-400',
                },
                {
                  label: '£30,000 salary',
                  value: '£23,894',
                  colorClass: 'text-green-600 dark:text-green-400',
                },
                {
                  label: '£50,000 salary',
                  value: '£37,794',
                  colorClass: 'text-green-600 dark:text-green-400',
                },
              ]}
              footerNote='Annual take-home after tax & NI'
            />
          </motion.div>
        </motion.div>

        <div className={cn('text-center', SPACING.MT_8)}>
          <Link
            href='/blog/scottish-vs-english-tax-rates-2026-comparison'
            className={cn('inline-flex items-center text-primary hover:underline', SPACING.GAP_2)}
          >
            Scottish taxpayers: See rate differences →
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
