/**
 * Strategy Comparison Calculator
 *
 * Compares three extraction strategies for company directors:
 * 1. All Salary - Take entire profit as salary
 * 2. Recommended - Dynamic salary (£6,500 or £12,570) + dividends (tax efficient)
 * 3. All Dividends - £0 salary, all dividends
 *
 * @module lib/tax/strategyComparison
 */

import type { StudentLoanPlan, TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';
import type { Region } from '@/lib/validation/directorValidation';
import { getCorporationTax } from './corporationTax';
import { getDividendTax } from './dividendTax';
import { getEmployeeNI } from './employeeNI';
import { getEmployerNI } from './employerNI';
import { getIncomeTax } from './incomeTax';
import { getStudentLoanRepayment } from './studentLoan';

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
  studentLoanPlans?: StudentLoanPlan[];
  pensionContribution?: number; // Employer contribution (reduces CT profit)
  companyCarBIK?: number; // Taxable benefit added to income
  yourSetupSalary?: number; // User's current salary for comparison
  yourSetupDividends?: number; // User's current dividends for comparison
  minimumSalaryRequirement?: number; // Minimum salary needed (e.g., for mortgage)
  hasOtherPAYEEmployment?: boolean; // If true, NI threshold already used by other employer
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
  strategies: {
    allSalary: StrategyResult;
    optimalMix: StrategyResult;
    allDividends: StrategyResult;
    yourSetup?: YourSetupResult; // Only present if user entered their setup
  };
  recommended: 'allSalary' | 'optimalMix' | 'allDividends';
  savingsVsAllSalary: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VAT_RATE = 0.2;

// Helper to get tax year specific values
function getPersonalAllowance(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].personalAllowance;
}

function getLowerEarningsLimit(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].nationalInsurance.lowerEarningsLimit;
}

function getEmploymentAllowance(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].nationalInsurance.employmentAllowance;
}

function getEmployerNIParams(taxYear: TaxYear): { threshold: number; rate: number } {
  const niRates = TAX_RATES[taxYear].nationalInsurance.employer.A.secondary;
  return { threshold: niRates.threshold, rate: niRates.rate / 100 };
}

/**
 * Calculate Employee NI assuming no threshold benefit (for people with other PAYE)
 * When you have another PAYE job, your Primary Threshold is used there,
 * so any salary from this company is subject to NI from the first pound.
 */
function getEmployeeNIWithNoThreshold(salary: number, taxYear: TaxYear): number {
  if (salary <= 0) return 0;

  const rates = TAX_RATES[taxYear];
  const employeeRates = rates.nationalInsurance.employee.A;
  const upperEarningsLimit = employeeRates.upper.threshold;
  const primaryRate = employeeRates.primary.rate / 100;
  const upperRate = employeeRates.upper.rate / 100;

  let employeeNI = 0;

  // NI on all earnings up to UEL at primary rate (no threshold)
  const earningsInPrimaryBand = Math.min(salary, upperEarningsLimit);
  if (earningsInPrimaryBand > 0) {
    employeeNI += earningsInPrimaryBand * primaryRate;
  }

  // NI on earnings above UEL
  if (salary > upperEarningsLimit) {
    employeeNI += (salary - upperEarningsLimit) * upperRate;
  }

  return Math.round(employeeNI * 100) / 100;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function calculateStrategyComparison(
  input: StrategyInput,
  taxYear: TaxYear = '2025-2026'
): StrategyComparison {
  const otherIncome = input.otherIncome ?? 0;
  const hasEA = input.employmentAllowance ?? false;
  const studentLoanPlans = input.studentLoanPlans ?? [];
  const pensionContribution = input.pensionContribution ?? 0;
  const companyCarBIK = input.companyCarBIK ?? 0;
  const minimumSalary = input.minimumSalaryRequirement ?? 0;
  const hasOtherPAYE = input.hasOtherPAYEEmployment ?? false;

  // Calculate gross profit (after pension - employer contribution reduces distributable profit)
  const netRevenue = input.includesVat ? input.revenue / (1 + VAT_RATE) : input.revenue;
  const grossProfitBeforePension = netRevenue - input.expenses;
  const grossProfit = Math.max(0, grossProfitBeforePension - pensionContribution);

  // Calculate each strategy
  const allSalary = calculateAllSalaryStrategy(
    grossProfit,
    input.region,
    taxYear,
    otherIncome,
    hasEA,
    studentLoanPlans,
    pensionContribution,
    companyCarBIK,
    hasOtherPAYE
  );
  const optimalMix = calculateOptimalMixStrategy(
    grossProfit,
    input.region,
    taxYear,
    otherIncome,
    hasEA,
    studentLoanPlans,
    pensionContribution,
    companyCarBIK,
    minimumSalary,
    hasOtherPAYE
  );
  const allDividends = calculateAllDividendsStrategy(
    grossProfit,
    input.region,
    taxYear,
    otherIncome,
    studentLoanPlans,
    pensionContribution,
    companyCarBIK
  );

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
      grossProfit,
      input.region,
      taxYear,
      otherIncome,
      hasEA,
      studentLoanPlans,
      pensionContribution,
      companyCarBIK,
      input.yourSetupSalary ?? 0,
      input.yourSetupDividends ?? 0,
      optimalMix.takeHome
    );
    strategies.yourSetup = yourSetup;
  }

  // Calculate savings
  const savingsVsAllSalary = maxTakeHome - allSalary.takeHome;

  return {
    grossProfit: round(grossProfitBeforePension),
    strategies,
    recommended,
    savingsVsAllSalary: round(savingsVsAllSalary),
  };
}

// ============================================================================
// STRATEGY CALCULATORS
// ============================================================================

function calculateAllSalaryStrategy(
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean,
  studentLoanPlans: StudentLoanPlan[],
  pension: number,
  companyCarBIK: number,
  hasOtherPAYE: boolean = false
): StrategyResult {
  if (grossProfit <= 0) {
    return createEmptyResult('All Salary');
  }

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

    if (grossProfit <= maxSalaryWithFullEA) {
      // EA covers all employer NI, so salary = profit
      salary = grossProfit;
      employerNI = Math.max(0, getEmployerNI(salary, taxYear) - employmentAllowance);
    } else {
      // Profit exceeds what EA can cover
      // Profit = Salary + (EmployerNI - EA)
      // Salary = (Profit + niThreshold * niRate + EA) / (1 + niRate)
      salary = (grossProfit + niThreshold * niRate + employmentAllowance) / (1 + niRate);
      salary = Math.floor(salary);
      employerNI = Math.max(0, getEmployerNI(salary, taxYear) - employmentAllowance);
    }
  } else {
    // No EA - original calculation
    if (grossProfit <= niThreshold) {
      salary = grossProfit;
    } else {
      salary = (grossProfit + niThreshold * niRate) / (1 + niRate);
    }
    salary = Math.floor(salary);
    employerNI = getEmployerNI(salary, taxYear);
  }

  // Verify we're within budget
  if (salary + employerNI > grossProfit) {
    salary -= 1; // Adjust if rounding caused overflow
  }

  // If other PAYE employment, NI threshold already used - pay NI from first pound
  const employeeNI = hasOtherPAYE
    ? getEmployeeNIWithNoThreshold(salary, taxYear)
    : getEmployeeNI(salary, taxYear);
  // Income tax is on salary + other income + BIK, but we only show the tax portion attributable to salary + BIK
  const totalIncomeTax = getIncomeTax(salary + otherIncome + companyCarBIK, region, taxYear);
  const baseIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
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
    salary: round(salary),
    dividends,
    pension: round(pension),
    companyCarBIK: round(companyCarBIK),
    employerNI: round(employerNI),
    employeeNI: round(employeeNI),
    incomeTax: round(incomeTax),
    corporationTax,
    dividendTax,
    studentLoan: round(studentLoan),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
  };
}

// Helper to calculate take-home for a given salary level
// Exported for use by the salary slider
export function calculateSalaryScenario(
  targetSalary: number,
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean,
  studentLoanPlans: StudentLoanPlan[] = [],
  pension: number = 0,
  companyCarBIK: number = 0
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
  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);

  // Calculate max affordable salary (salary + employer NI ≤ grossProfit)
  let maxAffordableSalary: number;
  if (grossProfit <= niThreshold) {
    maxAffordableSalary = grossProfit;
  } else {
    maxAffordableSalary = (grossProfit + niThreshold * niRate) / (1 + niRate);
  }

  const salary = Math.min(targetSalary, maxAffordableSalary, grossProfit);
  let employerNI = getEmployerNI(salary, taxYear);

  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }

  const taxableProfit = Math.max(0, grossProfit - salary - employerNI);
  const corporationTax = getCorporationTax(taxableProfit);
  const dividends = taxableProfit - corporationTax;

  const employeeNI = getEmployeeNI(salary, taxYear);

  // Income tax includes BIK as taxable benefit
  const totalIncomeTax = getIncomeTax(salary + otherIncome + companyCarBIK, region, taxYear);
  const baseIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
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

/**
 * Internal version of calculateSalaryScenario that supports hasOtherPAYE
 * Used by the optimal strategy calculator
 */
function calculateSalaryScenarioInternal(
  targetSalary: number,
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean,
  studentLoanPlans: StudentLoanPlan[],
  pension: number,
  companyCarBIK: number,
  hasOtherPAYE: boolean
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
  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);

  // Calculate max affordable salary (salary + employer NI <= grossProfit)
  let maxAffordableSalary: number;
  if (grossProfit <= niThreshold) {
    maxAffordableSalary = grossProfit;
  } else {
    maxAffordableSalary = (grossProfit + niThreshold * niRate) / (1 + niRate);
  }

  const salary = Math.min(targetSalary, maxAffordableSalary, grossProfit);
  let employerNI = getEmployerNI(salary, taxYear);

  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }

  const taxableProfit = Math.max(0, grossProfit - salary - employerNI);
  const corporationTax = getCorporationTax(taxableProfit);
  const dividends = taxableProfit - corporationTax;

  // If other PAYE employment, NI threshold already used - pay NI from first pound
  const employeeNI = hasOtherPAYE
    ? getEmployeeNIWithNoThreshold(salary, taxYear)
    : getEmployeeNI(salary, taxYear);

  // Income tax includes BIK as taxable benefit
  const totalIncomeTax = getIncomeTax(salary + otherIncome + companyCarBIK, region, taxYear);
  const baseIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
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

function calculateOptimalMixStrategy(
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean,
  studentLoanPlans: StudentLoanPlan[],
  pension: number,
  companyCarBIK: number,
  minimumSalary: number = 0,
  hasOtherPAYE: boolean = false
): StrategyResult {
  if (grossProfit <= 0) {
    return createEmptyResult('Recommended');
  }

  const personalAllowance = getPersonalAllowance(taxYear); // £12,570
  const lowerEarningsLimit = getLowerEarningsLimit(taxYear); // £6,500

  // Build list of salary options to test
  const salaryOptions = [personalAllowance, lowerEarningsLimit];

  // Add minimum salary requirement if it's higher than existing options
  if (minimumSalary > 0 && minimumSalary > personalAllowance) {
    salaryOptions.push(minimumSalary);
  }

  // Calculate take-home for all salary options
  const scenarios = salaryOptions.map((targetSalary) => {
    // If minimum salary is set, enforce it as the floor
    const effectiveSalary = Math.max(targetSalary, minimumSalary);
    const scenario = calculateSalaryScenarioInternal(
      effectiveSalary,
      grossProfit,
      region,
      taxYear,
      otherIncome,
      hasEmploymentAllowance,
      studentLoanPlans,
      pension,
      companyCarBIK,
      hasOtherPAYE
    );
    return scenario;
  });

  // Pick the scenario with highest take-home
  // In most cases, £12,570 (PA) salary wins because:
  // - Extra salary saves more in CT than it costs in Employer NI
  // - £6,070 extra salary saves ~£1,500 CT (25%) but costs only ~£910 Employer NI (15%)
  // With EA, the advantage is even larger since Employer NI is offset
  const bestScenario = scenarios.reduce((best, current) =>
    current.takeHome > best.takeHome ? current : best
  );

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

  const name = 'Recommended';

  return {
    name,
    salary: round(salary),
    dividends: round(dividends),
    pension: round(pension),
    companyCarBIK: round(companyCarBIK),
    employerNI: round(employerNI),
    employeeNI: round(employeeNI),
    incomeTax: round(incomeTax),
    corporationTax: round(corporationTax),
    dividendTax: round(dividendTax),
    studentLoan: round(studentLoan),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
  };
}

function calculateAllDividendsStrategy(
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  studentLoanPlans: StudentLoanPlan[],
  pension: number,
  companyCarBIK: number
  // Note: Employment Allowance not passed - with £0 salary, there's no employer NI to offset
): StrategyResult {
  if (grossProfit <= 0) {
    return createEmptyResult('All Dividends');
  }

  const salary = 0;
  const employerNI = 0; // No salary = no employer NI (EA irrelevant)
  const employeeNI = 0;

  // BIK is still taxable even with £0 salary
  const bikIncomeTax =
    companyCarBIK > 0
      ? getIncomeTax(otherIncome + companyCarBIK, region, taxYear) -
        getIncomeTax(otherIncome, region, taxYear)
      : 0;
  const incomeTax = bikIncomeTax;

  // All profit goes through corporation tax
  const corporationTax = getCorporationTax(grossProfit);
  const dividends = grossProfit - corporationTax;
  // Dividend tax - BIK uses up some of the tax bands
  const dividendTax = getDividendTax(dividends, otherIncome + companyCarBIK, taxYear);

  // Student loan on total income (dividends + BIK + other income for this strategy)
  const totalIncome = dividends + otherIncome + companyCarBIK;
  const studentLoanResult = getStudentLoanRepayment(totalIncome, studentLoanPlans, taxYear);
  const studentLoan = studentLoanResult.total;

  const totalPersonalTax = incomeTax + dividendTax + studentLoan;
  const companyCost = corporationTax;
  const takeHome = dividends - incomeTax - dividendTax - studentLoan;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'All Dividends',
    salary,
    dividends: round(dividends),
    pension: round(pension),
    companyCarBIK: round(companyCarBIK),
    employerNI,
    employeeNI,
    incomeTax: round(incomeTax),
    corporationTax: round(corporationTax),
    dividendTax: round(dividendTax),
    studentLoan: round(studentLoan),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
  };
}

/**
 * Calculate "Your Setup" strategy based on user-provided salary and dividends
 * This allows users to compare their current arrangement against optimal
 */
function calculateYourSetupStrategy(
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean,
  studentLoanPlans: StudentLoanPlan[],
  pension: number,
  companyCarBIK: number,
  userSalary: number,
  userDividends: number,
  optimalTakeHome: number
): YourSetupResult {
  const salary = userSalary;
  const dividends = userDividends;

  // Check if user's setup exceeds available profit (DLA warning)
  let employerNI = getEmployerNI(salary, taxYear);
  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }

  // Company cost for salary = salary + employer NI
  // Profit available for dividends = grossProfit - salary - employerNI - CT on remaining
  const costOfSalary = salary + employerNI;
  const profitAfterSalary = Math.max(0, grossProfit - costOfSalary);
  const ctOnRemaining = getCorporationTax(profitAfterSalary);
  const maxDividends = profitAfterSalary - ctOnRemaining;

  // Flag if user setup exceeds what's available
  const exceedsProfit = salary + dividends > salary + maxDividends || costOfSalary > grossProfit;

  // Calculate taxes on user's setup
  const employeeNI = getEmployeeNI(salary, taxYear);

  // Income tax on salary + other income + BIK
  const totalIncomeTax = getIncomeTax(salary + otherIncome + companyCarBIK, region, taxYear);
  const baseIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
  const incomeTax = totalIncomeTax - baseIncomeTax;

  // Corporation tax: based on profit minus salary cost
  const corporationTax = getCorporationTax(Math.max(0, grossProfit - costOfSalary));

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
    salary: round(salary),
    dividends: round(dividends),
    pension: round(pension),
    companyCarBIK: round(companyCarBIK),
    employerNI: round(employerNI),
    employeeNI: round(employeeNI),
    incomeTax: round(incomeTax),
    corporationTax: round(corporationTax),
    dividendTax: round(dividendTax),
    studentLoan: round(studentLoan),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
    deltaVsOptimal: round(deltaVsOptimal),
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

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
