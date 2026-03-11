# Linear Guide

Linear is execution tracking.  
`docs/BACKLOG.md` is still the source of truth for what work exists.

For full board operating rules, see `docs/guides/KANBAN.md`.

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
- Risk area (tax-logic, director-intelligence, tax-pack, seo, content, ops)

Use the template in `docs/guides/KANBAN.md`.

---

## Workflow Rules

- Keep issue state accurate (`Backlog` -> `Ready` -> `In Progress` -> `Review` -> `Done`).
- Respect WIP limits from `docs/guides/KANBAN.md`.
- Do not close an issue unless Definition of Done is met:
  - behavior shipped,
  - tests updated/passing for impacted area,
  - no undocumented test debt,
  - docs/backlog updated if scope changed.

---

## CLI Commands

```bash
# List my issues in PayeTax project
bun run linear:me

# List issues by project
bun scripts/linear.js list --project PayeTax

# Create issue (interactive)
bun scripts/linear.js create

# Move issue status
bun scripts/linear.js update-status PAYTAX-123 "In Progress"

# Validate backlog <-> Linear linkage
bun scripts/linear.js sync-backlog

# Release blocker report
bun scripts/linear.js release-blockers

# Validate DoR for Ready-state issues
bun scripts/linear.js enforce-dor --strict

# Burn-down hygiene report
bun scripts/linear.js burn-down-cleanup

# One-shot pre-planning / pre-release hygiene suite
bun scripts/linear.js kanban-check --strict
```

---

## SDK Features (Verified In Repo)

Installed SDK: `@linear/sdk@77.0.0` (`node_modules/@linear/sdk/package.json`).

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

`/api/sentry-webhook` creates issues at the `PAYTAX` team level.

Operational note:

- This is currently acceptable and expected.
- Auto-created Sentry issues do not need to be assigned to the `PayeTax` project to be valid triage inputs.
- When reviewing error backlog, check team-level unassigned `PAYTAX-*` issues as well as project-filtered views.

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

1. Add transition guard in `update-status` to auto-run `enforce-dor` before allowing move to `Ready` (with explicit `--force` override).
