// src/lib/validation/emailValidation.ts
/**
 * Centralized Zod schemas for email-related API routes.
 * Consolidates validation from:
 * - /api/send-results
 * - /api/send-director-results
 * - /api/newsletter/subscribe
 * - /api/referral/lead
 */

import { z } from 'zod';
import { PERIODS, TAX_YEARS } from '@/constants/taxRates';
import { CurrencyAmountSchema, DirectorTaxYearSchema, RegionSchema } from './directorValidation';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

/**
 * Email address validation - reusable across all email-related schemas
 */
export const EmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email must be 254 characters or less');

/**
 * Tax year string validation
 * Constrained to prevent HTML injection when interpolated into emails
 * Accepts: "2024-25", "2025-26", "2024-2025", "2025-2026" patterns
 */
export const TaxYearStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2,4}$/, 'Invalid tax year format')
  .optional();

// ============================================================================
// PAYE CALCULATOR EMAIL SCHEMAS
// ============================================================================

// Reasonable bounds for PAYE values (prevents abuse/garbage)
const payeMoneyField = z.number().finite().min(0).max(10_000_000);
const payeRateField = z.number().finite().min(0).max(100);
const payeAllowanceField = z.number().finite().min(-1_000_000).max(1_000_000);

const payePeriods = Object.values(PERIODS) as [string, ...string[]];
const payeTaxYears = TAX_YEARS as [string, ...string[]];

const StudentLoanPlanSchema = z.enum(['plan1', 'plan2', 'plan4', 'plan5', 'postgrad']);
const StudentLoanSelectionSchema = z
  .union([
    z.literal('none'),
    z.array(StudentLoanPlanSchema).max(2, 'Maximum 2 student loans allowed'),
  ])
  .refine(
    (value) => value === 'none' || new Set(value).size === value.length,
    'Duplicate student loan plans not allowed',
  );

const IncomeSourceTypeSchema = z.enum([
  'employment',
  'pension',
  'statePension',
  'rental',
  'investment',
  'other',
]);

/**
 * Pay period values for tax calculation results
 * All monetary fields bounded 0-10M
 */
export const PayPeriodValuesSchema = z.object({
  annually: payeMoneyField,
  monthly: payeMoneyField,
  weekly: payeMoneyField.optional(),
  daily: payeMoneyField.optional(),
  hourly: payeMoneyField.optional(),
});

/**
 * Tax band breakdown for results
 */
export const TaxBandSchema = z.object({
  name: z.string().max(50),
  rate: payeRateField,
  amount: payeMoneyField,
});

/**
 * Full PAYE calculator results for email
 */
export const PayeResultsSchema = z.object({
  grossSalary: PayPeriodValuesSchema,
  incomeTax: PayPeriodValuesSchema,
  nationalInsurance: PayPeriodValuesSchema,
  pensionContribution: PayPeriodValuesSchema,
  studentLoan: PayPeriodValuesSchema,
  netPay: PayPeriodValuesSchema,
  taxFreeAmount: payeMoneyField.optional(),
  taxableIncome: payeMoneyField.optional(),
  employerNI: payeMoneyField.optional(),
  taxBands: z.array(TaxBandSchema).optional(),
});

/**
 * Input schema for PAYE email requests (server recomputes results)
 */
export const PayeEmailInputSchema = z.object({
  salary: payeMoneyField,
  payPeriod: z.enum(payePeriods),
  taxYear: z.enum(payeTaxYears),
  taxCode: z.string().max(20),
  isScottish: z.boolean(),
  isMarried: z.boolean(),
  partnerGrossWage: payeMoneyField,
  isBlind: z.boolean(),
  age: z.number().int().min(0).max(120).optional(),
  payNoNI: z.boolean(),
  pensionContribution: payeMoneyField,
  pensionContributionType: z.enum(['percentage', 'amount']),
  studentLoanPlans: StudentLoanSelectionSchema,
  niCategory: z.enum(['A', 'B', 'C', 'H', 'J', 'M', 'Z']),
  hoursPerWeek: z.number().min(1).max(168).finite(),
  allowancesDeductions: payeAllowanceField,
  incomeSources: z
    .array(
      z.object({
        type: IncomeSourceTypeSchema,
        amount: payeMoneyField,
        period: z.enum(payePeriods),
        label: z.string().max(100).optional(),
        id: z.string().max(100).optional(),
      }),
    )
    .max(10, 'Maximum 10 income sources allowed')
    .optional(),
});

/**
 * Request body for /api/send-results
 */
export const SendResultsRequestSchema = z
  .object({
    email: EmailSchema,
    input: PayeEmailInputSchema,
    subscribeToAlerts: z.boolean().optional(),
  })
  .strict();

// ============================================================================
// DIRECTOR CALCULATOR EMAIL SCHEMAS
// ============================================================================

// Reasonable bounds for director calculator values (prevents abuse/garbage)
const MAX_MONEY = 10_000_000; // £10M max
const moneyField = z.number().finite().min(0).max(MAX_MONEY);
const rateField = z.number().finite().min(0).max(100);

/**
 * Director strategy results for email
 * All monetary fields bounded 0-10M, rates 0-100%
 */
export const DirectorStrategySchema = z.object({
  name: z.string().max(100),
  salary: moneyField,
  dividends: moneyField,
  pension: moneyField,
  companyCarBIK: moneyField,
  employerNI: moneyField,
  employeeNI: moneyField,
  incomeTax: moneyField,
  corporationTax: moneyField,
  dividendTax: moneyField,
  studentLoan: moneyField,
  totalPersonalTax: moneyField,
  companyCost: moneyField,
  takeHome: moneyField,
  effectiveRate: rateField,
});

/**
 * All strategies comparison for comprehensive director email
 */
export const AllStrategiesSchema = z.object({
  allSalary: DirectorStrategySchema,
  optimalMix: DirectorStrategySchema,
  allDividends: DirectorStrategySchema,
});

/**
 * Input schema for director email requests (server recomputes results)
 */
export const DirectorEmailInputSchema = z.object({
  mode: z.enum(['annual', 'monthly']).optional(),
  region: RegionSchema,
  revenue: CurrencyAmountSchema,
  includesVat: z.boolean(),
  expenses: CurrencyAmountSchema,
  lossesBroughtForward: CurrencyAmountSchema.optional(),
  otherIncome: CurrencyAmountSchema.optional(),
  employmentAllowance: z.boolean().optional(),
  studentLoanPlans: z.array(StudentLoanPlanSchema).max(2).optional(),
  pensionContribution: CurrencyAmountSchema.optional(),
  companyCarBIK: CurrencyAmountSchema.optional(),
  minimumSalaryRequirement: CurrencyAmountSchema.optional(),
  hasOtherPAYEEmployment: z.boolean().optional(),
  ytdSalary: CurrencyAmountSchema.optional(),
  ytdDividends: CurrencyAmountSchema.optional(),
  ytdDrawings: CurrencyAmountSchema.optional(),
  yourSetupSalary: CurrencyAmountSchema.optional(),
  yourSetupDividends: CurrencyAmountSchema.optional(),
  monthlyIncome: CurrencyAmountSchema.optional(),
  monthlyExpenses: CurrencyAmountSchema.optional(),
  contractStartMonth: z.number().int().min(1).max(12).optional(),
  cashInBank: CurrencyAmountSchema.optional(),
  minimumMonthlyDraw: CurrencyAmountSchema.optional(),
  runwayMonths: z.number().int().min(0).max(36).optional(),
});

/**
 * Request body for /api/send-director-results
 */
export const SendDirectorResultsRequestSchema = z
  .object({
    email: EmailSchema,
    input: DirectorEmailInputSchema,
    taxYear: DirectorTaxYearSchema.optional(),
  })
  .strict();

// ============================================================================
// NEWSLETTER SCHEMAS
// ============================================================================

/**
 * Request body for /api/newsletter/subscribe
 */
export const NewsletterSubscribeRequestSchema = z
  .object({
    email: EmailSchema,
  })
  .strict();

// ============================================================================
// REFERRAL SCHEMAS
// ============================================================================

/**
 * Salary range options for referral leads
 */
export const SalaryRangeSchema = z.enum(['75k-100k', '100k-125k', '125k+']);

/**
 * Referral reason options
 */
export const ReferralReasonSchema = z.enum([
  'tax-trap',
  'high-earner',
  'scottish-high',
  'additional-rate',
]);

/**
 * Request body for /api/referral/lead
 */
export const ReferralLeadRequestSchema = z
  .object({
    email: EmailSchema,
    salaryRange: SalaryRangeSchema,
    reason: ReferralReasonSchema,
    isScottish: z.boolean(),
  })
  .strict();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PayPeriodValues = z.infer<typeof PayPeriodValuesSchema>;
export type TaxBand = z.infer<typeof TaxBandSchema>;
export type PayeResults = z.infer<typeof PayeResultsSchema>;
export type PayeEmailInput = z.infer<typeof PayeEmailInputSchema>;
export type SendResultsRequest = z.infer<typeof SendResultsRequestSchema>;
export type DirectorStrategy = z.infer<typeof DirectorStrategySchema>;
export type DirectorEmailInput = z.infer<typeof DirectorEmailInputSchema>;
export type SendDirectorResultsRequest = z.infer<typeof SendDirectorResultsRequestSchema>;
export type NewsletterSubscribeRequest = z.infer<typeof NewsletterSubscribeRequestSchema>;
export type SalaryRange = z.infer<typeof SalaryRangeSchema>;
export type ReferralReason = z.infer<typeof ReferralReasonSchema>;
export type ReferralLeadRequest = z.infer<typeof ReferralLeadRequestSchema>;

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

/**
 * Human-readable labels for referral reasons
 */
export const REFERRAL_REASON_LABELS: Record<ReferralReason, string> = {
  'tax-trap': '£100k Tax Trap (Personal Allowance Taper)',
  'high-earner': 'High Earner (£75k-£100k)',
  'scottish-high': 'Scottish High Earner',
  'additional-rate': 'Additional Rate Taxpayer (£125k+)',
};
