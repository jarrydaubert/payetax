// src/lib/taxRateDescriptions.ts
import { TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { formatCurrency } from './utils';

/**
 * Generate tax rate descriptions dynamically from constants
 * This ensures only constants file needs updates when tax rates change
 */
export function getTaxRateDescription(taxYear: TaxYear = '2025-2026'): string {
  const rates = TAX_RATES[taxYear];
  if (!rates) return 'Tax rates not available for this year';

  const bands = rates.bands;
  const personalAllowance = rates.personalAllowance;
  
  // Build description from actual tax bands
  const bandDescriptions = bands.map((band, index) => {
    const prevThreshold = index === 0 ? personalAllowance : bands[index - 1].threshold;
    const rate = Math.round(band.rate * 100);
    
    if (band.threshold === Infinity) {
      return `${rate}% additional rate (above ${formatCurrency(prevThreshold)})`;
    }
    
    return `${rate}% ${band.name.toLowerCase()} rate (${formatCurrency(prevThreshold)}-${formatCurrency(band.threshold)})`;
  }).join(', ');

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
  return TAX_RATES['2025-2026'] ? '2025-2026' : 'current tax year';
}

/**
 * Get personal allowance for a tax year
 */
export function getPersonalAllowance(taxYear: TaxYear = '2025-2026'): number {
  return TAX_RATES[taxYear]?.personalAllowance || 12570;
}

/**
 * Get default tax code with allowance explanation
 */
export function getTaxCodeExplanation(taxCode: string = '1257L'): string {
  const numericPart = parseInt(taxCode.replace(/[^0-9]/g, ''));
  const allowance = numericPart * 10;
  return `${taxCode} means ${formatCurrency(allowance)} tax-free allowance`;
}