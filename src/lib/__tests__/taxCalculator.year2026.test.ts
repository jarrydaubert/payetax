/**
 * 2026-2027 worked-example fixtures (rest-of-UK PAYE).
 *
 * What these lock down: that the engine correctly APPLIES the documented
 * 2026-2027 thresholds in `taxRates.ts` for representative salaries across
 * every band, including the £100k personal-allowance taper and the
 * additional-rate band.
 *
 * Honesty note: the expected figures below are derived by hand from the
 * 2026-2027 band/threshold definitions (PA £12,570; basic 20% to £37,700
 * taxable; higher 40% to £125,140; additional 45% above; employee NI cat A
 * 8% £12,570-£50,270 then 2%). For PAYE on salary these thresholds are frozen
 * and identical to 2025-2026, which is independently checked against HMRC
 * worked examples in `taxCalculator.hmrcVerification` / `hmrcPayrollFixtures`.
 * The 2026-2027 delta (dividend rates) affects the director tool, not salary.
 * These cases therefore guard engine behaviour for the current year; they do
 * not re-source the thresholds from HMRC.
 *
 * Tolerance: `calculateTax` models real PAYE (monthly method with per-period
 * rounding and tax-code free pay), so it differs from the flat annual band
 * maths by a few pounds a year. We assert within ROUNDING_TOLERANCE_GBP — wide
 * enough to absorb PAYE rounding, far narrower than any rate/threshold error
 * (a 1% rate slip on £30k is £174; a band slip is hundreds).
 */

import { calculateTax } from '../taxCalculator';
import type { TaxCalculationInput } from '../types/calculator';

const baseInput: Omit<TaxCalculationInput, 'salary'> = {
  payPeriod: 'annually',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 37.5,
};

interface Fixture {
  name: string;
  salary: number;
  expected: { incomeTax: number; nationalInsurance: number; netPay: number };
}

// Hand-derived from the 2026-2027 rUK bands (see header note).
const fixtures: Fixture[] = [
  {
    // Basic rate: (30000 - 12570) = 17430 taxable @ 20% = 3486
    // NI: 17430 @ 8% = 1394.40
    name: 'basic rate £30,000',
    salary: 30000,
    expected: { incomeTax: 3486, nationalInsurance: 1394.4, netPay: 25119.6 },
  },
  {
    // Higher rate: 37700 @ 20% (7540) + (47430 - 37700) = 9730 @ 40% (3892) = 11432
    // NI: 37700 @ 8% (3016) + (60000 - 50270) = 9730 @ 2% (194.60) = 3210.60
    name: 'higher rate £60,000',
    salary: 60000,
    expected: { incomeTax: 11432, nationalInsurance: 3210.6, netPay: 45357.4 },
  },
  {
    // PA taper (60% zone): PA = 12570 - (110000-100000)/2 = 7570
    // taxable = 102430; 37700 @ 20% (7540) + (102430-37700)=64730 @ 40% (25892) = 33432
    // NI: 3016 + (110000-50270)=59730 @ 2% (1194.60) = 4210.60
    name: 'personal-allowance taper £110,000',
    salary: 110000,
    expected: { incomeTax: 33432, nationalInsurance: 4210.6, netPay: 72357.4 },
  },
  {
    // Additional rate: PA fully tapered to 0; taxable = 150000
    // 37700 @ 20% (7540) + (125140-37700)=87440 @ 40% (34976) + (150000-125140)=24860 @ 45% (11187) = 53703
    // NI: 3016 + (150000-50270)=99730 @ 2% (1994.60) = 5010.60
    name: 'additional rate £150,000',
    salary: 150000,
    expected: { incomeTax: 53703, nationalInsurance: 5010.6, netPay: 91286.4 },
  },
];

/** £/yr slack to absorb PAYE monthly-method rounding (see header note). */
const ROUNDING_TOLERANCE_GBP = 12;

describe('2026-2027 PAYE worked examples (rUK)', () => {
  it.each(fixtures)('$name', ({ salary, expected }) => {
    const result = calculateTax({ ...baseInput, salary });

    expect(Math.abs(result.incomeTax.annually - expected.incomeTax)).toBeLessThan(
      ROUNDING_TOLERANCE_GBP,
    );
    expect(Math.abs(result.nationalInsurance.annually - expected.nationalInsurance)).toBeLessThan(
      ROUNDING_TOLERANCE_GBP,
    );
    expect(Math.abs(result.netPay.annually - expected.netPay)).toBeLessThan(ROUNDING_TOLERANCE_GBP);
  });
});
