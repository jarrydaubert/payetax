// src/components/molecules/CalculatorHowToGuide.tsx
'use client';

import { motion } from 'framer-motion';
import { HowToStepCard } from '@/components/molecules/HowToStepCard';
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
      className='border-border/70 border-b bg-background py-16'
    >
      <div className={cn('mx-auto max-w-5xl', 'px-4')}>
        <div className={cn('text-center', 'mb-10')}>
          <h2
            className={cn(
              'font-display font-semibold text-foreground leading-tight',
              'mb-3',
              'text-4xl',
            )}
          >
            How to Use the Calculator
          </h2>
          <p className={`text-lg text-muted-foreground`}>
            Calculate your take-home pay in 4 simple steps
          </p>
        </div>

        <div className={`grid gap-6 md:grid-cols-2`}>
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
            title='View & Email Results'
            description='See your breakdown by income tax, National Insurance, and take-home pay across multiple periods. Email the results to keep a copy.'
          />
        </div>
      </div>
    </motion.section>
  );
}
