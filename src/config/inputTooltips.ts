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

  // Director Intelligence Inputs
  directorRevenue: {
    title: 'Annual Revenue',
    description: 'Total company revenue for the year before expenses',
    note: 'Use your expected turnover or last 12 months of sales',
  },

  directorIncludesVat: {
    title: 'Revenue Includes VAT',
    description: 'Indicate if your revenue figure includes VAT',
    note: 'We do not remove VAT in calculations; it only affects VAT warnings',
  },

  directorExpenses: {
    title: 'Business Expenses',
    description: 'Allowable company expenses excluding your own salary',
    note: 'Include overheads, contractors, software, rent, and other costs',
  },

  directorMonthlyIncome: {
    title: 'Monthly Contract Income',
    description: 'Typical gross monthly invoicing for your current contract(s)',
    note: 'Used to project annual revenue for the remaining tax-year months',
  },

  directorMonthlyExpenses: {
    title: 'Monthly Business Expenses',
    description: 'Typical monthly company costs excluding your own salary',
    note: 'Used with runway and cash buffer logic to estimate a safe monthly draw',
  },

  directorContractStartMonth: {
    title: 'Contract Start Month',
    description: 'Month your current revenue level started in this tax year',
    note: 'We project from this month through March using a flat monthly assumption',
  },

  directorCashInBank: {
    title: 'Cash In Bank',
    description: 'Current company cash available to fund operations and drawings',
    note: 'Use real cash, not retained earnings from accounts',
  },

  directorMinimumMonthlyDraw: {
    title: 'Minimum Monthly Draw',
    description: 'Minimum monthly amount you need personally',
    note: 'Used as the personal floor when balancing buffer safety and tax outputs',
  },

  directorRunwayMonths: {
    title: 'Runway Target',
    description: 'Number of months of coverage you want in reserve',
    note: 'Required buffer = runway months × (minimum draw + monthly expenses)',
  },

  directorYearEnd: {
    title: 'Company Year-End',
    description: 'Your company accounting period end date',
    note: 'Used to estimate corporation tax deadlines and key dates',
  },

  directorYtdSalary: {
    title: 'YTD Salary',
    description: 'Salary already paid to you in this tax year',
    note: 'We subtract this from your remaining salary allowance',
  },

  directorYtdDividends: {
    title: 'YTD Dividends',
    description: 'Dividends already declared this tax year',
    note: 'Reduces the remaining dividend headroom for the year',
  },

  directorYtdDrawings: {
    title: 'Other Drawings',
    description: 'Withdrawals not treated as salary or dividends',
    note: "Often director's loan account movements or ad-hoc withdrawals",
  },

  directorOtherIncome: {
    title: 'Other Personal Income',
    description: 'Personal income outside the company',
    note: 'Employment, rental, or investment income affects dividend tax bands',
  },

  directorOtherPAYE: {
    title: 'Other PAYE Employment',
    description: 'Whether you have another PAYE job elsewhere',
    note: 'If yes, NI calculations may differ from these estimates',
  },

  directorEmploymentAllowance: {
    title: 'Employment Allowance',
    description: 'Claim the Employment Allowance against Employer NI',
    note: "Not available if you're the only director/employee in most cases",
  },

  directorStudentLoans: {
    title: 'Student Loans',
    description: 'Student loan plans you repay via Self Assessment',
    note: "Plan 1: Before Sept 2012 (England/Wales)\nPlan 2: After Sept 2012 (England/Wales)\nPlan 4: Scotland\nPostgraduate: Master's or PhD loan",
  },

  directorPension: {
    title: 'Employer Pension',
    description: 'Company pension contributions paid on your behalf',
    note: 'These reduce company profit and corporation tax',
  },

  directorPensionDeducted: {
    title: 'Pension Already Deducted',
    description: 'Whether your profit figure already includes pension costs',
    note: 'Check this to avoid deducting the pension twice',
  },

  directorCompanyCar: {
    title: 'Company Car BIK',
    description: 'Taxable Benefit-in-Kind value of a company car',
    note: 'Use the P11D benefit amount for the year',
  },

  directorLosses: {
    title: 'Losses Brought Forward',
    description: 'Trading losses carried forward from prior years',
    note: 'Offsets taxable profit before corporation tax',
  },

  directorMinimumSalary: {
    title: 'Minimum Salary',
    description: 'Minimum salary you want to take regardless of tax efficiency',
    note: 'Useful for mortgage, visa, or income proof requirements',
  },

  directorYourSalary: {
    title: 'Your Current Salary',
    description: 'Your existing annual salary from the company',
    note: 'Used to compare your mix against the recommended option',
  },

  directorYourDividends: {
    title: 'Your Current Dividends',
    description: 'Your existing annual dividends from the company',
    note: 'Used to compare your mix against the recommended option',
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
