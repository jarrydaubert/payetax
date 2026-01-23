# PayeTax Claude Configuration

> Optimized commands and skills for PayeTax development.
>
> **Full generic documentation:** See [`docs/SKILLS_AND_COMMANDS.md`](../../docs/SKILLS_AND_COMMANDS.md) for a reusable guide.

## Philosophy

**Commands** = Explicit workflow actions (you invoke them)
**Skills** = Contextual knowledge (auto-activated when relevant)

---

## Commands (7)

| Command | Purpose | Use When |
|---------|---------|----------|
| `/plan` | Architecture planning | Designing features, major changes |
| `/audit` | Deep code review | Reviewing systems, refactoring |
| `/cleanup` | Project housekeeping | Finding duplicates, orphans, junk |
| `/debug` | Systematic debugging | Investigating issues |
| `/test` | Test engineering | Writing tests, coverage gaps |
| `/security` | Security review | OWASP checklist, vulnerability audit |
| `/finance` | UK tax compliance | Verifying HMRC accuracy |

### Usage Examples

```bash
# Plan a new feature
/plan pension-contributions

# Audit the calculator
/audit calculator

# Deep housekeeping scan
/cleanup
/cleanup components

# Debug a calculation issue
/debug wrong-ni-calculation

# Write tests for tax calculations
/test tax-calculations

# Security review
/security input-validation

# Verify HMRC compliance
/finance scotland
```

---

## Skills (19)

Skills provide expert knowledge that activates contextually when you discuss relevant topics.

### Security & Code Quality

| Skill | Activates When Discussing |
|-------|--------------------------|
| `nextjs-best-practices` | Next.js patterns, React 19, TypeScript, modernization |
| `vercel-react-best-practices` | React/Next.js performance, 45 optimization rules from Vercel |
| `accessibility` | WCAG, a11y, screen readers, keyboard nav |
| `performance` | Core Web Vitals, LCP, bundle size, optimization |

### SEO & Marketing

| Skill | Activates When Discussing |
|-------|--------------------------|
| `seo-audit` | Technical SEO, meta tags, crawlability |
| `programmatic-seo` | Salary pages, pSEO, scaling content |
| `schema-markup` | Structured data, JSON-LD, rich snippets |
| `content-marketing` | Blog posts, social media, UK tax content |
| `analytics-tracking` | GA4, Vercel Analytics, tracking, conversions |
| `competitor-alternatives` | Competitor comparison pages, "vs" content, positioning |
| `social-content` | Twitter/LinkedIn content, seasonal tax posts, viral content |
| `free-tool-strategy` | Engineering as marketing, calculator optimization |

### Conversion & Copy

| Skill | Activates When Discussing |
|-------|--------------------------|
| `page-cro` | Calculator UX, conversion optimization |
| `copywriting` | Landing page copy, headlines, CTAs |
| `copy-editing` | Reviewing/improving existing copy, seven sweeps |
| `marketing-psychology` | Mental models, persuasion, user behavior |
| `marketing-ideas` | Growth tactics, 140 marketing strategies |

### Design & Monetization

| Skill | Activates When Discussing |
|-------|--------------------------|
| `ui-design` | Design system consistency, tokens, typography, hardcoded values |
| `pricing-strategy` | Monetization, freemium, premium features, revenue models |

---

## When Skills Activate

**Example conversations:**

> "How should I optimize the LCP for the calculator page?"
→ `performance` skill activates

> "I want to create a blog post about the £100k tax trap"
→ `content-marketing` skill activates

> "Are the salary pages following SEO best practices?"
→ `programmatic-seo` + `seo-audit` skills activate

> "What structured data should we add for salary pages?"
→ `schema-markup` skill activates

> "Is the calculator accessible for screen readers?"
→ `accessibility` skill activates

---

## Workflow Examples

### Feature Development
```bash
/plan pension-contributions    # Design
# Implement...
/finance pension               # Verify HMRC accuracy
/test pension                  # Write tests
# Skills auto-activate for a11y, perf during review
```

### Tax Year Update (April)
```bash
/finance                       # Full compliance check
/test tax-calculations         # Verify all tests pass
# content-marketing skill for seasonal content
# programmatic-seo skill for salary page updates
```

### SEO Improvements
```bash
# Just discuss SEO and relevant skills activate:
# - seo-audit for technical checks
# - programmatic-seo for salary pages
# - schema-markup for structured data
# - analytics-tracking for measurement
```

---

## File Structure

```
.claude/
├── commands/
│   ├── audit.md       # Code review
│   ├── cleanup.md     # Housekeeping
│   ├── debug.md       # Debugging
│   ├── finance.md     # UK tax compliance
│   ├── plan.md        # Architecture
│   ├── security.md    # Security review
│   └── test.md        # Testing
└── skills/
    ├── accessibility/       # WCAG 2.2 AA
    ├── analytics-tracking/  # GA4, tracking
    ├── competitor-alternatives/ # Comparison pages
    ├── content-marketing/   # Blog, social
    ├── copy-editing/        # Seven sweeps editing
    ├── copywriting/         # Landing page copy
    ├── free-tool-strategy/  # Engineering as marketing
    ├── marketing-ideas/     # 140 growth tactics
    ├── marketing-psychology/ # Mental models
    ├── nextjs-best-practices/ # Modern patterns
    ├── page-cro/            # Conversion
    ├── performance/         # Core Web Vitals
    ├── pricing-strategy/    # Monetization
    ├── programmatic-seo/    # Salary pages
    ├── schema-markup/       # Structured data
    ├── seo-audit/           # Technical SEO
    ├── social-content/      # Twitter/LinkedIn
    ├── ui-design/           # Design system audit
    └── vercel-react-best-practices/ # 45 Vercel perf rules
```

---

## Priorities Covered

| Priority | How It's Covered |
|----------|------------------|
| **Security** | `/security` command + skills auto-activate |
| **Coding Standards** | `nextjs-best-practices` skill |
| **SEO** | `seo-audit`, `programmatic-seo`, `schema-markup` skills |
| **Marketing/Analytics** | `content-marketing`, `analytics-tracking`, `page-cro` skills |

---

## Adding New Skills

Create a new directory with `SKILL.md`:

```markdown
---
name: skill-name
description: When this skill should activate...
---

# Skill Title

Expert knowledge content here...
```
