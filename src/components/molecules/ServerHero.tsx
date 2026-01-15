// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// The H1 renders immediately from the server, dramatically improving LCP

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface ServerHeroProps {
  className?: string;
}

export default function ServerHero({ className }: ServerHeroProps) {
  return (
    <section
      className={cn(
        'relative flex items-center justify-center overflow-hidden py-16 md:min-h-screen md:py-20',
        className
      )}
    >
      <div className={cn('relative z-10 mx-auto max-w-5xl text-center', SPACING.PX_2, 'sm:px-4')}>
        {/* Heading - Server-rendered for instant LCP */}
        <h1
          className={cn(
            'mx-auto mb-6 max-w-4xl font-bold text-foreground tracking-tight',
            TYPOGRAPHY.TEXT_4XL,
            `sm:${TYPOGRAPHY.TEXT_5XL}`,
            `md:${TYPOGRAPHY.TEXT_6XL}`
          )}
        >
          Free UK PAYE Tax
          <br />
          <span className='text-gradient'>Calculator 2025-2026</span>
        </h1>

        {/* Description */}
        <p className={cn('mx-auto mb-10 max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Calculate your take-home pay instantly. Includes income tax, National Insurance, student
          loans, and pension contributions.
        </p>

        {/* CTA Button - Uses anchor link, no JS needed for initial interaction */}
        <div className='fade-in slide-in-from-bottom-2 inline-block animate-in delay-200 duration-500'>
          <Link
            href='#tax-calculator'
            className={cn(
              'group relative inline-flex items-center justify-center',
              'rounded-full px-8 py-4 font-semibold text-white',
              'bg-primary hover:bg-primary/90',
              'shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:shadow-xl',
              'transition-all duration-300',
              TYPOGRAPHY.TEXT_BASE
            )}
          >
            <span className={cn('flex items-center', SPACING.GAP_2)}>
              Calculate My Salary
              <ArrowRight
                className={cn(ICON_SIZES.SIZE_4, 'transition-transform group-hover:translate-x-1')}
                aria-hidden='true'
              />
            </span>
          </Link>
        </div>

        {/* Features */}
        <div
          className={cn(
            'mt-16 flex flex-wrap items-center justify-center text-muted-foreground',
            SPACING.GAP_8,
            TYPOGRAPHY.TEXT_SM
          )}
        >
          {[
            'Accurate Calculations',
            '2025-2026 Tax Year',
            'Scottish Tax Support',
            'Instant Results',
          ].map((feature) => (
            <div key={feature} className={cn('flex items-center', SPACING.GAP_2)}>
              <div className='h-1.5 w-1.5 rounded-full bg-primary' />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
