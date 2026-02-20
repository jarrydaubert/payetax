#!/usr/bin/env bun
/**
 * Enforces analytics event-name contract.
 *
 * Checks:
 * 1) `trackEvent({ action: '...' })` uses only known analytics event names.
 * 2) `trackSEOAction('...')` uses only known SEO event names.
 * 3) Deprecated aliases fail after their configured removal date.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ANALYTICS_EVENT_ACTIONS,
  DEPRECATED_ANALYTICS_ALIASES,
  SEO_ACTIONS,
} from '../src/lib/analyticsEvents';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'src');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

const TEST_FILE_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

const analyticsActionSet = new Set<string>(ANALYTICS_EVENT_ACTIONS);
const seoActionSet = new Set<string>(SEO_ACTIONS);

const trackEventRegex = /trackEvent\s*\(\s*\{[\s\S]*?\baction\s*:\s*'([^']+)'/g;
const trackSeoActionRegex = /trackSEOAction\s*\(\s*'([^']+)'/g;

type Finding = {
  action: string;
  file: string;
  kind: 'trackEvent' | 'trackSEOAction';
};

function shouldSkipFile(pathname: string): boolean {
  if (pathname.includes('__tests__')) return true;
  return TEST_FILE_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
}

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(extname(fullPath))) {
      continue;
    }

    if (shouldSkipFile(fullPath)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function getMatches(content: string, regex: RegExp): string[] {
  const matches: string[] = [];
  for (const match of content.matchAll(regex)) {
    const value = match[1];
    if (value) {
      matches.push(value);
    }
  }
  return matches;
}

function main(): void {
  const files = collectSourceFiles(SRC_DIR);
  const unknownFindings: Finding[] = [];
  const aliasUsage = new Map<string, string[]>();

  for (const alias of Object.keys(DEPRECATED_ANALYTICS_ALIASES)) {
    aliasUsage.set(alias, []);
  }

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const relPath = relative(ROOT, file);

    for (const action of getMatches(content, trackEventRegex)) {
      if (!analyticsActionSet.has(action)) {
        unknownFindings.push({ action, file: relPath, kind: 'trackEvent' });
      }

      if (aliasUsage.has(action)) {
        aliasUsage.get(action)?.push(relPath);
      }
    }

    for (const action of getMatches(content, trackSeoActionRegex)) {
      if (!seoActionSet.has(action)) {
        unknownFindings.push({ action, file: relPath, kind: 'trackSEOAction' });
      }
    }
  }

  const errors: string[] = [];

  for (const finding of unknownFindings) {
    errors.push(
      `Unknown ${finding.kind} action "${finding.action}" found in ${finding.file}. Add it to src/lib/analyticsEvents.ts or rename it.`,
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const [alias, meta] of Object.entries(DEPRECATED_ANALYTICS_ALIASES)) {
    const filesUsingAlias = aliasUsage.get(alias) ?? [];

    if (filesUsingAlias.length === 0) {
      continue;
    }

    if (today > meta.removeAfter) {
      errors.push(
        `Deprecated alias "${alias}" is still used after removal date ${meta.removeAfter}. Canonical event: "${meta.canonical}". Files: ${filesUsingAlias.join(', ')}`,
      );
      continue;
    }

    console.log(
      `⚠️  Deprecated analytics alias "${alias}" still in use (remove by ${meta.removeAfter}). Canonical: "${meta.canonical}".`,
    );
  }

  console.log('🔎 Checking analytics event contract...');
  console.log(`   - source files checked: ${files.length}`);
  console.log(`   - analytics actions allowed: ${ANALYTICS_EVENT_ACTIONS.length}`);
  console.log(`   - seo actions allowed: ${SEO_ACTIONS.length}`);

  if (errors.length > 0) {
    console.error('\n❌ Analytics event contract check failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Analytics event names match the contract');
}

main();
