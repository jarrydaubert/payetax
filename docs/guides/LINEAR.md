# Linear Guide

Linear is not currently wired into PayeTax.

This document is retained as a migration note for a future Linear setup. The current repo has no Linear SDK dependency, no Linear helper script, no Sentry-to-Linear webhook route, and no required Linear environment variables.

For board operating rules, see `docs/guides/KANBAN.md`.

## Current State

- `docs/BACKLOG.md` is the source of truth for planned work.
- GitHub issues and pull requests are sufficient for current repo work.
- Sentry is used for calculator error monitoring, but it does not automatically create Linear issues.
- Any old Linear API keys, team keys, project names, and webhook secrets should be treated as stale.

## Future Reconnection

Only reconnect Linear when there is a specific implementation task and a confirmed current workspace.

Before adding code back:

- Confirm the active Linear workspace, team, and project.
- Create a fresh API key in the current workspace.
- Decide whether Sentry issues should create Linear issues automatically or stay manual.
- Document the exact environment variables in `.env.template`, `README.md`, `AGENTS.md`, and `docs/guides/PRODUCTION_ENV_CONTRACT.md`.
- Add tests for any webhook or helper script that is reintroduced.

Do not restore legacy defaults such as `PAYTAX` or `PayeTax` without confirming they exist in the new workspace.

## Issue Creation Rules

Create a Linear issue only when:

- the item exists in `docs/BACKLOG.md`, and
- it is ready to be executed in the current cycle or sprint window.

If work is not in the backlog yet, add it there first.

## Required Issue Fields

Every issue should include:

- Backlog ID (`P0-...`, `P1-...`, etc.)
- Why this matters
- In scope and out of scope
- Acceptance criteria
- Test plan with bug intent
- Risk area, such as tax logic, director intelligence, content, ops, or UX

Use the template in `docs/guides/KANBAN.md`.

## Workflow Rules

- Keep issue state accurate (`Backlog` -> `Ready` -> `In Progress` -> `Review` -> `Done`).
- Do not use `In Progress` to mean "seen"; use it only when implementation has actually started.
- Respect WIP limits from `docs/guides/KANBAN.md`.
- Do not close an issue unless Definition of Done is met:
  - behaviour shipped
  - tests updated or explicitly judged unnecessary for the impacted area
  - no undocumented test debt
  - docs or backlog updated if scope changed

## Sentry Triage

Until Linear is reconnected, handle Sentry issues manually:

1. Check whether an active backlog item already covers the issue.
2. If it is actionable and not covered, add or update a `docs/BACKLOG.md` row.
3. Link any relevant GitHub issue or PR from the backlog row.
4. Close Sentry issues only when the fix ships or the issue is confirmed duplicate, third-party noise, or not actionable.
