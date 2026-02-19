#!/usr/bin/env bun
/**
 * Ensures public analytics env vars stay in sync across:
 * 1) .env.template
 * 2) PublicEnvSchema in src/lib/env.ts
 * 3) validatePublicEnv() safeParse mapping in src/lib/env.ts
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_ANALYTICS_PUBLIC_ENV = [
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_AHREFS_KEY',
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSection(content: string, startPattern: RegExp, endPattern: RegExp): string {
  const startMatch = content.match(startPattern);
  if (!startMatch || startMatch.index === undefined) {
    throw new Error(`Could not find section start: ${startPattern}`);
  }

  const startIndex = startMatch.index + startMatch[0].length;
  const rest = content.slice(startIndex);
  const endMatch = rest.match(endPattern);

  if (!endMatch || endMatch.index === undefined) {
    throw new Error(`Could not find section end: ${endPattern}`);
  }

  return rest.slice(0, endMatch.index);
}

function main(): void {
  const templatePath = join(ROOT, '.env.template');
  const envPath = join(ROOT, 'src/lib/env.ts');

  const template = readFileSync(templatePath, 'utf-8');
  const envSource = readFileSync(envPath, 'utf-8');

  const publicSchema = getSection(
    envSource,
    /export const PublicEnvSchema = z\.object\(\{/,
    /\n\}\);/,
  );
  const publicSafeParse = getSection(envSource, /PublicEnvSchema\.safeParse\(\{/, /\n\s*\}\);/);

  const errors: string[] = [];

  for (const key of REQUIRED_ANALYTICS_PUBLIC_ENV) {
    const templatePattern = new RegExp(`^${escapeRegex(key)}=`, 'm');
    if (!templatePattern.test(template)) {
      errors.push(`${key} missing from .env.template`);
    }

    const schemaPattern = new RegExp(`\\b${escapeRegex(key)}\\s*:`, 'm');
    if (!schemaPattern.test(publicSchema)) {
      errors.push(`${key} missing from PublicEnvSchema in src/lib/env.ts`);
    }

    const mappingPattern = new RegExp(
      `\\b${escapeRegex(key)}\\s*:\\s*process\\.env\\.${escapeRegex(key)}\\b`,
      'm',
    );
    if (!mappingPattern.test(publicSafeParse)) {
      errors.push(`${key} missing from validatePublicEnv() mapping in src/lib/env.ts`);
    }
  }

  console.log('🔎 Checking analytics env sync...');
  for (const key of REQUIRED_ANALYTICS_PUBLIC_ENV) {
    console.log(`   - ${key}`);
  }

  if (errors.length > 0) {
    console.error('\n❌ Analytics env sync check failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Analytics env vars are in sync across .env.template and src/lib/env.ts');
}

main();
