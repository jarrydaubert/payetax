// src/store/directorGuideStore.ts
/**
 * Director Guide - Zustand State Management Store
 *
 * Manages form state for the Director Calculator with Education Panel.
 * Full pro calculator: student loans, pension, BIK, EA, strategy comparison.
 *
 * @module store/directorGuideStore
 * @see docs/business/DIRECTOR_TOOLS_MERGE_PLAN.md
 */

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { StudentLoanPlan, TaxYear } from '@/constants/taxRates';
import { trackGuideReset } from '@/lib/directorGuideAnalytics';
import { safeStorage } from '@/lib/safeStorage';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import { calculateStrategyComparison, type StrategyComparison } from '@/lib/tax/strategyComparison';
import {
  CurrencyAmountSchema,
  type DirectorCalculationResult,
  type DirectorInput,
  type Region,
  RegionSchema,
} from '@/lib/validation/directorValidation';

// ============================================================================
// CONSTANTS
// ============================================================================

const CURRENT_TAX_YEAR: TaxYear = '2025-2026';

// ============================================================================
// TYPES
// ============================================================================

/** Year-end month options */
export type YearEndMonth = '03' | '12' | 'other' | 'unknown';

/** Taken via payroll options */
export type TakenViaPayroll = 'yes' | 'no' | 'unsure';

/**
 * Form data for the calculator
 */
export interface DirectorFormData {
  // Core inputs
  region: Region | undefined;
  revenue: number | undefined;
  includesVat: boolean;
  expenses: number | undefined;
  lossesBroughtForward: number;

  // Director situation
  alreadyTaken: number;
  takenViaPayroll: TakenViaPayroll;
  otherIncome: number;

  // Year-end
  yearEndMonth: YearEndMonth;
  yearEndCustom: string;

  // Advanced inputs
  studentLoanPlans: StudentLoanPlan[];
  pensionContribution: number;
  companyCarBIK: number;
  hasEmploymentAllowance: boolean;
  minimumSalaryRequirement: number | undefined;

  // Compare mode (Your Setup)
  yourSetupSalary: number | undefined;
  yourSetupDividends: number | undefined;
}

/**
 * Store state interface
 */
interface DirectorGuideState {
  // Form data
  formData: DirectorFormData;

  // Calculation results
  results: DirectorCalculationResult | null;
  strategyComparison: StrategyComparison | null;
  error: string | null;

  // UI state
  isCalculating: boolean;
  selectedStrategy: 'allSalary' | 'optimalMix' | 'allDividends';
  sliderSalary: number | null;
}

/**
 * Store actions interface
 */
interface DirectorGuideActions {
  // Core input setters
  setRegion: (region: Region) => void;
  setRevenue: (revenue: number) => void;
  setIncludesVat: (includesVat: boolean) => void;
  setExpenses: (expenses: number) => void;
  setLossesBroughtForward: (amount: number) => void;

  // Director situation setters
  setAlreadyTaken: (amount: number) => void;
  setTakenViaPayroll: (value: TakenViaPayroll) => void;
  setOtherIncome: (amount: number) => void;

  // Year-end setters
  setYearEndMonth: (month: YearEndMonth) => void;
  setYearEndCustom: (custom: string) => void;

  // Advanced input setters
  setStudentLoanPlans: (plans: StudentLoanPlan[]) => void;
  toggleStudentLoanPlan: (plan: StudentLoanPlan) => void;
  setPensionContribution: (amount: number) => void;
  setCompanyCarBIK: (amount: number) => void;
  setHasEmploymentAllowance: (has: boolean) => void;
  setMinimumSalaryRequirement: (amount: number | undefined) => void;

  // Compare mode setters
  setYourSetupSalary: (amount: number | undefined) => void;
  setYourSetupDividends: (amount: number | undefined) => void;

  // UI actions
  setSelectedStrategy: (strategy: 'allSalary' | 'optimalMix' | 'allDividends') => void;
  setSliderSalary: (salary: number | null) => void;

  // Calculation
  calculate: () => void;

  // Reset
  reset: () => void;
}

type DirectorGuideStore = DirectorGuideState & DirectorGuideActions;

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultFormData: DirectorFormData = {
  region: undefined,
  revenue: undefined,
  includesVat: false,
  expenses: undefined,
  lossesBroughtForward: 0,
  alreadyTaken: 0,
  takenViaPayroll: 'unsure',
  otherIncome: 0,
  yearEndMonth: '03',
  yearEndCustom: '',
  studentLoanPlans: [],
  pensionContribution: 0,
  companyCarBIK: 0,
  hasEmploymentAllowance: false,
  minimumSalaryRequirement: undefined,
  yourSetupSalary: undefined,
  yourSetupDividends: undefined,
};

const defaultState: DirectorGuideState = {
  formData: { ...defaultFormData },
  results: null,
  strategyComparison: null,
  error: null,
  isCalculating: false,
  selectedStrategy: 'optimalMix',
  sliderSalary: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useDirectorGuideStore = create<DirectorGuideStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultState,

        // ====================================================================
        // CORE INPUT SETTERS
        // ====================================================================

        setRegion: (region) => {
          const validated = RegionSchema.safeParse(region);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, region: validated.data },
          }));
        },

        setRevenue: (revenue) => {
          const validated = CurrencyAmountSchema.safeParse(revenue);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, revenue: validated.data },
          }));
        },

        setIncludesVat: (includesVat) => {
          set((state) => ({
            formData: { ...state.formData, includesVat },
          }));
        },

        setExpenses: (expenses) => {
          const validated = CurrencyAmountSchema.safeParse(expenses);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, expenses: validated.data },
          }));
        },

        setLossesBroughtForward: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, lossesBroughtForward: validated.data },
          }));
        },

        // ====================================================================
        // DIRECTOR SITUATION SETTERS
        // ====================================================================

        setAlreadyTaken: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, alreadyTaken: validated.data },
          }));
        },

        setTakenViaPayroll: (value) => {
          set((state) => ({
            formData: { ...state.formData, takenViaPayroll: value },
          }));
        },

        setOtherIncome: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, otherIncome: validated.data },
          }));
        },

        // ====================================================================
        // YEAR-END SETTERS
        // ====================================================================

        setYearEndMonth: (month) => {
          set((state) => ({
            formData: { ...state.formData, yearEndMonth: month },
          }));
        },

        setYearEndCustom: (custom) => {
          set((state) => ({
            formData: { ...state.formData, yearEndCustom: custom },
          }));
        },

        // ====================================================================
        // ADVANCED INPUT SETTERS
        // ====================================================================

        setStudentLoanPlans: (plans) => {
          set((state) => ({
            formData: { ...state.formData, studentLoanPlans: plans },
          }));
        },

        toggleStudentLoanPlan: (plan) => {
          set((state) => {
            const current = state.formData.studentLoanPlans;
            const newPlans = current.includes(plan)
              ? current.filter((p) => p !== plan)
              : [...current, plan];
            return {
              formData: { ...state.formData, studentLoanPlans: newPlans },
            };
          });
        },

        setPensionContribution: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, pensionContribution: validated.data },
          }));
        },

        setCompanyCarBIK: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, companyCarBIK: validated.data },
          }));
        },

        setHasEmploymentAllowance: (has) => {
          set((state) => ({
            formData: { ...state.formData, hasEmploymentAllowance: has },
          }));
        },

        setMinimumSalaryRequirement: (amount) => {
          if (amount === undefined) {
            set((state) => ({
              formData: { ...state.formData, minimumSalaryRequirement: undefined },
            }));
            return;
          }
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, minimumSalaryRequirement: validated.data },
          }));
        },

        // ====================================================================
        // COMPARE MODE SETTERS
        // ====================================================================

        setYourSetupSalary: (amount) => {
          if (amount === undefined) {
            set((state) => ({
              formData: { ...state.formData, yourSetupSalary: undefined },
            }));
            return;
          }
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, yourSetupSalary: validated.data },
          }));
        },

        setYourSetupDividends: (amount) => {
          if (amount === undefined) {
            set((state) => ({
              formData: { ...state.formData, yourSetupDividends: undefined },
            }));
            return;
          }
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, yourSetupDividends: validated.data },
          }));
        },

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        setSelectedStrategy: (strategy) => {
          set({ selectedStrategy: strategy, sliderSalary: null });
        },

        setSliderSalary: (salary) => {
          set({ sliderSalary: salary });
        },

        // ====================================================================
        // CALCULATION
        // ====================================================================

        calculate: () => {
          const { formData } = get();

          // Validate required fields
          if (
            !formData.region ||
            formData.revenue === undefined ||
            formData.expenses === undefined
          ) {
            set({ error: 'Please fill in revenue, expenses, and region' });
            return;
          }

          set({ isCalculating: true, error: null });

          try {
            // Map takenViaPayroll to boolean | null
            const takenViaPayrollValue =
              formData.takenViaPayroll === 'yes'
                ? true
                : formData.takenViaPayroll === 'no'
                  ? false
                  : null;

            // Main calculation (for survival mode detection)
            const input: DirectorInput = {
              region: formData.region,
              revenue: formData.revenue,
              includesVat: formData.includesVat,
              expenses: formData.expenses,
              alreadyTaken: formData.alreadyTaken,
              alreadyTakenViaPayroll: takenViaPayrollValue,
              confirmedSoleIncome: formData.otherIncome === 0,
            };

            const results = calculateDirectorScenario(input, CURRENT_TAX_YEAR);

            // Strategy comparison (includes all advanced inputs)
            const strategyComparison = calculateStrategyComparison(
              {
                region: formData.region,
                revenue: formData.revenue,
                includesVat: formData.includesVat,
                expenses: formData.expenses,
                lossesBroughtForward: formData.lossesBroughtForward,
                otherIncome: formData.otherIncome,
                employmentAllowance: formData.hasEmploymentAllowance,
                studentLoanPlans:
                  formData.studentLoanPlans.length > 0 ? formData.studentLoanPlans : undefined,
                pensionContribution: formData.pensionContribution,
                companyCarBIK: formData.companyCarBIK,
                yourSetupSalary: formData.yourSetupSalary,
                yourSetupDividends: formData.yourSetupDividends,
              },
              CURRENT_TAX_YEAR
            );

            set({
              results,
              strategyComparison,
              isCalculating: false,
              sliderSalary: null, // Reset slider on new calculation
            });
          } catch (error) {
            console.error('Director calculation error:', error);
            set({
              error: error instanceof Error ? error.message : 'Calculation failed',
              isCalculating: false,
            });
          }
        },

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => {
          trackGuideReset();
          set({ ...defaultState });
        },
      }),
      {
        name: 'director-guide-storage',
        version: 2, // Bumped version for new schema
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          formData: state.formData,
          selectedStrategy: state.selectedStrategy,
          _savedAt: Date.now(),
          _taxYear: CURRENT_TAX_YEAR,
        }),
        migrate: (persistedState, version) => {
          // Migration from version 0 or 1 to version 2
          if (version < 2) {
            // Clear old data and start fresh with new schema
            return { ...defaultState };
          }
          return persistedState as DirectorGuideState;
        },
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) return;

          // Check for expiry (7 days) or tax year mismatch
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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
 * Hook for accessing results
 */
export function useDirectorResults() {
  return useDirectorGuideStore((state) => state.results);
}

/**
 * Hook for accessing strategy comparison
 */
export function useStrategyComparison() {
  return useDirectorGuideStore((state) => state.strategyComparison);
}

/**
 * Hook for accessing selected strategy
 */
export function useSelectedStrategy() {
  return useDirectorGuideStore((state) => state.selectedStrategy);
}

/**
 * Hook for accessing slider salary
 */
export function useSliderSalary() {
  return useDirectorGuideStore((state) => state.sliderSalary);
}

/**
 * Hook for accessing error state
 */
export function useDirectorError() {
  return useDirectorGuideStore((state) => state.error);
}

/**
 * Hook for accessing calculation state
 */
export function useIsCalculating() {
  return useDirectorGuideStore((state) => state.isCalculating);
}

/**
 * Hook for accessing all actions
 */
export function useDirectorGuideActions() {
  return useDirectorGuideStore(
    useShallow((state) => ({
      // Core inputs
      setRegion: state.setRegion,
      setRevenue: state.setRevenue,
      setIncludesVat: state.setIncludesVat,
      setExpenses: state.setExpenses,
      setLossesBroughtForward: state.setLossesBroughtForward,
      // Director situation
      setAlreadyTaken: state.setAlreadyTaken,
      setTakenViaPayroll: state.setTakenViaPayroll,
      setOtherIncome: state.setOtherIncome,
      // Year-end
      setYearEndMonth: state.setYearEndMonth,
      setYearEndCustom: state.setYearEndCustom,
      // Advanced inputs
      setStudentLoanPlans: state.setStudentLoanPlans,
      toggleStudentLoanPlan: state.toggleStudentLoanPlan,
      setPensionContribution: state.setPensionContribution,
      setCompanyCarBIK: state.setCompanyCarBIK,
      setHasEmploymentAllowance: state.setHasEmploymentAllowance,
      setMinimumSalaryRequirement: state.setMinimumSalaryRequirement,
      // Compare mode
      setYourSetupSalary: state.setYourSetupSalary,
      setYourSetupDividends: state.setYourSetupDividends,
      // UI actions
      setSelectedStrategy: state.setSelectedStrategy,
      setSliderSalary: state.setSliderSalary,
      // Calculation
      calculate: state.calculate,
      reset: state.reset,
    }))
  );
}
