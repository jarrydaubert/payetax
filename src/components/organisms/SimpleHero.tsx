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
      className={cn(
        'relative flex items-center justify-center py-16 md:min-h-screen md:py-20',
        className
      )}
    >
      {/* Content */}
      <div className='relative z-10 mx-auto max-w-5xl px-2 text-center sm:px-4'>
        {/* Heading - No animation for LCP optimization */}
        <h1 className='mb-6 font-bold text-6xl text-foreground tracking-tight'>
          Free UK PAYE Tax
          <br />
          <span className='text-gradient'>Calculator 2025-2026</span>
        </h1>

        {/* Description */}
        <p className='mx-auto mb-10 max-w-2xl text-lg text-muted-foreground'>
          Calculate your take-home pay instantly. Includes income tax, National Insurance, student
          loans, and pension contributions.
        </p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className='inline-block'
        >
          <div className='rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end p-[1px]'>
            <Button
              size='lg'
              onClick={onScrollToCalculator}
              className='group gap-2 rounded-lg bg-background px-8 text-foreground hover:bg-card'
            >
              Calculate My Salary
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <div className='mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm'>
          {[
            'Accurate Calculations',
            '2025-2026 Tax Year',
            'Scottish Tax Support',
            'Instant Results',
          ].map((feature) => (
            <div key={feature} className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-primary' />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
