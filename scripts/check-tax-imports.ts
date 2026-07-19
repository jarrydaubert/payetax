#!/usr/bin/env bun

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAX_IMPORT_BOUNDARY_BASELINE } from './tax-domain-boundary-baseline';
import {
  collectTaxImportSources,
  compareTaxImportBaseline,
  findTaxImportViolations,
} from './tax-domain-controls';

const root = process.env.PAYETAX_REPO_CHECK_ROOT
  ? resolve(process.env.PAYETAX_REPO_CHECK_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const violations = findTaxImportViolations(collectTaxImportSources(root));

if (process.argv.includes('--print-baseline')) {
  for (const { file, specifier, imports } of violations) {
    console.log(
      `  [${JSON.stringify(file)}, ${JSON.stringify(specifier)}, ${JSON.stringify(imports)}],`,
    );
  }
  process.exit(0);
}

const comparison = compareTaxImportBaseline(violations, TAX_IMPORT_BOUNDARY_BASELINE);

console.log('🔎 Checking tax-domain import boundary...');
console.log(`   - supported application import: @/lib/tax`);
console.log(
  `   - existing direct imports baselined: ${violations.length - comparison.newViolations.length}`,
);

if (comparison.staleBaseline.length > 0) {
  console.error('\n❌ Tax import baseline contains stale entries:');
  for (const entry of comparison.staleBaseline) {
    console.error(`   - ${entry.file}: ${entry.specifier} [${entry.imports.join(', ')}]`);
  }
  console.error('   Remove stale entries from scripts/tax-domain-boundary-baseline.ts.');
}

if (comparison.newViolations.length > 0) {
  console.error('\n❌ New direct tax-domain imports found:');
  for (const violation of comparison.newViolations) {
    console.error(
      `   - ${violation.file}:${violation.line} imports ${violation.specifier} [${violation.imports.join(', ')}]`,
    );
  }
  console.error('   Application consumers must import through @/lib/tax.');
}

if (comparison.newViolations.length > 0 || comparison.staleBaseline.length > 0) {
  process.exit(1);
}

console.log('✅ No new tax-domain import violations');
