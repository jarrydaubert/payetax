# Tech Stack Maximization Guide - November 11, 2025

**Purpose:** Guide every audit sub-issue with latest features and best practices  
**Versions:** Based on current package.json  
**Approach:** What we have → What we could be using

---

## 📦 Current Tech Stack (package.json)

### Core Framework
- **Next.js:** `^16.0.1` ✅ LATEST
- **React:** `^19.2.0` ✅ LATEST
- **React DOM:** `^19.2.0` ✅ LATEST
- **TypeScript:** `^5.9.3` ✅ LATEST

### UI & Styling
- **Tailwind CSS:** `^4.1.14` ✅ LATEST (v4!)
- **Framer Motion:** `^12.23.22` ✅ LATEST
- **Lucide React:** `^0.553.0` ✅ LATEST
- **Radix UI:** Multiple packages (latest versions) ✅
- **shadcn/ui:** Via Radix components ✅

### Data Visualization
- **Recharts:** `^3.3.0` ✅ LATEST

### State Management & Validation
- **Zustand:** `^5.0.8` ✅ LATEST
- **Zod:** `^4.1.11` ✅ LATEST (v4!)

### Content & MDX
- **@mdx-js/react:** `^3.1.1` ✅ LATEST
- **@mdx-js/loader:** `^3.1.1` ✅ LATEST
- **next-mdx-remote:** `^5.0.0` ✅ LATEST

### Monitoring & Analytics
- **@sentry/nextjs:** `^10.22.0` ✅ LATEST
- **@vercel/analytics:** `^1.5.0` ✅ LATEST
- **@vercel/speed-insights:** `^1.2.0` ✅ LATEST

### Testing
- **Jest:** `^30.2.0` ✅ LATEST
- **Playwright:** `^1.55.1` ✅ LATEST
- **Testing Library React:** `^16.3.0` ✅ LATEST

---

## 🚀 React 19 Features - Maximization Checklist

**Status:** We have React 19.2.0 ✅  
**Current Usage:** Found `"use client"` in 72 files ✅

### 1. useOptimistic Hook (React 19)
**What:** Optimistic UI updates for better UX  
**Best for:** Form submissions, calculator updates, state changes

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```tsx
// Calculator form submissions
// Before: Wait for calculation → Show result
// After: Show optimistic result immediately → Confirm/rollback

// Example: SalaryCalculatorPage
import { useOptimistic } from 'react';

function Calculator() {
  const [results, setResults] = useState(null);
  const [optimisticResults, addOptimistic] = useOptimistic(
    results,
    (state, newResults) => newResults
  );
  
  async function handleCalculate(salary) {
    addOptimistic(calculateOptimistic(salary)); // Instant feedback
    const actual = await calculateTax(salary);   // Server validation
    setResults(actual);                          // Update with real data
  }
}
```

**Where to Use:**
- SalaryCalculatorPage.tsx - Salary input changes
- BasicInputs.tsx - Tax code changes
- WhatIfInputs.tsx - What-if comparison inputs
- ComparisonInputs.tsx - Salary comparison

**Acceptance Criteria:**
- [ ] All calculator inputs show instant optimistic updates
- [ ] Real calculations validate and correct optimistic state
- [ ] Smooth UX with no loading spinners for simple calculations

---

### 2. useActionState Hook (React 19 - replaces useFormState)
**What:** Simplified form state management with actions  
**Best for:** Form submissions, server actions

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```tsx
// Form handling (feedback, newsletter)
import { useActionState } from 'react';

function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(submitFeedback, {
    message: '',
    errors: null
  });
  
  return (
    <form action={formAction}>
      <textarea name="feedback" />
      {isPending && <Spinner />}
      {state.errors && <Error />}
      <button disabled={isPending}>Submit</button>
    </form>
  );
}
```

**Where to Use:**
- FeedbackDialog.tsx - Feedback form
- CallToAction.tsx - Newsletter signup
- CookieBanner.tsx - Cookie consent

**Acceptance Criteria:**
- [ ] All forms use useActionState instead of manual useState
- [ ] Pending states handled automatically
- [ ] Error states from server actions displayed
- [ ] Progressive enhancement (works without JS)

---

### 3. use() Hook for Promises/Context (React 19)
**What:** Suspend component while reading promises/context  
**Best for:** Data fetching, async operations

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```tsx
// MDX content loading
import { use } from 'react';

function BlogPost({ postPromise }) {
  const post = use(postPromise); // Suspends until resolved
  return <MDX content={post.content} />;
}
```

**Where to Use:**
- Blog post loading
- MDX content rendering
- Async data fetching

**Acceptance Criteria:**
- [ ] Async operations use `use()` hook
- [ ] Proper Suspense boundaries
- [ ] Loading states handled by Suspense

---

### 4. Server Components (React 19 + Next.js 16)
**What:** Components that run only on server  
**Best for:** Data fetching, SEO, reducing bundle size

**Current Usage:** ✅ PARTIAL (72 files have "use client")  
**Opportunity:** Make components Server Components by default

**Default Approach:**
- Server Component by default (no "use client")
- Add "use client" only when needed (hooks, interactivity)

**Where to Convert:**
- Static pages (About, Privacy, Compliance)
- Blog post pages (can be server components)
- Layout components without interactivity

**Acceptance Criteria:**
- [ ] Less than 50% of components use "use client"
- [ ] Server Components for all static content
- [ ] Bundle size reduced by 20%+

---

## 🎯 Next.js 16 Features - Maximization Checklist

**Status:** We have Next.js 16.0.1 ✅

### 1. after() API (Next.js 16)
**What:** Schedule work after response is sent  
**Best for:** Analytics, logging, non-blocking operations

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```tsx
// Analytics tracking without blocking response
import { after } from 'next/server';

export default async function Page() {
  // Send response immediately
  const data = await getData();
  
  // Track analytics AFTER response sent (doesn't block)
  after(async () => {
    await trackPageView({
      page: '/calculator',
      userId: session?.userId
    });
  });
  
  return <Calculator data={data} />;
}
```

**Where to Use:**
- Analytics.tsx - Page view tracking
- All pages with analytics
- Feedback submission tracking
- Newsletter signup confirmation

**Acceptance Criteria:**
- [ ] All analytics use after() API
- [ ] Page responses not blocked by tracking
- [ ] Lighthouse performance improved (no tracking delays)

---

### 2. Server Actions (Next.js 16 + React 19)
**What:** Server-side functions callable from client  
**Best for:** Form submissions, mutations, API calls

**Current Usage:** ✅ FOUND in `app/actions/feedback.ts` ✅  
**Opportunity:** Expand usage to all forms

**Best Practice:**
```tsx
// app/actions/newsletter.ts
'use server';

import { z } from 'zod';

const emailSchema = z.string().email();

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email');
  
  // Zod validation
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return { error: 'Invalid email' };
  }
  
  // Subscribe logic
  await addToMailingList(result.data);
  return { success: true };
}
```

**Where to Use:**
- Newsletter signup
- Contact forms
- Feedback forms (already done ✅)
- Cookie consent updates

**Acceptance Criteria:**
- [ ] All forms use Server Actions
- [ ] Zod validation in every action
- [ ] Type-safe form data
- [ ] Error handling standardized

---

### 3. Parallel Routes & Intercepting Routes
**What:** Advanced routing patterns  
**Best for:** Modals, multi-panel layouts

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```
app/
  @modal/          # Parallel route for modals
    (.)feedback/   # Intercept /feedback as modal
      page.tsx
  layout.tsx       # Renders both main + modal
  feedback/
    page.tsx       # Direct navigation shows full page
```

**Where to Use:**
- FeedbackDialog - Show as modal OR full page
- SustainabilityBadge - Modal content
- Cookie banner details

**Acceptance Criteria:**
- [ ] Modals work as intercepted routes
- [ ] Direct navigation to modal content works
- [ ] Back button behavior correct
- [ ] SEO-friendly (modal content indexable)

---

### 4. Partial Prerendering (Experimental in Next.js 16)
**What:** Static shell + dynamic content  
**Best for:** Hybrid pages (static layout + user-specific content)

**Current Usage:** ❌ NOT ENABLED  
**Opportunity:**
```tsx
// next.config.js
experimental: {
  ppr: true
}

// Calculator page: Static shell + dynamic calculator
export const experimental_ppr = true;
```

**Acceptance Criteria:**
- [ ] Enable PPR in next.config.ts
- [ ] Calculator page uses PPR
- [ ] Faster initial page loads
- [ ] Dynamic content loads after static shell

---

## 🎨 Tailwind CSS 4 Features - Maximization Checklist

**Status:** We have Tailwind CSS 4.1.14 ✅ (MAJOR UPDATE!)

### 1. CSS Variable-Based Colors (Tailwind 4)
**What:** Native CSS variables instead of JS config  
**Best for:** Theme switching, dynamic colors

**Current Usage:** ✅ PARTIAL (using CSS variables for theme)  
**Opportunity:** Full migration to Tailwind 4 approach

**Tailwind 4 Approach:**
```css
/* globals.css */
@theme {
  --color-primary: oklch(0.5 0.2 250);
  --color-background: oklch(1 0 0);
}

/* Automatic dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: oklch(0.1 0 0);
  }
}
```

**Acceptance Criteria:**
- [ ] All colors defined in @theme
- [ ] Using oklch color space
- [ ] Dark mode via CSS variables
- [ ] Zero JS for theme switching

---

### 2. Container Queries (Tailwind 4)
**What:** Style based on container size, not viewport  
**Best for:** Responsive components

**Current Usage:** ❌ NOT FOUND  
**Opportunity:**
```tsx
// Responsive card that adapts to container
<div className="@container">
  <div className="@lg:grid-cols-2">
    {/* Adapts to container, not viewport */}
  </div>
</div>
```

**Where to Use:**
- ResultCard.tsx - Cards in different containers
- FeatureCard.tsx - Grid layouts
- TaxRateCard.tsx - Responsive card layouts

**Acceptance Criteria:**
- [ ] Container queries used for component responsiveness
- [ ] Components work in any container size
- [ ] No viewport-based media queries for components

---

### 3. @apply Modernization (Tailwind 4)
**What:** Improved @apply syntax  
**Best for:** Component-level styles

**Current Usage:** ✅ Using @apply  
**Opportunity:** Verify Tailwind 4 best practices

**Acceptance Criteria:**
- [ ] No @apply in production (use utilities directly)
- [ ] @apply only for true abstractions
- [ ] Document why @apply is used

---

## 🎨 shadcn/ui Best Practices

**Status:** Using Radix UI + Tailwind (shadcn approach) ✅

### 1. Component Organization
**Best Practice:** /ui for shadcn components only

**Current Status:** ⚠️ Mixed (13 custom components in /ui)  
**Fix:** Move custom components to atomic folders

**Acceptance Criteria:**
- [ ] /ui contains only shadcn components (16 total)
- [ ] Custom components in /atoms, /molecules, /organisms
- [ ] Clear distinction between library and custom

---

### 2. Radix UI Icon Standardization
**Best Practice:** Use lucide-react, not @radix-ui/react-icons

**Current Status:** ⚠️ 16% using @radix-ui/react-icons  
**Fix:** Replace with lucide-react equivalents

**Where to Fix:**
- dialog.tsx
- select.tsx

**Acceptance Criteria:**
- [ ] 100% lucide-react adoption
- [ ] Zero @radix-ui/react-icons imports
- [ ] Consistent icon styling

---

### 3. Composition Pattern
**Best Practice:** Compose components using Radix primitives

**Current Status:** ✅ GOOD (using composition)  
**Verify:** All components follow composition pattern

**Acceptance Criteria:**
- [ ] Components are composable
- [ ] Using Radix primitives correctly
- [ ] No prop drilling

---

## 📊 Recharts 3 - Maximization Checklist

**Status:** We have Recharts 3.3.0 ✅

### 1. Performance Optimization
**Best Practice:** Memoization, lazy loading, reduced re-renders

**Current Usage:** ✅ Some optimization  
**Opportunity:** Maximize performance

```tsx
import { memo } from 'react';

const Chart = memo(TaxLiabilityChart);

// Stable data references
const chartData = useMemo(() => processData(results), [results]);
```

**Where to Optimize:**
- All 5 chart components in CalculatorCharts/
- ChartsContainer.tsx

**Acceptance Criteria:**
- [ ] All charts wrapped in React.memo
- [ ] Chart data memoized
- [ ] No re-renders on unrelated state changes
- [ ] Lighthouse performance 90+

---

### 2. Responsive Charts
**Best Practice:** ResponsiveContainer with proper sizing

**Current Usage:** ✅ GOOD  
**Verify:** All charts are responsive

**Acceptance Criteria:**
- [ ] All charts use ResponsiveContainer
- [ ] Charts work on mobile (320px+)
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

### 3. Accessibility
**Best Practice:** ARIA labels, keyboard navigation

**Current Usage:** ⚠️ UNKNOWN  
**Audit:** Check accessibility

**Acceptance Criteria:**
- [ ] Charts have ARIA labels
- [ ] Data available in text format
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA

---

## 🔐 Zod 4 - Maximization Checklist

**Status:** We have Zod 4.1.11 ✅ (MAJOR UPDATE!)

### 1. Zod 4 New Features
**What's New:**
- Better error messages
- Improved performance
- New schema methods

**Current Usage:** ✅ Using Zod  
**Opportunity:** Expand coverage to 100%

**Zod 4 Pattern:**
```typescript
import { z } from 'zod';

// Component props
const propsSchema = z.object({
  salary: z.number().positive(),
  taxCode: z.string().regex(/^\d{4}[LMP]$/),
  region: z.enum(['england', 'scotland', 'wales'])
}).strict(); // Zod 4: Reject unknown keys

type Props = z.infer<typeof propsSchema>;

// Runtime validation
function Component(props: Props) {
  propsSchema.parse(props); // Throws on invalid
  // ...
}
```

**Where to Add:**
- All component props (currently missing)
- All config files (blog.config, tooltips)
- All environment variables
- All API responses

**Acceptance Criteria:**
- [ ] 100% component props validated
- [ ] 100% config files validated
- [ ] 100% env vars validated
- [ ] Type inference from Zod schemas

---

### 2. Zod + Server Actions
**Best Practice:** Validate in Server Actions

**Current Usage:** ✅ In feedback.ts  
**Expand:** All Server Actions

```tsx
'use server';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(1000)
});

export async function submitForm(formData: FormData) {
  const data = formSchema.parse({
    email: formData.get('email'),
    message: formData.get('message')
  });
  // data is fully typed!
}
```

**Acceptance Criteria:**
- [ ] All Server Actions use Zod
- [ ] Client sees typed errors
- [ ] No unvalidated user input

---

## 🎬 Framer Motion 12 - Maximization Checklist

**Status:** We have Framer Motion 12.23.22 ✅

### 1. Layout Animations
**Best Practice:** Use layout prop for smooth transitions

**Current Usage:** ✅ Some usage  
**Opportunity:** Expand to all dynamic layouts

```tsx
<motion.div layout>
  {/* Children reorder smoothly */}
</motion.div>
```

**Where to Use:**
- IncomeSourceList.tsx - Adding/removing sources
- ComparisonResultsTable.tsx - Row changes
- CategoryFilter.tsx - Filter changes

**Acceptance Criteria:**
- [ ] All list additions/removals animated
- [ ] Layout shifts are smooth
- [ ] 60fps animations
- [ ] Respects prefers-reduced-motion

---

### 2. Presence Animations
**Best Practice:** AnimatePresence for mount/unmount

**Current Usage:** ✅ Some usage  
**Verify:** All conditional renders use it

**Acceptance Criteria:**
- [ ] All modals animated
- [ ] All tooltips animated
- [ ] All alerts animated
- [ ] Exit animations work

---

### 3. Performance
**Best Practice:** Use will-change, reduce animation scope

**Current Usage:** ⚠️ UNKNOWN  
**Audit:** Check animation performance

**Acceptance Criteria:**
- [ ] No layout thrashing
- [ ] GPU-accelerated animations
- [ ] Lighthouse performance 90+
- [ ] Mobile performance smooth

---

## 🧪 Testing Requirements (MANDATORY FOR ALL SUB-ISSUES)

**Rule:** No sub-issue can be marked "Done" without tests

### Test Coverage Requirements Per Sub-Issue

Every audit sub-issue must include:

#### 1. Unit Tests
```typescript
describe('[Component/Feature Name]', () => {
  it('renders correctly', () => {
    // Test rendering
  });
  
  it('handles user interactions', () => {
    // Test click, input, etc.
  });
  
  it('meets acceptance criteria', () => {
    // Test specific AC from sub-issue
  });
});
```

**Required:**
- [ ] Test file created/updated
- [ ] All acceptance criteria tested
- [ ] Edge cases covered
- [ ] Coverage report shows 90%+

---

#### 2. Accessibility Tests
```typescript
import { axe } from 'jest-axe';

it('meets WCAG 2.2 AA standards', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Required:**
- [ ] axe test added
- [ ] No accessibility violations
- [ ] ARIA labels tested
- [ ] Keyboard navigation tested

---

#### 3. Visual Regression Tests (Playwright)
```typescript
test('matches visual snapshot', async ({ page }) => {
  await page.goto('/calculator');
  await expect(page).toHaveScreenshot();
});

test('dark mode renders correctly', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page).toHaveScreenshot();
});
```

**Required:**
- [ ] Light mode screenshot
- [ ] Dark mode screenshot
- [ ] Mobile viewport screenshot
- [ ] No visual regressions

---

#### 4. Performance Tests
```typescript
test('renders within 100ms', async ({ page }) => {
  const start = Date.now();
  await page.goto('/calculator');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(100);
});
```

**Required:**
- [ ] Performance benchmarks
- [ ] No performance regressions
- [ ] Lighthouse score maintained

---

#### 5. Integration Tests (E2E)
```typescript
test('complete user flow works', async ({ page }) => {
  await page.goto('/calculator');
  await page.fill('[name="salary"]', '50000');
  await page.click('[data-testid="calculate"]');
  await expect(page.locator('.results')).toBeVisible();
});
```

**Required:**
- [ ] Critical paths tested
- [ ] User flows work end-to-end
- [ ] All interactive features work

---

### Definition of Done (Testing Checklist)

For EVERY sub-issue, before marking "Done":

```markdown
## ✅ Testing Checklist

- [ ] Unit tests written/updated
- [ ] Test coverage 90%+
- [ ] Accessibility tests pass (axe)
- [ ] Visual regression tests pass
- [ ] Performance tests pass
- [ ] Integration tests pass (if applicable)
- [ ] All tests pass in CI
- [ ] Coverage report reviewed
- [ ] No skipped tests without justification
- [ ] Test documentation updated
```

**If ANY checkbox is unchecked, sub-issue is NOT done!**

---

## 📊 Summary: What We Should Be Using

| Category | Package | Version | Current Usage | Target |
|----------|---------|---------|---------------|--------|
| React 19 | useOptimistic | 19.2.0 | ❌ 0% | ✅ 100% calculator inputs |
| React 19 | useActionState | 19.2.0 | ❌ 0% | ✅ 100% forms |
| React 19 | Server Components | 19.2.0 | ⚠️ 50% | ✅ 80% (less "use client") |
| Next.js 16 | after() | 16.0.1 | ❌ 0% | ✅ 100% analytics |
| Next.js 16 | Server Actions | 16.0.1 | ✅ 20% | ✅ 100% mutations |
| Next.js 16 | Parallel Routes | 16.0.1 | ❌ 0% | ✅ All modals |
| Tailwind 4 | @theme | 4.1.14 | ⚠️ Partial | ✅ 100% colors |
| Tailwind 4 | Container Queries | 4.1.14 | ❌ 0% | ✅ All components |
| shadcn | /ui folder | N/A | ⚠️ Mixed | ✅ Library only |
| shadcn | lucide-react | 0.553.0 | ⚠️ 84% | ✅ 100% |
| Recharts | Performance | 3.3.0 | ⚠️ Partial | ✅ All memoized |
| Zod 4 | Props validation | 4.1.11 | ❌ 10% | ✅ 100% |
| Zod 4 | Config validation | 4.1.11 | ❌ 0% | ✅ 100% |
| Framer | Layout animations | 12.23.22 | ✅ 60% | ✅ 100% |
| Testing | Coverage | 90%+ | ⚠️ ~70% | ✅ 90%+ |

---

## 🎯 Integration with Audit Framework

**Every sub-issue should reference this document for:**

1. **Tech Stack Section** - What features to look for
2. **Best Practices** - What "good" looks like
3. **Testing Requirements** - Mandatory test coverage
4. **Acceptance Criteria** - Include tech stack maximization

**Example Sub-Issue Template:**
```markdown
## Tech Stack Maximization (Reference: TECH-STACK-MAXIMIZATION.md)
- [ ] Uses React 19 useOptimistic (if applicable)
- [ ] Uses Next.js 16 after() for analytics (if applicable)
- [ ] Uses Zod 4 validation
- [ ] Tailwind 4 best practices
- [ ] 100% lucide-react icons

## Testing Requirements (MANDATORY)
- [ ] Unit tests: 90%+ coverage
- [ ] Accessibility tests: axe passing
- [ ] Visual regression: screenshots match
- [ ] Performance: No regressions
- [ ] Integration: User flows work
```

---

**This document is THE reference for all audit decisions!**
