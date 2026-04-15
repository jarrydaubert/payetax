---
name: codebase-cleanup-sweep
description: "Use when the user wants a broad codebase cleanup or quality pass: deduplicate code, consolidate shared types, remove verified unused code, check circular dependencies, strengthen weak types, remove unnecessary defensive try/catch patterns, delete deprecated or fallback code, and clean up low-signal comments or AI slop."
metadata:
  version: 1.0.0
  source: local
---

# Codebase Cleanup Sweep (PayeTax)

Run a repo-wide cleanup pass focused on code quality, not novelty.

Default posture:
- verify before deleting
- prefer fewer, higher-confidence changes
- keep tax accuracy and source-of-truth boundaries intact
- avoid abstraction unless it clearly reduces complexity

## Use This Skill For

- "clean up the codebase"
- "improve code quality"
- "do a repo-wide cleanup pass"
- "deduplicate and consolidate code"
- "find unused/deprecated/legacy code and remove it"
- "strengthen weak types"
- "untangle circular dependencies"
- "remove AI slop / bad comments / stale breadcrumbs"

## Required Ground Rules

1. Read `AGENTS.md` first.
2. Treat `src/constants/taxRates.ts` and `src/lib/taxCalculator.ts` as protected source-of-truth files.
3. Never present a tool result or runtime claim as fact unless you actually ran it.
4. Be conservative with deletions. A tool flag is evidence to investigate, not proof.
5. Do not revert unrelated user changes.

## Eight Workstreams

Cover these areas explicitly:

1. Deduplication and DRY
2. Shared type consolidation
3. Unused code removal
4. Circular dependency cleanup
5. Weak type removal
6. Unnecessary try/catch and defensive fallback cleanup
7. Deprecated, legacy, and fallback-path cleanup
8. Comment / AI slop / low-signal annotation cleanup

## Recommended Workflow

### 1) Map the repo

Inspect:
- `package.json`
- `tsconfig.json`
- `src/` structure
- existing dirty worktree state

Identify likely hotspots before editing:
- broad stores
- validation barrels
- duplicated formatters/helpers
- API parsing boundaries
- comment-heavy utility files

### 2) Research each workstream

For each area, produce:
- Verified findings
- Non-findings where the code is already acceptable
- High-confidence recommendations only

Do not force all eight categories to produce code changes.

### 3) Use tools as evidence, not authority

Helpful commands:

```bash
bun run audit:unused
bunx madge --circular --extensions ts,tsx src
rg -n "\b(any|unknown)\b" src
rg -n "\btry\b|\bcatch\b" src scripts e2e
rg -n "TODO|FIXME|legacy|deprecated|fallback|temporary|workaround" src docs scripts
```

Rules:
- Confirm unused code with `rg` and test/runtime references before deleting.
- Confirm circular-dependency claims with actual graph evidence.
- Keep `unknown` at real runtime boundaries when it is the correct type.

### 4) Implement only the confident edits

Good candidates:
- repeated local formatters replaced by existing shared helpers
- duplicated type literals promoted into shared domain types
- dead exports/files with zero real references
- compatibility shims with no remaining callers
- swallowed internal errors in pure functions
- stale comments that only narrate obvious code or obsolete migrations

Avoid:
- abstracting domain-local UI just to reduce line count
- replacing boundary-safe parsing/error code with overconfident types
- broad tax-rule edits without official verification

### 5) Validate

Baseline:

```bash
bun run fix-all
bun run test:no-coverage
```

Add targeted validation for touched areas when useful, for example:

```bash
bunx jest --no-coverage --runInBand <paths>
bunx madge --circular --extensions ts,tsx src
bun run audit:unused
```

If full validation fails, separate:
- failures caused by the cleanup
- failures already present in the repo

## Output Expectations

Return:
1. Critical assessment grouped by workstream
2. Implemented high-confidence changes
3. Validation run and exact failures
4. Residual risks / follow-up items

Keep the findings evidence-based. If a category produced no justified edits, say so plainly.
