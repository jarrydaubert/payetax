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

export interface StrategyResult extends SalaryScenarioResult {
  name: string;
}

export interface YourSetupResult extends StrategyResult {
  deltaVsOptimal: number; // Positive = paying more tax than optimal
  exceedsProfit: boolean; // True if the entered setup exceeds the company budget
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

interface CompanyBudget {
  employerNI: number; // Secondary Class 1 after any allowance, plus Class 1A
  class1ANI: number;
  taxableProfit: number;
  corporationTax: number;
  dividends: number;
  companyCost: number; // Salary and company tax liabilities, excluding dividends
  retainedProfit: number;
  companyShortfall: number;
}

export interface SalaryScenarioResult extends CompanyBudget {
  salary: number;
  employeeNI: number;
  incomeTax: number;
  dividendTax: number;
  studentLoan: number;
  pension: number;
  companyCarBIK: number;
  totalPersonalTax: number;
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

function getClass1ANI(companyCarBIK: number, taxYear: TaxYear): number {
  const rate = TAX_RATES[taxYear].nationalInsurance.class1A.rate / 100;
  return roundToPence(Math.max(0, companyCarBIK) * rate);
}

function getSecondaryNI(salary: number, taxYear: TaxYear, allowance: number): number {
  return Math.max(0, getEmployerNI(salary, taxYear) - allowance);
}

function getAffordableSalary(salaryBudget: number, taxYear: TaxYear, allowance = 0): number {
  const { threshold, rate } = getEmployerNIParams(taxYear);
  const estimate = Math.min(
    salaryBudget,
    (salaryBudget + rate * threshold + allowance) / (1 + rate),
  );
  const salary = roundToPence(estimate);

  // The rounded salary and rounded secondary Class 1 can cost a penny more than the estimate.
  return roundToPence(salary + getSecondaryNI(salary, taxYear, allowance)) > salaryBudget
    ? roundToPence(salary - 0.01)
    : salary;
}

/** Apply deductible company liabilities before allocating any remaining profit. */
function calculateCompanyBudget(
  opts: StrategyCalcOptions,
  salary: number,
  requestedDividends?: number,
): CompanyBudget {
  const { grossProfit, taxYear, companyCarBIK, hasEmploymentAllowance, lossesBroughtForward } =
    opts;
  const allowance = hasEmploymentAllowance ? getEmploymentAllowance(taxYear) : 0;
  const class1ANI = getClass1ANI(companyCarBIK, taxYear);
  const employerNI = roundToPence(getSecondaryNI(salary, taxYear, allowance) + class1ANI);
  const profitAfterPayroll = roundToPence(grossProfit - salary - employerNI);
  const taxableProfit = roundToPence(Math.max(0, profitAfterPayroll - lossesBroughtForward));
  const corporationTax = getCorporationTax(taxableProfit, taxYear, opts.associatedCompaniesCount);
  const distributableProfit = roundToPence(profitAfterPayroll - corporationTax);
  const dividends = requestedDividends ?? Math.max(0, distributableProfit);
  const balance = roundToPence(distributableProfit - dividends);

  return {
    employerNI,
    class1ANI,
    taxableProfit,
    corporationTax,
    dividends,
    companyCost: roundToPence(salary + employerNI + corporationTax),
    retainedProfit: Math.max(0, balance),
    companyShortfall: Math.max(0, -balance),
  };
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
  const grossProfit = roundToPence(Math.max(0, grossProfitBeforePension - pensionContribution));

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
    return createEmptyResult('All Salary', opts);
  }

  const salaryBudget = Math.max(
    0,
    roundToPence(grossProfit - getClass1ANI(companyCarBIK, taxYear)),
  );
  const allowance = hasEmploymentAllowance ? getEmploymentAllowance(taxYear) : 0;
  const salary = getAffordableSalary(salaryBudget, taxYear, allowance);
  const budget = calculateCompanyBudget(opts, salary, 0);

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
  const dividendTax = 0;

  // Student loan on total income (salary + BIK for this strategy)
  const totalIncome = salary + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const takeHome = salary - incomeTax - employeeNI - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    ...budget,
    name: 'All Salary',
    salary,
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    dividendTax,
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

// The slider shares the same salary scenario as each Baseline Mix candidate.
export function calculateSalaryScenario({
  targetSalary,
  grossProfit,
  studentLoanPlans = [],
  pension = 0,
  companyCarBIK = 0,
  associatedCompaniesCount = 1,
  hasOtherPAYE = false,
  lossesBroughtForward = 0,
  minimumSalary = 0,
  ...options
}: SalaryScenarioInput): SalaryScenarioResult {
  const scenario = calculateSalaryScenarioInternal(Math.max(targetSalary, minimumSalary, 0), {
    ...options,
    grossProfit: roundToPence(grossProfit),
    studentLoanPlans,
    pension,
    companyCarBIK,
    associatedCompaniesCount: normalizeAssociatedCompaniesCount(associatedCompaniesCount),
    hasOtherPAYE,
    lossesBroughtForward,
  });
  return { ...scenario, takeHome: roundToPence(scenario.takeHome) };
}

function calculateSalaryScenarioInternal(
  targetSalary: number,
  opts: StrategyCalcOptions,
): SalaryScenarioResult {
  const {
    grossProfit,
    region,
    taxYear,
    otherIncome,
    studentLoanPlans,
    pension,
    companyCarBIK,
    hasOtherPAYE,
  } = opts;

  const salaryBudget = Math.max(
    0,
    roundToPence(grossProfit - getClass1ANI(companyCarBIK, taxYear)),
  );
  const salary = Math.min(roundToPence(targetSalary), getAffordableSalary(salaryBudget, taxYear));
  const budget = calculateCompanyBudget(opts, salary);
  const { dividends } = budget;

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
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    ...budget,
    salary,
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    totalPersonalTax: roundToPence(totalPersonalTax),
    effectiveRate: roundToPence(effectiveRate),
    takeHome,
  };
}

function calculateOptimalMixStrategy(opts: StrategyCalcOptions): StrategyResult {
  const { grossProfit, taxYear, minimumSalary = 0 } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('Baseline Mix', opts);
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
    const scenario = calculateSalaryScenarioInternal(maxSalary, opts);
    return { ...scenario, name: 'Baseline Mix', takeHome: roundToPence(scenario.takeHome) };
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

  return { ...bestScenario, name: 'Baseline Mix', takeHome: roundToPence(bestScenario.takeHome) };
}

function calculateAllDividendsStrategy(opts: StrategyCalcOptions): StrategyResult {
  const { grossProfit, region, taxYear, otherIncome, studentLoanPlans, pension, companyCarBIK } =
    opts;

  if (grossProfit <= 0) {
    return createEmptyResult('All Dividends', opts);
  }

  const budget = calculateCompanyBudget(opts, 0);
  const { dividends } = budget;

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
  const takeHome = dividends - incomeTax - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    ...budget,
    name: 'All Dividends',
    salary: 0,
    employeeNI: 0,
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
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
  const { grossProfit, region, taxYear, otherIncome, studentLoanPlans, pension, companyCarBIK } =
    opts;

  const salary = roundToPence(userSalary);
  const budget = calculateCompanyBudget(opts, salary, roundToPence(userDividends));
  const { dividends } = budget;

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

  // Dividend tax
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  // Student loan on total income
  const totalIncome = salary + dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  // Delta vs optimal (positive = paying more tax / getting less take-home)
  const deltaVsOptimal = optimalTakeHome - takeHome;

  return {
    ...budget,
    name: 'Your Setup',
    salary,
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    employeeNI: roundToPence(employeeNI),
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan: roundToPence(studentLoan),
    totalPersonalTax: roundToPence(totalPersonalTax),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
    deltaVsOptimal: roundToPence(deltaVsOptimal),
    exceedsProfit: budget.companyShortfall > 0,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function createEmptyResult(name: string, opts: StrategyCalcOptions): StrategyResult {
  return {
    ...calculateCompanyBudget(opts, 0, 0),
    name,
    salary: 0,
    pension: 0,
    companyCarBIK: roundToPence(opts.companyCarBIK),
    employeeNI: 0,
    incomeTax: 0,
    dividendTax: 0,
    studentLoan: 0,
    totalPersonalTax: 0,
    takeHome: 0,
    effectiveRate: 0,
  };
}
