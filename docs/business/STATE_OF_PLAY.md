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
- High-quality accountant referral path for complex users.
- Paid Tax Pack for directors as primary productized revenue.
- Optional: embeddable widget only if demand is validated.

## Current Snapshot (Lean Scope)

| Area | Status | Notes | Source Docs |
|------|--------|-------|-------------|
| Director Intelligence core calculator | Live | Strategy comparison, warnings, education + input workflow are live. | `DIRECTOR_CALCULATOR_BUILD.md`, `DIRECTOR_GUIDE_POSITIONING.md` |
| Variable Income (Monthly mode) | Live | Annual/monthly toggle, safe monthly draw, buffer logic, warnings are implemented. | `DIRECTOR_VARIABLE_INCOME_SPEC.md` |
| Key dates `.ics` download | Live | Downloadable calendar export is implemented in product. | `COMPETITOR_GAP_ANALYSIS.md` |
| Two Pots set-aside guidance | Live | Company/personal tax pots and set-aside messaging are live. | `DIRECTOR_GUIDE_POSITIONING.md`, `COMPETITOR_GAP_ANALYSIS.md` |
| Case-study regression anchors (recruiter scenario) | Live | Case-study test coverage exists in tax test suite. | `CASE_STUDY_RECRUITER.md` |
| Accountant referral backend | Partial | Lead API + email flow exist; main calculator CTA is intentionally disabled pending partner agreements. | `MONETIZATION.md`, `docs/BACKLOG.md` |
| Tax Pack monetization flow | Planned | V1 scope and architecture are defined; checkout/export/download pipeline not yet shipped. | `MONETIZATION.md`, `tax-pack/TAX_PACK_PLAN.md` |
| Embeddable/white-label widget | Planned | Idea-stage only, demand validation first. | `MONETIZATION.md`, `docs/BACKLOG.md` |

## Scope Guardrails (Current)

- Tax Pack V1 scope is Director Intelligence extraction output only.
- CGT and crypto are explicitly out of scope for Tax Pack V1.

## Parked For Now (Not In Lean Scope)

- Entry choice routing (`I'm new` / `I know basics`)
- Tax Bathtub visual
- Sleep at Night status
- Bank transfer label guidance (`SALARY`, `DIVIDEND`, `TAX SAVE`)

## Update Rules

- When feature status changes, update this file and `docs/BACKLOG.md` in the same PR.
- If docs conflict, treat this file as the fast snapshot and update source docs immediately after.
