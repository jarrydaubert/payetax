// src/components/pages/HomePageContent.tsx
'use client';

import { memo, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { BookOpen, Calculator, FileText } from 'lucide-react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import SimpleHero from '@/components/organisms/SimpleHero';

const HomePageContent = memo(function HomePageContent() {
  const [_isPending, startTransition] = useTransition();
  const calculatorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Initialize calculator store on mount
    const { init } = require('@/store/calculatorStore').useCalculatorStore.getState();
    init();
  }, []);

  const handleScrollToCalculator = () => {
    startTransition(() => {
      if (calculatorRef.current) {
        calculatorRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <main className='flex min-h-screen flex-col'>
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for deep linking from navbar /#tax-calculator */}
      <section id='tax-calculator' ref={calculatorRef} className='py-8 lg:py-12'>
        <CalculatorContainer />
      </section>

      {/* SEO-optimized content for Answer Engine Optimization */}
      <section className='container mx-auto px-2 pb-16 sm:px-4'>
        <CalculatorContent />
      </section>

      {/* Featured Tax Resources - Internal linking for SEO */}
      <section className='container mx-auto max-w-7xl px-4 py-16'>
        <h2 className='mb-2 text-center font-bold text-3xl'>Popular Tax Guides</h2>
        <p className='mb-8 text-center text-muted-foreground'>
          Expert guides to help you understand UK tax calculations
        </p>
        <div className='grid gap-6 md:grid-cols-3'>
          {/* Calculator Guide */}
          <Link
            href='/blog/uk-tax-calculator-2025-complete-guide'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <Calculator className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                UK Tax Calculator Guide
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Complete guide to using our tax calculator for accurate PAYE calculations with
              official HMRC rates.
            </p>
          </Link>

          {/* Tax Examples */}
          <Link
            href='/blog/how-much-tax-will-i-pay-uk-2025'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <FileText className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                How Much Tax Will I Pay?
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Real salary examples showing exact tax calculations for £20k, £30k, £50k, and £100k+
              UK earners.
            </p>
          </Link>

          {/* Tax Codes */}
          <Link
            href='/blog/understanding-uk-tax-codes'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <BookOpen className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                Understanding Tax Codes
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Learn what your tax code means and how it affects your take-home pay. Decode 1257L,
              BR, and more.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
});

export default HomePageContent;
