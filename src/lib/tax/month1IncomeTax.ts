/**
 * HMRC computerised Month 1 progressive Income Tax routine.
 *
 * PAYE routines v24.0 deliberately uses two forms of each accrued band limit:
 * - Cvalue/SCvalue (the exact threshold rounded up to a whole pound) selects the formula;
 * - the exact threshold and exact threshold tax are used inside that formula.
 *
 * The same routine and final-penny round-down apply to rUK, Welsh and Scottish
 * taxpayers; the selected policy bands provide the regional rates and limits.
 * See PAYE routines v24.0 definitions 9–11.1 and paragraphs 4.4.3–4.4.4.
 */

export interface Month1IncomeTaxBand {
  rate: number;
  taxableIncomeUpperBound: number;
}

export interface Month1IncomeTaxCalculation {
  cvalue: number;
  exactThreshold: number;
  exactThresholdTax: number;
  formulaIndex: number;
  incomeTaxAtFourDecimals: number;
  wholePoundTaxablePay: number;
}

const PAYE_MONTHS = 12;
const WHOLE_POUND_PRECISION = 0;
const PAYE_WORKING_PRECISION = 4;
const PENNY_PRECISION = 2;
const FLOATING_POINT_TOLERANCE_MULTIPLIER = 8;

/**
 * Remove only binary floating-point noise before applying HMRC's downward
 * decimal truncation. The tolerance is several orders of magnitude smaller
 * than the routine's four-decimal calculation precision.
 */
function truncatePayeDecimal(value: number, decimalPlaces: number): number {
  const scale = 10 ** decimalPlaces;
  const scaledValue = value * scale;
  const floatingPointTolerance =
    Number.EPSILON * Math.max(1, Math.abs(scaledValue)) * FLOATING_POINT_TOLERANCE_MULTIPLIER;

  return Math.floor(scaledValue + floatingPointTolerance) / scale;
}

function isAtOrBelowPayeLimit(value: number, limit: number): boolean {
  const floatingPointTolerance =
    Number.EPSILON *
    Math.max(1, Math.abs(value), Math.abs(limit)) *
    FLOATING_POINT_TOLERANCE_MULTIPLIER;
  return value <= limit + floatingPointTolerance;
}

export function getExactMonth1Threshold(annualThreshold: number): number {
  if (!Number.isFinite(annualThreshold)) {
    return Number.POSITIVE_INFINITY;
  }

  return truncatePayeDecimal(annualThreshold / PAYE_MONTHS, PAYE_WORKING_PRECISION);
}

export function getMonth1Cvalue(annualThreshold: number): number {
  return Math.ceil(getExactMonth1Threshold(annualThreshold));
}

export function roundDownPayeTaxToPence(tax: number): number {
  return truncatePayeDecimal(Math.max(0, tax), PENNY_PRECISION);
}

export function getWholePoundMonth1TaxablePay(taxablePay: number): number {
  const normalizedTaxablePay = Number.isFinite(taxablePay) ? Math.max(0, taxablePay) : 0;
  return truncatePayeDecimal(normalizedTaxablePay, WHOLE_POUND_PRECISION);
}

function getAnnualThresholdTax(
  bands: readonly Month1IncomeTaxBand[],
  upperBandIndex: number,
): number {
  let lowerBound = 0;
  let tax = 0;

  for (let index = 0; index <= upperBandIndex; index += 1) {
    const band = bands[index];
    if (!(band && Number.isFinite(band.taxableIncomeUpperBound))) break;

    tax += ((band.taxableIncomeUpperBound - lowerBound) * band.rate) / 100;
    lowerBound = band.taxableIncomeUpperBound;
  }

  return tax;
}

export function calculateMonth1ProgressiveIncomeTax(
  taxablePay: number,
  bands: readonly Month1IncomeTaxBand[],
): Month1IncomeTaxCalculation {
  const normalizedTaxablePay = Number.isFinite(taxablePay) ? Math.max(0, taxablePay) : 0;
  const wholePoundTaxablePay = getWholePoundMonth1TaxablePay(normalizedTaxablePay);

  if (wholePoundTaxablePay === 0 || bands.length === 0) {
    return {
      cvalue: 0,
      exactThreshold: 0,
      exactThresholdTax: 0,
      formulaIndex: 0,
      incomeTaxAtFourDecimals: 0,
      wholePoundTaxablePay,
    };
  }

  const selectedBandIndex = bands.findIndex((band) =>
    isAtOrBelowPayeLimit(normalizedTaxablePay, getMonth1Cvalue(band.taxableIncomeUpperBound)),
  );
  const formulaIndex = selectedBandIndex === -1 ? bands.length - 1 : selectedBandIndex;
  const selectedBand = bands[formulaIndex];

  if (!selectedBand) {
    throw new Error('Month 1 PAYE formula selection requires at least one tax band');
  }

  const previousBand = formulaIndex > 0 ? bands[formulaIndex - 1] : undefined;
  const exactThreshold = previousBand
    ? getExactMonth1Threshold(previousBand.taxableIncomeUpperBound)
    : 0;
  const cvalue = previousBand ? getMonth1Cvalue(previousBand.taxableIncomeUpperBound) : 0;
  const exactThresholdTax = previousBand
    ? truncatePayeDecimal(
        getAnnualThresholdTax(bands, formulaIndex - 1) / PAYE_MONTHS,
        PAYE_WORKING_PRECISION,
      )
    : 0;
  const formulaTax =
    exactThresholdTax + ((wholePoundTaxablePay - exactThreshold) * selectedBand.rate) / 100;

  return {
    cvalue,
    exactThreshold,
    exactThresholdTax,
    formulaIndex,
    incomeTaxAtFourDecimals: truncatePayeDecimal(formulaTax, PAYE_WORKING_PRECISION),
    wholePoundTaxablePay,
  };
}
