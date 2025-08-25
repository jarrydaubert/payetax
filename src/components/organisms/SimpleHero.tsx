// src/components/organisms/SimpleHero.tsx
'use client';

import { ArrowRight, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleHeroProps {
  className?: string;
  onScrollToCalculator?: () => void;
}

export default function SimpleHero({ className, onScrollToCalculator }: SimpleHeroProps) {
  return (
    <section className={cn('relative flex min-h-screen items-center justify-center', className)}>
      {/* Background gradient - Purple to Cyan */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900' />
      <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-900/20 to-transparent' />

      {/* Content */}
      <div className='relative z-10 mx-auto max-w-4xl px-4 text-center'>
        <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-br from-purple-500/20 to-cyan-500/20'>
          <Calculator className='h-8 w-8 text-purple-400' />
        </div>

        <h1 className='mb-6 font-bold text-4xl text-white md:text-6xl'>
          Free UK PAYE Tax Calculator 2025-2026
        </h1>

        <p className='mx-auto mb-8 max-w-2xl text-white/80 text-xl'>
          Calculate your take-home pay instantly with our comprehensive UK tax calculator. Includes
          income tax, National Insurance, student loans, and pension contributions.
        </p>

        <button
          type='button'
          onClick={onScrollToCalculator}
          className='inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-cyan-500 hover:shadow-purple-500/25 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900'
        >
          Start Calculating
          <ArrowRight className='h-4 w-4' />
        </button>
      </div>

      {/* Scroll indicator */}
      <div className='-translate-x-1/2 absolute bottom-8 left-1/2 transform'>
        <div className='animate-bounce'>
          <ArrowRight className='h-6 w-6 rotate-90 text-white/60' />
        </div>
      </div>
    </section>
  );
}
