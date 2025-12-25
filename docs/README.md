# PayeTax Documentation

**Last Updated:** December 25, 2025  
**Version:** 4.7.0  
**Status:** Evergreen docs only

---

## Quick Links

| Need to... | Read this |
|------------|-----------|
| **Understand the codebase?** | [`ARCHITECTURE.md`](./guides/ARCHITECTURE.md) |
| **Check tech stack?** | [`TECH_STACK.md`](./guides/TECH_STACK.md) |
| **Write blog content?** | [`BLOG_GUIDE.md`](./guides/BLOG_GUIDE.md) |
| **Follow code standards?** | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| **Configure Sentry?** | [`SENTRY_LOGGING.md`](./guides/SENTRY_LOGGING.md) |
| **Use Linear?** | [`LINEAR.md`](./setup/LINEAR.md) |

---

## Documentation Structure

```
docs/
├── README.md              # This file
├── Testing.md             # HMRC test data integration
│
├── guides/                # Developer guides
│   ├── ARCHITECTURE.md    # Codebase architecture
│   ├── TECH_STACK.md      # Technology overview
│   ├── BLOG_GUIDE.md      # Content strategy
│   ├── STYLING-GUIDELINES.md  # Design system
│   └── SENTRY_LOGGING.md  # Error monitoring
│
├── setup/                 # Tool configuration
│   └── LINEAR.md          # Project management
│
├── planning/              # Future features
│   ├── SAGE_IMPLEMENTATION_PLAN.md
│   └── SELF_EMPLOYED_PLAN.md
│
└── proposals/             # Feature proposals
    └── SME_DIRECTOR_TOOLS_PROPOSAL.md
```

---

## Evergreen Documentation Policy

**Rules:**
- Only permanent, reusable guides belong in `/docs/`
- No one-off audit reports or incident analysis
- All tasks tracked in Linear, not docs
- Update existing docs rather than creating new ones
- Delete or archive outdated content promptly

**What belongs here:**
- Architecture and tech stack guides
- Setup and configuration instructions
- Content strategy and style guides
- Future feature plans

**What does NOT belong here:**
- Completed audit reports
- Temporary analysis documents
- Issue-specific notes
- Status summaries

---

## Key Files

### Developer Guides (`/guides/`)

| File | Description |
|------|-------------|
| **ARCHITECTURE.md** | Component structure, data flow, patterns |
| **TECH_STACK.md** | React 19, Next.js 16, Tailwind v4, versions |
| **BLOG_GUIDE.md** | Writing style, SEO, content calendar |
| **STYLING-GUIDELINES.md** | Design tokens, theming, components |
| **SENTRY_LOGGING.md** | Error tracking configuration |

### Setup (`/setup/`)

| File | Description |
|------|-------------|
| **LINEAR.md** | Project management integration |

### Planning (`/planning/`)

| File | Description |
|------|-------------|
| **SAGE_IMPLEMENTATION_PLAN.md** | AI explainer widget (future) |
| **SELF_EMPLOYED_PLAN.md** | Self-employed calculator (future) |

---

## Related Files

- **Root README:** [`../README.md`](../README.md)
- **Contributing:** [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Environment:** [`../.env.template`](../.env.template)

---

*Last reviewed: December 25, 2025*
