/**
 * Student Loan Repayment Calculator
 *
 * Calculates student loan repayments based on total income (salary + dividends)
 * for Self Assessment filers (most directors).
 *
 * IMPORTANT: For directors, student loan is calculated on TOTAL income via Self Assessment,
 * NOT just salary. The "dividends avoid student loans" myth is false.
 *
 * @module lib/tax/studentLoan
 */

import type { StudentLoanPlan, TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';

export interface StudentLoanResult {
  plan1: number;
  plan2: number;
  plan4: number;
  plan5: number;
  postgrad: number;
  total: number;
}

/**
 * Calculate student loan repayments for a given total income
 *
 * @param totalIncome - Total income (salary + dividends + other income)
 * @param plans - Array of student loan plans the person has
 * @param taxYear - Tax year for thresholds
 * @returns Breakdown of repayments by plan and total
 */
export function getStudentLoanRepayment(
  totalIncome: number,
  plans: StudentLoanPlan[],
  taxYear: TaxYear = '2025-2026'
): StudentLoanResult {
  const rates = TAX_RATES[taxYear].studentLoan;

  const result: StudentLoanResult = {
    plan1: 0,
    plan2: 0,
    plan4: 0,
    plan5: 0,
    postgrad: 0,
    total: 0,
  };

  if (totalIncome <= 0 || plans.length === 0) {
    return result;
  }

  for (const plan of plans) {
    const { threshold, rate } = rates[plan];
    if (totalIncome > threshold) {
      const repayment = Math.floor((totalIncome - threshold) * (rate / 100));
      result[plan] = repayment;
      result.total += repayment;
    }
  }

  return result;
}

/**
 * Get student loan threshold for a specific plan
 */
export function getStudentLoanThreshold(
  plan: StudentLoanPlan,
  taxYear: TaxYear = '2025-2026'
): number {
  return TAX_RATES[taxYear].studentLoan[plan].threshold;
}

/**
 * Get student loan rate for a specific plan
 */
export function getStudentLoanRate(
  plan: StudentLoanPlan,
  taxYear: TaxYear = '2025-2026'
): number {
  return TAX_RATES[taxYear].studentLoan[plan].rate;
}

/**
 * Get human-readable plan name
 */
export function getStudentLoanPlanName(plan: StudentLoanPlan): string {
  const names: Record<StudentLoanPlan, string> = {
    plan1: 'Plan 1 (pre-2012)',
    plan2: 'Plan 2 (post-2012 England/Wales)',
    plan4: 'Plan 4 (Scotland)',
    plan5: 'Plan 5 (post-2023)',
    postgrad: 'Postgraduate Loan',
  };
  return names[plan];
}
