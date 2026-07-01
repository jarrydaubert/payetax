/**
 * Shared Personal Allowance taper helper.
 *
 * The UK Personal Allowance is reduced by £1 for every £2 of adjusted net
 * income above the reduction threshold. Keep this calculation central so
 * salary and dividend paths apply the same taper.
 */

import { CURRENT_TAX_YEAR, TAX_RATES, type TaxYear } from '@/constants/taxRates';

export function getAdjustedPersonalAllowance(
  totalIncome: number,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): number {
  const rates = TAX_RATES[taxYear];
  const basePersonalAllowance = rates.personalAllowance;

  if (!Number.isFinite(totalIncome) || totalIncome <= rates.personalAllowanceReductionThreshold) {
    return basePersonalAllowance;
  }

  const reduction = Math.floor(
    (totalIncome - rates.personalAllowanceReductionThreshold) *
      rates.personalAllowanceReductionRate,
  );

  return Math.max(0, basePersonalAllowance - reduction);
}
