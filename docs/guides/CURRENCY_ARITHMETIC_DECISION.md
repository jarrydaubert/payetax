# Currency Arithmetic Decision (P1-2)

Date: February 20, 2026  
Status: Accepted  
Scope: PAYE calculator, Director Intelligence calculator, related UI summaries

---

## Problem

PayeTax uses JavaScript `number` arithmetic with explicit rounding helpers (primarily `roundToPence`) across tax engines.  
We needed to decide whether to:

1. Keep current approach (number + explicit pence rounding), or
2. Migrate to integer-pence arithmetic end-to-end, or
3. Introduce a decimal library (for example `decimal.js`/`big.js`) in core calculators.

---

## Evaluation Criteria

- HMRC behavior parity (monthly-first processing and published examples)
- Deterministic outputs across calculator/store/email/reporting paths
- Regression risk and migration complexity
- Runtime/perf impact and bundle impact
- Maintainability and testability

---

## Current State (Verified)

- Shared rounding utility exists at `src/lib/tax/utils.ts` (`roundToPence`).
- PAYE engine (`src/lib/taxCalculator.ts`) is monthly-first then annualized, with explicit per-step rounding.
- Director modules in `src/lib/tax/` also rely on explicit rounding helpers.
- Existing test suite and HMRC verification fixtures are tuned to this model.
- Anomaly monitoring now catches impossible output states (`calculation_anomaly` path).

---

## Option Comparison

### Option A: Keep number + explicit pence rounding (current)

Pros:
- Lowest migration risk.
- Aligns with current HMRC fixture/test behavior.
- No dependency/bundle increase.

Cons:
- Requires discipline to avoid ad hoc arithmetic outside shared helpers.
- Some module-local rounding helpers still exist and need gradual cleanup.

### Option B: Integer-pence arithmetic everywhere

Pros:
- Strong deterministic model for currency amounts.
- Easier to reason about no-float drift in persistence/snapshots.

Cons:
- High migration scope across PAYE/director engines and tests.
- Requires careful handling where rates/percentages are not naturally integer-based.
- Significant refactor risk near tax-year logic.

### Option C: Decimal library in calculators

Pros:
- Avoids binary float quirks with strong numeric semantics.

Cons:
- Additional runtime dependency and complexity.
- Still requires consistent rounding policy decisions at boundaries.
- Migration effort similar to Option B in sensitive paths.

---

## Decision

Keep **Option A** for the live calculators now:
- Continue with `number` arithmetic and explicit rounding-to-pence policy.
- Keep monthly-first HMRC-aligned behavior in PAYE engine.
- Use anomaly monitoring + existing HMRC/invariant tests as guardrails.

This is the best risk/performance tradeoff for current production flows.

---

## Follow-Up

- No immediate full-engine refactor ticket is required from this decision.
- If a future export or persistence workflow needs stronger deterministic serialization, reassess integer-pence requirements in that narrower context instead of changing live calculator arithmetic first.
- Incremental cleanup of local rounding duplicates remains part of normal refactor hygiene, not a dedicated blocker.

---

## Acceptance Evidence

- Decision documented here.
- Linked from `docs/guides/SYSTEM_OVERVIEW.md`.
- `docs/BACKLOG.md` item `P1-2` marked complete by removal from active backlog.
