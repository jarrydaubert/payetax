# PayeTax Claude Configuration

> Optimized commands and skills for PayeTax development.
>
> **Full documentation:** See `docs/guides/SKILLS_AND_COMMANDS.md` for the canonical guide.

## Philosophy

**Commands** = explicit workflow actions (you invoke them)
**Skills** = contextual knowledge (load before a task)
**Skill structure** = one active `SKILL.md` per skill, with upstream methodology + `## PayeTax Context` custom layer.

---

## Commands (8)

| Command | Purpose | Use When |
| --- | --- | --- |
| `/plan` | Architecture planning | Designing features, major changes |
| `/audit` | Deep code review | Reviewing systems, refactoring |
| `/cleanup` | Project housekeeping | Finding duplicates, orphans, junk |
| `/debug` | Systematic debugging | Investigating issues |
| `/test` | Test engineering | Writing tests, coverage gaps |
| `/security` | Security review | OWASP checklist, vulnerability audit |
| `/finance` | UK tax compliance | Verifying HMRC accuracy |
| `/compliance` | UK GDPR + PECR + ASA/CAP audit | Privacy, cookie consent, claims |

### Usage Examples

```bash
# Plan a new feature
/plan self-employed calculator

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
/security api

# Verify HMRC compliance
/finance scotland

# Privacy & consent compliance audit
/compliance
```

---

## Skills (29 installed)

Skills provide expert knowledge that you load before a task.

### Code & Quality

| Skill | Use When |
| --- | --- |
| `engineering` | Next.js/React/TypeScript performance and patterns |
| `tdd` | Test-driven delivery with bug-first Red/Green/Refactor loops |
| `design-an-interface` | Compare API/module interface options before implementation |
| `accessibility` | WCAG 2.2 AA, screen readers, keyboard nav |

### Planning & Delivery

| Skill | Use When |
| --- | --- |
| `prd-to-issues` | Break PRDs into vertical slices with dependencies and acceptance criteria |

### SEO & Content

| Skill | Use When |
| --- | --- |
| `seo-audit` | Technical/on-page SEO audit |
| `ai-seo` | AI search optimisation (AEO/GEO/LLMO), AI Overviews, citations |
| `content-strategy` | Topic clusters, content planning |
| `programmatic-seo` | Scaled page generation |
| `schema-markup` | JSON-LD and rich snippets |
| `analytics-tracking` | GA4/Vercel events and measurement |
| `competitor-alternatives` | "vs" / alternatives pages |

### Copy & Creative

| Skill | Use When |
| --- | --- |
| `copywriting` | Writing new marketing copy |
| `copy-editing` | Editing or polishing existing copy |
| `ad-creative` | Ad copy variations, headlines, platform-specific creative |
| `cold-email` | B2B cold outreach emails and follow-up sequences |
| `social-content` | LinkedIn/Twitter content |

### Conversion & Growth

| Skill | Use When |
| --- | --- |
| `page-cro` | Page-level conversion optimisation |
| `form-cro` | Calculator inputs, email forms, newsletter signup |
| `onboarding-cro` | First-visit experience, WelcomeDialog |
| `popup-cro` | Dialogs and banners (WelcomeDialog, EmailResultsDialog, CookieBanner, PWA) |
| `ab-test-setup` | Experiment design and statistical rigour |
| `churn-prevention` | Retention, cancel flows, dunning, win-back |

### Marketing & Growth

| Skill | Use When |
| --- | --- |
| `marketing-ideas` | Growth idea generation |
| `marketing-psychology` | Persuasion and behavioral models |
| `launch-strategy` | Feature releases, tax calendar events |
| `free-tool-strategy` | Free tool growth strategy |
| `email-sequence` | Kit newsletter + Resend transactional email |
| `product-marketing-context` | Shared context doc for all skills |

---

## When Skills Activate (Examples)

> "How should I optimize LCP on the homepage?"
→ `engineering`

> "Audit the calculator for WCAG issues"
→ `accessibility`

> "Let's do this test-first and keep each change tiny"
→ `tdd`

> "Give me 3 different module interface options before coding"
→ `design-an-interface`

> "Write hero copy for the new tool"
→ `copywriting`

> "Plan a 3-month blog cluster for self-employed tax"
→ `content-strategy`

> "Review salary pages for canonical/meta issues"
→ `seo-audit`

> "Create a PayeTax vs GOV.UK page outline"
→ `competitor-alternatives`

> "Optimise content for AI search engines"
→ `ai-seo`

---

## Workflow Examples

### Feature Development
```bash
/plan self-employed calculator
# implement
/finance
/test tax-calculations
```

### Tax Year Update (April)
```bash
/finance
/test tax-calculations
# content-strategy for tax-year announcement post
```

### SEO Improvements
```bash
# load seo-audit + programmatic-seo + schema-markup
# audit or expand salary pages
```

---

## File Structure

```
.claude/
├── commands/
│   ├── audit.md
│   ├── cleanup.md
│   ├── compliance.md
│   ├── debug.md
│   ├── finance.md
│   ├── plan.md
│   ├── security.md
│   └── test.md
├── skills/
│   ├── ab-test-setup/
│   ├── accessibility/
│   ├── ad-creative/
│   ├── ai-seo/
│   ├── analytics-tracking/
│   ├── churn-prevention/
│   ├── cold-email/
│   ├── competitor-alternatives/
│   ├── content-strategy/
│   ├── copy-editing/
│   ├── copywriting/
│   ├── design-an-interface/
│   ├── email-sequence/
│   ├── engineering/
│   ├── form-cro/
│   ├── free-tool-strategy/
│   ├── launch-strategy/
│   ├── marketing-ideas/
│   ├── marketing-psychology/
│   ├── onboarding-cro/
│   ├── page-cro/
│   ├── popup-cro/
│   ├── prd-to-issues/
│   ├── product-marketing-context/
│   ├── programmatic-seo/
│   ├── schema-markup/
│   ├── seo-audit/
│   ├── social-content/
│   ├── tdd/
│   └── VERSIONS.md
└── tools/
    ├── REGISTRY.md
    ├── clis/          (52 vendor CLI scripts)
    └── integrations/  (58 integration guides)
```
