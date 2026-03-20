---
name: engineering
version: 1.1.0
description: Use for engineering reviews, implementation guidance, or performance work touching Next.js, React, TypeScript, validation, caching, bundle size, and runtime safety in PayeTax.
---

# Engineering

Use this skill for broad engineering reviews and implementation guidance. Optimize for shipped correctness first, then performance, then maintainability.

## Operating Rules

- Read `AGENTS.md` first.
- Treat `src/constants/taxRates.ts` and `src/lib/taxCalculator.ts` as protected source-of-truth files.
- Do not present runtime claims as facts unless you ran the relevant command.
- Prefer repo-specific evidence over generic framework advice.
- Do not recommend stale Next.js patterns. Verify current guidance before suggesting migrations.

## Actual PayeTax Stack

- **Next.js 16 App Router**
  - Dev may use Turbopack.
  - Production build currently runs `next build --webpack`.
- **React 19**
- **TypeScript 5.9** strict mode
- **Tailwind CSS 4**
- **Zustand 5**
- **Zod 4**
- **Jest + Playwright + Bun**
- **Vercel + Sentry**

## Repo Truths To Start From

- Homepage hero is server-rendered in `src/app/page.tsx` via `src/components/molecules/ServerHero.tsx`.
- The main calculator already uses `useTransition` in `src/components/organisms/CalculatorContainer.tsx`.
- Charts, feedback, and homepage content are dynamically imported.
- Route-level error UIs already report to Sentry.
- `src/store/calculatorStore.ts` is large and mixes validation, persistence, analytics, and orchestration.
- Blog caching still uses `unstable_cache` in `src/lib/blog.ts` and `src/lib/mdx.ts`.
- Some client components still import schemas from the broad validation barrel `@/lib/validation`.

## Evidence Discipline

When reviewing or recommending changes:

- `Verified`: observed in the repo
- `Inferred`: plausible from nearby code, but not directly proven
- `Unverified`: requires runtime, measurement, or production access

Never claim:

- bundle savings without `bun run bundle:analyze`
- CWV wins without measurement
- Lighthouse outcomes without running Lighthouse
- exhaustive route/component coverage unless you enumerated the full set

## Priority Order

### 1. Correctness and user trust

Prefer findings that affect:

- tax output correctness
- user-visible flow integrity
- privacy or security boundaries
- release safety

Generic “clean code” notes are secondary unless they create a real regression risk.

### 2. High-value engineering issues

Prioritize:

- stale or deprecated framework APIs
- broad client bundle leaks from server-only or umbrella modules
- avoidable async waterfalls on high-traffic routes
- oversized integration surfaces that make regressions hard to contain

### 3. Low-signal style advice

Deprioritize:

- route groups for their own sake
- config file language preferences (`.js` vs `.ts`) unless there is actual friction
- abstract SOLID commentary without a concrete failure mode

## Current Framework Guidance

### Caching

- `unstable_cache` should be treated as legacy.
- For Next 16 caching recommendations, use the current Cache Components / `use cache` model and official docs.
- Do not recommend old PPR migrations that depend on deprecated route-level flags unless you verify they still apply.

### PPR / streaming

- Treat old `ppr: 'incremental'` guidance as suspect until verified against current Next docs.
- If proposing streaming improvements, separate:
  - static shell / cache model changes
  - async boundary refactors
  - measured user-facing benefit

### Import optimization

- `optimizePackageImports` is for third-party packages.
- Do not suggest it for local alias modules like `@/lib/validation`.
- For local code, prefer direct imports or a smaller export surface.

## Review Workflow

For engineering audits:

1. Confirm the actual build/runtime path from `package.json` and `next.config.ts`.
2. Inspect the route or module named in the claim.
3. Separate local-code proof from ecosystem/version proof.
4. Check whether the recommendation is still current for the installed framework version.
5. Prefer a short list of concrete, defensible actions over broad modernization wishlists.

## Implementation Guidance

### Performance

- Keep LCP candidates server-rendered and unblocked.
- Use dynamic imports for heavy, non-critical UI only when they actually defer work.
- If a route has multiple independent async operations, parallelize or stream them where it reduces blocking without harming primary content.

### State

- Keep stores as thin orchestration layers where practical.
- Avoid pushing more validation, analytics, and persistence concerns into already-large stores.
- Prefer selectors and `useShallow` for broad stores.

### Validation

- Keep client imports narrow.
- Avoid broad validation barrels in client components when only one schema is needed.
- Use Zod at external boundaries, but do not claim “all API boundaries” unless every route was checked.

### Dependency upgrades

- Verify upgrade pressure with `bun outdated`.
- Treat major upgrades individually, not as one bulk task.
- Require changelog review and repo validation after each major upgrade.

## Required Validation

For code changes:

```bash
bun run fix-all
bun run test:no-coverage
```

Add the smallest relevant higher-level gate when the change touches:

- homepage, calculator, or director critical flows
- build/caching/runtime config
- release-sensitive behavior

Typical additions:

```bash
bun run build
bun run test:e2e:critical
bun run bundle:analyze
```

## Key Files

- `next.config.ts`
- `package.json`
- `tsconfig.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/molecules/ServerHero.tsx`
- `src/components/organisms/CalculatorContainer.tsx`
- `src/store/calculatorStore.ts`
- `src/lib/blog.ts`
- `src/lib/mdx.ts`
- `src/lib/validation/`

## PayeTax Context

- Accuracy beats novelty.
- “More modern” is not sufficient justification by itself.
- If a framework recommendation conflicts with the repo’s verified build path or shipped behavior, trust the repo first and verify the framework docs second.
- For backlog-worthy findings, prefer items with a concrete oracle, a named regression target, and validation that can actually be run in this repo.
