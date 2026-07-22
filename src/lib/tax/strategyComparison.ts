/**
 * Strategy Comparison Calculator
 *
 * Compares three extraction strategies for company directors:
 * 1. All Salary - Take entire profit as salary
 * 2. Baseline Mix - Dynamic salary (£6,500 or £12,570) + dividends (tax efficient)
 * 3. All Dividends - £0 salary, all dividends
 *
 * @module lib/tax/strategyComparison
 */

import {
  CURRENT_TAX_YEAR,
  type StudentLoanPlan,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import type { Region } from '@/lib/validation/directorValidation';
import { getCorporationTax } from './corporationTax';
import { getDividendTax } from './dividendTax';
import { getEmployeeNI } from './employeeNI';
import { getEmployerNI } from './employerNI';
import { getIncomeTax } from './incomeTax';
import { getStudentLoanRepayment } from './studentLoan';
import { roundToPence } from './utils';

// ============================================================================
// TYPES
// ============================================================================

export interface StrategyInput {
  region: Region;
  revenue: number;
  includesVat: boolean;
  expenses: number;
  lossesBroughtForward?: number; // Trading losses from previous years (reduces CT)
  otherIncome?: number;
  employmentAllowance?: boolean;
  studentLoanPlans?: readonly StudentLoanPlan[];
  pensionContribution?: number; // Employer contribution (reduces CT profit)
  companyCarBIK?: number; // Taxable benefit added to income
  associatedCompaniesCount?: number; // Total associated companies for CT threshold splitting
  yourSetupSalary?: number; // User's current salary for comparison
  yourSetupDividends?: number; // User's current dividends for comparison
  minimumSalaryRequirement?: number; // Minimum salary needed (e.g., for mortgage)
  hasOtherPAYEEmployment?: boolean; // If true, NI threshold already used by other employer
  // Already taken this year (reduces available for optimization)
  ytdSalary?: number; // Gross salary already taken via PAYE
  ytdDividends?: number; // Dividends already declared
  ytdDrawings?: number; // Other drawings (director's loan)
}

/**
 * Common options passed to strategy calculator functions.
 * Consolidates the many parameters into a single object for cleaner function signatures.
 */
interface StrategyCalcOptions {
  grossProfit: number;
  region: Region;
  taxYear: TaxYear;
  otherIncome: number;
  hasEmploymentAllowance: boolean;
  studentLoanPlans: readonly StudentLoanPlan[];
  pension: number;
  companyCarBIK: number;
  associatedCompaniesCount: number;
  hasOtherPAYE: boolean;
  lossesBroughtForward: number;
  minimumSalary?: number;
}

export interface StrategyResult {
  name: string;
  salary: number;
  dividends: number;
  pension: number;
  companyCarBIK: number;
  employerNI: number;
  employeeNI: number;
  incomeTax: number;
  corporationTax: number;
  dividendTax: number;
  studentLoan: number;
  totalPersonalTax: number;
  companyCost: number;
  takeHome: number;
  effectiveRate: number;
}

export interface YourSetupResult extends StrategyResult {
  deltaVsOptimal: number; // Positive = paying more tax than optimal
  exceedsProfit: boolean; // True if salary + dividends > gross profit (DLA warning)
}

export interface StrategyComparison {
  grossProfit: number;
  grossProfitAfterPension: number; // Used by scenario/slider calculations
  alreadyTaken: number; // Total YTD salary + dividends + drawings
  availableForExtraction: number; // grossProfit - alreadyTaken (floored at 0)
  strategies: {
    allSalary: StrategyResult;
    optimalMix: StrategyResult;
    allDividends: StrategyResult;
    yourSetup?: YourSetupResult; // Only present if user entered their setup
  };
  recommended: 'allSalary' | 'optimalMix' | 'allDividends';
  savingsVsAllSalary: number;
}

export interface SalaryScenarioInput {
  targetSalary: number;
  grossProfit: number;
  region: Region;
  taxYear: TaxYear;
  otherIncome: number;
  hasEmploymentAllowance: boolean;
  studentLoanPlans?: readonly StudentLoanPlan[];
  pension?: number;
  companyCarBIK?: number;
  associatedCompaniesCount?: number;
  hasOtherPAYE?: boolean;
  lossesBroughtForward?: number;
  minimumSalary?: number;
}

export interface SalaryScenarioResult {
  salary: number;
  employerNI: number;
  employeeNI: number;
  incomeTax: number;
  corporationTax: number;
  dividends: number;
  dividendTax: number;
  studentLoan: number;
  pension: number;
  companyCarBIK: number;
  totalPersonalTax: number;
  companyCost: number;
  effectiveRate: number;
  takeHome: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Helper to get tax year specific values
function getEmploymentAllowance(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].nationalInsurance.employmentAllowance;
}

function getEmployerNIParams(taxYear: TaxYear): { threshold: number; rate: number } {
  const niRates = TAX_RATES[taxYear].nationalInsurance.employer.A.secondary;
  return { threshold: niRates.threshold, rate: niRates.rate / 100 };
}

function getClass1ANIRate(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].nationalInsurance.class1A.rate / 100;
}

function getClass1ANI(companyCarBIK: number, taxYear: TaxYear): number {
  if (companyCarBIK <= 0) return 0;
  return companyCarBIK * getClass1ANIRate(taxYear);
}

function normalizeAssociatedCompaniesCount(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  const normalized = Math.floor(value ?? 1);
  return normalized > 0 ? normalized : 1;
}

/**
 * Calculate Employee NI assuming no threshold benefit (for people with other PAYE)
 * When you have another PAYE job, your Primary Threshold is used there,
 * so any salary from this company is subject to NI from the first pound.
 */
function getEmployeeNIWithNoThreshold(salary: number, taxYear: TaxYear): number {
  if (salary <= 0) return 0;

  return getEmployeeNI(salary, taxYear, { applyPrimaryThreshold: false });
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function calculateStrategyComparison(
  input: StrategyInput,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): StrategyComparison {
  // Calculate YTD amounts already taken
  const ytdSalary = input.ytdSalary ?? 0;
  const ytdDividends = input.ytdDividends ?? 0;
  const ytdDrawings = input.ytdDrawings ?? 0;
  const alreadyTaken = ytdSalary + ytdDividends + ytdDrawings;

  // Calculate gross profit (after pension - employer contribution reduces distributable profit)
  const pensionContribution = input.pensionContribution ?? 0;
  // Spec: VAT status is warnings/education only (do NOT adjust revenue in calculations).
  const grossProfitBeforePension = input.revenue - input.expenses;
  const grossProfit = Math.max(0, grossProfitBeforePension - pensionContribution);

  // Available for extraction (profit minus what's already been taken)
  const availableForExtraction = Math.max(0, grossProfit - alreadyTaken);

  // Build shared options object for all strategy calculators
  const opts: StrategyCalcOptions = {
    grossProfit,
    region: input.region,
    taxYear,
    otherIncome: input.otherIncome ?? 0,
    hasEmploymentAllowance: input.employmentAllowance ?? false,
    studentLoanPlans: input.studentLoanPlans ?? [],
    pension: pensionContribution,
    companyCarBIK: input.companyCarBIK ?? 0,
    associatedCompaniesCount: normalizeAssociatedCompaniesCount(input.associatedCompaniesCount),
    hasOtherPAYE: input.hasOtherPAYEEmployment ?? false,
    lossesBroughtForward: input.lossesBroughtForward ?? 0,
    minimumSalary: input.minimumSalaryRequirement ?? 0,
  };

  // Calculate each strategy
  const allSalary = calculateAllSalaryStrategy(opts);
  const optimalMix = calculateOptimalMixStrategy(opts);
  const allDividends = calculateAllDividendsStrategy(opts);

  // Find best strategy
  const strategies: StrategyComparison['strategies'] = { allSalary, optimalMix, allDividends };
  let recommended: 'allSalary' | 'optimalMix' | 'allDividends' = 'optimalMix';
  let maxTakeHome = optimalMix.takeHome;

  if (allSalary.takeHome > maxTakeHome) {
    recommended = 'allSalary';
    maxTakeHome = allSalary.takeHome;
  }
  if (allDividends.takeHome > maxTakeHome) {
    recommended = 'allDividends';
    maxTakeHome = allDividends.takeHome;
  }

  // Calculate "Your Setup" if user provided inputs
  if (input.yourSetupSalary !== undefined || input.yourSetupDividends !== undefined) {
    const yourSetup = calculateYourSetupStrategy(
      opts,
      input.yourSetupSalary ?? 0,
      input.yourSetupDividends ?? 0,
      optimalMix.takeHome,
    );
    strategies.yourSetup = yourSetup;
  }

  // Calculate savings
  const savingsVsAllSalary = maxTakeHome - allSalary.takeHome;

  return {
    grossProfit: roundToPence(grossProfitBeforePension),
    grossProfitAfterPension: roundToPence(grossProfit),
    alreadyTaken: roundToPence(alreadyTaken),
    availableForExtraction: roundToPence(availableForExtraction),
    strategies,
    recommended,
    savingsVsAllSalary: roundToPence(savingsVsAllSalary),
  };
}

// ============================================================================
// STRATEGY CALCULATORS
// ============================================================================

function calculateAllSalaryStrategy(opts: StrategyCalcOptions): StrategyResult {
  const {
    grossProfit,
    region,
    taxYear,
    otherIncome,
    hasEmploymentAllowance,
    studentLoanPlans,
    pension,
    companyCarBIK,
    hasOtherPAYE,
  } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('All Salary');
  }

  const class1ANI = getClass1ANI(companyCarBIK, taxYear);
  const salaryBudget = Math.max(0, grossProfit - class1ANI);

  // For all salary, we need to find the salary that uses up all profit
  // With Employment Allowance, employer NI is reduced
  // This changes the optimal salary calculation

  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);
  const employmentAllowance = getEmploymentAllowance(taxYear);
  let salary: number;
  let employerNI: number;

  if (hasEmploymentAllowance) {
    // With EA, we can take more salary since employer NI is offset
    // Max salary where EA fully covers employer NI:
    // EA = employmentAllowance, NI = niRate * (salary - niThreshold)
    // employmentAllowance = niRate * (salary - niThreshold)
    // salary = employmentAllowance/niRate + niThreshold
    const maxSalaryWithFullEA = employmentAllowance / niRate + niThreshold;

    if (salaryBudget <= maxSalaryWithFullEA) {
      // EA covers all employer NI, so salary = profit
      salary = salaryBudget;
      employerNI = Math.max(0, getEmployerNI(salary, taxYear) - employmentAllowance);
    } else {
      // Profit exceeds what EA can cover
      // Profit = Salary + (EmployerNI - EA)
      // Salary = (Profit + niThreshold * niRate + EA) / (1 + niRate)
      salary = (salaryBudget + niThreshold * niRate + employmentAllowance) / (1 + niRate);
      salary = Math.floor(salary);
      employerNI = Math.max(0, getEmployerNI(salary, taxYear) - employmentAllowance);
    }
  } else {
    // No EA - original calculation
    if (salaryBudget <= niThreshold) {
      salary = salaryBudget;
    } else {
      salary = (salaryBudget + niThreshold * niRate) / (1 + niRate);
    }
    salary = Math.floor(salary);
    employerNI = getEmployerNI(salary, taxYear);
  }

  employerNI += class1ANI;

  // Verify we're within budget
  while (salary > 0 && salary + employerNI > grossProfit) {
    salary -= 1;
    const salaryEmployerNI = hasEmploymentAllowance
      ? Math.max(0, getEmployerNI(salary, taxYear) - employmentAllowance)
      : getEmployerNI(salary, taxYear);
    employerNI = salaryEmployerNI + class1ANI;
  }

  // If other PAYE employment, NI threshold already used - pay NI from first pound
  const employeeNI = hasOtherPAYE
    ? getEmployeeNIWithNoThreshold(salary, taxYear)
    : getEmployeeNI(salary, taxYear);
  // Income tax is on salary + other income + BIK, but we only show the tax portion attributable to salary + BIK
  const adjustedNetIncome = salary + otherIncome + companyCarBIK;
  const totalIncomeTax = getIncomeTax(
    salary + otherIncome + companyCarBIK,
    region,
    taxYear,
    adjustedNetIncome,
  );
  const baseIncomeTax =
    otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear, adjustedNetIncome) : 0;
  const incomeTax = totalIncomeTax - baseIncomeTax; // Marginal tax from salary + BIK
  const corporationTax = 0; // All profit used for salary
  const dividends = 0;
  const dividendTax = 0;

  // Student loan on total income (salary + BIK for this strategy)
  const totalIncome = salary + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const companyCost = salary + employerNI;
  const takeHome = salary - incomeTax - employeeNI - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'All Salary',
    salary: roundToPence(salary),
    dividends,
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employerNI: roundToPence(employerNI),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    corporationTax,
    dividendTax,
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

// Helper to calculate take-home for a given salary level
// Exported for use by the salary slider
export function calculateSalaryScenario(input: SalaryScenarioInput): SalaryScenarioResult {
  const {
    targetSalary,
    grossProfit,
    region,
    taxYear,
    otherIncome,
    hasEmploymentAllowance,
    studentLoanPlans = [],
    pension = 0,
    companyCarBIK = 0,
    associatedCompaniesCount = 1,
    hasOtherPAYE = false,
    lossesBroughtForward = 0,
    minimumSalary = 0,
  } = input;

  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);
  const class1ANI = getClass1ANI(companyCarBIK, taxYear);
  const salaryBudget = Math.max(0, grossProfit - class1ANI);

  // Calculate max affordable salary (salary + employer NI ≤ grossProfit)
  let maxAffordableSalary: number;
  if (salaryBudget <= niThreshold) {
    maxAffordableSalary = salaryBudget;
  } else {
    maxAffordableSalary = (salaryBudget + niThreshold * niRate) / (1 + niRate);
  }

  const minSalary = Math.max(0, minimumSalary);
  const clampedTarget = Math.max(targetSalary, minSalary);
  const salary = Math.min(clampedTarget, maxAffordableSalary, salaryBudget);
  let employerNI = getEmployerNI(salary, taxYear);

  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }
  employerNI += class1ANI;

  const profitAfterSalaryCost = Math.max(0, grossProfit - salary - employerNI);
  const taxableProfit = Math.max(0, profitAfterSalaryCost - lossesBroughtForward);
  const corporationTax = getCorporationTax(
    taxableProfit,
    undefined,
    normalizeAssociatedCompaniesCount(associatedCompaniesCount),
  );
  const dividends = profitAfterSalaryCost - corporationTax;

  const employeeNI = hasOtherPAYE
    ? getEmployeeNIWithNoThreshold(salary, taxYear)
    : getEmployeeNI(salary, taxYear);

  const adjustedNetIncome = salary + dividends + otherIncome + companyCarBIK;

  // Income tax includes BIK as taxable benefit
  const totalIncomeTax = getIncomeTax(
    salary + otherIncome + companyCarBIK,
    region,
    taxYear,
    adjustedNetIncome,
  );
  const baseIncomeTax =
    otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear, adjustedNetIncome) : 0;
  const incomeTax = totalIncomeTax - baseIncomeTax;

  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  // Student loan is calculated on TOTAL income (salary + dividends + BIK) for Self Assessment filers
  const totalIncome = salary + dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const companyCost = salary + employerNI + corporationTax;
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    salary: roundToPence(salary),
    employerNI: roundToPence(employerNI),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    corporationTax: roundToPence(corporationTax),
    dividends: roundToPence(dividends),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    effectiveRate: roundToPence(effectiveRate),
    takeHome: roundToPence(takeHome),
  };
}

/**
 * Internal version of calculateSalaryScenario that supports all options
 * Used by the optimal strategy calculator
 */
function calculateSalaryScenarioInternal(
  targetSalary: number,
  opts: StrategyCalcOptions,
): {
  salary: number;
  employerNI: number;
  employeeNI: number;
  incomeTax: number;
  corporationTax: number;
  dividends: number;
  dividendTax: number;
  studentLoan: number;
  pension: number;
  companyCarBIK: number;
  takeHome: number;
} {
  const {
    grossProfit,
    region,
    taxYear,
    otherIncome,
    hasEmploymentAllowance,
    studentLoanPlans,
    pension,
    companyCarBIK,
    associatedCompaniesCount,
    hasOtherPAYE,
    lossesBroughtForward,
  } = opts;

  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);
  const class1ANI = getClass1ANI(companyCarBIK, taxYear);
  const salaryBudget = Math.max(0, grossProfit - class1ANI);

  // Calculate max affordable salary (salary + employer NI <= grossProfit)
  let maxAffordableSalary: number;
  if (salaryBudget <= niThreshold) {
    maxAffordableSalary = salaryBudget;
  } else {
    maxAffordableSalary = (salaryBudget + niThreshold * niRate) / (1 + niRate);
  }

  const salary = Math.min(targetSalary, maxAffordableSalary, salaryBudget);
  let employerNI = getEmployerNI(salary, taxYear);

  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }
  employerNI += class1ANI;

  const profitAfterSalaryCost = Math.max(0, grossProfit - salary - employerNI);
  // Losses reduce the taxable profit for CT (cannot go below 0)
  const taxableProfit = Math.max(0, profitAfterSalaryCost - lossesBroughtForward);
  const corporationTax = getCorporationTax(
    taxableProfit,
    undefined,
    normalizeAssociatedCompaniesCount(associatedCompaniesCount),
  );
  // Dividends come from post-CT profit (losses reduce CT, increasing available dividends)
  const dividends = profitAfterSalaryCost - corporationTax;

  // If other PAYE employment, NI threshold already used - pay NI from first pound
  const employeeNI = hasOtherPAYE
    ? getEmployeeNIWithNoThreshold(salary, taxYear)
    : getEmployeeNI(salary, taxYear);

  const adjustedNetIncome = salary + dividends + otherIncome + companyCarBIK;

  // Income tax includes BIK as taxable benefit
  const totalIncomeTax = getIncomeTax(
    salary + otherIncome + companyCarBIK,
    region,
    taxYear,
    adjustedNetIncome,
  );
  const baseIncomeTax =
    otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear, adjustedNetIncome) : 0;
  const incomeTax = totalIncomeTax - baseIncomeTax;

  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  // Student loan is calculated on TOTAL income (salary + dividends + BIK) for Self Assessment filers
  const totalIncome = salary + dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;

  return {
    salary,
    employerNI,
    employeeNI,
    incomeTax,
    corporationTax,
    dividends,
    dividendTax,
    studentLoan,
    pension,
    companyCarBIK,
    takeHome,
  };
}

function calculateOptimalMixStrategy(opts: StrategyCalcOptions): StrategyResult {
  const { grossProfit, taxYear, pension, companyCarBIK, minimumSalary = 0 } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('Baseline Mix');
  }

  // Spec: test salary/dividend combinations across the valid range.
  // In this model, dividends are determined by the remaining post-salary profit,
  // so we can sweep salary across a range and compute the resulting dividends/taxes.
  //
  // Performance: Cap search at the NI Upper Earnings Limit (UEL) or gross profit.
  // Use a two-stage search: coarse sweep + local refinement around the best point.
  const uel = TAX_RATES[taxYear].nationalInsurance.employee.A.upper.threshold;
  const maxSalary = Math.min(uel, grossProfit);
  const minSalary = Math.max(0, minimumSalary);

  // Guard: if the minimum salary is above what can be afforded, clamp to max.
  if (minSalary >= maxSalary) {
    return scenarioToStrategyResult(
      calculateSalaryScenarioInternal(maxSalary, opts),
      pension,
      companyCarBIK,
      grossProfit,
    );
  }

  const coarseStep = 100; // £100 granularity is cheap and good enough for threshold-driven tax.
  let bestSalary = minSalary;
  let bestScenario = calculateSalaryScenarioInternal(bestSalary, opts);

  for (let s = minSalary; s <= maxSalary; s += coarseStep) {
    const scenario = calculateSalaryScenarioInternal(s, opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
      bestSalary = s;
    }
  }

  // Refinement: search +/- £2,000 around the coarse winner in £10 steps.
  const refineWindow = 2000;
  const refineStep = 10;
  const start = Math.max(minSalary, bestSalary - refineWindow);
  const end = Math.min(maxSalary, bestSalary + refineWindow);

  for (let s = start; s <= end; s += refineStep) {
    const scenario = calculateSalaryScenarioInternal(s, opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
    }
  }

  // Final refinement: +/- £200 in £1 steps for exactness around threshold edges.
  const fineWindow = 200;
  const fineStart = Math.max(minSalary, bestScenario.salary - fineWindow);
  const fineEnd = Math.min(maxSalary, bestScenario.salary + fineWindow);
  for (let s = fineStart; s <= fineEnd; s += 1) {
    const scenario = calculateSalaryScenarioInternal(s, opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
    }
  }

  const {
    salary,
    employerNI,
    employeeNI,
    incomeTax,
    corporationTax,
    dividends,
    dividendTax,
    studentLoan,
    takeHome,
  } = bestScenario;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const companyCost = salary + employerNI + corporationTax;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  const name = 'Baseline Mix'; // Avoid advisory language like "Recommended"

  return {
    name,
    salary: roundToPence(salary),
    dividends: roundToPence(dividends),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employerNI: roundToPence(employerNI),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    corporationTax: roundToPence(corporationTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

function scenarioToStrategyResult(
  scenario: ReturnType<typeof calculateSalaryScenarioInternal>,
  pension: number,
  companyCarBIK: number,
  grossProfit: number,
): StrategyResult {
  const totalPersonalTax =
    scenario.incomeTax + scenario.employeeNI + scenario.dividendTax + scenario.studentLoan;
  const companyCost = scenario.salary + scenario.employerNI + scenario.corporationTax;
  const effectiveRate =
    grossProfit > 0 ? ((grossProfit - scenario.takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'Baseline Mix',
    salary: roundToPence(scenario.salary),
    dividends: roundToPence(scenario.dividends),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employerNI: roundToPence(scenario.employerNI),
    employeeNI: roundToPence(scenario.employeeNI),
    incomeTax: roundToPence(scenario.incomeTax),
    corporationTax: roundToPence(scenario.corporationTax),
    dividendTax: roundToPence(scenario.dividendTax),
    studentLoan: roundToPence(scenario.studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    takeHome: roundToPence(scenario.takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

function calculateAllDividendsStrategy(opts: StrategyCalcOptions): StrategyResult {
  const {
    grossProfit,
    region,
    taxYear,
    otherIncome,
    studentLoanPlans,
    pension,
    companyCarBIK,
    associatedCompaniesCount,
    lossesBroughtForward,
  } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('All Dividends');
  }

  const salary = 0;
  const employerNI = getClass1ANI(companyCarBIK, taxYear); // Class 1A still applies on BIK
  const employeeNI = 0;

  // BIK is still taxable even with £0 salary
  // Losses reduce the taxable profit for CT (cannot go below 0)
  const taxableProfit = Math.max(0, grossProfit - lossesBroughtForward);
  const corporationTax = getCorporationTax(
    taxableProfit,
    undefined,
    normalizeAssociatedCompaniesCount(associatedCompaniesCount),
  );
  // Dividends come from post-CT profit, but losses don't create extra cash
  // So dividends = grossProfit - CT (where CT is calculated on reduced taxable profit)
  const dividends = grossProfit - corporationTax;

  const adjustedNetIncome = dividends + otherIncome + companyCarBIK;

  // BIK is still taxable even with £0 salary
  const bikIncomeTax =
    companyCarBIK > 0
      ? getIncomeTax(otherIncome + companyCarBIK, region, taxYear, adjustedNetIncome) -
        getIncomeTax(otherIncome, region, taxYear, adjustedNetIncome)
      : 0;
  const incomeTax = bikIncomeTax;

  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, otherIncome + companyCarBIK, taxYear);

  // Student loan on total income (dividends + BIK + other income for this strategy)
  const totalIncome = dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + dividendTax + studentLoan;
  const companyCost = employerNI + corporationTax;
  const takeHome = dividends - incomeTax - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'All Dividends',
    salary,
    dividends: roundToPence(dividends),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employerNI,
    employeeNI,
    incomeTax: roundToPence(incomeTax),
    corporationTax: roundToPence(corporationTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

/**
 * Calculate "Your Setup" strategy based on user-provided salary and dividends
 * This allows users to compare their current arrangement against optimal
 */
function calculateYourSetupStrategy(
  opts: StrategyCalcOptions,
  userSalary: number,
  userDividends: number,
  optimalTakeHome: number,
): YourSetupResult {
  const {
    grossProfit,
    region,
    taxYear,
    otherIncome,
    hasEmploymentAllowance,
    studentLoanPlans,
    pension,
    companyCarBIK,
    associatedCompaniesCount,
    lossesBroughtForward,
  } = opts;

  const salary = userSalary;
  const dividends = userDividends;

  // Check if user's setup exceeds available profit (DLA warning)
  let employerNI = getEmployerNI(salary, taxYear);
  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }
  employerNI += getClass1ANI(companyCarBIK, taxYear);

  // Company cost for salary = salary + employer NI
  // Profit available for dividends = grossProfit - salary - employerNI - CT on remaining
  const costOfSalary = salary + employerNI;
  const profitAfterSalary = Math.max(0, grossProfit - costOfSalary);
  const taxableProfitAfterSalary = Math.max(0, profitAfterSalary - lossesBroughtForward);
  const ctOnRemaining = getCorporationTax(
    taxableProfitAfterSalary,
    undefined,
    normalizeAssociatedCompaniesCount(associatedCompaniesCount),
  );
  const maxDividends = profitAfterSalary - ctOnRemaining;

  // Flag if user setup exceeds what's available
  const exceedsProfit = salary + dividends > salary + maxDividends || costOfSalary > grossProfit;

  // Calculate taxes on user's setup
  const employeeNI = getEmployeeNI(salary, taxYear);

  const adjustedNetIncome = salary + dividends + otherIncome + companyCarBIK;

  // Income tax on salary + other income + BIK
  const totalIncomeTax = getIncomeTax(
    salary + otherIncome + companyCarBIK,
    region,
    taxYear,
    adjustedNetIncome,
  );
  const baseIncomeTax =
    otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear, adjustedNetIncome) : 0;
  const incomeTax = totalIncomeTax - baseIncomeTax;

  // Corporation tax: based on profit minus salary cost and losses brought forward
  const taxableProfit = Math.max(0, grossProfit - costOfSalary - lossesBroughtForward);
  const corporationTax = getCorporationTax(
    taxableProfit,
    undefined,
    normalizeAssociatedCompaniesCount(associatedCompaniesCount),
  );

  // Dividend tax
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  // Student loan on total income
  const totalIncome = salary + dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const companyCost = costOfSalary + corporationTax;
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  // Delta vs optimal (positive = paying more tax / getting less take-home)
  const deltaVsOptimal = optimalTakeHome - takeHome;

  return {
    name: 'Your Setup',
    salary: roundToPence(salary),
    dividends: roundToPence(dividends),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employerNI: roundToPence(employerNI),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    corporationTax: roundToPence(corporationTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    companyCost: roundToPence(companyCost),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
    deltaVsOptimal: roundToPence(deltaVsOptimal),
    exceedsProfit,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function createEmptyResult(name: string): StrategyResult {
  return {
    name,
    salary: 0,
    dividends: 0,
    pension: 0,
    companyCarBIK: 0,
    employerNI: 0,
    employeeNI: 0,
    incomeTax: 0,
    corporationTax: 0,
    dividendTax: 0,
    studentLoan: 0,
    totalPersonalTax: 0,
    companyCost: 0,
    takeHome: 0,
    effectiveRate: 0,
  };
}
