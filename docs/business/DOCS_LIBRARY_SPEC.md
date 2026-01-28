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
- Foundational guides that provide context for calculator fields (e.g., "How UK Tax Works" explains concepts referenced across multiple field docs)
- No standalone tax advice or guides unrelated to calculator functionality

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
- Great search (Rust-powered Pagefind in v4)
- Now App Router native (v4 dropped Pages Router)

**Cons:**
- Heavier bundle
- Less customizable than Fumadocs

### Framework Prerequisites

| Framework | Minimum Requirements | PayeTax Status |
|-----------|---------------------|----------------|
| Fumadocs v16 | Next.js 16+, React 19.2+ | ✅ Compatible (16.1.6, 19.2.4) |
| Nextra v4 | Next.js 15+, App Router | ✅ Compatible |
| Custom MDX | Any Next.js | ✅ Compatible |

**Recommendation:** Option A (Fumadocs) - best balance of features and Next.js 16 App Router compatibility. Project already meets all prerequisites.

### Framework Portability Guarantee

To avoid lock-in:
- Content lives in `content/docs/` as standard MDX — portable to any framework
- Custom components in `components/docs/` avoid framework-specific imports where possible
- If migrating from Fumadocs, only layout/routing code changes; content remains intact

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
│   └── Blind Person's Allowance
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
│   ├── Plan 5 (Sept 2023+ courses, repayments from April 2026)
│   ├── Postgraduate Loan
│   └── Multiple Plans (Important for directors)
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
| 9 | `pay-no-ni` | State Pension Age (No NI) | PAYE |
| 10 | `student-loan-plans` | Student Loan Plans | PAYE, Director |
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
taxYear: "2025-26"           # REQUIRED - prevents mixed-year content
relatedCalculators: ["paye", "director-guide"]
relatedDocs: ["pa-taper", "marriage-allowance", "income-tax"]
lastUpdated: "2026-01-28"
lastVerified: "2026-01-28"   # When HMRC sources were checked
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

// Tooltip with doc preview (with accessibility)
<DocTooltip slug="personal-allowance">
  <HelpCircle className="size-4" aria-hidden="true" />
  <span className="sr-only">Learn about Personal Allowance</span>
</DocTooltip>

// In-calculator doc panel (slide-out)
<DocPanel slug="personal-allowance" />

// Feedback component for each doc
<DocFeedback slug="personal-allowance" />
// Thumbs up/down + optional comment
```

### Accessibility Requirements

- All help icons must have `sr-only` labels
- Keyboard navigation support (Tab to focus, Enter to open)
- ARIA labels on interactive elements
- Focus management in modals/panels
- Consistent icon placement (right of label)

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

### Print Styles

Users (especially accountants) may want to print docs:

```css
@media print {
  .docs-sidebar,
  .docs-search,
  .docs-feedback,
  .docs-navigation { display: none; }
  .docs-content { max-width: 100%; }
}
```

---

## Content Maintenance

### When Tax Rates Change (Annual)
1. Update `src/constants/taxRates.ts` (single source of truth)
2. `<ThresholdTable>` components auto-update from taxRates.ts
3. Review prose for any hardcoded values
4. Update `lastUpdated` dates in frontmatter

### Maintenance Calendar
| When | Action |
|------|--------|
| Post-Budget (Nov/Dec) | Review for announced changes |
| April 6 | Apply new tax year rates |
| Quarterly | Audit for stale content |

### Automation
- CI check for hardcoded tax values in MDX files
- Script to find docs not updated in >6 months
- Alert when `taxRates.ts` changes but docs aren't updated

### Link Verification (verify-docs script)

**Problem:** Manual `lastVerified` updates are error-prone. HMRC moves pages frequently.

**Solution:** Scheduled GitLab CI job (monthly) that checks all `<HMRCLink>` URLs:

```yaml
# .gitlab-ci.yml (add to existing)
verify-docs:
  stage: test
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"  # Monthly schedule
    - if: $CI_PIPELINE_SOURCE == "web"       # Manual trigger
  script:
    - bun run scripts/verify-docs.ts
  after_script:
    - |
      if [ $CI_JOB_STATUS == "failed" ]; then
        # Create issue via GitLab API with broken links report
        curl --request POST --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
          "$CI_API_V4_URL/projects/$CI_PROJECT_ID/issues" \
          --data "title=Docs Link Verification Failed&labels=docs,maintenance"
      fi
```

**Script behaviour:**
1. Extracts all `<HMRCLink href="...">` from MDX files
2. HEAD request each URL (respects rate limits)
3. If 404/5xx → flags doc as "Needs Verification"
4. If all links valid → does NOT auto-update `lastVerified` (YMYL requires human review)
5. Outputs "Docs Health Report" to maintainer

**Important:** This catches broken links, but human verification is still required for content accuracy.

---

## Tax Year Versioning Governance

**Staleness is the #1 reputational risk for a tax site.**

### Required Frontmatter

Every doc MUST include:
```yaml
taxYear: "2025-26"           # Which tax year rates apply
lastVerified: "2026-01-28"   # When HMRC sources were checked
```

### Build-Time Validation

CI enforces:
1. `taxYear` is present in all MDX files
2. `<ThresholdTable year="X">` matches frontmatter `taxYear`
3. No hardcoded tax values in prose (regex lint)
4. All docs verified within 6 months

### Tax Year Changelog

Maintain `content/docs/reference/changelog.mdx`:
```md
## 2025-26 Changes (April 6, 2025)
- Personal Allowance: £12,570 (frozen)
- NI Primary Threshold: £12,570
- Dividend Allowance: £500 (reduced from £1,000)
```

### Mid-Year Changes

Rare but possible (e.g., emergency budget). Process:
1. Update `taxRates.ts` immediately
2. Add banner to affected docs: `<Callout type="warning">Updated mid-year</Callout>`
3. Log in changelog with effective date

---

## Slug Uniqueness & Coverage

### Preventing Collisions

With `/docs/[category]/[slug]` routing, slug collisions across categories are possible.

**Build-time manifest generation:**
```ts
// scripts/validate-docs.ts
// Generates content/docs/_manifest.json at build time
// Fails CI if:
// - Duplicate slugs across categories
// - DocLink references non-existent slug
// - Orphaned docs (not in nav)
```

### Calculator-to-Docs Coverage

Every `<DocLink slug="...">` in calculator code must have a matching doc:

```ts
// CI check: scan for DocLink/DocTooltip usage
// Verify each slug exists in manifest
// Fail build on missing docs
```

### Reverse Index

Each doc should list which calculator fields reference it:
```yaml
referencedBy:
  - paye-calculator/salary-input
  - director-guide/salary-slider
```

---

## Field Definition Registry

To prevent docs-to-calculator drift, fields should declare their doc slug at the source.

### Avoiding the Circular Dependency Trap

**Problem:** If the registry imports heavy dependencies (MDX content, Zod schemas with server-only code), it breaks Client Component boundaries or bloats the bundle.

**Solution:** Split into two files:

```ts
// src/lib/fields/metadata.ts (Client-Safe - import anywhere)
export const FIELD_METADATA = {
  salary: {
    id: 'salary',
    label: 'Annual Salary',
    docSlug: 'salary',
    tooltipExcerpt: 'Gross yearly income before tax...', // Hardcoded for instant render
    calculators: ['paye', 'ni', 'scottish'],
  },
  personalAllowance: {
    id: 'personal-allowance',
    label: 'Personal Allowance',
    docSlug: 'personal-allowance',
    tooltipExcerpt: 'The amount you can earn tax-free each year.',
    calculators: ['paye', 'decoder'],
  },
  // ...
} as const satisfies Record<string, FieldMetadata>;
```

```ts
// src/lib/fields/validation.ts (Server/Action only - never import in Client Components)
import { z } from 'zod';

export const FIELD_SCHEMAS = {
  salary: z.number().min(0).max(10_000_000),
  personalAllowance: z.number().min(0),
  // ... heavy Zod schemas with transforms, refinements, etc.
} as const;
```

Benefits:
- Single source of truth for field metadata
- CI can validate all `docSlug` values exist
- Auto-generate "Related calculators" section in docs
- Type-safe `<DocLink>` usage
- **No bundle bloat** - metadata.ts stays tiny (~2KB)

---

## Search Implementation

### Build-Time Index (MVP)

Generate compact JSON at build, not runtime:

```ts
// scripts/build-search-index.ts
// Extracts: slug, title, description, headings, category
// Output: public/search-index.json (~50KB for 80 docs)
```

### Client-Side Loading

```tsx
// Load lazily on Cmd+K, not on page load
let searchIndexCache: SearchIndex | null = null;

const loadSearchIndex = async () => {
  if (!searchIndexCache) {
    const res = await fetch('/search-index.json');
    searchIndexCache = await res.json();
  }
  return searchIndexCache;
};
```

### What Gets Indexed
- Title (high weight)
- Description (high weight)
- H2/H3 headings (medium weight)
- First 200 chars of content (low weight)
- NOT: full MDX content (bundle bloat)

---

## Tooltip & Panel Content Strategy

**Problem:** Rendering full MDX in tooltips/panels ships large bundles to calculator pages.

### Tooltips: Precomputed Excerpts Only

```ts
// Build-time: generate excerpts
// content/docs/_excerpts.json
{
  "personal-allowance": {
    "title": "Personal Allowance",
    "excerpt": "The amount you can earn tax-free each year. For 2025-26, this is £12,570.",
    "href": "/docs/tax/personal-allowance"
  }
}
```

Tooltip shows excerpt + "Learn more" link. Never renders full MDX.

### Panels: Fetch On-Demand

```tsx
<DocPanel slug="personal-allowance" />
// Fetches /api/docs/personal-allowance on open
// Returns pre-rendered HTML, not raw MDX
// Constrained subset: Summary, Key thresholds, FAQ
```

### Why We Have `/api/docs`

This is a deliberate exception to our "avoid API endpoints" principle:
- **Justification:** Panels need dynamic content without shipping full MDX bundles
- **Contract:** Stable endpoint, cached (1 hour), rate-limited (60/min per IP)
- **Security:** HTML generated at build-time from MDX; no runtime markdown parsing; output sanitised with allowlisted tags only

---

## Doc Consolidation Rules

To prevent duplicate/competing pages:

1. **Field doc is canonical** - If a concept is tied to a specific input/output field, that's the single page
2. **Conceptual doc only if 3+ calculators reference it** - Don't create standalone concept pages for single-calculator features
3. **Input + Output = One page** - If a concept appears as both input and output (e.g., Personal Allowance), consolidate
4. **Taper/edge cases link to parent** - `pa-taper` links prominently to `personal-allowance`, not the reverse

---

## Glossary Integration

The glossary (`/docs/reference/glossary`) should be actively linked, not just a reference page.

### Auto-Linking Terms

```tsx
// In MDX, wrap technical terms for glossary tooltips
Your <Term>Personal Allowance</Term> is reduced by £1 for every £2 over £100,000.

// Renders as subtle dotted underline with hover tooltip showing glossary definition
// Click opens full glossary entry
```

### Glossary Entry Format

```yaml
# content/docs/reference/glossary.mdx
terms:
  - term: "Personal Allowance"
    slug: "personal-allowance"
    definition: "The amount of income you can earn tax-free each year."
    docLink: "/docs/tax/personal-allowance"  # Optional deep link
```

---

## YMYL Trust Signals

Tax content is "Your Money or Your Life" (YMYL) - Google holds it to higher standards.

### Required Per-Page

1. **HMRC Source Link** - Already have `<HMRCLink>`
2. **Last Verified Date** - Added to frontmatter
3. **Disclaimer** - Footer on every doc page:
   ```
   This information is for guidance only. Always verify with HMRC 
   or consult a qualified accountant for your specific circumstances.
   ```

### Site-Wide

1. **Editorial Policy Page** - `/docs/about/editorial-policy`
   - How content is researched and verified
   - Update process and frequency
   - Qualifications of reviewers (future: "Reviewed by ACA/CTA")

2. **About Page** - Clear company information

3. **Contact** - Way to report errors

### Structured Data Enhancement

```json
{
  "@type": "Article",
  "about": {
    "@type": "Thing",
    "name": "UK Income Tax"
  },
  "citation": {
    "@type": "WebPage",
    "url": "https://www.gov.uk/income-tax-rates"
  }
}
```

---

## Docs Quality Gate

Before publishing any doc, CI validates:

| Check | Requirement |
|-------|-------------|
| HMRC Source | At least 1 `<HMRCLink>` present |
| Tax Year | `taxYear` frontmatter matches current |
| No Advice Language | No "you should", "you must" phrasing |
| Worked Example | Has `<Callout type="example">` OR explicit "calculator handles the math" note |
| Excerpt Exists | Entry in `_excerpts.json` |
| Slug Valid | Exists in manifest, no collisions |

### Lint Rules

```bash
# scripts/lint-docs.ts
bun run lint:docs

# Checks:
# - No hardcoded threshold £ values (PA, band edges, VAT threshold)
#   ALLOWED: example values inside <Callout type="example">
# - No advisory language ("you should", "you must", "best approach", "optimal")
# - Frontmatter complete (taxYear, lastVerified required)
# - HMRCLink URLs syntactically valid (full validation in nightly job, not PR)
```

### Content Style Guide

**Allowed patterns:**
- Definitions: "Personal Allowance is..."
- Mechanics: "Tax is calculated by..."
- Eligibility: "You qualify if..."
- Examples: "For instance, on a £50,000 salary..."

**Disallowed patterns:**
- Recommendations: "You should...", "We recommend..."
- Superlatives: "The best approach...", "The optimal strategy..."
- Imperatives: "Always do X", "Never do Y"
- Financial advice: "You would save more by..."

---

## URL Redirects

When docs are renamed or restructured, old URLs will break. Maintain redirects in `next.config.ts`:

```ts
redirects: async () => [
  {
    source: '/docs/tax/personal-allowance',
    destination: '/docs/allowances/personal-allowance',
    permanent: true,
  },
],
```

Track all URL changes in `docs/REDIRECT_LOG.md`.

---

## Pilot Doc Priority

For Phase 1 pilot docs, start with these high-traffic candidates:

| Doc | Reason |
|-----|--------|
| `personal-allowance` | Most searched tax term |
| `tax-code` | Common confusion point |
| `employee-ni` | Appears on every payslip |
| `dividends` | Director calculator core concept |
| `student-loan-plan-2` | Largest loan cohort |

---

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1: Foundation | 3-4 days | Framework setup, 5 pilot docs |
| Phase 2: Content | 7-10 days | ~70 docs @ 2-3 hours each |
| Phase 3: Integration | 2-3 days | DocTooltips, links |
| Phase 4: Polish | 1-2 days | Testing, a11y audit |
| **Total** | **13-19 days** | Single writer estimate |

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Install Fumadocs (or chosen framework)
- [ ] Set up `/docs` route structure
- [ ] Create layout with sidebar
- [ ] Build core components (Summary, Callout, ThresholdTable)
- [ ] Create 5 pilot docs to test structure
- [ ] Add search (Flexsearch)

### Phase 2: Content
- [ ] Write all input docs (~36)
- [ ] Write all output docs (~38)
- [ ] Write conceptual docs (~15)
- [ ] Write reference docs (~5)
- [ ] Cross-check all thresholds against HMRC sources
- [ ] Review against calculator logic for accuracy

### Phase 3: Integration
- [ ] Add DocTooltip to all calculator fields
- [ ] Add "Learn more" links in results
- [ ] Add to navigation (Docs menu item)
- [ ] Update sitemap
- [ ] Test all links

### Phase 4: Polish
- [ ] Mobile responsive testing (sidebar collapse, search UX)
- [ ] Accessibility audit (keyboard nav, ARIA labels)
- [ ] Performance optimization
- [ ] Analytics integration (per-field help icon tracking)

---

## Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Framework | Fumadocs / Custom MDX / Nextra | **Fumadocs** (confirmed) |
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

### Analytics Dashboard

Track docs effectiveness with dedicated dashboard:

| Metric | Implementation | Purpose |
|--------|----------------|---------|
| Help icon clicks | `data-doc-slug` attribute + event listener | Which fields confuse users most |
| Doc → Calculator journeys | UTM params on "Try calculator" links | Content driving conversions |
| Search queries with no results | Log to analytics | Content gaps to fill |
| Time to first help click | Session tracking | Onboarding friction |
| Doc feedback (thumbs up/down) | `<DocFeedback>` component | Content quality signal |
| Scroll depth per doc | Intersection observer | Are users reading fully? |

Priority: Help icon clicks and search gaps are highest signal for content priorities.

---

## Next Steps

1. **Decide on framework** - Fumadocs vs Custom
2. **Set up foundation** - Routes, layout, components
3. **Write pilot docs** - 5 docs to validate structure
4. **Review with team** - Get feedback on format
5. **Scale content** - Write remaining docs
6. **Integrate** - Add to calculators

---

## Contributing to Docs

For contribution guidelines (PR process, style rules, review requirements), see `CONTRIBUTING.md` in the project root. The docs library follows the same standards as the main codebase.

Key points for doc contributions:
- All MDX must pass `bun run lint:docs` before merge
- Tax threshold changes require HMRC source link in PR description
- New docs need excerpt added to `_excerpts.json`

---

**Document Status:** Ready for review and framework decision.
