#!/usr/bin/env bun

/**
 * Release verification report helper.
 *
 * Commands:
 * - init: create report scaffold for current package.json version
 * - status: check whether report exists and summarize completion
 * - check --strict: fail unless report is COMPLETE with no open checklist items
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'docs', 'reports', 'releases');
const TEMPLATE_PATH = join(REPORTS_DIR, 'TEMPLATE.md');
const PACKAGE_JSON_PATH = join(ROOT, 'package.json');

type Command = 'init' | 'status' | 'check';

function getCurrentVersion(): string {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8')) as { version?: string };
  if (!packageJson.version) {
    throw new Error('Could not determine package version from package.json');
  }
  return packageJson.version;
}

function getShortCommitSha(): string {
  try {
    const output = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (output.status === 0) {
      const sha = output.stdout.trim();
      if (sha.length > 0) return sha;
    }
  } catch {
    // ignore and use fallback below
  }
  return 'TBD';
}

function formatDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getReportPath(version: string): string {
  return join(REPORTS_DIR, `v${version}.md`);
}

function renderTemplate(version: string): string {
  const template = readFileSync(TEMPLATE_PATH, 'utf-8');
  return template
    .replaceAll('{{VERSION}}', `v${version}`)
    .replaceAll('{{DATE}}', formatDate())
    .replaceAll('{{COMMIT_SHA}}', getShortCommitSha());
}

function summarizeReport(content: string): {
  status: string;
  uncheckedItems: number;
  releaseVersion: string;
  deploymentUrl: string;
} {
  const status = content.match(/^Status:\s*(.+)$/m)?.[1]?.trim() ?? 'MISSING';
  const releaseVersion = content.match(/^Release Version:\s*(.+)$/m)?.[1]?.trim() ?? 'MISSING';
  const deploymentUrl = content.match(/^Deployment URL:\s*(.+)$/m)?.[1]?.trim() ?? 'MISSING';
  const uncheckedItems = [...content.matchAll(/^- \[ \]/gm)].length;

  return { status, uncheckedItems, releaseVersion, deploymentUrl };
}

function runInit(version: string): void {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = getReportPath(version);

  if (existsSync(reportPath)) {
    console.log(`ℹ️  Release report already exists: ${reportPath}`);
    return;
  }

  writeFileSync(reportPath, renderTemplate(version), 'utf-8');
  console.log(`✅ Created release report scaffold: ${reportPath}`);
}

function runStatus(version: string, strict: boolean): void {
  const reportPath = getReportPath(version);
  if (!existsSync(reportPath)) {
    console.error(`❌ Missing release report for v${version}: ${reportPath}`);
    console.error('   Run: bun run release:report:init');
    process.exit(1);
  }

  const content = readFileSync(reportPath, 'utf-8');
  const summary = summarizeReport(content);

  console.log(`🔎 Release report: ${reportPath}`);
  console.log(`   - Status: ${summary.status}`);
  console.log(`   - Open checklist items: ${summary.uncheckedItems}`);
  console.log(`   - Release Version: ${summary.releaseVersion}`);
  console.log(`   - Deployment URL: ${summary.deploymentUrl}`);

  if (summary.releaseVersion !== `v${version}`) {
    console.error(
      `\n❌ Report release version mismatch. Expected "v${version}", got "${summary.releaseVersion}"`,
    );
    process.exit(1);
  }

  if (!strict) {
    console.log('\n✅ Release report exists and is version-aligned');
    return;
  }

  const errors: string[] = [];
  if (summary.status !== 'COMPLETE') {
    errors.push('Status must be COMPLETE for strict check');
  }
  if (summary.uncheckedItems > 0) {
    errors.push(`Checklist still has ${summary.uncheckedItems} open item(s)`);
  }
  if (summary.deploymentUrl === 'TBD' || !summary.deploymentUrl.startsWith('http')) {
    errors.push('Deployment URL must be set to a valid URL');
  }

  if (errors.length > 0) {
    console.error('\n❌ Release report strict check failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Release report is COMPLETE and passes strict validation');
}

function main(): void {
  const version = getCurrentVersion();
  const command = (process.argv[2] as Command | undefined) ?? 'status';
  const strict = process.argv.includes('--strict');

  if (!['init', 'status', 'check'].includes(command)) {
    console.error(`Unknown command: ${command}`);
    console.error(
      'Usage: bun scripts/release-verification-report.ts <init|status|check> [--strict]',
    );
    process.exit(1);
  }

  switch (command) {
    case 'init':
      runInit(version);
      break;
    case 'status':
      runStatus(version, strict);
      break;
    case 'check':
      runStatus(version, true);
      break;
    default:
      process.exit(1);
  }
}

main();
