import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import {
  CT_RATES,
  DIVIDEND_TAX_RATES,
  PAYROLL_PERIOD_THRESHOLDS,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEARS,
} from '../src/constants/taxRates';

export interface SourceText {
  path: string;
  content: string;
}

export interface TaxImportViolation {
  file: string;
  line: number;
  specifier: string;
  imports: string[];
}

export interface TaxImportBaselineEntry {
  file: string;
  specifier: string;
  imports: readonly string[];
}

export interface TaxFactBaselineEntry {
  file: string;
  kind: TaxFactKind;
  value: string;
  count: number;
}

export type TaxFactKind = 'policy-value' | 'rate' | 'tax-year';

export interface TaxFactOccurrence {
  file: string;
  line: number;
  column: number;
  kind: TaxFactKind;
  value: string;
  exceptionId?: string;
}

export interface TaxFactFinding {
  file: string;
  kind: TaxFactKind;
  value: string;
  count: number;
  lines: number[];
}

export interface TaxFactComparison {
  baseline: TaxFactFinding[];
  newFindings: TaxFactFinding[];
  reduced: Array<TaxFactBaselineEntry & { actualCount: number }>;
}

export interface PolicyCatalog {
  amounts: number[];
  ratePercents: number[];
  taxYears: string[];
}

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const TAX_FACT_EXTENSIONS = new Set(['.js', '.jsx', '.json', '.md', '.mdx', '.ts', '.tsx']);
const TEST_FILE_PATTERN = /(?:^|\/)(?:__tests__|test)(?:\/|$)|\.(?:spec|test)\.[jt]sx?$/;
const EXPLICIT_RATE_CONTAINERS = new Set(['CT_RATES', 'DIVIDEND_TAX_RATES', 'SCOTTISH_TAX_RATES']);

export const TAX_FACT_EXCEPTION_RULES = [
  {
    id: 'canonical-policy',
    category: 'approved-location',
    description: 'The legacy canonical policy record remains approved until the policy split.',
    matches: 'src/constants/taxRates.ts',
    applies: (path: string) => path === 'src/constants/taxRates.ts',
  },
  {
    id: 'tax-domain-implementation',
    category: 'approved-location',
    description: 'Tax-domain implementation files may contain policy-derived mechanics.',
    matches: 'src/lib/tax/**',
    applies: (path: string) => path.startsWith('src/lib/tax/'),
  },
  {
    id: 'tax-fact-control',
    category: 'approved-location',
    description: 'The scanner implementation contains matching vocabulary, not application facts.',
    matches: 'scripts/tax-domain-controls.ts, scripts/tax-facts-baseline.ts',
    applies: (path: string) =>
      path === 'scripts/tax-domain-controls.ts' || path === 'scripts/tax-facts-baseline.ts',
  },
  {
    id: 'verification-fixtures',
    category: 'fixture',
    description:
      'Pinned independent fixtures and executable verification tests need literal expectations.',
    matches: 'src/test/**, src/**/__tests__/**, *.test.*, *.spec.*, e2e/fixtures/**',
    applies: (path: string) =>
      TEST_FILE_PATTERN.test(path) ||
      path.startsWith('src/test/') ||
      path.startsWith('e2e/fixtures/'),
  },
  {
    id: 'pinned-historical-content',
    category: 'pinned-history',
    description:
      'Dated blog filenames intentionally preserve the tax facts for their named period.',
    matches: 'content/blog/*<year>*.mdx',
    applies: (path: string) => /^content\/blog\/.*(?:19|20)\d{2}(?:-\d{2})?.*\.mdx$/.test(path),
  },
  {
    id: 'official-quotation',
    category: 'official-quotation',
    description:
      'A line marked `tax-fact-scan: official-quotation` is an explicit sourced quotation.',
    matches: 'line marker',
    applies: (_path: string, lineText: string) =>
      lineText.includes('tax-fact-scan: official-quotation'),
  },
] as const;

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}

function collectFiles(
  root: string,
  roots: readonly string[],
  extensions: Set<string>,
): SourceText[] {
  const sources: SourceText[] = [];

  function walk(directory: string): void {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!extensions.has(extname(entry.name))) continue;
      sources.push({
        path: normalizePath(relative(root, fullPath)),
        content: readFileSync(fullPath, 'utf8'),
      });
    }
  }

  for (const rootPath of roots) {
    walk(resolve(root, rootPath));
  }

  return sources.sort((a, b) => a.path.localeCompare(b.path));
}

function isApplicationSource(path: string): boolean {
  if (TEST_FILE_PATTERN.test(path)) return false;
  if (path.startsWith('src/lib/tax/')) return false;
  if (path === 'src/constants/taxRates.ts') return false;
  if (path === 'src/lib/taxCalculator.ts') return false;
  if (path === 'scripts/tax-domain-controls.ts') return false;
  return true;
}

function stripModuleSuffix(path: string): string {
  return path.replace(/\.(?:js|jsx|ts|tsx)$/, '').replace(/\/index$/, '');
}

function resolveImportTarget(file: string, specifier: string): string | null {
  if (specifier.startsWith('@/')) {
    return stripModuleSuffix(`src/${specifier.slice(2)}`);
  }

  if (!specifier.startsWith('.')) return null;
  return stripModuleSuffix(normalizePath(join(dirname(file), specifier)));
}

function isTaxInternalTarget(target: string): boolean {
  return (
    target === 'src/constants/taxRates' ||
    target === 'src/lib/taxCalculator' ||
    target === 'src/lib/taxCodeDecoder' ||
    target === 'src/lib/tax' ||
    target.startsWith('src/lib/tax/')
  );
}

function importBindings(node: ts.ImportDeclaration | ts.ExportDeclaration): string[] {
  if (ts.isExportDeclaration(node)) {
    if (!node.exportClause) return ['<export-all>'];
    if (ts.isNamespaceExport(node.exportClause)) return [`*:${node.exportClause.name.text}`];
    return node.exportClause.elements
      .map((element) => {
        const source = element.propertyName?.text;
        const binding = source ? `${source}->${element.name.text}` : element.name.text;
        return element.isTypeOnly ? `type:${binding}` : binding;
      })
      .sort();
  }

  const clause = node.importClause;
  if (!clause) return ['<side-effect>'];
  const typePrefix = clause.isTypeOnly ? 'type:' : '';
  const bindings: string[] = [];

  if (clause.name) bindings.push(`${typePrefix}default:${clause.name.text}`);
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    bindings.push(`${typePrefix}*:${clause.namedBindings.name.text}`);
  }
  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    for (const element of clause.namedBindings.elements) {
      const source = element.propertyName?.text;
      const binding = source ? `${source}->${element.name.text}` : element.name.text;
      bindings.push(element.isTypeOnly || clause.isTypeOnly ? `type:${binding}` : binding);
    }
  }

  return bindings.sort();
}

export function findTaxImportViolations(sources: readonly SourceText[]): TaxImportViolation[] {
  const violations: TaxImportViolation[] = [];

  for (const source of sources) {
    if (!isApplicationSource(source.path)) continue;
    const scriptKind =
      source.path.endsWith('.tsx') || source.path.endsWith('.jsx')
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(
      source.path,
      source.content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind,
    );

    function record(node: ts.Node, specifier: string, imports: string[]): void {
      if (specifier === '@/lib/tax') return;
      const target = resolveImportTarget(source.path, specifier);
      if (!(target && isTaxInternalTarget(target))) return;
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({ file: source.path, line: line + 1, specifier, imports });
    }

    function visit(node: ts.Node): void {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        record(node, node.moduleSpecifier.text, importBindings(node));
      }

      if (
        ts.isCallExpression(node) &&
        node.arguments.length === 1 &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0]) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
      ) {
        record(node, node.arguments[0].text, ['<dynamic>']);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return violations.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.specifier.localeCompare(b.specifier) ||
      a.imports.join(',').localeCompare(b.imports.join(',')),
  );
}

function importSignature(entry: TaxImportBaselineEntry): string {
  return `${entry.file}|${entry.specifier}|${[...entry.imports].sort().join(',')}`;
}

export function compareTaxImportBaseline(
  violations: readonly TaxImportViolation[],
  baseline: readonly TaxImportBaselineEntry[],
): { newViolations: TaxImportViolation[]; staleBaseline: TaxImportBaselineEntry[] } {
  const currentCounts = new Map<string, number>();
  const approvedCounts = new Map<string, number>();
  for (const violation of violations) {
    const signature = importSignature(violation);
    currentCounts.set(signature, (currentCounts.get(signature) ?? 0) + 1);
  }
  for (const entry of baseline) {
    const signature = importSignature(entry);
    approvedCounts.set(signature, (approvedCounts.get(signature) ?? 0) + 1);
  }

  const currentSeen = new Map<string, number>();
  const baselineSeen = new Map<string, number>();

  return {
    newViolations: violations.filter((violation) => {
      const signature = importSignature(violation);
      const seen = (currentSeen.get(signature) ?? 0) + 1;
      currentSeen.set(signature, seen);
      return seen > (approvedCounts.get(signature) ?? 0);
    }),
    staleBaseline: baseline.filter((entry) => {
      const signature = importSignature(entry);
      const seen = (baselineSeen.get(signature) ?? 0) + 1;
      baselineSeen.set(signature, seen);
      return seen > (currentCounts.get(signature) ?? 0);
    }),
  };
}

export function collectTaxImportSources(root: string): SourceText[] {
  return collectFiles(root, ['src', 'scripts'], CODE_EXTENSIONS);
}

function collectPolicyNumbers(
  value: unknown,
  path: string[],
  amounts: Set<number>,
  rates: Set<number>,
): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return;
    const key = path.at(-1)?.toLowerCase() ?? '';
    const isMonetaryField = /(?:allowance|amount|limit|threshold)$/.test(key);
    const isRateField = /rate$/.test(key);
    const isExplicitRateContainer = path
      .slice(0, -1)
      .some(
        (part) =>
          EXPLICIT_RATE_CONTAINERS.has(part) || ['rate', 'rates'].includes(part.toLowerCase()),
      );

    if (isMonetaryField && Math.abs(value) >= 100) {
      amounts.add(value);
    } else if (isRateField || isExplicitRateContainer) {
      rates.add(value <= 1 ? value * 100 : value);
    } else if (Math.abs(value) >= 100) {
      amounts.add(value);
    }
    return;
  }

  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    collectPolicyNumbers(nested, [...path, key], amounts, rates);
  }
}

export function createPolicyCatalog(): PolicyCatalog {
  const amounts = new Set<number>();
  const rates = new Set<number>();
  for (const [name, policy] of Object.entries({
    CT_RATES,
    DIVIDEND_TAX_RATES,
    PAYROLL_PERIOD_THRESHOLDS,
    SCOTTISH_TAX_RATES,
    TAX_RATES,
  })) {
    collectPolicyNumbers(policy, [name], amounts, rates);
  }

  return {
    amounts: [...amounts].sort((a, b) => a - b),
    ratePercents: [...rates].sort((a, b) => a - b),
    taxYears: [...TAX_YEARS].sort(),
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineAndColumn(
  content: string,
  index: number,
  lineStarts: readonly number[],
): { line: number; column: number; lineText: string } {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if ((lineStarts[middle] ?? 0) <= index) low = middle + 1;
    else high = middle - 1;
  }
  const lineIndex = Math.max(0, high);
  const lineStart = lineStarts[lineIndex] ?? 0;
  const lineEnd = content.indexOf('\n', index);
  return {
    line: lineIndex + 1,
    column: index - lineStart + 1,
    lineText: content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd),
  };
}

function sourceLineStarts(content: string): number[] {
  const starts = [0];
  for (let index = content.indexOf('\n'); index !== -1; index = content.indexOf('\n', index + 1)) {
    starts.push(index + 1);
  }
  return starts;
}

function factException(path: string, lineText: string): string | undefined {
  return TAX_FACT_EXCEPTION_RULES.find((rule) => rule.applies(path, lineText))?.id;
}

function addOccurrence(
  output: TaxFactOccurrence[],
  seen: Set<string>,
  source: SourceText,
  lineStarts: readonly number[],
  index: number,
  kind: TaxFactKind,
  value: string,
): void {
  const location = lineAndColumn(source.content, index, lineStarts);
  const normalizedLine = location.lineText.replace(/tax-fact-scan: official-quotation/g, '');
  const operationalRateLimitContext =
    /\b(?:api|client|distributed|email|endpoint|ip|redis|request|requests|upstash)[-_ ]?rate[-_ ]?limit\b/i.test(
      normalizedLine,
    ) ||
    /\brate[-_ ]?limit[-_ ]?(?:max|requests?|window)\b/i.test(normalizedLine) ||
    /\bRATE_LIMIT\b/.test(normalizedLine);
  const taxPolicyContext = normalizedLine.match(
    /\b(?:allowance|band|corporation|dividend|income|national insurance|NI|PAYE|profit|student loan|tax|threshold|VAT)\b|(?:Allowance|Band|Corporation|Dividend|Income|Insurance|Paye|PAYE|Profit|StudentLoan|Tax|Threshold|Vat|VAT)\b/,
  );
  const amountContext = normalizedLine.match(
    /\b(?:allowance|band|corporation|dividend|income|limit|national insurance|NI|PAYE|pension|profit|rate|student loan|tax|threshold|VAT)\b|(?:Allowance|Band|Corporation|Dividend|Income|Insurance|Limit|Paye|PAYE|Pension|Profit|Rate|StudentLoan|Tax|Threshold|Vat|VAT)\b/,
  );
  const rateContext = normalizedLine.match(
    /\b(?:band|corporation tax|dividend tax|income tax|national insurance|NI|PAYE|rate|student loan|tax|VAT)\b|(?:Band|CorporationTax|DividendTax|IncomeTax|NationalInsurance|Paye|PAYE|Rate|StudentLoan|Tax|Vat|VAT)\b/,
  );
  if (
    kind === 'policy-value' &&
    (!amountContext || (operationalRateLimitContext && !taxPolicyContext))
  ) {
    return;
  }
  if (kind === 'rate' && !rateContext) return;
  const key = `${source.path}|${kind}|${value}|${index}`;
  if (seen.has(key)) return;
  seen.add(key);
  const exceptionId = factException(source.path, location.lineText);
  output.push({
    file: source.path,
    line: location.line,
    column: location.column,
    kind,
    value,
    exceptionId,
  });
}

export function scanTaxFacts(
  sources: readonly SourceText[],
  catalog: PolicyCatalog = createPolicyCatalog(),
): TaxFactOccurrence[] {
  const occurrences: TaxFactOccurrence[] = [];
  const seen = new Set<string>();
  const amountValues = new Set(catalog.amounts.map(String));
  const percentToRate = new Map<string, number>();
  const assignedTokenToRate = new Map<string, number>();
  for (const rate of catalog.ratePercents) {
    const percent = String(Number(rate.toFixed(6)));
    const fraction = String(Number((rate / 100).toFixed(6)));
    percentToRate.set(percent, rate);
    assignedTokenToRate.set(percent, rate);
    assignedTokenToRate.set(fraction, rate);
  }
  const percentAlternatives = [...percentToRate.keys()]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(escapeRegex)
    .join('|');
  const assignedAlternatives = [...assignedTokenToRate.keys()]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(escapeRegex)
    .join('|');
  const rateRegex = percentAlternatives
    ? new RegExp(
        `(?:(?<![\\d.])(${percentAlternatives})(?![\\d.])\\s*%|\\brate\\s*[:=][^\\n\\d]{0,12}(?<![\\d.])(${assignedAlternatives})(?![\\d.])|\\b(?:TAX|NI|DIVIDEND|CT|STUDENT_LOAN|PENSION)[A-Z_]*RATE[A-Z_]*\\b[^\\n\\d]{0,12}(?<![\\d.])(${assignedAlternatives})(?![\\d.]))`,
        'gi',
      )
    : undefined;
  const taxYearVariants = new Map<string, string>();
  for (const taxYear of catalog.taxYears) {
    const [start, end] = taxYear.split('-');
    if (!(start && end)) continue;
    const shortEnd = end.slice(-2);
    for (const variant of [
      taxYear,
      `${start}-${shortEnd}`,
      `${start}/${end}`,
      `${start}/${shortEnd}`,
    ]) {
      taxYearVariants.set(variant, taxYear);
    }
  }
  const taxYearAlternatives = [...taxYearVariants.keys()]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(escapeRegex)
    .join('|');
  const taxYearRegex = taxYearAlternatives
    ? new RegExp(`(?<!\\d)(${taxYearAlternatives})(?!\\d)`, 'g')
    : undefined;

  for (const source of sources) {
    const lineStarts = sourceLineStarts(source.content);
    const numericTokenRegex = /(?<![\d.])(?:£\s*)?(\d+(?:[,_]\d+)*)(?![\d.])/g;
    for (const match of source.content.matchAll(numericTokenRegex)) {
      const token = match[1];
      if (!token) continue;
      const normalizedValue = token.replaceAll(',', '').replaceAll('_', '');
      if (!amountValues.has(normalizedValue)) continue;
      addOccurrence(
        occurrences,
        seen,
        source,
        lineStarts,
        match.index,
        'policy-value',
        normalizedValue,
      );
    }

    if (rateRegex) {
      for (const match of source.content.matchAll(rateRegex)) {
        const percentToken = match[1];
        const assignedToken = match[2] ?? match[3];
        const rate = percentToken
          ? percentToRate.get(percentToken)
          : assignedTokenToRate.get(assignedToken ?? '');
        if (rate !== undefined) {
          addOccurrence(occurrences, seen, source, lineStarts, match.index, 'rate', String(rate));
        }
      }
    }

    if (taxYearRegex) {
      for (const match of source.content.matchAll(taxYearRegex)) {
        const taxYear = taxYearVariants.get(match[1] ?? '');
        if (taxYear) {
          addOccurrence(occurrences, seen, source, lineStarts, match.index, 'tax-year', taxYear);
        }
      }
    }
  }

  return occurrences.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.column - b.column ||
      a.kind.localeCompare(b.kind) ||
      a.value.localeCompare(b.value),
  );
}

export function collectTaxFactSources(root: string): SourceText[] {
  return collectFiles(root, ['content/blog', 'e2e', 'scripts', 'src'], TAX_FACT_EXTENSIONS);
}

export function aggregateTaxFactFindings(
  occurrences: readonly TaxFactOccurrence[],
): TaxFactFinding[] {
  const findings = new Map<string, TaxFactFinding>();
  for (const occurrence of occurrences) {
    if (occurrence.exceptionId) continue;
    const key = `${occurrence.file}|${occurrence.kind}|${occurrence.value}`;
    const existing = findings.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.lines.includes(occurrence.line)) existing.lines.push(occurrence.line);
      continue;
    }
    findings.set(key, {
      file: occurrence.file,
      kind: occurrence.kind,
      value: occurrence.value,
      count: 1,
      lines: [occurrence.line],
    });
  }

  return [...findings.values()].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.kind.localeCompare(b.kind) ||
      a.value.localeCompare(b.value, undefined, { numeric: true }),
  );
}

function taxFactSignature(entry: Pick<TaxFactBaselineEntry, 'file' | 'kind' | 'value'>): string {
  return `${entry.file}|${entry.kind}|${entry.value}`;
}

export function compareTaxFactBaseline(
  findings: readonly TaxFactFinding[],
  baseline: readonly TaxFactBaselineEntry[],
): TaxFactComparison {
  const baselineByKey = new Map(baseline.map((entry) => [taxFactSignature(entry), entry]));
  const findingsByKey = new Map(findings.map((entry) => [taxFactSignature(entry), entry]));
  const baselineFindings: TaxFactFinding[] = [];
  const newFindings: TaxFactFinding[] = [];

  for (const finding of findings) {
    const expected = baselineByKey.get(taxFactSignature(finding));
    const baselineCount = Math.min(expected?.count ?? 0, finding.count);
    if (baselineCount > 0) baselineFindings.push({ ...finding, count: baselineCount });
    if (finding.count > baselineCount) {
      newFindings.push({ ...finding, count: finding.count - baselineCount });
    }
  }

  const reduced = baseline
    .map((entry) => ({
      ...entry,
      actualCount: findingsByKey.get(taxFactSignature(entry))?.count ?? 0,
    }))
    .filter((entry) => entry.actualCount < entry.count)
    .sort((a, b) => taxFactSignature(a).localeCompare(taxFactSignature(b)));

  return { baseline: baselineFindings, newFindings, reduced };
}
