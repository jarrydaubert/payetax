# AGENTS.md - PayeTax

This file defines how coding agents should work in this repo. Keep it short and keep it true.

## Purpose

PayeTax is a UK PAYE tax calculator focused on accuracy, privacy, and clear user outcomes.

## Priorities

- Accuracy first: calculations must match HMRC rules.
- Single source of truth: tax rates live in `src/constants/taxRates.ts`.
- Test behavior: cover user-visible outcomes over implementation details.
- Accessibility + performance: ship fast and inclusive UI.

## Source Of Truth

- Tax rates: `src/constants/taxRates.ts`
- Calculator logic: `src/lib/taxCalculator.ts`
- Director Intelligence logic: `src/lib/tax/`

## Before You Change Code

- Check existing patterns in the codebase.
- Verify any tax changes against `src/constants/taxRates.ts`.
- Avoid hardcoding tax figures in UI/MDX; reference `taxRates.ts`.
- Consider accessibility impacts.
- Avoid leaking server env vars into client components.

## After You Change Code

- Run `bun run fix-all` when you touch TS/JS/CSS.
- Run `bun run test:no-coverage` (or the smallest relevant test for your change).
- Bugs: add a regression test when it fits.
- If you cannot run tests, say so explicitly in the PR/summary.

## Security Checks (When Relevant)

- Scan for hardcoded secrets in `src/`.
- Validate user input.
- Do not log sensitive user data.

## Tech Stack

- Next.js, React, TypeScript, Tailwind CSS
- Zod, Zustand
- Jest, Playwright
- Biome, Bun

## Quick Commands

```bash
bun run dev                 # Start dev server
bun run fix-all             # Format, lint, typecheck
bun run test:no-coverage    # Fast tests
bun run test                # Full tests with coverage
bun run test:e2e            # Playwright E2E
bun run bundle:analyze      # Bundle analysis
bun run linear:me           # View Linear issues
```

## More Docs

See `CLAUDE.md` and `docs/guides/` for details:
- `TESTING.md`
- `ARCHITECTURE.md`
- `LINEAR.md`

## Skills (Agent Reference)

All skills have `## PayeTax Context` sections with project-specific guidance, file paths, and what does/doesn't apply.

Skill docs live in `.claude/skills/`. Version history: `.claude/skills/VERSIONS.md`.

### SEO & Content
- `seo-audit` — full-site SEO audit (incl. AI bot access, llms.txt)
- `programmatic-seo` — salary pages, template-based SEO at scale
- `schema-markup` — JSON-LD structured data
- `content-strategy` — blog planning, topic clusters, content pillars
- `competitor-alternatives` — vs pages, alternative pages

### Copy & Creative
- `copywriting` — page copy, headlines, CTAs
- `copy-editing` — editing passes on existing copy
- `social-content` — LinkedIn, Twitter/X, Reddit content

### Conversion & UX
- `page-cro` — page-level conversion optimisation
- `form-cro` — calculator inputs, email forms, newsletter signup
- `onboarding-cro` — first-visit experience, WelcomeDialog
- `popup-cro` — dialogs and banners (WelcomeDialog, EmailResultsDialog, CookieBanner, PWA)
- `ab-test-setup` — experiment design and statistical rigour

### Marketing & Growth
- `marketing-ideas` — 139 categorised tactics, filtered for PayeTax
- `launch-strategy` — feature releases, tax calendar events
- `free-tool-strategy` — new calculator planning and evaluation
- `marketing-psychology` — mental models and behavioural science
- `email-sequence` — Kit newsletter + Resend transactional email
- `product-marketing-context` — shared context doc for all skills

### Engineering & Analytics
- `engineering` — Next.js, React, TypeScript, performance
- `accessibility` — WCAG 2.2 AA compliance
- `analytics-tracking` — GA4, GTM, Vercel Analytics, event tracking

### Slash Commands
- `/debug` — systematic debugging session
- `/audit` — deep code/architecture audit
- `/finance` — UK tax specialist for HMRC verification
- `/compliance` — compliance auditor
- `/plan` — architecture planning session
- `/cleanup` — find duplicates, orphans, junk
- `/test` — coverage gaps, write/review tests
- `/security` — OWASP web security review

## Tools & Integrations

- Tool registry: `.claude/tools/REGISTRY.md`
- Integration guides: `.claude/tools/integrations/` (Kit, Resend, Ahrefs, GA4, etc.)

## Email Infrastructure

Split provider model (see `docs/guides/RESEND.md`):
- **Kit** — newsletter (subscribe/unsubscribe, broadcasts, automations)
- **Resend** — transactional (PAYE results, director results, referral leads, feedback)
