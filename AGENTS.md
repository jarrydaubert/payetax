# AGENTS.md: PayeTax

Instructions for coding agents and contributors working in this repository.

## What This Is

PayeTax is Jarryd Aubert's UK tax-calculator R&D project. It exists to exercise deterministic calculation correctness, edge-case handling, API hardening, observability, deployment hygiene, and clear public documentation.

It is not a commercial growth site. Keep the product useful, accurate, and simple.

## Scope Guardrails

- Keep the main calculator, tools, Director Intelligence, blog, email-results, PWA, GA4, Sentry, Brevo API email, and Upstash-backed rate limiting.
- Do not reintroduce growth page families, competitor-style SEO pages, partner lead capture, or mailing-list plumbing unless explicitly requested.
- Do not add extra analytics vendors beyond GA4 unless there is a specific implementation task.
- Do not reintroduce the feedback feature or external issue-tracker integrations unless explicitly requested.
- Do not invent tax behaviour, provider support, production status, usage metrics, or security controls.
- Do not commit secrets.

## Commands

```bash
bun install --frozen-lockfile
bun run check:repo
bun run test:no-coverage
bun run build:ci
bun audit
```

Use the smallest relevant check while developing, then run `bun run check:repo` and `bun run build:ci` before committing broad changes. Use `bun run build:release` only when validating release behaviour that needs Sentry source maps.

## Agent Loops

Prefer loop primitives with deterministic stop conditions over open-ended iterative prompting:

- **Verification:** for any UI change, use the `verify-frontend-change` skill (`.claude/skills/verify-frontend-change/SKILL.md`). Do not report UI work done on a successful edit alone.
- **Goal loops:** hand off the stop condition instead of checking each turn, e.g. `/goal bun run check:repo and bun run test:e2e:critical pass, stop after 5 tries`. For calculation-logic changes, use the golden-master spec as the stop condition.
- **PR loops:** `/loop 10m check my open PR, address review comments, fix failing CI` — stops on merge.
- **Scheduled upkeep:** a weekly `/schedule` routine running `bun run check:rate-freshness`, `bun run audit:deps`, and `bun audit`. Report findings; do not auto-merge dependency changes.

Loops must respect the scope guardrails above and the token rule of this repo: use the existing check scripts (deterministic, cheap) rather than re-deriving verification steps.

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

If a Vercel CLI command cannot retrieve project settings, check `.vercel/project.json`. A stale local link should be replaced by relinking to the current project.

## Editing Rules

- Prefer existing patterns in `src/`, `scripts/`, and `docs/`.
- Edit source files, not generated output, unless the repo clearly treats the file as committed source.
- Keep docs aligned with code in the same change.
- Keep evergreen docs useful and stable; put dated run evidence in PRs or `docs/reports/*`.
- Verify commands before claiming they pass.
- When touching frontend UI, inspect the changed route locally when practical.
- For email, privacy, security, and tax claims, confirm the implementation before changing wording.

## Current Public Surface

- Main PAYE calculator
- Tax tools hub and tool pages
- Director Intelligence calculator
- Blog and category pages
- About, privacy, compliance, install
- API routes for sending results and operational rate-limit health

## Pull Request Expectations

Before committing non-trivial code changes, run a fresh-context review (`/code-review` or a second agent that did not write the code) and address or note its findings.

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
