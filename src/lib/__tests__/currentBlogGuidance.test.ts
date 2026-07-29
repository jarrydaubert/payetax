jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));
jest.mock('rehype-pretty-code', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('rehype-slug', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/components/molecules/mdx-components', () => ({
  mdxComponents: {},
}));

import { readFileSync } from 'node:fs';
import {
  CURRENT_TAX_GUIDANCE,
  CURRENT_TAX_GUIDANCE_PATHS,
  CURRENT_TAX_GUIDANCE_SLUGS,
} from '@/constants/currentTaxGuidance';
import { findCurrentBlogGuidanceProblems } from '@/lib/currentBlogGuidance';
import { extractFAQs, extractHowToSteps, getPostBySlug } from '@/lib/mdx';
import { BlogFrontmatterSchema } from '@/lib/validation';

describe('current-facing tax guidance', () => {
  it.each(
    CURRENT_TAX_GUIDANCE_SLUGS,
  )('%s has current metadata and FAQ copy that feeds structured data', (slug) => {
    const post = getPostBySlug(slug);

    expect(post).toBeDefined();
    expect(post?.updatedAt).toBe('2026-07-29');
    expect(post?.title).toContain('2026/27');
    expect(post?.seoTitle).toContain('2026/27');
    expect(post?.seoDescription).toContain('2026/27');
    expect(extractFAQs(post?.content ?? '')).not.toHaveLength(0);
  });

  it.each(CURRENT_TAX_GUIDANCE)('$slug has a valid dedicated factual-review date', ({
    slug,
    reviewedAt,
  }) => {
    const post = getPostBySlug(slug);

    expect(reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(reviewedAt))).toBe(false);
    expect(new Date(post?.updatedAt ?? 0).getTime()).toBeGreaterThanOrEqual(
      new Date(reviewedAt).getTime(),
    );
  });

  it.each([
    'beginners-guide-to-uk-taxation',
    'how-much-tax-will-i-pay-uk-2025',
    'uk-tax-calculator-2025-complete-guide',
  ])('%s exposes visible steps for HowTo structured data', (slug) => {
    const post = getPostBySlug(slug);

    expect(extractHowToSteps(post?.content ?? '').length).toBeGreaterThanOrEqual(4);
  });

  it('preserves tax-code values in the calculator guide HowTo schema', () => {
    const post = getPostBySlug('uk-tax-calculator-2025-complete-guide');
    const taxCodeStep = extractHowToSteps(post?.content ?? '').find(
      (step) => step.name === 'Enter the complete tax code',
    );

    expect(taxCodeStep?.text).toEqual(expect.stringContaining('1257L'));
    for (const codePart of ['C', 'S', 'W1', 'M1', 'X', 'M', 'N']) {
      expect(taxCodeStep?.text).toContain(codePart);
    }
    expect(taxCodeStep?.text).toContain('M means the person receives a transfer');
    expect(taxCodeStep?.text).toContain('N means the person transfers it');
    expect(taxCodeStep?.text).not.toContain('...');
  });

  it('detects each guarded class of stale guidance', () => {
    const findings = findCurrentBlogGuidanceProblems([
      {
        file: 'content/blog/example.mdx',
        content:
          'Business mileage is £0.45. Claim the working from home allowance at £26 per month. Homeworking tax relief is £6 a week. Plan 2 threshold: 28,470.',
      },
    ]);

    expect(findings.map((finding) => finding.rule).sort()).toEqual(
      [
        'expired-homeworking',
        'expired-homeworking',
        'expired-mileage',
        'expired-student-loan',
      ].sort(),
    );
  });

  it('allows current mileage and qualifying employer homeworking reimbursement', () => {
    expect(
      findCurrentBlogGuidanceProblems([
        {
          file: 'content/blog/example.mdx',
          content:
            'Business mileage is 55p. Employees cannot claim homeworking relief. An employer can reimburse £6 a week when the conditions are met. Plan 2 threshold: £29,385.',
        },
      ]),
    ).toEqual([]);
  });

  it('accepts every current article only when its required current facts are present', () => {
    expect(
      findCurrentBlogGuidanceProblems(
        CURRENT_TAX_GUIDANCE_PATHS.map((file) => ({
          file,
          content: readFileSync(file, 'utf8'),
        })),
      ),
    ).toEqual([]);
  });

  it('rejects plausible bypasses and missing positive facts', () => {
    const file = 'content/blog/what-50k-salary-actually-looks-like-uk-2025.mdx';
    const current = readFileSync(file, 'utf8');
    const cases = [
      current.replace('£29,385 annually', '£29,000 annually'),
      `${current}\nThe current guide is for 2025/26.\n`,
      `${current}\nEmployees may deduct £6 weekly for working from home.\n`,
      `${current}\nEmployees can claim £312 a year for working from home.\n`,
      `${current}\nPlan 2 repayments begin once monthly pay reaches £2,372.50.\n`,
      `${current}\nFor Plan 2, £2,372.50 is where repayments begin each month.\n`,
      `${current}\nAn employer may reimburse costs; employees can claim £312 a year for working from home.\n`,
      current.replace('55p per mile', 'the current approved amount'),
      current.replace('and 25p after that', ''),
    ];

    for (const content of cases) {
      expect(findCurrentBlogGuidanceProblems([{ file, content }])).not.toEqual([]);
    }
  });

  it('allows an explicitly marked historical mileage comparison', () => {
    expect(
      findCurrentBlogGuidanceProblems([
        {
          file: 'content/blog/example.mdx',
          content:
            'The rate was 45p before 6 April 2026 and is now 55p. <!-- tax-guidance-guard: historical-context -->',
        },
      ]),
    ).toEqual([]);
  });

  it('scopes stale-value checks and allows explicitly marked historical tax context', () => {
    expect(
      findCurrentBlogGuidanceProblems([
        {
          file: 'content/blog/example.mdx',
          content: [
            'The unrelated filing fee is 45p.',
            'Plan 2 used a £28,470 threshold in 2025/26. <!-- tax-guidance-guard: historical-context -->',
            'The former £312 homeworking allowance ended. <!-- tax-guidance-guard: historical-context -->',
          ].join('\n'),
        },
      ]),
    ).toEqual([]);
  });

  it('accepts only PayeTax HTTPS canonical URLs', () => {
    expect(
      BlogFrontmatterSchema.shape.canonicalUrl.safeParse(
        'https://payetax.co.uk/blog/current-tax-guide',
      ).success,
    ).toBe(true);
    expect(
      BlogFrontmatterSchema.shape.canonicalUrl.safeParse(
        'https://unrelated.example/blog/current-tax-guide',
      ).success,
    ).toBe(false);
    expect(
      BlogFrontmatterSchema.shape.canonicalUrl.safeParse(
        'http://payetax.co.uk/blog/current-tax-guide',
      ).success,
    ).toBe(false);
  });
});
