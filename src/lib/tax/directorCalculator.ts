/**
 * Director Tax Calculator - Main Orchestrator
 *
 * Calculates optimal salary/dividend extraction for UK company directors.
 * This is the main entry point that orchestrates the atomic calculation modules.
 *
 * @module lib/tax/directorCalculator
 * @see docs/business/DIRECTOR_TOOLS_BUILD.md
 * @see docs/business/DIRECTOR_TOOLS_MATH.md
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
  SurvivalResult,
  Warning,
} from '@/lib/validation/directorValidation';
import { getCorporationTax } from './corporationTax';
import { getDividendTax } from './dividendTax';
import { getEmployerNI } from './employerNI';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default salary - uses full Personal Allowance for tax efficiency
 *
 * At £12,570:
 * - No income tax (within Personal Allowance)
 * - No employee NI (at Primary Threshold)
 * - Employer NI applies (above Secondary Threshold of £5,000)
 */
export const DEFAULT_SALARY = 12570;

/** VAT standard rate (20%) */
export const VAT_RATE = 0.2;

/** Threshold above which Payments on Account apply */
export const POA_THRESHOLD = 1000;

/** POA multiplier (1.5x = bill + 50% advance for year 2) */
export const POA_MULTIPLIER = 1.5;

/** Profit threshold for high complexity warning */
export const HIGH_COMPLEXITY_THRESHOLD = 250000;

/** VAT registration threshold */
export const VAT_REGISTRATION_THRESHOLD = 90000;

/** VAT warning band (early warning) */
export const VAT_WARNING_LOWER = 85000;
export const VAT_WARNING_UPPER = 95000;

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
  taxYear: TaxYear = '2025-2026'
): DirectorCalculationResult {
  const rates = TAX_RATES[taxYear];
  const personalAllowance = rates.personalAllowance;

  // Step 1: Adjust revenue for VAT if included
  const grossRevenue = input.revenue;
  const netRevenue = input.includesVat
    ? roundToPence(input.revenue / (1 + VAT_RATE))
    : input.revenue;

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
        "If you take money, it's a loan you'll owe back."
    );
  }

  if (grossProfit <= personalAllowance) {
    return createSurvivalResult(
      'modified_survival',
      input,
      grossRevenue,
      netRevenue,
      grossProfit,
      taxYear,
      "You can take a smaller salary (up to your profit), but dividends aren't advisable yet."
    );
  }

  // Step 4: Normal calculation path
  const salary = DEFAULT_SALARY;
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
  const includesPOA = dividendTax > POA_THRESHOLD;
  const personalTaxAnnual = includesPOA ? roundToPence(dividendTax * POA_MULTIPLIER) : dividendTax;
  const personalTaxMonthly = roundToPence(personalTaxAnnual / 12);

  // Step 13: Collect warnings
  const warnings = collectWarnings(input, grossProfit, netRevenue, annualTakeHome);

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
    taxYear,
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
  message: string
): SurvivalResult {
  const warningType = mode === 'survival' ? 'SURVIVAL_MODE' : 'MODIFIED_SURVIVAL';

  return {
    mode,
    grossRevenue,
    netRevenue,
    expenses: input.expenses,
    grossProfit,
    warnings: [{ type: warningType, message }],
    taxYear,
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
  annualTakeHome: number
): Warning[] {
  const warnings: Warning[] = [];

  // High complexity warning (profit > £250k)
  if (grossProfit > HIGH_COMPLEXITY_THRESHOLD) {
    warnings.push({
      type: 'HIGH_COMPLEXITY',
      message: 'This is getting complex. An accountant could save you serious money.',
    });
  }

  // VAT threshold warning (approaching £90k)
  if (netRevenue > VAT_WARNING_LOWER && netRevenue < VAT_WARNING_UPPER) {
    warnings.push({
      type: 'VAT_THRESHOLD',
      message:
        `Heads up: VAT registration is required above £${VAT_REGISTRATION_THRESHOLD.toLocaleString()} turnover. ` +
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

  return warnings;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Round to nearest penny (2 decimal places)
 */
function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}
