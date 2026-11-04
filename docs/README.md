# Documentation Map And Evergreen Policy

PayeTax docs should help a contributor make a correct decision quickly.

## Authority and source order

Start at [AGENTS.md](../AGENTS.md) and [work management](guides/WORK_MANAGEMENT.md).
[Linear: PayeTax](https://linear.app/jgf-projects/project/payetax-ecec16170865) owns planned work, priorities, dependencies,
issue-specific acceptance and progress. If unavailable, obtain the issue text from the maintainer;
do not substitute a historical repository queue.

GitHub owns durable engineering standards, shared Ready/Done, architectural decisions, statutory
fixture provenance and independently reviewable implementation evidence.

For implemented behaviour and engineering guidance, use:

1. Code and tests for implemented behaviour; current primary official sources and canonical
   policy for statutory facts.
2. `.env.template`, `package.json` and workflow files for commands and environment names.
3. [AGENTS.md](../AGENTS.md) and [WORK_MANAGEMENT.md](guides/WORK_MANAGEMENT.md) for contributor,
   independent review, Ready/Done and public PR evidence.
4. [Product direction](business/PRODUCT_DIRECTION.md) for scope/protected surfaces.
5. [System overview](guides/SYSTEM_OVERVIEW.md) for architecture and production owners;
   [testing](guides/TESTING.md) for statutory fixture provenance and verification.
6. [Operations](guides/OPERATIONS.md), other guides and [blog guidance](blog/README.md)
   for their respective engineering/editorial standards.
7. Dated reports and PRs for historical evidence, interpreted at their recorded refs.

## Evergreen rules

- Keep standards and technical decisions in the repository; keep work state in Linear and
  dated run results in PRs or reports. Do not copy issue lists or shared standards between them.
- Prefer command names from `package.json`. Use `bun run build:ci` locally/in CI;
  `build:release` only for source-map release validation. Vercel production still runs `bun run build`.
- Avoid transient release numbers, test totals and freshness promises in evergreen guidance.
- [OPERATIONS.md](guides/OPERATIONS.md) owns release/environment validation;
  [API_AND_ABUSE_CONTROLS.md](guides/API_AND_ABUSE_CONTROLS.md) owns API/rate-limit controls.
- Merge duplicate guidance instead of adding parallel checklists. Verify actual implementation
  or provider settings before making tax, email, privacy, security or analytics claims.
- Public tax-year content needs clear dates and refresh/retirement when primary guidance changes.

## Document types and history

- **Entry points:** `AGENTS.md`, the importing `CLAUDE.md` and root `README.md`.
- **Durable guidance:** `docs/business/*`, `docs/blog/*` and `docs/guides/*`.
- **Operational queue:** Linear only; public PRs restate their claimed acceptance criteria.
- **Dated evidence:** `docs/reports/*`, implementation PRs and commit history. Preserve old reports;
  later guides do not retroactively certify their results.
- **Public content:** `content/blog/*`, reviewed for stated-year accuracy and reader usefulness.
- **Compatibility pages:** [BACKLOG.md](BACKLOG.md) and [PROJECT_STATE.md](PROJECT_STATE.md)
  retain old anchors and point to the [frozen migration provenance](reports/linear-documentation-reconciliation-2026-11-03.md).
  They contain no live queue or release certificate.

Keep a document only when it explains a boundary, command/workflow, trusted source, risk or
required evidence. Retire repetitive status prose once its rules and provenance have a durable home.
