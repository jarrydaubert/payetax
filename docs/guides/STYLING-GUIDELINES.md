# PayeTax Styling Guidelines

Purpose:
- keep styling decisions predictable,
- point contributors at the rules we can actually verify,
- keep exceptions visible in the backlog instead of hidden in prose.

## Canonical UI Direction

1. Use shadcn-style primitives from `@/components/ui/*` first.
2. Prefer semantic theme classes such as `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, and `text-primary`.
3. Use design tokens only for genuinely shared patterns such as typography, spacing, and layout.
4. Use inline Tailwind only for narrow one-off styling that is not worth turning into a shared token or variant.

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
- explicit brand accents already allowlisted in the token audit
- chart/data-viz colors
- constrained marketing one-offs that do not have a sensible semantic token yet

Enforcement:
- `bun run audit:tokens`

### 2. New interactive UI should use the canonical UI import surface

Prefer:

```tsx
import { Button } from '@/components/ui/button';
```

Do not add new imports from the legacy shim surface unless there is a documented reason.

Current exception:
- older `@/components/atoms/ui/*` imports still exist and are tracked in backlog item `P2-19`

### 3. Shared patterns must earn tokens

Use tokens for:
- typography
- spacing
- icon sizing
- repeated layout primitives

Do not create tokens for:
- one-off decorative styling
- arbitrary widths/heights used once
- component-specific visual effects

Evidence path:
- code review plus `bun run audit:tokens` for raw-palette drift

## Verification

Use the smallest relevant checks for the change:

```bash
bun run audit:tokens
bun run fix-all
```

For visually risky UI changes, also run the smallest relevant browser check, for example:

Run the app locally or inspect the Vercel preview, check the affected route at desktop and mobile sizes, and record the reviewed states in the PR.

## Backlog Exceptions

- `P2-19`: consolidate the remaining mixed UI import surface
- `P2-32`: continue replacing shipped raw palette classes with semantic usage
- `P2-33`: continue design-token hygiene cleanup

If a styling rule is not backed by an existing script, test, or named backlog exception, it should not be treated as a hard constraint in this guide.
