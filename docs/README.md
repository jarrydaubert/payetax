# PayeTax Documentation

> **Start here:** [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) - The guiding philosophy

---

## Quick Links

| Need to... | Read this |
|------------|-----------|
| **Understand priorities?** | [`READ_THIS_FIRST.md`](./READ_THIS_FIRST.md) |
| **Understand the codebase?** | [`ARCHITECTURE.md`](./guides/ARCHITECTURE.md) |
| **Check tech stack?** | [`TECH_STACK.md`](./guides/TECH_STACK.md) |
| **Write blog content?** | [`BLOG_GUIDE.md`](./blog/BLOG_GUIDE.md) |
| **Run tests?** | [`TESTING.md`](./guides/TESTING.md) |
| **Configure Sentry?** | [`SENTRY_LOGGING.md`](./guides/SENTRY_LOGGING.md) |
| **Configure Resend?** | [`RESEND.md`](./guides/RESEND.md) |
| **Use Linear?** | [`LINEAR.md`](./guides/LINEAR.md) |
| **Director tools strategy?** | [`business/README.md`](./business/README.md) |

---

## Documentation Structure

```
docs/
├── README.md
├── READ_THIS_FIRST.md     # START HERE
├── BACKLOG.md
├── SKILLS_AND_COMMANDS.md
│
├── business/              # Product & business strategy (7)
│   ├── README.md
│   ├── DIRECTOR_GUIDE_POSITIONING.md
│   ├── DIRECTOR_CALCULATOR_BUILD.md
│   ├── DIRECTOR_TAX_MATH.md
│   ├── DOCS_LIBRARY_SPEC.md
│   ├── MONETIZATION.md
│   ├── CASE_STUDY_RECRUITER.md
│   └── COMPETITOR_GAP_ANALYSIS.md
│
├── blog/                  # Blog content & strategy (2)
│   ├── BLOG_GUIDE.md
│   └── UPCOMING_POSTS.md
│
├── guides/                # Developer guides (8)
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── TESTING.md
│   ├── CONTENT_PHILOSOPHY.md
│   ├── STYLING-GUIDELINES.md
│   ├── SENTRY_LOGGING.md
│   ├── RESEND.md
│   └── LINEAR.md
│
├── ideas/                 # Future features (6)
│   ├── PDF_EXPORT.md
│   ├── MARRIAGE_ALLOWANCE.md
│   ├── XERO_QUICKBOOKS_INTEGRATION.md
│   ├── WHITE_LABEL_CALCULATOR.md
│   ├── DIRECTOR_PRO_SUBSCRIPTION.md
│   └── LEAD_MAGNET_NEWSLETTER.md
│
├── archive/               # Parked ideas (2)
│   ├── SELF_EMPLOYED_CALCULATOR.md
│   └── LANDLORD_TAX_CALCULATOR.md
│
├── marketing/
│   └── v4.9.5-release-tweet.md
│
└── performance/
    └── lighthouse-scores.md
```

**28 docs total**

---

## Key Files

### Business Strategy (`/business/`)

| File | Description |
|------|-------------|
| **DIRECTOR_GUIDE_POSITIONING.md** | Director tools product positioning |
| **DIRECTOR_TAX_MATH.md** | Tax rates, formulas, golden examples |
| **MONETIZATION.md** | Revenue strategy + technical implementation |

### Developer Guides (`/guides/`)

| File | Description |
|------|-------------|
| **ARCHITECTURE.md** | Component structure, data flow, patterns |
| **TECH_STACK.md** | React 19, Next.js 16, Tailwind v4, versions |
| **TESTING.md** | Test philosophy, commands, HMRC verification |
| **BLOG_GUIDE.md** | Writing style, SEO, content calendar |
| **RESEND.md** | Newsletter, email results, feedback setup |
| **LINEAR.md** | Project management integration |
| **SENTRY_LOGGING.md** | Error monitoring configuration |

### Ideas (`/ideas/`) - Focused

| File | Priority | Description |
|------|----------|-------------|
| **PDF_EXPORT.md** | NOW | PDF export with workings |
| **MARRIAGE_ALLOWANCE.md** | NOW | Marriage allowance toggle |
| **XERO_QUICKBOOKS_INTEGRATION.md** | NEXT | Accounting software integration |
| **WHITE_LABEL_CALCULATOR.md** | LATER | B2B white-label embed |
| **DIRECTOR_PRO_SUBSCRIPTION.md** | LATER | B2C subscription product |
| **LEAD_MAGNET_NEWSLETTER.md** | LATER | Newsletter lead magnets |

### Archive (`/archive/`) - Different Avatar

| File | Why Archived |
|------|--------------|
| **SELF_EMPLOYED_CALCULATOR.md** | Different avatar (not SME director) |
| **LANDLORD_TAX_CALCULATOR.md** | Different avatar (not SME director) |

---

## Related Files

- **Root README:** [`../README.md`](../README.md)
- **Claude instructions:** [`../CLAUDE.md`](../CLAUDE.md)
