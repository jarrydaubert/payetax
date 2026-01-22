// src/components/pages/HomePageContent.tsx
// Interactive calculator content for homepage
// Hero and landing sections are server-rendered in page.tsx
'use client';

import { memo, useEffect } from 'react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { useCalculatorStore } from '@/store/calculatorStore';

const HomePageContent = memo(function HomePageContent() {
  const init = useCalculatorStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for deep linking from navbar /#tax-calculator
    <section
      id='tax-calculator'
      className='relative z-[1] py-12 md:py-16 lg:py-20'
      style={{ background: 'var(--bg-deep)' }}
    >
      <CalculatorContainer />
    </section>
  );
});

export default HomePageContent;
