// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Uses the canonical brand-surface theme tokens for headline, CTAs, and trust strip

import { CheckCircle, ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { HeroCTA } from '@/components/molecules/HeroCTA';
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
        'relative z-[1] flex min-h-[calc(100vh-4rem-var(--pwa-safe-area-top,0px))] flex-col items-center justify-start bg-surface-brand px-4 pt-10 pb-16 text-center sm:min-h-screen sm:justify-center sm:px-8 sm:py-32',
        className,
      )}
    >
      <p className='mb-4 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 font-medium text-brand text-sm'>
        Updated for {taxYearLabel}
      </p>

      {/* Heading */}
      <h1 className='mx-auto mb-6 max-w-4xl font-bold font-display text-5xl text-on-brand leading-tight tracking-tight sm:text-6xl lg:text-7xl'>
        See Your Take-Home Pay
        <br />
        <span className='text-gradient-brand'>Free UK PAYE Tax Calculator</span>
      </h1>

      {/* Tagline */}
      <p className='mx-auto mb-10 max-w-xl text-lg text-on-brand-muted leading-relaxed'>
        Free UK tax calculator with official HMRC rates. Estimate your take-home in seconds. Built
        on HMRC rates; results can vary with payslip timing and deductions.
      </p>

      {/* CTA Buttons */}
      <div className='mb-16 flex flex-col gap-4 sm:flex-row'>
        <HeroCTA
          href='#tax-calculator'
          trackingLabel='hero_start_calculating'
          className={cn(
            buttonVariants({ variant: 'brandOutline', size: 'touch' }),
            'group rounded-xl px-8 text-on-brand hover:-translate-y-0.5',
          )}
        >
          See My Take Home Pay
        </HeroCTA>
        <Button
          asChild
          variant='outline'
          size='touch'
          className='rounded-xl border-white/10 bg-transparent px-8 text-on-brand hover:border-brand/30 hover:bg-white/5 hover:text-on-brand'
        >
          <Link href='/tools'>
            Explore Tax Tools
            <ChevronDown className='size-4' />
          </Link>
        </Button>
      </div>

      {/* Trust Strip */}
      <div className='flex max-w-4xl flex-wrap justify-center gap-6 border-chrome-brand border-t py-8 sm:gap-8'>
        {[
          { icon: CheckCircle, text: 'Official HMRC rates' },
          { icon: CheckCircle, text: 'Fast in-browser results' },
          { icon: Shield, text: 'Your data stays private' },
          { icon: Shield, text: 'No signup needed' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className='flex items-center gap-2 text-on-brand-dim text-sm'>
            <Icon aria-hidden='true' className='size-4 flex-shrink-0 text-brand-accent' />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
