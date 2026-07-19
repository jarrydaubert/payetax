/**
 * Typed loader for the JSON-driven PAYE verification suite.
 *
 * The JSON fixtures in `src/test/payeVerificationFixtures/` hold hand-derived
 * expected values sourced from official HMRC / Scottish Government / legislation
 * references. They intentionally live apart from the generic runner
 * (`src/lib/__tests__/taxCalculator.verification.test.ts`) so scenarios can be
 * added or corrected without touching test logic.
 *
 * Expected values MUST be derived from the official sources by hand (or an
 * independent implementation) — never from `calculateTax` output, otherwise the
 * suite would only prove the engine agrees with itself.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TaxCalculationInput } from '@/lib/types/calculator';

/** Official source metadata for one fixture suite. */
export interface FixtureSource {
  /** Publishing authority, e.g. "HMRC", "Scottish Government", "UK legislation". */
  authority: string;
  /** Official URLs the expected values were verified against. */
  urls: string[];
  /**
   * Tax year the scenarios target, e.g. "2026-2027". Multi-year suites may use
   * a span like "2023-2027"; each scenario's input.taxYear is the operative value.
   */
  taxYear: string;
  /** ISO date (YYYY-MM-DD) the sources were last checked. */
  verifiedOn: string;
}

/** Exact-value assertions. All monetary values are annual pounds. */
export interface FixtureExpected {
  taxFreeAmount?: number;
  incomeTaxAnnual?: number;
  nationalInsuranceAnnual?: number;
  studentLoanAnnual?: number;
  netPayAnnual?: number;
  /** Ordered list of band rates expected in the result breakdown. */
  taxBandRates?: number[];
}

/** Named invariant assertions the runner knows how to check. */
export type FixtureInvariant =
  | 'employee-ni-is-zero'
  | 'employer-ni-is-positive'
  | 'income-tax-within-overriding-limit'
  | 'tax-free-amount-is-standard-personal-allowance';

/** Expected `decodeTaxCode` behaviour for the scenario's tax code. */
export interface FixtureDecoderExpectation {
  isValid: boolean;
  /** Expected decoded allowance (null when the decoder reports none). */
  allowance: number | null;
  /** Case-insensitive substring the decoder meaning must contain. */
  meaningIncludes: string;
}

export interface VerificationScenario {
  /** Stable unique ID, e.g. "scot-sd0-30k". */
  id: string;
  description: string;
  /** Complete calculator input (JSON cannot express undefined — omit optionals). */
  input: TaxCalculationInput;
  expected?: FixtureExpected;
  invariants?: FixtureInvariant[];
  decoder?: FixtureDecoderExpectation;
}

export interface VerificationSuite {
  suite: string;
  source: FixtureSource;
  /** Absolute tolerance for monetary comparisons, in pence. */
  tolerancePence: number;
  scenarios: VerificationScenario[];
}

export const KNOWN_INVARIANTS: readonly FixtureInvariant[] = [
  'employee-ni-is-zero',
  'employer-ni-is-positive',
  'income-tax-within-overriding-limit',
  'tax-free-amount-is-standard-personal-allowance',
];

function assertSuiteShape(fileName: string, raw: unknown): VerificationSuite {
  const suite = raw as VerificationSuite;
  const fail = (message: string): never => {
    throw new Error(`Invalid verification fixture ${fileName}: ${message}`);
  };

  if (typeof suite?.suite !== 'string' || suite.suite.length === 0) fail('missing "suite" name');
  if (typeof suite.tolerancePence !== 'number' || suite.tolerancePence < 0) {
    fail('"tolerancePence" must be a non-negative number');
  }
  const { authority, urls, taxYear, verifiedOn } = suite.source ?? {};
  if (typeof authority !== 'string' || authority.length === 0) fail('source.authority missing');
  if (!Array.isArray(urls) || urls.length === 0) fail('source.urls must be a non-empty array');
  if (!/^\d{4}-\d{4}$/.test(taxYear ?? '')) fail('source.taxYear must look like "2026-2027"');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn ?? '')) fail('source.verifiedOn must be YYYY-MM-DD');
  if (!Array.isArray(suite.scenarios) || suite.scenarios.length === 0) {
    fail('scenarios must be a non-empty array');
  }

  const seenIds = new Set<string>();
  for (const scenario of suite.scenarios) {
    if (typeof scenario.id !== 'string' || scenario.id.length === 0) fail('scenario missing id');
    if (seenIds.has(scenario.id)) fail(`duplicate scenario id "${scenario.id}"`);
    seenIds.add(scenario.id);
    if (typeof scenario.description !== 'string' || scenario.description.length === 0) {
      fail(`scenario "${scenario.id}" missing description`);
    }
    if (typeof scenario.input?.salary !== 'number' || typeof scenario.input?.taxCode !== 'string') {
      fail(`scenario "${scenario.id}" has incomplete calculator input`);
    }
    if (!(scenario.expected || scenario.invariants?.length || scenario.decoder)) {
      fail(`scenario "${scenario.id}" asserts nothing`);
    }
    for (const invariant of scenario.invariants ?? []) {
      if (!KNOWN_INVARIANTS.includes(invariant)) {
        fail(`scenario "${scenario.id}" uses unknown invariant "${invariant}"`);
      }
    }
  }

  return suite;
}

export const VERIFICATION_FIXTURES_DIR = join(__dirname, 'payeVerificationFixtures');

/** Load and structurally validate every fixture suite in a directory. */
export function loadVerificationSuites(
  dir: string = VERIFICATION_FIXTURES_DIR,
): VerificationSuite[] {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    throw new Error(`No verification fixtures found in ${dir}`);
  }

  return files.map((name) =>
    assertSuiteShape(name, JSON.parse(readFileSync(join(dir, name), 'utf8'))),
  );
}
