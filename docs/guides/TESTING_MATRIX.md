# Testing Matrix (Finance-Grade Targets)

This is the “what bug will this test find?” map for PayeTax.

## Quality Gates

PR gate (fast, high-signal):
- `bun run test:no-coverage`
- `bun run build`
- Playwright chromium only:
  - smoke (`e2e/smoke.spec.ts`)
  - calculator critical (`e2e/calculator-critical.spec.ts`)
  - HMRC golden master (`e2e/golden-master-PERFECT.spec.ts`)

Release gate (slower, broader):
- `bun run test:e2e` (all browser projects)
- a11y sweep (`e2e/accessibility-wcag22.spec.ts`)
- visual regression (`e2e/visual-regression.spec.ts`)

Nightly/weekly:
- full suite + report review, plus any “slow” or flaky quarantined tests.

## Bug-Class Matrix

| Bug Class | What breaks | Primary tests | Notes |
|---|---|---|---|
| CALC-DRIFT | Tax/NI/SL/net changes unexpectedly | `e2e/golden-master-PERFECT.spec.ts` | Treat as regression oracle, not a substitute for external HMRC provenance |
| ROUNDING | Penny-level mismatch vs payslips | Unit rounding tests + real payroll examples | Prefer real payslip fixtures and explicit rounding rules |
| TAX-CODE-OVERRIDES | BR/D0/D1/NT/K/emergency logic wrong | golden master + tax code unit tests | Must cover both parsing and downstream tax computation |
| MULTI-INCOME | NI/SL applied to the wrong income, totals wrong | `e2e/calculator-critical.spec.ts` + store/unit tests | PAYE vs Self Assessment separation is a common bug class |
| UX-CORE | Calculator flow broken, results missing, table layout broken | smoke + calculator critical | Keep assertions minimal but meaningful |
| SECURITY-ABUSE | Email/API abuse vectors, injection, CSRF gaps | route tests + targeted E2E | Each test should target a concrete abuse vector |

## Test Authoring Rules

1) Every new test must declare its bug class in the file header comment.
2) Prefer “one assertion cluster” per test (one bug).
3) Prefer stable selectors: `data-testid` (inputs, critical CTAs, key rows).
4) Avoid testing implementation details (CSS class names, internal hook calls).
5) If a test is flaky, quarantine it with a clear reason and a follow-up task.

