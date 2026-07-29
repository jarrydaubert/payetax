#!/usr/bin/env bun

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURRENT_TAX_GUIDANCE_PATHS } from '../src/constants/currentTaxGuidance';
import { findCurrentBlogGuidanceProblems } from '../src/lib/currentBlogGuidance';

function main(): void {
  const root = process.env.PAYETAX_REPO_CHECK_ROOT
    ? resolve(process.env.PAYETAX_REPO_CHECK_ROOT)
    : resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const sources = CURRENT_TAX_GUIDANCE_PATHS.map((file) => ({
    file,
    content: readFileSync(resolve(root, file), 'utf8'),
  }));
  const findings = findCurrentBlogGuidanceProblems(sources);

  console.log('🔎 Checking current-facing blog guidance...');
  console.log(`   - files checked: ${sources.length}`);
  console.log(`   - stale findings: ${findings.length}`);

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`   - ${finding.file} [${finding.rule}]: ${finding.detail}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('✅ Current-facing blog guidance contains no guarded expired figures');
}

if (import.meta.main) main();
