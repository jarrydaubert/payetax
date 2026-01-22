// src/components/molecules/ServerHero.tsx
// Server-rendered hero for instant LCP - no 'use client' directive
// Matches payetax-web design: badge, headline, dual CTAs, trust strip, bento grid

import { CheckCircle, ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { TrackedCTA } from '@/components/atoms/TrackedCTA';
import { cn } from '@/lib/utils';

interface ServerHeroProps {
  className?: string;
}

export default function ServerHero({ className }: ServerHeroProps) {
  return (
    <section
      className={cn(
        'relative z-[1] flex min-h-screen flex-col items-center justify-center px-4 py-32 text-center sm:px-8',
        className
      )}
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Badge */}
      <div className='hero-badge'>
        <span className='pulse' />
        HMRC 2025-26 Rates
      </div>

      {/* Heading */}
      <h1
        className='mx-auto mb-6 max-w-[900px] font-bold font-display leading-[1.05] tracking-[-0.04em]'
        style={{
          fontSize: 'clamp(3rem, 10vw, 5.5rem)',
          color: 'var(--text-primary-new)',
        }}
      >
        Calculate your
        <br />
        <span className='text-gradient-new'>take-home pay</span>
      </h1>

      {/* Tagline */}
      <p
        className='mx-auto mb-10 max-w-[580px] leading-[1.8]'
        style={{ fontSize: '1.15rem', color: 'var(--text-secondary-new)' }}
      >
        Free UK PAYE tax calculator with official HMRC rates. Get accurate results for income tax,
        National Insurance, student loans, and pension contributions.
      </p>

      {/* CTA Buttons */}
      <div className='mb-16 flex flex-col gap-4 sm:flex-row'>
        <TrackedCTA
          href='#tax-calculator'
          trackingLabel='hero_start_calculating'
          className='group inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(6,182,212,0.3)]'
          style={{
            background: 'var(--brand-gradient-new)',
            color: 'var(--bg-deep)',
            fontSize: '1rem',
          }}
        >
          Start Calculating
        </TrackedCTA>
        <Link
          href='#features'
          className='inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-4 font-medium transition-all duration-300 hover:border-[var(--brand-cyan)] hover:bg-white/5'
          style={{
            borderColor: 'var(--border-light)',
            color: 'var(--text-primary-new)',
            fontSize: '1rem',
          }}
        >
          See Features
          <ChevronDown className='h-[18px] w-[18px]' />
        </Link>
      </div>

      {/* Trust Strip */}
      <div
        className='flex max-w-[900px] flex-wrap justify-center gap-6 border-t py-8 sm:gap-8'
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {[
          { icon: CheckCircle, text: '50,000+ calculations' },
          { icon: CheckCircle, text: 'HMRC 2025-26 rates' },
          { icon: CheckCircle, text: '100% private' },
          { icon: Shield, text: 'Always free' },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className='flex items-center gap-2'
            style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}
          >
            <Icon
              className='h-[18px] w-[18px] flex-shrink-0'
              style={{ color: 'var(--brand-emerald)' }}
            />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className='bento-grid'>
        {[
          { icon: '✅', title: 'HMRC Verified', desc: 'Official 2025-26 rates' },
          { icon: '⚡', title: 'Instant Results', desc: 'Calculate in seconds' },
          { icon: '🔒', title: 'Private', desc: 'No data stored' },
          { icon: '🇬🇧', title: 'UK Coverage', desc: 'England & Scotland' },
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
