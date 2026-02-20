---
name: tdd
description: "When the user wants test-driven development for a feature or bug fix. Also use when the user mentions 'TDD,' 'red green refactor,' 'test-first,' or asks how to add tests that catch real regressions."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for PayeTax)
---

# Test-Driven Development (PayeTax)

Use Red -> Green -> Refactor in thin vertical slices.

Core rule: every test must answer "what bug will this test catch?"

## Workflow

### 1) Define the behavior before code

Capture:
- User-visible behavior to protect
- Specific regression/bug the test should catch
- Layer where the test belongs (unit/integration/e2e)

If you cannot name a realistic bug, do not write that test.

### 2) Pick one slice

Write exactly one failing test for one behavior.
Prefer public interfaces over internal helpers.

### 3) Green with minimum code

Implement only enough to pass the current test.
Do not add speculative behavior for future tests.

### 4) Refactor safely

Once green, clean up duplication and improve structure.
Re-run the relevant tests after each refactor step.

### 5) Repeat

Add the next behavior as another Red -> Green -> Refactor loop.

## Good Test Heuristics

- Tests behavior, not implementation details
- Uses production code paths where practical
- Fails for the intended bug
- Keeps assertions specific and observable
- Avoids brittle timing or call-order assertions unless behavior truly requires it

## Anti-Patterns

- Horizontal slicing: writing many tests first, then all implementation
- Placeholder tests with commented assertions
- `it.todo` without clear intent/owner
- Over-mocking internal modules you control
- Asserting implementation internals that can change without user impact

## PayeTax Context

### Required standards

- Align with `.claude/commands/test.md` and `docs/guides/TESTING.md`.
- Apply the mantra: "What bug will this test catch?"
- Prefer deterministic assertions over fixed sleeps in Playwright.
- For money values, use penny-precision assertions (`toBeCloseTo(expected, 2)` unless exact integer logic is guaranteed).

### Test stack

- Unit/integration: Jest (`bun run test:no-coverage`)
- E2E: Playwright (`bun run test:e2e` or targeted `bunx playwright test ...`)

### Tax-critical changes

When changing `src/lib/taxCalculator.ts` or `src/lib/tax/`:
- Cover threshold boundaries (`±1`) for affected rules
- Add/adjust regression tests near known risk zones (PA taper, NI thresholds, Scottish bands, student loan thresholds)
- Keep rates sourced from `src/constants/taxRates.ts` (never hardcode)

### Governance

- New skips/todos must follow repo policy and debt tracking scripts.
- Avoid adding net-new debt to `scripts/test-debt-allowlist.ts` unless explicitly approved.

## Related Files

- `.claude/commands/test.md`
- `docs/guides/TESTING.md`
- `scripts/check-test-skips.ts`
- `scripts/test-debt-allowlist.ts`
