# PayeTax Architecture

## Overview

PayeTax is a UK tax calculator built with **Next.js 16**, **React 19**, and **TypeScript**. 

**Key principles:**
- Type Safety - 100% TypeScript strict mode
- Atomic Design - Clear component hierarchy
- Performance - Optimized rendering and bundle size
- Accessibility - WCAG 2.2 AA compliant

---

## Component Architecture

### Atomic Design Hierarchy

```
Pages (Full pages)
  ↓
Templates (Page layouts)
  ↓
Organisms (Complex sections)
  ↓
Molecules (Composite components)
  ↓
Atoms (Basic elements)
```

### Component Layers

**Atoms** - Basic building blocks (NumberInput, TaxYearSelect, GradientText)
- Self-contained, highly reusable, single purpose
- No business logic
- Use design tokens from `src/constants/designTokens.ts`

**Molecules** - Composites of atoms (ResultCard, FAQItem, FeedbackDialog)
- Combine multiple atoms
- Focused functionality
- Zod validation for props

**Organisms** - Complex sections (CalculatorContainer, BasicInputs, ResultsTable)
- Business logic integration
- Complex interactions
- Feature-complete sections

**Templates/Pages** - Page-level layouts
- Full page structure
- Route-specific
- Compose organisms

**UI Library** - shadcn/ui components with custom theming
- Theme-aware
- Accessible by default

---

## State Management (Zustand)

**File:** `src/store/calculatorStore.ts`

### Optimized Selector Pattern

```typescript
// ✅ Good - Only re-renders when results change
export const useCalculatorResults = () =>
  useCalculatorStore((state) => state.results);

// ✅ Good - Actions never trigger re-renders
export const useCalculatorActions = () =>
  useCalculatorStore((state) => ({
    calculate: state.calculate,
    setSalary: state.setSalary,
  }));

// ❌ Bad - Re-renders on ANY state change
const { results, calculate, input } = useCalculatorStore();
```

---

## Data Flow

```
User Input (BasicInputs)
       ↓
Zustand Store (input state)
       ↓
Calculate Action Triggered
       ↓
Business Logic (taxCalculator.ts)
       ↓
Zustand Store (results state)
       ↓
UI Update (ResultsTable)
```

**No prop drilling** - Components access store directly via hooks.

---

## File Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── atoms/              # Basic UI elements
│   ├── molecules/          # Composite components
│   ├── organisms/          # Complex sections
│   ├── templates/          # Page layouts
│   └── ui/                 # shadcn components
├── lib/                    # Business logic
│   ├── taxCalculator.ts    # Core PAYE engine
│   └── validation.ts       # Zod schemas
├── store/                  # Zustand stores
├── constants/              # Tax rates, design tokens
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

---

## Key Principles

### 1. Component Discovery First

**Always check what exists before creating anything:**

```bash
ls -la src/components/molecules/
grep -r "Hero\|Stats" src/components --include="*.tsx"
```

### 2. Composition Over Inheritance

```typescript
// ✅ Good - Composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <ResultCard value="£30,000" label="Net Income" />
  </CardContent>
</Card>
```

### 3. Single Responsibility

Each component has one clear purpose.

### 4. Single Source of Truth

All tax rates in `src/constants/taxRates.ts`. Never hardcode values.

---

## Performance

- Dynamic imports for heavy components
- Tree-shakeable named exports
- Granular Zustand selectors
- GPU-accelerated Framer Motion animations

---

## Security

- Content Security Policy in `next.config.ts`
- Zod validation for all inputs
- XSS protection with HTML escaping
- GA4 IP anonymization

---

## Testing

- **Unit Tests** - Jest + React Testing Library
- **E2E Tests** - Playwright (5 browsers)
- **Accessibility** - jest-axe for WCAG compliance

---

## Related Docs

- [TECH_STACK.md](./TECH_STACK.md) - Technology details
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Code standards
