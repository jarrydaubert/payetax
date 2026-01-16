# Contributing to PayeTax

> Best practices and guidelines for maintaining high-quality code

---

## START HERE (Every New Session)

**For Factory.ai Droid / Claude Code:**

### Step 1: Get Context (30 seconds)
```bash
git status                    # Check for uncommitted changes
git log --oneline -10         # Recent commits
bun run linear:me             # Your assigned issues
```

### Step 2: Verify Environment
```bash
bun run fix-all              # Lint, format, typecheck
bun run test:no-coverage     # Quick test run (~6s)
```

### Step 3: Ask What to Work On
Summarize git status, recent commits, and ask: **"What should I work on?"**

---

## Project Overview

**PayeTax** is a UK PAYE tax calculator helping users calculate income tax, National Insurance, and take-home pay.

**Tech Stack:**
- **Next.js 16** with Turbopack
- **React 19** 
- **TypeScript 5.9** (strict mode)
- **Tailwind CSS 4**
- **Zod 4** for validation
- **Bun** as package manager

**Key Concepts:**
- PAYE: UK's tax withholding system
- Tax codes (e.g., "1257L") determine personal allowance
- National Insurance (NI): Social security contributions
- Tax bands: Basic (20%), Higher (40%), Additional (45%)
- £100k-£125k "tax trap": Effective 60% rate due to allowance taper

**Key Docs:**
- `docs/guides/ARCHITECTURE.md` - Codebase structure
- `docs/guides/TECH_STACK.md` - Technology overview

---

## Testing Philosophy

**Our Mantra:** Test behavior, not implementation.

### Best Practices

```typescript
// GOOD: Test what users see
expect(screen.getByRole('heading')).toHaveTextContent('Total Tax');
expect(container.textContent).toContain('£34,302');

// BAD: Test implementation details
expect(wrapper.find('.tax-result-class')).toHaveLength(1);
expect(component.state.taxAmount).toBe(34302);
```

### What to Test
- User-visible behavior and interactions
- Business logic outcomes
- Edge cases (£0 salary, £1M salary)
- Accessibility (keyboard nav, screen readers)

### What NOT to Test
- CSS class names
- Internal component state
- Third-party library internals

### Test Commands
```bash
bun run test              # Full tests with coverage
bun run test:no-coverage  # Faster: Skip coverage (~40% faster)
bun run test:changed      # Fastest: Only changed files
bun run test:watch        # Watch mode for development
bun run test:e2e          # E2E tests (Playwright)
```

### Coverage Targets
- **Overall:** 65%+ (realistic minimum)
- **Business Logic:** 90%+
- **New Code:** 80%+

---

## Code Quality Standards

### TypeScript Strict Mode

```typescript
// GOOD: Explicit types
interface TaxResult {
  grossSalary: number;
  taxableIncome: number;
  totalTax: number;
}

function calculateTax(salary: number): TaxResult { ... }

// BAD: Any types
function calculateTax(salary: any): any { ... }
```

### JSDoc Comments

```typescript
/**
 * Calculates PAYE tax for UK taxpayer
 * 
 * @param grossSalary - Annual gross salary in GBP
 * @param taxCode - HMRC tax code (e.g., "1257L")
 * @param region - UK region ('england' | 'scotland' | 'wales')
 * @returns Tax breakdown with NI, student loans, take-home
 */
export function calculatePAYE(
  grossSalary: number,
  taxCode: string,
  region: Region
): TaxCalculation { ... }
```

### The `ls -la` Principle

**ALWAYS check what exists BEFORE creating anything new:**

```bash
# Before creating a component
ls -la src/components/atoms/
grep -r "Button" src/components/ --include="*.tsx"

# Before creating a schema
ls -la src/lib/validation/
grep -r "salaryValidation" src/ --include="*.ts"
```

This prevents duplicate code and ensures you use existing utilities.

---

## Performance Guidelines

### Bundle Size
- **Target:** <3MB total chunks
- Keep `productionBrowserSourceMaps: false` in next.config.ts
- Use `optimizePackageImports` for large packages

### Core Web Vitals Targets
| Metric | Target |
|--------|--------|
| LCP | <2.5s |
| FCP | <1.8s |
| CLS | <0.1 |
| TBT | <200ms |

Run `bun run lighthouse` to check current scores.

### framer-motion Usage
Components using `initial={{ opacity: 0 }}` block server-side content painting. For critical above-the-fold content, prefer CSS animations:

```tsx
// GOOD: CSS animation (SSR-friendly)
<div className="animate-in fade-in duration-500">
  <h1>Content</h1>
</div>

// AVOID for above-fold content
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  <h1>Content</h1>
</motion.div>
```

### Lighthouse Testing
```bash
bunx lighthouse https://payetax.co.uk --output=json --quiet --chrome-flags="--headless" | jq '{
  performance: (.categories.performance.score * 100),
  lcp: .audits["largest-contentful-paint"].displayValue,
  fcp: .audits["first-contentful-paint"].displayValue
}'
```

---

## Icon Usage (Lucide React)

### Import Patterns

**Few icons (1-7):** Named imports
```typescript
import { Calculator, PoundSterling } from 'lucide-react';
```

**Many icons (8+):** Direct ESM imports (Turbopack-optimized)
```typescript
import Calculator from 'lucide-react/dist/esm/icons/calculator.js';
```

### Always Use Design Tokens
```typescript
import { ICON_SIZES } from '@/constants/designTokens';

<Icon className={ICON_SIZES.SIZE_4} />  // 16px standard
<Icon className={ICON_SIZES.SIZE_5} />  // 20px large
<Icon className={ICON_SIZES.SIZE_6} />  // 24px desktop
```

### Accessibility
```typescript
// Decorative (next to text)
<Calculator aria-hidden="true" />

// Interactive (icon-only button)
<Button aria-label="Close menu">
  <X />
</Button>
```

---

## Git Workflow

### Commit Format
```
<type>: <subject> (PAYTAX-XX)

<body>

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

### Pre-Commit Checklist
```bash
bun run fix-all              # Format, lint, typecheck
bun run test:no-coverage     # Run tests
git diff                     # Review changes
```

### Push Directly to Main
We push directly to main for most changes. Feature branches only for complex multi-day work.

```bash
git add -A
git commit -m "feat: Description (PAYTAX-XX)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
git push origin main
```

---

## Linear Integration

```bash
# View your issues
bun run linear:me

# Create issue
bun run linear:create "Title"

# Update status
bun run linear update-status PAYTAX-XX Done

# Full help
bun run linear
```

**API Key:** Set `LINEAR_API_KEY` environment variable (get from linear.app/settings/api)

---

## File Organization

```
src/
├── components/
│   ├── atoms/       # Button, Input, etc.
│   ├── molecules/   # SearchBar, Card, etc.
│   ├── organisms/   # Header, Calculator, etc.
│   └── templates/   # Page layouts
├── lib/
│   ├── validation/  # Zod schemas
│   └── utils/       # Helper functions
├── constants/       # Design tokens, tax rates
└── store/           # Zustand stores
```

**Naming:**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

---

## Quick Commands

```bash
# Development
bun run dev                 # Start dev server
bun run build              # Production build
bun run fix-all            # Format, lint, typecheck

# Testing
bun run test               # Tests with coverage
bun run test:no-coverage   # Fast tests
bun run test:e2e           # Playwright E2E

# Quality
bun run lint:fix           # Fix linting
bun run typecheck          # Type check
bun run bundle:analyze     # Bundle analysis

# Linear
bun run linear:me          # Your issues
bun run linear:create      # New issue
```

---

## Sentry & Error Handling

### Log Filtering
Noisy logs are filtered in `instrumentation-client.ts` and `sentry.server.config.ts`:
- PWA/ServiceWorker errors
- Deprecation warnings
- Chunk loading failures

### Local Development
Sentry only runs in Vercel deployments (`process.env.VERCEL`), not local builds.

---

## Documentation Policy

**Only create evergreen documentation:**
- Update existing docs instead of creating new ones
- No one-off incident analysis docs in root folder
- All permanent docs in `docs/` folder

**Root folder contains only:**
- README.md, CONTRIBUTING.md, CHANGELOG.md
- Config files (package.json, tsconfig.json, etc.)

---

## Remember

> "Test behavior, not implementation. Code is read more than written."

**Priorities:**
1. **Correctness** - Does it work?
2. **Clarity** - Can others understand it?
3. **Maintainability** - Can it be easily changed?
4. **Performance** - Is it fast enough?

**When in doubt:** Write tests, add comments, keep it simple.
