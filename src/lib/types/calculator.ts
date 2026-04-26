// src/lib/types/calculator.ts
/**
 * Shared types for calculator functionality.
 * Moved here to avoid circular dependencies between store and lib.
 */

import { z } from 'zod';
import {
  type NICategory,
  type PayPeriod,
  PERIODS,
  type StudentLoanSelection,
  type TaxYear,
} from '@/constants/taxRates';

/**
 * Shared income source kinds used by the calculator store and tax engine.
 */
export const INCOME_SOURCE_TYPES = [
  'employment',
  'pension',
  'statePension',
  'rental',
  'investment',
  'other',
] as const;

export type IncomeSourceType = (typeof INCOME_SOURCE_TYPES)[number];

/**
 * Represents an additional income source for multi-income calculations.
 * Used for pensioners and those with multiple income streams.
 */
export interface IncomeSource {
  /** Unique identifier for React keys and list management */
  id: string;
  /** Type of income (determines NI treatment) */
  type: IncomeSourceType;
  /** Optional user-friendly label (e.g., "Pension from Previous Job") */
  label?: string;
  /** Amount of income */
  amount: number;
  /** How often this income is received */
  period: PayPeriod;
}

/**
 * Human-readable labels for income types
 */
export const INCOME_TYPE_LABELS = {
  employment: 'Employment Income',
  pension: 'Private Pension',
  statePension: 'State Pension',
  rental: 'Rental Income',
  investment: 'Investment Income',
  other: 'Other Income',
} as const satisfies Record<IncomeSourceType, string>;

/**
 * Pay period values for validation (derived from PERIODS constant)
 */
const PAY_PERIOD_VALUES = Object.values(PERIODS) as [PayPeriod, ...PayPeriod[]];

/**
 * Zod schema for validating partial income source updates.
 * All fields are optional since this is used for partial updates.
 */
export const IncomeSourceUpdateSchema = z.object({
  type: z.enum(INCOME_SOURCE_TYPES).optional(),
  label: z.string().max(100, 'Label too long').optional(),
  amount: z.number().finite().nonnegative('Amount cannot be negative').optional(),
  period: z.enum(PAY_PERIOD_VALUES).optional(),
});

/**
 * Shared input contract for the PAYE calculator engine.
 */
export interface TaxCalculationInput {
  /** Gross salary amount */
  salary: number;
  /** Period of the salary (annual, monthly, etc.) */
  payPeriod: PayPeriod;
  /** Tax year for calculation */
  taxYear: TaxYear;
  /** Tax code (e.g., "1257L") */
  taxCode: string;
  /** Whether Scottish tax rates apply */
  isScottish: boolean;
  /** Whether married/civil partnership for marriage allowance */
  isMarried: boolean;
  /** Partner's gross wage for marriage allowance calculation */
  partnerGrossWage: number;
  /** Whether blind person's allowance applies */
  isBlind: boolean;
  /** Age of the taxpayer (for age-related allowances) */
  age?: number;
  /** Whether paying no National Insurance */
  payNoNI: boolean;
  /** Pension contribution amount or percentage */
  pensionContribution: number;
  /** Type of pension contribution (percentage or fixed amount) */
  pensionContributionType: 'percentage' | 'amount';
  /** Student loan plans that apply (can be multiple) */
  studentLoanPlans: StudentLoanSelection;
  /** National Insurance category */
  niCategory: NICategory;
  /** Hours worked per week (for hourly calculations) */
  hoursPerWeek: number;
  /** Additional income sources beyond primary employment */
  incomeSources?: IncomeSource[];
  /**
   * Non-taxable allowances paid to you (annual total).
   *
   * Intended for payslip items that increase take-home but are NOT taxed/NI'd
   * (e.g., reimbursed expenses shown as non-taxable).
   */
  allowancesDeductions?: number;
}

/**
 * Single tax band row in the calculator output.
 */
export interface TaxBandBreakdown {
  name: string;
  rate: number;
  amount: number;
}

/**
 * Shared output contract for PAYE calculator results.
 */
export interface TaxCalculationResults {
  /** Gross salary across different periods */
  grossSalary: Record<PayPeriod, number>;
  /** Tax-free allowance amount */
  taxFreeAmount: number;
  /** Tax-free allowance amounts for payroll display periods when they differ from annual averaging */
  taxFreeAmountByPeriod?: Partial<Record<PayPeriod, number>>;
  /** Taxable income after allowances and deductions */
  taxableIncome: number;

  /** Income tax amounts for each period */
  incomeTax: Record<PayPeriod, number>;
  /** National Insurance contributions for each period */
  nationalInsurance: Record<PayPeriod, number>;
  /** Student loan repayments for each period */
  studentLoan: Record<PayPeriod, number>;

  /** Pension contributions for each period */
  pensionContribution: Record<PayPeriod, number>;
  /** Employer's NI contribution (annual) */
  employerNI: number;
  /** Net take-home pay for each period */
  netPay: Record<PayPeriod, number>;

  /** Breakdown of tax bands applied */
  taxBands: TaxBandBreakdown[];
  /** Breakdown of income by source (if multiple income sources exist) */
  incomeBreakdown?: {
    employment: number;
    nonEmployment: number;
    total: number;
  };
}
