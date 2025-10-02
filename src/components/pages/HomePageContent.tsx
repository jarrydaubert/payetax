// src/components/pages/HomePageContent.tsx
'use client';

import { memo, useEffect, useId, useTransition } from 'react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import SimpleHero from '@/components/organisms/SimpleHero';
import TechShowcase from '@/components/organisms/TechShowcase';
import QuickAnswers from '@/components/ui/QuickAnswers';
import VoiceSearchAnswers from '@/components/ui/VoiceSearchAnswers';

const HomePageContent = memo(function HomePageContent() {
  const [_isPending, startTransition] = useTransition();
  const calculatorId = useId();

  useEffect(() => {
    // Initialize calculator store on mount
    const { init } = require('@/store/calculatorStore').useCalculatorStore.getState();
    init();
  }, []);

  const handleScrollToCalculator = () => {
    startTransition(() => {
      const calculatorElement = document.getElementById(calculatorId);
      if (calculatorElement) {
        calculatorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <main className='flex min-h-screen flex-col'>
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      <section id={calculatorId} className='py-8 lg:py-12'>
        <CalculatorContainer />
      </section>

      {/* AI-optimized quick answers for voice search and featured snippets */}
      <section className='bg-gray-900/30 py-12'>
        <div className='container mx-auto px-4'>
          <QuickAnswers limit={6} />
        </div>
      </section>

      <TechShowcase />

      {/* Voice search optimization - hidden but crawlable */}
      <VoiceSearchAnswers />
    </main>
  );
});

export default HomePageContent;
