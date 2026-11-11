import { calculateTax } from '@/lib/taxCalculator';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { roundToPence } from './utils';

/** Reject impossible net-pay payroll estimates at user-facing boundaries. */
export function getPayePensionInputIssue(
  input: TaxCalculationInput,
  results: TaxCalculationResults,
): string | undefined {
  if (results.pensionMethod !== 'net-pay' || results.pensionContribution.annually <= 0) return;

  // A pension from the main job must leave enough cash in that job's payroll.
  const primaryNetPay =
    input.incomeSources?.length || input.allowancesDeductions
      ? calculateTax({ ...input, incomeSources: undefined, allowancesDeductions: 0 }).netPay
          .annually
      : results.netPay.annually;

  // The annual display can expose a shortfall that rounds to zero in a single month.
  if (roundToPence(-Math.min(primaryNetPay, results.netPay.annually)) > 0) {
    return 'Reduce the net-pay pension contribution to leave enough pay for your other deductions.';
  }
}
