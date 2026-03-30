// src/components/pages/HomePageContent.tsx
// Interactive calculator content for homepage
// The section shell lives in src/app/page.tsx so hash navigation works server-side.
'use client';

import { memo, useEffect } from 'react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { useCalculatorStore } from '@/store/calculatorStore';

const HomePageContent = memo(function HomePageContent() {
  const init = useCalculatorStore((state) => state.init);

  // Initialize store (already idempotent - safe under Strict Mode)
  useEffect(() => {
    init();
  }, [init]);

  return <CalculatorContainer />;
});

export default HomePageContent;
