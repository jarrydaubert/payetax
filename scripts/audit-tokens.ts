#!/usr/bin/env tsx
/**
 * Token Audit Script - Enforce SSOT Design System
 *
 * Scans codebase for hardcoded Tailwind classes and inline styles that bypass
 * the centralized design token system (designTokens.ts).
 *
 * Usage:
 *   npm run audit:tokens
 *   npm run audit:tokens -- --fix  (auto-comment violations)
 *
 * Exit codes:
 *   0 - Clean (no violations)
 *   1 - Violations found (fails CI)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all design tokens from centralized source
import {
  COLORS,
  ICON_SIZES,
  LAYOUT,
  SHADOWS,
  SPACING,
  SURFACES,
  TYPOGRAPHY,
} from '../src/constants/designTokens.js';

// Build comprehensive token set (all valid class strings)
const tokenSet = new Set<string>([
  ...Object.values(TYPOGRAPHY),
  ...Object.values(SPACING),
  ...Object.values(ICON_SIZES),
  ...Object.values(LAYOUT),
  ...Object.values(COLORS),
  ...Object.values(SHADOWS),
  ...Object.values(SURFACES),
]);

// Also extract individual classes from multi-class tokens (e.g., "text-sm font-semibold" -> ["text-sm", "font-semibold"])
const individualClasses = new Set<string>();
for (const token of tokenSet) {
  for (const cls of token.split(/\s+/)) {
    individualClasses.add(cls);
  }
}

// Patterns for Tailwind classes that might be hardcoded
const tailwindPatterns = [
  // Typography
  /\b(?:text|font|tracking|leading)-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|tighter|tight|normal|wide|wider|widest|none|tight|snug|normal|relaxed|loose)\b/g,
  // Spacing
  /\b(?:p|m|gap|space)-(?:x|y|t|r|b|l|s|e)?-?(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|18|20|24|28|32|36|40|44|48|52|56|60|64|72|80|88|96|112|128)\b/g,
  // Colors
  /\b(?:bg|text|border|ring|shadow|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/g,
  // Borders & Shadows
  /\b(?:rounded|shadow|border)-(?:none|sm|md|lg|xl|2xl|3xl|full)?\b/g,
  // Layout
  /\b(?:max-w|min-h)-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen|min|max|fit)\b/g,
  // Arbitrary values (e.g., text-[clamp(...)])
  /\b(?:text|bg|p|m|gap|w|h|min-|max-)-\[.*?\]/g,
];

// Files/directories to exclude from audit
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
  // Email templates and server actions that require inline styles
  '/actions/feedback',
  '/api/error-log',
  '/api/indexnow',
  'email',
  'mail',
  // shadcn/ui base components - these are framework, not app code
  'components/atoms/ui/badge.tsx',
  'components/atoms/ui/button.tsx',
  'components/atoms/ui/chart.tsx',
  'components/atoms/ui/input.tsx',
  'components/atoms/ui/alert.tsx',
];

interface Violation {
  file: string;
  line: number;
  type: 'hardcoded-class' | 'inline-style';
  match: string;
  suggestion?: string;
}

function shouldExclude(filePath: string): boolean {
  return excludePatterns.some((pattern) => filePath.includes(pattern));
}

function findTokenMatch(hardcodedClass: string): string | null {
  // Find best matching token for suggestion
  for (const [tokenKey, tokenValue] of Object.entries({
    ...TYPOGRAPHY,
    ...SPACING,
    ...COLORS,
  })) {
    if (tokenValue.includes(hardcodedClass)) {
      return tokenKey;
    }
  }
  return null;
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for inline styles
    if (line.includes('style={{') || line.includes("style={'") || line.includes('style="')) {
      violations.push({
        file: filePath,
        line: lineNum,
        type: 'inline-style',
        match: line.trim().substring(0, 80),
        suggestion: 'Use design tokens from designTokens.ts instead of inline styles',
      });
    }

    // Check for hardcoded Tailwind classes
    for (const pattern of tailwindPatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        const hardcodedClass = match[0];

        // Skip if this class is in our token set
        if (individualClasses.has(hardcodedClass)) {
          continue;
        }

        // Skip common framework classes
        if (
          hardcodedClass.match(
            /^(container|flex|grid|block|inline|hidden|sr-only|pointer-events-none)$/
          )
        ) {
          continue;
        }

        const suggestion = findTokenMatch(hardcodedClass);
        violations.push({
          file: filePath,
          line: lineNum,
          type: 'hardcoded-class',
          match: hardcodedClass,
          suggestion: suggestion
            ? `Consider using: ${suggestion}`
            : 'Add to designTokens.ts or use existing token',
        });
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

      if (shouldExclude(fullPath)) {
        continue;
      }

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

function formatViolations(violations: Violation[]): string {
  const grouped = new Map<string, Violation[]>();

  for (const violation of violations) {
    if (!grouped.has(violation.file)) {
      grouped.set(violation.file, []);
    }
    const fileViolations = grouped.get(violation.file);
    if (fileViolations) {
      fileViolations.push(violation);
    }
  }

  let output = '';
  for (const [file, fileViolations] of grouped) {
    const relativePath = path.relative(process.cwd(), file);
    output += `\n📄 ${relativePath}\n`;

    for (const v of fileViolations) {
      const icon = v.type === 'inline-style' ? '🎨' : '⚠️';
      output += `  ${icon} Line ${v.line}: ${v.match}\n`;
      if (v.suggestion) {
        output += `     💡 ${v.suggestion}\n`;
      }
    }
  }

  return output;
}

// Main audit function
async function audit() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');

  if (!jsonOutput) {
    console.log('🔍 Auditing codebase for design token violations...\n');
  }

  const srcDir = path.join(__dirname, '../src');
  const files = walkDirectory(srcDir);

  if (!jsonOutput) {
    console.log(`📊 Scanning ${files.length} files...\n`);
  }

  const allViolations: Violation[] = [];

  for (const file of files) {
    const violations = scanFile(file);
    allViolations.push(...violations);
  }

  // Summary
  const hardcodedCount = allViolations.filter((v) => v.type === 'hardcoded-class').length;
  const inlineStyleCount = allViolations.filter((v) => v.type === 'inline-style').length;

  // JSON output for CI/CD
  if (jsonOutput) {
    const output = {
      summary: {
        filesScanned: files.length,
        hardcodedClasses: hardcodedCount,
        inlineStyles: inlineStyleCount,
        totalViolations: allViolations.length,
        clean: allViolations.length === 0,
      },
      violations: allViolations.map((v) => ({
        file: path.relative(process.cwd(), v.file),
        line: v.line,
        type: v.type,
        match: v.match,
        suggestion: v.suggestion,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(allViolations.length === 0 ? 0 : 1);
  }

  // Human-readable output
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    AUDIT SUMMARY                          ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total files scanned:        ${files.length}`);
  console.log(`Hardcoded classes:          ${hardcodedCount}`);
  console.log(`Inline styles:              ${inlineStyleCount}`);
  console.log(`Total violations:           ${allViolations.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (allViolations.length === 0) {
    console.log('✅ SSOT CLEAN - No design token violations found!\n');
    console.log('Your codebase follows the Single Source of Truth principle.');
    console.log('All styling uses centralized design tokens. 🎉\n');
    process.exit(0);
  }

  console.log('🚨 VIOLATIONS FOUND:\n');
  console.log(formatViolations(allViolations));

  console.log('\n📚 RECOMMENDATIONS:\n');
  console.log('1. Replace hardcoded classes with design tokens from designTokens.ts');
  console.log('2. Remove inline styles and use className with tokens instead');
  console.log('3. If a pattern is common, add it to designTokens.ts');
  console.log('4. Run `npm run audit:tokens` before committing\n');

  console.log('💡 Example fix:');
  console.log('  ❌ className="text-sm font-semibold"');
  console.log('  ✅ className={TYPOGRAPHY.TEXT_SM_SEMIBOLD}\n');

  process.exit(1);
}

audit().catch((error) => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
