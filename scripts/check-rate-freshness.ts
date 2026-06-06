#!/usr/bin/env bun
/**
 * Guardrail: keep the current tax year's rates fresh and present.
 *
 * Fails CI when:
 * - The current tax year is missing from TAX_RATES or TAX_YEAR_SOURCES.
 * - The current tax year's `verifiedOn` date is missing/unparseable.
 * - That verification date is older than MAX_AGE_DAYS (rates may be stale).
 *
 * This does NOT verify the numbers against HMRC — it only guarantees a human
 * re-verified the current year's rates recently. Independent accuracy is
 * covered by the HMRC fixture suites under src/lib/__tests__.
 */

import { CURRENT_TAX_YEAR, TAX_RATES, TAX_YEAR_SOURCES } from '../src/constants/taxRates';

/** How long a current-year verification stays "fresh" before CI complains. */
const MAX_AGE_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

console.log('🔎 Checking current-year rate freshness...');
console.log(`   - current tax year: ${CURRENT_TAX_YEAR}`);

if (!TAX_RATES[CURRENT_TAX_YEAR]) {
  fail(`Current tax year ${CURRENT_TAX_YEAR} is missing from TAX_RATES.`);
}

const sources = TAX_YEAR_SOURCES[CURRENT_TAX_YEAR];
if (!sources) {
  fail(`Current tax year ${CURRENT_TAX_YEAR} is missing from TAX_YEAR_SOURCES.`);
}

const verifiedOn = sources.verifiedOn;
const verifiedDate = new Date(`${verifiedOn}T00:00:00Z`);
if (Number.isNaN(verifiedDate.getTime())) {
  fail(`verifiedOn for ${CURRENT_TAX_YEAR} is not a valid YYYY-MM-DD date: "${verifiedOn}".`);
}

const ageDays = Math.floor((Date.now() - verifiedDate.getTime()) / MS_PER_DAY);
console.log(`   - verifiedOn: ${verifiedOn} (${ageDays} days ago)`);

if (ageDays > MAX_AGE_DAYS) {
  fail(
    `Rates for ${CURRENT_TAX_YEAR} were last verified ${ageDays} days ago ` +
      `(limit ${MAX_AGE_DAYS}). Re-verify against HMRC and update verifiedOn in taxRates.ts.`,
  );
}

if (ageDays < 0) {
  fail(`verifiedOn for ${CURRENT_TAX_YEAR} is in the future: "${verifiedOn}".`);
}

console.log('✅ Current-year rates are present and verified within the freshness window');
