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

import { extractFAQs, getPostBySlug } from '../mdx';

describe('FAQ extraction boundaries', () => {
  it('ignores bold labels outside deliberate FAQ content', () => {
    const content = `
**Important caveats:**

- This is a list, not a question.

**You pay Scottish tax if:**

- A condition applies.

## Frequently Asked Questions

### Does this deliberate question appear?

Yes. Its visible answer is also used in structured data.
`;

    expect(extractFAQs(content)).toEqual([
      {
        question: 'Does this deliberate question appear?',
        answer: 'Yes. Its visible answer is also used in structured data.',
      },
    ]);
  });

  it('preserves punctuation-optional bold questions inside an FAQ section', () => {
    const content = `
## FAQ

**Q: Does the prefixed format still work**

A: Yes. The prefix is removed from both fields.

**What about a question without punctuation**

It remains a supported deliberate FAQ entry.
`;

    expect(extractFAQs(content)).toEqual([
      {
        question: 'Does the prefixed format still work',
        answer: 'Yes. The prefix is removed from both fields.',
      },
      {
        question: 'What about a question without punctuation',
        answer: 'It remains a supported deliberate FAQ entry.',
      },
    ]);
  });

  it('keeps bold answer labels out of FAQ questions without truncating the answer', () => {
    const content = `
## FAQ

**What does the comparison include?**

Annual Income Tax under the stated assumptions.

**Important:**

- National Insurance is excluded.

**Does the next question still appear?**

Yes.
`;

    const faqs = extractFAQs(content);

    expect(faqs.map((faq) => faq.question)).toEqual([
      'What does the comparison include?',
      'Does the next question still appear?',
    ]);
    expect(faqs[0]?.answer).toContain('Important:');
    expect(faqs[0]?.answer).toContain('National Insurance is excluded.');
  });

  it('extracts only the four visible Scottish comparison FAQs', () => {
    const post = getPostBySlug('scottish-vs-english-tax-rates-2026-comparison');

    expect(extractFAQs(post?.content ?? '')).toEqual([
      {
        question: 'Do Scottish rates apply to dividends or savings?',
        answer:
          'No. Scottish rates apply to non-savings, non-dividend income. Savings interest and dividends use UK-wide rates and allowances.',
      },
      {
        question: 'What happens if I move during the tax year?',
        answer:
          'Scottish taxpayer status applies for the whole tax year. If you move to Scotland and live there longer than anywhere else in the UK during that year, GOV.UK says Scottish Income Tax applies and HMRC backdates the rate to the start of the tax year.',
      },
      {
        question: 'Does this comparison include pension contributions or bonuses?',
        answer:
          'No. The table compares salary-only annual Income Tax. Pension method can change taxable pay or how relief is given, while a cash bonus is added to earnings and can cross several tax bands.',
      },
      {
        question: 'How do I check my own Scottish versus English difference?',
        answer:
          'Use the Scottish tax calculator linked above, enter annual salary, and review its stated assumptions. Your actual PAYE deductions can differ because of tax code, pay frequency, other income, deductions or reliefs.',
      },
    ]);
  });
});

describe('Scottish comparison article contract', () => {
  const post = getPostBySlug('scottish-vs-english-tax-rates-2026-comparison');

  it('publishes aligned 2026/27 metadata and policy-backed tables at the existing URL', () => {
    expect(post).toMatchObject({
      title: 'Scottish vs English Income Tax 2026/27: Rates and Examples',
      updatedAt: '2026-08-24T13:47:29Z',
      canonicalUrl: 'https://payetax.co.uk/blog/scottish-vs-english-tax-rates-2026-comparison',
    });
    expect(post?.seoTitle).toContain('2026/27');
    expect(post?.seoDescription).toContain('£33,493');
    expect(post?.content).toContain('<ScottishTaxBandsTable taxYear="2026-2027" />');
    expect(post?.content).toContain('<ScottishTaxExamplesTable taxYear="2026-2027" />');
  });

  it('does not retain the superseded crossover, worked gap or 2025/26 claims', () => {
    expect(post?.content).not.toMatch(/£30,300|£6,340|2025-26|HMRC-accurate/i);
    expect(post?.content).toContain('£5,931.35 more in Scotland');
    expect(post?.content).toContain('£33,493');
  });

  it('exposes the primary 2026/27 sources in visible copy', () => {
    expect(post?.content).toContain(
      'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/',
    );
    expect(post?.content).toContain(
      'https://www.gov.scot/publications/scottish-income-tax-technical-factsheet/',
    );
    expect(post?.content).toContain(
      'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
    );
    expect(post?.content).toContain(
      'https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past',
    );
  });
});
