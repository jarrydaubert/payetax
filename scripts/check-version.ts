#!/usr/bin/env bun
/**
 * Verifies version numbers are in sync across the project.
 * Run: bun run check-version
 *
 * Checks:
 * - package.json version
 * - Service worker cache versions (sw.js)
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function getPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
  return pkg.version;
}

function getSwVersions(): string[] {
  const sw = readFileSync(join(ROOT, 'public/sw.js'), 'utf-8');
  const matches = sw.match(/payetax-(?:static-|api-)?v([\d.]+)/g) || [];
  return [...new Set(matches.map((m) => m.match(/v([\d.]+)/)?.[1] || ''))];
}

function main() {
  const pkgVersion = getPackageVersion();
  const swVersions = getSwVersions();

  console.log(`📦 package.json: v${pkgVersion}`);
  console.log(`🔧 sw.js caches: ${swVersions.map((v) => `v${v}`).join(', ')}`);

  const errors: string[] = [];

  // Check all SW versions match package version
  for (const swVersion of swVersions) {
    if (swVersion !== pkgVersion) {
      errors.push(`SW cache version (${swVersion}) doesn't match package.json (${pkgVersion})`);
    }
  }

  if (swVersions.length === 0) {
    errors.push('No version found in sw.js');
  }

  if (errors.length > 0) {
    console.error('\n❌ Version mismatch detected:');
    for (const e of errors) {
      console.error(`   - ${e}`);
    }
    console.error('\n   Fix: Update public/sw.js cache names to match package.json version');
    process.exit(1);
  }

  console.log('\n✅ All versions in sync!');
}

main();
