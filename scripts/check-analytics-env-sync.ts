#!/usr/bin/env bun
/**
 * Ensures critical environment variables stay in sync across:
 * 1) .env.template
 * 2) PublicEnvSchema/ServerEnvSchema in src/lib/env.ts
 * 3) validatePublicEnv()/validateServerEnv() safeParse mappings in src/lib/env.ts
 *
 * NOTE:
 * - Script name kept for backward compatibility with existing package scripts.
 * - Scope intentionally includes analytics + core runtime env contract.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_PUBLIC_ENV = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_AHREFS_KEY',
] as const;

const REQUIRED_SERVER_ENV = [
  'UNSUBSCRIBE_SECRET',
  'SENTRY_WEBHOOK_SECRET',
  'LINEAR_API_KEY',
  'LINEAR_TEAM_KEY',
  'REFERRAL_PARTNER_EMAIL',
  'INDEXNOW_SUBMIT_SECRET',
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
  const serverSchema = getSection(
    envSource,
    /export const ServerEnvSchema = z\.object\(\{/,
    /\n\}\);/,
  );
  const publicSafeParse = getSection(envSource, /PublicEnvSchema\.safeParse\(\{/, /\n\s*\}\);/);
  const serverSafeParse = getSection(envSource, /ServerEnvSchema\.safeParse\(\{/, /\n\s*\}\);/);

  const errors: string[] = [];

  for (const key of REQUIRED_PUBLIC_ENV) {
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

  for (const key of REQUIRED_SERVER_ENV) {
    const templatePattern = new RegExp(`^${escapeRegex(key)}=`, 'm');
    if (!templatePattern.test(template)) {
      errors.push(`${key} missing from .env.template`);
    }

    const schemaPattern = new RegExp(`\\b${escapeRegex(key)}\\s*:`, 'm');
    if (!schemaPattern.test(serverSchema)) {
      errors.push(`${key} missing from ServerEnvSchema in src/lib/env.ts`);
    }

    const mappingPattern = new RegExp(
      `\\b${escapeRegex(key)}\\s*:\\s*process\\.env\\.${escapeRegex(key)}\\b`,
      'm',
    );
    if (!mappingPattern.test(serverSafeParse)) {
      errors.push(`${key} missing from validateServerEnv() mapping in src/lib/env.ts`);
    }
  }

  console.log('🔎 Checking env contract sync...');
  console.log('   Public keys:');
  for (const key of REQUIRED_PUBLIC_ENV) {
    console.log(`   - ${key}`);
  }
  console.log('   Server keys:');
  for (const key of REQUIRED_SERVER_ENV) {
    console.log(`   - ${key}`);
  }

  if (errors.length > 0) {
    console.error('\n❌ Env contract sync check failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Critical env vars are in sync across .env.template and src/lib/env.ts');
}

main();
