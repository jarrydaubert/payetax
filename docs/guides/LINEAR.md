# Linear Guide

Linear is execution tracking.  
`docs/BACKLOG.md` is still the source of truth for what work exists.

For full board operating rules, see `docs/guides/KANBAN.md`.

## Migration Note

The operating model in this guide should survive account, workspace, and project moves.
Treat concrete identifiers as configuration:

- `LINEAR_TEAM_KEY` controls the Linear team key. Current code defaults to `PAYTAX`.
- `LINEAR_PROJECT_NAME` controls the default project used by helper commands. Current code defaults to `PayeTax`.
- Real API keys, webhook secrets, team keys, and project names must be re-confirmed after a Linear move.

---

## Issue Creation Rules

Create a Linear issue when:

- The item exists in `docs/BACKLOG.md`, and
- It is ready to be executed in this cycle/sprint window.

If work is not in the backlog yet, add it there first.

---

## Required Issue Fields

Every issue should include:

- Backlog ID (`P0-...`, `P1-...`, etc.)
- Why this matters (user/business impact)
- In-scope and out-of-scope
- Acceptance criteria
- Test plan with bug intent ("what bug does this catch?")
- Risk area (tax-logic, director-intelligence, seo, content, ops, ux)

Use the template in `docs/guides/KANBAN.md`.

---

## Workflow Rules

- Keep issue state accurate (`Backlog` -> `Ready` -> `In Progress` -> `Review` -> `Done`).
- Do not use `In Progress` to mean "seen"; use it only when implementation has actually started.
- A triaged-but-not-started production issue should be linked to a backlog ID and left in `Backlog` or moved to `Ready` if it meets DoR.
- Respect WIP limits from `docs/guides/KANBAN.md`.
- Do not close an issue unless Definition of Done is met:
  - behavior shipped,
  - tests updated/passing for impacted area,
  - no undocumented test debt,
  - docs/backlog updated if scope changed.

---

## Correct Usage In This Repo

Use Linear for execution tracking, not idea storage:

- Add or change work in `docs/BACKLOG.md` first.
- Create a Linear issue only when the work is ready to execute.
- Treat the configured Linear project, currently defaulting to `PayeTax`, as the main board for planned delivery work.
- Treat team-level issues without a project as triage inputs, especially for Sentry-created issues.

In practice:

- `bun run linear:me` is useful for your assigned project work.
- `bun run linear list --project-default` is the configured main project view.
- `bun run linear list --team-only` is the team-level triage view and should be checked when reviewing Sentry-created issues.

---

## CLI Commands

```bash
# List my issues in the PayeTax project
bun run linear:me

# List issues in the configured default project
bun run linear list --project-default

# List issues in an explicitly named project
bun run linear list --project PayeTax

# List team-level issues with no project
bun run linear list --team-only

# Create issue (interactive)
bun run linear create

# Move issue status
bun run linear update-status PAYTAX-123 "In Progress"

# Validate backlog <-> Linear linkage
bun run linear sync-backlog

# Release blocker report
bun run linear release-blockers

# Validate DoR for Ready-state issues
bun run linear enforce-dor --strict

# Burn-down hygiene report
bun run linear burn-down-cleanup

# One-shot pre-planning / pre-release hygiene suite
bun run linear kanban-check --strict
```

---

## SDK Features (Verified In Repo)

Installed SDK: `@linear/sdk@86.0.0` (`package.json` / lockfile).

The SDK supports a broad surface area; useful capabilities for PayeTax include:

- Issue lifecycle: `createIssue`, `updateIssue`, `deleteIssue`, `archiveIssue`, batch variants
- Workflow/state management: team `states()`, `createWorkflowState`, `updateWorkflowState`
- Planning: `createProject`, `updateProject`, `createCycle`, `updateCycle`
- Structuring work: labels, issue relations, project milestones/statuses
- Collaboration: `createComment`, subscriptions, notifications
- Search/reporting: `issues()`, `projects()`, `searchIssues`, `searchProjects`, `semanticSearch`
- Webhook support: webhook CRUD + webhook client types

### What Our Current Script Uses

Current script (`scripts/linear.js`) mainly uses:

- list issues
- create issue
- update status/priority/parent/description
- assign to project

### Sentry Webhook Issue Placement

`/api/sentry-webhook` creates issues at the configured Linear team level.

Operational note:

- This is currently acceptable and expected.
- Auto-created Sentry issues do not need to be assigned to the configured project to be valid triage inputs.
- `bun run linear:me` will not show unassigned team-level Sentry issues.
- When reviewing error backlog, check `bun run linear list --team-only` as well as project-filtered views.
- If the Linear team or project changes, update `LINEAR_TEAM_KEY` and `LINEAR_PROJECT_NAME` before trusting these commands.

### Production Issue Triage

Review team-level Sentry issues regularly, especially before backlog planning and release work:

```bash
bun run linear list --team-only
```

For each new production issue:

1. Check whether an active backlog item already covers it.
2. If it is actionable and not covered, add or update a `docs/BACKLOG.md` row with a concrete next step, DoD, and test plan.
3. Link the backlog ID in the Linear issue title or description.
4. Move the issue to `Backlog`, or to `Ready` only when it meets Definition of Ready.
5. Move to `In Progress` only when implementation starts.
6. Close the Linear issue only after the fix ships, tests/validation pass, and the backlog row is removed.

If the issue is duplicate, already fixed, third-party noise, or not actionable, close it in Linear with a short reason. Do not create standalone evidence docs for that decision.

### Automation Commands Added

- `sync-backlog`:
  - Parses `docs/BACKLOG.md`
  - Finds backlog IDs referenced in Linear issue title/description
  - Reports missing links, duplicate links, and unknown references
  - Supports `--strict` for non-zero exit on drift

- `release-blockers`:
  - Reports open blockers based on any of:
    - linked `P0-*` backlog IDs
    - `release-blocker` label
    - urgent priority
  - Also reports `P0` items without linked Linear issues
  - Supports `--strict` for non-zero exit when blockers exist

- `enforce-dor`:
  - Validates issues in `Ready` (or `--state`) have:
    - backlog ID reference
    - acceptance criteria checklist section
    - test plan checklist section with explicit bug intent
  - Supports `--strict` for non-zero exit on violations

- `burn-down-cleanup`:
  - Reports done issues still linked to active backlog IDs
  - Reports backlog items whose linked issues are all done (removal candidates)
  - Supports `--strict` for non-zero exit when cleanup items are found

- `kanban-check`:
  - Runs all checks in one command:
    - `sync-backlog`
    - `release-blockers`
    - `enforce-dor`
    - `burn-down-cleanup`
  - Supports `--strict` for non-zero exit when any check reports problems

### Next Automation Candidate

1. Add a dedicated Sentry triage helper that filters team-level issues by `🐛 Sentry:` title prefix and reports which ones lack a backlog ID or closure reason.
