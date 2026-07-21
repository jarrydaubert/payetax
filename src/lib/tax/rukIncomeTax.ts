/**
 * Shared rest-of-UK progressive income-tax band mechanic.
 *
 * This slicer works only with taxable income and taxable-income boundaries.
 * Personal Allowance, its taper, tax-code overrides, pay-period conversion and
 * payroll rounding are deliberately owned by callers so annual and PAYE paths
 * can share the same band allocation without conflating their different bases.
 *
 * It intentionally stays separate from `sliceScottishTaxableIncome`: the two
 * regimes share a shape but are owned as distinct mechanics, not a generic
 * rules engine.
 */

export interface RukTaxableIncomeBand {
  name: string;
  rate: number;
  taxableIncomeUpperBound: number;
}

export interface RukTaxBandSlice {
  name: string;
  rate: number;
  taxableIncomeLowerBound: number;
  taxableIncomeUpperBound: number;
  taxableAmount: number;
  tax: number;
}

export interface RukTaxBandCalculation {
  taxableIncome: number;
  incomeTax: number;
  slices: RukTaxBandSlice[];
}

/**
 * Allocate taxable income across cumulative rest-of-UK taxable-income bands.
 *
 * All monetary inputs must use the same unit. Annual callers pass annual
 * taxable income and annual boundaries; PAYE callers pass period taxable income
 * and period boundaries after applying their own rounding rules. Each band is
 * applied exactly once; tax per band is `(taxableAmount * rate) / 100`,
 * unrounded — the ordering the engine and marriage-allowance loops used. The
 * replaced standalone `calculateIncomeTax` loop used `amount * (rate / 100)`;
 * the two orderings agree to within one ulp and to the penny after rounding.
 */
export function sliceRukTaxableIncome(
  taxableIncome: number,
  bands: readonly RukTaxableIncomeBand[],
): RukTaxBandCalculation {
  const normalizedTaxableIncome =
    Number.isFinite(taxableIncome) && taxableIncome > 0 ? taxableIncome : 0;
  const slices: RukTaxBandSlice[] = [];
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
      const tax = (taxableAmount * band.rate) / 100;
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
