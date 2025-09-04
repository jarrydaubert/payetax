// src/components/pages/HomePageContent.tsx
'use client';

import { memo, useEffect, useId, useState, useTransition } from 'react';
import CalculatorSection from '@/components/organisms/CalculatorSection';
import SimpleHero from '@/components/organisms/SimpleHero';
import TechShowcase from '@/components/organisms/TechShowcase';
import QuickAnswers from '@/components/ui/QuickAnswers';
import VoiceSearchAnswers from '@/components/ui/VoiceSearchAnswers';

const HomePageContent = memo(function HomePageContent() {
  const [_isLoaded, setIsLoaded] = useState(false);
  const [isCalculatorFullScreen, setIsCalculatorFullScreen] = useState(false);
  const [_isPending, startTransition] = useTransition();
  const calculatorId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollToCalculator = () => {
    startTransition(() => {
      setIsCalculatorFullScreen(true);
    });

    const calculatorElement = document.getElementById(calculatorId);
    if (calculatorElement) {
      calculatorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const _scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <main className='flex min-h-screen flex-col'>
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      <section id={calculatorId} className='py-8 lg:py-12'>
        <div className='container mx-auto px-4'>
          <CalculatorSection isFullScreen={isCalculatorFullScreen} />
        </div>
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
