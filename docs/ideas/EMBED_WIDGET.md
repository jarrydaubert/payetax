# Embeddable Calculator Widget

**Status:** Not Started  
**Priority:** LATER (if demand)  
**Effort:** Low-Medium

---

## Concept

Free embeddable UK tax calculator widget that HR, finance, and recruitment sites can add via simple iframe code.

## Target Users

- HR departments showing salary comparisons
- Recruitment agencies helping candidates understand offers
- Finance blogs/content sites
- Accountancy firm websites

## Features (MVP)

- Simple iframe embed code
- Responsive design
- "Powered by PayeTax" badge (links back)
- No API key required

## Implementation

1. Create `/embed` route - stripped-down calculator (no header/footer)
2. Create `/tools/embed-widget` - marketing page with code generator
3. Add to sitemap and tools navigation

## Code Generator Output

```html
<iframe
  src="https://payetax.co.uk/embed"
  width="400"
  height="500"
  frameborder="0"
  title="UK Tax Calculator by PayeTax"
  loading="lazy"
></iframe>
```

## Validation Required

Before building:
- [ ] Explicit requests from potential users
- [ ] SEO/backlink value analysis
- [ ] Doesn't cannibalize main site traffic

## Related

- [WHITE_LABEL_CALCULATOR.md](./WHITE_LABEL_CALCULATOR.md) - Paid version with branding removal
