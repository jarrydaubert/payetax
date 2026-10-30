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
  salary: {
    title: 'Gross Salary',
    description: 'Your total earnings before tax and deductions, for the pay period selected.',
    note: 'Include salary, bonuses and commission.',
  },
  payPeriod: {
    title: 'Pay Period',
    description: 'Choose the period your salary figure covers, such as a month or a year.',
  },
  taxYear: {
    title: 'Tax Year',
    description:
      'Choose the year you want to calculate. A UK tax year runs from 6 April to 5 April the following year.',
  },
  taxCode: {
    title: 'Tax Code',
    description: 'Use the code on your payslip, P45 or HMRC account, such as 1257L.',
    note: 'You can leave this blank to estimate using the allowances for your income, region and selected tax year.',
  },
  region: {
    title: 'Tax Region',
    description: 'Choose where you live for tax purposes. Scotland has different Income Tax bands.',
  },
  hoursPerWeek: {
    title: 'Hours Worked',
    description: 'Your usual weekly working hours, used to work out hourly pay.',
  },
  pensionContribution: {
    title: 'Pension',
    description:
      'Enter your own contribution as % of gross salary or £ for the selected pay period. Changing between % and £ resets it to 0.',
    note: 'We use salary sacrifice to estimate pension deductions.',
  },
  pensionType: {
    title: 'Contribution Type',
    description:
      'Choose % of your gross salary or a £ amount for the selected pay period. Changing between them resets your contribution to 0.',
  },
  studentLoanPlan: {
    title: 'Student Loan Plan',
    description:
      'Choose the plan shown in your student loan account. If you also repay a postgraduate loan, add it using the checkbox.',
  },
  niCategory: {
    title: 'National Insurance Category',
    description:
      'Use the National Insurance category letter on your payslip. A is the standard category for most employees.',
  },
  marriageAllowance: {
    title: 'Marriage Allowance',
    description:
      "Select if you are married or in a civil partnership. Enter your partner's annual pay so we can check whether a Marriage Allowance transfer could apply.",
  },
  partnerGrossWage: {
    title: "Partner's Gross Wage",
    description:
      "Your partner's yearly pay before tax, used to check Marriage Allowance eligibility.",
  },
  blindAllowance: {
    title: "Blind Person's Allowance",
    description:
      "Select if you qualify for Blind Person's Allowance, which increases the income you can receive before paying Income Tax.",
  },
  age: {
    title: 'Age',
    description:
      'Choose whether you have reached your State Pension age. This affects employee National Insurance.',
  },
  payNoNI: {
    title: 'No National Insurance',
    description:
      'Select if you are exempt from employee National Insurance, for example because you have reached State Pension age.',
  },
  allowancesDeductions: {
    title: 'Non-taxable Allowance(s)',
    description: 'Extra pay your employer marks as non-taxable, for the selected pay period.',
    note: 'For example, reimbursed expenses. This is added to take-home pay; it does not reduce your taxable salary.',
  },
  directorRevenue: {
    title: 'Annual Revenue',
    description:
      "Your company's total sales for the year, before business expenses. Enter revenue, not profit.",
  },
  directorIncludesVat: {
    title: 'Revenue Includes VAT',
    description: 'Select if your revenue figure includes VAT.',
    note: 'This changes VAT warnings. VAT is not subtracted from your revenue.',
  },
  directorExpenses: {
    title: 'Business Expenses',
    description: 'Your yearly business costs, such as rent, software and contractors.',
    note: 'Leave out your own salary and the employer National Insurance on it: we calculate these separately.',
  },
  directorMonthlyIncome: {
    title: 'Monthly Contract Income',
    description: 'What you expect to invoice each month, before business expenses.',
    note: 'We assume this stays the same from your selected start month through March.',
  },
  directorMonthlyExpenses: {
    title: 'Monthly Business Expenses',
    description: 'Your usual monthly business costs, such as rent, software and contractors.',
    note: 'Leave out your own salary and the employer National Insurance on it: we calculate these separately.',
  },
  directorContractStartMonth: {
    title: 'Contract Start Month',
    description:
      'Choose the month your current level of income started. We assume the same monthly income from then through March.',
  },
  directorCashInBank: {
    title: 'Cash In Bank',
    description:
      "The money currently in your company's bank account, available for bills and paying yourself. Use the bank balance rather than profit shown in your accounts.",
  },
  directorMinimumMonthlyDraw: {
    title: 'Minimum Monthly Draw',
    description:
      'The minimum amount you need to take from the company each month for your personal spending. This helps set your cash reserve target.',
  },
  directorRunwayMonths: {
    title: 'Runway Target',
    description:
      'How many months of business costs and minimum personal withdrawals you want to keep in reserve.',
    note: 'The target reserve is this number multiplied by your monthly expenses plus your minimum monthly draw.',
  },
  directorYearEnd: {
    title: 'Company Year-End',
    description:
      "The date your company's accounting year ends. Check Companies House or ask your accountant if you are unsure.",
  },
  directorYearEndCustom: {
    title: 'Custom Year-End Date',
    description: 'Enter the month and day as MM-DD. For example, 06-30 means 30 June.',
  },
  directorYtdSalary: {
    title: 'Salary Already Taken',
    description:
      'Your gross salary paid through PAYE since 6 April. This is included when we work out how much you have already taken from the company.',
  },
  directorYtdDividends: {
    title: 'Dividends Already Taken',
    description:
      'Dividends declared since 6 April. These are included when we work out how much you have already taken from the company.',
  },
  directorYtdDrawings: {
    title: 'Other Drawings',
    description:
      "Money you have taken from the company since 6 April that was not salary or dividends, such as withdrawals through your director's loan account.",
  },
  directorOtherIncome: {
    title: 'Other Personal Income',
    description:
      'Your yearly personal income from outside this company, such as another job or rental income. This can affect the tax on your dividends.',
  },
  directorOtherPAYE: {
    title: 'Other PAYE Employment',
    description: 'Select if you also have a PAYE job elsewhere.',
  },
  directorEmploymentAllowance: {
    title: 'Employment Allowance',
    description:
      'Select only if your company qualifies for this reduction in employer National Insurance. A company with just one director and no other employees usually cannot claim.',
  },
  directorStudentLoans: {
    title: 'Student Loans',
    description:
      'Select the repayment plans shown in your student loan account. We include an estimate of repayments through Self Assessment.',
    note: 'Plan 5 is not supported in Director Intelligence.',
  },
  directorPension: {
    title: 'Employer Pension',
    description:
      'The yearly amount your company pays directly into your pension. We use this to reduce company profit before Corporation Tax.',
  },
  directorPensionDeducted: {
    title: 'Pension Included in Business Expenses',
    description:
      'Select if the company pension contribution is already in the business expenses you entered. This stops us deducting it twice.',
  },
  directorCompanyCar: {
    title: 'Company Car BIK',
    description:
      "The yearly taxable benefit for your company car, shown on your P11D or provided by your employer. Enter the benefit value, not the car's price.",
  },
  directorAssociatedCompanies: {
    title: 'Associated Companies',
    description:
      'The total number of associated companies, including this one. These are generally companies under common control.',
    note: 'This number affects the profit thresholds used for Corporation Tax. Ask your accountant if you are unsure.',
  },
  directorLosses: {
    title: 'Losses Brought Forward',
    description:
      "Trading losses from earlier years that can be used against this year's taxable company profit.",
  },
  directorMinimumSalary: {
    title: 'Minimum Salary',
    description:
      'The lowest yearly salary you want to consider, even if a lower salary would save tax.',
  },
  directorYourSalary: {
    title: 'Your Current Salary',
    description:
      'Your yearly gross salary from the company. Enter it here, then choose Apply to compare your setup with the suggested options.',
  },
  directorYourDividends: {
    title: 'Your Current Dividends',
    description:
      'Your yearly dividends from the company. Enter them here, then choose Apply to compare your setup with the suggested options.',
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
