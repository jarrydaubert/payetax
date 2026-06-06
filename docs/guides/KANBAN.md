# Kanban Operating Rules

`docs/BACKLOG.md` tracks the work that exists. Use GitHub issues and pull requests for execution when a backlog item needs a public discussion thread.

## Board States

- `Backlog`: triaged work that exists but is not ready to start.
- `Ready`: work with a clear backlog ID, scope, acceptance criteria, and test plan.
- `In Progress`: implementation has started.
- `Review`: implementation is complete and awaiting review, validation, or merge.
- `Done`: shipped or deliberately closed, with docs/backlog updated when needed.

## WIP Limits

- Keep `In Progress` narrow. Prefer one active implementation thread per person.
- Move blocked work back to `Backlog` or leave a clear blocker note before starting something else.
- Do not use `Ready` as storage for vague ideas; vague ideas belong in `docs/BACKLOG.md` first.

## Issue Template

```md
## Backlog

Refs: P1-1

## Why

User/business impact in one or two sentences.

## Scope

- In:
- Out:

## Acceptance Criteria

- [ ] User-visible or operational outcome
- [ ] Docs/backlog updated if scope changes

## Test Plan

- [ ] Bug intent: what regression this would catch
- [ ] Command or manual validation path

## Risk Area

tax-logic | director-intelligence | seo | content | ops | ux
```

## Definition Of Ready

- The issue references a backlog ID.
- Acceptance criteria are concrete and checkable.
- The test plan says what bug or regression it catches.
- Dependencies, secrets, or migration assumptions are called out.

## Definition Of Done

- Behavior shipped or intentionally closed with a reason.
- Relevant tests or validation passed.
- No undocumented test debt was added.
- `docs/BACKLOG.md` and supporting docs reflect the final state.
