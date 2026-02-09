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
import {
  trackBufferShortfallShown,
  trackGuideReset,
  trackModeChanged,
  trackSafeDrawCalculated,
} from '@/lib/directorGuideAnalytics';
import { safeStorage } from '@/lib/safeStorage';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import { calculateStrategyComparison, type StrategyComparison } from '@/lib/tax/strategyComparison';
import {
  calculateSafeMonthlyDraw,
  projectAnnualFromMonthly,
  type SafeDrawResult,
} from '@/lib/tax/variableIncome';
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

/** Director guide input mode */
export type DirectorGuideMode = 'annual' | 'monthly';

/** Monthly-mode derived outputs */
export interface MonthlyModeOutput extends SafeDrawResult {
  monthsRemaining: number;
  projectedRevenue: number;
  projectedExpenses: number;
}

/**
 * Form data for the calculator
 */
export interface DirectorFormData {
  // Input mode
  mode: DirectorGuideMode;

  // Core inputs
  region: Region | undefined;
  revenue: number | undefined;
  includesVat: boolean;
  expenses: number | undefined;
  lossesBroughtForward: number;

  // Director situation - YTD amounts taken
  ytdSalary: number;
  ytdDividends: number;
  ytdDrawings: number; // Other drawings (director's loan account)
  otherIncome: number;
  hasOtherPAYEEmployment: boolean;

  // Year-end
  yearEndMonth: YearEndMonth;
  yearEndCustom: string;

  // Advanced inputs
  studentLoanPlans: StudentLoanPlan[];
  pensionContribution: number;
  isPensionAlreadyDeducted: boolean; // If true, pension is already in profit figure
  companyCarBIK: number;
  hasEmploymentAllowance: boolean;
  minimumSalaryRequirement: number | undefined;

  // Compare mode (Your Setup)
  yourSetupSalary: number | undefined;
  yourSetupDividends: number | undefined;

  // Monthly mode
  monthlyIncome: number;
  monthlyExpenses: number;
  contractStartMonth: number; // 1-12
  cashInBank: number;
  minimumMonthlyDraw: number;
  runwayMonths: number;
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
  monthlyModeOutput: MonthlyModeOutput | null;
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
  setMode: (mode: DirectorGuideMode) => void;
  setRegion: (region: Region) => void;
  setRevenue: (revenue: number) => void;
  setIncludesVat: (includesVat: boolean) => void;
  setExpenses: (expenses: number) => void;
  setLossesBroughtForward: (amount: number) => void;

  // Director situation setters (YTD amounts)
  setYtdSalary: (amount: number) => void;
  setYtdDividends: (amount: number) => void;
  setYtdDrawings: (amount: number) => void;
  setOtherIncome: (amount: number) => void;
  setHasOtherPAYEEmployment: (has: boolean) => void;

  // Year-end setters
  setYearEndMonth: (month: YearEndMonth) => void;
  setYearEndCustom: (custom: string) => void;

  // Advanced input setters
  setStudentLoanPlans: (plans: StudentLoanPlan[]) => void;
  toggleStudentLoanPlan: (plan: StudentLoanPlan) => void;
  setPensionContribution: (amount: number) => void;
  setIsPensionAlreadyDeducted: (deducted: boolean) => void;
  setCompanyCarBIK: (amount: number) => void;
  setHasEmploymentAllowance: (has: boolean) => void;
  setMinimumSalaryRequirement: (amount: number | undefined) => void;

  // Compare mode setters
  setYourSetupSalary: (amount: number | undefined) => void;
  setYourSetupDividends: (amount: number | undefined) => void;

  // Monthly mode setters
  setMonthlyIncome: (amount: number) => void;
  setMonthlyExpenses: (amount: number) => void;
  setContractStartMonth: (month: number) => void;
  setCashInBank: (amount: number) => void;
  setMinimumMonthlyDraw: (amount: number) => void;
  setRunwayMonths: (months: number) => void;

  // UI actions
  setSelectedStrategy: (strategy: 'allSalary' | 'optimalMix' | 'allDividends') => void;
  setSliderSalary: (salary: number | null) => void;

  // Calculation
  calculate: () => void;

  // Reset
  reset: () => void;
  clearStaleState: () => void;
}

type DirectorGuideStore = DirectorGuideState & DirectorGuideActions;

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultFormData: DirectorFormData = {
  mode: 'annual',
  region: undefined,
  revenue: undefined,
  includesVat: false,
  expenses: undefined,
  lossesBroughtForward: 0,
  ytdSalary: 0,
  ytdDividends: 0,
  ytdDrawings: 0,
  otherIncome: 0,
  hasOtherPAYEEmployment: false,
  yearEndMonth: '03',
  yearEndCustom: '',
  studentLoanPlans: [],
  pensionContribution: 0,
  isPensionAlreadyDeducted: false,
  companyCarBIK: 0,
  hasEmploymentAllowance: false,
  minimumSalaryRequirement: undefined,
  yourSetupSalary: undefined,
  yourSetupDividends: undefined,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  contractStartMonth: 4,
  cashInBank: 0,
  minimumMonthlyDraw: 0,
  runwayMonths: 3,
};

const defaultState: DirectorGuideState = {
  formData: { ...defaultFormData },
  results: null,
  strategyComparison: null,
  monthlyModeOutput: null,
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

        setMode: (mode) => {
          set((state) => {
            if (state.formData.mode === mode) return state;
            if (typeof window !== 'undefined') {
              trackModeChanged(mode);
            }
            return {
              formData: { ...state.formData, mode },
            };
          });
        },

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
        // DIRECTOR SITUATION SETTERS (YTD amounts)
        // ====================================================================

        setYtdSalary: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, ytdSalary: validated.data },
          }));
        },

        setYtdDividends: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, ytdDividends: validated.data },
          }));
        },

        setYtdDrawings: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, ytdDrawings: validated.data },
          }));
        },

        setOtherIncome: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, otherIncome: validated.data },
          }));
        },

        setHasOtherPAYEEmployment: (has) => {
          set((state) => ({
            formData: { ...state.formData, hasOtherPAYEEmployment: has },
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
          // Spec: Plan 5 is not active for 2025-26; don't allow it to enter state (can appear via stale persisted data).
          const sanitized = plans.filter((p) => p !== 'plan5');
          set((state) => ({
            formData: { ...state.formData, studentLoanPlans: sanitized },
          }));
        },

        toggleStudentLoanPlan: (plan) => {
          if (plan === 'plan5') return;
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

        setIsPensionAlreadyDeducted: (deducted) => {
          set((state) => ({
            formData: { ...state.formData, isPensionAlreadyDeducted: deducted },
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
        // MONTHLY MODE SETTERS
        // ====================================================================

        setMonthlyIncome: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, monthlyIncome: validated.data },
          }));
        },

        setMonthlyExpenses: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, monthlyExpenses: validated.data },
          }));
        },

        setContractStartMonth: (month) => {
          if (!Number.isInteger(month) || month < 1 || month > 12) return;
          set((state) => ({
            formData: { ...state.formData, contractStartMonth: month },
          }));
        },

        setCashInBank: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, cashInBank: validated.data },
          }));
        },

        setMinimumMonthlyDraw: (amount) => {
          const validated = CurrencyAmountSchema.safeParse(amount);
          if (!validated.success) return;
          set((state) => ({
            formData: { ...state.formData, minimumMonthlyDraw: validated.data },
          }));
        },

        setRunwayMonths: (months) => {
          if (!Number.isInteger(months) || months < 0 || months > 36) return;
          set((state) => ({
            formData: { ...state.formData, runwayMonths: months },
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

          if (!formData.region) {
            set({ error: 'Please select your region' });
            return;
          }

          const isMonthlyMode = formData.mode === 'monthly';
          const monthlyProjection = isMonthlyMode
            ? projectAnnualFromMonthly({
                monthlyIncome: formData.monthlyIncome,
                monthlyExpenses: formData.monthlyExpenses,
                contractStartMonth: formData.contractStartMonth,
              })
            : null;

          if (isMonthlyMode && monthlyProjection && monthlyProjection.monthsRemaining <= 0) {
            set({ error: 'Please select a valid contract start month' });
            return;
          }

          const effectiveRevenue =
            isMonthlyMode && monthlyProjection
              ? monthlyProjection.projectedRevenue
              : formData.revenue;
          const effectiveExpenses =
            isMonthlyMode && monthlyProjection
              ? monthlyProjection.projectedExpenses
              : formData.expenses;

          if (effectiveRevenue === undefined || effectiveExpenses === undefined) {
            set({ error: 'Please fill in revenue, expenses, and region' });
            return;
          }

          set({ isCalculating: true, error: null });

          try {
            // Compute total already taken from YTD fields
            const alreadyTaken = formData.ytdSalary + formData.ytdDividends + formData.ytdDrawings;

            // Determine if taken via payroll:
            // - true if salary was taken (via PAYE)
            // - false if only drawings (not via payroll)
            // - null if only dividends or nothing taken
            const alreadyTakenViaPayroll =
              formData.ytdSalary > 0 ? true : formData.ytdDrawings > 0 ? false : null;

            // Main calculation (for survival mode detection)
            const input: DirectorInput = {
              region: formData.region,
              revenue: effectiveRevenue,
              includesVat: formData.includesVat,
              expenses: effectiveExpenses,
              alreadyTaken,
              alreadyTakenViaPayroll,
              confirmedSoleIncome: formData.otherIncome === 0,
            };

            const results = calculateDirectorScenario(input, CURRENT_TAX_YEAR);

            const commonStrategyInput = {
              region: formData.region,
              revenue: effectiveRevenue,
              includesVat: formData.includesVat,
              expenses: effectiveExpenses,
              lossesBroughtForward: formData.lossesBroughtForward,
              otherIncome: formData.otherIncome,
              employmentAllowance: formData.hasEmploymentAllowance,
              studentLoanPlans:
                formData.studentLoanPlans.length > 0 ? formData.studentLoanPlans : undefined,
              pensionContribution: formData.isPensionAlreadyDeducted
                ? 0
                : formData.pensionContribution,
              companyCarBIK: formData.companyCarBIK,
              minimumSalaryRequirement: formData.minimumSalaryRequirement,
              hasOtherPAYEEmployment: formData.hasOtherPAYEEmployment,
              // YTD amounts (for available extraction calculation and warnings)
              ytdSalary: formData.ytdSalary,
              ytdDividends: formData.ytdDividends,
              ytdDrawings: formData.ytdDrawings,
            };

            // Strategy comparison (includes all advanced inputs).
            // "Your Setup" is only included when the user provides values.
            const strategyComparison = calculateStrategyComparison(
              {
                ...commonStrategyInput,
                yourSetupSalary: formData.yourSetupSalary,
                yourSetupDividends: formData.yourSetupDividends,
              },
              CURRENT_TAX_YEAR,
            );

            let monthlyModeOutput: MonthlyModeOutput | null = null;
            if (isMonthlyMode && monthlyProjection) {
              monthlyModeOutput = {
                ...calculateSafeMonthlyDraw({
                  annualTakeHome: strategyComparison.strategies.optimalMix.takeHome,
                  monthsRemaining: monthlyProjection.monthsRemaining,
                  cashInBank: formData.cashInBank,
                  minimumMonthlyDraw: formData.minimumMonthlyDraw,
                  runwayMonths: formData.runwayMonths,
                  monthlyExpenses: formData.monthlyExpenses,
                }),
                monthsRemaining: monthlyProjection.monthsRemaining,
                projectedRevenue: monthlyProjection.projectedRevenue,
                projectedExpenses: monthlyProjection.projectedExpenses,
              };
              if (typeof window !== 'undefined') {
                trackSafeDrawCalculated();
                if (monthlyModeOutput.hasBufferShortfall) {
                  trackBufferShortfallShown();
                }
              }
            }

            set({
              results,
              strategyComparison,
              monthlyModeOutput,
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
          if (typeof window !== 'undefined') {
            trackGuideReset();
          }
          set({ ...defaultState });
        },
        clearStaleState: () => {
          set({ ...defaultState });
        },
      }),
      {
        name: 'director-guide-storage',
        version: 4, // Monthly mode fields + derived outputs
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          formData: state.formData,
          selectedStrategy: state.selectedStrategy,
          _savedAt: Date.now(),
          _taxYear: CURRENT_TAX_YEAR,
        }),
        migrate: (persistedState, version) => {
          // Migration from older versions - clear and start fresh
          if (version < 4) {
            return { ...defaultState };
          }
          return persistedState as DirectorGuideState;
        },
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) return;

          // Defensive cleanup: prevent stale persisted Plan 5 from appearing in UI/state for 2025-26.
          if (state.formData.studentLoanPlans.includes('plan5')) {
            state.setStudentLoanPlans(state.formData.studentLoanPlans);
          }

          // Check for expiry (7 days) or tax year mismatch
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

          const savedAt = (state as unknown as { _savedAt?: number })._savedAt;
          const savedTaxYear = (state as unknown as { _taxYear?: string })._taxYear;

          const isExpired = savedAt && Date.now() - savedAt > SEVEN_DAYS_MS;
          const wrongTaxYear = savedTaxYear && savedTaxYear !== CURRENT_TAX_YEAR;

          if (isExpired || wrongTaxYear) {
            // Clear stale data
            useDirectorGuideStore.getState().clearStaleState();
          }
        },
      },
    ),
    { name: 'DirectorGuideStore' },
  ),
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
 * Hook for monthly-mode calculated outputs
 */
export function useMonthlyModeOutput() {
  return useDirectorGuideStore((state) => state.monthlyModeOutput);
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
      setMode: state.setMode,
      setRegion: state.setRegion,
      setRevenue: state.setRevenue,
      setIncludesVat: state.setIncludesVat,
      setExpenses: state.setExpenses,
      setLossesBroughtForward: state.setLossesBroughtForward,
      // Director situation (YTD amounts)
      setYtdSalary: state.setYtdSalary,
      setYtdDividends: state.setYtdDividends,
      setYtdDrawings: state.setYtdDrawings,
      setOtherIncome: state.setOtherIncome,
      setHasOtherPAYEEmployment: state.setHasOtherPAYEEmployment,
      // Year-end
      setYearEndMonth: state.setYearEndMonth,
      setYearEndCustom: state.setYearEndCustom,
      // Advanced inputs
      setStudentLoanPlans: state.setStudentLoanPlans,
      toggleStudentLoanPlan: state.toggleStudentLoanPlan,
      setPensionContribution: state.setPensionContribution,
      setIsPensionAlreadyDeducted: state.setIsPensionAlreadyDeducted,
      setCompanyCarBIK: state.setCompanyCarBIK,
      setHasEmploymentAllowance: state.setHasEmploymentAllowance,
      setMinimumSalaryRequirement: state.setMinimumSalaryRequirement,
      // Compare mode
      setYourSetupSalary: state.setYourSetupSalary,
      setYourSetupDividends: state.setYourSetupDividends,
      // Monthly mode
      setMonthlyIncome: state.setMonthlyIncome,
      setMonthlyExpenses: state.setMonthlyExpenses,
      setContractStartMonth: state.setContractStartMonth,
      setCashInBank: state.setCashInBank,
      setMinimumMonthlyDraw: state.setMinimumMonthlyDraw,
      setRunwayMonths: state.setRunwayMonths,
      // UI actions
      setSelectedStrategy: state.setSelectedStrategy,
      setSliderSalary: state.setSliderSalary,
      // Calculation
      calculate: state.calculate,
      reset: state.reset,
    })),
  );
}
