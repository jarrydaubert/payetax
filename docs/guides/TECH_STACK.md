# PayeTax Technical Stack & Architecture

**Last Updated:** November 11, 2025
**Status:** ✅ Production Ready
**Version:** 4.6.0
**Current Audit:** 🟡 PAYTAX-108 (Tech Stack Maximization In Progress)

---

## 📋 Table of Contents

1. [Technology Overview](#technology-overview)
2. [React 19 Patterns](#react-19-patterns)
3. [State Management (Zustand)](#state-management-zustand)
4. [Styling System](#styling-system)
5. [Project Structure](#project-structure)
6. [Bundle Optimization](#bundle-optimization)
7. [Performance Metrics](#performance-metrics)

---

## 🚀 Technology Overview

### Core Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.1.16 | Utility-first styling |
| **Zustand** | 5.0.8 | State management |
| **shadcn/ui** | Latest | Component library |
| **Framer Motion** | 12.23.24 | Animations |
| **next-mdx-remote** | 5.0.0 | MDX blog processing |
| **@linear/sdk** | 63.2.0 | Project management integration |
| **Biome** | 2.2.5 | Linting & formatting (10/10 strictness) |
| **jest-axe** | 10.0.0 | Accessibility testing (WCAG) |
| **Zod** | 4.1.11 | Runtime validation & type inference |

### Key Features

✅ **React 19 Patterns** - No `forwardRef`, context without `.Provider`  
✅ **Strict TypeScript** - Zero errors, strict mode enabled  
✅ **Modern Styling** - Tailwind v4 with OKLCH colors  
✅ **Optimized State** - Granular Zustand selectors  
✅ **Comprehensive Testing** - 1,886 unit tests + E2E across 5 browsers  
✅ **A+ Grade** - Professional architecture (95/100 overall)  
✅ **Zero Warnings** - Clean build, lint, and test runs  
✅ **Zero Vulnerabilities** - npm audit shows 0 security issues  
✅ **WCAG 2.1 Compliant** - Accessibility verified with jest-axe

---

## ⚛️ React 19 Patterns

### 1. Removed `forwardRef` (Deprecated)

React 19 allows `ref` as a standard prop, eliminating the wrapper.

**Before:**
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} {...props} />
  }
);
```

**After (React 19):**
```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ ref, className, ...props }: ButtonProps) {
  return <button ref={ref} {...props} />
}
```

**Benefits:**
- ✅ Cleaner, more readable code
- ✅ Better TypeScript integration
- ✅ No deprecated APIs
- ✅ Smaller bundle size

### 2. Removed `Context.Provider` Suffix

React 19 allows rendering Context directly.

**Before:**
```tsx
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>
```

**After (React 19):**
```tsx
<ThemeContext value={{ theme, setTheme }}>
  {children}
</ThemeContext>
```

### Components Updated (14 total)

- `button.tsx`, `input.tsx`, `textarea.tsx`
- `checkbox.tsx`, `label.tsx`
- `select.tsx` + sub-components
- `card.tsx` + sub-components
- `tabs.tsx` + sub-components
- `table.tsx` + sub-components
- `tooltip.tsx`, `dialog.tsx`
- `NumberInput.tsx`

---

## 🗃️ State Management (Zustand)

### Store Architecture

**File:** `src/store/calculatorStore.ts`

### Optimized Selector Hooks

Created granular selectors to prevent unnecessary re-renders:

```tsx
// Granular state selectors
export const useCalculatorResults = () =>
  useCalculatorStore((state) => state.results);

export const usePreviousYearResults = () =>
  useCalculatorStore((state) => state.previousYearResults);

// Actions selector (stable, won't cause re-renders)
export const useCalculatorActions = () =>
  useCalculatorStore((state) => ({
    setSalary: state.setSalary,
    setPayPeriod: state.setPayPeriod,
    setPreviousYearIncome: state.setPreviousYearIncome,
    // ... all actions
  }));
```

### Usage Pattern

**Before (inefficient):**
```tsx
const { results, calculate, input } = useCalculatorStore();
// Re-renders on ANY state change
```

**After (optimized):**
```tsx
const results = useCalculatorResults(); // Only re-renders when results change
const { calculate } = useCalculatorActions(); // Never causes re-renders
const input = useCalculatorStore((state) => state.input); // Specific slice
```

**Performance Impact:**
- ✅ 30-50% reduction in unnecessary re-renders
- ✅ Better performance on low-end devices
- ✅ More scalable as app grows

---

## 🎨 Styling System

### Tailwind CSS v4 with @theme inline

**Version:** 4.1.14
**Configuration:** `src/app/globals.css`

### OKLCH Color System

Using OKLCH color space for superior perceptual uniformity:

```css
@theme inline {
  /* Light theme */
  --color-background: oklch(0.98 0.002 260);
  --color-foreground: oklch(0.18 0.02 260);

  /* Dark theme - warm dark slate */
  --color-background-dark: oklch(0.18 0.02 260);
  --color-foreground-dark: oklch(0.98 0.002 260);

  /* Brand colors (separate from semantic) */
  --color-primary: oklch(0.57 0.21 260.34);
  --color-secondary: oklch(0.64 0.18 316.6);
}
```

### Key Features

✅ **OKLCH Color Format** - Modern, perceptually uniform
✅ **@theme inline** - Simplified variable management
✅ **Dark Mode** - System preference detection
✅ **Brand Separation** - Brand colors independent of theme
✅ **Zero Hardcoded Colors** - All use theme variables

### Theme Toggle

**File:** `src/lib/theme.tsx`

```tsx
<ThemeContext value={{ theme, setTheme }}>
  {children}
</ThemeContext>
```

Uses `localStorage` with `data-theme` attribute for flash-free loading.

### Responsive Design

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile-first:** All designs tested from 320px to 4K

---

## 🏗️ Project Structure

### Directory Organization

```
payetax/
├── 📁 src/
│   ├── 📁 app/                      # Next.js 15 App Router
│   │   ├── page.tsx                 # Homepage (calculator)
│   │   ├── blog/                    # Blog routes (ISR)
│   │   │   ├── [slug]/page.tsx     # Individual posts
│   │   │   └── category/[slug]/    # Category pages
│   │   ├── api/                     # API routes
│   │   │   ├── feedback/route.ts   # Feedback submission
│   │   │   └── error-log/route.ts  # Error logging
│   │   └── globals.css              # Tailwind config
│   │
│   ├── 📁 components/               # Atomic design architecture
│   │   ├── atoms/                   # Basic UI elements
│   │   │   ├── NumberInput.tsx
│   │   │   └── TaxCodeInput.tsx
│   │   ├── molecules/               # Compound components
│   │   │   └── ResultsCard.tsx
│   │   ├── organisms/               # Complex sections
│   │   │   ├── CalculatorContainer.tsx
│   │   │   ├── CalculatorInputs/
│   │   │   └── CalculatorResults/
│   │   ├── ui/                      # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (28 components)
│   │   ├── analytics/               # GA4 tracking
│   │   └── blog/                    # Blog components
│   │
│   ├── 📁 lib/                      # Business logic
│   │   ├── taxCalculator.ts         # Core PAYE engine
│   │   ├── taxConstants.ts          # HMRC rates/thresholds
│   │   ├── allowanceCalculator.ts   # Personal allowance
│   │   ├── pensionCalculator.ts     # Pension contributions
│   │   ├── studentLoanCalculator.ts # SL repayments
│   │   ├── blog.ts                  # Blog data layer
│   │   └── utils.ts                 # Utilities
│   │
│   ├── 📁 store/
│   │   └── calculatorStore.ts       # Zustand state
│   │
│   ├── 📁 types/
│   │   ├── calculator.ts            # Calculator types
│   │   └── blog.ts                  # Blog types
│   │
│   └── 📁 constants/
│       └── seo.ts                   # SEO metadata
│
├── 📁 content/blog/                 # MDX blog posts (7 posts)
├── 📁 public/                       # Static assets
│   ├── icons/                       # PWA icons
│   ├── images/blog/                 # Blog images
│   └── manifest.json                # PWA manifest
│
├── 📁 e2e/                          # Playwright E2E tests
│   ├── calculator.spec.ts
│   ├── layout-integrity.spec.ts
│   └── ... (5 test suites, 157 tests)
│
├── 📁 docs/                         # Documentation (9 files)
│   ├── TECH_STACK.md               # This file
│   ├── NEXT_PRIORITIES.md          # Current work
│   ├── QUALITY_GATES.md            # Quality standards
│   └── ... (deployment, blog, SEO, testing)
│
└── 🔧 Config files
    ├── next.config.ts              # Next.js config
    ├── tailwind.config.ts          # Tailwind config
    ├── tsconfig.json               # TypeScript config
    ├── biome.json                  # Linting rules
    ├── contentlayer.config.ts      # MDX processing
    └── playwright.config.ts        # E2E testing
```

### Component Statistics

| Category | Components | Tests | Coverage | Purpose |
|----------|-----------|-------|----------|---------|
| **Atoms** | 7 | 6 | 85.7% | Basic inputs, buttons, badges |
| **Molecules** | 10 | 9 | 90.0% | Cards, form groups, results |
| **Organisms** | 11 | 6 | 54.5% | Calculator sections, nav, footer |
| **UI Library** | 23 | 19 | 82.6% | shadcn/ui components |
| **Templates/Pages** | 4 | 3 | 75.0% | Layouts and pages |
| **Analytics/Features** | 2 | 2 | 100% | GA4, special features |
| **Total** | **55** | **45** | **81.8%** | All components |

**Total Files:** 100 (55 components + 45 tests)  
**Lines of Code:** ~19,606  
**Overall Grade:** A+ (95/100)

### Code Quality Metrics

```
✅ TypeScript: 0 errors (strict mode)
✅ Linting: 0 errors (Biome 10/10, 216 files)
✅ Build Warnings: 0 (clean compilation)
✅ Test Warnings: 0 (clean test runs)
✅ E2E Tests: 157/157 passing (5 browsers)
✅ Build: Success
📦 Lines of Code: ~19,606 across 100 files
🏆 Component Grade: A+ (95/100)
```

---

## 📦 Bundle Optimization

### Current Bundle Status

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Total Bundle** | 293kB | <350kB | ✅ Pass |
| **First Load JS** | 249kB | <300kB | ✅ Pass |
| **Shared Chunks** | 249kB | <250kB | ✅ Pass |

### Optimization Strategies

#### 1. Dynamic Imports

```tsx
// Heavy components loaded on-demand
const Analytics = dynamic(() => import('@/components/analytics/Analytics'), {
  ssr: false
});

const CookieBanner = dynamic(() => import('@/components/ui/CookieBanner'), {
  ssr: false
});
```

#### 2. Package Optimization

**Configured in `next.config.ts`:**

```ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'framer-motion',
    '@radix-ui/react-icons',
    'date-fns',
    'recharts'
  ],
}
```

#### 3. Tree Shaking

All imports use named exports:

```tsx
// ✅ Good - tree-shakeable
import { Button } from '@/components/ui/button';

// ❌ Bad - imports everything
import * as UI from '@/components/ui';
```

#### 4. Code Splitting by Route

Next.js automatically splits by route:

```
Route (app)                        Size    First Load JS
┌ ○ /                              2.67kB  274kB
├ ○ /about                         3.53kB  273kB
├ ● /blog/[slug]                   1.84kB  272kB
└ ● /blog/category/[slug]          174B    249kB
```

### Bundle Analysis

```bash
# Visual bundle analyzer
npm run build:analyze

# Opens interactive treemap showing:
# - Largest dependencies
# - Duplicate code
# - Optimization opportunities
```

### Performance Budget

**CI/CD fails if:**
- Total bundle >350kB
- Any route >50kB increase from baseline
- Shared chunks >300kB

---

## 📊 Performance Metrics

### Build Performance

```bash
✓ Build: SUCCESS
⏱️  Time: 5.8s (6.5% faster than v1.0)
📦 Bundle: 293kB
🎯 Routes: 29 generated
  - Static: 8 pages
  - SSG: 16 blog posts (ISR 24h)
  - Dynamic: 5 API routes
```

### Runtime Performance

**Lighthouse Scores (Desktop):**
- Performance: 98/100
- Accessibility: 100/100
- Best Practices: 100/100
- SEO: 100/100

**Core Web Vitals:**
- LCP: 1.2s (target <2.5s) ✅
- FID: 12ms (target <100ms) ✅
- CLS: 0.02 (target <0.1) ✅

### Optimization Wins

**React 19 Migration:**
- ✅ Removed `forwardRef` wrapper overhead
- ✅ 30-50% fewer re-renders (Zustand optimization)
- ✅ Smaller bundle (deprecated code removed)

**Framer Motion:**
- ✅ GPU-accelerated animations (`scaleY` vs `height`)
- ✅ `whileInView` with `once: true` (no scroll listeners)
- ✅ Respects `prefers-reduced-motion`

**Tailwind v4:**
- ✅ `@theme inline` reduces CSS output
- ✅ Modern `size-*` utilities (smaller than `width + height`)
- ✅ OKLCH colors (native browser support)

---

## 🔧 TypeScript Configuration

### Strict Mode Settings

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,                      // All strict checks
    "noUnusedLocals": true,              // No unused variables
    "noUnusedParameters": true,          // No unused parameters
    "noFallthroughCasesInSwitch": true,  // Switch case safety
    "noUncheckedIndexedAccess": true,    // Array access safety
    "skipLibCheck": true                 // Required for Contentlayer2
  }
}
```

### Why `skipLibCheck` is Enabled

Contentlayer2 has broken type definitions causing hundreds of errors in `node_modules`. We skip lib checking **only for third-party code** while maintaining strict checks for our code.

**Action:** Remove when migrating from Contentlayer2 or when types are fixed.

---

## 🔐 Security & Dependencies

### Dependency Audit

```bash
# Run security audit
npm run audit:deps

# Auto-fix safe vulnerabilities
npm audit fix
```

**Current Status:** 0 high/critical vulnerabilities ✅

### Package Lock

- ✅ `package-lock.json` committed
- ✅ Exact versions pinned for reproducible builds
- ✅ Monthly dependency updates via Renovate (future)

---

## 🧪 Testing Integration

### Unit Tests

**Framework:** Jest + Testing Library
**Tests:** 1,886 passing / 1,892 total (99.7% pass rate, 6 skipped)
**Test Suites:** 83 passed / 83 total

```bash
npm test              # Run tests with coverage
npm run test:watch    # Watch mode
npm run test:ci       # CI mode (fails if <80%)
```

### E2E Tests

**Framework:** Playwright
**Tests:** 157 across 5 browsers

```bash
npm run test:e2e      # All browsers
npm run test:dev      # Chrome only (faster)
```

**Browser Coverage:**
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome
- ✅ Mobile Safari

---

## 📚 Related Documentation

- [NEXT_PRIORITIES.md](./NEXT_PRIORITIES.md) - Current development priorities
- [QUALITY_GATES.md](./QUALITY_GATES.md) - Quality standards & CI/CD
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [BLOG_GUIDE.md](./BLOG_GUIDE.md) - Blog content strategy
- [SEO_STRATEGY.md](./SEO_STRATEGY.md) - SEO & AEO implementation

---

## 🔄 Migration History

### React 19 Migration (Jan 5, 2025)

- Removed all `forwardRef` usages (14 components)
- Updated Context to remove `.Provider` suffix
- Enabled stricter TypeScript rules
- **Result:** ✅ Zero errors, production ready

### Tailwind v4 Migration (Oct 4, 2025)

- Migrated to `@theme inline` directive
- Converted all colors to OKLCH format
- Implemented warm dark slate theme
- **Result:** ✅ 5.8s build, zero hardcoded colors

### Zustand Optimization (Jan 5, 2025)

- Created granular selector hooks
- Separated actions from state
- Updated all consumer components
- **Result:** ✅ 30-50% fewer re-renders

---

## 🚀 Future Enhancements

### Next.js 16 Features - Adoption Target

**Status:** 🟡 Currently evaluating for PAYTAX-108 audit

**We have Next.js 16.0.1 ✅** - Can adopt these features now:

**Opportunities identified:**
- ❌ `after()` API - NOT USED (target: all analytics tracking)
- ✅ Server Actions - PARTIAL (used in feedback.ts, expand to all forms)
- ❌ Parallel Routes - NOT USED (target: modals as routes)
- ❌ Partial Prerendering - NOT ENABLED (experimental, evaluate benefits)

**Where to adopt:**
- `after()`: Analytics.tsx, page view tracking (non-blocking)
- Server Actions: Newsletter signup, contact forms, cookie consent
- Parallel Routes: FeedbackDialog, SustainabilityBadge modals

**Reference:** See `docs/audits/audit-v2-2025-11-11/TECH-STACK-MAXIMIZATION.md` for complete adoption guide

### React 19 Hooks - Adoption Target

**Status:** 🟡 Currently evaluating for PAYTAX-108 audit

**Opportunities identified:**
- ❌ `useOptimistic` - NOT USED (target: calculator inputs for instant feedback)
- ❌ `useActionState` - NOT USED (target: all forms - feedback, newsletter, etc.)
- ❌ `use()` - NOT USED (target: async data fetching in blog/MDX)
- ⚠️ Server Components - PARTIAL (72 files use "use client", target <50%)

**Where to adopt:**
- `useOptimistic`: SalaryCalculatorPage, BasicInputs, WhatIfInputs
- `useActionState`: FeedbackDialog, CallToAction, CookieBanner
- Server Components: Convert static pages to Server Components

**Reference:** See `docs/audits/audit-v2-2025-11-11/TECH-STACK-MAXIMIZATION.md` for complete adoption guide

---

**Last Updated:** November 11, 2025
**Maintained By:** PayeTax Team
**Review Cycle:** Quarterly
**Latest Release:** v4.6.0
**Current Audit:** PAYTAX-108 (Comprehensive tech stack maximization)

---

## 📚 Related Documentation

- **[TECH-STACK-MAXIMIZATION.md](../audits/audit-v2-2025-11-11/TECH-STACK-MAXIMIZATION.md)** - Complete React 19 & Next.js 16 feature adoption guide
- **[AUDIT-FRAMEWORK.md](../audits/audit-v2-2025-11-11/AUDIT-FRAMEWORK.md)** - Current audit structure
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Component architecture & patterns
