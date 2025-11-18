# PayeTax Styling Guidelines

**Last Updated:** November 18, 2025  
**Status:** ✅ ENFORCED - No interpretation allowed

---

## 🎯 Core Philosophy

**PayeTax follows a strict shadcn/ui-first approach with minimal custom styling.**

### The Rules (No Exceptions Without Documentation)

1. **Use shadcn/ui components** for all interactive elements
2. **Use design tokens** for common patterns (5+ uses)
3. **Use inline Tailwind** for one-off decorative elements
4. **Never mix approaches** - pick one and stick to it

---

## ✅ The Right Way (Priority Order)

### 1. shadcn/ui Components FIRST

**Always check if a shadcn component exists before custom styling.**

```tsx
// ✅ CORRECT - Use shadcn Button
import { Button } from '@/components/atoms/ui/button';
<Button variant="outline" size="lg">Click Me</Button>

// ❌ WRONG - Custom div styled as button
<div className="rounded-full border px-6 py-3 hover:bg-accent">
  Click Me
</div>
```

**Available shadcn components:**
- `Button` - All clickable actions
- `Badge` - Labels, tags, status indicators
- `Card` - Content containers
- `Input` - Form inputs
- `Select` - Dropdowns
- `Dialog` - Modals
- `Tooltip` - Help text
- `Alert` - Notices, warnings
- `Separator` - Dividers
- `Tabs` - Navigation tabs

**Rule:** If shadcn has it, USE IT. Don't reinvent.

---

### 2. Design Tokens for Patterns

**Use tokens ONLY for patterns that appear 5+ times.**

```tsx
// ✅ CORRECT - Typography used everywhere
import { TYPOGRAPHY } from '@/constants/designTokens';
<h1 className={TYPOGRAPHY.TEXT_4XL}>Title</h1>

// ✅ CORRECT - Spacing used in multiple layouts
import { SPACING } from '@/constants/designTokens';
<div className={SPACING.GAP_4}>...</div>

// ❌ WRONG - Creating token for 1-2 uses
export const DECORATIVE_CIRCLE = 'rounded-full bg-gradient-to-r...'; // Used once
```

**When to use tokens:**
- Typography sizes/weights (used everywhere)
- Spacing (gaps, padding, margins)
- Icon sizes (standardized across app)
- Common layout patterns (containers, sections)

**When NOT to use tokens:**
- One-off decorative elements
- Component-specific styling
- Loading skeletons
- Background particles/effects

---

### 3. Inline Tailwind for One-Offs

**Use Tailwind directly for unique styling (1-2 uses).**

```tsx
// ✅ CORRECT - Decorative particle (one-off)
<div className="absolute h-2 w-2 animate-pulse rounded-full bg-primary opacity-20" />

// ✅ CORRECT - Loading skeleton (not a pattern)
<div className="h-8 w-24 animate-pulse rounded-full bg-muted" />

// ❌ WRONG - Creating token for this
export const PARTICLE = 'absolute h-2 w-2 animate-pulse rounded-full...';
```

---

## 🚫 What NOT to Tokenize

### 1. Framework Utilities

```tsx
// ✅ LEAVE AS-IS - These are Tailwind syntax
<div className="border-2 border-t">
<input className="focus:ring-2" />
```

**Never tokenize:**
- `border-*` (border width, sides)
- `shadow-*` (generic shadows)
- `rounded-*` when used once
- Responsive prefixes (`md:`, `hover:`)

---

### 2. Component-Specific Colors

```tsx
// ✅ CORRECT - Chart colors (Recharts integration)
<Bar dataKey="tax" fill="hsl(var(--chart-3))" />

// ✅ CORRECT - Badge colors (semantic)
<Badge className="text-green-400">Success</Badge>

// ❌ WRONG - Tokenizing these
export const CHART_TAX_COLOR = 'text-red-500'; // No!
```

**Keep as inline Tailwind:**
- Chart colors (component-specific)
- Alert/badge colors (semantic)
- One-off gradient backgrounds

---

### 3. Arbitrary Values

```tsx
// ✅ CORRECT - Use inline styles for CSS variables (not Tailwind arbitrary values)
<SelectViewport 
  className="p-1"
  style={{ width: 'var(--radix-select-trigger-width)' }}
/>

// ✅ CORRECT - Specific component width
<div className="w-[640px]" /> // Only used here

// ❌ WRONG - Tokenizing edge cases
export const RADIX_WIDTH = 'w-[640px]'; // Don't tokenize one-off widths
```

---

## 📏 Design Token Usage

### Typography

```tsx
import { TYPOGRAPHY } from '@/constants/designTokens';

// ✅ Sizes
<h1 className={TYPOGRAPHY.TEXT_4XL}>Hero Heading</h1>
<p className={TYPOGRAPHY.TEXT_BASE}>Body text</p>

// ✅ Line height
<p className={cn(TYPOGRAPHY.TEXT_LG, TYPOGRAPHY.LEADING_RELAXED)}>
  Comfortable reading
</p>

// ✅ Tracking
<h1 className={cn(TYPOGRAPHY.TEXT_6XL, TYPOGRAPHY.TRACKING_TIGHT)}>
  Tight Large Heading
</h1>
```

---

### Spacing

```tsx
import { SPACING } from '@/constants/designTokens';

// ✅ Gaps
<div className={SPACING.GAP_4}>...</div>

// ✅ Padding
<Card className={SPACING.P_6}>...</Card>

// ✅ Responsive
<section className={SPACING.PY_SECTION}>...</section>
```

---

### Surfaces & Shapes

```tsx
import { SURFACES } from '@/constants/designTokens';

// ✅ For custom components (not shadcn)
<div className={cn('px-4 py-2', SURFACES.SHAPE_CIRCLE)}>
  Custom Pill
</div>

// ❌ Don't use with shadcn components
<Badge className={SURFACES.SHAPE_CIRCLE}> // Already has shape!
```

---

## 🎨 Color Guidelines

### Always Use Semantic Colors

```tsx
// ✅ CORRECT - Theme-aware
<div className="bg-background text-foreground">
<Button className="text-primary">Click</Button>

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-black">
<Button className="text-blue-500">Click</Button>
```

**Semantic colors:**
- `background` / `foreground` - Base colors
- `primary` / `primary-foreground` - Brand
- `muted` / `muted-foreground` - Secondary UI
- `accent` / `accent-foreground` - Highlights
- `destructive` - Errors, delete actions
- `border` - Dividers, outlines

---

## 📋 Decision Flowchart

```
New styling needed?
│
├─ Is it interactive? (button, input, etc.)
│  └─ YES → Use shadcn/ui component ✅
│
├─ Is it used 5+ times?
│  └─ YES → Check if token exists
│      ├─ Token exists → Use it ✅
│      └─ Token missing → Add to designTokens.ts
│
└─ Is it a one-off decoration?
   └─ YES → Use inline Tailwind ✅
```

---

## 🔍 Code Review Checklist

Before committing styling changes:

- [ ] Used shadcn component where applicable?
- [ ] No custom buttons/badges when shadcn exists?
- [ ] Tokens only for 5+ use patterns?
- [ ] No tokens for one-off decorations?
- [ ] Semantic colors (not hardcoded hex/rgb)?
- [ ] No `border-*` or `shadow-*` tokenized?
- [ ] Responsive with mobile-first approach?

---

## 🚨 Red Flags (Stop and Refactor)

### ❌ Custom button when Button exists
```tsx
// WRONG
<div className="rounded-full px-6 py-3 cursor-pointer">Click</div>

// RIGHT
<Button size="lg" className="rounded-full">Click</Button>
```

### ❌ Creating token for 1-2 uses
```tsx
// WRONG
export const HERO_PARTICLE = 'h-2 w-2 rounded-full...'; // Used once!

// RIGHT
<div className="h-2 w-2 rounded-full animate-pulse..." /> // Inline
```

### ❌ Tokenizing framework utilities
```tsx
// WRONG
export const BORDER_TOP = 'border-t border-border';

// RIGHT
<div className="border-t border-border"> // Just use it!
```

---

## 📊 Current Token Inventory

### Should Be Tokenized (5+ uses)
- ✅ Typography sizes (TEXT_*)
- ✅ Line heights (LEADING_*)
- ✅ Letter spacing (TRACKING_*)
- ✅ Icon sizes (SIZE_*)
- ✅ Spacing (GAP_*, P_*, M_*)
- ✅ Layout containers (CONTAINER_*, MAX_W_*)

### Should NOT Be Tokenized
- ❌ Border utilities (`border-2`, `border-t`)
- ❌ Chart colors (component-specific)
- ❌ One-off gradients
- ❌ Loading skeletons
- ❌ Decorative particles
- ❌ Arbitrary values

---

## 🎯 Summary

**3 Simple Rules:**

1. **shadcn/ui first** - Use components, not custom divs
2. **Tokens for patterns** - 5+ uses = token
3. **Inline for one-offs** - Decorations stay inline

**No interpretation needed. Follow the rules.**

---

**Questions? Check examples in:**
- `src/components/atoms/` - Proper token usage
- `src/components/molecules/` - shadcn component usage
- `src/app/not-found.tsx` - Good mix of all three approaches
