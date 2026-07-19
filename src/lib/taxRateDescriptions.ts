// src/lib/taxRateDescriptions.ts
import { CURRENT_TAX_YEAR, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { formatCurrency } from './utils';

/**
 * Generate tax rate descriptions dynamically from constants
 * This ensures only constants file needs updates when tax rates change
 */
export function getTaxRateDescription(taxYear: TaxYear = CURRENT_TAX_YEAR): string {
  const rates = TAX_RATES[taxYear];
  if (!rates) return 'Tax rates not available for this year';

  const bands = rates.bands;
  const personalAllowance = rates.personalAllowance;

  // Build description from actual tax bands
  const bandDescriptions = bands
    .map((band, index) => {
      const prevThreshold = index === 0 ? personalAllowance : (bands[index - 1]?.threshold ?? 0);
      const rate = Math.round(band.rate * 100);

      if (band.threshold === Infinity) {
        return `${rate}% additional rate (above ${formatCurrency(prevThreshold)})`;
      }

      return `${rate}% ${band.name.toLowerCase()} rate (${formatCurrency(prevThreshold)}-${formatCurrency(band.threshold)})`;
    })
    .join(', ');

  // Get NI rates dynamically
  const niRates = rates.nationalInsurance.employee.A;
  const primaryNIRate = Math.round(niRates.primary.rate * 100);
  const upperNIRate = Math.round(niRates.upper.rate * 100);

  return `For the ${taxYear} tax year, the UK income tax rates are: ${bandDescriptions}. National Insurance is ${primaryNIRate}% on earnings between ${formatCurrency(personalAllowance)}-${formatCurrency(niRates.upper.threshold)} and ${upperNIRate}% above that.`;
}

/**
 * Get current tax year label
 */
export function getCurrentTaxYearLabel(): string {
  return TAX_RATES[CURRENT_TAX_YEAR] ? CURRENT_TAX_YEAR : 'current tax year';
}

/**
 * Get personal allowance for a tax year
 */
export function getPersonalAllowance(taxYear: TaxYear = CURRENT_TAX_YEAR): number {
  const fallbackAllowance = TAX_RATES[CURRENT_TAX_YEAR]?.personalAllowance ?? 0;
  return TAX_RATES[taxYear]?.personalAllowance ?? fallbackAllowance;
}
