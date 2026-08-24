import {
  CURRENT_TAX_YEAR,
  calculateIncomeTax,
  roundToPence,
  selectTaxPolicy,
  taxableThresholdToTotalIncome,
} from '@/lib/tax';

export const MAX_ANNUAL_SALARY = 10_000_000;

const SALARY_FORMAT_ERROR =
  'Enter a positive annual salary in whole pounds, using digits and optional commas (for example, 50,000).';

export type AnnualSalaryParseResult =
  | { success: true; salary: number }
  | { success: false; error: string };

/**
 * Accept a positive whole-pound salary written as plain digits or correctly
 * grouped thousands. The pound sign is already rendered beside the input, so
 * signs, currency symbols, decimals, spaces and partial comma groups are
 * rejected rather than silently stripped or rounded.
 */
export function parseAnnualSalaryInput(value: string): AnnualSalaryParseResult {
  const normalized = value.trim();
  const isPlainDigits = /^\d+$/.test(normalized);
  const isGroupedDigits = /^\d{1,3}(?:,\d{3})+$/.test(normalized);

  if (!(isPlainDigits || isGroupedDigits)) {
    return { success: false, error: SALARY_FORMAT_ERROR };
  }

  const salary = Number(normalized.replaceAll(',', ''));

  if (!Number.isSafeInteger(salary) || salary <= 0) {
    return { success: false, error: SALARY_FORMAT_ERROR };
  }

  if (salary > MAX_ANNUAL_SALARY) {
    return {
      success: false,
      error: `Enter an annual salary of £${MAX_ANNUAL_SALARY.toLocaleString('en-GB')} or less.`,
    };
  }

  return { success: true, salary };
}

export interface AnnualIncomeTaxComparison {
  scottishTax: number;
  rukTax: number;
  difference: number;
}

export function calculateAnnualIncomeTaxComparison(salary: number): AnnualIncomeTaxComparison {
  const scottishTax = Math.round(
    calculateIncomeTax(salary, 'scotland', CURRENT_TAX_YEAR).incomeTax,
  );
  const rukTax = Math.round(calculateIncomeTax(salary, 'rUK', CURRENT_TAX_YEAR).incomeTax);

  return {
    scottishTax,
    rukTax,
    difference: scottishTax - rukTax,
  };
}

function taxDifferenceInPence(salary: number): number {
  const scottishTax = calculateIncomeTax(salary, 'scotland', CURRENT_TAX_YEAR).incomeTax;
  const rukTax = calculateIncomeTax(salary, 'rUK', CURRENT_TAX_YEAR).incomeTax;
  return Math.round(roundToPence(scottishTax - rukTax) * 100);
}

/**
 * Derive the current annual crossover from canonical policy and the shared
 * annual Income Tax mechanics. The independent test pins the expected crossover
 * from the published current-year Scottish Government and HMRC band widths.
 */
export function deriveCurrentScottishTaxCrossover(): number {
  const policy = selectTaxPolicy(CURRENT_TAX_YEAR);
  const basicBand = policy.scottish.bands.find((band) => band.name === 'Basic rate');
  const intermediateBand = policy.scottish.bands.find((band) => band.name === 'Intermediate rate');

  if (!(basicBand && intermediateBand)) {
    throw new Error('Current Scottish policy does not expose basic and intermediate bands');
  }

  let lowerSalary = taxableThresholdToTotalIncome(
    basicBand.threshold,
    policy.scottish.personalAllowance,
    policy.scottish.personalAllowanceReductionThreshold,
  );
  let upperSalary = taxableThresholdToTotalIncome(
    intermediateBand.threshold,
    policy.scottish.personalAllowance,
    policy.scottish.personalAllowanceReductionThreshold,
  );

  if (taxDifferenceInPence(lowerSalary) >= 0 || taxDifferenceInPence(upperSalary) < 0) {
    throw new Error('Current Scottish policy does not cross rUK tax within the intermediate band');
  }

  while (lowerSalary < upperSalary) {
    const midpoint = Math.floor((lowerSalary + upperSalary) / 2);
    if (taxDifferenceInPence(midpoint) >= 0) {
      upperSalary = midpoint;
    } else {
      lowerSalary = midpoint + 1;
    }
  }

  return lowerSalary;
}

export const CURRENT_SCOTTISH_TAX_CROSSOVER = deriveCurrentScottishTaxCrossover();
