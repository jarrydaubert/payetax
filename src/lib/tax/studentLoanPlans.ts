import { CURRENT_TAX_YEAR, type StudentLoanPlan, type TaxYear } from '@/constants/taxRates';

/**
 * All supported student loan plans in the codebase.
 */
export const DIRECTOR_SUPPORTED_STUDENT_LOAN_PLANS = [
  'plan1',
  'plan2',
  'plan4',
  'plan5',
  'postgrad',
] as const satisfies readonly StudentLoanPlan[];

/**
 * Director Guide availability differs by tax year.
 * Keep this mapping explicit so future tax-year rollovers update here once.
 */
export const DIRECTOR_STUDENT_LOAN_PLANS_BY_TAX_YEAR: Record<TaxYear, readonly StudentLoanPlan[]> =
  {
    // Plan 5 is intentionally excluded in director flows until rollout criteria are confirmed.
    // Core PAYE calculator still supports Plan 5 for employee scenarios.
    '2023-2024': ['plan1', 'plan2', 'plan4', 'postgrad'],
    '2024-2025': ['plan1', 'plan2', 'plan4', 'postgrad'],
    '2025-2026': ['plan1', 'plan2', 'plan4', 'postgrad'],
  };

export function getAvailableDirectorStudentLoanPlans(
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): readonly StudentLoanPlan[] {
  return (
    DIRECTOR_STUDENT_LOAN_PLANS_BY_TAX_YEAR[taxYear] ??
    DIRECTOR_STUDENT_LOAN_PLANS_BY_TAX_YEAR[CURRENT_TAX_YEAR]
  );
}

export function isDirectorStudentLoanPlanAvailable(
  plan: StudentLoanPlan,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): boolean {
  return getAvailableDirectorStudentLoanPlans(taxYear).includes(plan);
}

export function sanitizeDirectorStudentLoanPlans(
  plans: StudentLoanPlan[],
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): StudentLoanPlan[] {
  const allowed = new Set(getAvailableDirectorStudentLoanPlans(taxYear));
  return plans.filter((plan) => allowed.has(plan));
}
