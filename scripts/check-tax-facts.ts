#!/usr/bin/env bun

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aggregateTaxFactFindings,
  collectTaxFactSources,
  compareTaxFactBaseline,
  scanTaxFacts,
  TAX_FACT_EXCEPTION_RULES,
} from './tax-domain-controls';
import { TAX_FACT_BASELINE } from './tax-facts-baseline';

const root = process.env.PAYETAX_REPO_CHECK_ROOT
  ? resolve(process.env.PAYETAX_REPO_CHECK_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const verbose = process.argv.includes('--verbose');
const sources = collectTaxFactSources(root);
const occurrences = scanTaxFacts(sources);
const findings = aggregateTaxFactFindings(occurrences);

if (process.argv.includes('--print-baseline')) {
  for (const { file, kind, value, count } of findings) {
    console.log(
      `  [${JSON.stringify(file)}, ${JSON.stringify(kind)}, ${JSON.stringify(value)}, ${count}],`,
    );
  }
  process.exit(0);
}

const comparison = compareTaxFactBaseline(findings, TAX_FACT_BASELINE);
const exceptionCounts = new Map<string, number>();

for (const occurrence of occurrences) {
  if (!occurrence.exceptionId) continue;
  exceptionCounts.set(
    occurrence.exceptionId,
    (exceptionCounts.get(occurrence.exceptionId) ?? 0) + 1,
  );
}

console.log('🔎 Checking for hardcoded tax facts...');
console.log(`   - files scanned: ${sources.length}`);
console.log(
  `   - baseline findings: ${comparison.baseline.reduce((sum, entry) => sum + entry.count, 0)}`,
);
console.log(
  `   - new findings: ${comparison.newFindings.reduce((sum, entry) => sum + entry.count, 0)}`,
);
console.log(`   - mode: ${strict ? 'strict (new findings fail)' : 'report-only'}`);

console.log('\n   Explicit exception model:');
for (const rule of TAX_FACT_EXCEPTION_RULES) {
  console.log(
    `   - ${rule.id} [${rule.category}]: ${exceptionCounts.get(rule.id) ?? 0} occurrence(s) — ${rule.description}`,
  );
}

if (comparison.baseline.length > 0) {
  const baselineEntriesByKind = new Map<string, number>();
  for (const finding of comparison.baseline) {
    baselineEntriesByKind.set(finding.kind, (baselineEntriesByKind.get(finding.kind) ?? 0) + 1);
  }
  console.log('\n   Baselined finding entries:');
  for (const [kind, count] of [...baselineEntriesByKind].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`   - ${kind}: ${count}`);
  }
  if (!verbose) console.log('   - run with --verbose for file and line details');

  if (verbose) {
    for (const finding of comparison.baseline) {
      console.log(
        `   - ${finding.file}:${finding.lines.join(',')} ${finding.kind}=${finding.value} (count ${finding.count})`,
      );
    }
  }
}

if (comparison.reduced.length > 0) {
  console.log('\n   Reduced baseline debt:');
  for (const finding of comparison.reduced) {
    console.log(
      `   - ${finding.file} ${finding.kind}=${finding.value}: ${finding.actualCount}/${finding.count}`,
    );
  }
}

if (comparison.newFindings.length > 0) {
  console.warn('\n⚠️  New hardcoded tax-fact findings:');
  for (const finding of comparison.newFindings) {
    console.warn(
      `   - ${finding.file}:${finding.lines.join(',')} ${finding.kind}=${finding.value} (+${finding.count})`,
    );
  }
  console.warn(
    '   Prefer @/lib/tax policy reads, or classify a genuine fixture, pinned history, or sourced quotation explicitly.',
  );
}

if (strict && comparison.newFindings.length > 0) process.exit(1);
console.log('\n✅ Tax-fact inventory completed without rewriting files');
