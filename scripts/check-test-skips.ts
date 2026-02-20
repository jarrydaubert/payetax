#!/usr/bin/env bun
/**
 * Guardrail: prevent hidden test-confidence regressions.
 *
 * Enforces:
 * - No new skip/todo debt beyond allowlisted baseline.
 * - No bare `test.skip()` in E2E tests (must include reason).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEST_DEBT_ALLOWLIST } from './test-debt-allowlist';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TEST_ROOTS = [join(ROOT, 'src'), join(ROOT, 'e2e')];
const TEST_EXTENSIONS = new Set(['.ts', '.tsx']);
const TEST_FILE_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

const SKIP_REGEX = /\b(?:it|test|describe)\.skip\s*\(/g;
const TODO_REGEX = /\b(?:it|test)\.todo\s*\(/g;
const BARE_PLAYWRIGHT_SKIP_REGEX = /test\.skip\(\s*\)/g;

type FileDebt = {
  skip: number;
  todo: number;
};

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

function main(): void {
  const files = TEST_ROOTS.flatMap((dir) => collectFiles(dir));
  const actualByFile = new Map<string, FileDebt>();
  const errors: string[] = [];
  let totalSkip = 0;
  let totalTodo = 0;

  for (const file of files) {
    const relPath = relative(ROOT, file);
    const content = readFileSync(file, 'utf-8');
    const skip = countMatches(content, SKIP_REGEX);
    const todo = countMatches(content, TODO_REGEX);

    if (skip === 0 && todo === 0) {
      continue;
    }

    if (relPath.startsWith('e2e/') && BARE_PLAYWRIGHT_SKIP_REGEX.test(content)) {
      errors.push(
        `${relPath} contains bare test.skip() calls. Use test.skip(condition, 'reason') or test.skip(true, 'reason').`,
      );
    }

    actualByFile.set(relPath, { skip, todo });
    totalSkip += skip;
    totalTodo += todo;
  }

  for (const [file, debt] of actualByFile.entries()) {
    const allowlisted = TEST_DEBT_ALLOWLIST.files[file as keyof typeof TEST_DEBT_ALLOWLIST.files];

    if (!allowlisted) {
      errors.push(
        `${file} has skip/todo debt (skip=${debt.skip}, todo=${debt.todo}) but is not allowlisted.`,
      );
      continue;
    }

    if (debt.skip > allowlisted.skip) {
      errors.push(
        `${file} skip count increased (${debt.skip} > ${allowlisted.skip}). Note: ${allowlisted.note}`,
      );
    }

    if (debt.todo > allowlisted.todo) {
      errors.push(
        `${file} todo count increased (${debt.todo} > ${allowlisted.todo}). Note: ${allowlisted.note}`,
      );
    }
  }

  for (const [file, expected] of Object.entries(TEST_DEBT_ALLOWLIST.files)) {
    const actual = actualByFile.get(file) ?? { skip: 0, todo: 0 };
    if (actual.skip < expected.skip || actual.todo < expected.todo) {
      console.log(
        `✅ Debt reduced in ${file}: skip ${actual.skip}/${expected.skip}, todo ${actual.todo}/${expected.todo}`,
      );
    }
  }

  if (totalSkip > TEST_DEBT_ALLOWLIST.totalMax.skip) {
    errors.push(
      `Total skip count increased (${totalSkip} > ${TEST_DEBT_ALLOWLIST.totalMax.skip}).`,
    );
  }

  if (totalTodo > TEST_DEBT_ALLOWLIST.totalMax.todo) {
    errors.push(
      `Total todo count increased (${totalTodo} > ${TEST_DEBT_ALLOWLIST.totalMax.todo}).`,
    );
  }

  console.log('🔎 Checking test skip/todo guardrails...');
  console.log(`   - test files scanned: ${files.length}`);
  console.log(`   - total skip: ${totalSkip}`);
  console.log(`   - total todo: ${totalTodo}`);

  if (errors.length > 0) {
    console.error('\n❌ Test debt guard failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Test skip/todo debt is within allowlisted baseline');
}

main();
