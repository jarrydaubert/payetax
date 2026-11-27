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

import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PayPeriod } from '@/constants/taxRates';
import { getPayePensionInputIssue } from '@/lib/tax';
import { decodeTaxCode } from '@/lib/tax-code-decoder';
import {
  type FixtureInvariant,
  loadVerificationSuites,
  type VerificationScenario,
  type VerificationSuite,
} from '@/test/payeVerification';
import { calculateTax, type TaxCalculationResults } from '../taxCalculator';

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

function requireFiniteNumber(value: unknown, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}: expected a finite number, got ${String(value)}`);
  }
}

function expectWithinTolerance(
  actual: number,
  expected: number,
  tolerancePence: number,
  label: string,
): void {
  requireFiniteNumber(actual, `${label} actual`);
  requireFiniteNumber(expected, `${label} expected`);
  requireFiniteNumber(tolerancePence, `${label} tolerancePence`);
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
      requireFiniteNumber(
        result.nationalInsurance.annually,
        `${scenario.id} nationalInsurance.annually`,
      );
      expect(result.nationalInsurance.annually).toBe(0);
      break;
    case 'employer-ni-is-positive':
      requireFiniteNumber(result.employerNI, `${scenario.id} employerNI`);
      expect(result.employerNI).toBeGreaterThan(0);
      break;
    case 'income-tax-within-overriding-limit':
      // PAYE Regulations 2003 (SI 2003/2682) reg 2: tax deducted from a relevant
      // payment must not exceed 50% of that payment. The engine models pension
      // as a pre-tax deduction, so the payment base is gross minus pension.
      for (const period of CHECKED_PERIODS) {
        const paymentBase = result.grossSalary[period] - result.pensionContribution[period];
        requireFiniteNumber(paymentBase, `${scenario.id} payePayment.${period}`);
        requireFiniteNumber(result.incomeTax[period], `${scenario.id} incomeTax.${period}`);
        // Half-penny headroom absorbs pence rounding of scaled period values.
        expect(result.incomeTax[period]).toBeLessThanOrEqual(paymentBase * 0.5 + 0.005);
      }
      break;
    case 'tax-free-amount-is-standard-personal-allowance':
      requireFiniteNumber(result.taxFreeAmount, `${scenario.id} taxFreeAmount`);
      expect(result.taxFreeAmount).toBe(12570);
      break;
    default: {
      const exhaustive: never = invariant;
      throw new Error(`Unhandled invariant ${String(exhaustive)} in ${scenario.id}`);
    }
  }
}

describe('PAYE verification numerical controls', () => {
  it.each([
    ['NaN actual', NaN, 200, 0, 'actual'],
    ['missing actual', undefined as unknown as number, 200, 0, 'actual'],
    ['NaN expected', 200, NaN, 0, 'expected'],
    ['infinite expected', 200, Infinity, 0, 'expected'],
    ['matching infinities', Infinity, Infinity, 0, 'actual'],
    ['NaN tolerance', 201, 200, NaN, 'tolerancePence'],
    ['infinite tolerance', 201, 200, Infinity, 'tolerancePence'],
  ] as const)(
    'rejects %s in the monetary assertion',
    (_case, actual, expected, tolerance, field) => {
      expect(() =>
        expectWithinTolerance(actual, expected, tolerance, 'control incomeTax.monthly'),
      ).toThrow(`control incomeTax.monthly ${field}: expected a finite number`);
    },
  );

  it('honours zero and positive tolerances for finite amounts', () => {
    expectWithinTolerance(200, 200, 0, 'control incomeTax.monthly');
    expectWithinTolerance(200.01, 200, 2, 'control incomeTax.monthly');
    expect(() => expectWithinTolerance(201, 200, 2, 'control incomeTax.monthly')).toThrow(
      'control incomeTax.monthly: expected 200 ±2p from official sources, got 201',
    );
  });

  it.each([
    [
      'employer-ni-is-positive',
      'employerNI',
      (result: TaxCalculationResults) => ({
        ...result,
        employerNI: Infinity,
      }),
    ],
    [
      'income-tax-within-overriding-limit',
      'incomeTax.annually',
      (result: TaxCalculationResults) => ({
        ...result,
        incomeTax: { ...result.incomeTax, annually: -Infinity },
      }),
    ],
    [
      'income-tax-within-overriding-limit',
      'payePayment.annually',
      (result: TaxCalculationResults) => ({
        ...result,
        grossSalary: { ...result.grossSalary, annually: Infinity },
      }),
    ],
  ] as const)('rejects an invalid %s invariant operand in %s', (invariant, field, corrupt) => {
    const scenario = suites
      .flatMap(({ scenarios }) => scenarios)
      .find(({ id }) => id === 'uk-40k-1257L');
    if (!scenario) throw new Error('Missing independent £40,000 fixture');
    const finite = calculateTax(scenario.input);
    checkInvariant(invariant, scenario, finite);
    expect(() => checkInvariant(invariant, scenario, corrupt(finite))).toThrow(
      `uk-40k-1257L ${field}: expected a finite number`,
    );
  });

  it.each([
    ['overflow tolerance', 'tolerancePence', { tolerancePence: 'overflow' }, {}],
    ['negative tolerance', 'tolerancePence', { tolerancePence: -1 }, {}],
    [
      'overflow money',
      'expected.incomeTaxAnnual',
      {},
      { expected: { incomeTaxAnnual: 'overflow' } },
    ],
    [
      'overflow exact amount',
      'expected.taxableIncomeAnnual',
      {},
      { expected: { taxableIncomeAnnual: 'overflow' } },
    ],
    [
      'overflow band rate',
      'expected.taxBandRates',
      {},
      { expected: { taxBandRates: ['overflow'] } },
    ],
    [
      'overflow decoder amount',
      'decoder.amount',
      {},
      { decoder: { isValid: true, amount: 'overflow', meaningIncludes: 'allowance' } },
    ],
  ] as const)('rejects %s during fixture loading', (_case, field, suitePatch, scenarioPatch) => {
    const directory = mkdtempSync(join(tmpdir(), 'payetax-paye-fixture-'));
    const file = join(directory, 'control.json');
    const fixture = {
      suite: 'Numeric control',
      source: {
        authority: 'Control',
        urls: ['control'],
        taxYear: '2026-2027',
        verifiedOn: '2026-11-26',
      },
      tolerancePence: 0,
      scenarios: [
        {
          id: 'negative-control',
          description: 'intentionally invalid expectation',
          input: { salary: 1000, taxCode: 'BR' },
          expected: { incomeTaxAnnual: 200 },
          ...scenarioPatch,
        },
      ],
      ...suitePatch,
    };
    writeFileSync(file, JSON.stringify(fixture).replaceAll('"overflow"', '1e309'), 'utf8');
    try {
      const diagnostic =
        field === 'tolerancePence' ? '"tolerancePence"' : `scenario "negative-control" ${field}`;
      expect(() => loadVerificationSuites(directory)).toThrow(
        `Invalid verification fixture control.json: ${diagnostic}`,
      );
    } finally {
      unlinkSync(file);
      rmdirSync(directory);
    }
  });
});

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
            if (expected.pensionMethod !== undefined) {
              expect(result.pensionMethod).toBe(expected.pensionMethod);
            }
            if (expected.pensionShortfall !== undefined) {
              expect(Boolean(getPayePensionInputIssue(scenario.input, result))).toBe(
                expected.pensionShortfall,
              );
            }
            if (expected.taxFreeAmount !== undefined) {
              requireFiniteNumber(result.taxFreeAmount, `${scenario.id} taxFreeAmount`);
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
            if (expected.incomeTaxMonthly !== undefined) {
              expectWithinTolerance(
                result.incomeTax.monthly,
                expected.incomeTaxMonthly,
                suite.tolerancePence,
                `${scenario.id} incomeTax.monthly`,
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
            if (expected.nationalInsuranceMonthly !== undefined) {
              expectWithinTolerance(
                result.nationalInsurance.monthly,
                expected.nationalInsuranceMonthly,
                suite.tolerancePence,
                `${scenario.id} nationalInsurance.monthly`,
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
            if (expected.studentLoanMonthly !== undefined) {
              expectWithinTolerance(
                result.studentLoan.monthly,
                expected.studentLoanMonthly,
                suite.tolerancePence,
                `${scenario.id} studentLoan.monthly`,
              );
            }
            if (expected.pensionContributionAnnual !== undefined) {
              expectWithinTolerance(
                result.pensionContribution.annually,
                expected.pensionContributionAnnual,
                suite.tolerancePence,
                `${scenario.id} pensionContribution.annually`,
              );
            }
            if (expected.pensionContributionMonthly !== undefined) {
              expectWithinTolerance(
                result.pensionContribution.monthly,
                expected.pensionContributionMonthly,
                suite.tolerancePence,
                `${scenario.id} pensionContribution.monthly`,
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
            if (expected.netPayMonthly !== undefined) {
              expectWithinTolerance(
                result.netPay.monthly,
                expected.netPayMonthly,
                suite.tolerancePence,
                `${scenario.id} netPay.monthly`,
              );
            }
            if (expected.taxableIncomeAnnual !== undefined) {
              requireFiniteNumber(result.taxableIncome, `${scenario.id} taxableIncomeAnnual`);
              expect(result.taxableIncome).toBe(expected.taxableIncomeAnnual);
            }
            if (expected.taxBandRates !== undefined) {
              const rates = result.taxBands.map(({ rate }, index) => {
                requireFiniteNumber(rate, `${scenario.id} taxBands[${index}].rate`);
                return rate;
              });
              expect(rates).toEqual(expected.taxBandRates);
            }
          }

          for (const invariant of scenario.invariants ?? []) {
            checkInvariant(invariant, scenario, result);
          }

          if (scenario.decoder) {
            const decoded = decodeTaxCode(scenario.input.taxCode);
            expect(decoded.isValid).toBe(scenario.decoder.isValid);
            if (decoded.amount !== null) {
              requireFiniteNumber(decoded.amount, `${scenario.id} decoder.amount`);
            }
            expect(decoded.amount).toBe(scenario.decoder.amount);
            expect(decoded.meaning.toLowerCase()).toContain(
              scenario.decoder.meaningIncludes.toLowerCase(),
            );
          }
        });
      }
    });
  }
});
