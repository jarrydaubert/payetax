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

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

/**
 * Email address validation - reusable across all email-related schemas
 */
export const EmailSchema = z.string().email('Please enter a valid email address');

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
 * Request body for /api/send-results
 */
export const SendResultsRequestSchema = z.object({
  email: EmailSchema,
  results: PayeResultsSchema,
  taxYear: TaxYearStringSchema,
  subscribeToAlerts: z.boolean().optional(),
});

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
 * Request body for /api/send-director-results
 */
export const SendDirectorResultsRequestSchema = z.object({
  email: EmailSchema,
  results: z.object({
    grossProfit: moneyField,
    strategies: AllStrategiesSchema,
    recommended: z.enum(['allSalary', 'optimalMix', 'allDividends']),
    savingsVsAllSalary: moneyField,
  }),
  taxYear: TaxYearStringSchema,
});

// ============================================================================
// NEWSLETTER SCHEMAS
// ============================================================================

/**
 * Request body for /api/newsletter/subscribe
 */
export const NewsletterSubscribeRequestSchema = z.object({
  email: EmailSchema,
});

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
export const ReferralLeadRequestSchema = z.object({
  email: EmailSchema,
  salaryRange: SalaryRangeSchema,
  reason: ReferralReasonSchema,
  isScottish: z.boolean(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PayPeriodValues = z.infer<typeof PayPeriodValuesSchema>;
export type TaxBand = z.infer<typeof TaxBandSchema>;
export type PayeResults = z.infer<typeof PayeResultsSchema>;
export type SendResultsRequest = z.infer<typeof SendResultsRequestSchema>;
export type DirectorStrategy = z.infer<typeof DirectorStrategySchema>;
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
