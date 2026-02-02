# Director Guide Go-Live Plan (Spec-First)

Last updated: 2026-02-02

## Goal

Ship `/tools/director-guide` in a state that matches the approved spec (trust-first) and is safe to promote publicly.

This plan explicitly prefers: **fix implementation to match spec** (not the other way around).

## Scope Lock (v1)

### IN scope (must ship)

- Survival Mode (profit <= 0) with a distinct UI state and a ~GBP 6,500 NI-credits recommendation (educational framing).
- VAT checkbox is **warnings/education only** (not used in tax calculations).
- VAT threshold warnings show based on revenue (regardless of profit).
- Email results (existing flow) remains functional.
- Warnings/education panels work in both normal and survival modes.
- Core tax year: 2025-26 (single source of truth).

### OUT of scope (explicitly not v1)

- Tax Pack / PDF / paid exports.
- Shareable links (URL state or server-stored share IDs).
- Multi-director / spouse / household optimization.
- Xero/FreeAgent/QuickBooks integrations.
- Dividend voucher generation / board minutes automation.
- Dividend timing optimizer.

## Current Verified Blockers (Spec vs Implementation)

### 1) VAT handling mismatch (BLOCKER)

- Spec: VAT status is warning-only, not used in tax calc.
- Current: tax math divides revenue by 1.2 when `includesVat` is checked.
- Fix: remove VAT adjustment from calculation; keep checkbox to drive warnings/education copy only.

Primary files:
- `src/lib/tax/strategyComparison.ts`
- `src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx`

### 2) Survival Mode not implemented in Director Guide UI (BLOCKER)

- Spec: profit <= 0 triggers a distinct Survival Mode and still provides a useful recommendation (GBP ~6,500 salary for NI credits), even if it creates a loss.
- Current: strategy results become empty + most UI hides when `comparison.grossProfit <= 0`.
- Fix: implement a **simplified Survival Mode panel** (not full tables/slider) and ensure Key Dates + Warnings/Education still show.

Primary files:
- `src/lib/tax/strategyComparison.ts` (or add a dedicated survival-mode model)
- `src/components/organisms/DirectorGuide/DirectorDashboard.tsx`
- Components currently gating on `comparison.grossProfit <= 0`:
  - `src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx`
  - `src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx`
  - `src/components/molecules/DirectorGuide/calculator/TaxPots.tsx`
  - `src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx`
  - etc.

### 3) VAT warnings incorrectly gated on "hasResults" (BLOCKER)

- Spec: VAT warnings are based on revenue (rolling 12 months concept) and should not disappear just because profit is <= 0.
- Current: VAT warnings require `hasResults` which is false when `comparison.grossProfit <= 0`.
- Fix: compute VAT warnings from revenue regardless of profit/results state.

Primary file:
- `src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx`

## Additional Go-Live Gaps (Add to Plan)

### A) Missing `/tools` page (SEO/UX)

Risk: multiple tool pages include `/tools` in breadcrumb schema, but there is no `src/app/tools/page.tsx`.

Decision (pick one and implement before release):
- Option A (preferred): add `src/app/tools/page.tsx` tools landing page.
- Option B: remove the `/tools` breadcrumb element from all tool pages.

### B) Plan 5 student loan gating (consistency)

Spec says: "Only active plans shown (Plan 5 from April 2026)".

Current situation:
- Director Guide input UI does not expose Plan 5.
- Underlying types/constants include Plan 5, and `EducationPanel` includes a Plan 5 warning that implies Plan 5 is not calculated.

Fix (choose one approach and make it consistent):
- Enforce: Director Guide store/input filtering must never allow `plan5` in state.
- Remove or reword the Plan 5 warning so it cannot contradict actual calculation behavior.

### C) Analytics wiring (observability)

We have `src/lib/directorGuideAnalytics.ts` but only a subset is called.

Minimum go-live events to wire:
- `guide_started` (already)
- `calculation_run` (new event or reuse existing naming)
- `email_opened` + `email_sent` (or at least `email_sent`)
- `warning_shown` (when warnings are rendered in view)
- `education_expanded` (if accordions exist / are added)

## Survival Mode UX (Locked Recommendation)

Use a simplified Survival Mode panel (not strategy cards/tables/slider).

Show in Survival Mode:
- Survival Mode panel (headline + explanation + two options)
- Key Dates
- Warnings (including VAT warnings)
- Education panel

Hide in Survival Mode:
- Strategy cards / comparison table
- Salary slider
- Two Pots
- Tax breakdown tables / charts that assume positive profit

Panel content (illustrative):
- "Your company has no distributable profit this year (dividends not possible)."
- Recommendation: "Pay ~GBP 6,500 salary" with NI credits rationale (educational, not advisory).
- Alternative: "Pay GBP 0 salary" with "no NI credits" tradeoff.
- If we show any numeric estimates, keep copy careful (illustrative).

## Execution Plan (Do This Before Coding Anything Else)

### Step 0: Confirm acceptance criteria (quick)

- Confirm the v1 IN/OUT scope above.
- Confirm Survival Mode = simplified panel (locked).
- Confirm decision on `/tools` page (A vs B).

### Step 1: Fix VAT handling (spec-first)

- Remove VAT division from `src/lib/tax/strategyComparison.ts`.
- Update UI copy in `src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx`:
  - Tip must not claim "we divide by 1.2 for tax".
  - Remove/adjust "Net revenue: ..." line.
- Add tests to ensure `includesVat` does not change tax results.

### Step 2: Ungate VAT warnings

- Update `src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx` warnings:
  - VAT threshold warnings should use revenue regardless of profit.
- Add tests for warning visibility when profit <= 0 but revenue is high.

### Step 3: Implement Survival Mode panel + behavior

- Introduce Survival Mode state in Director Guide rendering:
  - When profit <= 0 (or comparison indicates non-positive), render Survival panel + Key Dates + Education/Warn.
  - Do not render strategy comparison/slider/tables.
- Ensure calculations support the survival message (even if strategyComparison remains zeroed):
  - Either (a) add a separate survival-mode computation function for the panel, or
  - (b) extend strategyComparison output with a `mode` and `survival` payload.
- Add tests for survival-mode rendering and basic outputs.

### Step 4: Plan 5 gating cleanup

- Ensure Director Guide cannot store `plan5` in its state.
- Remove or correct the Plan 5 warning copy so it cannot contradict actual behavior.

### Step 5: Email endpoint de-drift (non-blocker but recommended pre-launch)

- Update `src/app/api/send-director-results/route.ts` to pull rates/thresholds from `src/constants/taxRates.ts`.
- Remove or minimize hardcoded values that can drift.
- Add a small test that would fail if tax year constants drift.

### Step 6: Add a `/tools` page OR remove breadcrumb references

- Implement chosen option (A or B) consistently across:
  - `src/app/tools/*/page.tsx` JSON-LD breadcrumb schemas

### Step 7: Tests + QA + release checklist

Minimum automated tests:
- Unit tests:
  - VAT warning-only behavior
  - VAT warning visibility when profit <= 0
  - Survival Mode panel renders for profit <= 0
- E2E smoke tests (Playwright):
  - `/tools/director-guide` loads
  - entering inputs produces results
  - email dialog opens and submits (mock network if needed)

Manual QA checklist (preview deploy):
- rUK vs Scotland
- profit positive / zero / negative
- other income on/off (PA taper region)
- EA on/off
- student loan combinations
- pension deducted flag
- BIK > 0
- "Your Setup" overdrawn scenario
- Email endpoint behavior (success + missing provider env var)

Release:
- Merge to main, deploy, verify production `/tools/director-guide` and email endpoint.
- Monitor errors/429s and client errors for 24-48 hours.

