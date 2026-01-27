/**
 * Tax Calculation Modules - Barrel Export
 *
 * Central export point for all tax calculation modules.
 * These are primarily used by the Director Guide calculator.
 *
 * @module lib/tax
 * @see docs/business/DIRECTOR_TOOLS_BUILD.md
 *
 * @example
 * ```typescript
 * import { calculateDirectorScenario } from '@/lib/tax';
 *
 * const result = calculateDirectorScenario({
 *   region: 'rUK',
 *   revenue: 100000,
 *   includesVat: true,
 *   expenses: 20000,
 *   alreadyTaken: 0,
 *   alreadyTakenViaPayroll: null,
 *   confirmedSoleIncome: true,
 * });
 * ```
 */

// Corporation Tax
export {
  type CorporationTaxBand,
  type CorporationTaxResult,
  CT_RATES,
  calculateCorporationTax,
  getCorporationTax,
  getEffectiveCTRate,
} from './corporationTax';
// Director Calculator (main orchestrator)
export {
  calculateDirectorScenario,
  DEFAULT_SALARY,
  HIGH_COMPLEXITY_THRESHOLD,
  POA_MULTIPLIER,
  POA_THRESHOLD,
  VAT_RATE,
  VAT_REGISTRATION_THRESHOLD,
  VAT_WARNING_LOWER,
  VAT_WARNING_UPPER,
} from './directorCalculator';
// Dividend Tax
export {
  calculateDividendTax,
  DIVIDEND_RATES,
  type DividendBandBreakdown,
  type DividendTaxBand,
  type DividendTaxResult,
  getDividendTax,
  getEffectiveDividendRate,
} from './dividendTax';
// Employer National Insurance
export {
  calculateEmployerNI,
  type EmployerNIResult,
  getEmployerNI,
  getEmployerNIRate,
  getEmployerNIThreshold,
} from './employerNI';
// Student Loan
export {
  getStudentLoanPlanName,
  getStudentLoanRate,
  getStudentLoanRepayment,
  getStudentLoanThreshold,
  type StudentLoanResult,
} from './studentLoan';
// Company Car BIK
export {
  BIK_RATES_2025_26,
  type BIKCategory,
  calculateCompanyCarBIK,
  CAR_EXAMPLES,
  type CompanyCarBIKInput,
  type CompanyCarBIKResult,
  getBIKCategoryName,
  getBIKRate,
} from './companyCarBIK';
