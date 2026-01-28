# PayeTax Documentation Library - Build Specification

> **Version:** 1.0 | **Created:** 2026-01-28 | **Status:** PLANNING
>
> Comprehensive documentation library for UK tax concepts, tied 1:1 to calculator inputs/outputs.

---

## Overview

### Vision
Create a Stripe/Vercel-style documentation library that explains every input and output across all PayeTax calculators in plain English. Users can click "?" on any field and land on a dedicated doc page.

### Goals
1. **Contextual learning** - Users understand exactly what they're entering/seeing
2. **SEO value** - Long-tail keyword coverage for tax queries
3. **Trust building** - Positions PayeTax as an authority
4. **Accountant-friendly** - Resource they can share with clients

### Scope
- Every input field across all calculators
- Every output field across all calculators
- Deduplicated (e.g., "Salary" appears once, not per calculator)
- No general tax guides outside calculator context

---

## Tech Stack Recommendation

### Option A: Fumadocs (Recommended)
```
fumadocs-core + fumadocs-ui + fumadocs-mdx
```

**Pros:**
- Built for Next.js App Router
- Beautiful default UI (Stripe-like)
- Built-in search (Flexsearch)
- MDX support with components
- Sidebar generation from file structure
- Dark mode built-in
- TypeScript native

**Cons:**
- Another dependency
- Learning curve

### Option B: Custom MDX + Existing UI
```
@next/mdx + existing shadcn components
```

**Pros:**
- No new dependencies
- Full control
- Consistent with existing design

**Cons:**
- Build search from scratch
- Build sidebar from scratch
- More work

### Option C: Nextra
```
nextra + nextra-theme-docs
```

**Pros:**
- Popular, well-documented
- Great search

**Cons:**
- Pages Router focused (App Router support newer)
- Heavier

**Recommendation:** Option A (Fumadocs) - best balance of features and Next.js 16 compatibility.

---

## URL Structure

```
/docs                           # Docs landing page
/docs/[category]/[slug]         # Individual doc pages

Examples:
/docs/income/salary
/docs/income/pay-period
/docs/tax/income-tax
/docs/tax/personal-allowance
/docs/ni/employee-ni
/docs/ni/ni-category
/docs/directors/dividends
/docs/directors/corporation-tax
/docs/student-loans/plan-1
/docs/reference/tax-year-2025-26
```

---

## Navigation Structure

```
Docs
├── Getting Started
│   ├── How UK Tax Works
│   ├── Understanding Your Payslip
│   └── Tax Year Explained
│
├── Income
│   ├── Salary / Gross Income
│   ├── Pay Period
│   ├── Hourly Rate
│   ├── Additional Income Sources
│   ├── Rental Income
│   ├── Investment Income
│   └── State Pension
│
├── Tax Codes
│   ├── What is a Tax Code?
│   ├── Standard Codes (1257L)
│   ├── Scottish Codes (S prefix)
│   ├── K Codes (Negative Allowance)
│   ├── BR / D0 / D1 Codes
│   ├── Emergency Codes (W1/M1)
│   └── Common Tax Code Letters
│
├── Personal Allowance
│   ├── What is Personal Allowance?
│   ├── Personal Allowance Taper (£100k+)
│   ├── Marriage Allowance
│   ├── Blind Person's Allowance
│   └── Age-Related Allowances
│
├── Income Tax
│   ├── How Income Tax Works
│   ├── Tax Bands Explained
│   ├── Basic Rate (20%)
│   ├── Higher Rate (40%)
│   ├── Additional Rate (45%)
│   ├── Scottish Tax Bands
│   ├── Effective Tax Rate
│   └── Marginal Tax Rate
│
├── National Insurance
│   ├── What is National Insurance?
│   ├── NI Categories (A, B, C, H, J, M, Z)
│   ├── Employee NI
│   ├── Employer NI
│   ├── NI Thresholds
│   ├── State Pension Credits
│   └── Paying No NI (Over Pension Age)
│
├── Student Loans
│   ├── How Student Loan Repayment Works
│   ├── Plan 1
│   ├── Plan 2
│   ├── Plan 4 (Scotland)
│   ├── Plan 5 (Post-2023)
│   ├── Postgraduate Loan
│   └── Multiple Plans
│
├── Pensions
│   ├── Pension Contributions Explained
│   ├── Percentage vs Fixed Amount
│   ├── Tax Relief on Pensions
│   ├── Annual Allowance (£60k)
│   ├── Carry Forward
│   ├── Tapered Annual Allowance
│   └── Employer Pension Contributions
│
├── Directors
│   ├── Salary vs Dividends
│   ├── Dividends Explained
│   ├── Dividend Tax Rates
│   ├── Dividend Allowance
│   ├── Corporation Tax
│   ├── Marginal Relief (£50k-£250k)
│   ├── Director's Loan Account (S455)
│   ├── Employment Allowance
│   ├── Company Car (BIK)
│   ├── Year-End Date
│   ├── Gross Profit
│   └── Take-Home Pay (Directors)
│
├── VAT
│   ├── VAT Threshold (£90k)
│   ├── VAT Registration
│   └── Revenue Including VAT
│
├── Compliance
│   ├── Self Assessment
│   ├── Payments on Account
│   ├── Key Tax Dates
│   ├── RTI / Payroll
│   └── P45 / P60 / P11D
│
└── Reference
    ├── 2025-26 Tax Rates & Thresholds
    ├── 2024-25 Tax Rates & Thresholds
    ├── Glossary
    └── HMRC Links
```

---

## Complete Doc List (Deduplicated)

### Inputs (36 unique)

| # | Slug | Title | Calculators |
|---|------|-------|-------------|
| 1 | `salary` | Salary / Gross Income | PAYE, NI, Scottish |
| 2 | `pay-period` | Pay Period | PAYE |
| 3 | `tax-year` | Tax Year | PAYE, Director |
| 4 | `tax-code` | Tax Code | PAYE, Decoder |
| 5 | `region` | Tax Region | PAYE, Director |
| 6 | `is-married` | Marriage Status | PAYE, Marriage |
| 7 | `partner-income` | Partner's Income | PAYE, Marriage |
| 8 | `is-blind` | Blind Person's Allowance | PAYE |
| 9 | `age` | Age | PAYE |
| 10 | `pay-no-ni` | Pay No NI | PAYE |
| 11 | `student-loan-plans` | Student Loan Plans | PAYE, Director |
| 12 | `pension-contribution` | Pension Contribution | PAYE, Director |
| 13 | `pension-type` | Pension Type (% vs £) | PAYE |
| 14 | `ni-category` | NI Category | PAYE, NI |
| 15 | `hours-per-week` | Hours Per Week | PAYE |
| 16 | `additional-income` | Additional Income Sources | PAYE |
| 17 | `revenue` | Revenue / Turnover | Director |
| 18 | `includes-vat` | Revenue Includes VAT | Director |
| 19 | `expenses` | Business Expenses | Director |
| 20 | `year-end-month` | Year-End Month | Director |
| 21 | `already-taken` | Already Taken (Drawings) | Director |
| 22 | `taken-via-payroll` | Taken Via Payroll | Director |
| 23 | `other-income` | Other Personal Income | Director |
| 24 | `company-car-bik` | Company Car (BIK) | Director |
| 25 | `employment-allowance` | Employment Allowance | Director |
| 26 | `variable-income` | Variable Income Mode | Director |
| 27 | `buffer-months` | Buffer Months | Director |
| 28 | `lower-earner-income` | Lower Earner Income | Marriage |
| 29 | `higher-earner-income` | Higher Earner Income | Marriage |
| 30 | `rental-income` | Rental Income | PAYE |
| 31 | `investment-income` | Investment Income | PAYE |
| 32 | `state-pension` | State Pension Income | PAYE |
| 33 | `employment-income` | Additional Employment | PAYE |
| 34 | `pension-income` | Private Pension Income | PAYE |
| 35 | `other-income-type` | Other Income Type | PAYE |
| 36 | `allowances-deductions` | Allowances & Deductions | PAYE |

### Outputs (38 unique)

| # | Slug | Title | Calculators |
|---|------|-------|-------------|
| 1 | `gross-income` | Gross Income | PAYE |
| 2 | `taxable-income` | Taxable Income | PAYE |
| 3 | `personal-allowance` | Personal Allowance | PAYE, Decoder |
| 4 | `income-tax` | Income Tax | PAYE, Director, Scottish |
| 5 | `income-tax-breakdown` | Income Tax by Band | PAYE, Scottish |
| 6 | `employee-ni` | Employee NI | PAYE, NI, Director |
| 7 | `employer-ni` | Employer NI | PAYE, NI, Director |
| 8 | `total-ni` | Total NI | NI |
| 9 | `student-loan-repayment` | Student Loan Repayment | PAYE, Director |
| 10 | `pension-deduction` | Pension Deduction | PAYE |
| 11 | `take-home-pay` | Take-Home Pay | PAYE, Director |
| 12 | `effective-tax-rate` | Effective Tax Rate | PAYE |
| 13 | `marginal-tax-rate` | Marginal Tax Rate | PAYE |
| 14 | `scottish-tax` | Scottish Tax | Scottish |
| 15 | `english-tax` | English Tax (Comparison) | Scottish |
| 16 | `scotland-difference` | Scotland vs rUK Difference | Scottish |
| 17 | `decoded-allowance` | Decoded Allowance | Decoder |
| 18 | `tax-code-region` | Tax Code Region | Decoder |
| 19 | `emergency-code` | Emergency Code Flag | Decoder |
| 20 | `tax-code-explanation` | Tax Code Explanation | Decoder |
| 21 | `tax-code-warnings` | Tax Code Warnings | Decoder |
| 22 | `marriage-eligibility` | Marriage Allowance Eligibility | Marriage |
| 23 | `marriage-saving` | Marriage Allowance Saving | Marriage |
| 24 | `gross-profit` | Gross Profit | Director |
| 25 | `recommended-salary` | Recommended Salary | Director |
| 26 | `recommended-dividends` | Recommended Dividends | Director |
| 27 | `corporation-tax` | Corporation Tax | Director |
| 28 | `dividend-tax` | Dividend Tax | Director |
| 29 | `company-tax-pot` | Company Tax Pot | Director |
| 30 | `personal-tax-pot` | Personal Tax Pot | Director |
| 31 | `key-dates` | Key Tax Dates | Director |
| 32 | `ct-deadline` | Corporation Tax Deadline | Director |
| 33 | `sa-deadline` | Self Assessment Deadline | Director |
| 34 | `basic-rate` | Basic Rate Tax | PAYE |
| 35 | `higher-rate` | Higher Rate Tax | PAYE |
| 36 | `additional-rate` | Additional Rate Tax | PAYE |
| 37 | `hourly-rate` | Hourly Rate | PAYE |
| 38 | `daily-rate` | Daily Rate | PAYE |

### Conceptual Docs (15)

| # | Slug | Title | Purpose |
|---|------|-------|---------|
| 1 | `how-uk-tax-works` | How UK Tax Works | Overview |
| 2 | `understanding-payslip` | Understanding Your Payslip | Getting Started |
| 3 | `tax-year-explained` | Tax Year Explained | Getting Started |
| 4 | `pa-taper` | Personal Allowance Taper | £100k+ |
| 5 | `scottish-tax-bands` | Scottish Tax Bands | Scotland |
| 6 | `ni-thresholds` | NI Thresholds | NI |
| 7 | `state-pension-credits` | State Pension Credits | NI |
| 8 | `pension-tax-relief` | Pension Tax Relief | Pensions |
| 9 | `pension-annual-allowance` | Pension Annual Allowance | Pensions |
| 10 | `pension-carry-forward` | Pension Carry Forward | Pensions |
| 11 | `pension-taper` | Tapered Annual Allowance | Pensions |
| 12 | `directors-loan-s455` | Director's Loan (S455) | Directors |
| 13 | `vat-threshold` | VAT Threshold | Directors |
| 14 | `self-assessment` | Self Assessment | Compliance |
| 15 | `payments-on-account` | Payments on Account | Compliance |

### Reference Docs (5)

| # | Slug | Title | Purpose |
|---|------|-------|---------|
| 1 | `rates-2025-26` | 2025-26 Tax Rates | Reference |
| 2 | `rates-2024-25` | 2024-25 Tax Rates | Reference |
| 3 | `glossary` | Tax Glossary | Reference |
| 4 | `hmrc-links` | HMRC Links | Reference |
| 5 | `p45-p60-p11d` | P45 / P60 / P11D | Compliance |

---

## Total Doc Count

| Category | Count |
|----------|-------|
| Input docs | 36 |
| Output docs | 38 |
| Conceptual docs | 15 |
| Reference docs | 5 |
| **Total** | **94** |

After consolidation (some inputs/outputs can share a page):
**Estimated final count: ~70-80 pages**

---

## Doc Template

Each doc follows a consistent structure:

```mdx
---
title: "Personal Allowance"
description: "The amount you can earn tax-free each year"
category: "tax"
relatedCalculators: ["paye", "director-guide"]
relatedDocs: ["pa-taper", "marriage-allowance", "income-tax"]
lastUpdated: "2026-01-28"
---

# Personal Allowance

<Summary>
The Personal Allowance is the amount of income you can earn each year 
before you start paying Income Tax. For 2025-26, this is **£12,570**.
</Summary>

## What is it?

[2-3 paragraphs explaining the concept in plain English]

## How it affects your tax

[Explanation with example calculation]

## Key thresholds

<ThresholdTable year="2025-26" thresholds={["personalAllowance"]} />

## Common questions

<Accordion>
  <AccordionItem title="What if I earn over £100,000?">
    Your Personal Allowance is reduced by £1 for every £2 you earn 
    over £100,000. See [Personal Allowance Taper](/docs/tax/pa-taper).
  </AccordionItem>
  <AccordionItem title="Can I transfer my allowance?">
    If you're married or in a civil partnership and earn less than 
    £12,570, you can transfer up to £1,260 to your partner. 
    See [Marriage Allowance](/docs/allowances/marriage-allowance).
  </AccordionItem>
</Accordion>

## Related calculators

<CalculatorLinks calculators={["paye", "director-guide"]} />

## HMRC reference

<HMRCLink href="https://www.gov.uk/income-tax-rates" />
```

---

## Component Requirements

### Core Components

```tsx
// Summary box at top of each doc
<Summary>Quick 1-2 sentence explanation</Summary>

// Threshold/rates table pulling from taxRates.ts
<ThresholdTable year="2025-26" thresholds={["personalAllowance", "basicRate"]} />

// Accordion for FAQs
<Accordion>
  <AccordionItem title="Question?">Answer</AccordionItem>
</Accordion>

// Link to related calculators
<CalculatorLinks calculators={["paye", "director-guide"]} />

// HMRC source link
<HMRCLink href="https://www.gov.uk/..." />

// Callout boxes
<Callout type="info">Helpful tip</Callout>
<Callout type="warning">Important warning</Callout>
<Callout type="example">Worked example</Callout>

// Code/formula display
<Formula>Tax = (Income - Allowance) × Rate</Formula>

// Comparison table
<ComparisonTable 
  items={[
    { label: "Basic Rate", scotland: "19%", ruk: "20%" },
    { label: "Higher Rate", scotland: "42%", ruk: "40%" },
  ]} 
/>

// Interactive mini-calculator (optional, phase 2)
<MiniCalculator type="personal-allowance" />
```

### Navigation Components

```tsx
// Sidebar navigation (auto-generated from file structure)
<DocsSidebar />

// Breadcrumbs
<DocsBreadcrumb />

// Previous/Next navigation
<DocsNavigation />

// On-this-page TOC
<TableOfContents />

// Search (Flexsearch or Algolia)
<DocsSearch />
```

### Integration Components

```tsx
// Help icon that links to doc
<DocLink slug="personal-allowance" />

// Tooltip with doc preview
<DocTooltip slug="personal-allowance">
  <HelpCircle className="size-4" />
</DocTooltip>

// In-calculator doc panel (slide-out)
<DocPanel slug="personal-allowance" />
```

---

## File Structure

```
src/
├── app/
│   └── docs/
│       ├── layout.tsx              # Docs layout with sidebar
│       ├── page.tsx                # Docs landing page
│       └── [[...slug]]/
│           └── page.tsx            # Dynamic doc page
├── content/
│   └── docs/
│       ├── getting-started/
│       │   ├── how-uk-tax-works.mdx
│       │   ├── understanding-payslip.mdx
│       │   └── tax-year-explained.mdx
│       ├── income/
│       │   ├── salary.mdx
│       │   ├── pay-period.mdx
│       │   └── ...
│       ├── tax/
│       │   ├── income-tax.mdx
│       │   ├── personal-allowance.mdx
│       │   └── ...
│       └── ...
├── components/
│   └── docs/
│       ├── Summary.tsx
│       ├── ThresholdTable.tsx
│       ├── Accordion.tsx
│       ├── CalculatorLinks.tsx
│       ├── HMRCLink.tsx
│       ├── Callout.tsx
│       ├── DocsSidebar.tsx
│       ├── DocsSearch.tsx
│       ├── DocLink.tsx
│       └── DocTooltip.tsx
└── lib/
    └── docs/
        ├── getDoc.ts               # Fetch doc by slug
        ├── getAllDocs.ts           # List all docs
        ├── getDocsByCategory.ts    # Filter by category
        └── searchDocs.ts           # Search index
```

---

## Integration with Calculators

### Adding Help Icons

Every input/output field gets a `<DocLink>` or `<DocTooltip>`:

```tsx
// Before
<Label>Personal Allowance</Label>

// After
<Label className="flex items-center gap-1">
  Personal Allowance
  <DocTooltip slug="personal-allowance">
    <HelpCircle className="size-3.5 text-muted-foreground" />
  </DocTooltip>
</Label>
```

### Deep Linking

Calculators can link directly to docs:

```tsx
<Link href="/docs/tax/personal-allowance">Learn more about Personal Allowance</Link>
```

### Contextual Panels (Phase 2)

Slide-out panel showing doc content without leaving calculator:

```tsx
<DocPanel 
  slug="personal-allowance" 
  trigger={<Button variant="ghost" size="sm">?</Button>}
/>
```

---

## Search Requirements

### Basic Search (MVP)
- Flexsearch integration (client-side)
- Search title, description, headings
- Keyboard shortcut (Cmd+K)
- Recent searches

### Enhanced Search (Phase 2)
- Algolia DocSearch (if traffic warrants)
- Search within content
- Filters by category
- Popular searches

---

## SEO Considerations

### Meta Tags
```tsx
export const metadata: Metadata = {
  title: `${doc.title} | PayeTax Docs`,
  description: doc.description,
  openGraph: {
    title: doc.title,
    description: doc.description,
    type: 'article',
  },
};
```

### Structured Data
```json
{
  "@type": "Article",
  "headline": "Personal Allowance Explained",
  "description": "...",
  "author": { "@type": "Organization", "name": "PayeTax" },
  "dateModified": "2026-01-28"
}
```

### Sitemap
Auto-generate from docs content directory.

---

## Implementation Phases

### Phase 1: Foundation (3-4 days)
- [ ] Install Fumadocs (or chosen framework)
- [ ] Set up `/docs` route structure
- [ ] Create layout with sidebar
- [ ] Build core components (Summary, Callout, ThresholdTable)
- [ ] Create 5 pilot docs to test structure
- [ ] Add search (Flexsearch)

### Phase 2: Content (5-7 days)
- [ ] Write all input docs (~36)
- [ ] Write all output docs (~38)
- [ ] Write conceptual docs (~15)
- [ ] Write reference docs (~5)
- [ ] Review and QA

### Phase 3: Integration (2-3 days)
- [ ] Add DocTooltip to all calculator fields
- [ ] Add "Learn more" links in results
- [ ] Add to navigation (Docs menu item)
- [ ] Update sitemap
- [ ] Test all links

### Phase 4: Polish (1-2 days)
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Analytics integration

**Total estimate: 11-16 days**

---

## Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Framework | Fumadocs / Custom MDX / Nextra | TBD |
| Search | Flexsearch / Algolia | Flexsearch (MVP) |
| Hosting | Same domain / Subdomain | Same (`/docs`) |
| Content format | MDX / Markdown | MDX |
| Analytics | Existing / Separate | Existing |

---

## Dependencies to Add

```bash
# If using Fumadocs
bun add fumadocs-core fumadocs-ui fumadocs-mdx

# If using custom MDX
bun add @next/mdx @mdx-js/loader @mdx-js/react
bun add gray-matter reading-time
bun add flexsearch
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Docs page views | 10% of calculator users |
| Time on docs | >2 minutes |
| Search usage | 20% of docs visitors |
| Bounce rate | <40% |
| Help icon clicks | Track per field |

---

## Next Steps

1. **Decide on framework** - Fumadocs vs Custom
2. **Set up foundation** - Routes, layout, components
3. **Write pilot docs** - 5 docs to validate structure
4. **Review with team** - Get feedback on format
5. **Scale content** - Write remaining docs
6. **Integrate** - Add to calculators

---

**Document Status:** Ready for review and framework decision.
