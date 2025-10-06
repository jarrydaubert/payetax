// src/components/pages/HomePageContent.tsx
'use client';

import { memo, useEffect, useRef, useTransition } from 'react';
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

      <section id='calculator' ref={calculatorRef} className='py-8 lg:py-12'>
        <CalculatorContainer />
      </section>

      {/* SEO-optimized content for Answer Engine Optimization */}
      <section className='container mx-auto px-4 pb-16'>
        <CalculatorContent />
      </section>
    </main>
  );
});

export default HomePageContent;
