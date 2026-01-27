// src/components/organisms/DirectorGuide/DirectorDashboard.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DashboardLayout,
  EducationPanel,
  InputsPanel,
  MainContent,
  OtherIncomeGate,
  SidebarNav,
} from '@/components/molecules/DirectorGuide/dashboard';
import { trackGuideStarted, trackResultsShown } from '@/lib/directorGuideAnalytics';
import { isNormalMode } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useDirectorResults,
} from '@/store/directorGuideStore';

type ViewState = 'empty' | 'populated';

/**
 * Director Dashboard - Main orchestrator component
 *
 * Handles the flow: empty → other income gate → populated dashboard
 */
export function DirectorDashboard() {
  const [viewState, setViewState] = useState<ViewState>('empty');
  const [showOtherIncomeGate, setShowOtherIncomeGate] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputsCollapsed, setInputsCollapsed] = useState(false);
  const [educationCollapsed, setEducationCollapsed] = useState(false);

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
  // Allow revenue >= 0 for survival mode, require expenses >= 0
  const canCalculate =
    formData.region !== undefined &&
    formData.revenue !== undefined &&
    formData.revenue >= 0 &&
    formData.expenses !== undefined &&
    formData.expenses >= 0;

  // Handle calculate button - show other income gate first
  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;
    setShowOtherIncomeGate(true);
  }, [canCalculate]);

  // Handle confirming sole income from gate - go directly to results
  const handleConfirmSoleIncome = useCallback(() => {
    setHasOtherIncome(false);
    setShowOtherIncomeGate(false);
    try {
      calculate();
      setViewState('populated');
    } catch (error) {
      console.error('Calculation failed:', error);
      // Stay on current view, user can try again
    }
  }, [calculate, setHasOtherIncome]);

  // Handle indicating other income from gate - go directly to results
  const handleHasOtherIncome = useCallback(() => {
    setHasOtherIncome(true);
    setShowOtherIncomeGate(false);
    try {
      calculate();
      setViewState('populated');
    } catch (error) {
      console.error('Calculation failed:', error);
      // Stay on current view, user can try again
    }
  }, [calculate, setHasOtherIncome]);

  // Handle recalculate - show gate again to confirm income status
  const handleRecalculate = useCallback(() => {
    setShowOtherIncomeGate(true);
  }, []);

  // Sync local state when store is reset
  useEffect(() => {
    const unsubscribe = useDirectorGuideStore.subscribe((state, prevState) => {
      // Detect reset by checking if we went from having results to not having them
      if (prevState.showResults && !state.showResults && prevState.results && !state.results) {
        // Analytics tracking moved to store.reset() action
        hasTrackedResults.current = false;
        setViewState('empty');
        setShowOtherIncomeGate(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <DashboardLayout
        sidebar={
          <SidebarNav
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
          />
        }
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
            region={formData.region}
            hasOtherIncome={hasOtherIncome ?? undefined}
            alreadyTaken={formData.alreadyTaken}
            alreadyTakenViaPayroll={formData.alreadyTakenViaPayroll}
          />
        }
        inputsCollapsed={inputsCollapsed}
        educationCollapsed={educationCollapsed}
        onToggleInputs={() => setInputsCollapsed((prev) => !prev)}
        onToggleEducation={() => setEducationCollapsed((prev) => !prev)}
      />

      {/* Other Income Gate - shown before results */}
      <OtherIncomeGate
        isOpen={showOtherIncomeGate}
        onConfirmSoleIncome={handleConfirmSoleIncome}
        onHasOtherIncome={handleHasOtherIncome}
      />
    </>
  );
}
