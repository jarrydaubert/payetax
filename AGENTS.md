# AGENTS.md: PayeTax

The authoritative repository guidance for Codex, Claude Code and contributors. Keep shared rules here; `CLAUDE.md` only imports this file. Task commands and skills below must follow this contract.

## What This Is

PayeTax is Jarryd Aubert's UK tax-calculator R&D project. It exists to exercise deterministic calculation correctness, edge-case handling, API hardening, observability, deployment hygiene, and clear public documentation.

It is not a commercial growth site. Keep the product useful, accurate, and simple.

## Read First

1. Read `docs/PROJECT_STATE.md` for the current product, architecture, verification and search handover.
2. Read `docs/BACKLOG.md` for unresolved work only.
3. Follow dated reports and pull requests for supporting evidence and completed-work history.
4. For statutory truth, verify canonical policy data against current primary official sources.
5. For **blog writing or review**, follow `docs/blog/README.md` (including the voice guide and combined accuracy/readability standard), without weakening source checks or the existing release rules.

## Engineering Approach

Use proportionate engineering: prefer the simplest complete, maintainable solution that meets the requirements. Follow established patterns and avoid speculative abstractions, dependencies, infrastructure or unrelated refactoring.

Before editing, inspect Git state, project guidance and affected code. Work on an appropriate branch without disturbing unrelated changes.

Implement the change, verify the relevant behaviour with tests and direct inspection where appropriate, and update documentation only when necessary. Commit and push only when requested (including when needed to open a requested PR).

Match verification effort to risk. Financial correctness, security and consequential user interactions require stronger evidence than routine changes.

Report what changed, what passed, what remains unverified and any meaningful trade-offs. Obtain independent review before merging. Merge and deployment each require explicit maintainer approval; passing checks or review does not grant it.

## Scope Guardrails

- Keep the main calculator, tools, Director Intelligence, blog, email-results, PWA, GA4, Sentry, Brevo API email, and Upstash-backed rate limiting.
- Do not reintroduce growth page families, competitor-style SEO pages, partner lead capture, or mailing-list plumbing unless explicitly requested.
- Keep existing Vercel Web Analytics, Vercel Speed Insights and consent-based GA4; do not add analytics vendors unless explicitly requested.
- Do not reintroduce the feedback feature or external issue-tracker integrations unless explicitly requested.
- Do not invent tax behaviour, provider support, production status, usage metrics, or security controls.
- Do not commit secrets.

## Commands

```bash
bun install --frozen-lockfile
bun run check:repo
bun run test:no-coverage
bun run build:ci
bun run audit:deps
```

Use the smallest relevant check while developing, then run `bun run check:repo` and `bun run build:ci` before committing broad changes. Use `bun run build:release` only when validating release behaviour that needs Sentry source maps.

## Verification And Agent Workflows

Use existing scripts and bounded tasks with explicit stop conditions. Slash commands, loops and scheduling features depend on the client; they are not repository commands or merge permission.

- **Verification:** for any UI change, use the `verify-frontend-change` skill (`.claude/skills/verify-frontend-change/SKILL.md`). Do not report UI work done on a successful edit alone.
- **Tax correctness:** for changes to calculation logic or expected tax outputs, run `bun run test:no-coverage` (including the hand-derived independent PAYE fixtures in `src/test/payeVerificationFixtures/`) **and** `bun run test:e2e:golden` for browser/result regression. Derive expectations independently using current primary official sources and the relevant tax year, region, pay basis and rounding. Golden-master expectations are generated from the production engine, so they are not a correctness oracle on their own. A focused development check is `bun run test:no-coverage --runTestsByPath src/lib/__tests__/taxCalculator.verification.test.ts`; it does not replace the broader checks required for a completed calculation change.
- **PR follow-up:** address in-scope findings and failing checks, then stop for maintainer review; never merge or enable auto-merge as a loop stop condition.
- **Upkeep:** when requested, run `bun run check:rate-freshness` and `bun run audit:deps`; report findings without automatically upgrading or merging dependencies.

See `.claude/commands/README.md` for the checked-in workflow inventory and client-loading notes. Use only skills actually available in the session; do not assume removed or personal installations exist.

## CI And Repo Quality

The repo follows a lean AI-assisted quality standard:

**AI-assisted code is allowed. Unverified AI-assisted code is not.**

The hard gate should stay small and deterministic:

- install from lockfile
- lint and repo checks
- typecheck
- tests where configured
- production build

Do not add visual-regression, Lighthouse, flake-audit, governance, release, or marketing-audit workflows by default.

## Environment

Use `.env.template` as the source of local env names. Never commit `.env.local`.

Production secrets belong in Vercel project settings:

- Brevo API values for email-results flows
- Upstash Redis for distributed rate limiting
- Sentry values for monitoring and source maps
- GA4 measurement id for basic analytics

If a Vercel CLI command cannot retrieve project settings, follow `docs/guides/OPERATIONS.md`; do not relink a project or change remote settings without explicit authorisation.

## Editing Rules

- Prefer existing patterns in `src/`, `scripts/`, and `docs/`.
- Edit source files, not generated output, unless the repo clearly treats the file as committed source.
- Keep docs aligned with code in the same change.
- Keep evergreen docs useful and stable; put dated run evidence in PRs or `docs/reports/*`.
- Evidence relied upon for a PR must be committed under `docs/reports/` or attached to the PR; it must not be available exclusively through a local or scratch path. If raw artifacts are too large or sensitive, preserve a useful summary and a SHA-256 hash of the original artifact in the report or PR attachment, without committing sensitive data. Distinguish independently accessible results from maintainer reports and record the relevant ref, command and limitations.
- Verify commands before claiming they pass.
- When touching frontend UI, inspect and interact with the changed route locally as required by the verification skill; report blocked checks rather than claiming completion.
- For email, privacy, security, and tax claims, confirm the implementation before changing wording.

## Current Public Surface

- Main PAYE calculator
- Tax tools hub and tool pages
- Director Intelligence calculator
- Blog and category pages
- About, privacy, compliance, install
- API routes for sending results and operational rate-limit health

## Pull Request Expectations

Before merging non-trivial code or agent-guidance changes, obtain a fresh-context review from a reviewer or agent that did not write the change and address or note its findings. Use the review capability available in the client; no particular slash command is required.

For code changes, report:

- what changed
- commands run
- pass/fail status
- review findings addressed or deferred
- any unverified follow-up

For CI, docs, or repo-control changes, report:

- workflows or checks affected
- branch-protection implications
- environment or secret changes
- why the change is a practical safety net rather than scaffolding
