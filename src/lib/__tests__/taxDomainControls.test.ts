import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  aggregateTaxFactFindings,
  compareTaxFactBaseline,
  compareTaxImportBaseline,
  createPolicyCatalog,
  findTaxImportViolations,
  type SourceText,
  scanTaxFacts,
} from '../../../scripts/tax-domain-controls';

describe('tax-domain repository controls', () => {
  describe('import boundary', () => {
    const sources: SourceText[] = [
      {
        path: 'src/app/direct.ts',
        content: "import { TAX_RATES } from '@/constants/taxRates';",
      },
      {
        path: 'src/app/internal-helper.ts',
        content: "import { taxableThresholdToTotalIncome } from '@/lib/tax/utils';",
      },
      {
        path: 'src/app/public.ts',
        content: "import { calculateTax } from '@/lib/tax';",
      },
      {
        path: 'src/app/public-index.ts',
        content: "import { calculateTax } from '@/lib/tax/index';",
      },
      {
        path: 'src/lib/tax/internal.ts',
        content: "import { TAX_RATES } from '@/constants/taxRates';",
      },
      {
        path: 'src/app/dynamic.ts',
        content: "const module = import('@/lib/tax/utils');",
      },
      {
        path: 'src/app/require.ts',
        content: "const module = require('@/lib/taxCalculator');",
      },
      {
        path: 'src/app/reexport.ts',
        content: "export { calculateTax } from '@/lib/taxCalculator';",
      },
    ];

    it('finds direct application imports while allowing the public interface', () => {
      expect(findTaxImportViolations(sources)).toEqual([
        {
          file: 'src/app/direct.ts',
          imports: ['TAX_RATES'],
          line: 1,
          specifier: '@/constants/taxRates',
        },
        {
          file: 'src/app/dynamic.ts',
          imports: ['<dynamic>'],
          line: 1,
          specifier: '@/lib/tax/utils',
        },
        {
          file: 'src/app/internal-helper.ts',
          imports: ['taxableThresholdToTotalIncome'],
          line: 1,
          specifier: '@/lib/tax/utils',
        },
        {
          file: 'src/app/public-index.ts',
          imports: ['calculateTax'],
          line: 1,
          specifier: '@/lib/tax/index',
        },
        {
          file: 'src/app/reexport.ts',
          imports: ['calculateTax'],
          line: 1,
          specifier: '@/lib/taxCalculator',
        },
        {
          file: 'src/app/require.ts',
          imports: ['<dynamic>'],
          line: 1,
          specifier: '@/lib/taxCalculator',
        },
      ]);
    });

    it('requires an exact baseline match, including imported bindings', () => {
      const [violation] = findTaxImportViolations(sources);
      expect(violation).toBeDefined();
      if (!violation) return;

      expect(compareTaxImportBaseline([violation], [violation])).toEqual({
        newViolations: [],
        staleBaseline: [],
      });

      const expanded = { ...violation, imports: ['CURRENT_TAX_YEAR', ...violation.imports] };
      const comparison = compareTaxImportBaseline([expanded], [violation]);
      expect(comparison.newViolations).toEqual([expanded]);
      expect(comparison.staleBaseline).toEqual([violation]);

      expect(compareTaxImportBaseline([violation, violation], [violation])).toEqual({
        newViolations: [violation],
        staleBaseline: [],
      });
    });

    it('makes the CLI exit non-zero for a newly introduced violation', () => {
      const fixtureRoot = mkdtempSync(join(tmpdir(), 'payetax-import-boundary-'));
      try {
        mkdirSync(join(fixtureRoot, 'src/app'), { recursive: true });
        mkdirSync(join(fixtureRoot, 'scripts'), { recursive: true });
        writeFileSync(
          join(fixtureRoot, 'src/app/new-consumer.ts'),
          "import { calculateTax } from '@/lib/taxCalculator';",
        );

        const result = spawnSync('bun', [resolve(process.cwd(), 'scripts/check-tax-imports.ts')], {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: { ...process.env, PAYETAX_REPO_CHECK_ROOT: fixtureRoot },
        });

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Application consumers must import through @/lib/tax.');
        expect(result.stderr).toContain('src/app/new-consumer.ts');
      } finally {
        rmSync(fixtureRoot, { recursive: true, force: true });
      }
    });
  });

  describe('tax-fact inventory', () => {
    const catalog = {
      amounts: [12_570],
      ratePercents: [20],
      taxYears: ['2026-2027'],
    };

    it.each([
      ['MAIN_RATE_LIMIT', 250_000],
      ['SMALL_PROFITS_LIMIT', 50_000],
    ])('catalogues CT_RATES.%s as a monetary amount', (_field, value) => {
      const policyCatalog = createPolicyCatalog();

      expect(policyCatalog.amounts).toContain(value);
      expect(policyCatalog.ratePercents).not.toContain(value);
    });

    it.each([
      ['SMALL_PROFITS_RATE', 19],
      ['MAIN_RATE', 25],
      ['MARGINAL_RELIEF_FRACTION', 1.5],
    ])('catalogues CT_RATES.%s as a percentage rate', (_field, value) => {
      const policyCatalog = createPolicyCatalog();

      expect(policyCatalog.ratePercents).toContain(value);
    });

    it('reports policy values, rates and tax years with deterministic exceptions', () => {
      const occurrences = scanTaxFacts(
        [
          {
            path: 'src/app/new-fact.ts',
            content:
              "const allowanceThreshold = 12_570;\nconst taxRate = '20%';\nconst taxYear = '2026-27';",
          },
          {
            path: 'src/test/payeVerificationFixtures/example.json',
            content: '{"taxThreshold": 12570}',
          },
          {
            path: 'content/blog/tax-guide-2026.mdx',
            content: 'Tax allowance: £12,570',
          },
          {
            path: 'content/blog/evergreen.mdx',
            content: 'Official tax allowance: £12,570 <!-- tax-fact-scan: official-quotation -->',
          },
        ],
        catalog,
      );

      expect(
        occurrences
          .filter((entry) => entry.file === 'src/app/new-fact.ts')
          .map(({ kind, value }) => ({ kind, value })),
      ).toEqual([
        { kind: 'policy-value', value: '12570' },
        { kind: 'rate', value: '20' },
        { kind: 'tax-year', value: '2026-2027' },
      ]);
      expect(occurrences.find((entry) => entry.file.includes('Fixtures'))?.exceptionId).toBe(
        'verification-fixtures',
      );
      expect(occurrences.find((entry) => entry.file.includes('tax-guide'))?.exceptionId).toBe(
        'pinned-historical-content',
      );
      expect(occurrences.find((entry) => entry.file.includes('evergreen'))?.exceptionId).toBe(
        'official-quotation',
      );
    });

    it('distinguishes counts above the checked-in baseline', () => {
      const findings = aggregateTaxFactFindings([
        { file: 'src/app/example.ts', line: 1, column: 1, kind: 'rate', value: '20' },
        { file: 'src/app/example.ts', line: 2, column: 1, kind: 'rate', value: '20' },
      ]);
      const comparison = compareTaxFactBaseline(findings, [
        { file: 'src/app/example.ts', kind: 'rate', value: '20', count: 1 },
      ]);

      expect(comparison.baseline[0]?.count).toBe(1);
      expect(comparison.newFindings[0]?.count).toBe(1);
    });

    it('matches complete formatted amounts instead of suffixes inside larger values', () => {
      const occurrences = scanTaxFacts(
        [
          {
            path: 'src/app/example.ts',
            content: "const taxExample = '£2,500';\nconst dividendAllowance = '£500';",
          },
        ],
        { amounts: [500], ratePercents: [], taxYears: [] },
      );

      expect(occurrences.map(({ kind, value, line }) => ({ kind, value, line }))).toEqual([
        { kind: 'policy-value', value: '500', line: 2 },
      ]);
    });

    it('does not classify contribution percentages as policy rates', () => {
      const occurrences = scanTaxFacts(
        [
          {
            path: 'src/app/example.ts',
            content: "const example = '5% pension contribution';\nconst tax = '20% basic rate';",
          },
        ],
        { amounts: [], ratePercents: [5, 20], taxYears: [] },
      );

      expect(occurrences.map(({ kind, value, line }) => ({ kind, value, line }))).toEqual([
        { kind: 'rate', value: '20', line: 2 },
      ]);
    });

    it.each([
      ["const corporationTaxThreshold = '£250,000';", 1],
      ['const mainRateLimit = 250000;', 1],
      ['const basicRateLimit = 250000;', 1],
    ])('detects corporation-tax policy copies: %s', (content, expectedCount) => {
      const occurrences = scanTaxFacts([{ path: 'src/app/example.ts', content }], {
        amounts: [250_000],
        ratePercents: [],
        taxYears: [],
      });

      expect(occurrences).toHaveLength(expectedCount);
      expect(occurrences[0]).toMatchObject({
        file: 'src/app/example.ts',
        kind: 'policy-value',
        value: '250000',
      });
    });

    it.each([
      ['const requestRateLimit = 250000;'],
      ['const request_rate_limit = 250000;'],
      ['const RATE_LIMIT = 250000;'],
      ['const rateLimitWindow = 250000;'],
    ])('excludes operational request limits: %s', (content) => {
      expect(
        scanTaxFacts([{ path: 'src/app/example.ts', content }], {
          amounts: [250_000],
          ratePercents: [],
          taxYears: [],
        }),
      ).toEqual([]);
    });

    it.each([
      ["export const corporationTaxThreshold = '£250,000';"],
      ['export const mainRateLimit = 250000;'],
    ])('keeps report-only advisory while strict mode fails on: %s', (policyCopy) => {
      const fixtureRoot = mkdtempSync(join(tmpdir(), 'payetax-tax-facts-'));
      try {
        for (const directory of ['content/blog', 'e2e', 'scripts', 'src/app']) {
          mkdirSync(join(fixtureRoot, directory), { recursive: true });
        }
        writeFileSync(join(fixtureRoot, 'src/app/new-fact.ts'), policyCopy);
        const command = resolve(process.cwd(), 'scripts/check-tax-facts.ts');
        const env = { ...process.env, PAYETAX_REPO_CHECK_ROOT: fixtureRoot };

        const reportOnly = spawnSync('bun', [command], {
          cwd: process.cwd(),
          encoding: 'utf8',
          env,
        });
        const strict = spawnSync('bun', [command, '--strict'], {
          cwd: process.cwd(),
          encoding: 'utf8',
          env,
        });

        expect(reportOnly.status).toBe(0);
        expect(reportOnly.stderr).toContain('src/app/new-fact.ts');
        expect(strict.status).toBe(1);
        expect(strict.stderr).toContain('src/app/new-fact.ts');
        expect(strict.stderr).toContain('policy-value=250000 (+1)');
      } finally {
        rmSync(fixtureRoot, { recursive: true, force: true });
      }
    });
  });
});
