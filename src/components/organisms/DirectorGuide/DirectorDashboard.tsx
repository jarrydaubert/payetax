// src/components/organisms/DirectorGuide/DirectorDashboard.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ComparisonModal,
  DashboardLayout,
  EducationPanel,
  generateStrategies,
  InputsPanel,
  MainContent,
  SidebarNav,
  type Strategy,
} from '@/components/molecules/DirectorGuide/dashboard';
import {
  trackGuideReset,
  trackGuideStarted,
  trackResultsShown,
} from '@/lib/directorGuideAnalytics';
import { isNormalMode } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useDirectorResults,
} from '@/store/directorGuideStore';

type ViewState = 'empty' | 'comparison' | 'populated';

/**
 * Director Dashboard - Main orchestrator component
 *
 * Handles the flow: empty → comparison modal → populated dashboard
 */
export function DirectorDashboard() {
  const [viewState, setViewState] = useState<ViewState>('empty');
  const [showComparison, setShowComparison] = useState(false);

  const { showResults, hasOtherIncome } = useDirectorGuideStore();
  const results = useDirectorResults();
  const formData = useDirectorFormData();
  const { calculate, setHasOtherIncome } = useDirectorGuideActions();

  const hasTrackedStart = useRef(false);
  const hasTrackedResults = useRef(false);

  // Track page load (once)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackGuideStarted();
      hasTrackedStart.current = true;
    }
  }, []);

  // Track results shown
  useEffect(() => {
    if (showResults && results && !hasTrackedResults.current) {
      const mode = isNormalMode(results) ? results.mode : 'survival';
      trackResultsShown(isNormalMode(results) ? results.grossProfit : 0, mode);
      hasTrackedResults.current = true;
    }
  }, [showResults, results]);

  // Sync view state with store
  useEffect(() => {
    if (showResults && results) {
      setViewState('populated');
    }
  }, [showResults, results]);

  // Check if we can calculate
  const canCalculate =
    formData.region !== undefined &&
    formData.revenue !== undefined &&
    formData.revenue > 0 &&
    formData.expenses !== undefined;

  // Handle calculate button
  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;

    // Set confirmed sole income (simplified - no other income gate for dashboard)
    setHasOtherIncome(false);

    // Calculate results
    calculate();

    // Show comparison modal
    setShowComparison(true);
  }, [canCalculate, calculate, setHasOtherIncome]);

  // Handle strategy selection from comparison modal
  const handleSelectStrategy = useCallback((_strategy: Strategy) => {
    // For MVP, we always use the optimal (salary-dividends) strategy
    // In future, we could recalculate based on selected strategy
    setShowComparison(false);
    setViewState('populated');
  }, []);

  // Handle recalculate (show comparison again)
  const handleRecalculate = useCallback(() => {
    setShowComparison(true);
  }, []);

  // Track reset when store is reset (called from InputsPanel via reset quick action)
  useEffect(() => {
    const unsubscribe = useDirectorGuideStore.subscribe((state, prevState) => {
      // Detect reset by checking if we went from having results to not having them
      if (prevState.showResults && !state.showResults && prevState.results && !state.results) {
        trackGuideReset();
        hasTrackedResults.current = false;
        setViewState('empty');
        setShowComparison(false);
      }
    });
    return unsubscribe;
  }, []);

  // Generate strategies for comparison modal
  const strategies = results
    ? generateStrategies(
        formData.revenue ?? 0,
        formData.expenses ?? 0,
        isNormalMode(results) ? results : null
      )
    : [];

  return (
    <>
      <DashboardLayout
        sidebar={<SidebarNav />}
        inputs={<InputsPanel onCalculate={handleCalculate} isCalculateDisabled={!canCalculate} />}
        main={
          <MainContent
            result={viewState === 'populated' ? results : null}
            revenue={formData.revenue}
            expenses={formData.expenses}
            onRecalculate={handleRecalculate}
          />
        }
        education={
          <EducationPanel
            result={viewState === 'populated' ? results : null}
            revenue={formData.revenue}
            hasOtherIncome={hasOtherIncome ?? undefined}
            alreadyTaken={formData.alreadyTaken}
            alreadyTakenViaPayroll={formData.alreadyTakenViaPayroll}
          />
        }
      />

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onSelect={handleSelectStrategy}
        strategies={strategies}
      />
    </>
  );
}
