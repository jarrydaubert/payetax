# PayeTax Tech Stack

## Core Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety (strict mode) |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | State management |
| **Zod 4** | Runtime validation |
| **Framer Motion** | Animations |

## Supporting Libraries

| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Component library |
| **Radix UI** | Headless UI primitives |
| **Biome** | Linting & formatting |
| **Jest** | Unit testing |
| **Playwright** | E2E testing |
| **Sentry** | Error monitoring |
| **Resend** | Email service |

---

## React 19 Patterns

### Refs as Props (No forwardRef)

```tsx
// React 19 - ref is a standard prop
function Button({ ref, ...props }: ButtonProps) {
  return <button ref={ref} {...props} />
}
```

### Context Without Provider Suffix

```tsx
<ThemeContext value={{ theme, setTheme }}>
  {children}
</ThemeContext>
```

---

## State Management

### Zustand Selector Pattern

```tsx
// Granular selectors prevent unnecessary re-renders
const results = useCalculatorResults();
const { calculate } = useCalculatorActions();
```

See `src/store/calculatorStore.ts` for implementation.

---

## Styling

### Tailwind CSS 4 with OKLCH Colors

Configuration in `src/app/globals.css` using `@theme inline`:

```css
@theme inline {
  --color-primary: oklch(0.57 0.21 260.34);
  --color-background: oklch(0.98 0.002 260);
}
```

### Design Tokens

All styling uses centralized tokens from `src/constants/designTokens.ts`:
- `TYPOGRAPHY.*` - Font sizes
- `SPACING.*` - Gaps and padding
- `ICON_SIZES.*` - Icon dimensions

---

## Bundle Optimization

### Strategies

1. **Dynamic imports** for heavy components
2. **optimizePackageImports** in next.config.ts
3. **Tree-shakeable** named exports
4. **Code splitting** by route (automatic)

### Package Optimization

```ts
// next.config.ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'framer-motion',
    '@radix-ui/react-icons',
  ],
}
```

---

## Testing

### Unit Tests (Jest)

```bash
bun run test              # With coverage
bun run test:no-coverage  # Fast
bun run test:watch        # Watch mode
```

### E2E Tests (Playwright)

```bash
bun run test:e2e          # All browsers
```

Tests run across Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari.

---

## TypeScript

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Related Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Component architecture
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Code standards
