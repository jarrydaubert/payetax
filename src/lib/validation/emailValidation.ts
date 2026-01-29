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
 * Tax year string validation (e.g., "2025-2026" or "2025-26")
 */
export const TaxYearStringSchema = z.string().optional();

// ============================================================================
// PAYE CALCULATOR EMAIL SCHEMAS
// ============================================================================

/**
 * Pay period values for tax calculation results
 */
export const PayPeriodValuesSchema = z.object({
  annually: z.number(),
  monthly: z.number(),
  weekly: z.number().optional(),
  daily: z.number().optional(),
  hourly: z.number().optional(),
});

/**
 * Tax band breakdown for results
 */
export const TaxBandSchema = z.object({
  name: z.string(),
  rate: z.number(),
  amount: z.number(),
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
  taxFreeAmount: z.number().optional(),
  taxableIncome: z.number().optional(),
  employerNI: z.number().optional(),
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

/**
 * Director strategy results for email
 */
export const DirectorStrategySchema = z.object({
  name: z.string(),
  salary: z.number(),
  dividends: z.number(),
  pension: z.number(),
  companyCarBIK: z.number(),
  employerNI: z.number(),
  employeeNI: z.number(),
  incomeTax: z.number(),
  corporationTax: z.number(),
  dividendTax: z.number(),
  studentLoan: z.number(),
  totalPersonalTax: z.number(),
  companyCost: z.number(),
  takeHome: z.number(),
  effectiveRate: z.number(),
});

/**
 * Request body for /api/send-director-results
 */
export const SendDirectorResultsRequestSchema = z.object({
  email: EmailSchema,
  results: z.object({
    grossProfit: z.number(),
    strategy: DirectorStrategySchema,
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
