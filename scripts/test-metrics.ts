#!/usr/bin/env bun
/**
 * Prints quick test-confidence metrics from code and last run artifacts.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TEST_ROOTS = [join(ROOT, 'src'), join(ROOT, 'e2e')];
const TEST_EXTENSIONS = new Set(['.ts', '.tsx']);
const TEST_FILE_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

const SKIP_REGEX = /\b(?:it|test|describe)\.skip\s*\(/g;
const TODO_REGEX = /\b(?:it|test)\.todo\s*\(/g;

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (!TEST_EXTENSIONS.has(extname(fullPath))) {
      continue;
    }

    if (!TEST_FILE_SUFFIXES.some((suffix) => fullPath.endsWith(suffix))) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function countMatches(content: string, regex: RegExp): number {
  return Array.from(content.matchAll(regex)).length;
}

function formatPercent(covered: number, total: number): string {
  if (total === 0) return 'n/a';
  return `${((covered / total) * 100).toFixed(2)}%`;
}

function readLcovLineCoverage(): { covered: number; total: number } | null {
  const lcovPath = join(ROOT, 'audit-outputs/coverage/lcov.info');
  if (!existsSync(lcovPath)) {
    return null;
  }

  const content = readFileSync(lcovPath, 'utf-8');
  let covered = 0;
  let total = 0;

  for (const line of content.split('\n')) {
    if (line.startsWith('LH:')) {
      covered += Number(line.slice(3));
    }
    if (line.startsWith('LF:')) {
      total += Number(line.slice(3));
    }
  }

  return total > 0 ? { covered, total } : null;
}

function printCoverageSummary(): void {
  const coveragePath = join(ROOT, 'audit-outputs/coverage/coverage-final.json');
  if (!existsSync(coveragePath)) {
    console.log('Coverage: not available (run `bun run test` first)');
    return;
  }

  const raw = JSON.parse(readFileSync(coveragePath, 'utf-8')) as Record<
    string,
    {
      s: Record<string, number>;
      f: Record<string, number>;
      b: Record<string, number[]>;
      l?: Record<string, number>;
    }
  >;

  let totalStatements = 0;
  let coveredStatements = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalLines = 0;
  let coveredLines = 0;

  for (const file of Object.values(raw)) {
    for (const count of Object.values(file.s)) {
      totalStatements += 1;
      if (count > 0) coveredStatements += 1;
    }
    for (const count of Object.values(file.f)) {
      totalFunctions += 1;
      if (count > 0) coveredFunctions += 1;
    }
    for (const branchCounts of Object.values(file.b)) {
      for (const branch of branchCounts) {
        totalBranches += 1;
        if (branch > 0) coveredBranches += 1;
      }
    }
    if (file.l) {
      for (const count of Object.values(file.l)) {
        totalLines += 1;
        if (count > 0) coveredLines += 1;
      }
    }
  }

  const lcovLineCoverage = totalLines === 0 ? readLcovLineCoverage() : null;

  console.log('Coverage (from audit-outputs/coverage/coverage-final.json):');
  console.log(`  - statements: ${formatPercent(coveredStatements, totalStatements)}`);
  console.log(`  - branches:   ${formatPercent(coveredBranches, totalBranches)}`);
  console.log(`  - functions:  ${formatPercent(coveredFunctions, totalFunctions)}`);
  console.log(
    `  - lines:      ${
      lcovLineCoverage
        ? formatPercent(lcovLineCoverage.covered, lcovLineCoverage.total)
        : formatPercent(coveredLines, totalLines)
    }`,
  );
}

function printE2ELastRun(): void {
  const lastRunPath = join(ROOT, 'audit-outputs/test-results/.last-run.json');
  if (!existsSync(lastRunPath)) {
    console.log('Playwright last run: not available (run `bun run test:e2e` first)');
    return;
  }

  const lastRunStat = statSync(lastRunPath);
  const lastRun = JSON.parse(readFileSync(lastRunPath, 'utf-8')) as {
    status?: string;
    failedTests?: unknown[];
  };

  const failedCount = Array.isArray(lastRun.failedTests) ? lastRun.failedTests.length : 0;
  console.log(
    `Playwright last run: status=${lastRun.status ?? 'unknown'}, failedTests=${failedCount}, artifactUpdated=${lastRunStat.mtime.toISOString()}`,
  );
}

function main(): void {
  const files = TEST_ROOTS.flatMap((dir) => collectFiles(dir));
  let totalSkip = 0;
  let totalTodo = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    totalSkip += countMatches(content, SKIP_REGEX);
    totalTodo += countMatches(content, TODO_REGEX);
  }

  console.log('Test inventory:');
  console.log(`  - test files: ${files.length}`);
  console.log(`  - skip count: ${totalSkip}`);
  console.log(`  - todo count: ${totalTodo}`);
  printE2ELastRun();
  printCoverageSummary();
}

main();
