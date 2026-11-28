import { roundToPence, type SalaryScenarioResult } from '@/lib/tax';

export const DIRECTOR_BUDGET_NOTE =
  'Illustrative annual budgets before payroll credits and amounts paid. The personal budget excludes employee NI, which payroll collects. These costs are already reflected in take-home and company allocations. Outstanding balances depend on what has been paid or withheld.';

export function projectDirectorFinancials(
  profitAfterBusinessExpenses: number,
  scenario: SalaryScenarioResult,
) {
  const profitAfterPension = roundToPence(profitAfterBusinessExpenses - scenario.pension);
  const companyTaxBudget = roundToPence(scenario.corporationTax + scenario.employerNI);
  const personalDeductions = scenario.totalPersonalTax;
  const personalBudget = roundToPence(personalDeductions - scenario.employeeNI);

  // The extraction engine floors its post-pension budget at zero. Restore the
  // deficit when explaining how the entered costs compare with period profit.
  const companyBalance = roundToPence(
    Math.min(0, profitAfterPension) + scenario.retainedProfit - scenario.companyShortfall,
  );

  return {
    scenario,
    profitAfterBusinessExpenses,
    profitAfterPension,
    companyBalance,
    companyBalanceLabel:
      companyBalance < 0 ? 'Deficit against period profit' : 'Profit retained this period',
    companyTaxBudget,
    personalBudget,
    grossPersonalCash: roundToPence(scenario.salary + scenario.dividends),
    personalDeductions,
    totalNI: roundToPence(scenario.employerNI + scenario.employeeNI),
    totalTax: roundToPence(scenario.corporationTax + scenario.incomeTax + scenario.dividendTax),
  };
}

export type DirectorFinancialPresentation = ReturnType<typeof projectDirectorFinancials>;
