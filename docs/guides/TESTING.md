# Testing Guide

## Test Philosophy

> **"What bug will this test find?"**

Tests should catch real regressions in calculation, UX, or security behavior.

## Good Test Standard

A good test in PayeTax should be:

- bug-oriented: it targets a concrete regression or failure mode
- layer-appropriate: unit, integration, or E2E is chosen on purpose
- based on an explicit oracle: pass/fail is tied to a meaningful business or user-visible outcome
- actionable when it fails: the failure tells you what broke
- deterministic: no silent skips, optional success paths, or vague "app still renders" assertions

Reject low-signal tests:

- broad click-through coverage with no named bug target
- inventory/presence tests as the sole oracle for important behavior
- tests that stay green even when the real user outcome is broken
- test-count or coverage vanity without regression-detection value
- mocks that assert the mocked behavior instead of the production contract

If a test cannot explain what bug it is trying to catch and why this is the right layer, it should be rewritten or deleted.

See also:
- `docs/guides/BUG_CATALOG.md`
- `docs/guides/POST_RELEASE_VALIDATION.md`

---

## Definition Of Done (Tests)

A test task is only done when all criteria below are met:

- Bug-linked intent: every new/updated test clearly answers "What bug will this test find?" in title or nearby context.
- Explicit oracle + layer fit: assertions prove a meaningful business or user-visible outcome, and the chosen layer is deliberate rather than convenience-driven.
- Executable coverage: no placeholder assertions; tests are runnable and assertions are active.
- Deterministic status: no new `skip`/`todo`; any retained debt is tagged (`PAYTAX-###` or `P#-#`) and allowlisted with rationale.
- Monetary assertions: use `toBeCloseTo(expected, 2)` for currency/tax amounts; avoid integer precision (`..., 0`/`..., 1`) in tax-critical suites.
- Relevant gates pass:
  - Unit-focused changes: `bun run test:no-coverage`
  - Critical user-path/UI changes: `bun run test:e2e:critical`
  - Full confidence gate before closure: `bun run test:ci` and `bun run test:e2e` (CI or equivalent environment)
- Debt/accounting updated: `scripts/test-debt-allowlist.ts`, `docs/BACKLOG.md`, and related docs reflect the new truth.

For backlog closure, automated tests are the default proof path. Add or update the narrowest test that would have failed before the fix:

- pure calculation or parser bug: unit test
- component state or rendering bug: component/integration test
- routing, browser API, critical journey, or cross-page behavior: E2E or scripted browser test
- SEO metadata, sitemap, redirects, or canonical behavior: route/config/sitemap test plus live validation when relevant

Use manual validation only when automation is the wrong layer, and keep the validation steps in the PR or linked Linear issue rather than creating standalone evidence docs.

Target state for "no issues found" audits:
- `bun run check:test-skips` passes with no unexpected debt.
- `bun run test:metrics` reports `Playwright last run: status=passed` and `failedTests=0`.
- No unresolved P0/P1 test-quality backlog items remain open.

---

## Running Tests

```bash
bun run test:no-coverage    # Unit tests (fast)
bun run test:ci             # Full unit suite with coverage (CI-safe)
bun run test:e2e:critical   # Critical-path E2E suite (smoke + golden)
bun run test:e2e:visual     # Visual regression pilot (Chromium snapshots)
bun run test:e2e            # Full multi-browser E2E
bun run test:quick          # Fast local gate: unit fast + critical E2E
bun run test:full           # Full gate: coverage unit + full E2E
bun run check:repo          # Repo verification gate
bun run harness:local       # Repo gate + quick tests + build
bun run harness:release     # Release-oriented harness gate
bun run check:test-skips    # Guardrail: block new skip/todo debt
bun run test:metrics        # Print skip/todo + last-run confidence metrics
bun run fix-all             # Lint + typecheck + format
bun run clean:test          # Clear old test artifacts
```

Notes:
- `bun run test` is still available when you want local coverage + HTML report auto-open.
- `bun run test:ci` is intended for full-suite runs; partial-file runs can fail coverage thresholds by design.
- `bun run fix-all` now includes `check:test-skips`, so new unapproved skip/todo debt fails locally and in CI.
- `bun run check:repo` is the non-auto-fixing equivalent of the repo verification part of `fix-all`.
- GitHub `CI` runs `bun run audit:deps` as a separate dependency-advisory gate after repo checks.
- `bun run harness:local` is the recommended pre-refactor confidence gate.
- `bun run harness:release` keeps the dependency advisory check in the stricter release-oriented validation path.
- `bun run test:e2e:visual:update` refreshes the checked-in Chromium baselines after an intentional UI change.

### Visual Regression Pilot

Current pilot surfaces:

- homepage hero
- homepage calculator results
- Director Intelligence dashboard main results

Commands:

```bash
bun run test:e2e:visual
bun run test:e2e:visual:update
```

Use the update command only when a visual change is intentional and the new screenshots have been reviewed.

---

## Skip/Todo Policy

- No new `test.skip` / `it.skip` / `it.todo` without explicit approval and debt tracking.
- E2E skips must include a reason (`test.skip(condition, 'reason')`), never bare `test.skip()`.
- Skip/todo entries must include an issue tag in title/reason: `PAYTAX-###` or backlog ID format `P#-#`.
- No commented-out assertions in test files (e.g. `// expect(...)`); convert to real assertions or `it.todo`.
- Baseline debt allowlist lives in:
  - `scripts/test-debt-allowlist.ts`
- Enforcement lives in:
  - `scripts/check-test-skips.ts`

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

### HMRC Rounding Divergence Policy

- Core rule: engine outputs are monthly-first then annualized; assertions must follow engine behavior, not pure annual arithmetic.
- Tax/NI/net assertions: use `toBeCloseTo(expected, 2)` with expected values derived from the current engine rounding model.
- Published annual examples: if HMRC annual formula differs by a few pence from monthly-annualized output, assert the engine value and document the reason in the test comment.
- Golden master (`e2e/golden-master-PERFECT.spec.ts`) is the canonical regression baseline for these rounding-sensitive scenarios.

---

## Quality Gates (Recommended)

- `bun run check:repo`
- `bun run test:no-coverage`
- `bun run build`
- `bun run test:e2e:critical`
- `bun run release:report:init` (before manual post-release checks)
- Confirm `docs/guides/VERCEL_MIGRATION.md` is complete before the first GitHub-sourced production deploy
- `RATE_LIMIT_VERIFY_BASE_URL="https://payetax.co.uk" RATE_LIMIT_HEALTH_SECRET="..." bun run check:production-env-contract` (against the intended Vercel Production project before release completion)
- `bun run release:report:check` (after checklist completion)
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
