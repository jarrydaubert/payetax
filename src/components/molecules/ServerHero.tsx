// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Matches payetax-web design: badge, headline, dual CTAs, trust strip, bento grid

import { CheckCircle, ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { HeroCTA } from '@/components/molecules/HeroCTA';
import { cn } from '@/lib/utils';

interface ServerHeroProps {
  className?: string;
}

export default function ServerHero({ className }: ServerHeroProps) {
  return (
    <section
      className={cn(
        'relative z-[1] flex min-h-screen flex-col items-center justify-center bg-deep px-4 py-32 text-center sm:px-8',
        className,
      )}
    >
      {/* Badge */}
      <div className='hero-badge'>
        <span className='pulse' />
        Official HMRC 2025-26 Rates
      </div>

      {/* Heading */}
      <h1 className='mx-auto mb-6 max-w-[900px] font-bold font-display text-[clamp(3rem,10vw,5.5rem)] text-text-primary-new leading-[1.05] tracking-[-0.04em]'>
        See exactly what
        <br />
        <span className='text-gradient-new'>you&apos;ll take home</span>
      </h1>

      {/* Tagline */}
      <p className='mx-auto mb-10 max-w-[580px] text-lg text-text-secondary-new leading-[1.8]'>
        Free UK tax calculator with official HMRC rates. Know your exact take-home in 3 seconds.
        Perfect for job offers, raise negotiations, or budget planning.
      </p>

      {/* CTA Buttons */}
      <div className='mb-16 flex flex-col gap-4 sm:flex-row'>
        <HeroCTA
          href='#tax-calculator'
          trackingLabel='hero_start_calculating'
          className='group inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-8 py-4 font-semibold text-base text-text-primary-new transition-all duration-300 [background:linear-gradient(#020617,#020617)_padding-box,linear-gradient(135deg,#06b6d4,#10b981)_border-box] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(6,182,212,0.3)]'
        >
          See My Take Home Pay
        </HeroCTA>
        <Link
          href='#features'
          className='inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-8 py-4 font-medium text-base text-text-primary-new transition-all duration-300 hover:border-cyan/30 hover:bg-white/5'
        >
          See What&apos;s Included
          <ChevronDown className='h-[18px] w-[18px]' />
        </Link>
      </div>

      {/* Trust Strip */}
      <div className='flex max-w-[900px] flex-wrap justify-center gap-6 border-border-subtle border-t py-8 sm:gap-8'>
        {[
          { icon: CheckCircle, text: 'Official HMRC rates' },
          { icon: CheckCircle, text: 'Matches your payslip' },
          { icon: Shield, text: 'Your data stays private' },
          { icon: Shield, text: 'No signup needed' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className='flex items-center gap-2 text-sm text-text-dim'>
            <Icon className='h-[18px] w-[18px] flex-shrink-0 text-emerald' />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className='bento-grid'>
        {[
          { icon: '✅', title: 'HMRC Accurate', desc: 'Matches HMRC to the penny' },
          { icon: '⚡', title: 'Instant Results', desc: 'Get your answer in 3 seconds' },
          { icon: '🔒', title: 'Private', desc: 'We never see your salary' },
          { icon: '🇬🇧', title: 'UK Coverage', desc: 'Accurate for London or Edinburgh' },
        ].map((item) => (
          <div key={item.title} className='bento-item'>
            <div className='bento-icon'>{item.icon}</div>
            <div className='bento-title'>{item.title}</div>
            <div className='bento-desc'>{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
