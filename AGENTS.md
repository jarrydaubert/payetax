# AGENTS.md - PayeTax

This file is the canonical agent contract for this repo.
`CLAUDE.md` defers to this file.

## Purpose

PayeTax is a UK PAYE tax calculator focused on accuracy, privacy, and clear user outcomes.

## Priorities

- Accuracy first: calculations must match HMRC rules.
- Single source of truth: tax rates live in `src/constants/taxRates.ts`.
- Test behavior: cover user-visible outcomes over implementation details.
- Accessibility + performance: ship fast and inclusive UI.
- Tax Pack status guardrail: Tax Pack is planned (not live); by default assess shipped flows only and treat Tax Pack work as deferred unless explicitly requested.

## Source Of Truth

- Tax rates: `src/constants/taxRates.ts`
- Calculator logic: `src/lib/taxCalculator.ts`
- Director Intelligence logic: `src/lib/tax/`
- Open work only: `docs/BACKLOG.md`
- Testing standard: `docs/guides/TESTING.md`
- Ops/dev workflow: `docs/guides/OPS_RUNBOOK.md`
- Documentation rules: `docs/DOCS_POLICY.md`

## Working Rules

- Preserve existing architecture unless a change is required for accuracy, safety, reliability, or maintainability.
- Keep important behavior testable: explicit inputs/outputs, injectable dependencies where practical, and assertions against real user-visible or business-visible outcomes.
- Do not log sensitive user data or leak server env vars into client components.
- Keep evergreen docs free of TODOs, progress markers, and stale status; open work belongs in `docs/BACKLOG.md`.
- Prefer a small number of high-signal tests over broad low-signal coverage.

## Before You Change Code

- Check existing patterns in the codebase.
- Verify any tax changes against `src/constants/taxRates.ts`.
- Avoid hardcoding tax figures in UI/MDX; reference `taxRates.ts`.
- Consider accessibility impacts.
- Validate user input and privacy/security implications.

## Required Validation Before Handoff

Run what is relevant to the change:

```bash
bun run fix-all
bun run test:no-coverage
```

When the change affects critical user journeys, layout, calculator outputs, or release-sensitive behavior, also run the smallest relevant higher-level gate (for example `bun run test:e2e:critical`, `bun run harness:local`, or a targeted Playwright/Jest command).

If workflow/process changes, update `docs/guides/OPS_RUNBOOK.md`.
If documentation expectations change, update `docs/DOCS_POLICY.md` or `docs/guides/TESTING.md` as appropriate.
If any required validation cannot be run, state that clearly.

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
bun run check:repo          # Read-only repo verification gate
bun run harness:local       # Repo gate + quick tests + build
bun run test:no-coverage    # Fast tests
bun run test                # Full tests with coverage
bun run test:e2e            # Playwright E2E
bun run bundle:analyze      # Bundle analysis
bun run check:env-contract  # Verify critical env/template/schema sync
bun run release:verify      # Fix, test, and build release gate
bun run linear:me           # View Linear issues
bun run gitlab:status       # GitLab project + MR + pipeline + release summary
bun run gitlab:mr:status    # Open MR for the current branch
bun run skills:check        # Check upstream sync status + local skill setup validation
bun run skills:sync         # Sync pinned marketing skills + apply PayeTax profile
bun run audit:gitlab:governance # Basic GitLab policy + CI usage audits
```

## More Docs

See `docs/README.md` and `docs/guides/` for detail:
- `TESTING.md`
- `SYSTEM_OVERVIEW.md`
- `LINEAR.md`
- `MARKETING_SKILLS_RUNBOOK.md`
- `OPS_RUNBOOK.md`

## Skills (Agent Reference)

All skills have `## PayeTax Context` sections with project-specific guidance, file paths, and what does/doesn't apply.

Skill docs live in `.claude/skills/` (with `.agents/skills/` compatibility link). Version history: `.claude/skills/VERSIONS.md`.

### SEO & Content
- `seo-audit` — full-site SEO audit (incl. AI bot access, llms.txt)
- `ai-seo` — AI search optimisation (AEO/GEO/LLMO), AI Overviews, citations
- `programmatic-seo` — salary pages, template-based SEO at scale
- `schema-markup` — JSON-LD structured data
- `content-strategy` — blog planning, topic clusters, content pillars
- `competitor-alternatives` — vs pages, alternative pages

### Copy & Creative
- `copywriting` — page copy, headlines, CTAs
- `copy-editing` — editing passes on existing copy
- `ad-creative` — ad copy variations, headlines, platform-specific creative
- `cold-email` — B2B cold outreach emails and follow-up sequences
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
- `churn-prevention` — retention, cancel flows, dunning, win-back
- `email-sequence` — Kit newsletter + Resend transactional email
- `product-marketing-context` — shared context doc for all skills

### Engineering & Analytics
- `engineering` — Next.js, React, TypeScript, performance
- `tdd` — test-driven development (Red/Green/Refactor) for regression-safe delivery
- `design-an-interface` — compare multiple interface/module designs before implementation
- `prd-to-issues` — break PRDs into vertical, testable execution slices
- `accessibility` — WCAG 2.2 AA compliance
- `analytics-tracking` — GA4, Vercel Analytics, Ahrefs, event tracking

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
- Integration guides: `.claude/tools/integrations/` (58 guides — Kit, Resend, Ahrefs, GA4, etc.)
- CLI tool scripts: `.claude/tools/clis/` (52 vendor scripts)

## Email Infrastructure

Split provider model (see `docs/guides/RESEND.md`):
- **Kit** — newsletter (subscribe/unsubscribe, broadcasts, automations)
- **Resend** — transactional (PAYE results, director results, referral leads, feedback)
