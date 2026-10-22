// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Uses the canonical brand-surface theme tokens for headline, CTAs, and trust strip

import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import { cn } from '@/lib/utils';

interface ServerHeroProps {
  className?: string;
}

export default function ServerHero({ className }: ServerHeroProps) {
  const taxYearLabel = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '/',
    shortEndYear: true,
  });

  return (
    <section
      data-testid='homepage-hero'
      className={cn(
        'relative z-[1] mx-auto w-full max-w-[120rem] px-4 py-4 sm:px-6 lg:px-8 lg:py-8',
        className,
      )}
    >
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='font-display font-semibold text-2xl text-foreground leading-tight sm:text-4xl'>
            UK PAYE tax calculator
          </h1>
          <p className='mt-2 text-muted-foreground text-sm sm:text-base'>
            Understand your take-home pay.
            <span className='hidden sm:inline'> Explore every deduction.</span>
          </p>
        </div>
        <p className='text-muted-foreground text-sm'>HMRC rates · {taxYearLabel}</p>
      </div>
    </section>
  );
}
