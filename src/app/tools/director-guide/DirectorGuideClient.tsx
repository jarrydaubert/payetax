// src/app/tools/director-guide/DirectorGuideClient.tsx
'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/atoms/ui/button';
import {
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
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useDirectorResults,
} from '@/store/directorGuideStore';
import { isNormalMode } from '@/lib/validation/directorValidation';

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

  // Show form if no results yet
  if (!showResults || !results) {
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

  // Determine which warnings to show
  const showOtherIncomeWarning = hasOtherIncome === true;
  const showVATWarning =
    isNormalMode(results) && results.netRevenue >= 85000 && results.netRevenue <= 95000;
  const showComplexityWarning = isNormalMode(results) && results.grossProfit > 250000;
  const showDLAWarning =
    isNormalMode(results) &&
    (formData.alreadyTaken ?? 0) > 0 &&
    formData.alreadyTakenViaPayroll === false;

  return (
    <main className='container mx-auto max-w-2xl px-4 py-8'>
      {/* Warnings Section */}
      <div className='mb-6 space-y-3'>
        {showOtherIncomeWarning && <OtherIncomeWarning />}
        {showVATWarning && <VATWarning revenue={results.netRevenue} />}
        {showComplexityWarning && <ComplexityWarning />}
        {showDLAWarning && <DLAWarning />}
      </div>

      {/* Results */}
      <ResultsSection result={results} input={input} />

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
        <Button variant='outline' onClick={reset} className='gap-2'>
          <RotateCcw className='size-4' />
          Start over with new numbers
        </Button>
      </div>
    </main>
  );
}
