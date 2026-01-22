---
name: programmatic-seo
description: When the user wants to create or optimize SEO-driven pages at scale. Use when discussing salary pages, "[amount] after tax" pages, or scaling content programmatically. PayeTax already has programmatic salary pages - this skill helps optimize and expand them.
---

# Programmatic SEO for PayeTax

You are an expert in programmatic SEO for UK tax calculators. Your goal is to optimize PayeTax's existing salary pages and identify expansion opportunities.

## PayeTax pSEO Context

**Current Implementation:**
- URL pattern: `/calculator/[amount]-after-tax`
- Target queries: "£[X] after tax", "[X] after tax UK", "[X] take home pay"
- Generated from salary data in `src/constants/salaryPages.ts`

**Existing Structure:**
```
/calculator/25000-after-tax
/calculator/30000-after-tax
/calculator/40000-after-tax
... (up to ~100 pages)
```

## Core Principles (PayeTax-Specific)

### 1. Unique Value Per Salary
Each page must provide value beyond a simple calculation:
- Contextual insights for that salary bracket
- Comparison to median UK salary
- Tax efficiency tips relevant to that income level
- Related salary links (+/- £5,000)

### 2. HMRC-Accurate Data
All calculations must match HMRC:
- Source from `src/constants/taxRates.ts`
- Verify against official examples
- Update annually with new tax year

### 3. Regional Variations
Address Scotland vs England differences:
- Show both calculations where relevant
- Explain why they differ
- Link to comparison content

## Salary Page Audit Checklist

### Content Quality
- [ ] Unique intro paragraph (not just "[X] after tax")
- [ ] Contextual insights (e.g., "This puts you in the higher rate bracket")
- [ ] Tax breakdown table
- [ ] Monthly/weekly/daily figures
- [ ] Comparison to UK average
- [ ] Scottish alternative shown
- [ ] Tax efficiency tips for this bracket

### Technical SEO
- [ ] Unique title tag per page
- [ ] Unique meta description with salary
- [ ] H1 matches search intent
- [ ] Schema markup with salary data
- [ ] Canonical tag set correctly
- [ ] In sitemap with appropriate priority

### Internal Linking
- [ ] Link to £5k lower salary
- [ ] Link to £5k higher salary
- [ ] Link to related blog content
- [ ] Link to main calculator
- [ ] Breadcrumb navigation

## Expansion Opportunities

### Additional Query Patterns

| Pattern | Example | Priority |
|---------|---------|----------|
| Round salaries | £25,000, £30,000 | HIGH (existing) |
| Common salaries | £27,500, £32,000 | MEDIUM |
| Min wage calculations | £23,795 (2025) | HIGH |
| Living wage | £24,648 (London) | MEDIUM |
| Profession-specific | "teacher salary after tax" | LOW |

### Additional Page Types

1. **Comparison Pages**: "£30,000 vs £35,000 salary"
2. **Regional Pages**: "£40,000 after tax Scotland"
3. **Calculator Landing Pages**: "/calculator/income-tax" , "/calculator/national-insurance"

## Template Structure

### Current Template (Review)
```
src/app/calculator/[salary]/page.tsx
```

### Recommended Sections
1. **Hero**: Salary amount + key figures (net, tax, NI)
2. **Detailed Breakdown**: Table with all deductions
3. **Context**: What this salary means (percentile, bracket)
4. **Comparison**: Scotland vs England, year-on-year
5. **Tips**: Relevant tax efficiency advice
6. **Related Salaries**: Internal links
7. **FAQ**: Common questions for this bracket
8. **CTA**: Use full calculator for personalization

## Quality Thresholds

### Index vs NoIndex Decision

| Criteria | Index | NoIndex |
|----------|-------|---------|
| Round numbers (£25k, £30k) | ✅ | - |
| Common salaries (search volume > 100) | ✅ | - |
| Obscure amounts (£27,347) | - | ✅ |
| Negative/invalid salaries | - | ✅ |

### Content Minimum Standards
- Word count: 500+ unique words
- Sections: 4+ distinct sections
- Internal links: 3+ relevant links
- External links: 1+ (HMRC source)

## Implementation Checklist

### For New Pages
- [ ] Verify search volume exists
- [ ] Generate unique intro content
- [ ] Calculate accurate figures
- [ ] Add contextual insights
- [ ] Include related salary links
- [ ] Add to sitemap
- [ ] Submit to Search Console

### For Existing Pages
- [ ] Audit content uniqueness
- [ ] Verify calculations match current tax year
- [ ] Check internal linking
- [ ] Review structured data
- [ ] Monitor Search Console performance

## Monitoring

### Key Metrics
- Indexed pages count (Search Console)
- Impressions by page pattern
- Click-through rate by salary range
- Position changes over time

### Warning Signs
- Thin content warnings
- Impressions without clicks (bad meta descriptions)
- Pages not being indexed
- Cannibalization between pages

## Related Files

- `src/app/calculator/[salary]/page.tsx` - Template
- `src/constants/salaryPages.ts` - Salary data
- `src/lib/metadata.ts` - Meta generation
- `src/app/sitemap.ts` - Sitemap inclusion
