import { TAX_RATES, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { convertAnnualToPeriod } from '@/lib/periodCalculator';
import { calculateTax } from '@/lib/taxCalculator';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';

interface MarginalTaxRateInput {
  results: TaxCalculationResults;
  taxYear?: TaxYear;
  input?: TaxCalculationInput;
}

export function calculateMarginalTaxRate({
  results,
  taxYear = TAX_YEARS[0] as TaxYear,
  input,
}: MarginalTaxRateInput): number {
  if (input) {
    const deltaAnnual = 100;
    const deltaInInputPeriod = convertAnnualToPeriod(
      deltaAnnual,
      input.payPeriod,
      input.hoursPerWeek,
    );

    const bumped = calculateTax({
      ...input,
      salary: input.salary + deltaInInputPeriod,
    });

    const baseTax =
      results.incomeTax.annually +
      results.nationalInsurance.annually +
      results.studentLoan.annually;
    const bumpedTax =
      bumped.incomeTax.annually + bumped.nationalInsurance.annually + bumped.studentLoan.annually;

    return Math.min(100, Math.max(0, ((bumpedTax - baseTax) / deltaAnnual) * 100));
  }

  const taxRates = TAX_RATES[taxYear];
  const basicBandThreshold = taxRates.bands[0]?.threshold ?? 0;
  const higherBandThreshold = taxRates.bands[1]?.threshold ?? basicBandThreshold;
  const personalAllowance = taxRates.personalAllowance;
  const basicRateThreshold = personalAllowance + basicBandThreshold;
  const paReductionThreshold = taxRates.personalAllowanceReductionThreshold;
  const salary = results.grossSalary.annually;

  if (salary <= personalAllowance) return 0;
  if (salary <= basicRateThreshold) return 28;
  if (salary <= paReductionThreshold) return 42;
  if (salary <= higherBandThreshold) return 62;
  return 47;
}
