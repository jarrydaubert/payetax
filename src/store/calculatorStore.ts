// src/store/calculatorStore.ts
/**
 * UK Tax Calculator - Zustand State Management Store
 *
 * This file implements the global state management for the UK Tax Calculator using Zustand.
 * It handles all calculator inputs, results, and provides actions to update and calculate taxes.
 *
 * Features:
 * - Persistent state across browser sessions
 * - Redux DevTools integration for debugging
 * - Type-safe actions and state
 * - Centralized tax calculation logic
 * - Default values and initialization
 *
 * The store follows a pattern where:
 * - State contains current inputs and calculated results
 * - Actions update individual properties and trigger recalculations
 * - Complex business logic is delegated to dedicated calculation functions
 *
 * State Management Pattern:
 * - Input changes update store immediately
 * - Calculations are triggered manually via calculate() action
 * - Results are cached in the store until inputs change
 * - Persistence allows users to return to their previous calculation
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
// Sentry removed as requested
import {
  type NICategory,
  type PayPeriod,
  PERIODS,
  type StudentLoanPlan,
  TAX_RATES,
  type TaxBand,
  type TaxYear,
} from '@/constants/taxRates';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';

/**
 * Interface defining all inputs required for tax calculations
 * These values are collected from the UI and passed to the calculation engine
 */
interface CalculatorInput {
  /** Gross salary amount in the specified pay period */
  salary: number;
  /** How often the salary is paid (annually, monthly, weekly, etc.) */
  payPeriod: PayPeriod;
  /** Tax year to use for rates and thresholds */
  taxYear: TaxYear;
  /** HMRC tax code (e.g., 1257L, S1257L) */
  taxCode: string;
  /** Tax region (England, Scotland, Wales, Northern Ireland) */
  region: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  /** Whether Scottish tax rates apply (derived from region) */
  isScottish: boolean;
  /** Whether married/civil partnership for marriage allowance */
  isMarried: boolean;
  /** Partner's gross wage for marriage allowance calculation */
  partnerGrossWage: number;
  /** Whether blind person's allowance applies */
  isBlind: boolean;
  /** Age of the taxpayer (for age-related allowances and NI exemptions) */
  age?: number;
  /** Whether paying no National Insurance (e.g., over state pension age) */
  payNoNI: boolean;
  /** Student loan plan (single selection or none) */
  studentLoanPlan: StudentLoanPlan | 'none';
  /** Pension contribution amount */
  pensionContribution: number;
  /** Whether pension contribution is a percentage or fixed amount */
  pensionContributionType: 'percentage' | 'amount';
  /** National Insurance category (A, B, C, etc.) */
  niCategory: NICategory;
  /** Hours worked per week (for hourly rate calculations) */
  hoursPerWeek: number;
  /** Additional allowances or deductions (annual) */
  allowancesDeductions: number;
}

// Interface for tax rates that can be updated
interface TaxRatesState {
  personalAllowance: number;
  personalAllowanceReductionThreshold: number;
  personalAllowanceReductionRate: number;
  bands: TaxBand[];
  marriageAllowance: number;
  blindPersonsAllowance: number;
}

// Interface for NI rates
interface NIRates {
  primary: { threshold: number; rate: number };
  upper: { threshold: number; rate: number };
}

// Interface for calculation results
type CalculationResults = TaxCalculationResults | null;

// What If scenario configuration
interface WhatIfConfig {
  enabled: boolean;
  type: 'percentage' | 'amount' | 'total';
  value: number;
}

// Calculator store state
interface CalculatorState {
  // Input values
  input: CalculatorInput;

  // Current tax rates
  taxRates: TaxRatesState;
  niRates: NIRates;

  // Calculation results
  results: CalculationResults;
  previousYearResults: CalculationResults;

  // What If scenario
  whatIf: WhatIfConfig;
  whatIfResults: CalculationResults;

  // Input actions
  setSalary: (salary: number) => void;
  setPayPeriod: (period: PayPeriod) => void;
  setTaxYear: (year: TaxYear) => void;
  setTaxCode: (code: string) => void;
  setRegion: (region: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland') => void;
  setIsScottish: (isScottish: boolean) => void;
  setIsMarried: (isMarried: boolean) => void;
  setPartnerGrossWage: (wage: number) => void;
  setIsBlind: (isBlind: boolean) => void;
  setAge: (age: number | undefined) => void;
  setPayNoNI: (payNoNI: boolean) => void;
  setStudentLoanPlan: (plan: StudentLoanPlan | 'none') => void;
  setPensionContribution: (amount: number) => void;
  setPensionContributionType: (type: 'percentage' | 'amount') => void;
  setNiCategory: (category: NICategory) => void;
  setHoursPerWeek: (hours: number) => void;
  setAllowancesDeductions: (amount: number) => void;

  // Tax rate actions
  updateTaxRates: (rates: Partial<TaxRatesState>) => void;
  updateScottishRates: (bands: TaxBand[]) => void;
  updateNIRates: (rates: NIRates) => void;

  // Calculation actions
  calculate: () => void;
  calculatePreviousYear: () => void;
  reset: () => void;
  init: () => void;

  // What If actions
  toggleWhatIf: () => void;
  setWhatIfType: (type: 'percentage' | 'amount' | 'total') => void;
  setWhatIfValue: (value: number) => void;
  calculateWhatIf: () => void;
}

// Get current tax year
const getCurrentTaxYear = (): TaxYear => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)

  // If we're between January and April 5th, we're in the previous tax year
  if (currentMonth < 3 || (currentMonth === 3 && currentDate.getDate() < 6)) {
    return `${currentYear - 1}-${currentYear}` as TaxYear;
  }

  // Otherwise, we're in the current tax year
  return `${currentYear}-${currentYear + 1}` as TaxYear;
};

// Default tax year based on current date
const defaultTaxYear = getCurrentTaxYear();

// Initialize with current year's rates
const currentYearRates = TAX_RATES[defaultTaxYear];

// UK minimum wage (April 2024 - March 2025): £11.44 per hour
// Default inputs
const defaultInput: CalculatorInput = {
  salary: 0, // Empty by default - show as placeholder
  payPeriod: PERIODS.ANNUALLY,
  taxYear: defaultTaxYear,
  taxCode: '', // Empty by default - use standard allowance
  region: 'England',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  age: undefined,
  payNoNI: false,
  studentLoanPlan: 'none',
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 0,
};

// Create the calculator store
export const useCalculatorStore = create<CalculatorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        input: { ...defaultInput },
        taxRates: {
          personalAllowance: currentYearRates.personalAllowance,
          personalAllowanceReductionThreshold: currentYearRates.personalAllowanceReductionThreshold,
          personalAllowanceReductionRate: currentYearRates.personalAllowanceReductionRate,
          bands: currentYearRates.bands,
          marriageAllowance: currentYearRates.marriageAllowance,
          blindPersonsAllowance: currentYearRates.blindPersonsAllowance,
        },
        niRates: currentYearRates.nationalInsurance.employee.A,
        results: null,
        previousYearResults: null,

        // What If state
        whatIf: {
          enabled: false,
          type: 'percentage',
          value: 10,
        },
        whatIfResults: null,

        // Initialize with example calculation on first load
        // This is called after store creation to show £0 example
        init: () => {
          const { calculate } = get();
          try {
            calculate();
          } catch (error) {
            // Silently handle initialization errors
            console.warn('Failed to initialize example calculation:', error);
          }
        },

        // Input actions
        setSalary: (salary) => set((state) => ({ input: { ...state.input, salary } })),
        setPayPeriod: (payPeriod) => set((state) => ({ input: { ...state.input, payPeriod } })),
        setTaxYear: (taxYear) => set((state) => ({ input: { ...state.input, taxYear } })),
        setTaxCode: (taxCode) => set((state) => ({ input: { ...state.input, taxCode } })),
        setRegion: (region) =>
          set((state) => ({
            input: { ...state.input, region, isScottish: region === 'Scotland' },
          })),
        setIsScottish: (isScottish) => set((state) => ({ input: { ...state.input, isScottish } })),
        setIsMarried: (isMarried) => set((state) => ({ input: { ...state.input, isMarried } })),
        setPartnerGrossWage: (partnerGrossWage) =>
          set((state) => ({ input: { ...state.input, partnerGrossWage } })),
        setIsBlind: (isBlind) => set((state) => ({ input: { ...state.input, isBlind } })),
        setAge: (age) => set((state) => ({ input: { ...state.input, age } })),
        setPayNoNI: (payNoNI) => set((state) => ({ input: { ...state.input, payNoNI } })),
        setPensionContribution: (pensionContribution) =>
          set((state) => ({ input: { ...state.input, pensionContribution } })),
        setPensionContributionType: (pensionContributionType) =>
          set((state) => ({ input: { ...state.input, pensionContributionType } })),
        setStudentLoanPlan: (studentLoanPlan) =>
          set((state) => ({ input: { ...state.input, studentLoanPlan } })),
        setNiCategory: (niCategory) => set((state) => ({ input: { ...state.input, niCategory } })),
        setHoursPerWeek: (hoursPerWeek) =>
          set((state) => ({ input: { ...state.input, hoursPerWeek } })),
        setAllowancesDeductions: (allowancesDeductions) =>
          set((state) => ({ input: { ...state.input, allowancesDeductions } })),

        // Tax rate actions
        updateTaxRates: (updatedRates) =>
          set((state) => ({
            taxRates: { ...state.taxRates, ...updatedRates },
          })),
        updateScottishRates: (bands) =>
          set((state) => ({
            taxRates: { ...state.taxRates, bands },
          })),
        updateNIRates: (rates) =>
          set(() => ({
            niRates: rates,
          })),

        // Calculation actions
        calculate: () => {
          try {
            const { input } = get();

            // Allow calculations with £0 salary for demonstration purposes
            if (input.salary < 0) {
              throw new Error('Salary cannot be negative');
            }

            // Default tax code if not provided
            const taxCodeToUse =
              input.taxCode.trim() || (input.region === 'Scotland' ? 'S1257L' : '1257L');
            const inputWithDefaults = {
              ...input,
              taxCode: taxCodeToUse,
            };

            const results = calculateTax(inputWithDefaults);
            set({ results });
          } catch (error) {
            // Log calculation errors for debugging
            console.error('Tax calculation error:', error);

            // Reset results on error
            set({ results: null });
            throw error; // Re-throw to let UI handle it
          }
        },
        calculatePreviousYear: () => {
          const { input } = get();

          // Get previous tax year
          const currentYear = Number.parseInt(input.taxYear.split('-')[0] || '', 10);
          const previousYear = `${currentYear - 1}-${currentYear}` as TaxYear;

          // Only calculate if the previous year is a valid tax year
          if (TAX_RATES[previousYear]) {
            const previousYearInput = { ...input, taxYear: previousYear };
            const previousResults = calculateTax(previousYearInput);
            set({ previousYearResults: previousResults });
          }
        },
        reset: () => {
          set({
            input: { ...defaultInput },
            results: null,
            previousYearResults: null,
            whatIf: {
              enabled: false,
              type: 'percentage',
              value: 10,
            },
            whatIfResults: null,
          });
        },

        // What If actions
        toggleWhatIf: () => {
          const { whatIf, calculateWhatIf } = get();
          const newEnabled = !whatIf.enabled;

          set({
            whatIf: { ...whatIf, enabled: newEnabled },
          });

          // Calculate What If scenario if enabling
          if (newEnabled) {
            calculateWhatIf();
          } else {
            set({ whatIfResults: null });
          }
        },

        setWhatIfType: (type) => {
          set((state) => ({
            whatIf: { ...state.whatIf, type },
          }));
          // Don't auto-calculate - let user click Compare button
        },

        setWhatIfValue: (value) => {
          set((state) => ({
            whatIf: { ...state.whatIf, value },
          }));
          // Don't auto-calculate - let user click Compare button
        },

        calculateWhatIf: () => {
          try {
            const { input, whatIf } = get();

            const currentSalary = input.salary;

            // Don't calculate if no salary entered
            if (!currentSalary || currentSalary <= 0) {
              console.warn('Cannot calculate What If: No current salary');
              return;
            }
            let newSalary: number;

            // Calculate new salary based on What If type
            switch (whatIf.type) {
              case 'percentage': {
                // Percentage increase/decrease
                newSalary = currentSalary * (1 + whatIf.value / 100);
                break;
              }
              case 'amount': {
                // Fixed amount change
                newSalary = currentSalary + whatIf.value;
                break;
              }
              case 'total': {
                // New total salary
                newSalary = whatIf.value;
                break;
              }
              default:
                newSalary = currentSalary;
            }

            // Ensure non-negative
            newSalary = Math.max(0, newSalary);

            // Calculate tax with new salary
            const whatIfInput = { ...input, salary: newSalary };
            const whatIfResults = calculateTax(whatIfInput);

            set({ whatIfResults });
          } catch (error) {
            console.error('What If calculation error:', error);
            set({ whatIfResults: null });
          }
        },
      }),
      {
        name: 'tax-calculator-storage',
        partialize: (state) => ({
          input: state.input,
          // Don't persist calculation results
        }),
      }
    )
  )
);

/**
 * Optimized selector hooks to prevent unnecessary re-renders
 * These hooks use granular selectors instead of extracting the entire state
 */

// Selector for calculator results only (most commonly used)
export const useCalculatorResults = () => useCalculatorStore((state) => state.results);

// Selector for previous year results
export const usePreviousYearResults = () =>
  useCalculatorStore((state) => state.previousYearResults);

// Selector for calculator actions (stable, won't trigger re-renders)
export const useCalculatorActions = () =>
  useCalculatorStore(
    useShallow((state) => ({
      setSalary: state.setSalary,
      setPayPeriod: state.setPayPeriod,
      setTaxYear: state.setTaxYear,
      setTaxCode: state.setTaxCode,
      setRegion: state.setRegion,
      setIsScottish: state.setIsScottish,
      setIsMarried: state.setIsMarried,
      setPartnerGrossWage: state.setPartnerGrossWage,
      setIsBlind: state.setIsBlind,
      setAge: state.setAge,
      setPayNoNI: state.setPayNoNI,
      setStudentLoanPlan: state.setStudentLoanPlan,
      setPensionContribution: state.setPensionContribution,
      setPensionContributionType: state.setPensionContributionType,
      setNiCategory: state.setNiCategory,
      setHoursPerWeek: state.setHoursPerWeek,
      setAllowancesDeductions: state.setAllowancesDeductions,
      updateTaxRates: state.updateTaxRates,
      updateScottishRates: state.updateScottishRates,
      updateNIRates: state.updateNIRates,
      calculate: state.calculate,
      calculatePreviousYear: state.calculatePreviousYear,
      reset: state.reset,
      toggleWhatIf: state.toggleWhatIf,
      setWhatIfType: state.setWhatIfType,
      setWhatIfValue: state.setWhatIfValue,
      calculateWhatIf: state.calculateWhatIf,
    }))
  );

// Selector for What If state
export const useWhatIf = () => useCalculatorStore((state) => state.whatIf);

// Selector for What If results
export const useWhatIfResults = () => useCalculatorStore((state) => state.whatIfResults);
