# Testing Guide

## Test Philosophy

> **"What bug will this test find?"**

Tests should catch real regressions in calculation, UX, or security behavior.

See also:
- `docs/guides/BUG_CATALOG.md`
- `docs/guides/TESTING_MATRIX.md`

---

## Running Tests

```bash
bun run test                # Unit tests with coverage
bun run test:no-coverage    # Unit tests (fast)
bun run test:e2e            # E2E tests
bun run test:dev            # E2E (single browser)
bun run fix-all             # Lint + typecheck + format
```

---

## HMRC Verification

The golden master suite is the regression oracle for calculation accuracy.
- Test file: `e2e/golden-master-PERFECT.spec.ts`
- Fixtures: `e2e/fixtures/`

Keep HMRC values anchored to source documents and code references.

---

## Quality Gates (Recommended)

- `bun run test:no-coverage`
- `bun run build`
- Targeted Playwright suites for critical flows
