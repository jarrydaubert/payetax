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

import { calculateEmployeeNI, calculateIncomeTax } from '@/lib/tax';
import { loadVerificationSuites, type VerificationScenario } from '@/test/payeVerification';
import { extractFAQs, getPostBySlug } from '../mdx';

const FACTUAL_REVIEWED_AT = '2026-08-24T16:27:58Z';
const TAX_YEAR = '2026-2027' as const;
const suites = loadVerificationSuites();

interface SalaryGuideContract {
  salary: number;
  slug: string;
  canonicalUrl: string;
  baseScenario: string;
  plan2Scenario: string;
  sacrificeScenario: string;
}

const guides: SalaryGuideContract[] = [
  {
    salary: 40_000,
    slug: 'what-40k-salary-actually-looks-like-uk-2025',
    canonicalUrl: 'https://payetax.co.uk/blog/what-40k-salary-actually-looks-like-uk-2025',
    baseScenario: 'salary-guide-40k-base',
    plan2Scenario: 'salary-guide-40k-plan2',
    sacrificeScenario: 'salary-guide-40k-sacrifice',
  },
  {
    salary: 60_000,
    slug: 'what-60k-salary-actually-looks-like-uk-2025',
    canonicalUrl: 'https://payetax.co.uk/blog/what-60k-salary-actually-looks-like-uk-2025',
    baseScenario: 'salary-guide-60k-base',
    plan2Scenario: 'salary-guide-60k-plan2',
    sacrificeScenario: 'salary-guide-60k-sacrifice',
  },
  {
    salary: 100_000,
    slug: 'what-100k-salary-actually-looks-like-uk-2025',
    canonicalUrl: 'https://payetax.co.uk/blog/what-100k-salary-actually-looks-like-uk-2025',
    baseScenario: 'salary-guide-100k-base',
    plan2Scenario: 'salary-guide-100k-plan2',
    sacrificeScenario: 'salary-guide-100k-sacrifice',
  },
];

function scenario(id: string): VerificationScenario {
  const found = suites.flatMap((suite) => suite.scenarios).find((item) => item.id === id);
  if (!found) throw new Error(`Missing independent PAYE fixture ${id}`);
  return found;
}

function pounds(amount: number, decimals: 0 | 2): string {
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

describe.each(guides)('$slug article contract', (guide) => {
  const post = getPostBySlug(guide.slug);
  const content = post?.content ?? '';
  const base = scenario(guide.baseScenario);
  const plan2 = scenario(guide.plan2Scenario);
  const sacrifice = scenario(guide.sacrificeScenario);

  it('preserves the URL and aligns current-facing metadata with the visible answer', () => {
    expect(post).toMatchObject({
      updatedAt: FACTUAL_REVIEWED_AT,
      canonicalUrl: guide.canonicalUrl,
    });
    expect(post?.title).toContain('2026/27');
    expect(post?.seoTitle).toContain('2026/27');
    expect(post?.excerpt).toContain('PAYE estimate');
    expect(post?.seoDescription).toContain('Estimate');
    expect(content).toContain('That is a modelled PAYE result');
    expect(content).toContain(
      'a Month 1-style steady-pay projection repeated across those 12 periods, not a cumulative month-by-month payroll simulation',
    );
  });

  it('publishes the independently derived monthly-payroll, annual and Plan 2 figures', () => {
    const expected = base.expected;
    const annual = base.annualIllustration;
    const plan2Expected = plan2.expected;
    const sacrificeExpected = sacrifice.expected;

    expect(expected).toBeDefined();
    expect(annual).toBeDefined();
    expect(plan2Expected).toBeDefined();
    expect(sacrificeExpected).toBeDefined();
    if (!(expected && annual && plan2Expected && sacrificeExpected)) return;

    expect(content).toContain(
      `about **${pounds(Math.round(expected.netPayAnnual ?? 0), 0)} a year**, or **${pounds(Math.round(expected.netPayMonthly ?? 0), 0)} a month**`,
    );
    expect(content).toContain(
      `| 12 equal monthly periods | ${pounds(guide.salary, 0)} | ${pounds(Math.round(expected.incomeTaxAnnual ?? 0), 0)} | ${pounds(Math.round(expected.nationalInsuranceAnnual ?? 0), 0)} | **${pounds(Math.round(expected.netPayAnnual ?? 0), 0)}** |`,
    );
    expect(content).toContain(
      `| One monthly period | ${pounds(Math.round(guide.salary / 12), 0)} | ${pounds(Math.round(expected.incomeTaxMonthly ?? 0), 0)} | ${pounds(Math.round(expected.nationalInsuranceMonthly ?? 0), 0)} | **${pounds(Math.round(expected.netPayMonthly ?? 0), 0)}** |`,
    );

    expect(content).toContain(
      `| Monthly payroll model × 12 | ${pounds(expected.incomeTaxAnnual ?? 0, 2)} | ${pounds(expected.nationalInsuranceAnnual ?? 0, 2)} | ${pounds(expected.netPayAnnual ?? 0, 2)} |`,
    );
    expect(content).toContain(
      `| Simplified annual illustration | ${pounds(annual.incomeTax, 2)} | ${pounds(annual.nationalInsurance, 2)} | ${pounds(annual.netPay, 2)} |`,
    );
    expect(content).toContain(
      `monthly Plan 2 deduction: ${pounds(plan2Expected.studentLoanMonthly ?? 0, 0)}`,
    );
    expect(content).toContain(
      `annual Plan 2 deduction across 12 equal monthly pay periods: ${pounds(plan2Expected.studentLoanAnnual ?? 0, 0)}`,
    );
    expect(content).toContain(
      `estimated annual take-home after tax, NI and Plan 2: ${pounds(Math.round(plan2Expected.netPayAnnual ?? 0), 0)}`,
    );
    expect(content).toContain(
      `estimated monthly take-home: ${pounds(Math.round(plan2Expected.netPayMonthly ?? 0), 0)}`,
    );
    expect(content).toContain(
      `${pounds(sacrificeExpected.pensionContributionAnnual ?? 0, 0)} contributed by the employer`,
    );
    expect(content).toContain(
      `${pounds(guide.salary - (sacrificeExpected.pensionContributionAnnual ?? 0), 0)} remaining contractual cash pay`,
    );
    expect(content).toContain(
      `estimated annual take-home: ${pounds(Math.round(sacrificeExpected.netPayAnnual ?? 0), 0)}`,
    );
    expect(content).toContain(
      `estimated monthly take-home: ${pounds(Math.round(sacrificeExpected.netPayMonthly ?? 0), 0)}`,
    );
  });

  it('keeps the annual illustration aligned with the shared annual tax owners', () => {
    const annual = base.annualIllustration;
    expect(annual).toBeDefined();
    if (!annual) return;

    const incomeTax = calculateIncomeTax(guide.salary, 'rUK', TAX_YEAR, guide.salary);
    const nationalInsurance = calculateEmployeeNI(guide.salary, TAX_YEAR, {
      niCategory: 'A',
    });

    expect(annual).toEqual({
      incomeTax: incomeTax.incomeTax,
      nationalInsurance: nationalInsurance.employeeNI,
      netPay: guide.salary - incomeTax.incomeTax - nationalInsurance.employeeNI,
    });
  });

  it('feeds deliberate, visible and internally consistent FAQ structured data', () => {
    const faqs = extractFAQs(content);

    expect(faqs.length).toBeGreaterThanOrEqual(5);
    expect(faqs[0]?.question).toContain(`£${guide.salary.toLocaleString('en-GB')}`);
    expect(faqs[0]?.answer).toContain(pounds(Math.round(base.expected?.netPayAnnual ?? 0), 0));
    expect(faqs[0]?.answer).toContain(pounds(Math.round(base.expected?.netPayMonthly ?? 0), 0));
    const annualFaq = faqs.find((faq) => faq.question.includes('annual illustration'));
    expect(annualFaq?.answer).toContain(pounds(base.annualIllustration?.netPay ?? 0, 2));
    const plan2Faq = faqs.find((faq) => faq.question.includes('Plan 2'));
    expect(plan2Faq?.answer).toContain(pounds(Math.round(plan2.expected?.netPayAnnual ?? 0), 0));
    expect(plan2Faq?.answer).toContain(pounds(Math.round(plan2.expected?.netPayMonthly ?? 0), 0));
  });

  it('states pension methods and official evidence without unsupported legacy claims', () => {
    expect(content).toContain('only for [salary sacrifice]');
    expect(content).toContain('With [net pay]');
    expect(content).toContain('With relief at source');
    expect(content).toContain('pension contribution value or percentage');
    expect(content).toContain('pension input currently models salary sacrifice');
    expect(content).toContain(
      'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
    );
    expect(content).toContain('https://www.gov.uk/guidance/special-rules-for-student-loans');
    expect(content).toContain('https://www.gov.uk/workplace-pensions/managing-your-pension');
    expect(content).not.toMatch(
      /top (?:35|15|5)%|UK median salary: ~£35,000|UK average salary: ~£42,000|Sample Monthly Budget|Reality Check by Location|Maximum mortgage|160%\+ instant return|£2,607|£3,543|£5,177/i,
    );
  });
});

describe('salary-guide claim-specific evidence', () => {
  it('qualifies the £40k comparison to the current ONS ASHE population and value', () => {
    const content = getPostBySlug('what-40k-salary-actually-looks-like-uk-2025')?.content ?? '';

    expect(content).toContain('median gross annual earnings of £39,039 in April 2025');
    expect(content).toContain('full-time employees who had been in their jobs for at least a year');
    expect(content).toContain(
      'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025',
    );
  });

  it('separates the £100k Income Tax taper from both childcare eligibility rules', () => {
    const content = getPostBySlug('what-100k-salary-actually-looks-like-uk-2025')?.content ?? '';

    expect(content).toContain('60% Income Tax rate on that slice');
    expect(content).toContain('not part of the Income Tax marginal rate');
    expect(content).toContain('Tax-Free Childcare');
    expect(content).toContain('must not expect their adjusted net income to exceed £100,000');
    expect(content).toContain('Free Childcare for Working Parents');
    expect(content).toContain('England-specific scheme');
    expect(content).toContain('the rules also consider a partner where applicable');
  });

  it('keeps every published taper-table row aligned with independent fixtures and shared annual tax owners', () => {
    const content = getPostBySlug('what-100k-salary-actually-looks-like-uk-2025')?.content ?? '';
    const rows = scenario('salary-guide-100k-base').annualIllustrationRows;

    expect(rows).toHaveLength(8);
    if (!rows) return;

    for (const expected of rows) {
      const incomeTax = calculateIncomeTax(expected.income, 'rUK', TAX_YEAR, expected.income);
      const nationalInsurance = calculateEmployeeNI(expected.income, TAX_YEAR, {
        niCategory: 'A',
      });

      expect({
        personalAllowance: incomeTax.personalAllowance,
        incomeTax: incomeTax.incomeTax,
        nationalInsurance: nationalInsurance.employeeNI,
        netPay: expected.income - incomeTax.incomeTax - nationalInsurance.employeeNI,
      }).toEqual({
        personalAllowance: expected.personalAllowance,
        incomeTax: expected.incomeTax,
        nationalInsurance: expected.nationalInsurance,
        netPay: expected.netPay,
      });

      expect(content).toContain(
        `| ${pounds(expected.income, 0)} | ${pounds(expected.personalAllowance, 0)} | ${pounds(expected.incomeTax, 0)} | ${pounds(expected.nationalInsurance, 0)} | ${pounds(expected.netPay, 0)} |`,
      );
    }
  });
});
