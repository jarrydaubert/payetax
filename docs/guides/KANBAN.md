# Kanban Operating Model

PayeTax uses Kanban to turn backlog commitments into shippable, test-backed work.

Backlog remains the source of truth: `docs/BACKLOG.md`.

---

## Board Columns

Use this column order:

1. `Backlog`
2. `Ready`
3. `In Progress`
4. `Review`
5. `Done`

### Column Rules

| Column | Entry Criteria | Exit Criteria |
|---|---|---|
| `Backlog` | Work is captured in `docs/BACKLOG.md` with ID, next step, done condition. | Item is fully scoped and meets Definition of Ready. |
| `Ready` | Card has owner, scope, acceptance criteria, and test plan. | Work has started and card moved to `In Progress`. |
| `In Progress` | Active implementation on a branch/PR by assignee. | PR is open with evidence attached, then move to `Review`. |
| `Review` | Code is ready for review with test evidence and risk notes. | Approved + merged + any required post-merge validation complete. |
| `Done` | Change shipped and verified against acceptance criteria. | Remove completed item from `docs/BACKLOG.md` at next backlog burn-down pass. |

---

## WIP Limits

- `In Progress`: max `3` cards across the team
- `Review`: max `4` cards across the team
- Per person: max `2` cards in `In Progress`

If a column exceeds WIP limit, stop starting new work and clear blockers first.

---

## Definition Of Ready (DoR)

A card can move to `Ready` only if all are true:

- Problem statement is clear and user/business impact is stated.
- Scope is explicit (what is in, what is out).
- Acceptance criteria are observable and testable.
- Test plan is defined (unit, integration, E2E, or explicit rationale for none).
- Risk level is set (`tax-logic`, `security`, `seo`, `content`, `ops`).

---

## Definition Of Done (DoD)

A card is `Done` only when all are true:

- Implementation matches acceptance criteria.
- Required tests are added/updated and passing.
- Test intent is explicit: "what bug does this test catch?"
- No undocumented test debt added (`skip`/`todo`/placeholder tests).
- Docs/backlog updated if behavior or scope changed.
- For tax-impacting work, logic still aligns with `src/constants/taxRates.ts`.

---

## Ticket Template

Use this template for Linear issues:

```md
## Why
[What user/business problem this solves]

## Scope
- In scope:
  - ...
- Out of scope:
  - ...

## Acceptance Criteria
- [ ] Observable behavior 1
- [ ] Observable behavior 2

## Test Plan (What bug does this catch?)
- Unit:
  - ...
- E2E:
  - ...

## Risk / Impact
- Area: [tax-logic | director-intelligence | tax-pack | seo | content | ops]
- Risk level: [High | Medium | Low]

## Links
- Backlog ID: [P0-...]
- Related docs/PRs:
```

---

## Recommended Labels

- `tax-logic`
- `director-intelligence`
- `tax-pack`
- `tests`
- `e2e`
- `docs`
- `release-blocker`

---

## Weekly Cadence

1. Backlog grooming (weekly): remove done items, split oversized cards, clarify unclear acceptance criteria.
2. Board triage (2-3 times/week): enforce WIP limits and unblock `Review`.
3. Release check (for release-bound work): run `bun run release:verify` before close-out.

---

## Linear Setup Checklist

1. Create/confirm workflow states: `Backlog`, `Ready`, `In Progress`, `Review`, `Done`.
2. Configure board columns in the same order.
3. Apply WIP limits (or enforce manually in team routine).
4. Add labels from "Recommended Labels".
5. Create saved views:
   - `My In Progress`
   - `Ready (Unassigned)`
   - `Release Blockers`
   - `Tax Logic Changes`

---

## CLI Usage

```bash
# List my project issues
bun run linear:me

# List issues for PayeTax project
bun scripts/linear.js list --project PayeTax

# Create issue
bun scripts/linear.js create

# Move issue state
bun scripts/linear.js update-status PAYTAX-123 "In Progress"

# Validate backlog/board linkage
bun scripts/linear.js sync-backlog --strict

# Check open release blockers before release
bun scripts/linear.js release-blockers --strict

# Validate Ready-state DoR fields
bun scripts/linear.js enforce-dor --strict

# Detect done/backlog drift
bun scripts/linear.js burn-down-cleanup

# One-shot hygiene suite
bun scripts/linear.js kanban-check --strict
```
