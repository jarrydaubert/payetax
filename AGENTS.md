# AGENTS.md: PayeTax

The authoritative repository guidance for Codex, Claude Code and contributors. Keep shared rules here; `CLAUDE.md` only imports this file. Task commands and skills below must follow this contract.

## What This Is

PayeTax is Jarryd Aubert's UK tax-calculator R&D project. It exists to exercise deterministic calculation correctness, edge-case handling, API hardening, observability, deployment hygiene, and clear public documentation.

It is not a commercial growth site. Keep the product useful, accurate, and simple.

## Read First

1. Open the assigned issue in the [PayeTax Linear project](https://linear.app/jgf-projects/project/payetax-ecec16170865); one clear sentence describing “done” suffices for routine work.
2. Inspect the affected code and tests, then consult only relevant guides: [work management](docs/guides/WORK_MANAGEMENT.md), [testing](docs/guides/TESTING.md), [operations](docs/guides/OPERATIONS.md), [product direction](docs/business/PRODUCT_DIRECTION.md), or [blog](docs/blog/README.md).
3. If Linear is unavailable and scope was not supplied, ask for a brief outcome. Dated reports are historical; check statutory claims against primary sources.

## Engineering Approach

Use proportionate engineering: prefer the simplest complete, maintainable solution that meets the requirements. Follow established patterns and avoid speculative abstractions, dependencies, infrastructure or unrelated refactoring.

Before editing, inspect Git state, project guidance and affected code. Work on an appropriate branch without disturbing unrelated changes.

Implement the change, verify the relevant behaviour with tests and direct inspection where appropriate, and update documentation only when necessary. Commit and push only when requested (including when needed to open a requested PR).

When GitHub CLI (`gh`) is available and authenticated, use it for GitHub operations where appropriate; never print authentication tokens. Report relevant PR and check links, and leave ongoing CI monitoring to the maintainer unless requested.

Tax correctness, security, privacy, user-data integrity and evidence-backed public claims take priority. Reconcile new verified risks with Linear's agreed implementation order; a historical audit severity alone does not establish a new delivery queue.

Match verification effort to risk. Financial correctness, security and consequential user interactions require stronger evidence than routine changes.

Summarise changes, checks and meaningful limitations in the PR. Use the risk-based review rule below. Merge and deployment each require explicit maintainer approval.

## Scope Guardrails

- Keep the main calculator, tools, Director Intelligence, blog, email-results, PWA, GA4, Sentry, Brevo API email, and Upstash-backed rate limiting.
- Do not reintroduce growth page families, competitor-style SEO pages, partner lead capture, or mailing-list plumbing unless explicitly requested.
- Keep existing Vercel Web Analytics, Vercel Speed Insights and consent-based GA4; do not add analytics vendors unless explicitly requested.
- Do not reintroduce the feedback feature or external issue-tracker integrations unless explicitly requested.
- Do not invent tax behaviour, provider support, production status, usage metrics, or security controls.
- Never commit secrets, tokens, raw calculator inputs, unredacted analytics payloads or personal data — in fixtures, logs or evidence.

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
- For production-facing PRs, bump `package.json` using the [SemVer policy](docs/guides/OPERATIONS.md#version-policy-and-tagging) and state the category in the PR. Run `bun run check-version --base origin/main` after fetching `main`; cache names are independent of app versions.
- Keep evergreen docs useful and stable; put dated run evidence in PRs or `docs/reports/*`.
- The PR, diff and CI are the normal record. Do not create separate evidence reports, hashes or Linear completion narratives by default; attach specialist evidence only when it materially helps review, without exposing sensitive data.
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

**Verify in proportion to risk; don't duplicate GitHub evidence in Linear.** The tier is based on affected code and behaviour, not the implementing agent's opinion.

- **Tier 1 — other-model review required:** executable tax/Director calculations, rates, financial outputs, user-input validation, APIs/email, security/privacy, storage, Sentry/analytics, dependencies and release/CI/deployment controls. These include `src/lib/tax/**`, `src/constants/taxRates.ts`, financial stores, `src/lib/security/**`, `src/lib/validation/**`, `src/app/api/**`, `src/lib/sentry*`, `.github/workflows/**`, `vercel.json` and related owners. Changes to published tax/financial/legal facts are also Tier 1 regardless of path.
- **Tier 2 — relevant checks and CI; review optional:** routine docs, non-statutory copy, styling and layout. Comment-only edits in protected source files are Tier 2 only when they cannot change behaviour, config, tests or consequential factual claims. Mixed-scope work is Tier 1.

For Tier 1, Claude reviews Codex work and Codex reviews Claude work. Re-review only after substantive changes to logic or safety. Changed financial results need independently grounded test expectations; reuse existing verified fixtures where adequate.

Open a focused PR with changes, checks and meaningful limitations. CI, diff and PR discussion suffice; no review transcripts, dated reports or separate administrative sign-offs by default. Stop for the maintainer's explicit merge permission; never auto-merge or deploy.
