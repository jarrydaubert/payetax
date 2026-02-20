#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Command = 'init' | 'status';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'docs', 'reports', 'seo-tech');
const TEMPLATE_PATH = join(REPORTS_DIR, 'TEMPLATE.md');

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function getMonthArg(): string {
  const arg = process.argv[3];
  if (arg && /^\d{4}-\d{2}$/.test(arg)) return arg;
  return currentMonth();
}

function reportPath(month: string): string {
  return join(REPORTS_DIR, `${month}.md`);
}

function renderTemplate(month: string): string {
  const template = readFileSync(TEMPLATE_PATH, 'utf-8');
  return template
    .replaceAll('{{MONTH}}', month)
    .replaceAll('{{DATE}}', new Date().toISOString().slice(0, 10));
}

function runInit(month: string): void {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const target = reportPath(month);
  if (existsSync(target)) {
    console.log(`ℹ️  SEO tech report already exists: ${target}`);
    return;
  }

  writeFileSync(target, renderTemplate(month), 'utf-8');
  console.log(`✅ Created SEO tech report scaffold: ${target}`);
}

function runStatus(month: string): void {
  const target = reportPath(month);
  if (!existsSync(target)) {
    console.error(`❌ Missing SEO tech report for ${month}: ${target}`);
    console.error('   Run: bun run seo:report:init');
    process.exit(1);
  }

  const content = readFileSync(target, 'utf-8');
  const openChecklistItems = [...content.matchAll(/^- \[ \]/gm)].length;
  const actionsCount = [...content.matchAll(/^- Action:/gm)].length;

  console.log(`🔎 SEO tech report: ${target}`);
  console.log(`   - Open checklist items: ${openChecklistItems}`);
  console.log(`   - Actions logged: ${actionsCount}`);
  console.log('✅ SEO tech report exists');
}

function main(): void {
  const command = (process.argv[2] as Command | undefined) ?? 'status';
  if (!['init', 'status'].includes(command)) {
    console.error('Usage: bun scripts/seo-tech-report.ts <init|status> [YYYY-MM]');
    process.exit(1);
  }

  const month = getMonthArg();
  if (command === 'init') {
    runInit(month);
    return;
  }

  runStatus(month);
}

main();
