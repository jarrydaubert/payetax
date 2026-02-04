'use client';

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

import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  type NICategory,
  type PayPeriod,
  PERIODS,
  type StudentLoanPlan,
  type StudentLoanSelection,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import { trackCalculatorEvent, trackCalculatorUsage } from '@/lib/analytics';
import { safeStorage } from '@/lib/safeStorage';
import {
  addBreadcrumb,
  captureCalculatorError,
  setContext,
  startPerformanceTransaction,
} from '@/lib/sentry';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import {
  INCOME_TYPE_LABELS,
  type IncomeSource,
  IncomeSourceUpdateSchema,
} from '@/lib/types/calculator';
import {
  BooleanSchema,
  NICategorySchema,
  PensionContributionTypeSchema,
  WhatIfTypeSchema,
} from '@/lib/validation';

const shouldLogWarnings = process.env.NODE_ENV !== 'production';

const logCalculatorWarning = (...args: unknown[]) => {
  if (shouldLogWarnings) {
    console.warn(...args);
  }
};

const TAX_YEAR_INPUT_SCHEMA = z
  .string()
  .refine(
    (year) => {
      const shortFormat = /^\d{4}-\d{2}$/;
      const longFormat = /^\d{4}-\d{4}$/;
      return shortFormat.test(year) || longFormat.test(year);
    },
    {
      message: 'Tax year must be in format YYYY-YY or YYYY-YYYY (e.g., 2024-25, 2024-2025)',
    },
  )
  .refine(
    (year) => {
      const parts = year.split('-');
      if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

      const start = Number.parseInt(parts[0], 10);
      const endStr = parts[1];

      if (Number.isNaN(start)) return false;

      const end =
        endStr.length === 2 ? Number.parseInt(`20${endStr}`, 10) : Number.parseInt(endStr, 10);

      if (Number.isNaN(end)) return false;

      return end === start + 1;
    },
    { message: 'Tax year must be consecutive (e.g., 2024-25)' },
  );

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
  /** Student loan plans (can select multiple, or 'none') */
  studentLoanPlans: StudentLoanSelection;
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
  /** Additional income sources (pensions, rental, etc.) */
  incomeSources: IncomeSource[];
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
  setStudentLoanPlans: (plans: StudentLoanSelection) => void;
  toggleStudentLoan: (plan: StudentLoanPlan) => void;
  setPensionContribution: (amount: number) => void;
  setPensionContributionType: (type: 'percentage' | 'amount') => void;
  setNiCategory: (category: NICategory) => void;
  setHoursPerWeek: (hours: number) => void;
  setAllowancesDeductions: (amount: number) => void;
  setInput: (partial: Partial<CalculatorInput>) => void;

  // Income Sources Management
  addIncomeSource: () => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  removeIncomeSource: (id: string) => void;

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
  clearWhatIf: () => void;
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

const normalizeTaxYear = (value: string): TaxYear => {
  const [start, endRaw] = value.split('-');
  const end = endRaw?.length === 2 ? `20${endRaw}` : endRaw;
  return `${start}-${end}` as TaxYear;
};

// Get salary range for privacy-safe analytics
const getSalaryRange = (salary: number): string | null => {
  if (salary <= 0) return null; // Don't track empty/zero salary
  if (salary < 25000) return 'under_25k';
  if (salary < 35000) return '25k_35k';
  if (salary < 50000) return '35k_50k';
  if (salary < 75000) return '50k_75k';
  if (salary < 100000) return '75k_100k';
  if (salary < 150000) return '100k_150k';
  return 'over_150k';
};

// Default tax year based on current date
const defaultTaxYear = getCurrentTaxYear();

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
  studentLoanPlans: 'none',
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 0,
  incomeSources: [],
};

// Create the calculator store
export const useCalculatorStore = create<CalculatorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        input: { ...defaultInput },
        results: null,
        previousYearResults: null,

        // What If state
        whatIf: {
          enabled: false,
          type: 'percentage',
          value: 10,
        },
        whatIfResults: null,

        // Initialize store - no auto-calculation, user must click Calculate
        // This ensures initial load matches the reset state
        init: () => {
          // No-op: Just ensure store is initialized
          // User must click Calculate button to see results
        },

        // Input actions
        setSalary: (salary) => {
          // Validate salary input
          try {
            const validated = z
              .number()
              .min(0, 'Salary must be positive')
              .max(10_000_000, 'Salary exceeds maximum')
              .finite('Salary must be a valid number')
              .safeParse(salary);

            if (!validated.success) {
              // Expected user behavior - don't log as warning (Sentry captures console.warn)
              return;
            }

            // Add breadcrumb for debugging
            addBreadcrumb('calculator-input', {
              message: 'Salary updated',
              level: 'info',
              data: { salary: validated.data },
            });

            set((state) => ({ input: { ...state.input, salary: validated.data } }));
          } catch (_error) {
            // Zod v4 can throw in edge cases - silently ignore in production
            // Error already handled by Zod validation feedback
          }
        },
        setPayPeriod: (payPeriod) => {
          // Validate pay period - include all valid periods from PERIODS constant
          try {
            const validated = z
              .enum([
                'annually',
                'monthly',
                'fourWeekly',
                'fortnightly',
                'weekly',
                'daily',
                'hourly',
              ])
              .safeParse(payPeriod);

            if (!validated.success) {
              // Invalid pay period - just log and don't update state
              logCalculatorWarning(
                '[Calculator] Invalid pay period:',
                validated.error.issues[0]?.message ?? 'Validation failed',
              );
              return;
            }

            set((state) => ({ input: { ...state.input, payPeriod: validated.data } }));
          } catch (error) {
            // Zod v4 can throw in some edge cases even with safeParse
            logCalculatorWarning('[Calculator] Pay period validation error:', error);
          }
        },
        setTaxYear: (taxYear) => {
          try {
            const validated = TAX_YEAR_INPUT_SCHEMA.safeParse(taxYear);

            if (!validated.success) {
              logCalculatorWarning(
                '[Calculator] Invalid tax year:',
                validated.error.issues[0]?.message ?? 'Validation failed',
              );
              return;
            }

            const normalized = normalizeTaxYear(validated.data);
            if (!TAX_RATES[normalized]) {
              logCalculatorWarning('[Calculator] Unsupported tax year:', normalized);
              return;
            }

            set((state) => ({ input: { ...state.input, taxYear: normalized } }));
          } catch (error) {
            // Zod v4 can throw in some edge cases even with safeParse
            logCalculatorWarning('[Calculator] Tax year validation error:', error);
          }
        },
        setTaxCode: (taxCode) => {
          // Validate tax code format (allow empty for default)
          if (taxCode.trim() === '') {
            set((state) => ({ input: { ...state.input, taxCode: '' } }));
            return;
          }

          try {
            const validated = z
              .string()
              .min(1)
              .transform((val) => val.trim().replace(/\s+/g, '').toUpperCase()) // Remove ALL spaces, trim, uppercase
              .refine(
                (code) => {
                  // Remove emergency suffix (W1, M1, X) before validation
                  const codeWithoutEmergency = code.replace(/(W1|M1|X)$/, '');

                  // Support Scottish (S) and Welsh (C) prefixes.
                  // Note: prefix does not change allowance logic; it affects which tax rates apply.
                  const codeWithoutPrefix = codeWithoutEmergency.replace(/^[SC]/, '');

                  // Special codes (also valid with prefixes, e.g. SBR, CBR, SD0, SNT, S0T).
                  const specialCodes = ['BR', 'D0', 'D1', 'NT', '0T'];
                  if (specialCodes.includes(codeWithoutPrefix)) return true;

                  // Standard format or K codes.
                  const standardPattern = /^[0-9]+[LMNPTX]?$/;
                  const kCodePattern = /^K[0-9]+$/;

                  return (
                    standardPattern.test(codeWithoutPrefix) || kCodePattern.test(codeWithoutPrefix)
                  );
                },
                { message: 'Invalid tax code format (e.g., 1257L, BR, S1257L, K100)' },
              )
              .safeParse(taxCode);

            if (!validated.success) {
              // Invalid tax code - just log and don't update state
              // This is expected user behavior, not an error
              logCalculatorWarning(
                '[Calculator] Invalid tax code:',
                validated.error.issues[0]?.message ?? 'Validation failed',
              );
              return;
            }

            set((state) => ({ input: { ...state.input, taxCode: validated.data } }));
          } catch (error) {
            // Zod v4 can throw in some edge cases even with safeParse
            // This is expected user input validation, not an application error
            logCalculatorWarning('[Calculator] Tax code validation error:', error);
          }
        },
        setRegion: (region) => {
          // Validate region
          try {
            const validated = z
              .enum(['England', 'Scotland', 'Wales', 'Northern Ireland'])
              .safeParse(region);

            if (!validated.success) {
              logCalculatorWarning(
                '[Calculator] Invalid region:',
                validated.error.issues[0]?.message ?? 'Validation failed',
              );
              return;
            }

            set((state) => ({
              input: {
                ...state.input,
                region: validated.data,
                isScottish: validated.data === 'Scotland',
              },
            }));
          } catch (error) {
            // Zod v4 can throw in some edge cases even with safeParse
            logCalculatorWarning('[Calculator] Region validation error:', error);
          }
        },
        setIsScottish: (isScottish) => {
          // Validate boolean using extracted schema
          const validated = BooleanSchema.safeParse(isScottish);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid isScottish:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          // Keep region and isScottish in sync to prevent impossible states
          set((state) => ({
            input: {
              ...state.input,
              isScottish: validated.data,
              region: validated.data
                ? 'Scotland'
                : state.input.region === 'Scotland'
                  ? 'England'
                  : state.input.region,
            },
          }));
        },
        setIsMarried: (isMarried) => {
          // Validate boolean using extracted schema
          const validated = BooleanSchema.safeParse(isMarried);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid isMarried:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, isMarried: validated.data } }));
        },
        setPartnerGrossWage: (partnerGrossWage) => {
          // Validate partner wage
          const validated = z
            .number()
            .min(0, 'Partner wage cannot be negative')
            .max(10_000_000, 'Partner wage exceeds maximum')
            .finite('Partner wage must be a valid number')
            .safeParse(partnerGrossWage);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid partner wage:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }
          set((state) => ({ input: { ...state.input, partnerGrossWage: validated.data } }));
        },
        setIsBlind: (isBlind) => {
          // Validate boolean using extracted schema
          const validated = BooleanSchema.safeParse(isBlind);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid isBlind:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, isBlind: validated.data } }));
        },
        setAge: (age) => {
          // Validate age if provided
          if (age !== undefined) {
            const validated = z
              .number()
              .int('Age must be a whole number')
              .min(0, 'Age cannot be negative')
              .max(120, 'Age must be between 0 and 120')
              .safeParse(age);

            if (!validated.success) {
              logCalculatorWarning(
                '[Calculator] Invalid age:',
                validated.error.issues[0]?.message ?? 'Validation failed',
              );
              return;
            }
            age = validated.data;
          }
          set((state) => ({ input: { ...state.input, age } }));
        },
        setPayNoNI: (payNoNI) => {
          // Validate boolean using extracted schema
          const validated = BooleanSchema.safeParse(payNoNI);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid payNoNI:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, payNoNI: validated.data } }));
        },
        setPensionContribution: (pensionContribution) => {
          const { input } = get();

          // Validate based on contribution type
          const schema =
            input.pensionContributionType === 'percentage'
              ? z
                  .number()
                  .min(0, 'Pension contribution must be positive')
                  .max(100, 'Pension percentage cannot exceed 100%')
              : z
                  .number()
                  .min(0, 'Pension contribution must be positive')
                  .max(10_000_000, 'Pension amount exceeds maximum');

          const validated = schema.safeParse(pensionContribution);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid pension contribution:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, pensionContribution: validated.data } }));
        },
        setPensionContributionType: (pensionContributionType) => {
          // Validate pension type using extracted schema
          const validated = PensionContributionTypeSchema.safeParse(pensionContributionType);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid pension contribution type:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, pensionContributionType: validated.data } }));
        },
        setStudentLoanPlans: (studentLoanPlans) => {
          // Validate student loan plans - either 'none' or array of valid plans
          const planEnum = z.enum(['plan1', 'plan2', 'plan4', 'plan5', 'postgrad']);
          const validated = z
            .union([z.literal('none'), z.array(planEnum).max(2, 'Maximum 2 student loans allowed')])
            .safeParse(studentLoanPlans);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid student loan plans:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          // Check for duplicates if array
          if (Array.isArray(validated.data)) {
            const unique = new Set(validated.data);
            if (unique.size !== validated.data.length) {
              logCalculatorWarning('[Calculator] Duplicate student loan plans not allowed');
              return;
            }
          }

          set((state) => ({ input: { ...state.input, studentLoanPlans: validated.data } }));
        },
        toggleStudentLoan: (plan) => {
          // Validate plan
          const planValidated = z
            .enum(['plan1', 'plan2', 'plan4', 'plan5', 'postgrad'])
            .safeParse(plan);

          if (!planValidated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid student loan plan:',
              planValidated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => {
            const currentPlans = state.input.studentLoanPlans;

            // If 'none', initialize with this plan
            if (currentPlans === 'none') {
              return { input: { ...state.input, studentLoanPlans: [planValidated.data] } };
            }

            // Toggle plan in array
            const plansArray = currentPlans as StudentLoanPlan[];
            const hasplan = plansArray.includes(planValidated.data);

            if (hasplan) {
              // Remove plan
              const newPlans = plansArray.filter((p) => p !== planValidated.data);
              return {
                input: {
                  ...state.input,
                  studentLoanPlans: newPlans.length === 0 ? 'none' : newPlans,
                },
              };
            }

            // Add plan (max 2)
            if (plansArray.length >= 2) {
              logCalculatorWarning('[Calculator] Maximum 2 student loans allowed');
              return state;
            }

            return {
              input: { ...state.input, studentLoanPlans: [...plansArray, planValidated.data] },
            };
          });
        },
        setNiCategory: (niCategory) => {
          // Validate NI category using extracted schema
          const validated = NICategorySchema.safeParse(niCategory);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid NI category:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({ input: { ...state.input, niCategory: validated.data } }));
        },
        setHoursPerWeek: (hoursPerWeek) => {
          // Validate hours per week
          const validated = z
            .number()
            .min(1, 'Hours per week must be greater than 0')
            .max(168, 'Hours per week cannot exceed 168')
            .finite('Hours per week must be a valid number')
            .safeParse(hoursPerWeek);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid hours per week:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }
          set((state) => ({ input: { ...state.input, hoursPerWeek: validated.data } }));
        },
        setAllowancesDeductions: (allowancesDeductions) => {
          // Validate allowances/deductions
          const validated = z
            .number()
            .min(-1_000_000, 'Allowances/deductions cannot be less than -£1M')
            .max(1_000_000, 'Allowances/deductions cannot exceed £1M')
            .finite('Allowances/deductions must be a valid number')
            .safeParse(allowancesDeductions);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid allowances/deductions:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }
          set((state) => ({ input: { ...state.input, allowancesDeductions: validated.data } }));
        },
        setInput: (partial) => {
          set((state) => ({
            input: { ...state.input, ...partial },
          }));
        },

        // Income Sources Management
        addIncomeSource: () => {
          // Guard: crypto.randomUUID is only available client-side
          if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
            logCalculatorWarning('[Calculator] Cannot add income source during SSR');
            return;
          }

          set((state) => ({
            input: {
              ...state.input,
              incomeSources: [
                ...state.input.incomeSources,
                {
                  id: crypto.randomUUID(),
                  type: 'pension',
                  amount: 0,
                  period: PERIODS.ANNUALLY,
                },
              ],
            },
          }));
        },

        updateIncomeSource: (id, updates) => {
          // Validate updates using schema
          const validated = IncomeSourceUpdateSchema.safeParse(updates);
          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid income source update:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({
            input: {
              ...state.input,
              incomeSources: state.input.incomeSources.map((source: IncomeSource) =>
                source.id === id ? { ...source, ...validated.data } : source,
              ),
            },
          }));
        },

        removeIncomeSource: (id) => {
          set((state) => ({
            input: {
              ...state.input,
              incomeSources: state.input.incomeSources.filter(
                (source: IncomeSource) => source.id !== id,
              ),
            },
          }));
        },

        // Calculation actions
        calculate: () => {
          const transaction = startPerformanceTransaction('calculate-tax', {
            operation: 'tax_calculation',
          });

          try {
            const { input } = get();

            // Set context for error tracking
            setContext('calculator_input', {
              salary: input.salary,
              taxYear: input.taxYear,
              region: input.region,
              taxCode: input.taxCode || 'default',
              studentLoanPlans: input.studentLoanPlans,
              pensionContribution: input.pensionContribution,
            });

            // Add breadcrumb
            addBreadcrumb('calculator', {
              message: 'Starting tax calculation',
              level: 'info',
              data: {
                salary: input.salary,
                taxYear: input.taxYear,
                region: input.region,
              },
            });

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

            // Track successful calculation
            addBreadcrumb('calculator', {
              message: 'Tax calculation completed',
              level: 'info',
              data: {
                netPay: results.netPay.annually,
                incomeTax: results.incomeTax.annually,
              },
            });

            // Analytics tracking (privacy-safe: no exact salary, skip if no salary)
            const salaryRange = getSalaryRange(input.salary);
            if (salaryRange) {
              trackCalculatorEvent('calculate', {
                tax_year: input.taxYear,
                region: input.region,
                has_student_loan: input.studentLoanPlans !== 'none',
                has_pension: input.pensionContribution > 0,
                salary_range: salaryRange,
              });
              trackCalculatorUsage('paye', salaryRange);
            }
          } catch (error) {
            // Log calculation errors for debugging
            console.error('Tax calculation error:', error);

            // Track error in Sentry
            const { input } = get();
            captureCalculatorError(error, {
              salary: input.salary,
              taxYear: input.taxYear,
              region: input.region,
              taxCode: input.taxCode,
              studentLoanPlans: input.studentLoanPlans,
              pensionContribution: input.pensionContribution,
              isMarried: input.isMarried,
            });

            // Reset results on error
            set({ results: null });
            throw error; // Re-throw to let UI handle it
          } finally {
            transaction?.end();
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
          // Validate what-if type using extracted schema
          const validated = WhatIfTypeSchema.safeParse(type);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid what-if type:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({
            whatIf: { ...state.whatIf, type: validated.data },
          }));
          // Don't auto-calculate - let user click Compare button
        },

        setWhatIfValue: (value) => {
          // Validate what-if value
          const validated = z
            .number()
            .finite('What-if value must be a valid number')
            .safeParse(value);

          if (!validated.success) {
            logCalculatorWarning(
              '[Calculator] Invalid what-if value:',
              validated.error.issues[0]?.message ?? 'Validation failed',
            );
            return;
          }

          set((state) => ({
            whatIf: { ...state.whatIf, value: validated.data },
          }));
          // Don't auto-calculate - let user click Compare button
        },

        calculateWhatIf: () => {
          try {
            const { input, whatIf } = get();

            const currentSalary = input.salary;

            // Don't calculate if no salary entered
            if (!currentSalary || currentSalary <= 0) {
              logCalculatorWarning('Cannot calculate What If: No current salary');
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

        /**
         * Clear What If scenario
         * Resets What If results and returns to normal calculation view
         */
        clearWhatIf: () => {
          set({
            whatIfResults: null,
            whatIf: {
              enabled: false,
              type: 'percentage',
              value: 10,
            },
          });
        },
      }),
      {
        name: 'tax-calculator-storage',
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          input: state.input,
          _savedAt: Date.now(),
          _taxYear: state.input.taxYear,
          // Don't persist calculation results
        }),
        merge: (
          persistedState: Partial<CalculatorState> | unknown,
          currentState: CalculatorState,
        ) => {
          // Merge persisted state with defaults for new fields
          const state = persistedState as Partial<CalculatorState> | undefined;
          return {
            ...currentState,
            input: {
              ...currentState.input,
              ...state?.input,
              // Ensure new fields have defaults if missing in persisted state
              incomeSources: state?.input?.incomeSources ?? [],
            },
          };
        },
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) return;

          const savedAt = (state as unknown as { _savedAt?: number })._savedAt;
          const savedTaxYear = (state as unknown as { _taxYear?: string })._taxYear;
          const currentTaxYear = getCurrentTaxYear();

          const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
          const isExpired = savedAt && Date.now() - savedAt > THIRTY_DAYS_MS;
          const wrongTaxYear = savedTaxYear && savedTaxYear !== currentTaxYear;

          if (isExpired) {
            useCalculatorStore.getState().reset();
            return;
          }

          if (wrongTaxYear) {
            useCalculatorStore.getState().setTaxYear(currentTaxYear);
          }
        },
      },
    ),
  ),
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
      setStudentLoanPlans: state.setStudentLoanPlans,
      toggleStudentLoan: state.toggleStudentLoan,
      setPensionContribution: state.setPensionContribution,
      setPensionContributionType: state.setPensionContributionType,
      setNiCategory: state.setNiCategory,
      setHoursPerWeek: state.setHoursPerWeek,
      setAllowancesDeductions: state.setAllowancesDeductions,
      setInput: state.setInput,
      addIncomeSource: state.addIncomeSource,
      updateIncomeSource: state.updateIncomeSource,
      removeIncomeSource: state.removeIncomeSource,
      calculate: state.calculate,
      calculatePreviousYear: state.calculatePreviousYear,
      reset: state.reset,
      toggleWhatIf: state.toggleWhatIf,
      setWhatIfType: state.setWhatIfType,
      setWhatIfValue: state.setWhatIfValue,
      calculateWhatIf: state.calculateWhatIf,
      clearWhatIf: state.clearWhatIf,
    })),
  );

// Selector for What If state
export const useWhatIf = () => useCalculatorStore((state) => state.whatIf);

// Selector for What If results
export const useWhatIfResults = () => useCalculatorStore((state) => state.whatIfResults);

// Export types and constants
export type { IncomeSource };
export { INCOME_TYPE_LABELS };
