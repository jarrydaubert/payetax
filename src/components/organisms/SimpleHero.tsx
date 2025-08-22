// src/components/organisms/SimpleHero.tsx
'use client';

import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleHeroProps {
  className?: string;
  onScrollToCalculator?: () => void;
}

export default function SimpleHero({ className, onScrollToCalculator }: SimpleHeroProps) {
  return (
    <section className={cn('relative min-h-screen flex items-center justify-center', className)}>
      {/* Background gradient - Purple to Cyan */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-900/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/40 mb-6">
          <Calculator className="h-8 w-8 text-purple-400" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Free UK PAYE Tax Calculator 2025-2026
        </h1>
        
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Calculate your take-home pay instantly with our comprehensive UK tax calculator. 
          Includes income tax, National Insurance, student loans, and pension contributions.
        </p>
        
        <button
          onClick={onScrollToCalculator}
          className="inline-flex items-center gap-3 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-purple-500/25"
        >
          Start Calculating
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <ArrowRight className="h-6 w-6 text-white/60 rotate-90" />
        </div>
      </div>
    </section>
  );
}