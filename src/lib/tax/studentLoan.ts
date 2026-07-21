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

import {
  CURRENT_TAX_YEAR,
  type StudentLoanPlan,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import { roundToPence } from './utils';

export interface StudentLoanResult {
  plan1: number;
  plan2: number;
  plan4: number;
  plan5: number;
  postgrad: number;
  total: number;
}

export interface StudentLoanPlanPolicy {
  threshold: number;
  rate: number;
}

export interface StudentLoanPlanRepayment {
  plan: StudentLoanPlan;
  repayment: number;
}

export interface StudentLoanRepaymentCalculation {
  repayments: StudentLoanPlanRepayment[];
  total: number;
}

/**
 * Shared Student Loan repayment mechanic.
 *
 * Works only with an income amount and threshold/rate policy expressed in the
 * same pay basis: annual callers pass annual income with annual thresholds,
 * PAYE callers pass period income with period thresholds. Policy selection,
 * basis conversion, the employment-vs-total-income decision and all rounding
 * are deliberately owned by callers.
 *
 * Each selected plan is calculated independently and summed (HMRC rules).
 * Repayments are unrounded, computed as `((income - threshold) * rate) / 100`
 * — the PAYE engine's historical ordering, preserved bit-for-bit for every
 * whole-pound salary. The replaced Self Assessment loop used
 * `excess * (rate / 100)`; the orderings agree except when a fractional-pound
 * income lands a plan exactly on a half-penny, where the rounded result can
 * move by one penny. Plans without a matching policy entry or with income at
 * or below their threshold contribute nothing. Policy values are trusted as
 * given: a non-finite threshold or rate propagates into the result rather
 * than being silently repaired.
 */
export function sliceStudentLoanRepayments(
  income: number,
  plans: readonly StudentLoanPlan[],
  policy: Readonly<Partial<Record<StudentLoanPlan, StudentLoanPlanPolicy>>>,
): StudentLoanRepaymentCalculation {
  const normalizedIncome = Number.isFinite(income) && income > 0 ? income : 0;
  const repayments: StudentLoanPlanRepayment[] = [];
  let total = 0;

  for (const plan of plans) {
    const planPolicy = policy[plan];
    if (!planPolicy) continue;

    if (normalizedIncome > planPolicy.threshold) {
      const repayment = ((normalizedIncome - planPolicy.threshold) * planPolicy.rate) / 100;
      repayments.push({ plan, repayment });
      total += repayment;
    }
  }

  return { repayments, total };
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
  plans: readonly StudentLoanPlan[],
  taxYear: TaxYear = CURRENT_TAX_YEAR,
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

  // Self Assessment rounding convention: round each plan to pence, then the
  // total of the rounded repayments.
  for (const { plan, repayment } of sliceStudentLoanRepayments(totalIncome, plans, rates)
    .repayments) {
    const rounded = roundToPence(repayment);
    result[plan] = rounded;
    result.total += rounded;
  }

  result.total = roundToPence(result.total);

  return result;
}

/**
 * Get student loan threshold for a specific plan
 */
export function getStudentLoanThreshold(
  plan: StudentLoanPlan,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): number {
  return TAX_RATES[taxYear].studentLoan[plan].threshold;
}

/**
 * Get student loan rate for a specific plan
 */
export function getStudentLoanRate(
  plan: StudentLoanPlan,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
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
