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
import type { Scenario } from '@/data/scenarios';
import { calculateOptimalPension, type PensionOptimization } from '@/lib/pensionOptimizer';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

interface ScenarioPageClientProps {
  scenario: Scenario;
}

export function ScenarioPageClient({ scenario }: ScenarioPageClientProps) {
  const [results, setResults] = useState<TaxCalculationResults | null>(null);
  const [optimization, setOptimization] = useState<PensionOptimization | null>(null);
  const [optimizedResults, setOptimizedResults] = useState<TaxCalculationResults | null>(null);

  // Calculate initial results on mount
  useEffect(() => {
    const initialResults = calculateTax({
      salary: scenario.defaults.salary,
      payPeriod: 'annually',
      taxYear: '2025-2026',
      taxCode: scenario.defaults.scottish ? 'S1257L' : '1257L',
      isScottish: scenario.defaults.scottish ?? false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans: scenario.defaults.studentLoan ? [scenario.defaults.studentLoan] : 'none',
      pensionContribution: scenario.defaults.pensionPercent ?? 0,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });

    setResults(initialResults);

    // Calculate pension optimization if this is a tax-trap scenario
    if (scenario.category === 'tax-trap') {
      const opt = calculateOptimalPension(scenario.defaults.salary);
      setOptimization(opt);

      // Calculate optimized results if optimization is available
      if (opt) {
        const optResults = calculateTax({
          salary: scenario.defaults.salary,
          payPeriod: 'annually',
          taxYear: '2025-2026',
          taxCode: '1257L',
          isScottish: false,
          isMarried: false,
          partnerGrossWage: 0,
          isBlind: false,
          payNoNI: false,
          studentLoanPlans: 'none',
          pensionContribution: opt.suggested,
          pensionContributionType: 'amount',
          niCategory: 'A',
          hoursPerWeek: 37.5,
        });
        setOptimizedResults(optResults);
      }
    }
  }, [scenario]);

  // Handle results change from calculator
  const handleResultsChange = useCallback((newResults: TaxCalculationResults) => {
    setResults(newResults);
  }, []);

  if (!results) {
    return (
      <section className={cn(LAYOUT.CONTAINER, SPACING.PY_8)}>
        <div className='h-96 animate-pulse rounded-lg bg-muted' />
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
