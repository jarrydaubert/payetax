# PayeTax Claude Configuration

> Optimized commands and skills for PayeTax development.
>
> **Full documentation:** See `docs/SKILLS_AND_COMMANDS.md` for the canonical guide.

## Philosophy

**Commands** = explicit workflow actions (you invoke them)  
**Skills** = contextual knowledge (load before a task)

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

## Skills (Installed)

Skills provide expert knowledge that you load before a task.

### Code & Quality

| Skill | Use When |
| --- | --- |
| `engineering` | Next.js/React/TypeScript performance and patterns |
| `accessibility` | WCAG 2.2 AA, screen readers, keyboard nav |

### Marketing & Copy

| Skill | Use When |
| --- | --- |
| `copywriting` | Writing new marketing copy |
| `copy-editing` | Editing or polishing existing copy |
| `marketing-ideas` | Growth idea generation |
| `marketing-psychology` | Persuasion and behavioral models |
| `social-content` | LinkedIn/Twitter content |

### SEO & Content

| Skill | Use When |
| --- | --- |
| `seo-audit` | Technical/on-page SEO audit |
| `content-strategy` | Topic clusters, content planning |
| `programmatic-seo` | Scaled page generation |
| `schema-markup` | JSON-LD and rich snippets |
| `analytics-tracking` | GA4/Vercel events and measurement |

### Conversion & Growth

| Skill | Use When |
| --- | --- |
| `page-cro` | Conversion optimization |
| `competitor-alternatives` | "vs" / alternatives pages |
| `free-tool-strategy` | Free tool growth strategy |
| `pricing-strategy` | Monetization and packaging |

---

## When Skills Activate (Examples)

> "How should I optimize LCP on the homepage?"  
→ `engineering`

> "Audit the calculator for WCAG issues"  
→ `accessibility`

> "Write hero copy for the new tool"  
→ `copywriting`

> "Plan a 3-month blog cluster for self-employed tax"  
→ `content-strategy`

> "Review salary pages for canonical/meta issues"  
→ `seo-audit`

> "Create a PayeTax vs GOV.UK page outline"  
→ `competitor-alternatives`

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
└── skills/
    ├── accessibility/
    ├── analytics-tracking/
    ├── competitor-alternatives/
    ├── content-strategy/
    ├── copy-editing/
    ├── copywriting/
    ├── engineering/
    ├── free-tool-strategy/
    ├── marketing-ideas/
    ├── marketing-psychology/
    ├── page-cro/
    ├── pricing-strategy/
    ├── programmatic-seo/
    ├── schema-markup/
    ├── seo-audit/
    └── social-content/
```
