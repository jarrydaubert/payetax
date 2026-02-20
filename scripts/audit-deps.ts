#!/usr/bin/env bun
/**
 * Runs `bun pm scan` and fails only on non-allowlisted advisories.
 */

import { spawnSync } from 'node:child_process';
import { DEPENDENCY_ADVISORY_ALLOWLIST } from './dependency-advisory-allowlist';

type Advisory = {
  packageName: string;
  cve: string | null;
  rawBlock: string;
};

function parseAdvisories(output: string): Advisory[] {
  const advisories: Advisory[] = [];
  const blockRegex =
    /WARNING:\s+([^\n]+)([\s\S]*?)(?=\n\s*WARNING:\s+|\n\d+\s+advisory|\nerror:|$)/g;

  for (const match of output.matchAll(blockRegex)) {
    const packageName = match[1]?.trim() ?? 'unknown';
    const rawBlock = `${match[0]}`.trim();
    const cveMatch = rawBlock.match(/CVE-\d{4}-\d+/i);
    advisories.push({
      packageName,
      cve: cveMatch ? cveMatch[0].toUpperCase() : null,
      rawBlock,
    });
  }

  return advisories;
}

function isAllowlisted(advisory: Advisory): boolean {
  return DEPENDENCY_ADVISORY_ALLOWLIST.some(
    (entry) =>
      advisory.cve === entry.id &&
      advisory.packageName.toLowerCase() === entry.package.toLowerCase(),
  );
}

function main(): void {
  const result = spawnSync('bun', ['pm', 'scan'], {
    encoding: 'utf-8',
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const combinedOutput = [stdout, stderr].filter(Boolean).join('\n');

  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }

  const advisories = parseAdvisories(combinedOutput);

  if (result.status === 0) {
    console.log('\n✅ Dependency audit passed with no advisories');
    return;
  }

  if (advisories.length === 0) {
    console.error('\n❌ Dependency audit failed and no advisory blocks were parsed.');
    process.exit(result.status ?? 1);
  }

  const nonAllowlisted = advisories.filter((advisory) => !isAllowlisted(advisory));

  if (nonAllowlisted.length === 0) {
    console.log('\n⚠️  Dependency audit contains only allowlisted advisory entries:');
    for (const advisory of advisories) {
      console.log(`   - ${advisory.packageName} (${advisory.cve ?? 'no-cve'})`);
    }
    console.log('✅ Allowlisted-only dependency audit accepted');
    return;
  }

  console.error('\n❌ Non-allowlisted dependency advisories found:');
  for (const advisory of nonAllowlisted) {
    console.error(`---\n${advisory.rawBlock}\n---`);
  }
  process.exit(1);
}

main();
