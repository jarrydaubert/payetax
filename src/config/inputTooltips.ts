/**
 * Input Tooltips Configuration
 *
 * Centralized tooltip content for all calculator inputs.
 * Provides clear guidance without overwhelming users.
 *
 * Format:
 * - title: Short label for the input
 * - description: What this input is for
 * - note: Additional context or guidance (not necessarily official HMRC text)
 *
 * Uses Zod for runtime validation to ensure tooltip integrity (PAYTAX-128)
 *
 * @module config/inputTooltips
 */

import { z } from 'zod';

/**
 * Zod Schema for Tooltip Content
 * Validates tooltip structure and content requirements
 */
export const TooltipContentSchema = z.object({
  title: z.string().min(1, 'Tooltip title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  note: z.string().min(10, 'Note must be at least 10 characters').optional(),
});

/** Tooltip content structure - inferred from Zod schema for single source of truth */
export type TooltipContent = z.infer<typeof TooltipContentSchema>;

export const INPUT_TOOLTIPS = {
  // Basic Inputs
  salary: {
    title: 'Gross Salary',
    description: 'Your total earnings before tax and deductions',
    note: 'Include salary, bonuses, and commission',
  },

  payPeriod: {
    title: 'Pay Period',
    description: 'How often you receive your salary',
    note: 'Choose the frequency shown on your payslip',
  },

  taxYear: {
    title: 'Tax Year',
    description: 'The HMRC tax year to use for calculations',
    note: 'Tax year runs from 6 April to 5 April',
  },

  taxCode: {
    title: 'Tax Code',
    description: 'Your HMRC tax code (e.g., 1257L)',
    note: 'Found on your payslip or P45. Determines your tax-free allowance',
  },

  region: {
    title: 'Tax Region',
    description: 'Your tax region based on residency status',
    note: 'Scottish taxpayers have different income tax bands',
  },

  hoursPerWeek: {
    title: 'Hours Worked',
    description: 'Average hours you work each week',
    note: 'Used to calculate your hourly rate',
  },

  // Pension Inputs
  pensionContribution: {
    title: 'Pension Contribution',
    description: 'Your voluntary pension contributions',
    note: 'Salary sacrifice can reduce taxable income and National Insurance',
  },

  pensionType: {
    title: 'Contribution Type',
    description: 'How you want to specify your pension',
    note: 'Percentage applies to gross salary, amount is a fixed £ value',
  },

  // Deductions & Allowances
  studentLoanPlan: {
    title: 'Student Loan Plan',
    description: 'Your student loan repayment plan type',
    note: "Plan 1: Before Sept 2012 (England/Wales)\nPlan 2: After Sept 2012 (England/Wales)\nPlan 4: Scotland\nPostgraduate: Master's or PhD loan",
  },

  niCategory: {
    title: 'National Insurance Category',
    description: 'Your NI contribution category',
    note: 'Category A: Standard (most employees)\nCategory B: Married women (reduced rate)\nCategory C: Over state pension age\nCategory H: Apprentices under 25',
  },

  marriageAllowance: {
    title: 'Marriage Allowance',
    description: 'Transfer unused Personal Allowance to your partner',
    note: 'You may be eligible if you have unused Personal Allowance and your partner is not a higher-rate taxpayer',
  },

  partnerGrossWage: {
    title: "Partner's Gross Wage",
    description: "Your partner's annual salary before tax",
    note: 'Required to calculate Marriage Allowance eligibility',
  },

  blindAllowance: {
    title: "Blind Person's Allowance",
    description: 'Additional tax-free allowance if registered blind',
    note: 'You may be entitled to an additional tax-free allowance if registered blind or severely sight impaired',
  },

  age: {
    title: 'Age',
    description: 'Your age range for NI calculations',
    note: 'Over State Pension age: No National Insurance contributions\nUnder State Pension age: Full NI rates apply',
  },

  payNoNI: {
    title: 'No National Insurance',
    description: 'Check if you do not pay National Insurance',
    note: 'Usually applies if you are over State Pension age',
  },

  allowancesDeductions: {
    title: 'Non-taxable Allowance(s)',
    description: 'Extra pay shown as non-taxable on your payslip',
    note: "Only include items your employer marks as non-taxable (e.g., reimbursed expenses or 'Home Base'). This adds to take-home but does not reduce taxable income.",
  },

  // What If Inputs
  whatIfType: {
    title: 'What If Scenario Type',
    description: 'How you want to model a salary change',
    note: 'Percentage: E.g., +10% raise\nAmount: E.g., +£5,000 bonus\nTotal: E.g., new job at £50,000',
  },

  whatIfValue: {
    title: 'What If Value',
    description: 'The amount of change to model',
    note: 'Positive for increase, negative for decrease',
  },
} as const;

/** Type-safe field name for tooltips - ensures compile-time validation */
export type TooltipFieldName = keyof typeof INPUT_TOOLTIPS;

/**
 * Get tooltip content for a specific input field
 *
 * @param fieldName - The name of the input field
 * @returns Tooltip content object or undefined if not found
 */
export function getTooltipContent(fieldName: string): TooltipContent | undefined {
  if (Object.hasOwn(INPUT_TOOLTIPS, fieldName)) {
    // Type assertion is safe after hasOwn check
    return INPUT_TOOLTIPS[fieldName as TooltipFieldName];
  }
  return undefined;
}

/**
 * Check if a field has tooltip content available
 * Uses hasOwnProperty to avoid prototype key hazards
 *
 * @param fieldName - The name of the input field
 * @returns True if tooltip content exists
 */
export function hasTooltip(fieldName: string): boolean {
  return Object.hasOwn(INPUT_TOOLTIPS, fieldName);
}

/**
 * Runtime Validation (PAYTAX-128)
 * Validates all tooltips on module load to catch content errors early
 *
 * - Runs in development and production builds
 * - Skip with SKIP_CONFIG_VALIDATION=true
 * - Detailed logging only in development
 */
const shouldValidate =
  process.env.NODE_ENV !== 'test' && process.env.SKIP_CONFIG_VALIDATION !== 'true';

if (shouldValidate) {
  const isDev = process.env.NODE_ENV === 'development';

  for (const [fieldName, tooltip] of Object.entries(INPUT_TOOLTIPS)) {
    const result = TooltipContentSchema.safeParse(tooltip);
    if (!result.success) {
      if (isDev) console.error(`❌ Tooltip "${fieldName}" is invalid:`, result.error.issues);
      throw new Error(`Invalid tooltip content for field: ${fieldName}`);
    }
  }
}
