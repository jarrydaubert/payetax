# Testing Guide

## Test Philosophy

> **"What bug will this test find?"**

Tests should catch real regressions in calculation, UX, or security behavior.

See also:
- `docs/guides/BUG_CATALOG.md`
- `docs/guides/POST_RELEASE_VALIDATION.md`

---

## Running Tests

```bash
bun run test:no-coverage    # Unit tests (fast)
bun run test:ci             # Full unit suite with coverage (CI-safe)
bun run test:e2e:critical   # Critical-path E2E suite (smoke + golden)
bun run test:e2e            # Full multi-browser E2E
bun run test:quick          # Fast local gate: unit fast + critical E2E
bun run test:full           # Full gate: coverage unit + full E2E
bun run fix-all             # Lint + typecheck + format
bun run clean:test          # Clear old test artifacts
```

Notes:
- `bun run test` is still available when you want local coverage + HTML report auto-open.
- `bun run test:ci` is intended for full-suite runs; partial-file runs can fail coverage thresholds by design.

---

## Cleaning Test Artifacts

Use these when stale reports/traces or auth state pollute local runs.

```bash
bun run clean:reports   # Clears coverage + Playwright reports/test-results/blob-report
bun run test:e2e:clear  # Clears Playwright artifacts + storageState
bun run clean:test      # One-shot cleanup for unit + E2E test artifacts
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
- `bun run test:e2e:critical`
- Post-release production validation checklist (manual/high-confidence checks)

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
