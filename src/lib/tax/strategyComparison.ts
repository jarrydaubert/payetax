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
  hasOtherPAYEEmployment?: boolean; // Scenario context only. Other employers have separate NI calculations.
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
  lossesBroughtForward: number;
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
  hasOtherPAYE?: boolean; // Scenario context only. NI is based on this company's salary.
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
  minimumSalaryShortfall?: number; // Gap between the required and affordable gross salary
  employeeNI: number;
  incomeTax: number;
  taperTaxOnOtherIncome?: number; // Extra tax on other income, included in incomeTax
  dividendTax: number;
  studentLoan: number; // Additional annual repayment attributable to this extraction
  pension: number;
  companyCarBIK: number;
  totalPersonalTax: number;
  effectiveRate: number;
  takeHome: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

function getClass1ANI(companyCarBIK: number, taxYear: TaxYear): number {
  const rate = TAX_RATES[taxYear].nationalInsurance.class1A.rate / 100;
  return roundToPence(Math.max(0, companyCarBIK) * rate);
}

function getSecondaryNI(
  salary: number,
  { taxYear, hasEmploymentAllowance }: StrategyCalcOptions,
): number {
  const allowance = hasEmploymentAllowance
    ? TAX_RATES[taxYear].nationalInsurance.employmentAllowance
    : 0;
  return Math.max(0, getEmployerNI(salary, taxYear) - allowance);
}

function getAffordableSalary(opts: StrategyCalcOptions): number {
  const salaryBudgetPence = Math.max(
    0,
    Math.round((opts.grossProfit - getClass1ANI(opts.companyCarBIK, opts.taxYear)) * 100),
  );

  // Search whole pennies using the same rounded Class 1 cost as the company budget.
  let low = 0;
  let high = salaryBudgetPence;
  while (low < high) {
    const salaryPence = Math.ceil((low + high) / 2);
    const niPence = Math.round(getSecondaryNI(salaryPence / 100, opts) * 100);
    if (salaryPence + niPence <= salaryBudgetPence) {
      low = salaryPence;
    } else {
      high = salaryPence - 1;
    }
  }
  return low / 100;
}

/** Apply deductible company liabilities before allocating any remaining profit. */
function calculateCompanyBudget(
  opts: StrategyCalcOptions,
  salary: number,
  requestedDividends?: number,
): CompanyBudget {
  const { grossProfit, taxYear, companyCarBIK, lossesBroughtForward } = opts;
  const class1ANI = getClass1ANI(companyCarBIK, taxYear);
  const employerNI = roundToPence(getSecondaryNI(salary, opts) + class1ANI);
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
    lossesBroughtForward: input.lossesBroughtForward ?? 0,
  };

  // Calculate each strategy
  const minimumSalary = roundToPence(Math.max(0, input.minimumSalaryRequirement ?? 0));
  const affordableSalary = getAffordableSalary(opts);
  const allSalary = calculateAllSalaryStrategy(opts, affordableSalary);
  const optimalMix = calculateOptimalMixStrategy(opts, affordableSalary, minimumSalary);
  const allDividends = calculateAllDividendsStrategy(opts);

  // Find best strategy
  const strategies: StrategyComparison['strategies'] = { allSalary, optimalMix, allDividends };
  let recommended: 'allSalary' | 'optimalMix' | 'allDividends' = 'optimalMix';
  let maxTakeHome = optimalMix.takeHome;

  if (allSalary.salary >= minimumSalary && allSalary.takeHome > maxTakeHome) {
    recommended = 'allSalary';
    maxTakeHome = allSalary.takeHome;
  }
  if (allDividends.salary >= minimumSalary && allDividends.takeHome > maxTakeHome) {
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

function calculateAllSalaryStrategy(opts: StrategyCalcOptions, salary: number): StrategyResult {
  const { grossProfit, taxYear, pension, companyCarBIK } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('All Salary', opts);
  }

  const budget = calculateCompanyBudget(opts, salary, 0);

  const employeeNI = getEmployeeNI(salary, taxYear);
  const attributedTax = calculateAttributedIncomeTax(opts, salary, 0);
  const { incomeTax } = attributedTax;
  const dividendTax = 0;

  const studentLoan = calculateAttributedStudentLoan(opts, salary, 0);

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
    ...attributedTax,
    incomeTax: roundToPence(incomeTax),
    dividendTax,
    studentLoan,
    totalPersonalTax: roundToPence(totalPersonalTax),
    takeHome: roundToPence(takeHome),
    effectiveRate: roundToPence(effectiveRate),
  };
}

// The slider shares the same salary scenario as each Baseline Mix candidate.
export function calculateSalaryScenario({
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
  lossesBroughtForward = 0,
  minimumSalary = 0,
}: SalaryScenarioInput): SalaryScenarioResult {
  const opts: StrategyCalcOptions = {
    grossProfit: roundToPence(grossProfit),
    region,
    taxYear,
    otherIncome,
    hasEmploymentAllowance,
    studentLoanPlans,
    pension,
    companyCarBIK,
    associatedCompaniesCount: normalizeAssociatedCompaniesCount(associatedCompaniesCount),
    lossesBroughtForward,
  };
  const salaryFloor = roundToPence(Math.max(0, minimumSalary));
  const salary = Math.min(
    roundToPence(Math.max(targetSalary, salaryFloor)),
    getAffordableSalary(opts),
  );
  const scenario = calculateSalaryScenarioInternal(salary, opts);
  const minimumSalaryShortfall = roundToPence(salaryFloor - salary);
  return {
    ...scenario,
    ...(minimumSalaryShortfall > 0 && { minimumSalaryShortfall }),
    takeHome: roundToPence(scenario.takeHome),
  };
}

function calculateSalaryScenarioInternal(
  salary: number,
  opts: StrategyCalcOptions,
): SalaryScenarioResult {
  const { grossProfit, taxYear, otherIncome, pension, companyCarBIK } = opts;

  const budget = calculateCompanyBudget(opts, salary);
  const { dividends } = budget;

  const employeeNI = getEmployeeNI(salary, taxYear);
  const attributedTax = calculateAttributedIncomeTax(opts, salary, dividends);
  const { incomeTax } = attributedTax;

  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  const studentLoan = calculateAttributedStudentLoan(opts, salary, dividends);

  const totalPersonalTax = incomeTax + employeeNI + dividendTax + studentLoan;
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    ...budget,
    salary,
    employeeNI: roundToPence(employeeNI),
    ...attributedTax,
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan,
    pension: roundToPence(pension),
    companyCarBIK: roundToPence(companyCarBIK),
    totalPersonalTax: roundToPence(totalPersonalTax),
    effectiveRate: roundToPence(effectiveRate),
    takeHome,
  };
}

function calculateOptimalMixStrategy(
  opts: StrategyCalcOptions,
  affordableSalary: number,
  minimumSalary: number,
): StrategyResult {
  const { grossProfit, taxYear } = opts;
  const minimumSalaryShortfall = roundToPence(minimumSalary - affordableSalary);
  const shortfall = minimumSalaryShortfall > 0 ? { minimumSalaryShortfall } : {};

  if (grossProfit <= 0) {
    return { ...createEmptyResult('Baseline Mix', opts), ...shortfall };
  }

  // Spec: test salary/dividend combinations across the valid range.
  // In this model, dividends are determined by the remaining post-salary profit,
  // so we can sweep salary across a range and compute the resulting dividends/taxes.
  //
  // Bound the search at the UEL unless the required salary is higher.
  // Use a two-stage search: coarse sweep + local refinement around the best point.
  const uel = TAX_RATES[taxYear].nationalInsurance.employee.A.upper.threshold;
  const maxSalary = Math.min(affordableSalary, Math.max(uel, minimumSalary));
  const minSalary = Math.min(minimumSalary, maxSalary);

  const coarseStep = 100; // £100 granularity is cheap and good enough for threshold-driven tax.
  let bestScenario = calculateSalaryScenarioInternal(minSalary, opts);

  for (let s = minSalary + coarseStep; s <= maxSalary; s += coarseStep) {
    const scenario = calculateSalaryScenarioInternal(roundToPence(s), opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
    }
  }
  if (maxSalary > minSalary) {
    const upperScenario = calculateSalaryScenarioInternal(maxSalary, opts);
    if (upperScenario.takeHome > bestScenario.takeHome) bestScenario = upperScenario;
  }

  // Refinement: search +/- £2,000 around the coarse winner in £10 steps.
  const refineWindow = 2000;
  const refineStep = 10;
  const start = Math.max(minSalary, bestScenario.salary - refineWindow);
  const end = Math.min(maxSalary, bestScenario.salary + refineWindow);

  for (let s = start; s <= end; s += refineStep) {
    const scenario = calculateSalaryScenarioInternal(roundToPence(s), opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
    }
  }

  // Final refinement: +/- £200 in £1 steps for exactness around threshold edges.
  const fineWindow = 200;
  const fineStart = Math.max(minSalary, bestScenario.salary - fineWindow);
  const fineEnd = Math.min(maxSalary, bestScenario.salary + fineWindow);
  for (let s = fineStart; s <= fineEnd; s += 1) {
    const scenario = calculateSalaryScenarioInternal(roundToPence(s), opts);
    if (scenario.takeHome > bestScenario.takeHome) {
      bestScenario = scenario;
    }
  }

  return {
    ...bestScenario,
    name: 'Baseline Mix',
    ...shortfall,
    takeHome: roundToPence(bestScenario.takeHome),
  };
}

function calculateAllDividendsStrategy(opts: StrategyCalcOptions): StrategyResult {
  const { grossProfit, taxYear, otherIncome, pension, companyCarBIK } = opts;

  if (grossProfit <= 0) {
    return createEmptyResult('All Dividends', opts);
  }

  const budget = calculateCompanyBudget(opts, 0);
  const { dividends } = budget;

  const attributedTax = calculateAttributedIncomeTax(opts, 0, dividends);
  const { incomeTax } = attributedTax;

  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, otherIncome + companyCarBIK, taxYear);

  const studentLoan = calculateAttributedStudentLoan(opts, 0, dividends);

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
    ...attributedTax,
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan,
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
  const { grossProfit, taxYear, otherIncome, pension, companyCarBIK } = opts;

  const salary = roundToPence(userSalary);
  const budget = calculateCompanyBudget(opts, salary, roundToPence(userDividends));
  const { dividends } = budget;

  // Calculate taxes on user's setup
  const employeeNI = getEmployeeNI(salary, taxYear);

  const attributedTax = calculateAttributedIncomeTax(opts, salary, dividends);
  const { incomeTax } = attributedTax;

  // Dividend tax
  const dividendTax = getDividendTax(dividends, salary + otherIncome + companyCarBIK, taxYear);

  const studentLoan = calculateAttributedStudentLoan(opts, salary, dividends);

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
    ...attributedTax,
    incomeTax: roundToPence(incomeTax),
    dividendTax: roundToPence(dividendTax),
    studentLoan,
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

function calculateAttributedIncomeTax(
  { otherIncome, companyCarBIK, region, taxYear }: StrategyCalcOptions,
  salary: number,
  dividends: number,
): Pick<SalaryScenarioResult, 'incomeTax' | 'taperTaxOnOtherIncome'> {
  const nonDividendIncome = salary + otherIncome + companyCarBIK;
  const adjustedNetIncome = salary + dividends + otherIncome + companyCarBIK;
  const scenarioTax = getIncomeTax(nonDividendIncome, region, taxYear, adjustedNetIncome);
  // The counterfactual keeps the allowance due on other income alone.
  const baselineTax = getIncomeTax(otherIncome, region, taxYear);
  const otherIncomeTaxAtScenarioAllowance = getIncomeTax(
    otherIncome,
    region,
    taxYear,
    adjustedNetIncome,
  );
  const taperTaxOnOtherIncome = roundToPence(otherIncomeTaxAtScenarioAllowance - baselineTax);

  return {
    incomeTax: scenarioTax - baselineTax,
    ...(taperTaxOnOtherIncome > 0 && { taperTaxOnOtherIncome }),
  };
}

function calculateAttributedStudentLoan(
  { otherIncome, studentLoanPlans, taxYear }: StrategyCalcOptions,
  salary: number,
  dividends: number,
): number {
  if (studentLoanPlans.length === 0) return 0;

  // Other income is assumed to qualify in full. The model's only unearned income
  // is company dividends, which count in full above £2,000. Class 1A BIK is excluded.
  const eligibleDividends = dividends > 2000 ? dividends : 0;
  const scenarioIncome = otherIncome + salary + eligibleDividends;
  const scenario = getStudentLoanRepayment(scenarioIncome, studentLoanPlans, taxYear);
  const baseline = getStudentLoanRepayment(otherIncome, studentLoanPlans, taxYear);
  return roundToPence(scenario.total - baseline.total);
}

function createEmptyResult(name: string, opts: StrategyCalcOptions): StrategyResult {
  return {
    ...calculateCompanyBudget(opts, 0, 0),
    name,
    salary: 0,
    pension: roundToPence(opts.pension),
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
