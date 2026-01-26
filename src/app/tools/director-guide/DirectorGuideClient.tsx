// src/app/tools/director-guide/DirectorGuideClient.tsx
'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/atoms/ui/button';
import {
  AlreadyTakenTooMuchWarning,
  ComplexityWarning,
  DLAWarning,
  OtherIncomeWarning,
  ResultsSection,
  VATWarning,
  WhatAreDividends,
  WhatIsPayroll,
  WhyThisSalary,
} from '@/components/molecules/DirectorGuide';
import { DirectorGuideForm } from '@/components/organisms/DirectorGuide/DirectorGuideForm';
import {
  trackGuideReset,
  trackGuideStarted,
  trackResultsShown,
  trackWarningShown,
} from '@/lib/directorGuideAnalytics';
import { isNormalMode } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useDirectorResults,
} from '@/store/directorGuideStore';

/**
 * Director Guide Client Component
 *
 * Main client-side orchestrator for the director guide tool.
 * Handles form display, results display, and warnings.
 */
export function DirectorGuideClient() {
  const { showResults, hasOtherIncome } = useDirectorGuideStore();
  const results = useDirectorResults();
  const formData = useDirectorFormData();
  const { reset } = useDirectorGuideActions();
  const hasTrackedStart = useRef(false);
  const hasTrackedResults = useRef(false);

  // Track page load (once)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackGuideStarted();
      hasTrackedStart.current = true;
    }
  }, []);

  // Track results shown (once per calculation)
  useEffect(() => {
    if (showResults && results && !hasTrackedResults.current) {
      trackResultsShown(results.grossProfit, results.mode);
      hasTrackedResults.current = true;
    }
  }, [showResults, results]);

  // Determine which warnings to show (must be before useEffect to avoid conditional hooks)
  const showOtherIncomeWarning = showResults && hasOtherIncome === true;
  const showVATWarning =
    showResults && results && isNormalMode(results) && results.netRevenue >= 85000 && results.netRevenue <= 95000;
  const showComplexityWarning = showResults && results && isNormalMode(results) && results.grossProfit > 250000;
  const showDLAWarning =
    showResults && results && isNormalMode(results) &&
    (formData.alreadyTaken ?? 0) > 0 &&
    formData.alreadyTakenViaPayroll === false;
  const showAlreadyTakenTooMuchWarning =
    showResults && results && isNormalMode(results) &&
    (formData.alreadyTaken ?? 0) > results.annualTakeHome;

  // Track warnings (once per results view) - must be called unconditionally
  useEffect(() => {
    if (showOtherIncomeWarning) trackWarningShown('OTHER_INCOME');
    if (showVATWarning) trackWarningShown('VAT_THRESHOLD');
    if (showComplexityWarning) trackWarningShown('HIGH_COMPLEXITY');
    if (showDLAWarning) trackWarningShown('DLA_RISK');
    if (showAlreadyTakenTooMuchWarning) trackWarningShown('ALREADY_TAKEN_TOO_MUCH');
  }, [showOtherIncomeWarning, showVATWarning, showComplexityWarning, showDLAWarning, showAlreadyTakenTooMuchWarning]);

  const handleReset = () => {
    trackGuideReset();
    hasTrackedResults.current = false;
    reset();
  };

  // Show form if no results yet
  if (!(showResults && results)) {
    return (
      <main className='container mx-auto max-w-2xl px-4 py-8'>
        <DirectorGuideForm />
      </main>
    );
  }

  // Build input object for results section
  const input = {
    region: formData.region ?? 'rUK',
    revenue: formData.revenue ?? 0,
    includesVat: formData.includesVat ?? false,
    expenses: formData.expenses ?? 0,
    alreadyTaken: formData.alreadyTaken ?? 0,
    alreadyTakenViaPayroll: formData.alreadyTakenViaPayroll ?? null,
    confirmedSoleIncome: formData.confirmedSoleIncome ?? false,
  };

  return (
    <main className='container mx-auto max-w-2xl px-4 py-8'>
      {/* Warnings Section */}
      <div className='mb-6 space-y-3' role='alert' aria-live='polite'>
        {showAlreadyTakenTooMuchWarning && <AlreadyTakenTooMuchWarning />}
        {showOtherIncomeWarning && <OtherIncomeWarning />}
        {showVATWarning && <VATWarning revenue={results.netRevenue} />}
        {showComplexityWarning && <ComplexityWarning />}
        {showDLAWarning && <DLAWarning />}
      </div>

      {/* Results - aria-live for screen readers */}
      <div aria-live='polite'>
        <ResultsSection result={results} input={input} />
      </div>

      {/* Education Accordions */}
      {isNormalMode(results) && (
        <div className='mt-6 space-y-2'>
          <WhatIsPayroll />
          <WhatAreDividends />
          <WhyThisSalary />
        </div>
      )}

      {/* Start Over Button */}
      <div className='mt-8 flex justify-center'>
        <Button variant='outline' onClick={handleReset} className='gap-2'>
          <RotateCcw className='size-4' />
          Start over with new numbers
        </Button>
      </div>
    </main>
  );
}
