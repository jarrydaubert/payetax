// src/components/organisms/DirectorGuide/DirectorDashboard.tsx
/**
 * Director Dashboard - Main orchestrator component
 *
 * Post-merge: Single-page calculator with all inputs visible.
 * No wizard, no gates - direct calculation on input change.
 */
'use client';

import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyDates,
  PensionGapWarning,
  SalarySlider,
  StrategyComparisonTable,
  TaxBreakdownTable,
  TaxPots,
} from '@/components/molecules/DirectorGuide/calculator';
import { DashboardLayout, EducationPanel } from '@/components/molecules/DirectorGuide/dashboard';
import {
  AlreadyTakenInputs,
  CompanyCarInput,
  CoreInputs,
  EmploymentAllowanceInput,
  OtherIncomeInput,
  PensionInput,
  StudentLoanInputs,
} from '@/components/molecules/DirectorGuide/inputs';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  trackGuideReset,
  trackGuideStarted,
  trackResultsShown,
} from '@/lib/directorGuideAnalytics';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useStrategyComparison,
} from '@/store/directorGuideStore';

export function DirectorDashboard() {
  const [educationCollapsed, setEducationCollapsed] = useState(false); // Show education panel by default for trust
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();
  const { calculate, reset } = useDirectorGuideActions();

  const hasTrackedStart = useRef(false);
  const hasTrackedResults = useRef(false);

  // Track page load (once)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackGuideStarted();
      hasTrackedStart.current = true;
    }
  }, []);

  // Auto-calculate when inputs change (debounced via store)
  useEffect(() => {
    const canCalculate =
      formData.region !== undefined &&
      formData.revenue !== undefined &&
      formData.revenue >= 0 &&
      formData.expenses !== undefined &&
      formData.expenses >= 0;

    if (canCalculate) {
      calculate();
    }
  }, [
    formData.region,
    formData.revenue,
    formData.includesVat,
    formData.expenses,
    formData.alreadyTaken,
    formData.takenViaPayroll,
    formData.otherIncome,
    formData.studentLoanPlans,
    formData.pensionContribution,
    formData.companyCarBIK,
    formData.hasEmploymentAllowance,
    calculate,
  ]);

  // Track results shown (once per session)
  useEffect(() => {
    if (comparison && comparison.grossProfit > 0 && !hasTrackedResults.current) {
      trackResultsShown(comparison.grossProfit, 'normal');
      hasTrackedResults.current = true;
    }
  }, [comparison]);

  // Handle reset
  const handleReset = useCallback(() => {
    trackGuideReset();
    hasTrackedResults.current = false;
    reset();
  }, [reset]);

  const hasResults = comparison && comparison.grossProfit > 0;

  return (
    <TooltipProvider>
      <DashboardLayout
        main={
          <main className='mx-auto max-w-4xl space-y-6 p-4 pb-24 md:p-6 lg:p-8'>
            {/* Header */}
            <header className='flex items-center justify-between'>
              <div>
                <h1 className='font-bold text-2xl tracking-tight md:text-3xl'>
                  Director Tax Calculator
                </h1>
                <p className='text-muted-foreground'>
                  Find your optimal salary/dividend split for 2025/26
                </p>
              </div>
              <Button variant='outline' size='sm' onClick={handleReset}>
                <RotateCcw className='mr-2 size-4' />
                Reset
              </Button>
            </header>

            {/* Core Inputs */}
            <CoreInputs />

            {/* Director Situation */}
            <section className='space-y-4 rounded-lg border bg-card p-4 md:p-6'>
              <h2 className='font-semibold text-lg'>Your Situation</h2>
              <AlreadyTakenInputs />
              <OtherIncomeInput />
            </section>

            {/* Advanced Inputs */}
            <section className='space-y-4 rounded-lg border bg-card p-4 md:p-6'>
              <h2 className='font-semibold text-lg'>Advanced Options</h2>
              <div className='grid gap-4 md:grid-cols-2'>
                <StudentLoanInputs />
                <PensionInput />
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <CompanyCarInput />
                <EmploymentAllowanceInput />
              </div>
            </section>

            {/* Results Section */}
            {hasResults && (
              <>
                {/* Strategy Comparison */}
                <StrategyComparisonTable />

                {/* Salary Slider */}
                <SalarySlider />

                {/* NI Credits Warning */}
                <PensionGapWarning />

                {/* Tax Pots */}
                <TaxPots />

                {/* Detailed Breakdown */}
                <TaxBreakdownTable />

                {/* Key Dates */}
                <KeyDates />
              </>
            )}

            {/* Empty State */}
            {!hasResults && (
              <div className='rounded-lg border border-dashed bg-muted/30 p-8 text-center'>
                <p className='text-muted-foreground'>
                  Enter your revenue, expenses, and region above to see your optimal strategy.
                </p>
              </div>
            )}
          </main>
        }
        education={<EducationPanel />}
        educationCollapsed={educationCollapsed}
        onToggleEducation={() => setEducationCollapsed((prev) => !prev)}
      />
    </TooltipProvider>
  );
}
