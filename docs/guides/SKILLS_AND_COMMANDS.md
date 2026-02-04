# Skills & Commands System

A practical guide to using the PayeTax commands and skills stored in `.claude/`. ie ./.claude/skills/copywriting/SKILL.md (note the hidden .claude directory, not claude)

## Overview

- **Commands** = explicit workflows you invoke (e.g. `/audit`)
- **Skills** = knowledge packs you load before doing a task (e.g. SEO, copy, CRO)

## Where They Live

- Commands: `.claude/commands/*.md`
- Skills: `.claude/skills/*/SKILL.md`

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
| `/plan` | Architecture planning and design | `/plan self-employed calculator tool page` |
| `/audit` | Deep code/architecture audit | `/audit calculator` |
| `/cleanup` | Find duplicates/orphans/junk | `/cleanup components` |
| `/debug` | Systematic debugging workflow | `/debug salary page 404` |
| `/test` | Test gaps and test design | `/test tax-calculations` |
| `/security` | OWASP security review | `/security api` |
| `/finance` | UK tax accuracy (HMRC verification) | `/finance ni` |
| `/compliance` | UK GDPR + PECR + ASA/CAP audit | `/compliance` |

## Skills (Installed)

### Code & Quality

| Skill | Use When | Example |
| --- | --- | --- |
| `engineering` | Next.js/React/TS performance patterns | "Review LCP + INP issues on homepage" |
| `accessibility` | WCAG 2.2 AA, a11y audits | "Check calculator keyboard nav + aria-live" |

### Marketing & Copy

| Skill | Use When | Example |
| --- | --- | --- |
| `copywriting` | Writing new marketing copy | "Write new hero + CTA copy" |
| `copy-editing` | Editing existing copy | "Edit /about page copy" |
| `marketing-ideas` | Growth idea generation | "Give 10 promo ideas for tax-year change" |
| `marketing-psychology` | Persuasion/behavior models | "Improve conversion using loss aversion" |
| `social-content` | Social posts or calendars | "Draft a LinkedIn post about £100k trap" |

### SEO & Content

| Skill | Use When | Example |
| --- | --- | --- |
| `seo-audit` | Technical/on-page SEO audit | "Audit salary pages for canonical issues" |
| `content-strategy` | Topic clusters, content planning | "Plan a 3-month blog cluster" |
| `programmatic-seo` | Scaled page generation | "Expand salary pages to new bands" |
| `schema-markup` | JSON-LD/structured data | "Add FAQ schema to salary pages" |
| `analytics-tracking` | GA4/Vercel event tracking | "Define events for calculator completion" |

### Conversion & Growth

| Skill | Use When | Example |
| --- | --- | --- |
| `page-cro` | Conversion optimization | "Improve calculator completion on mobile" |
| `competitor-alternatives` | Vs/alternative page strategy | "Outline PayeTax vs GOV.UK page" |
| `free-tool-strategy` | Free tool growth strategy | "Optional email capture without hurting SEO" |
| `pricing-strategy` | Monetization packaging | "Design a premium tier for comparisons" |

## Notes

- If a command or skill is mentioned but not installed under `.claude/`, it can’t be used until added.
- If you want to make skills available globally in Codex, add them to your `AGENTS.md` list with name + description + path.

