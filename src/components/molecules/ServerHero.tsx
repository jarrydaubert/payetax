// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Matches payetax-web design: headline, dual CTAs, trust strip, bento grid

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
      className={cn(
        'relative z-[1] flex min-h-screen flex-col items-center justify-center bg-deep px-4 py-32 text-center sm:px-8',
        className,
      )}
    >
      <p className='mb-4 rounded-full border border-cyan/20 bg-cyan/5 px-4 py-1.5 font-medium text-cyan text-sm'>
        Updated for {taxYearLabel}
      </p>

      {/* Heading */}
      <h1 className='mx-auto mb-6 max-w-[900px] font-bold font-display text-[clamp(3rem,10vw,5.5rem)] text-text-primary-new leading-[1.05] tracking-[-0.04em]'>
        Free UK PAYE Tax Calculator
        <br />
        <span className='text-gradient-new'>See your take-home pay</span>
      </h1>

      {/* Tagline */}
      <p className='mx-auto mb-10 max-w-[580px] text-lg text-text-secondary-new leading-[1.8]'>
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
            'group rounded-xl px-8 text-text-primary-new hover:-translate-y-0.5',
          )}
        >
          See My Take Home Pay
        </HeroCTA>
        <Button
          asChild
          variant='outline'
          size='touch'
          className='rounded-xl border-white/10 bg-transparent px-8 text-text-primary-new hover:border-cyan/30 hover:bg-white/5 hover:text-text-primary-new'
        >
          <Link href='/tools'>
            Explore Tax Tools
            <ChevronDown className='h-[18px] w-[18px]' />
          </Link>
        </Button>
      </div>

      {/* Trust Strip */}
      <div className='flex max-w-[900px] flex-wrap justify-center gap-6 border-border-subtle border-t py-8 sm:gap-8'>
        {[
          { icon: CheckCircle, text: 'Official HMRC rates' },
          { icon: CheckCircle, text: 'Fast in-browser results' },
          { icon: Shield, text: 'Your data stays private' },
          { icon: Shield, text: 'No signup needed' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className='flex items-center gap-2 text-sm text-text-dim'>
            <Icon aria-hidden='true' className='h-[18px] w-[18px] flex-shrink-0 text-emerald' />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className='bento-grid'>
        {[
          { icon: '✅', title: 'HMRC-Based', desc: 'Estimates built from HMRC rates' },
          { icon: '⚡', title: 'Fast Results', desc: 'Get results in seconds' },
          { icon: '🔒', title: 'Private', desc: 'We never see your salary' },
          { icon: '🇬🇧', title: 'UK Coverage', desc: 'Built for England, Wales, NI, and Scotland' },
        ].map((item) => (
          <div key={item.title} className='bento-item'>
            <div className='bento-icon' aria-hidden='true'>
              {item.icon}
            </div>
            <div className='bento-title'>{item.title}</div>
            <div className='bento-desc'>{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
