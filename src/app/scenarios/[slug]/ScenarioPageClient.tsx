// src/app/scenarios/[slug]/ScenarioPageClient.tsx
/**
 * Client-side interactive components for scenario pages
 * Handles the calculator and summary card with live updates
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ScenarioSummaryCard } from '@/components/molecules/ScenarioSummaryCard';
import {
  ScenarioCalculator,
  type ScenarioCalculatorInputs,
} from '@/components/organisms/ScenarioCalculator';
import { LAYOUT, SPACING } from '@/constants/designTokens';
import { type StudentLoanPlan, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import type { Scenario } from '@/data/scenarios';
import { calculateOptimalPension, type PensionOptimization } from '@/lib/pensionOptimizer';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

const CURRENT_TAX_YEAR: TaxYear = (TAX_YEARS[0] ?? '2025-2026') as TaxYear;

interface ScenarioPageClientProps {
  scenario: Scenario;
}

export function ScenarioPageClient({ scenario }: ScenarioPageClientProps) {
  const [results, setResults] = useState<TaxCalculationResults | null>(null);
  const [inputs, setInputs] = useState<ScenarioCalculatorInputs | null>(null);
  const [optimization, setOptimization] = useState<PensionOptimization | null>(null);
  const [optimizedResults, setOptimizedResults] = useState<TaxCalculationResults | null>(null);

  // Extract primitives for dependency tracking (avoids reruns on object identity change)
  const { category } = scenario;

  // Calculate initial results on mount or when scenario values change
  useEffect(() => {
    const { salary, scottish, studentLoan, pensionPercent } = scenario.defaults;
    const initialInputs: ScenarioCalculatorInputs = {
      salary,
      pensionPercent: pensionPercent ?? 0,
      studentLoan: (studentLoan ?? 'none') as ScenarioCalculatorInputs['studentLoan'],
      isScottish: scottish ?? false,
      taxYear: CURRENT_TAX_YEAR,
    };
    setInputs(initialInputs);

    const initialResults = calculateTax({
      salary: initialInputs.salary,
      payPeriod: 'annually',
      taxYear: initialInputs.taxYear,
      taxCode: initialInputs.isScottish ? 'S1257L' : '1257L',
      isScottish: initialInputs.isScottish,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans:
        initialInputs.studentLoan === 'none'
          ? 'none'
          : ([initialInputs.studentLoan] as StudentLoanPlan[]),
      pensionContribution: initialInputs.pensionPercent,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });
    setResults(initialResults);

    // Reset optimization state for non-tax-trap scenarios (no comparison needed)
    if (category !== 'tax-trap') {
      setOptimization(null);
      setOptimizedResults(null);
    }
  }, [scenario.defaults, category]);

  // Keep pension optimization in sync with the *current calculator inputs*
  // (so toggling Scottish/student loan/etc. updates the optimized comparison).
  useEffect(() => {
    if (category !== 'tax-trap') return;
    if (!inputs) return;

    const currentPensionAmount = (inputs.salary * inputs.pensionPercent) / 100;
    const opt = calculateOptimalPension(inputs.salary, currentPensionAmount, inputs.taxYear);
    setOptimization(opt);

    if (!opt) {
      setOptimizedResults(null);
      return;
    }

    const baseInput = {
      salary: inputs.salary,
      payPeriod: 'annually' as const,
      taxYear: inputs.taxYear,
      taxCode: inputs.isScottish ? 'S1257L' : '1257L',
      isScottish: inputs.isScottish,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans:
        inputs.studentLoan === 'none'
          ? ('none' as const)
          : ([inputs.studentLoan] as StudentLoanPlan[]),
      pensionContribution: inputs.pensionPercent,
      pensionContributionType: 'percentage' as const,
      niCategory: 'A' as const,
      hoursPerWeek: 37.5,
    };

    // Only change pension fields from the user's current setup: add the *additional* suggested amount.
    const optResults = calculateTax({
      ...baseInput,
      pensionContribution: currentPensionAmount + opt.suggested,
      pensionContributionType: 'amount' as const,
    });
    setOptimizedResults(optResults);
  }, [category, inputs]);

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
          onInputsChange={setInputs}
          category={scenario.category}
        />
      </div>
    </section>
  );
}
