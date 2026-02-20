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
```

---

## SDK Features (Verified In Repo)

Installed SDK: `@linear/sdk@75.0.0` (`node_modules/@linear/sdk/package.json`).

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

### High-Value Next Automations

1. `sync-backlog`: validate every active `docs/BACKLOG.md` ID has a matching Linear issue.
2. `enforce-dor`: block move to `Ready` without acceptance criteria + test plan fields.
3. `release-blockers-view`: auto-label + report `P0` open blockers.
4. `burn-down-cleanup`: detect issues in `Done` whose backlog items were not removed yet.
