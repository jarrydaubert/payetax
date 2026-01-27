/**
 * Strategy Comparison Calculator
 *
 * Compares three extraction strategies for company directors:
 * 1. All Salary - Take entire profit as salary
 * 2. Optimal Mix - £12,570 salary + dividends (tax efficient)
 * 3. All Dividends - £0 salary, all dividends
 *
 * @module lib/tax/strategyComparison
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';
import type { Region } from '@/lib/validation/directorValidation';
import { getCorporationTax } from './corporationTax';
import { getDividendTax } from './dividendTax';
import { getEmployeeNI } from './employeeNI';
import { getEmployerNI } from './employerNI';
import { getIncomeTax } from './incomeTax';

// ============================================================================
// TYPES
// ============================================================================

export interface StrategyInput {
  region: Region;
  revenue: number;
  includesVat: boolean;
  expenses: number;
  otherIncome?: number;
  employmentAllowance?: boolean;
}

export interface StrategyResult {
  name: string;
  salary: number;
  dividends: number;
  employerNI: number;
  employeeNI: number;
  incomeTax: number;
  corporationTax: number;
  dividendTax: number;
  totalPersonalTax: number;
  companyCost: number;
  takeHome: number;
  effectiveRate: number;
}

export interface StrategyComparison {
  grossProfit: number;
  strategies: {
    allSalary: StrategyResult;
    optimalMix: StrategyResult;
    allDividends: StrategyResult;
  };
  recommended: 'allSalary' | 'optimalMix' | 'allDividends';
  savingsVsAllSalary: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VAT_RATE = 0.2;

// Helper to get tax year specific values
function getOptimalSalary(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].personalAllowance;
}

function getEmploymentAllowance(taxYear: TaxYear): number {
  return TAX_RATES[taxYear].nationalInsurance.employmentAllowance;
}

function getEmployerNIParams(taxYear: TaxYear): { threshold: number; rate: number } {
  const niRates = TAX_RATES[taxYear].nationalInsurance.employer.A.secondary;
  return { threshold: niRates.threshold, rate: niRates.rate / 100 };
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

  // Calculate gross profit
  const netRevenue = input.includesVat ? input.revenue / (1 + VAT_RATE) : input.revenue;
  const grossProfit = netRevenue - input.expenses;

  // Calculate each strategy
  const allSalary = calculateAllSalaryStrategy(grossProfit, input.region, taxYear, otherIncome, hasEA);
  const optimalMix = calculateOptimalMixStrategy(
    grossProfit,
    input.region,
    taxYear,
    otherIncome,
    hasEA
  );
  const allDividends = calculateAllDividendsStrategy(
    grossProfit,
    input.region,
    taxYear,
    otherIncome
  );

  // Find best strategy
  const strategies = { allSalary, optimalMix, allDividends };
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

  // Calculate savings
  const savingsVsAllSalary = maxTakeHome - allSalary.takeHome;

  return {
    grossProfit: round(grossProfit),
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
  hasEmploymentAllowance: boolean
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
    salary = salary - 1; // Adjust if rounding caused overflow
  }

  const employeeNI = getEmployeeNI(salary, taxYear);
  // Income tax is on salary + other income, but we only show the tax portion attributable to salary
  const totalIncomeTax = getIncomeTax(salary + otherIncome, region, taxYear);
  const otherIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
  const incomeTax = totalIncomeTax - otherIncomeTax; // Marginal tax from salary
  const corporationTax = 0; // All profit used for salary
  const dividends = 0;
  const dividendTax = 0;

  const totalPersonalTax = incomeTax + employeeNI + dividendTax;
  const companyCost = salary + employerNI;
  const takeHome = salary - incomeTax - employeeNI;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'All Salary',
    salary: round(salary),
    dividends,
    employerNI: round(employerNI),
    employeeNI: round(employeeNI),
    incomeTax: round(incomeTax),
    corporationTax,
    dividendTax,
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
  };
}

function calculateOptimalMixStrategy(
  grossProfit: number,
  region: Region,
  taxYear: TaxYear,
  otherIncome: number,
  hasEmploymentAllowance: boolean
): StrategyResult {
  if (grossProfit <= 0) {
    return createEmptyResult('Optimal Mix');
  }

  // Use optimal salary (personal allowance or max available)
  // Must also account for employer NI - can't spend more than gross profit
  const optimalSalary = getOptimalSalary(taxYear);
  const { threshold: niThreshold, rate: niRate } = getEmployerNIParams(taxYear);
  
  // Calculate max salary that fits within budget (salary + employer NI ≤ grossProfit)
  let maxAffordableSalary: number;
  if (grossProfit <= niThreshold) {
    maxAffordableSalary = grossProfit; // No employer NI below threshold
  } else {
    // salary + niRate × (salary - threshold) ≤ grossProfit
    // salary × (1 + niRate) ≤ grossProfit + niRate × threshold
    maxAffordableSalary = (grossProfit + niThreshold * niRate) / (1 + niRate);
  }
  
  const salary = Math.min(optimalSalary, maxAffordableSalary, grossProfit);
  let employerNI = getEmployerNI(salary, taxYear);

  // Employment Allowance reduces employer NI
  if (hasEmploymentAllowance) {
    const employmentAllowance = getEmploymentAllowance(taxYear);
    employerNI = Math.max(0, employerNI - employmentAllowance);
  }

  // Remaining profit after salary deduction
  const taxableProfit = Math.max(0, grossProfit - salary - employerNI);
  const corporationTax = getCorporationTax(taxableProfit);
  const dividends = taxableProfit - corporationTax;

  const employeeNI = getEmployeeNI(salary, taxYear);

  // Calculate marginal income tax (same method as All Salary)
  // This isolates the tax caused by the salary when other income exists
  const totalIncomeTax = getIncomeTax(salary + otherIncome, region, taxYear);
  const otherIncomeTax = otherIncome > 0 ? getIncomeTax(otherIncome, region, taxYear) : 0;
  const incomeTax = totalIncomeTax - otherIncomeTax;

  const dividendTax = getDividendTax(dividends, salary + otherIncome, taxYear);

  const totalPersonalTax = incomeTax + employeeNI + dividendTax;
  const companyCost = salary + employerNI + corporationTax;
  const takeHome = salary + dividends - incomeTax - employeeNI - dividendTax;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'Optimal Mix',
    salary: round(salary),
    dividends: round(dividends),
    employerNI: round(employerNI),
    employeeNI: round(employeeNI),
    incomeTax: round(incomeTax),
    corporationTax: round(corporationTax),
    dividendTax: round(dividendTax),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
  };
}

function calculateAllDividendsStrategy(
  grossProfit: number,
  _region: Region, // Unused - dividend tax rates are UK-wide
  taxYear: TaxYear,
  otherIncome: number
  // Note: Employment Allowance not passed - with £0 salary, there's no employer NI to offset
): StrategyResult {
  if (grossProfit <= 0) {
    return createEmptyResult('All Dividends');
  }

  const salary = 0;
  const employerNI = 0; // No salary = no employer NI (EA irrelevant)
  const employeeNI = 0;
  const incomeTax = 0;

  // All profit goes through corporation tax
  const corporationTax = getCorporationTax(grossProfit);
  const dividends = grossProfit - corporationTax;
  const dividendTax = getDividendTax(dividends, otherIncome, taxYear);

  const totalPersonalTax = dividendTax;
  const companyCost = corporationTax;
  const takeHome = dividends - dividendTax;
  const effectiveRate = grossProfit > 0 ? ((grossProfit - takeHome) / grossProfit) * 100 : 0;

  return {
    name: 'All Dividends',
    salary,
    dividends: round(dividends),
    employerNI,
    employeeNI,
    incomeTax,
    corporationTax: round(corporationTax),
    dividendTax: round(dividendTax),
    totalPersonalTax: round(totalPersonalTax),
    companyCost: round(companyCost),
    takeHome: round(takeHome),
    effectiveRate: round(effectiveRate),
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
    employerNI: 0,
    employeeNI: 0,
    incomeTax: 0,
    corporationTax: 0,
    dividendTax: 0,
    totalPersonalTax: 0,
    companyCost: 0,
    takeHome: 0,
    effectiveRate: 0,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
