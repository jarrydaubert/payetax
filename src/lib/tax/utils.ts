/**
 * Shared tax calculation utilities.
 */

/**
 * Round monetary values to the nearest penny.
 */
export function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Convert a TAXABLE-income band threshold to the TOTAL income it corresponds to,
 * accounting for the Personal Allowance taper.
 *
 * Band thresholds are stored in taxable-income terms (per the Scottish Rate
 * Resolution / ITA 2007). Published "total income" tables only equal
 * threshold + PA while the full allowance is available. Inside the taper
 * (total income £100k-£125,140) each £1 of extra income adds £1.50 of taxable
 * income, and once the PA is fully tapered taxable equals total.
 */
export function taxableThresholdToTotalIncome(
  threshold: number,
  personalAllowance: number,
  taperThreshold: number,
): number {
  const taperStartTaxable = taperThreshold - personalAllowance;
  const paExhaustedTaxable = taperThreshold + 2 * personalAllowance;

  if (threshold <= taperStartTaxable) {
    return threshold + personalAllowance;
  }
  if (threshold >= paExhaustedTaxable) {
    return threshold;
  }
  return Math.round((threshold + taperThreshold / 2 + personalAllowance) / 1.5);
}
