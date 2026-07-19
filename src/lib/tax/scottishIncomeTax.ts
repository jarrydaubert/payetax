/**
 * Shared Scottish progressive income-tax band mechanic.
 *
 * This slicer works only with taxable income and taxable-income boundaries.
 * Personal Allowance, its taper, pay-period conversion and payroll rounding are
 * deliberately owned by callers so annual and PAYE paths can share the same
 * band allocation without conflating their different bases.
 */

export interface ScottishTaxableIncomeBand {
  name: string;
  rate: number;
  taxableIncomeUpperBound: number;
}

export interface ScottishTaxBandSlice {
  name: string;
  rate: number;
  taxableIncomeLowerBound: number;
  taxableIncomeUpperBound: number;
  taxableAmount: number;
  tax: number;
}

export interface ScottishTaxBandCalculation {
  taxableIncome: number;
  incomeTax: number;
  slices: ScottishTaxBandSlice[];
}

/**
 * Allocate taxable income across cumulative Scottish taxable-income bands.
 *
 * All monetary inputs must use the same unit. Annual callers pass annual
 * taxable income and annual boundaries; PAYE callers pass period taxable income
 * and period boundaries after applying their own rounding rules.
 */
export function sliceScottishTaxableIncome(
  taxableIncome: number,
  bands: readonly ScottishTaxableIncomeBand[],
): ScottishTaxBandCalculation {
  const normalizedTaxableIncome =
    Number.isFinite(taxableIncome) && taxableIncome > 0 ? taxableIncome : 0;
  const slices: ScottishTaxBandSlice[] = [];
  let incomeTax = 0;
  let taxableIncomeLowerBound = 0;

  for (const band of bands) {
    const taxableIncomeUpperBound = Number.isFinite(band.taxableIncomeUpperBound)
      ? Math.max(taxableIncomeLowerBound, band.taxableIncomeUpperBound)
      : Number.POSITIVE_INFINITY;
    const taxableAmount = Math.max(
      0,
      Math.min(normalizedTaxableIncome, taxableIncomeUpperBound) - taxableIncomeLowerBound,
    );

    if (taxableAmount > 0) {
      const tax = taxableAmount * (band.rate / 100);
      slices.push({
        name: band.name,
        rate: band.rate,
        taxableIncomeLowerBound,
        taxableIncomeUpperBound,
        taxableAmount,
        tax,
      });
      incomeTax += tax;
    }

    if (normalizedTaxableIncome <= taxableIncomeUpperBound) break;
    taxableIncomeLowerBound = taxableIncomeUpperBound;
  }

  return {
    taxableIncome: normalizedTaxableIncome,
    incomeTax,
    slices,
  };
}
