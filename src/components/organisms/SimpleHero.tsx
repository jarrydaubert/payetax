// src/components/organisms/SimpleHero.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleHeroProps {
  className?: string;
  onScrollToCalculator?: () => void;
}

export default function SimpleHero({ className, onScrollToCalculator }: SimpleHeroProps) {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Accessibility landmark for skip-to-content link
    <section
      id='main-content'
      className={cn('relative flex min-h-[50vh] md:min-h-screen items-center justify-center py-12 md:py-20', className)}
    >
      {/* Content */}
      <div className='relative z-10 mx-auto max-w-5xl px-4 text-center'>
        {/* Heading - No animation for LCP optimization */}
        <h1 className='mb-6 font-bold text-5xl text-foreground tracking-tight md:text-7xl'>
          Free UK PAYE Tax
          <br />
          <span className='text-gradient'>Calculator 2025-2026</span>
        </h1>

        {/* Description - Subtle animation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl'
        >
          Calculate your take-home pay instantly. Includes income tax, National Insurance, student
          loans, and pension contributions.
        </motion.p>

        {/* CTA Button */}
        <div className='inline-block rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end p-[1px] transition-transform hover:scale-[1.02]'>
          <Button
            size='lg'
            onClick={onScrollToCalculator}
            className='gap-2 rounded-lg bg-background px-8 text-foreground hover:bg-card'
          >
            Calculate My Salary
            <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
          </Button>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm'
        >
          {[
            'Accurate Calculations',
            '2025-2026 Tax Year',
            'Scottish Tax Support',
            'Instant Results',
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className='flex items-center gap-2'
            >
              <div className='h-1.5 w-1.5 rounded-full bg-primary' />
              <span>{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
