---
description: Evidence-driven audit of shipped code, architecture, or a scoped target
argument-hint: [target]
---

# /audit - Evidence-Driven Audit

**CRITICAL INSTRUCTIONS:**
- Do NOT use planning/spec modes or persist artifacts to disk.
- Output the audit directly in this conversation as markdown.
- Do NOT write or modify application code.
- Audit shipped flows only by default. Tax Pack is deferred unless the user explicitly asks for it.
- Do NOT claim exhaustive coverage unless you actually enumerated and checked the whole scoped set.
- Do NOT write phrases like "all routes", "all components", "none found", or "fully read" unless your evidence section proves that exact scope.

## Usage

```text
/audit [target]
```

**Allowed targets:**
- `app` - shipped application audit across the main calculator, director flow, APIs, shared validation, and app shell
- `calculator` - tax calculator system (`taxRates.ts`, `taxCalculator.ts`, calculator UI/store)
- `director` - Director Intelligence (`/tools/director-guide`, related calculator modules, send-director-results)
- `emails` - newsletter + transactional email flows
- `api` - shipped API routes under `src/app/api/` (exclude Tax Pack unless explicitly requested)
- `security` - security/privacy focus (headers, tokens, logging, rate limiting, origin checks)
- `performance` - performance patterns and obvious bundle/hydration risks
- `components` - component architecture and client/server boundaries
- `[file path]` - specific file audit

## Audit Contract

1. Read `AGENTS.md` first for repo guardrails and source-of-truth paths.
2. State the exact target and exclusions before making claims.
3. Separate claims into:
   - `Verified` - directly observed in the checked files
   - `Partially verified` - some of the scoped set was checked, but not all
   - `Inferred` - reasonable conclusion from nearby evidence, not directly confirmed end-to-end
   - `Unverified` - needs runtime, measurement, production access, or files not read
4. If a claim depends on an external source, cite it and keep that separate from local-code evidence.
5. If you did not inspect a whole set, quantify the subset. Example: `5/8 shipped POST routes checked`.

## Evidence Rules

- `Files examined` must list only files actually opened or directly searched.
- `Repo-wide search hits` are allowed, but do not treat search results as proof of behavior without opening the relevant files.
- `What could NOT be verified` must include runtime-only claims such as CWV, accessibility behavior under interaction, bundle size, and distributed systems behavior unless those checks were actually run.
- If line numbers are not stable or not directly known, use `file + symbol + short snippet`.
- Max 25 findings in the main table. Collapse the rest into `Additional Notes`.

## Severity Definitions

| Level | Criteria |
|-------|----------|
| **CRITICAL** | Security exploit, tax correctness error with material user impact, data loss, legal/compliance exposure |
| **HIGH** | User-facing correctness gap, broken or misleading flow, trust or release-safety issue |
| **MEDIUM** | Partial correctness risk, maintainability debt with real regression potential, incomplete safeguards |
| **LOW** | Minor refactor, documentation drift, low-risk cleanup |

## Required Output Format

### 1. Scope & Evidence
- `Target`
- `Default exclusions` or explicit inclusions
- `Files examined directly`
- `Searches used`
- `External sources consulted` (only if used)
- `What was inferred or partially checked`
- `What could not be verified without runtime/production access`

### 2. Prioritized Summary
- `Stop-ship items`
- `Top risks`
- `Top quick wins`

### 3. Findings Table

| Issue | Severity | Location | Evidence Status | Why It Matters | Recommendation |
|-------|----------|----------|-----------------|----------------|----------------|

**Evidence Status values:**
- `Verified`
- `Partially verified`
- `Inferred`
- `Unverified`

### 4. Checklist Verdicts

Use this format, not blanket checkmarks:

- `Tax correctness`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Security & privacy`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Validation`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Architecture`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `TypeScript`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Accessibility`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Performance`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:
- `Error handling`: Verified / Partially verified / Unverified
  Evidence:
  Gaps:

### 5. Non-goals & Assumptions
- What was intentionally out of scope
- Assumptions that would change the verdict

## Wording Constraints

- Never say `all` unless you checked the entire set.
- Never say `none found` unless you ran a search or review that justifies that exact negative claim.
- Never say `covered` if the test was not opened or executed.
- Never promote `Partially verified` to `Verified` in the summary.
- If scope excludes Tax Pack, do not cite Tax Pack files as findings. Mention them only in `Deferred/Excluded`.

## PayeTax-Specific Focus Areas

### Tax Correctness
- Rates and thresholds must come from `src/constants/taxRates.ts`.
- Main calculator behavior must be checked against `src/lib/taxCalculator.ts`.
- If you inspect helper calculators too, distinguish them from the main shipped PAYE engine.
- For HMRC-sensitive claims, prefer official HMRC or GOV.UK sources.

### Security & Privacy
- Treat browser-facing POST routes separately from machine-to-machine/webhook endpoints.
- Origin checks, body limits, rate limiting, and token handling should be reported per route family, not as one blanket statement.
- Do not claim `no PII in logs` unless log payloads and logged values were actually reviewed for the scoped routes.

### Testing & Regression Claims
- Do not claim `golden master coverage exists` or similar unless the test file was opened.
- Distinguish `test file exists`, `test asserts the right oracle`, and `test was executed`.

### Architecture
- Atomic design and SOLID are secondary to correctness. Only raise them when they create a concrete regression or maintainability risk.
- Prefer findings tied to shipped behavior, source-of-truth drift, or fragile boundaries over generic style commentary.

## Recommended Starting Files

### `app`
- `AGENTS.md`
- `src/constants/taxRates.ts`
- `src/lib/taxCalculator.ts`
- `src/lib/validation.ts`
- `src/store/calculatorStore.ts`
- `next.config.ts`
- shipped `src/app/api/**/route.ts*` files, excluding Tax Pack unless requested

### `calculator`
- `src/constants/taxRates.ts`
- `src/lib/taxCalculator.ts`
- `src/lib/tax/incomeTax.ts`
- `src/lib/tax/studentLoan.ts`
- `src/components/organisms/CalculatorContainer.tsx`
- `src/store/calculatorStore.ts`

### `director`
- `src/app/tools/director-guide/page.tsx`
- `src/store/directorGuideStore.ts`
- `src/lib/tax/strategyComparison.ts`
- `src/lib/tax/directorCalculator.ts`
- `src/app/api/send-director-results/route.ts`

### `emails`
- `emails/*.tsx`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/newsletter/unsubscribe/route.ts`
- `src/app/api/send-results/route.ts`
- `src/app/api/send-director-results/route.ts`

### `api`
- shipped `src/app/api/**/route.ts*`, excluding Tax Pack unless requested
- `src/lib/rateLimit.ts`
- `src/lib/security/origin.ts`
- `src/lib/security/botGuard.ts`
- `src/lib/security/clientIdentifier.ts`

### `security`
- `next.config.ts`
- `src/lib/rateLimit.ts`
- `src/lib/security/`
- shipped public API routes

### `performance`
- `next.config.ts`
- top-level route components/layouts
- major client components and stores

### `components`
- `src/components/atoms/`
- `src/components/molecules/`
- `src/components/organisms/`
- root layout and major route entry points
