# Bug Catalog (Testing Targets)

This file exists to enforce the mantra from `docs/guides/TESTING.md`:

> "What bug will this test find?"

When you add or modify a test, it must map to at least one bug class below.

## Bug Classes

### CALC-DRIFT (Financial correctness drift)

Symptoms:
- Outputs change after refactors (tax/NI/SL/net) without intentional spec/rate updates.

Primary detectors:
- Playwright: `e2e/golden-master-PERFECT.spec.ts` (regression values & extraction)
- Jest: `src/lib/__tests__/taxCalculator.*.test.ts`

### ROUNDING (Penny-level / payroll rounding)

Symptoms:
- Differences vs payslips that appear only on certain periods (monthly vs weekly, etc.).
- Off-by-0.01/0.04 issues that erode trust.

Primary detectors:
- Jest: rounding-focused unit tests (extend with real payroll examples where possible)
- Playwright: scenario-level checks on table values across periods

### TAX-CODE-OVERRIDES (BR/D0/D1/NT, K-codes, emergency codes)

Symptoms:
- Wrong allowance or wrong “all at one rate” behavior.

Primary detectors:
- Playwright: golden master scenarios for BR/K/emergency
- Jest: tax code parsing + tax calculator tests

### MULTI-INCOME (PAYE vs non-employment income separation)

Symptoms:
- NI or PAYE student loans incorrectly applied to non-employment income.
- Gross totals missing/duplicated.

Primary detectors:
- Jest: income source unit tests
- Playwright: `e2e/calculator-critical.spec.ts` (rental income row + gross)

### UX-CORE (Core flow broken)

Symptoms:
- User can’t complete the primary flow: enter inputs -> calculate -> see results.
- Navigation / key CTA breaks.

Primary detectors:
- Playwright: `e2e/smoke.spec.ts`, `e2e/calculator-critical.spec.ts`

### SECURITY-ABUSE (Abuse paths, unwanted side effects)

Symptoms:
- Untrusted input reaches templates or external services unsafely.
- Cross-origin email sends, missing rate limits, etc.

Primary detectors:
- Jest: API route unit tests (where possible) + validation tests
- Playwright: targeted API/abuse E2E tests (to be expanded)

## Adding A New Test

Answer these in the PR description:
- Bug class(es):
- What production bug would have been caught?
- Why unit vs E2E?
- What’s the smallest reliable assertion?

