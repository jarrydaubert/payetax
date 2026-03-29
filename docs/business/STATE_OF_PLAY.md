# Business State Of Play

Owner: Product + Engineering

This file is the single snapshot of what is live, partial, and planned across business docs.

## How To Read

Status legend:
- `Live`: Shipped and in active product usage.
- `Partial`: Some infrastructure exists, but not fully launched in UX/business flow.
- `Planned`: Defined in docs only, not yet shipped.

## Lean End State

- Strong organic acquisition via SEO + blog + newsletter loops.
- High-quality decision-support experience for complex director use cases.
- Optional accountant referral path only if it improves user outcomes and partner quality is proven.
- Optional: embeddable widget only if demand is validated.

## Current Snapshot (Lean Scope)

| Area | Status | Notes | Source Docs |
|------|--------|-------|-------------|
| Director Intelligence core calculator | Live | Strategy comparison, warnings, education + input workflow are live. | `DIRECTOR_INTELLIGENCE.md` |
| Variable Income (Monthly mode) | Live | Annual/monthly toggle, safe monthly draw, buffer logic, warnings are implemented. | `DIRECTOR_INTELLIGENCE.md` |
| Key dates `.ics` download | Live | Downloadable calendar export is implemented in product. | `DIRECTOR_INTELLIGENCE.md` |
| Two Pots set-aside guidance | Live | Company/personal tax pots and set-aside messaging are live. | `DIRECTOR_INTELLIGENCE.md` |
| Case-study regression anchors (recruiter scenario) | Live | Case-study test coverage exists in tax test suite. | `DIRECTOR_INTELLIGENCE.md` |
| Accountant referral backend | Partial | Lead API + email flow exist; main calculator CTA is intentionally disabled pending partner agreements. | `docs/BACKLOG.md` |
| Embeddable/white-label widget | Planned | Idea-stage only, demand validation first. | `docs/BACKLOG.md` |

## Scope Guardrails (Current)

- No paid product flow is in active scope.

## Parked For Now (Not In Lean Scope)

- Entry choice routing (`I'm new` / `I know basics`)
- Tax Bathtub visual
- Sleep at Night status
- Bank transfer label guidance (`SALARY`, `DIVIDEND`, `TAX SAVE`)

## Update Rules

- When feature status changes, update this file and `docs/BACKLOG.md` in the same PR.
- If docs conflict, treat this file as the fast snapshot and update source docs immediately after.
