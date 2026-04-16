# Skills & Commands System

A practical guide to using PayeTax's commands and agents-native skills.

## Overview

- **Commands** = explicit workflows you invoke (e.g. `/audit`)
- **Skills** = knowledge packs you load before doing a task (e.g. SEO, copy, CRO)
- **Layering model**:
  - upstream methodology in `.agents/skills/*/SKILL.md`
  - shared product context in `.agents/product-marketing-context.md`
  - shared repo/project constraints in `.agents/skills/payetax-context/SKILL.md`
- We do **not** maintain duplicate "vanilla + custom" skill files side-by-side.

## Where They Live

- Commands: `.claude/commands/*.md`
- Skills: `.agents/skills/*/SKILL.md`
- Tools: `.claude/tools/` (registry, integration guides, CLI scripts)
- Versions: `.agents/skills/VERSIONS.md`
- Run history: `.agents/skills/RUN_HISTORY.md`

## How To Use In Codex (Terminal)

Commands and skills are not auto-loaded. You must explicitly load the file and then ask for the task.

**Command pattern:**

```bash
Read .claude/commands/audit.md, then /audit calculator
```

**Skill pattern:**

```bash
Read .agents/skills/seo-audit/SKILL.md, then audit the salary pages
```

You can combine multiple skills:

```bash
Read .agents/skills/copywriting/SKILL.md and .agents/skills/marketing-psychology/SKILL.md,
then write homepage hero copy
```

## Commands (Installed)

| Command | Purpose | Example |
| --- | --- | --- |
| `/audit` | Deep code/architecture audit | `/audit calculator` |
| `/cleanup` | Find duplicates/orphans/junk | `/cleanup components` |
| `/debug` | Systematic debugging workflow | `/debug salary page 404` |
| `/security` | OWASP security review | `/security api` |
| `/finance` | UK tax accuracy (HMRC verification) | `/finance ni` |
| `/compliance` | UK GDPR + PECR + ASA/CAP audit | `/compliance` |

Planning and test-first workflows now live in skills rather than slash commands: `design-an-interface`, `prd-to-issues`, and `tdd`.

## Skills (33 Installed)

### Shared Context

| Skill | Use When | Example |
| --- | --- | --- |
| `payetax-context` | Apply PayeTax-specific calculator, privacy, and trust constraints before other marketing skills | "Load PayeTax constraints before a CRO audit" |

### Code & Quality

| Skill | Use When | Example |
| --- | --- | --- |
| `engineering` | Next.js/React/TS performance patterns | "Review LCP + INP issues on homepage" |
| `frontend-design` | Visual redesign, UI polish, stronger page/component identity | "Redesign the homepage hero so it feels distinct" |
| `tdd` | Red/Green/Refactor test-first workflow | "Fix this regression with TDD" |
| `design-an-interface` | Compare module/API shape options before coding | "Design the director engine interface in 3 ways" |
| `accessibility` | WCAG 2.2 AA, a11y audits | "Check calculator keyboard nav + aria-live" |

### Planning & Delivery

| Skill | Use When | Example |
| --- | --- | --- |
| `prd-to-issues` | Break PRDs into vertical slices with clear dependencies | "Turn this homepage redesign PRD into execution-ready issues" |

### SEO & Content

| Skill | Use When | Example |
| --- | --- | --- |
| `seo-audit` | Technical/on-page SEO audit | "Audit salary pages for canonical issues" |
| `ai-seo` | AI search optimisation, AI Overviews, citations | "Optimise content for ChatGPT/Perplexity" |
| `content-strategy` | Topic clusters, content planning | "Plan a 3-month blog cluster" |
| `programmatic-seo` | Scaled page generation | "Expand salary pages to new bands" |
| `schema-markup` | JSON-LD/structured data | "Add FAQ schema to salary pages" |
| `analytics-tracking` | GA4/Vercel event tracking | "Define events for calculator completion" |
| `competitor-alternatives` | Vs/alternative page strategy | "Outline PayeTax vs GOV.UK page" |

### Copy & Creative

| Skill | Use When | Example |
| --- | --- | --- |
| `copywriting` | Writing new marketing copy | "Write new hero + CTA copy" |
| `copy-editing` | Editing existing copy | "Edit /about page copy" |
| `ad-creative` | Ad copy variations, headlines | "Generate RSA headlines for Google Ads" |
| `cold-email` | B2B cold outreach sequences | "Write a 3-touch cold email sequence" |
| `social-content` | Social posts or calendars | "Draft a LinkedIn post about £100k trap" |

### Conversion & Growth

| Skill | Use When | Example |
| --- | --- | --- |
| `page-cro` | Page-level conversion optimisation | "Improve calculator completion on mobile" |
| `form-cro` | Form optimisation | "Reduce friction on email capture form" |
| `onboarding-cro` | First-visit experience | "Improve WelcomeDialog activation flow" |
| `popup-cro` | Dialogs and banners | "Optimise exit-intent email popup" |
| `ab-test-setup` | Experiment design | "Design an A/B test for CTA copy" |
| `churn-prevention` | Retention and dunning | "Build a cancel flow with save offers" |

### Marketing & Growth

| Skill | Use When | Example |
| --- | --- | --- |
| `marketing-ideas` | Growth idea generation | "Give 10 promo ideas for tax-year change" |
| `customer-research` | VOC, persona, and community research | "Synthesize Reddit and G2 feedback into themes" |
| `community-marketing` | Community-led growth, advocates, and owned community strategy | "Plan a Reddit/Discord-style community motion around tax-year questions" |
| `marketing-psychology` | Persuasion/behavior models | "Improve conversion using loss aversion" |
| `launch-strategy` | Product launches | "Plan a feature release announcement" |
| `free-tool-strategy` | Free tool growth strategy | "Optional email capture without hurting SEO" |
| `email-sequence` | Email sequences and campaigns | "Design a welcome drip sequence" |
| `product-marketing-context` | Shared context doc | "Set up positioning for all skills" |

## Notes

- If a command or skill is mentioned but not installed under its canonical path (`.claude/commands/` for commands, `.agents/skills/` for skills), it can't be used until added.
- If you want to make skills available globally in Codex, add them to your `AGENTS.md` list with name + description + path.
- Skills are primarily sourced from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), with selected engineering workflow skills adapted from [mattpocock/skills](https://github.com/mattpocock/skills) — see `.agents/skills/VERSIONS.md` for sync history.
- Skill usage dates live in `.agents/skills/RUN_HISTORY.md`. Historical usage before that tracker exists should stay `Not tracked yet` unless it can be verified.
- Canonical keep/sync lists live in `.agents/skills/.profiles/` and should be updated there instead of being re-hardcoded in maintenance scripts.
- Maintenance commands:
  - `bun run skills:check`
  - `bun run skills:sync`
