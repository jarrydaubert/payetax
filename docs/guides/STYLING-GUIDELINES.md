# PayeTax Styling Guidelines

Purpose:
- keep styling decisions predictable,
- point contributors at the rules we can actually verify,
- keep exceptions visible in docs or the active backlog instead of hidden in prose.

## Canonical UI Direction

1. Use shadcn-style primitives from `@/components/ui/*` first.
2. Prefer semantic theme classes such as `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, and `text-primary`.
3. Keep shared styling in CSS theme variables, component variants, or small recipe classes. Do not add a TypeScript styling dictionary.
4. Use inline Tailwind only for narrow one-off styling that is not worth turning into a shared recipe or variant.
5. Keep the current Ledger direction flat, light-first, semantic, and low-radius. Do not reintroduce gradient, glass, glow, or raw cyan/emerald styling.

## Hard Rules

### 1. Semantic colors beat raw palette classes

Default to semantic theme classes.

Do not introduce new raw palette classes such as:
- `text-slate-*`
- `bg-slate-*`
- `text-cyan-*`
- `bg-cyan-*`
- `border-white/[...]`
- `bg-[#...]`

Allowed exceptions:
- chart/data-viz colors
- constrained marketing one-offs that do not have a sensible semantic token yet

Enforcement:
- code review, `bun run check:repo`, targeted tests, and visual inspection for UI changes

### 2. New interactive UI should use the canonical UI import surface

Prefer:

```tsx
import { Button } from '@/components/ui/button';
```

Do not add new imports from the legacy shim surface unless there is a documented reason.

Current rule:
- `@/components/ui/*` is the canonical source for UI primitives.
- Do not add new `@/components/atoms/ui/*` primitive imports.

### 3. Shared patterns must earn their abstraction

Use shared CSS or component variants for:
- repeated typography patterns
- repeated spacing/layout recipes
- repeated icon sizing
- repeated surface treatments

Do not create abstractions for:
- one-off decorative styling
- arbitrary widths/heights used once
- component-specific visual effects

Evidence path:
- code review plus the smallest relevant component or browser check

## Verification

Use the smallest relevant checks for the change:

```bash
bun run check:repo
bun run build
bun run fix-all
```

For visually risky UI changes, also run the smallest relevant browser check, for example:

Run the app locally or inspect the Vercel preview, check the affected route at desktop and mobile sizes, and record the reviewed states in the PR.

## Known Exceptions

- Raw palette classes: do not add new raw palette classes without a narrow documented exception.
- Arbitrary layout classes: some legacy width, height, and exact typography classes remain. Clean these opportunistically when touching nearby UI, but do not create broad styling-only churn.
- The old `src/constants/designTokens.ts` dictionary and `scripts/audit-tokens.ts` have been removed. Do not recreate them.

If a styling rule is not backed by an existing script, test, or documented exception, it should not be treated as a hard constraint in this guide.
