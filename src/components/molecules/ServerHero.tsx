// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Uses the canonical brand-surface theme tokens for headline, CTAs, and trust strip

import { ArrowRight, CheckCircle, ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
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
        'relative z-[1] flex min-h-[calc(78svh-4rem-var(--pwa-safe-area-top,0px))] flex-col items-center justify-center bg-background px-4 py-14 text-center sm:min-h-[680px] sm:px-8 sm:py-20 lg:min-h-[720px]',
        className,
      )}
    >
      <p className='mb-4 rounded-sm border border-primary/25 bg-background px-4 py-1.5 font-medium text-primary text-sm uppercase tracking-[0.2em]'>
        Updated for {taxYearLabel}
      </p>

      {/* Heading */}
      <h1 className='mx-auto mb-5 max-w-4xl font-display font-semibold text-5xl text-foreground leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.75rem]'>
        UK PAYE tax calculator
        <br />
        <span className='text-primary'>See your take-home pay</span>
      </h1>

      {/* Tagline */}
      <p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed'>
        Estimate your take-home pay with official HMRC rates for income tax, National Insurance,
        student loans, and pensions.
      </p>

      {/* CTA Buttons */}
      <div className='mb-12 flex flex-col gap-4 sm:flex-row'>
        <Link
          href='#tax-calculator'
          className={cn(buttonVariants({ size: 'touch' }), 'group px-8')}
        >
          See My Take Home Pay
          <ArrowRight
            className='size-[18px] transition-transform group-hover:translate-x-1'
            aria-hidden='true'
          />
        </Link>
        <Button
          asChild
          variant='outline'
          size='touch'
          className='border-border bg-card px-8 text-foreground hover:border-primary/45 hover:bg-card hover:text-foreground'
        >
          <Link href='/tools'>
            Explore Tax Tools
            <ChevronDown className='size-4' />
          </Link>
        </Button>
      </div>

      {/* Trust Strip */}
      <div className='flex max-w-4xl flex-wrap justify-center gap-5 border-border border-t py-6 sm:gap-8'>
        {[
          { icon: CheckCircle, text: 'Official HMRC rates' },
          { icon: CheckCircle, text: 'Fast in-browser results' },
          { icon: Shield, text: 'Your data stays private' },
          { icon: Shield, text: 'No signup needed' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className='flex items-center gap-2 text-muted-foreground text-sm'>
            <Icon aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
