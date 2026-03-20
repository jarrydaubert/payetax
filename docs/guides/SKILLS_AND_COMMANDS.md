# Skills & Commands System

A practical guide to using the PayeTax commands and skills stored in `.claude/`. ie ./.claude/skills/copywriting/SKILL.md (note the hidden .claude directory, not claude)

## Overview

- **Commands** = explicit workflows you invoke (e.g. `/audit`)
- **Skills** = knowledge packs you load before doing a task (e.g. SEO, copy, CRO)
- **Layering model** = one active `SKILL.md` per skill:
  - upstream methodology baseline
  - plus local `## PayeTax Context` rules
- We do **not** maintain duplicate "vanilla + custom" skill files side-by-side.

## Where They Live

- Commands: `.claude/commands/*.md`
- Skills: `.claude/skills/*/SKILL.md`
- Tools: `.claude/tools/` (registry, integration guides, CLI scripts)
- Versions: `.claude/skills/VERSIONS.md`
- Ops runbook: `docs/guides/MARKETING_SKILLS_RUNBOOK.md`
- Compatibility links for upstream `.agents` paths: `.agents/skills -> .claude/skills` and `.agents/product-marketing-context.md -> .claude/product-marketing-context.md`

## How To Use In Codex (Terminal)

Commands and skills are not auto-loaded. You must explicitly load the file and then ask for the task.

**Command pattern:**

```bash
Read .claude/commands/audit.md, then /audit calculator
```

**Skill pattern:**

```bash
Read .claude/skills/seo-audit/SKILL.md, then audit the salary pages
```

You can combine multiple skills:

```bash
Read .claude/skills/copywriting/SKILL.md and .claude/skills/marketing-psychology/SKILL.md,
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

Planning and test-first workflows now live in skills rather than slash commands:
`design-an-interface`, `prd-to-issues`, and `tdd`.

## Skills (30 Installed)

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
| `prd-to-issues` | Break PRDs into vertical slices with clear dependencies | "Turn this tax pack PRD into execution-ready issues" |

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
| `marketing-psychology` | Persuasion/behavior models | "Improve conversion using loss aversion" |
| `launch-strategy` | Product launches | "Plan a feature release announcement" |
| `free-tool-strategy` | Free tool growth strategy | "Optional email capture without hurting SEO" |
| `email-sequence` | Email sequences and campaigns | "Design a welcome drip sequence" |
| `product-marketing-context` | Shared context doc | "Set up positioning for all skills" |

## Notes

- If a command or skill is mentioned but not installed under `.claude/`, it can't be used until added.
- If you want to make skills available globally in Codex, add them to your `AGENTS.md` list with name + description + path.
- Skills are primarily sourced from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), with selected engineering workflow skills adapted from [mattpocock/skills](https://github.com/mattpocock/skills) — see `.claude/skills/VERSIONS.md` for sync history.
