#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Command = 'init' | 'status';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'docs', 'reports', 'funnel');
const TEMPLATE_PATH = join(REPORTS_DIR, 'TEMPLATE.md');

function formatCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function getTargetMonth(): string {
  const arg = process.argv[3];
  if (arg && /^\d{4}-\d{2}$/.test(arg)) return arg;
  return formatCurrentMonth();
}

function getReportPath(month: string): string {
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
  const reportPath = getReportPath(month);
  if (existsSync(reportPath)) {
    console.log(`ℹ️  Funnel report already exists: ${reportPath}`);
    return;
  }

  writeFileSync(reportPath, renderTemplate(month), 'utf-8');
  console.log(`✅ Created funnel report scaffold: ${reportPath}`);
}

function runStatus(month: string): void {
  const reportPath = getReportPath(month);
  if (!existsSync(reportPath)) {
    console.error(`❌ Missing funnel report for ${month}: ${reportPath}`);
    console.error('   Run: bun run funnel:report:init');
    process.exit(1);
  }

  const content = readFileSync(reportPath, 'utf-8');
  const openChecklistItems = [...content.matchAll(/^- \[ \]/gm)].length;
  const decisionsCount = [...content.matchAll(/^- Decision:/gm)].length;
  const actionsCount = [...content.matchAll(/^- Action:/gm)].length;

  console.log(`🔎 Funnel report: ${reportPath}`);
  console.log(`   - Open checklist items: ${openChecklistItems}`);
  console.log(`   - Decisions logged: ${decisionsCount}`);
  console.log(`   - Actions logged: ${actionsCount}`);
  console.log('✅ Funnel report exists');
}

function main(): void {
  const command = (process.argv[2] as Command | undefined) ?? 'status';
  if (!['init', 'status'].includes(command)) {
    console.error('Usage: bun scripts/funnel-review-report.ts <init|status> [YYYY-MM]');
    process.exit(1);
  }

  const month = getTargetMonth();
  if (command === 'init') {
    runInit(month);
    return;
  }

  runStatus(month);
}

main();
