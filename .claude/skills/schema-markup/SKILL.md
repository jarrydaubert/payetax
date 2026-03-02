---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," or "breadcrumb schema." For broader SEO issues, see seo-audit.
metadata:
  version: 1.3.0
---

# Schema Markup

You are an expert in structured data and schema markup. Your goal is to implement schema.org markup that helps search engines understand content and enables rich results in search.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists (or `.claude/product-marketing-context.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before implementing schema, understand:

1. **Page Type** - What kind of page? What's the primary content? What rich results are possible?

2. **Current State** - Any existing schema? Errors in implementation? Which rich results already appearing?

3. **Goals** - Which rich results are you targeting? What's the business value?

---

## Core Principles

### 1. Accuracy First
- Schema must accurately represent page content
- Don't markup content that doesn't exist
- Keep updated when content changes

### 2. Use JSON-LD
- Google recommends JSON-LD format
- Easier to implement and maintain
- Place in `<head>` or end of `<body>`

### 3. Follow Google's Guidelines
- Only use markup Google supports
- Avoid spam tactics
- Review eligibility requirements

### 4. Validate Everything
- Test before deploying
- Monitor Search Console
- Fix errors promptly

---

## Common Schema Types

| Type | Use For | Required Properties |
|------|---------|-------------------|
| Organization | Company homepage/about | name, url |
| WebSite | Homepage (search box) | name, url |
| Article | Blog posts, news | headline, image, datePublished, author |
| Product | Product pages | name, image, offers |
| SoftwareApplication | SaaS/app pages | name, offers |
| FAQPage | FAQ content | mainEntity (Q&A array) |
| HowTo | Tutorials | name, step |
| BreadcrumbList | Any page with breadcrumbs | itemListElement |
| LocalBusiness | Local business pages | name, address |
| Event | Events, webinars | name, startDate, location |

**For complete JSON-LD examples**: See [references/schema-examples.md](references/schema-examples.md)

---

## Quick Reference

### Organization (Company Page)
Required: name, url
Recommended: logo, sameAs (social profiles), contactPoint

### Article/BlogPosting
Required: headline, image, datePublished, author
Recommended: dateModified, publisher, description

### Product
Required: name, image, offers (price + availability)
Recommended: sku, brand, aggregateRating, review

### FAQPage
Required: mainEntity (array of Question/Answer pairs)

### BreadcrumbList
Required: itemListElement (array with position, name, item)

---

## Multiple Schema Types

You can combine multiple schema types on one page using `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", ... },
    { "@type": "WebSite", ... },
    { "@type": "BreadcrumbList", ... }
  ]
}
```

---

## Validation and Testing

### Tools
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org/
- **Search Console**: Enhancements reports

### Common Errors

**Missing required properties** - Check Google's documentation for required fields

**Invalid values** - Dates must be ISO 8601, URLs fully qualified, enumerations exact

**Mismatch with page content** - Schema doesn't match visible content

---

## Implementation

### Static Sites
- Add JSON-LD directly in HTML template
- Use includes/partials for reusable schema

### Dynamic Sites (React, Next.js)
- Component that renders schema
- Server-side rendered for SEO
- Serialize data to JSON-LD

### CMS / WordPress
- Plugins (Yoast, Rank Math, Schema Pro)
- Theme modifications
- Custom fields to structured data

---

## Output Format

### Schema Implementation
```json
// Full JSON-LD code block
{
  "@context": "https://schema.org",
  "@type": "...",
  // Complete markup
}
```

### Testing Checklist
- [ ] Validates in Rich Results Test
- [ ] No errors or warnings
- [ ] Matches page content
- [ ] All required properties included

---

## Task-Specific Questions

1. What type of page is this?
2. What rich results are you hoping to achieve?
3. What data is available to populate the schema?
4. Is there existing schema on the page?
5. What's your tech stack?

---

## Related Skills

- **seo-audit**: For overall SEO including schema review
- **ai-seo**: For AI search optimization (schema helps AI understand content)
- **programmatic-seo**: For templated schema at scale
- **site-architecture**: For breadcrumb structure and navigation schema planning

## PayeTax Context

PayeTax already has extensive schema markup. When working on structured data for this project:

### Existing Implementation
- Schema component: `src/components/organisms/StructuredData.tsx` — supports 14 schema types
- All schemas use `<script type="application/ld+json">` in server-rendered HTML (not `next/script`)
- XSS protection: `JSON.stringify(schemaData).replace(/<\/script/gi, '<\/script')`
- `Organization` schema emitted from `src/app/layout.tsx` (appears on every page)
- Salary pages are generated at `src/app/calculator/[salary]/page.tsx` (canonical: `/calculator/{salary}-after-tax`)

### Active Schema Types
- **Homepage**: `WebSite`, `Organization`, `SoftwareApplication`, `FinancialService`, `HowTo`, `Dataset`, `FAQPage`
- **Salary pages** (`/calculator/[salary]-after-tax`): `SalaryCalculation` (custom `WebPage` + `FinancialProduct` hybrid), `BreadcrumbList`
- **Blog posts**: `BlogPosting`, `BreadcrumbList`, dynamic `FAQPage` (extracted from content), conditional `HowTo`
- **Director Intelligence**: `SoftwareApplication`, `FAQPage`, `Dataset`
- **Use-case pages** (`/best-for/[use-case]`): `BreadcrumbList`, `FAQPage`

### PayeTax-Specific Rules
- Currency is always GBP (£), not USD
- `inLanguage: 'en-GB'` on all content schemas
- `Dataset` schema pulls live values from `src/constants/taxRates.ts` — auto-updates when rates change
- No `aggregateRating` — only add when backed by real, verifiable reviews (fake ratings trigger Google penalties)
- `Organization.sameAs` currently only lists Twitter/X — expand when more profiles exist
- Tax rates source: `src/constants/taxRates.ts` — all schema monetary values must derive from this file
- Tax year strings must derive from `CURRENT_TAX_YEAR`/`formatTaxYearDisplay` (no hardcoded `"2025-26"` values)
- Breadcrumb `item` must be a canonical page URL (no hash fragments like `/#tax-calculator`)
- `HowTo.step` entries must include both `name` and `text`
- Any inline JSON-LD script must escape `</script>` the same way as `StructuredData`
- No schema on `noindex` utility pages unless there is explicit business need


