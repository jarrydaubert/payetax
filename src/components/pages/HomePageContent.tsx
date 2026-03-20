// src/components/pages/HomePageContent.tsx
// Interactive calculator content for homepage
// Hero and landing sections are server-rendered in page.tsx
'use client';

import { memo, useEffect, useLayoutEffect } from 'react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { SPACING } from '@/constants/designTokens';
import { useCalculatorStore } from '@/store/calculatorStore';

const CALCULATOR_HASH = '#tax-calculator';
const CALCULATOR_ID = 'tax-calculator';

/** Scroll to calculator element, returns true if successful */
function scrollToCalculator(): boolean {
  const el = document.getElementById(CALCULATOR_ID);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

const HomePageContent = memo(function HomePageContent() {
  const init = useCalculatorStore((state) => state.init);

  // Initialize store (already idempotent - safe under Strict Mode)
  useEffect(() => {
    init();
  }, [init]);

  // Handle initial hash navigation (useLayoutEffect to avoid flicker)
  useLayoutEffect(() => {
    if (window.location.hash !== CALCULATOR_HASH) return;

    // Try immediately; if element isn't mounted yet, retry next frame
    if (scrollToCalculator()) return;

    const raf = requestAnimationFrame(() => {
      scrollToCalculator();
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  // Handle hash changes after initial load (e.g., in-page nav)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === CALCULATOR_HASH) {
        // RAF allows React layout updates to flush first
        requestAnimationFrame(() => scrollToCalculator());
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <section
      id={CALCULATOR_ID}
      className={`relative z-[1] bg-surface-brand ${SPACING.PY_SECTION_LG}`}
    >
      <CalculatorContainer />
    </section>
  );
});

export default HomePageContent;
