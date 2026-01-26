// src/store/directorGuideStore.ts
/**
 * Director Guide - Zustand State Management Store
 *
 * Manages form state for the "How Much Can I Pay Myself?" guide.
 * Handles progressive disclosure, step navigation, and calculation triggers.
 *
 * @module store/directorGuideStore
 * @see docs/business/DIRECTOR_TOOLS_BUILD.md
 */

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { trackGuideReset } from '@/lib/directorGuideAnalytics';
import { safeStorage } from '@/lib/safeStorage';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import type {
  DirectorCalculationResult,
  DirectorInput,
  PartialDirectorInput,
  Region,
} from '@/lib/validation/directorValidation';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Form step identifiers
 */
export type DirectorGuideStep =
  | 'location'
  | 'revenue'
  | 'expenses'
  | 'alreadyTaken'
  | 'otherIncomeGate'
  | 'results';

/**
 * Step completion status
 */
export interface StepStatus {
  location: boolean;
  revenue: boolean;
  expenses: boolean;
  alreadyTaken: boolean;
  otherIncomeGate: boolean;
}

/**
 * Store state interface
 */
interface DirectorGuideState {
  // Form data (partial until complete)
  formData: PartialDirectorInput;

  // Step management
  currentStep: DirectorGuideStep;
  stepStatus: StepStatus;

  // Calculation results
  results: DirectorCalculationResult | null;
  hasOtherIncome: boolean | null;

  // UI state
  isCalculating: boolean;
  showResults: boolean;
}

/**
 * Store actions interface
 */
interface DirectorGuideActions {
  // Form data setters
  setRegion: (region: Region) => void;
  setRevenue: (revenue: number) => void;
  setIncludesVat: (includesVat: boolean) => void;
  setExpenses: (expenses: number) => void;
  setAlreadyTaken: (amount: number) => void;
  setAlreadyTakenViaPayroll: (value: boolean | null) => void;
  setHasOtherIncome: (hasOther: boolean) => void;

  // Step navigation
  completeStep: (step: DirectorGuideStep) => void;
  goToStep: (step: DirectorGuideStep) => void;
  editStep: (step: DirectorGuideStep) => void;

  // Calculation
  calculate: () => void;

  // Reset
  reset: () => void;
}

type DirectorGuideStore = DirectorGuideState & DirectorGuideActions;

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultFormData: PartialDirectorInput = {
  region: undefined,
  revenue: undefined,
  includesVat: false,
  expenses: undefined,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
  confirmedSoleIncome: false,
};

const defaultStepStatus: StepStatus = {
  location: false,
  revenue: false,
  expenses: false,
  alreadyTaken: false,
  otherIncomeGate: false,
};

const defaultState: DirectorGuideState = {
  formData: { ...defaultFormData },
  currentStep: 'location',
  stepStatus: { ...defaultStepStatus },
  results: null,
  hasOtherIncome: null,
  isCalculating: false,
  showResults: false,
};

// ============================================================================
// STEP ORDER
// ============================================================================

const STEP_ORDER: DirectorGuideStep[] = [
  'location',
  'revenue',
  'expenses',
  'alreadyTaken',
  'otherIncomeGate',
  'results',
];

/**
 * Get the next step in the flow
 */
function getNextStep(current: DirectorGuideStep): DirectorGuideStep {
  const currentIndex = STEP_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
    return 'results';
  }
  return STEP_ORDER[currentIndex + 1] as DirectorGuideStep;
}

// ============================================================================
// STORE
// ============================================================================

export const useDirectorGuideStore = create<DirectorGuideStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultState,

        // Form data setters
        setRegion: (region) => {
          set((state) => ({
            formData: { ...state.formData, region },
          }));
        },

        setRevenue: (revenue) => {
          if (!Number.isFinite(revenue) || revenue < 0) return;
          set((state) => ({
            formData: { ...state.formData, revenue },
          }));
        },

        setIncludesVat: (includesVat) => {
          set((state) => ({
            formData: { ...state.formData, includesVat },
          }));
        },

        setExpenses: (expenses) => {
          if (!Number.isFinite(expenses) || expenses < 0) return;
          set((state) => ({
            formData: { ...state.formData, expenses },
          }));
        },

        setAlreadyTaken: (amount) => {
          if (!Number.isFinite(amount) || amount < 0) return;
          set((state) => ({
            formData: { ...state.formData, alreadyTaken: amount },
          }));
        },

        setAlreadyTakenViaPayroll: (value) => {
          set((state) => ({
            formData: { ...state.formData, alreadyTakenViaPayroll: value },
          }));
        },

        setHasOtherIncome: (hasOther) => {
          set((state) => ({
            hasOtherIncome: hasOther,
            formData: { ...state.formData, confirmedSoleIncome: !hasOther },
          }));
        },

        // Step navigation
        completeStep: (step) => {
          const nextStep = getNextStep(step);
          set((state) => ({
            stepStatus: { ...state.stepStatus, [step]: true },
            currentStep: nextStep,
          }));
        },

        goToStep: (step) => {
          set({ currentStep: step });
        },

        editStep: (step) => {
          // When editing, mark all subsequent steps as incomplete
          const stepIndex = STEP_ORDER.indexOf(step);
          const newStepStatus = { ...get().stepStatus };

          for (let i = stepIndex; i < STEP_ORDER.length - 1; i++) {
            const s = STEP_ORDER[i] as keyof StepStatus;
            newStepStatus[s] = false;
          }

          set({
            currentStep: step,
            stepStatus: newStepStatus,
            showResults: false,
            results: null,
          });
        },

        // Calculation
        calculate: () => {
          const { formData } = get();

          // Validate required fields
          if (
            !formData.region ||
            formData.revenue === undefined ||
            formData.expenses === undefined
          ) {
            return;
          }

          set({ isCalculating: true });

          try {
            const input: DirectorInput = {
              region: formData.region,
              revenue: formData.revenue,
              includesVat: formData.includesVat ?? false,
              expenses: formData.expenses,
              alreadyTaken: formData.alreadyTaken ?? 0,
              alreadyTakenViaPayroll: formData.alreadyTakenViaPayroll ?? null,
              confirmedSoleIncome: formData.confirmedSoleIncome ?? false,
            };

            const results = calculateDirectorScenario(input);

            set({
              results,
              showResults: true,
              isCalculating: false,
              currentStep: 'results',
            });
          } catch (error) {
            console.error('Director calculation error:', error);
            set({ isCalculating: false });
          }
        },

        // Reset
        reset: () => {
          trackGuideReset();
          set({ ...defaultState });
        },
      }),
      {
        name: 'director-guide-storage',
        version: 1,
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          formData: state.formData,
          stepStatus: state.stepStatus,
          hasOtherIncome: state.hasOtherIncome,
          _savedAt: Date.now(),
          _taxYear: '2025-2026',
        }),
        migrate: (persistedState, version) => {
          // Migration from version 0 (no version) to version 1
          if (version === 0) {
            // Clear old data and start fresh
            return { ...defaultState };
          }
          return persistedState as DirectorGuideState;
        },
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) return;

          // Check for expiry (7 days) or tax year mismatch
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
          const CURRENT_TAX_YEAR = '2025-2026';

          const savedAt = (state as unknown as { _savedAt?: number })._savedAt;
          const savedTaxYear = (state as unknown as { _taxYear?: string })._taxYear;

          const isExpired = savedAt && Date.now() - savedAt > SEVEN_DAYS_MS;
          const wrongTaxYear = savedTaxYear && savedTaxYear !== CURRENT_TAX_YEAR;

          if (isExpired || wrongTaxYear) {
            // Clear stale data
            useDirectorGuideStore.getState().reset();
          }
        },
      }
    ),
    { name: 'DirectorGuideStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Hook for accessing form data with shallow comparison
 */
export function useDirectorFormData() {
  return useDirectorGuideStore(useShallow((state) => state.formData));
}

/**
 * Hook for accessing step status
 */
export function useDirectorStepStatus() {
  return useDirectorGuideStore(useShallow((state) => state.stepStatus));
}

/**
 * Hook for accessing results
 */
export function useDirectorResults() {
  return useDirectorGuideStore((state) => state.results);
}

/**
 * Hook for accessing all actions
 */
export function useDirectorGuideActions() {
  return useDirectorGuideStore(
    useShallow((state) => ({
      setRegion: state.setRegion,
      setRevenue: state.setRevenue,
      setIncludesVat: state.setIncludesVat,
      setExpenses: state.setExpenses,
      setAlreadyTaken: state.setAlreadyTaken,
      setAlreadyTakenViaPayroll: state.setAlreadyTakenViaPayroll,
      setHasOtherIncome: state.setHasOtherIncome,
      completeStep: state.completeStep,
      goToStep: state.goToStep,
      editStep: state.editStep,
      calculate: state.calculate,
      reset: state.reset,
    }))
  );
}

/**
 * Check if a step is accessible (previous steps completed)
 */
export function useIsStepAccessible(step: DirectorGuideStep): boolean {
  const stepStatus = useDirectorStepStatus();
  const stepIndex = STEP_ORDER.indexOf(step);

  if (stepIndex === 0) return true;

  // Check all previous steps are complete
  for (let i = 0; i < stepIndex; i++) {
    const prevStep = STEP_ORDER[i] as keyof StepStatus;
    if (!stepStatus[prevStep]) return false;
  }
  return true;
}
