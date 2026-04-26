---
name: engineering
version: 1.1.0
description: Use for engineering reviews, implementation guidance, dependency-upgrade fallout, or performance work touching Next.js, React, TypeScript, Tailwind, validation, caching, bundle size, and runtime safety in PayeTax.
---

# Engineering

Use this skill for broad engineering reviews and implementation guidance. Keep advice evergreen: discover the installed stack from the repo, apply durable framework practices, and optimize for shipped correctness first, then performance, then maintainability.

## Operating Rules

- Read `AGENTS.md` first.
- Treat `src/constants/taxRates.ts` and `src/lib/taxCalculator.ts` as protected source-of-truth files.
- Do not present runtime claims as facts unless you ran the relevant command.
- Prefer repo-specific evidence over generic framework advice.
- Do not recommend version-sensitive framework migrations without checking the installed version and current official guidance.
- Keep comments and docs evergreen: explain durable invariants, constraints, and non-obvious tradeoffs; avoid progress notes, temporary TODOs, and comments that repeat the code.

## Stack Discovery

Before version-sensitive work, verify the current stack instead of trusting this file:

- Read `package.json` for installed versions, scripts, and package-manager expectations.
- Read `next.config.ts` before advising on Next.js build, caching, images, redirects, or compiler behavior.
- Check whether the failing path is dev/Turbopack, production build/Webpack, Jest, Playwright, or Bun runtime.
- Inspect package exports or installed files before changing deep imports after dependency updates.
- Treat `AGENTS.md`, `docs/guides/TESTING.md`, and `docs/guides/OPS_RUNBOOK.md` as the repo contract for validation and workflow.

## Stack Defaults

Use these as durable defaults unless the repo proves otherwise:

- Next.js App Router with Server Components by default; add client boundaries only where interactivity, browser APIs, or client state require them.
- React should favor simple derived rendering, narrow effects, explicit transitions for expensive UI updates, and accessible component composition.
- TypeScript should stay strict, narrow at boundaries, and avoid weak escape hatches such as broad `any`, unsafe casts, or duplicated domain types.
- Tailwind should use the local token/design system patterns; avoid one-off styling that makes future UI changes harder.
- Zod belongs at external or persistence boundaries; avoid importing broad schema barrels into client code when a narrow import is available.
- Zustand stores should stay focused on orchestration and state, with business rules and validation kept in testable modules where practical.
- Jest covers user-visible behavior and pure business logic; Playwright covers critical journeys, browser integration, and layout-sensitive flows.
- Bun is the package/script runner; verify behavior with the repo scripts rather than assuming npm-compatible edge cases.

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

## Modern Framework Guidance

### Caching

- Treat caching guidance as version-sensitive. Verify the installed Next.js docs before proposing migrations.
- Prefer explicit cache boundaries and invalidation behavior that can be tested or reasoned about from the route contract.
- When replacing legacy cache APIs, separate correctness, freshness, and performance benefits.

### PPR / streaming

- Treat old PPR guidance as suspect until verified against the installed Next.js version.
- If proposing streaming improvements, separate:
  - static shell / cache model changes
  - async boundary refactors
  - measured user-facing benefit

### Import optimization

- `optimizePackageImports` is for third-party packages.
- Do not suggest it for local alias modules like `@/lib/validation`.
- For local code, prefer direct imports or a smaller export surface.
- For third-party deep imports, verify the package's current shipped files/exports after upgrades.

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
- Do not claim bundle, rendering, or Core Web Vitals wins without measuring the relevant path.

### State

- Keep stores as thin orchestration layers where practical.
- Avoid pushing more validation, analytics, and persistence concerns into already-large stores.
- Prefer selectors and `useShallow` for broad stores.

### Validation

- Keep client imports narrow.
- Avoid broad validation barrels in client components when only one schema is needed.
- Use Zod at external boundaries, but do not claim “all API boundaries” unless every route was checked.

### Comments and maintainability

- Add comments for durable business rules, tax assumptions, privacy/security constraints, browser quirks, or framework behavior that is not obvious from the code.
- Remove stale comments, progress markers, commented-out code, and comments that merely translate syntax into English.
- Prefer names and module boundaries over comments when clearer code can carry the meaning.
- Keep evergreen docs free of TODOs or status notes; put open work in `docs/BACKLOG.md`.

### Dependency upgrades

- Verify upgrade pressure with `bun outdated`.
- Treat major upgrades individually, not as one bulk task.
- After `bun update` or any broad dependency bump, expect package exports, type globals, lint schemas, and framework defaults to shift.
- For resolver failures, inspect the installed package shape and smoke the runtime that failed, especially if dev/Turbopack and production/Webpack differ.
- Require changelog review and repo validation after each major upgrade or version-sensitive runtime change.

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
