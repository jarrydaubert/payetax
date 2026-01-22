---
name: schema-markup
description: When the user wants to add, fix, or verify structured data on PayeTax. Use when discussing rich snippets, Google search features, or JSON-LD implementation. PayeTax has extensive structured data - this skill helps maintain and expand it.
---

# Schema Markup for PayeTax

You are an expert in structured data implementation. Your goal is to help PayeTax maximize rich snippet opportunities and ensure structured data accuracy.

## PayeTax Schema Context

**Current Implementation**: `src/components/organisms/StructuredData.tsx`
**Validation**: Google Rich Results Test, Schema.org Validator
**Goal**: Rich snippets for calculator, FAQ, and blog content

## Implemented Schema Types

### Organization Schema
Applied to: All pages
Purpose: Brand knowledge panel

```json
{
  "@type": "Organization",
  "name": "PayeTax",
  "url": "https://payetax.co.uk",
  "logo": "https://payetax.co.uk/logo.png",
  "sameAs": ["https://x.com/PayeTaxUK"]
}
```

### Website Schema
Applied to: Homepage
Purpose: Sitelinks search box

```json
{
  "@type": "WebSite",
  "name": "PayeTax",
  "url": "https://payetax.co.uk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://payetax.co.uk/calculator/{search_term_string}-after-tax",
    "query-input": "required name=search_term_string"
  }
}
```

### SoftwareApplication Schema
Applied to: Calculator pages
Purpose: Software rich result

```json
{
  "@type": "SoftwareApplication",
  "name": "PayeTax UK Tax Calculator",
  "operatingSystem": "Web",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "X"
  }
}
```

### FinancialService Schema
Applied to: Homepage
Purpose: Local business features

```json
{
  "@type": "FinancialService",
  "name": "PayeTax Tax Calculator",
  "serviceType": "Tax Calculator",
  "areaServed": {
    "@type": "Country",
    "name": "United Kingdom"
  }
}
```

### HowTo Schema
Applied to: Calculator, How-to blog posts
Purpose: How-to rich snippet

```json
{
  "@type": "HowTo",
  "name": "How to Calculate Your UK Take-Home Pay",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Enter your gross salary",
      "text": "Input your annual gross salary in pounds"
    },
    {
      "@type": "HowToStep",
      "name": "Select your tax code",
      "text": "Choose your tax code (default 1257L)"
    }
  ]
}
```

### FAQPage Schema
Applied to: FAQ sections, blog posts with Q&A
Purpose: FAQ rich snippet

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much tax do I pay on £50,000?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "On a £50,000 salary in 2025/26, you'll pay approximately £7,486 in income tax..."
      }
    }
  ]
}
```

### Article Schema
Applied to: Blog posts
Purpose: Article rich result

```json
{
  "@type": "Article",
  "headline": "Article Title",
  "datePublished": "2025-01-20",
  "dateModified": "2025-01-20",
  "author": {
    "@type": "Organization",
    "name": "PayeTax"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PayeTax"
  }
}
```

### BreadcrumbList Schema
Applied to: All pages
Purpose: Breadcrumb rich snippet

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://payetax.co.uk"},
    {"@type": "ListItem", "position": 2, "name": "Calculator", "item": "https://payetax.co.uk/calculator"},
    {"@type": "ListItem", "position": 3, "name": "£50,000 After Tax"}
  ]
}
```

### Dataset Schema
Applied to: Tax rates page, calculator
Purpose: Dataset rich result

```json
{
  "@type": "Dataset",
  "name": "UK Income Tax Rates 2025/26",
  "description": "Official UK income tax rates and thresholds for the 2025/26 tax year",
  "creator": {"@type": "Organization", "name": "PayeTax"},
  "temporal": "2025-04-06/2026-04-05",
  "spatialCoverage": "United Kingdom"
}
```

## Schema Opportunities

### Not Yet Implemented

| Type | Page | Benefit |
|------|------|---------|
| `Review` | Calculator | Star ratings in SERP |
| `VideoObject` | Blog posts with video | Video rich result |
| `Event` | Tax deadline pages | Event listing |
| `MonetaryAmount` | Salary pages | Salary rich result |

### Salary Page Enhanced Schema

```json
{
  "@type": "WebPage",
  "name": "£50,000 After Tax UK 2025",
  "description": "Calculate what £50,000 salary gives you after tax...",
  "mainEntity": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": 50000,
    "name": "Gross Annual Salary"
  },
  "about": {
    "@type": "FinancialProduct",
    "name": "UK PAYE Tax Calculation",
    "feesAndCommissionsSpecification": "Income Tax: £7,486, NI: £2,994"
  }
}
```

## Validation Checklist

### Before Deploy
- [ ] Valid JSON-LD syntax
- [ ] No duplicate types on same page
- [ ] Required properties present
- [ ] Passes Rich Results Test
- [ ] Matches visible page content

### After Deploy
- [ ] Indexed by Google (Search Console)
- [ ] No errors in Enhancements report
- [ ] Rich results appearing in SERP
- [ ] No manual actions

## Common Issues

### FAQ Schema
- **Issue**: FAQ not showing in SERP
- **Cause**: Questions too long, not genuine FAQ
- **Fix**: Keep questions under 100 chars, answer under 300

### Article Schema
- **Issue**: Missing author
- **Cause**: Author not specified
- **Fix**: Use Organization as author if no personal author

### Aggregate Rating
- **Issue**: No rating showing
- **Cause**: Need real reviews
- **Fix**: Implement review collection or remove

## Implementation Pattern

### In StructuredData.tsx
```tsx
export function StructuredData({ type, data }) {
  const schemas = {
    organization: generateOrganizationSchema(),
    calculator: generateSoftwareAppSchema(),
    faq: generateFAQSchema(data.questions),
    article: generateArticleSchema(data),
    salary: generateSalaryPageSchema(data.amount),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas[type], null, 0),
      }}
    />
  );
}
```

### Page Usage
```tsx
// In page component
<StructuredData type="calculator" />
<StructuredData type="faq" data={{ questions: faqItems }} />
```

## Testing Tools

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Enhancements report
4. **Structured Data Testing Tool**: (legacy, still useful)

## Annual Maintenance

### Tax Year Transition (April)
- [ ] Update Dataset temporal property
- [ ] Verify HowTo steps still accurate
- [ ] Update FAQ answers with new figures
- [ ] Check SoftwareApplication description

### Rate Changes
- [ ] Update any hardcoded amounts in FAQ
- [ ] Verify Dataset description
- [ ] Check Article dateModified

## Related Files

- `src/components/organisms/StructuredData.tsx` - Main implementation
- `src/lib/metadata.ts` - Page metadata (works with schema)
- `src/app/layout.tsx` - Global schema inclusion
