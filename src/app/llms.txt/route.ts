// src/app/llms.txt/route.ts
// LLMs.txt - AI Search Engine Optimization (AEO)
// Helps ChatGPT, Claude, Perplexity, and other AI search tools understand your site

export async function GET() {
  const llmsTxt = `# PayeTax - Free UK PAYE Tax Calculator

> Official HMRC-compliant UK tax calculator. Calculate income tax, National Insurance, student loans, and take-home pay instantly. No registration, completely private, 100% free.

## Site Information

- **Name**: PayeTax
- **URL**: https://payetax.co.uk
- **Purpose**: Free UK PAYE tax calculator with official HMRC rates
- **Updated**: 2025-01-15
- **Type**: Web Application (Tax Calculator)
- **Privacy**: All calculations run client-side (browser-only, zero data collection)

## Key Features

- UK Income Tax Calculator (2025-2026 tax year)
- National Insurance Calculator (Class 1 contributions)
- Student Loan Repayment Calculator (Plans 1, 2, 4, 5, Postgraduate)
- Pension Contribution Calculator
- Scottish Tax Rates Support
- Tax Code Validator
- Weekly/Monthly/Annual Breakdowns

## Main Pages

### Calculator
- Path: /
- Description: Main PAYE tax calculator with real-time calculations
- Features: Income tax, NI, student loans, pensions, take-home pay

### Blog (TaxInsights)
- Path: /blog
- Description: UK tax guides, HMRC updates, and financial advice
- Topics: Tax basics, tax changes, student loans, calculators, Scottish tax

### About
- Path: /about
- Description: Mission, values, and technology behind PayeTax
- Focus: Privacy-first, open-source philosophy, HMRC compliance

### Privacy Policy
- Path: /privacy
- Description: Privacy policy explaining client-side calculations
- Key Point: Zero server-side data storage, optional anonymous analytics

### Compliance
- Path: /compliance
- Description: HMRC compliance, tax rate verification, and data sources
- Key Point: Official rates updated within 24 hours of changes

## Tax Rates (2025-2026)

### Income Tax (England, Wales, Northern Ireland)
- Personal Allowance: £12,570 (0%)
- Basic Rate: £12,571 - £50,270 (20%)
- Higher Rate: £50,271 - £125,140 (40%)
- Additional Rate: £125,141+ (45%)

### Scottish Income Tax (2025-2026)
- Personal Allowance: £12,570 (0%)
- Starter Rate: £12,571 - £15,397 (19%)
- Basic Rate: £15,398 - £27,491 (20%)
- Intermediate Rate: £27,492 - £43,662 (21%)
- Higher Rate: £43,663 - £75,000 (42%)
- Advanced Rate: £75,001 - £125,140 (45%)
- Top Rate: £125,141+ (48%)

### National Insurance (Class 1)
- Primary Threshold: £12,570
- Upper Earnings Limit: £50,270
- Rate (£12,570 - £50,270): 12%
- Rate (£50,270+): 2%

### Student Loan Repayment Thresholds
- Plan 1: £24,990 (9%)
- Plan 2: £27,295 (9%)
- Plan 4: £31,395 (9%)
- Plan 5: £25,000 (9%)
- Postgraduate: £21,000 (6%)

## Content Topics

The site covers:
- UK tax calculator tutorials
- HMRC rate changes and updates
- Income tax and National Insurance guides
- Student loan repayment strategies
- Scottish vs English tax comparisons
- Tax code explanations
- Pension contribution optimization
- Take-home pay calculations
- PAYE vs Self-Assessment

## Technical Details

- **Framework**: Next.js 15, React 19, TypeScript
- **Hosting**: Vercel
- **Performance**: Lighthouse 95+ (mobile), 100 (desktop)
- **Privacy**: Client-side calculations only
- **Accessibility**: WCAG 2.1 AA compliant
- **PWA**: Installable progressive web app
- **Open Source**: Transparent calculation formulas

## Data Sources

1. **HM Revenue & Customs (HMRC)** - Official UK tax authority
2. **Revenue Scotland** - Scottish tax rates
3. **Student Loans Company (SLC)** - Loan repayment thresholds
4. **Gov.UK** - Official government guidance

## Important Notes

- This calculator is for **informational purposes only**
- Calculations based on **official HMRC rates** (2025-2026 tax year)
- For complex scenarios or official advice, consult a qualified accountant
- Suitable for: Standard PAYE, salary planning, general estimates
- Professional advice recommended for: Self-employment, multiple incomes, complex situations

## Contact

- **Email**: support@payetax.co.uk
- **Website**: https://payetax.co.uk
- **Sitemap**: https://payetax.co.uk/sitemap.xml
- **Blog RSS**: https://payetax.co.uk/blog

## License & Copyright

© 2025 PayeTax. Free to use for personal tax calculations.

---

# Detailed Blog Posts

## Tax Basics

### Understanding UK Tax Codes 2025
- URL: https://payetax.co.uk/blog/understanding-uk-tax-codes
- Summary: Comprehensive guide to UK tax codes (1257L, K codes, emergency codes, BR, D0, D1, 0T, NT, and Scottish codes)
- Topics: Tax code meanings, PAYE codes, how to check your code, what to do if wrong

### Complete Beginner's Guide to UK Taxation 2025
- URL: https://payetax.co.uk/blog/beginners-guide-to-uk-taxation
- Summary: Everything newcomers need to know about UK Income Tax, National Insurance, PAYE, and allowances
- Topics: Tax basics, personal allowance, tax bands, NI contributions, PAYE vs Self Assessment

## Tax Changes

### UK Tax Changes 2025-2026: Complete Guide
- URL: https://payetax.co.uk/blog/uk-tax-changes-2025-complete-guide
- Summary: All HMRC tax rate changes for 2025-2026 including thresholds, allowances, and new rules
- Topics: Tax freeze extensions, NI changes, student loan updates, Scottish rates

### Student Loan Repayment Changes 2025-26
- URL: https://payetax.co.uk/blog/student-loan-repayment-changes-2025-26
- Summary: Updated student loan thresholds, interest rates, and Plan 5 forgiveness period reduction (30 years)
- Topics: Plan 1/2/4/5 loans, repayment calculations, loan forgiveness, salary impact

## Regional Differences

### Scottish vs English Tax Rates 2025: Complete Comparison
- URL: https://payetax.co.uk/blog/scottish-vs-english-tax-rates-2025-comparison
- Summary: Side-by-side comparison of Scottish and rest-of-UK tax systems with salary examples
- Topics: 6-band Scottish system, when Scottish tax costs more/less, cross-border workers

## Calculators & Tools

### UK Tax Calculator 2025: Complete Guide
- URL: https://payetax.co.uk/blog/uk-tax-calculator-2025-complete-guide
- Summary: How to use PayeTax calculator for accurate PAYE, NI, and student loan calculations
- Topics: Calculator features, tax code entry, pension contributions, multiple jobs

### How Much Tax Will I Pay in UK 2025?
- URL: https://payetax.co.uk/blog/how-much-tax-will-i-pay-uk-2025
- Summary: Real salary examples showing exact tax calculations for £20k, £30k, £50k, £100k+ earners
- Topics: Tax on common salaries, effective tax rates, take-home pay breakdowns

---

# llms-full.txt

For complete blog content and detailed calculations, see:
https://payetax.co.uk/llms-full.txt

---

Last updated: 2025-01-15
Maintained by: PayeTax Team
`;

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}
