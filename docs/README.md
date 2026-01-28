# PayeTax Documentation

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
| **Add monetization?** | [`MONETIZATION.md`](./guides/MONETIZATION.md) |
| **Use Linear?** | [`LINEAR.md`](./setup/LINEAR.md) |
| **Director tools strategy?** | [`business/README.md`](./business/README.md) |

---

## Documentation Structure

```
docs/
├── README.md              # This file
├── BACKLOG.md             # Active TODO list
├── Testing.md             # HMRC test data integration
├── SKILLS_AND_COMMANDS.md # AI skills/commands guide
├── VIDEO_CONTENT.md       # Video generation (separate repo)
│
├── business/              # Product & business strategy
│   ├── README.md          # Start here
│   ├── READ_THIS_FIRST.md # Founder mindset
│   ├── DIRECTOR_GUIDE_STRATEGY.md  # Director tools pivot
│   ├── DIRECTOR_TAX_MATH.md        # Tax calculations
│   ├── DIRECTOR_TOOLS_MERGE_PLAN.md
│   ├── MONETIZATION.md    # Revenue strategy
│   ├── IDEAS.md           # Feature ideas
│   ├── CASE_STUDY_RECRUITER.md
│   └── COMPETITOR_GAP_ANALYSIS.md
│
├── guides/                # Developer guides
│   ├── ARCHITECTURE.md    # Codebase architecture
│   ├── TECH_STACK.md      # Technology overview
│   ├── BLOG_GUIDE.md      # Content strategy
│   ├── CONTENT_PHILOSOPHY.md  # Social-first writing
│   ├── STYLING-GUIDELINES.md  # Design system
│   ├── SENTRY_LOGGING.md  # Error monitoring
│   └── MONETIZATION.md    # Revenue implementation
│
├── ideas/                 # Future feature ideas
│   ├── LANDLORD_TAX_CALCULATOR.md
│   ├── LEAD_MAGNET_NEWSLETTER.md
│   └── NEWSLETTER_RESEND.md
│
├── marketing/             # Marketing assets
│   └── v4.9.5-release-tweet.md
│
├── performance/           # Performance tracking
│   └── lighthouse-scores.md
│
├── planning/              # Implementation plans
│   ├── BLOG_PAGE_BUILD.md
│   ├── SAGE_IMPLEMENTATION_PLAN.md
│   └── SELF_EMPLOYED_PLAN.md
│
└── setup/                 # Tool configuration
    └── LINEAR.md          # Project management
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

### Business Strategy (`/business/`)

| File | Description |
|------|-------------|
| **READ_THIS_FIRST.md** | Founder mindset, distribution focus |
| **DIRECTOR_GUIDE_STRATEGY.md** | Director tools product pivot (4-reviewer approved) |
| **DIRECTOR_TAX_MATH.md** | Tax rates, formulas, golden examples |
| **MONETIZATION.md** | Revenue strategy and phases |
| **IDEAS.md** | Validated feature ideas |

### Developer Guides (`/guides/`)

| File | Description |
|------|-------------|
| **ARCHITECTURE.md** | Component structure, data flow, patterns |
| **TECH_STACK.md** | React 19, Next.js 16, Tailwind v4, versions |
| **BLOG_GUIDE.md** | Writing style, SEO, content calendar |
| **STYLING-GUIDELINES.md** | Design tokens, theming, components |
| **SENTRY_LOGGING.md** | Error tracking configuration |
| **MONETIZATION.md** | Technical implementation of revenue features |

### Planning (`/planning/`)

| File | Description |
|------|-------------|
| **BLOG_PAGE_BUILD.md** | Blog page redesign spec |
| **SAGE_IMPLEMENTATION_PLAN.md** | AI explainer widget |
| **SELF_EMPLOYED_PLAN.md** | Self-employed calculator |

### Setup (`/setup/`)

| File | Description |
|------|-------------|
| **LINEAR.md** | Project management integration |

---

## Related Files

- **Root README:** [`../README.md`](../README.md)
- **Contributing:** [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Environment:** [`../.env.template`](../.env.template)


