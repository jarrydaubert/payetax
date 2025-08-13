// src/store/calculatorStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  DEFAULT_TAX_CODE,
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

// Interface for tax calculator inputs
interface CalculatorInput {
  salary: number;
  payPeriod: PayPeriod;
  taxYear: TaxYear;
  taxCode: string;
  isScottish: boolean;
  pensionContribution: number;
  pensionContributionType: 'percentage' | 'amount';
  studentLoanPlans: StudentLoanPlan[];
  niCategory: NICategory;
  hoursPerWeek: number;
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
  setIsScottish: (isScottish: boolean) => void;
  setPensionContribution: (amount: number) => void;
  setPensionContributionType: (type: 'percentage' | 'amount') => void;
  setStudentLoanPlans: (plans: StudentLoanPlan[]) => void;
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

// Default inputs
const defaultInput: CalculatorInput = {
  salary: 0,
  payPeriod: PERIODS.ANNUALLY,
  taxYear: defaultTaxYear,
  taxCode: DEFAULT_TAX_CODE,
  isScottish: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: ['none'],
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

        // Input actions
        setSalary: (salary) => set((state) => ({ input: { ...state.input, salary } })),
        setPayPeriod: (payPeriod) => set((state) => ({ input: { ...state.input, payPeriod } })),
        setTaxYear: (taxYear) => set((state) => ({ input: { ...state.input, taxYear } })),
        setTaxCode: (taxCode) => set((state) => ({ input: { ...state.input, taxCode } })),
        setIsScottish: (isScottish) => set((state) => ({ input: { ...state.input, isScottish } })),
        setPensionContribution: (pensionContribution) =>
          set((state) => ({ input: { ...state.input, pensionContribution } })),
        setPensionContributionType: (pensionContributionType) =>
          set((state) => ({ input: { ...state.input, pensionContributionType } })),
        setStudentLoanPlans: (studentLoanPlans) =>
          set((state) => ({ input: { ...state.input, studentLoanPlans } })),
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
          const { input } = get();
          const results = calculateTax(input);
          set({ results });
        },
        calculatePreviousYear: () => {
          const { input } = get();

          // Get previous tax year
          const currentYear = Number.parseInt(input.taxYear.split('-')[0]);
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
