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
- Director guide logic: `src/lib/tax/`

## Before You Change Code

- Check existing patterns in the codebase.
- Verify any tax changes against `src/constants/taxRates.ts`.
- Avoid hardcoding tax figures in UI/MDX; reference `taxRates.ts`.
- Consider accessibility impacts.
- Avoid leaking server env vars into client components.

## After You Change Code

- Run `bun run fix-all` when you touch TS/JS/CSS.
- Run `bun run test:no-coverage` (or the smallest relevant test for your change).
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

Skill docs live in `.claude/skills/`:
- `.claude/skills/ab-test-setup/SKILL.md`
- `.claude/skills/accessibility/SKILL.md`
- `.claude/skills/analytics-tracking/SKILL.md`
- `.claude/skills/competitor-alternatives/SKILL.md`
- `.claude/skills/content-strategy/SKILL.md`
- `.claude/skills/copy-editing/SKILL.md`
- `.claude/skills/copywriting/SKILL.md`
- `.claude/skills/email-sequence/SKILL.md`
- `.claude/skills/engineering/SKILL.md`
- `.claude/skills/form-cro/SKILL.md`
- `.claude/skills/free-tool-strategy/SKILL.md`
- `.claude/skills/launch-strategy/SKILL.md`
- `.claude/skills/marketing-ideas/SKILL.md`
- `.claude/skills/marketing-psychology/SKILL.md`
- `.claude/skills/onboarding-cro/SKILL.md`
- `.claude/skills/page-cro/SKILL.md`
- `.claude/skills/paid-ads/SKILL.md`
- `.claude/skills/paywall-upgrade-cro/SKILL.md`
- `.claude/skills/popup-cro/SKILL.md`
- `.claude/skills/pricing-strategy/SKILL.md`
- `.claude/skills/product-marketing-context/SKILL.md`
- `.claude/skills/programmatic-seo/SKILL.md`
- `.claude/skills/referral-program/SKILL.md`
- `.claude/skills/schema-markup/SKILL.md`
- `.claude/skills/seo-audit/SKILL.md`
- `.claude/skills/signup-flow-cro/SKILL.md`
- `.claude/skills/social-content/SKILL.md`
