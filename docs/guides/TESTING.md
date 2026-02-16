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
bun audit                   # Dependency vulnerability scan (requires network access)
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

---

## Bundle Size Verification (Repeatable)

Run this flow on release branches and before tagging:

```bash
bun run build           # Produces .next build artifacts
bun run bundle:analyze  # Enforces bundle thresholds and updates bundle-history.json
```

Pass criteria:
- `bun run bundle:analyze` exits with code `0`
- `bundle-history.json` gets a new measurement entry

Fast single-command variant:

```bash
bun run bundle:monitor  # Runs build + bundle analysis in one step
```

---

## Lighthouse Repro (Clean Browser)

Use a clean Chrome context to avoid extension noise in `TBT` and other metrics.

```bash
bunx lighthouse https://payetax.co.uk \
  --preset=desktop \
  --chrome-flags="--headless=new --incognito --disable-extensions" \
  --output=json --output-path=./lighthouse-desktop.json

bunx lighthouse https://payetax.co.uk \
  --preset=perf \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --chrome-flags="--headless=new --incognito --disable-extensions" \
  --output=json --output-path=./lighthouse-mobile.json
```

Validation checklist:
- Run at least 2 passes per strategy and compare medians.
- Keep network/throttling preset unchanged between runs.
- Treat extension-influenced runs as non-comparable.
