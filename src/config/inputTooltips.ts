/**
 * Input Tooltips Configuration
 *
 * Centralized tooltip content for all calculator inputs.
 * Uses HMRC-style wording to provide clear, official guidance
 * without overwhelming users.
 *
 * Format:
 * - title: Short label for the input
 * - description: What this input is for
 * - hmrc: Official HMRC guidance or additional context
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
  hmrc: z.string().min(10, 'HMRC guidance must be at least 10 characters').optional(),
});

export interface TooltipContent {
  /** Short title for the tooltip */
  title: string;
  /** Main description of what this input does */
  description: string;
  /** HMRC guidance or additional helpful context */
  hmrc?: string;
}

export const INPUT_TOOLTIPS: Record<string, TooltipContent> = {
  // Basic Inputs
  salary: {
    title: 'Gross Salary',
    description: 'Your total earnings before tax and deductions',
    hmrc: 'Include salary, bonuses, and commission',
  },

  payPeriod: {
    title: 'Pay Period',
    description: 'How often you receive your salary',
    hmrc: 'Choose the frequency shown on your payslip',
  },

  taxYear: {
    title: 'Tax Year',
    description: 'The HMRC tax year to use for calculations',
    hmrc: 'Tax year runs from 6 April to 5 April',
  },

  taxCode: {
    title: 'Tax Code',
    description: 'Your HMRC tax code (e.g., 1257L)',
    hmrc: 'Found on your payslip or P45. Determines your tax-free allowance',
  },

  region: {
    title: 'Tax Region',
    description: 'Where you work determines your tax rates',
    hmrc: 'Scotland has different income tax bands',
  },

  hoursPerWeek: {
    title: 'Hours Worked',
    description: 'Average hours you work each week',
    hmrc: 'Used to calculate your hourly rate',
  },

  // Pension Inputs
  pensionContribution: {
    title: 'Pension Contribution',
    description: 'Your voluntary pension contributions',
    hmrc: 'Salary sacrifice reduces taxable income and National Insurance',
  },

  pensionType: {
    title: 'Contribution Type',
    description: 'How you want to specify your pension',
    hmrc: 'Percentage applies to gross salary, amount is a fixed £ value',
  },

  // Deductions & Allowances
  studentLoanPlan: {
    title: 'Student Loan Plan',
    description: 'Your student loan repayment plan type',
    hmrc: "Plan 1: Before Sept 2012 (England/Wales)\nPlan 2: After Sept 2012 (England/Wales)\nPlan 4: Scotland\nPostgraduate: Master's or PhD loan",
  },

  niCategory: {
    title: 'National Insurance Category',
    description: 'Your NI contribution category',
    hmrc: 'Category A: Standard (most employees)\nCategory B: Married women (reduced rate)\nCategory C: Over state pension age\nCategory H: Apprentices under 25',
  },

  marriageAllowance: {
    title: 'Marriage Allowance',
    description: 'Transfer unused Personal Allowance to your partner',
    hmrc: 'Available if you earn under £12,570 and your partner is a basic rate taxpayer',
  },

  partnerGrossWage: {
    title: "Partner's Gross Wage",
    description: "Your partner's annual salary before tax",
    hmrc: 'Required to calculate Marriage Allowance eligibility',
  },

  blindAllowance: {
    title: "Blind Person's Allowance",
    description: 'Additional tax-free allowance if registered blind',
    hmrc: 'Extra £2,870 tax-free allowance (2024-25)',
  },

  age: {
    title: 'Age',
    description: 'Your age range for NI calculations',
    hmrc: 'State pension age (currently 66-67): No National Insurance contributions\nUnder state pension age: Full NI rates apply',
  },

  payNoNI: {
    title: 'No National Insurance',
    description: 'Check if you do not pay National Insurance',
    hmrc: 'Usually applies if you are over state pension age',
  },

  allowancesDeductions: {
    title: 'Other Allowances/Deductions',
    description: 'Additional annual allowances or deductions',
    hmrc: 'E.g., professional subscriptions, uniform costs',
  },

  // What If Inputs
  whatIfType: {
    title: 'What If Scenario Type',
    description: 'How you want to model a salary change',
    hmrc: 'Percentage: E.g., +10% raise\nAmount: E.g., +£5,000 bonus\nTotal: E.g., new job at £50,000',
  },

  whatIfValue: {
    title: 'What If Value',
    description: 'The amount of change to model',
    hmrc: 'Positive for increase, negative for decrease',
  },
};

/**
 * Get tooltip content for a specific input field
 *
 * @param fieldName - The name of the input field
 * @returns Tooltip content object or undefined if not found
 */
export function getTooltipContent(fieldName: string): TooltipContent | undefined {
  return INPUT_TOOLTIPS[fieldName];
}

/**
 * Check if a field has tooltip content available
 *
 * @param fieldName - The name of the input field
 * @returns True if tooltip content exists
 */
export function hasTooltip(fieldName: string): boolean {
  return fieldName in INPUT_TOOLTIPS;
}

/**
 * Runtime Validation (PAYTAX-128)
 * Validates all tooltips on module load to catch content errors early
 */
if (process.env.NODE_ENV !== 'test') {
  for (const [fieldName, tooltip] of Object.entries(INPUT_TOOLTIPS)) {
    const result = TooltipContentSchema.safeParse(tooltip);
    if (!result.success) {
      console.error(`❌ Tooltip "${fieldName}" is invalid:`, result.error.issues);
      throw new Error(`Invalid tooltip content for field: ${fieldName}`);
    }
  }
}
