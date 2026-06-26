# Documentation Map And Evergreen Policy

PayeTax docs should help a contributor make a correct decision quickly.

## Source Order

When docs overlap, prefer sources in this order:

1. Code and tests for implemented behaviour.
2. `.env.template`, `package.json`, and workflow files for commands and environment names.
3. `AGENTS.md` for contributor operating rules.
4. `docs/business/PRODUCT_DIRECTION.md` for product scope decisions.
5. `docs/guides/*` for operational and engineering guidance.
6. `docs/reports/*` for dated historical evidence.

## Evergreen Rules

- Keep stable policy in guides; keep dated run output in PRs or release reports.
- Avoid "recently", "currently", exact suite counts, and coverage percentages in evergreen docs unless the line also says how to refresh it.
- Prefer command names from `package.json` over prose descriptions of scripts.
- Use `bun run build:ci` for local and CI-style production-build validation.
- Use `bun run build:release` only when validating release behaviour that needs Sentry source maps.
- Keep Vercel production configured to run `bun run build`; production source-map behaviour is controlled by env and `next.config.ts`.
- Do not keep closed-work summaries in `docs/BACKLOG.md`; use GitHub PRs, release reports, or commit history for completed work.
- Keep deployment, environment, and release validation guidance in `docs/guides/OPERATIONS.md`.
- Keep API hardening, bot mitigation, and rate-limit verification guidance in `docs/guides/API_AND_ABUSE_CONTROLS.md`.
- Merge or retire duplicate process docs instead of creating parallel checklists.
- For tax, email, privacy, security, analytics, and provider claims, confirm implementation or provider settings before changing wording.
- Public blog content is allowed to be tax-year specific, but it must carry clear dates and should be refreshed or retired when rates, deadlines, or official guidance change.

## Usefulness Test

Keep a doc when it answers at least one of these:

- What is the product or technical boundary?
- What command or workflow should I run?
- What source of truth should I trust?
- What risk does this guard against?
- What evidence must I capture before claiming success?

Retire or merge docs that only repeat another source, record old status without historical value, or describe work that is already closed elsewhere.

## Doc Types

- **Evergreen guides:** `README.md`, `AGENTS.md`, `docs/business/*`, and the canonical guides in `docs/guides/*`.
- **Working queue:** `docs/BACKLOG.md`, only for active or parked future work.
- **Historical evidence:** `docs/reports/*`; do not rewrite old reports to match new commands except to correct factual errors.
- **Public content:** `content/blog/*`; review for tax-year accuracy and reader usefulness separately from engineering docs.
