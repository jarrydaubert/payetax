# Homepage Calculator Loading Path Decision Record

Date: 2026-03-30  
Backlog item: `P1-37`

## Decision

Simplify the homepage calculator loading path by removing scroll-gated deferral on `/` and rendering the `#tax-calculator` section shell in the initial HTML. Keep the hero server-rendered for a strong LCP story, but stop requiring `DeferredContent`, `HomePageContent` hash recovery, and navbar-side `MutationObserver` logic to make calculator navigation work.

## Baseline

Previous homepage flow:

- `src/app/page.tsx` rendered `ServerHero` immediately, then wrapped the calculator in `DeferredContent`.
- `DeferredContent` only mounted the calculator after scroll or hash-based force render.
- `HomePageContent` retried `#tax-calculator` scrolling on mount and on `hashchange`.
- `SimpleNavbar` had to fall back to `MutationObserver` plus hash mutation when the calculator was not yet in the DOM.

Observed baseline risk:

- A plain homepage load (`/`) did not guarantee that `#tax-calculator` existed in the initial document.
- Cold hash navigation and in-page calculator clicks worked only because three separate components coordinated around the deferred mount path.

## Compared Variant

Shipped variant:

- `src/app/page.tsx` now renders the calculator shell directly with `id="tax-calculator"`.
- `HomePageContent` is reduced to store init + `CalculatorContainer`.
- `SimpleNavbar` now uses direct scroll on `/` and native `/#tax-calculator` routing off-home.
- `DeferredContent` is removed from the homepage path.

## Why This Variant Won

- Simpler route and anchor behavior: the calculator anchor exists in the initial HTML.
- Lower coordination cost: no observer/retry chain across navbar, wrapper, and content component.
- Preserves the intended LCP tradeoff: the hero remains server-rendered while the interactive calculator code still loads through a dynamic client boundary.

## Regression Protection

- Unit coverage:
  - `src/app/__tests__/page.test.tsx`
  - `src/components/organisms/__tests__/SimpleNavbar.test.tsx`
- Existing critical-path anchor coverage still exercises `/#tax-calculator` loads:
  - `e2e/calculator-critical.spec.ts`
  - `e2e/golden-master-PERFECT.spec.ts`

## Measurement Evidence Path

Use a local production-like run plus targeted browser checks:

```bash
bun run test:no-coverage
bunx playwright test e2e/calculator-critical.spec.ts --project=chromium --workers=1
```

Manual spot-check path for this change:

1. Load `/`.
2. Confirm `#tax-calculator` exists in the initial document.
3. Load `/#tax-calculator`.
4. Confirm the calculator section is present and visible without retry logic or delayed scroll orchestration.
