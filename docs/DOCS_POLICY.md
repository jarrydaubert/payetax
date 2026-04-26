# Documentation Policy

This policy keeps project docs evergreen, actionable, and trustworthy.

## Scope

- Applies to repo docs under `docs/` and root guidance files such as `AGENTS.md` and `CLAUDE.md`.
- Exception: dated reports and release records can be time-bound.

## Rules

- Write evergreen docs as stable runbooks/specs, not status reports.
- Do not include TODOs, progress markers, or in-flight work in evergreen docs.
- Track open work only in `docs/BACKLOG.md`.
- Do not create standalone evidence docs to close backlog items; use tests, validation commands, PR notes, and linked Linear issues as the proof path.
- Prefer "how to run" + "pass criteria" over narrative status updates.
- Keep examples minimal and directly runnable.
- When a workflow changes, update the relevant runbook in the same change set.

## Required Structure For Operational Docs

- Purpose
- Prerequisites
- Commands/steps
- Pass criteria
- Failure handling/escalation path

## Backlog Boundary

- `docs/BACKLOG.md` contains open items only.
- When an item is complete, remove it from backlog in the same change set that delivers the outcome, tests, and validation.
- Evergreen docs should describe the stable process, not the current status of incomplete work.

## Ownership

- Any PR that adds TODO/status language to evergreen docs must move that content to backlog.
- Any PR that changes workflows must update the relevant runbook.
