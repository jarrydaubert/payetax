---
name: prd-to-issues
description: "When the user wants to break a PRD into execution-ready work items. Also use when converting feature plans into vertical slices with dependencies, acceptance criteria, and testing requirements."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for PayeTax)
---

# PRD To Issues (PayeTax)

Convert a PRD into thin, independently shippable vertical slices.

## Workflow

### 1) Read the PRD end-to-end

Capture:
- user stories
- constraints
- success criteria
- out-of-scope

### 2) Map integration layers

For each feature area, identify layers touched:
- tax/domain logic
- validation/contracts
- API/routes
- UI
- analytics
- tests/docs

### 3) Split into vertical slices

Each slice should:
- be demoable on its own
- cut through all required layers
- leave the system in a working state

First slice should be the narrowest "hello-world" path.

### 4) Define dependencies and acceptance criteria

For each slice include:
- Title
- Scope
- Blockers/dependencies
- Acceptance criteria (observable behavior)
- Test requirements tied to bug risk

### 5) Publish issue set

Create backlog issues in dependency order.
Summarize ready-now vs blocked work.

## PayeTax Context

### Tracker preference

- Default issue tracker is Linear.
- Use repository tooling where available:
  - `bun run linear:me`
  - `bun scripts/linear.js list --project PayeTax`
  - `bun scripts/linear.js create`

If user explicitly requests GitHub issues, use GitHub.

### Definition of Done per slice

A slice is done only when:
- behavior is implemented and user-verifiable
- relevant tests are added/updated
- no undocumented TODO/skip debt added
- docs/backlog references are updated when scope changes

### Quality guardrails

- Follow test mantra: "What bug does this test cover?"
- For tax-impacting slices, verify `src/constants/taxRates.ts` usage and HMRC-aligned behavior.
- Avoid horizontal layer-only tickets (e.g., "UI only", "API only") unless explicitly requested.
