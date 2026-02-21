#!/usr/bin/env bun
/**
 * Runs `bun audit --json --audit-level=high` and fails only on non-allowlisted advisories.
 */

import { spawnSync } from 'node:child_process';
import { DEPENDENCY_ADVISORY_ALLOWLIST } from './dependency-advisory-allowlist';

type BunAuditAdvisory = {
  url?: string;
  title?: string;
  severity?: string;
};

type Advisory = {
  packageName: string;
  id: string | null;
  title: string;
  severity: string;
  raw: BunAuditAdvisory;
};

function extractAdvisoryId(url?: string): string | null {
  if (!url) return null;
  const ghsaMatch = url.match(/GHSA-[a-z0-9-]+/i);
  if (ghsaMatch?.[0]) return ghsaMatch[0].toUpperCase();
  const cveMatch = url.match(/CVE-\d{4}-\d+/i);
  if (cveMatch?.[0]) return cveMatch[0].toUpperCase();
  return null;
}

function parseBunAuditJson(stdout: string): Advisory[] {
  const advisories: Advisory[] = [];

  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (!(trimmed.startsWith('{') && trimmed.endsWith('}'))) continue;

    let payload: Record<string, BunAuditAdvisory[]>;
    try {
      payload = JSON.parse(trimmed) as Record<string, BunAuditAdvisory[]>;
    } catch {
      continue;
    }

    for (const [packageName, packageAdvisories] of Object.entries(payload)) {
      for (const advisory of packageAdvisories) {
        advisories.push({
          packageName,
          id: extractAdvisoryId(advisory.url),
          title: advisory.title ?? 'Unknown advisory',
          severity: advisory.severity ?? 'unknown',
          raw: advisory,
        });
      }
    }
  }

  return advisories;
}

function isAuditConnectivityFailure(output: string): boolean {
  const normalized = output.toLowerCase();
  return (
    normalized.includes('connectionrefused') ||
    normalized.includes('connection refused') ||
    normalized.includes('econnrefused') ||
    normalized.includes('audit request failed') ||
    normalized.includes('enotfound') ||
    normalized.includes('network')
  );
}

function isAllowlisted(advisory: Advisory): boolean {
  if (!advisory.id) return false;
  return DEPENDENCY_ADVISORY_ALLOWLIST.some(
    (entry) =>
      advisory.id === entry.id &&
      advisory.packageName.toLowerCase() === entry.package.toLowerCase(),
  );
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDaysSince(date: Date): number {
  const now = Date.now();
  const diffMs = now - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getDaysUntil(date: Date): number {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function printAllowlistFreshnessWarnings(): void {
  const staleEntries: Array<{ id: string; packageName: string; days: number; cadence: number }> =
    [];
  const reviewSchedule: Array<{
    id: string;
    packageName: string;
    nextReviewDate: string;
    daysUntilReview: number;
  }> = [];

  for (const entry of DEPENDENCY_ADVISORY_ALLOWLIST) {
    const checkedDate = parseIsoDate(entry.lastChecked);
    if (!checkedDate) {
      console.warn(
        `⚠️  Allowlist entry ${entry.id} (${entry.package}) has invalid lastChecked date: ${entry.lastChecked}`,
      );
      continue;
    }

    const nextReviewDate = addDays(checkedDate, entry.reviewCadenceDays);
    reviewSchedule.push({
      id: entry.id,
      packageName: entry.package,
      nextReviewDate: formatIsoDate(nextReviewDate),
      daysUntilReview: getDaysUntil(nextReviewDate),
    });

    const days = getDaysSince(checkedDate);
    if (days > entry.reviewCadenceDays) {
      staleEntries.push({
        id: entry.id,
        packageName: entry.package,
        days,
        cadence: entry.reviewCadenceDays,
      });
    }
  }

  if (staleEntries.length > 0) {
    console.warn('\n⚠️  Advisory allowlist review is overdue for:');
    for (const entry of staleEntries) {
      console.warn(
        `   - ${entry.packageName} (${entry.id}) last checked ${entry.days}d ago (cadence ${entry.cadence}d)`,
      );
    }
    console.warn('   Update lastChecked after monthly upstream review.');
  }

  if (reviewSchedule.length > 0) {
    console.warn('\n📅 Advisory allowlist review schedule:');
    for (const entry of reviewSchedule) {
      const dueText =
        entry.daysUntilReview >= 0
          ? `${entry.nextReviewDate} (${entry.daysUntilReview}d)`
          : `${entry.nextReviewDate} (${Math.abs(entry.daysUntilReview)}d overdue)`;
      console.warn(`   - ${entry.packageName} (${entry.id}) -> ${dueText}`);
    }
  }
}

function main(): void {
  const result = spawnSync('bun', ['audit', '--json', '--audit-level=high'], {
    encoding: 'utf-8',
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const combinedOutput = [stdout, stderr].filter(Boolean).join('\n');

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  const advisories = parseBunAuditJson(stdout);
  if (result.status === 0 && advisories.length === 0) {
    printAllowlistFreshnessWarnings();
    console.log('\n✅ Dependency audit passed with no advisories');
    return;
  }

  if (advisories.length === 0) {
    if (isAuditConnectivityFailure(combinedOutput)) {
      console.error(
        '\n❌ Dependency audit could not reach the Bun advisory service (network/connectivity issue).',
      );
      console.error(
        '   Retry when connectivity is available; this is not a vulnerability finding.',
      );
      process.exit(1);
    }
    console.error(
      '\n❌ Dependency audit failed and no machine-readable advisories were parsed (unexpected format/output).',
    );
    process.exit(result.status ?? 1);
  }

  const nonAllowlisted = advisories.filter((advisory) => !isAllowlisted(advisory));

  if (nonAllowlisted.length === 0) {
    console.log('\n⚠️  Dependency audit contains only allowlisted advisory entries:');
    for (const advisory of advisories) {
      console.log(`   - ${advisory.packageName} (${advisory.id ?? 'no-id'})`);
    }
    printAllowlistFreshnessWarnings();
    console.log('✅ Allowlisted-only dependency audit accepted');
    return;
  }

  console.error('\n❌ Non-allowlisted dependency advisories found:');
  for (const advisory of nonAllowlisted) {
    console.error(
      `   - ${advisory.packageName} (${advisory.id ?? 'no-id'}) [${advisory.severity}]: ${advisory.title}`,
    );
  }
  process.exit(1);
}

main();
