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
// Sentry removed as requested
import {
  type NICategory,
  type PayPeriod,
  PERIODS,
  type StudentLoanPlan,
  TAX_RATES,
  type TaxAllowance,
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
  /** Additional tax allowances like working from home */
  additionalAllowances: TaxAllowance[];
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
  setPayNoNI: (payNoNI: boolean) => void;
  setStudentLoanPlan: (plan: StudentLoanPlan | 'none') => void;
  setPensionContribution: (amount: number) => void;
  setPensionContributionType: (type: 'percentage' | 'amount') => void;
  setNiCategory: (category: NICategory) => void;
  setHoursPerWeek: (hours: number) => void;
  setAdditionalAllowances: (allowances: TaxAllowance[]) => void;

  // Tax rate actions
  updateTaxRates: (rates: Partial<TaxRatesState>) => void;
  updateScottishRates: (bands: TaxBand[]) => void;
  updateNIRates: (rates: NIRates) => void;

  // Calculation actions
  calculate: () => void;
  calculatePreviousYear: () => void;
  reset: () => void;
  init: () => void;
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
// Full-time annual: £11.44 × 37.5 hours × 52 weeks = £22,308
const _MINIMUM_WAGE_ANNUAL = 22308;

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
  payNoNI: false,
  studentLoanPlan: 'none',
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  niCategory: 'A',
  hoursPerWeek: 40,
  additionalAllowances: [],
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
        setAdditionalAllowances: (additionalAllowances) =>
          set((state) => ({ input: { ...state.input, additionalAllowances } })),

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

            const results = calculateTax(input);
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
          const currentYear = Number.parseInt(input.taxYear.split('-')[0], 10);
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
          });
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
