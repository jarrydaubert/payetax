/**
 * JSON-driven PAYE verification suite.
 *
 * Generic runner: every scenario lives in `src/test/payeVerificationFixtures/*.json`
 * with hand-derived expected values and official-source metadata. This file
 * contains no tax numbers of its own — it only knows how to execute a scenario
 * against `calculateTax`/`decodeTaxCode` and assert the fixture's claims.
 *
 * Run directly with:
 *   bunx jest src/lib/__tests__/taxCalculator.verification.test.ts
 */

import type { PayPeriod } from '@/constants/taxRates';
import {
  type FixtureInvariant,
  loadVerificationSuites,
  type VerificationScenario,
  type VerificationSuite,
} from '@/test/payeVerification';
import { calculateTax, type TaxCalculationResults } from '../taxCalculator';
import { decodeTaxCode } from '../taxCodeDecoder';

const suites: VerificationSuite[] = loadVerificationSuites();

/** Periods checked for per-period invariants (all derive from the monthly model). */
const CHECKED_PERIODS: PayPeriod[] = [
  'annually',
  'monthly',
  'fourWeekly',
  'fortnightly',
  'weekly',
  'daily',
];

function expectWithinTolerance(
  actual: number,
  expected: number,
  tolerancePence: number,
  label: string,
): void {
  const differencePence = Math.abs(actual - expected) * 100;
  if (differencePence > tolerancePence) {
    throw new Error(
      `${label}: expected ${expected} ±${tolerancePence}p from official sources, got ${actual}`,
    );
  }
}

function checkInvariant(
  invariant: FixtureInvariant,
  scenario: VerificationScenario,
  result: TaxCalculationResults,
): void {
  switch (invariant) {
    case 'employee-ni-is-zero':
      expect(result.nationalInsurance.annually).toBe(0);
      break;
    case 'employer-ni-is-positive':
      expect(result.employerNI).toBeGreaterThan(0);
      break;
    case 'income-tax-within-overriding-limit':
      // PAYE Regulations 2003 (SI 2003/2682) reg 2: tax deducted from a relevant
      // payment must not exceed 50% of that payment. The engine models pension
      // as a pre-tax deduction, so the payment base is gross minus pension.
      for (const period of CHECKED_PERIODS) {
        const paymentBase = result.grossSalary[period] - result.pensionContribution[period];
        // Half-penny headroom absorbs pence rounding of scaled period values.
        expect(result.incomeTax[period]).toBeLessThanOrEqual(paymentBase * 0.5 + 0.005);
      }
      break;
    case 'tax-free-amount-is-standard-personal-allowance':
      expect(result.taxFreeAmount).toBe(12570);
      break;
    default: {
      const exhaustive: never = invariant;
      throw new Error(`Unhandled invariant ${String(exhaustive)} in ${scenario.id}`);
    }
  }
}

describe('PAYE verification fixtures', () => {
  it('loads all fixture suites with scenarios', () => {
    expect(suites.length).toBeGreaterThanOrEqual(4);
    const totalScenarios = suites.reduce((sum, suite) => sum + suite.scenarios.length, 0);
    expect(totalScenarios).toBeGreaterThanOrEqual(15);
  });

  for (const suite of suites) {
    describe(`${suite.suite} [${suite.source.taxYear}, ${suite.source.authority}, verified ${suite.source.verifiedOn}]`, () => {
      for (const scenario of suite.scenarios) {
        it(`${scenario.id}: ${scenario.description}`, () => {
          const result = calculateTax(scenario.input);
          const { expected } = scenario;

          if (expected) {
            if (expected.taxFreeAmount !== undefined) {
              expect(result.taxFreeAmount).toBe(expected.taxFreeAmount);
            }
            if (expected.incomeTaxAnnual !== undefined) {
              expectWithinTolerance(
                result.incomeTax.annually,
                expected.incomeTaxAnnual,
                suite.tolerancePence,
                `${scenario.id} incomeTax.annually`,
              );
            }
            if (expected.nationalInsuranceAnnual !== undefined) {
              expectWithinTolerance(
                result.nationalInsurance.annually,
                expected.nationalInsuranceAnnual,
                suite.tolerancePence,
                `${scenario.id} nationalInsurance.annually`,
              );
            }
            if (expected.studentLoanAnnual !== undefined) {
              expectWithinTolerance(
                result.studentLoan.annually,
                expected.studentLoanAnnual,
                suite.tolerancePence,
                `${scenario.id} studentLoan.annually`,
              );
            }
            if (expected.netPayAnnual !== undefined) {
              expectWithinTolerance(
                result.netPay.annually,
                expected.netPayAnnual,
                suite.tolerancePence,
                `${scenario.id} netPay.annually`,
              );
            }
            if (expected.taxBandRates !== undefined) {
              expect(result.taxBands.map((band) => band.rate)).toEqual(expected.taxBandRates);
            }
          }

          for (const invariant of scenario.invariants ?? []) {
            checkInvariant(invariant, scenario, result);
          }

          if (scenario.decoder) {
            const decoded = decodeTaxCode(scenario.input.taxCode);
            expect(decoded.isValid).toBe(scenario.decoder.isValid);
            expect(decoded.allowance).toBe(scenario.decoder.allowance);
            expect(decoded.meaning.toLowerCase()).toContain(
              scenario.decoder.meaningIncludes.toLowerCase(),
            );
          }
        });
      }
    });
  }
});
