// src/components/molecules/CalculatorHowToGuide.tsx
'use client';

import { motion } from 'framer-motion';
import { HowToStepCard } from '@/components/molecules/HowToStepCard';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { cn } from '@/lib/utils';

/**
 * How-to guide molecule for calculator usage
 * Shows 4-step tutorial for using the tax calculator
 * Design tokens: TEXT_4XL for heading, GAP_6 for grid spacing
 */
export function CalculatorHowToGuide() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-16'
    >
      <div className={cn('mx-auto max-w-5xl', SPACING.PX_4)}>
        <div className={cn('text-center', SPACING.MB_10)}>
          <h2
            className={cn(
              'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
              SPACING.MB_3,
              TYPOGRAPHY.TEXT_4XL,
            )}
          >
            How to Use the Calculator
          </h2>
          <p className={`${TYPOGRAPHY.TEXT_LG} text-muted-foreground`}>
            Calculate your take-home pay in 4 simple steps
          </p>
        </div>

        <div className={`grid ${SPACING.GAP_6} md:grid-cols-2`}>
          <HowToStepCard
            step={1}
            title='Enter Your Salary'
            description='Input your gross annual, monthly, or weekly salary. Our calculator automatically formats numbers with commas for easy reading.'
          />

          <HowToStepCard
            step={2}
            title='Select Tax Year & Region'
            description={`Choose the tax year (${CURRENT_TAX_YEAR_DISPLAY_SHORT} for current rates) and your region (England, Scotland, Wales, or Northern Ireland).`}
          />

          <HowToStepCard
            step={3}
            title='Add Deductions (Optional)'
            description='Include pension contributions, student loan plans, and other deductions for accurate results. Leave blank if not applicable.'
          />

          <HowToStepCard
            step={4}
            title='View & Export Results'
            description='See your breakdown by income tax, National Insurance, and take-home pay across multiple periods. Export to CSV or print for your records.'
          />
        </div>
      </div>
    </motion.section>
  );
}
