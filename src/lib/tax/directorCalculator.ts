/**
 * Director Tax Calculator - Main Orchestrator
 *
 * Calculates optimal salary/dividend extraction for UK company directors.
 * This is the main entry point that orchestrates the atomic calculation modules.
 *
 * @module lib/tax/directorCalculator
 * @see docs/business/DIRECTOR_CALCULATOR_BUILD.md
 * @see src/constants/taxRates.ts
 *
 * ## Design Philosophy
 *
 * This calculator follows the "Wife Test" principle:
 * - Ask what users KNOW (revenue, expenses, region)
 * - Calculate what they DON'T (optimal salary, tax pots, monthly pay)
 * - Use safe defaults (£12,570 salary, no Employment Allowance)
 *
 * ## Calculation Flow
 *
 * 1. Adjust revenue for VAT (if included)
 * 2. Calculate gross profit (revenue - expenses)
 * 3. Check for survival mode (profit ≤ personal allowance)
 * 4. If normal: Calculate optimal extraction (salary + dividends)
 * 5. Calculate all tax liabilities
 * 6. Return actionable numbers (monthly pay, tax pots)
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';
import type {
  DirectorCalculationResult,
  DirectorInput,
  DirectorTaxYear,
  SurvivalResult,
  Warning,
} from '@/lib/validation/directorValidation';
import { getCorporationTax } from './corporationTax';
import { getDividendTax } from './dividendTax';
import { getEmployerNI } from './employerNI';
import { roundToPence } from './utils';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default salary for 2025-26 (for backwards compatibility with tests)
 * IMPORTANT: Use TAX_RATES[taxYear].personalAllowance in calculations
 */
export const DEFAULT_SALARY = TAX_RATES['2025-2026'].personalAllowance;

/** VAT standard rate (20%) */

/** Threshold above which Payments on Account apply */
export const POA_THRESHOLD = 1000;

/** POA multiplier (1.5x = bill + 50% advance for year 2) */
export const POA_MULTIPLIER = 1.5;

/** Profit threshold for high complexity warning */
export const HIGH_COMPLEXITY_THRESHOLD = 250000;

const DEFAULT_DIRECTOR_RATES = TAX_RATES['2025-2026'];
const VAT_WARNING_PROXIMITY = 5000;

/** VAT registration threshold (default tax year export for backwards compatibility) */
export const VAT_REGISTRATION_THRESHOLD = DEFAULT_DIRECTOR_RATES.vatRegistrationThreshold;

/** VAT warning band (default tax year export for backwards compatibility) */
export const VAT_WARNING_LOWER = VAT_REGISTRATION_THRESHOLD - VAT_WARNING_PROXIMITY;
export const VAT_WARNING_UPPER = VAT_REGISTRATION_THRESHOLD + VAT_WARNING_PROXIMITY;

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate optimal extraction for a company director
 *
 * This is the main entry point for the director calculator.
 * It takes simple inputs and returns actionable numbers.
 *
 * @param input - User inputs (revenue, expenses, region, etc.)
 * @param taxYear - Tax year for calculation (defaults to 2025-2026)
 * @returns Full calculation results or survival mode results
 *
 * @example
 * ```typescript
 * const result = calculateDirectorScenario({
 *   region: 'rUK',
 *   revenue: 100000,
 *   includesVat: true,
 *   expenses: 20000,
 *   alreadyTaken: 0,
 *   alreadyTakenViaPayroll: null,
 *   confirmedSoleIncome: true,
 * });
 *
 * if (result.mode === 'normal') {
 *   console.log(`Monthly pay: £${result.averageMonthlyPay.toFixed(0)}`);
 *   console.log(`Company tax pot: £${result.companyTaxPot.toFixed(0)}`);
 * }
 * ```
 */
export function calculateDirectorScenario(
  input: DirectorInput,
  taxYear: TaxYear = '2025-2026',
): DirectorCalculationResult {
  const rates = TAX_RATES[taxYear];
  const personalAllowance = rates.personalAllowance;

  // Step 1: Revenue for calculations
  // Spec: VAT status is warnings/education only (do NOT adjust revenue in calculations).
  const grossRevenue = input.revenue;
  const netRevenue = input.revenue;

  // Step 2: Calculate gross profit
  const grossProfit = roundToPence(netRevenue - input.expenses);

  // Step 3: Check for survival mode
  if (grossProfit <= 0) {
    return createSurvivalResult(
      'survival',
      input,
      grossRevenue,
      netRevenue,
      grossProfit,
      taxYear,
      "Your company hasn't made profit yet. Dividends aren't possible. " +
        "If you take money, it's a loan you'll owe back.",
    );
  }

  if (grossProfit <= personalAllowance) {
    // Calculate the maximum salary that fits within profit (accounting for employer NI)
    // Salary + EmployerNI <= grossProfit
    // If salary > threshold: salary + rate*(salary - threshold) <= grossProfit
    // (1+rate)*salary - rate*threshold <= grossProfit
    // salary <= (grossProfit + rate*threshold) / (1+rate)
    const niThreshold = rates.nationalInsurance.employer.A.secondary.threshold;
    const niRate = rates.nationalInsurance.employer.A.secondary.rate / 100;
    let maxSalary: number;
    if (grossProfit <= niThreshold) {
      maxSalary = grossProfit; // No employer NI applies
    } else {
      maxSalary = Math.min(grossProfit, (grossProfit + niThreshold * niRate) / (1 + niRate));
    }
    maxSalary = roundToPence(Math.floor(maxSalary)); // Round down to be safe

    const employerNI = getEmployerNI(maxSalary, taxYear);
    const monthlySalary = roundToPence(maxSalary / 12);
    const remainingSalary = roundToPence(Math.max(0, maxSalary - input.alreadyTaken));
    const averageMonthlyPay = roundToPence(remainingSalary / 12);

    // Return as 'normal' mode but with a warning about low profit
    // This gives users actual numbers they can use
    return {
      mode: 'normal' as const,
      grossRevenue,
      netRevenue,
      expenses: input.expenses,
      grossProfit,
      salary: maxSalary,
      monthlySalary,
      employerNI,
      taxableProfit: 0,
      corporationTax: 0,
      dividendsAvailable: 0,
      dividendTax: 0,
      annualTakeHome: maxSalary,
      remainingTakeHome: remainingSalary,
      averageMonthlyPay,
      companyTaxPot: roundToPence(employerNI),
      personalTaxAnnual: 0, // Salary within PA = no tax
      personalTaxMonthly: 0,
      includesPOA: false,
      warnings: [
        {
          type: 'MODIFIED_SURVIVAL',
          message:
            "Profit is low, so we're recommending salary only (no dividends). This is tax-free since it's within your Personal Allowance.",
        },
      ],
      taxYear: taxYear as DirectorTaxYear,
      region: input.region,
    };
  }

  // Step 4: Normal calculation path
  // Use personal allowance as optimal salary (tax-year specific)
  const salary = personalAllowance;
  const monthlySalary = roundToPence(salary / 12);

  // Step 5: Calculate employer NI on salary
  const employerNI = getEmployerNI(salary, taxYear);

  // Step 6: Calculate taxable profit (after salary + employer NI deduction)
  const taxableProfit = roundToPence(grossProfit - salary - employerNI);

  // Step 7: Calculate Corporation Tax
  const corporationTax = getCorporationTax(taxableProfit);

  // Step 8: Calculate dividends available
  const dividendsAvailable = roundToPence(taxableProfit - corporationTax);

  // Step 9: Calculate dividend tax (dividends stack on top of salary)
  const dividendTax = getDividendTax(dividendsAvailable, salary, taxYear);

  // Step 10: Calculate take-home amounts
  const annualTakeHome = roundToPence(salary + dividendsAvailable - dividendTax);
  const remainingTakeHome = roundToPence(Math.max(0, annualTakeHome - input.alreadyTaken));
  const averageMonthlyPay = roundToPence(remainingTakeHome / 12);

  // Step 11: Calculate company tax pot (CT + Employer NI)
  const companyTaxPot = roundToPence(corporationTax + employerNI);

  // Step 12: Calculate personal tax savings (with POA if applicable)
  // POA applies when total Self Assessment tax liability > £1,000
  // Total SA liability = income tax (not paid via PAYE) + dividend tax
  // For our model: salary ≤ PA so income tax = £0, SA liability ≈ dividend tax
  // Note: POA doesn't apply if ≥80% of total tax was already collected via PAYE
  const selfAssessmentLiability = dividendTax; // Income tax on PA salary = £0
  const includesPOA = selfAssessmentLiability > POA_THRESHOLD;
  const personalTaxAnnual = includesPOA ? roundToPence(dividendTax * POA_MULTIPLIER) : dividendTax;
  const personalTaxMonthly = roundToPence(personalTaxAnnual / 12);

  // Step 13: Collect warnings
  const warnings = collectWarnings(
    input,
    grossProfit,
    netRevenue,
    annualTakeHome,
    includesPOA,
    taxYear,
  );

  return {
    mode: 'normal',
    grossRevenue,
    netRevenue,
    expenses: input.expenses,
    grossProfit,
    salary,
    monthlySalary,
    employerNI,
    taxableProfit,
    corporationTax,
    dividendsAvailable,
    dividendTax,
    annualTakeHome,
    remainingTakeHome,
    averageMonthlyPay,
    companyTaxPot,
    personalTaxAnnual,
    personalTaxMonthly,
    includesPOA,
    warnings,
    taxYear: taxYear as DirectorTaxYear,
    region: input.region,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a survival mode result
 *
 * Used when profit is too low for normal salary + dividend extraction.
 */
function createSurvivalResult(
  mode: 'survival' | 'modified_survival',
  input: DirectorInput,
  grossRevenue: number,
  netRevenue: number,
  grossProfit: number,
  taxYear: TaxYear,
  message: string,
): SurvivalResult {
  const warningType = mode === 'survival' ? 'SURVIVAL_MODE' : 'MODIFIED_SURVIVAL';

  return {
    mode,
    grossRevenue,
    netRevenue,
    expenses: input.expenses,
    grossProfit,
    warnings: [{ type: warningType, message }],
    taxYear: taxYear as DirectorTaxYear,
    region: input.region,
    maxPossibleSalary: Math.max(0, grossProfit),
    message,
  };
}

/**
 * Collect warnings based on the calculation results
 */
function collectWarnings(
  input: DirectorInput,
  grossProfit: number,
  netRevenue: number,
  annualTakeHome: number,
  includesPOA: boolean,
  taxYear: TaxYear,
): Warning[] {
  const warnings: Warning[] = [];
  const vatRegistrationThreshold = TAX_RATES[taxYear].vatRegistrationThreshold;
  const vatWarningLower = vatRegistrationThreshold - VAT_WARNING_PROXIMITY;
  const vatWarningUpper = vatRegistrationThreshold + VAT_WARNING_PROXIMITY;

  // High complexity warning (profit > £250k)
  if (grossProfit > HIGH_COMPLEXITY_THRESHOLD) {
    warnings.push({
      type: 'HIGH_COMPLEXITY',
      message: 'This is getting complex. An accountant could save you serious money.',
    });
  }

  // VAT threshold warning (approaching £90k)
  if (netRevenue > vatWarningLower && netRevenue < vatWarningUpper) {
    warnings.push({
      type: 'VAT_THRESHOLD',
      message:
        `Heads up: VAT registration is required above £${vatRegistrationThreshold.toLocaleString()} turnover. ` +
        "If you're not registered yet, you may need to be.",
    });
  }

  // Already taken too much warning
  if (input.alreadyTaken > annualTakeHome) {
    warnings.push({
      type: 'ALREADY_TAKEN_TOO_MUCH',
      message:
        'You may have taken more than is safe based on this estimate. ' +
        'Pause and speak to an accountant.',
    });
  }

  // DLA risk warning (money taken not via payroll)
  if (input.alreadyTaken > 0 && input.alreadyTakenViaPayroll === false) {
    warnings.push({
      type: 'DLA_RISK',
      message:
        "Money taken without payroll may be a Director's Loan. " +
        'This has tax implications. Talk to an accountant.',
    });
  }

  if (includesPOA) {
    warnings.push({
      type: 'PAYMENTS_ON_ACCOUNT',
      message:
        'This estimate includes Payments on Account (1.5x first-year budgeting). Your later Self Assessment bills may differ.',
    });
  }

  return warnings;
}
