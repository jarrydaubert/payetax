#!/usr/bin/env bun
/**
 * Token Audit Script - shadcn-first + semantic class enforcement
 *
 * Usage:
 *   bun run audit:tokens
 *   bun run audit:tokens -- --verbose
 *   bun run audit:tokens -- --snapshot
 *   bun run audit:tokens -- --delta
 *   bun run audit:tokens -- --max-files=8 --max-details=20
 *
 * Modes:
 *   default    - fail if any violations exist
 *   --snapshot - write baseline file and exit 0
 *   --delta    - compare against baseline; fail only on increases
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COLORS,
  ICON_SIZES,
  LAYOUT,
  SHADOWS,
  SPACING,
  SURFACES,
  TYPOGRAPHY,
} from '../src/constants/designTokens.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MAX_FILES = 12;
const DEFAULT_MAX_DETAILS = 30;
const BASELINE_PATH = path.join(__dirname, 'baselines/token-audit-baseline.json');
const SRC_DIR = path.join(__dirname, '../src');

type ViolationType = 'raw-palette-color' | 'hardcoded-class' | 'inline-style';
type Surface = 'director' | 'blog' | 'homecalc' | 'other';

interface Violation {
  file: string;
  line: number;
  type: ViolationType;
  surface: Surface;
  match: string;
  suggestion?: string;
}

type SurfaceSummary = Record<Surface, Record<ViolationType | 'total', number>>;

interface BaselineSnapshot {
  createdAt: string;
  summary: {
    filesScanned: number;
    totalViolations: number;
    typeCounts: Record<ViolationType, number>;
    surfaces: SurfaceSummary;
  };
}

const tokenSet = new Set<string>([
  ...Object.values(TYPOGRAPHY),
  ...Object.values(SPACING),
  ...Object.values(ICON_SIZES),
  ...Object.values(LAYOUT),
  ...Object.values(COLORS),
  ...Object.values(SHADOWS),
  ...Object.values(SURFACES),
]);

const individualClasses = new Set<string>();
for (const token of tokenSet) {
  for (const cls of token.split(/\s+/)) {
    individualClasses.add(cls);
  }
}

const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '__tests__',
  '.test.',
  '.spec.',
  'tailwind.config',
  'postcss.config',
  'next.config',
  '/app/api/',
  'constants/designTokens.ts',
  '/actions/feedback',
  '/api/indexnow',
  'email',
  'mail',
  'components/atoms/ui/badge.tsx',
  'components/atoms/ui/button.tsx',
  'components/atoms/ui/chart.tsx',
  'components/atoms/ui/input.tsx',
  'components/atoms/ui/alert.tsx',
  'components/atoms/ui/select.tsx',
  '/opengraph-image.tsx',
];

const rawPalettePatterns = [
  /\b(?:text|bg|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/(?:\d+|\[[^\]]+\]))?\b/g,
  /\b(?:text|bg|border|ring|from|to|via)-\[#(?:[0-9a-fA-F]{3,8})\]\b/g,
  /\bborder-white\/\[[^\]]+\]\b/g,
];

const rawPaletteTestPatterns = [
  /^(?:text|bg|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/(?:\d+|\[[^\]]+\]))?$/,
  /^(?:text|bg|border|ring|from|to|via)-\[#(?:[0-9a-fA-F]{3,8})\]$/,
  /^border-white\/\[[^\]]+\]$/,
];

const genericPatterns = [
  /\b(?:text|font|tracking|leading)-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|tighter|tight|snug|relaxed|loose|none)\b/g,
  /\b(?:p|m|gap|space)-(?:x|y|t|r|b|l|s|e)?-?(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|18|20|24|28|32|36|40|44|48|52|56|60|64|72|80|88|96|112|128)\b/g,
  /\b(?:rounded|shadow|border)-(?:none|sm|md|lg|xl|2xl|3xl|full)?\b/g,
  /\b(?:max-w|min-h)-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen|min|max|fit)(?!-)\b/g,
  /\b(?:text|bg|p|m|gap|w|h|min-|max-)-\[.*?\]/g,
];

const rawPaletteAllowlistRules: Array<{ file: RegExp; className: RegExp }> = [
  {
    file: /src\/components\/molecules\/ServerHero\.tsx$/,
    className:
      /^(?:from-cyan-500|to-emerald-500|from-cyan-400|to-emerald-400|border-cyan-500|bg-cyan-500|text-cyan-500|text-emerald-500)$/,
  },
];

const inlineStyleAllowlistRules: Array<{ file: RegExp; snippet?: RegExp }> = [
  {
    file: /src\/components\/molecules\/ReadingProgress\.tsx$/,
    snippet: /style=\{\{\s*width:\s*`\$\{progress\}%`\s*\}\}/,
  },
  {
    file: /src\/components\/molecules\/DirectorGuide\/dashboard\/MoneyFlowChart\.tsx$/,
    snippet: /style=\{\{\s*width:\s*`\$\{bar\.percent\}%`\s*\}\}/,
  },
  {
    file: /src\/components\/organisms\/SalaryComparison\/MarginalRateInsight\.tsx$/,
    snippet: /style=\{\{\s*width:\s*`\$\{keepRateClamped\}%`\s*\}\}/,
  },
  {
    file: /src\/components\/organisms\/ErrorBoundary\.tsx$/,
    snippet: /style=\{\{/,
  },
];

function shouldExclude(filePath: string): boolean {
  return excludePatterns.some((pattern) => filePath.includes(pattern));
}

function isRawPaletteClass(className: string): boolean {
  return rawPaletteTestPatterns.some((pattern) => pattern.test(className));
}

function isPlaceholderMatch(value: string): boolean {
  return value.endsWith('-');
}

function getSurface(filePath: string): Surface {
  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

  if (
    rel.startsWith('src/components/molecules/DirectorGuide/') ||
    rel.startsWith('src/components/organisms/DirectorGuide/') ||
    rel.startsWith('src/app/tools/director-guide/')
  ) {
    return 'director';
  }

  if (
    rel.startsWith('src/app/blog/') ||
    rel.startsWith('src/components/molecules/Article') ||
    rel.startsWith('src/components/molecules/Blog') ||
    rel === 'src/components/molecules/mdx-components.tsx' ||
    rel === 'src/components/organisms/AllPostsGrid.tsx' ||
    rel === 'src/components/organisms/LatestArticles.tsx' ||
    rel === 'src/components/organisms/DeepDives.tsx'
  ) {
    return 'blog';
  }

  if (
    rel === 'src/app/page.tsx' ||
    rel.startsWith('src/app/calculator/') ||
    rel === 'src/components/pages/HomePageContent.tsx' ||
    rel === 'src/components/pages/SalaryCalculatorPage.tsx' ||
    rel.startsWith('src/components/organisms/Calculator')
  ) {
    return 'homecalc';
  }

  return 'other';
}

function isRawPaletteAllowlisted(filePath: string, className: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return rawPaletteAllowlistRules.some(
    (rule) => rule.file.test(normalized) && rule.className.test(className),
  );
}

function isInlineStyleAllowlisted(filePath: string, line: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return inlineStyleAllowlistRules.some((rule) => {
    if (!rule.file.test(normalized)) return false;
    if (!rule.snippet) return true;
    return rule.snippet.test(line);
  });
}

function findTokenMatch(hardcodedClass: string): string | null {
  for (const [tokenKey, tokenValue] of Object.entries({
    ...TYPOGRAPHY,
    ...SPACING,
  })) {
    if (tokenValue.includes(hardcodedClass)) {
      return tokenKey;
    }
  }
  return null;
}

function suggestSemanticClass(rawClass: string): string {
  if (/^text-slate-(100|200|300)$/.test(rawClass)) return 'Use `text-foreground`';
  if (/^text-slate-(400|500)$/.test(rawClass)) return 'Use `text-muted-foreground`';
  if (/^bg-slate-(800|900)$/.test(rawClass)) return 'Use `bg-card`';
  if (/^bg-slate-950$/.test(rawClass)) return 'Use `bg-background`';
  if (/^border-(?:slate-\d+|white\/\[[^\]]+\])$/.test(rawClass)) return 'Use `border-border`';
  if (/^text-cyan-\d+$/.test(rawClass)) return 'Use `text-primary`';
  if (/^bg-cyan-\d+(?:\/(?:\d+|\[[^\]]+\]))?$/.test(rawClass))
    return 'Use `bg-primary/10` or `bg-primary/20`';
  if (/^text-emerald-\d+$/.test(rawClass)) return 'Use `text-success` (semantic alias)';
  if (/^text-amber-\d+$/.test(rawClass)) return 'Use `text-warning` (semantic alias)';
  if (/^text-red-\d+$/.test(rawClass)) return 'Use `text-destructive`';
  return 'Replace with semantic theme class (`text-foreground`, `bg-card`, `border-border`, etc.)';
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const seen = new Set<string>();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const surface = getSurface(filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (line.includes('style={{') || line.includes("style={'") || line.includes('style="')) {
      if (isInlineStyleAllowlisted(filePath, line)) {
        return;
      }
      const violation: Violation = {
        file: filePath,
        line: lineNum,
        type: 'inline-style',
        surface,
        match: line.trim().substring(0, 80),
        suggestion:
          'Prefer semantic classes/shadcn variants; inline styles only where technically required',
      };
      const key = `${violation.file}:${violation.line}:${violation.type}:${violation.match}`;
      if (!seen.has(key)) {
        seen.add(key);
        violations.push(violation);
      }
    }

    for (const pattern of rawPalettePatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        const className = match[0];
        if (isPlaceholderMatch(className) || isRawPaletteAllowlisted(filePath, className)) {
          continue;
        }

        const violation: Violation = {
          file: filePath,
          line: lineNum,
          type: 'raw-palette-color',
          surface,
          match: className,
          suggestion: suggestSemanticClass(className),
        };
        const key = `${violation.file}:${violation.line}:${violation.type}:${violation.match}`;
        if (!seen.has(key)) {
          seen.add(key);
          violations.push(violation);
        }
      }
    }

    for (const pattern of genericPatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        const hardcodedClass = match[0];

        if (isPlaceholderMatch(hardcodedClass) || isRawPaletteClass(hardcodedClass)) {
          continue;
        }
        if (individualClasses.has(hardcodedClass)) {
          continue;
        }
        if (
          hardcodedClass.match(
            /^(container|flex|grid|block|inline|hidden|sr-only|pointer-events-none)$/,
          )
        ) {
          continue;
        }

        const suggestion = findTokenMatch(hardcodedClass);
        const violation: Violation = {
          file: filePath,
          line: lineNum,
          type: 'hardcoded-class',
          surface,
          match: hardcodedClass,
          suggestion: suggestion
            ? `Consider shared token: ${suggestion}`
            : 'Use shadcn primitive/variant or shared semantic pattern',
        };
        const key = `${violation.file}:${violation.line}:${violation.type}:${violation.match}`;
        if (!seen.has(key)) {
          seen.add(key);
          violations.push(violation);
        }
      }
    }
  });

  return violations;
}

function walkDirectory(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (shouldExclude(fullPath)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?|css)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function groupViolationsByFile(violations: Violation[]): Record<string, Violation[]> {
  return violations.reduce<Record<string, Violation[]>>((acc, violation) => {
    const bucket = acc[violation.file] || [];
    bucket.push(violation);
    acc[violation.file] = bucket;
    return acc;
  }, {});
}

function buildSurfaceSummary(violations: Violation[]): SurfaceSummary {
  const surfaces: SurfaceSummary = {
    director: { 'raw-palette-color': 0, 'hardcoded-class': 0, 'inline-style': 0, total: 0 },
    blog: { 'raw-palette-color': 0, 'hardcoded-class': 0, 'inline-style': 0, total: 0 },
    homecalc: { 'raw-palette-color': 0, 'hardcoded-class': 0, 'inline-style': 0, total: 0 },
    other: { 'raw-palette-color': 0, 'hardcoded-class': 0, 'inline-style': 0, total: 0 },
  };

  for (const violation of violations) {
    surfaces[violation.surface][violation.type] += 1;
    surfaces[violation.surface].total += 1;
  }

  return surfaces;
}

function buildTypeCounts(violations: Violation[]): Record<ViolationType, number> {
  return violations.reduce<Record<ViolationType, number>>(
    (acc, violation) => {
      acc[violation.type] += 1;
      return acc;
    },
    { 'raw-palette-color': 0, 'hardcoded-class': 0, 'inline-style': 0 },
  );
}

function formatCompactSummary(
  violations: Violation[],
  maxFiles = DEFAULT_MAX_FILES,
  maxDetails = DEFAULT_MAX_DETAILS,
): string {
  const grouped = groupViolationsByFile(violations);
  const rankedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  const topFiles = rankedFiles.slice(0, maxFiles);
  const typeCounts = buildTypeCounts(violations);
  const surfaceSummary = buildSurfaceSummary(violations);

  const fileBuckets = topFiles.map(
    ([file, fileViolations]) =>
      [file, fileViolations.slice().sort((a, b) => a.line - b.line)] as const,
  );
  const sampled: Violation[] = [];
  while (sampled.length < maxDetails) {
    let added = false;
    for (const [, bucket] of fileBuckets) {
      const next = bucket.shift();
      if (!next) continue;
      sampled.push(next);
      added = true;
      if (sampled.length >= maxDetails) break;
    }
    if (!added) break;
  }

  const byMatch = violations.reduce<Record<string, number>>((acc, violation) => {
    acc[violation.match] = (acc[violation.match] || 0) + 1;
    return acc;
  }, {});
  const topMatches = Object.entries(byMatch)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  let output = '';
  output += 'Violation types:\n';
  output += `  - raw-palette-color: ${typeCounts['raw-palette-color']}\n`;
  output += `  - hardcoded-class: ${typeCounts['hardcoded-class']}\n`;
  output += `  - inline-style: ${typeCounts['inline-style']}\n\n`;

  output += 'Surface breakdown:\n';
  for (const surface of ['director', 'blog', 'homecalc', 'other'] as const) {
    const bucket = surfaceSummary[surface];
    output += `  - ${surface}: total=${bucket.total}, raw-palette=${bucket['raw-palette-color']}, hardcoded=${bucket['hardcoded-class']}, inline=${bucket['inline-style']}\n`;
  }
  output += '\n';

  output += 'Top repeated matches:\n';
  for (const [match, count] of topMatches) {
    output += `  - ${match}: ${count}\n`;
  }
  output += '\n';

  output += `Top files with violations (${Math.min(topFiles.length, maxFiles)} of ${rankedFiles.length}):\n`;
  for (const [file, fileViolations] of topFiles) {
    output += `  - ${path.relative(process.cwd(), file)}: ${fileViolations.length}\n`;
  }
  if (rankedFiles.length > maxFiles) {
    output += `  ... ${rankedFiles.length - maxFiles} more files\n`;
  }

  output += `\nSample violations (${sampled.length} of ${violations.length}):\n`;
  for (const violation of sampled) {
    const icon =
      violation.type === 'inline-style'
        ? '🎨'
        : violation.type === 'raw-palette-color'
          ? '🎯'
          : '⚠️';
    output += `  ${icon} ${path.relative(process.cwd(), violation.file)}:${violation.line} ${violation.match}\n`;
    if (violation.suggestion) {
      output += `     💡 ${violation.suggestion}\n`;
    }
  }
  if (violations.length > maxDetails) {
    output += `  ... ${violations.length - maxDetails} more violations (run with --verbose for full output)\n`;
  }

  return output;
}

function formatVerboseViolations(violations: Violation[]): string {
  const grouped = groupViolationsByFile(violations);
  const orderedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  let output = '';
  for (const [file, fileViolations] of orderedFiles) {
    output += `\n📄 ${path.relative(process.cwd(), file)}\n`;
    for (const violation of fileViolations) {
      const icon =
        violation.type === 'inline-style'
          ? '🎨'
          : violation.type === 'raw-palette-color'
            ? '🎯'
            : '⚠️';
      output += `  ${icon} [${violation.surface}] line ${violation.line}: ${violation.match}\n`;
      if (violation.suggestion) {
        output += `     💡 ${violation.suggestion}\n`;
      }
    }
  }
  return output;
}

function ensureAuditOutputDir(): void {
  const outputDir = path.dirname(BASELINE_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function writeBaseline(snapshot: BaselineSnapshot): void {
  ensureAuditOutputDir();
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 2));
}

function readBaseline(): BaselineSnapshot | null {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8')) as BaselineSnapshot;
  } catch {
    return null;
  }
}

function compareWithBaseline(
  current: BaselineSnapshot,
  baseline: BaselineSnapshot,
): {
  hasIncrease: boolean;
  messages: string[];
} {
  const messages: string[] = [];
  let hasIncrease = false;

  for (const type of ['raw-palette-color', 'inline-style'] as const) {
    const before = baseline.summary.typeCounts[type];
    const after = current.summary.typeCounts[type];
    const delta = after - before;
    messages.push(`- ${type}: ${before} -> ${after} (delta ${delta >= 0 ? '+' : ''}${delta})`);
    if (delta > 0) hasIncrease = true;
  }

  for (const surface of ['director', 'blog', 'homecalc', 'other'] as const) {
    const before = baseline.summary.surfaces[surface]['raw-palette-color'];
    const after = current.summary.surfaces[surface]['raw-palette-color'];
    const delta = after - before;
    messages.push(
      `- ${surface}.raw-palette-color: ${before} -> ${after} (delta ${delta >= 0 ? '+' : ''}${delta})`,
    );
    if (delta > 0) hasIncrease = true;
  }

  return { hasIncrease, messages };
}

function parseNumericFlag(args: string[], key: string, fallback: number): number {
  const arg = args.find((value) => value.startsWith(`${key}=`));
  if (!arg) return fallback;
  const parsed = Number.parseInt(arg.split('=')[1] || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verboseOutput = args.includes('--verbose');
  const snapshotMode = args.includes('--snapshot');
  const deltaMode = args.includes('--delta');
  const maxFiles = parseNumericFlag(args, '--max-files', DEFAULT_MAX_FILES);
  const maxDetails = parseNumericFlag(args, '--max-details', DEFAULT_MAX_DETAILS);

  if (snapshotMode && deltaMode) {
    console.error('❌ Use either --snapshot or --delta, not both.');
    process.exit(1);
  }

  if (!jsonOutput) {
    console.log('🔍 Auditing codebase for UI styling contract violations...\n');
  }

  const files = walkDirectory(SRC_DIR);
  if (!jsonOutput) {
    console.log(`📊 Scanning ${files.length} files...\n`);
  }

  const violations = files.flatMap((file) => scanFile(file));
  const typeCounts = buildTypeCounts(violations);
  const surfaceSummary = buildSurfaceSummary(violations);

  const snapshot: BaselineSnapshot = {
    createdAt: new Date().toISOString(),
    summary: {
      filesScanned: files.length,
      totalViolations: violations.length,
      typeCounts,
      surfaces: surfaceSummary,
    },
  };

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          summary: {
            filesScanned: files.length,
            rawPaletteColors: typeCounts['raw-palette-color'],
            hardcodedClasses: typeCounts['hardcoded-class'],
            inlineStyles: typeCounts['inline-style'],
            totalViolations: violations.length,
            clean: violations.length === 0,
            surfaces: surfaceSummary,
          },
          violations: violations.map((v) => ({
            file: path.relative(process.cwd(), v.file),
            line: v.line,
            type: v.type,
            surface: v.surface,
            match: v.match,
            suggestion: v.suggestion,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(violations.length === 0 ? 0 : 1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    AUDIT SUMMARY                          ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total files scanned:        ${files.length}`);
  console.log(`Raw palette colors:         ${typeCounts['raw-palette-color']}`);
  console.log(`Hardcoded classes:          ${typeCounts['hardcoded-class']}`);
  console.log(`Inline styles:              ${typeCounts['inline-style']}`);
  console.log(`Total violations:           ${violations.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (violations.length === 0) {
    console.log('✅ UI styling contract clean.\n');
    process.exit(0);
  }

  console.log('🚨 VIOLATIONS FOUND:\n');
  if (verboseOutput) {
    console.log(formatVerboseViolations(violations));
  } else {
    console.log(formatCompactSummary(violations, maxFiles, maxDetails));
  }

  if (snapshotMode) {
    writeBaseline(snapshot);
    console.log(`\n🧾 Baseline snapshot saved: ${path.relative(process.cwd(), BASELINE_PATH)}`);
    console.log('✅ Snapshot mode complete (exit 0).');
    process.exit(0);
  }

  if (deltaMode) {
    const baseline = readBaseline();
    if (!baseline) {
      console.error(
        `\n❌ No baseline found at ${path.relative(process.cwd(), BASELINE_PATH)}. Run with --snapshot first.`,
      );
      process.exit(1);
    }

    const comparison = compareWithBaseline(snapshot, baseline);
    console.log('\n📉 Delta vs baseline:');
    for (const message of comparison.messages) {
      console.log(`  ${message}`);
    }

    if (comparison.hasIncrease) {
      console.error(
        '\n❌ Delta gate failed: new raw palette or inline-style violations were introduced.',
      );
      process.exit(1);
    }

    console.log('\n✅ Delta gate passed: no new raw palette/inline-style violations.');
    process.exit(0);
  }

  console.log('\n📚 RECOMMENDATIONS:\n');
  console.log('1. Use shadcn primitives first (Button/Card/Badge/Input/etc.)');
  console.log('2. Replace raw palette classes with semantic theme classes');
  console.log(
    '3. Keep designTokens.ts focused on true shared patterns (not one-off utility mirrors)',
  );
  console.log(
    '4. Use `bun run audit:tokens -- --snapshot` then `--delta` for CI no-growth gating\n',
  );

  process.exit(1);
}

main().catch((error) => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
