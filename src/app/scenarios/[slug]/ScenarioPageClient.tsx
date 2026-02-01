// src/app/scenarios/[slug]/ScenarioPageClient.tsx
/**
 * Client-side interactive components for scenario pages
 * Handles the calculator and summary card with live updates
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ScenarioSummaryCard } from '@/components/molecules/ScenarioSummaryCard';
import { ScenarioCalculator } from '@/components/organisms/ScenarioCalculator';
import { LAYOUT, SPACING } from '@/constants/designTokens';
import type { TaxYear } from '@/constants/taxRates';
import type { Scenario } from '@/data/scenarios';
import { calculateOptimalPension, type PensionOptimization } from '@/lib/pensionOptimizer';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

// Tax year constant - update when TAX_YEARS changes in taxRates.ts
const DEFAULT_TAX_YEAR: TaxYear = '2025-2026';

interface ScenarioPageClientProps {
  scenario: Scenario;
}

export function ScenarioPageClient({ scenario }: ScenarioPageClientProps) {
  const [results, setResults] = useState<TaxCalculationResults | null>(null);
  const [optimization, setOptimization] = useState<PensionOptimization | null>(null);
  const [optimizedResults, setOptimizedResults] = useState<TaxCalculationResults | null>(null);

  // Extract primitives for dependency tracking (avoids reruns on object identity change)
  const { salary, scottish, studentLoan, pensionPercent } = scenario.defaults;
  const { category } = scenario;

  // Calculate initial results on mount or when scenario values change
  useEffect(() => {
    // Build base input config
    const baseInput = {
      salary,
      payPeriod: 'annually' as const,
      taxYear: DEFAULT_TAX_YEAR,
      taxCode: scottish ? 'S1257L' : '1257L',
      isScottish: scottish ?? false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans: studentLoan ? [studentLoan] : ('none' as const),
      pensionContribution: pensionPercent ?? 0,
      pensionContributionType: 'percentage' as const,
      niCategory: 'A' as const,
      hoursPerWeek: 37.5,
    };

    const initialResults = calculateTax(baseInput);
    setResults(initialResults);

    // Reset optimization state for non-tax-trap scenarios
    if (category !== 'tax-trap') {
      setOptimization(null);
      setOptimizedResults(null);
      return;
    }

    // Calculate pension optimization for tax-trap scenarios
    const opt = calculateOptimalPension(salary);
    setOptimization(opt);

    // Calculate optimized results if optimization is available
    if (opt) {
      const optResults = calculateTax({
        ...baseInput,
        pensionContribution: opt.suggested,
        pensionContributionType: 'amount',
      });
      setOptimizedResults(optResults);
    } else {
      setOptimizedResults(null);
    }
  }, [salary, scottish, studentLoan, pensionPercent, category]);

  // Handle results change from calculator
  const handleResultsChange = useCallback((newResults: TaxCalculationResults) => {
    setResults(newResults);
  }, []);

  if (!results) {
    return (
      <section
        className={cn(LAYOUT.CONTAINER, SPACING.PY_8)}
        aria-busy='true'
        role='status'
        aria-live='polite'
      >
        <span className='sr-only'>Loading calculator...</span>
        <div
          aria-hidden='true'
          className='h-96 animate-pulse rounded-lg bg-muted motion-reduce:animate-none'
        />
      </section>
    );
  }

  return (
    <section className={cn(LAYOUT.CONTAINER, SPACING.PY_8)}>
      <div className={cn('grid gap-6 lg:grid-cols-2')}>
        {/* Summary Card */}
        <ScenarioSummaryCard
          salary={scenario.defaults.salary}
          results={results}
          optimization={optimization}
          optimizedResults={optimizedResults}
          heroStatLabel={scenario.heroStatLabel}
          category={scenario.category}
        />

        {/* Interactive Calculator */}
        <ScenarioCalculator
          defaults={scenario.defaults}
          onResultsChange={handleResultsChange}
          category={scenario.category}
        />
      </div>
    </section>
  );
}
