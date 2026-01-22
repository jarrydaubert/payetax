---
name: nextjs-best-practices
description: When discussing Next.js patterns, React 19 features, TypeScript practices, modern web development, or code modernization. Covers Next.js 14-16, React 19, TypeScript 5.9+, and modern patterns.
---

# Next.js Best Practices

You are an expert in modern Next.js development. Your goal is to ensure PayeTax follows current best practices for Next.js 16, React 19, and TypeScript 5.9+.

## PayeTax Stack

- **Next.js 16** with App Router
- **React 19** with new hooks and features
- **TypeScript 5.9+** strict mode
- **Tailwind CSS 4** with OKLCH colors
- **Zustand 5** for state management
- **Zod 4** for validation

## App Router Patterns

### File Structure
```
src/app/
├── (marketing)/        # Route group (no URL segment)
│   ├── about/
│   └── blog/
├── calculator/
│   └── [salary]/       # Dynamic route
├── api/                # API routes
├── layout.tsx          # Root layout
├── page.tsx            # Homepage
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
└── globals.css
```

### Server vs Client Components

```tsx
// Default: Server Component (no directive needed)
export default function Page() {
  // Can use async/await
  // Can access server-only resources
  // No useState, useEffect, event handlers
  return <div>Server rendered</div>;
}

// Client Component (explicit directive)
'use client';
export default function Calculator() {
  const [value, setValue] = useState(0);
  // Can use hooks, event handlers
  return <input onChange={(e) => setValue(e.target.value)} />;
}
```

### When to Use Client Components
- Interactive UI (forms, inputs)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Event handlers (onClick, onChange)

### When to Keep Server Components
- Data fetching
- Backend resources
- Sensitive operations
- Large dependencies (keep off client bundle)

## React 19 Features

### use() Hook
```tsx
// Unwrap promises in render
import { use } from 'react';

function TaxRates({ ratesPromise }) {
  const rates = use(ratesPromise); // Suspends until resolved
  return <div>{rates.basicRate}%</div>;
}
```

### useOptimistic
```tsx
'use client';
import { useOptimistic } from 'react';

function Calculator() {
  const [results, setResults] = useState(null);
  const [optimisticResults, setOptimisticResults] = useOptimistic(results);

  async function calculate(salary) {
    setOptimisticResults({ salary, pending: true }); // Show immediately
    const actual = await calculateTax(salary);
    setResults(actual);
  }
}
```

### useTransition for Non-Urgent Updates
```tsx
'use client';
import { useTransition } from 'react';

function Calculator() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState(null);

  function handleSalaryChange(salary) {
    startTransition(() => {
      setResults(calculateTax(salary)); // Non-blocking
    });
  }

  return (
    <>
      <input onChange={(e) => handleSalaryChange(e.target.value)} />
      {isPending ? <Skeleton /> : <Results data={results} />}
    </>
  );
}
```

### Server Actions
```tsx
// In Server Component or separate file
'use server';

export async function submitFeedback(formData: FormData) {
  const message = formData.get('message');
  await saveFeedback(message);
  revalidatePath('/feedback');
}

// In Client Component
'use client';
import { submitFeedback } from './actions';

function FeedbackForm() {
  return (
    <form action={submitFeedback}>
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

## TypeScript Patterns

### Strict Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type-Safe Routes
```tsx
// next.config.ts
experimental: {
  typedRoutes: true,
}

// Usage
import Link from 'next/link';
import type { Route } from 'next';

<Link href={'/calculator' as Route}>Calculator</Link>
```

### Zod for Runtime Validation
```tsx
import { z } from 'zod';

const SalarySchema = z.number()
  .min(0, 'Salary cannot be negative')
  .max(10_000_000, 'Salary too high');

const TaxCodeSchema = z.string()
  .regex(/^\d{1,4}[LMNPTY]1?$/, 'Invalid tax code format');

// Infer types from schemas
type Salary = z.infer<typeof SalarySchema>;
type TaxCode = z.infer<typeof TaxCodeSchema>;
```

### Discriminated Unions
```tsx
type CalculationResult =
  | { status: 'success'; data: TaxBreakdown }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function Results({ result }: { result: CalculationResult }) {
  switch (result.status) {
    case 'success':
      return <Breakdown data={result.data} />;
    case 'error':
      return <Error message={result.error} />;
    case 'loading':
      return <Skeleton />;
  }
}
```

## Data Fetching Patterns

### Server Component Fetching
```tsx
// Automatic caching and deduplication
async function TaxRates() {
  const rates = await fetch('https://api.example.com/rates', {
    next: { revalidate: 3600 } // ISR: revalidate hourly
  });
  return <div>{rates.basicRate}%</div>;
}
```

### Static Generation with Dynamic Params
```tsx
// Generate at build time
export async function generateStaticParams() {
  return popularSalaries.map((salary) => ({
    salary: salary.toString(),
  }));
}

// Fallback for non-generated pages
export const dynamicParams = true;
```

### Parallel Data Fetching
```tsx
async function Page() {
  // Fetch in parallel, not waterfall
  const [rates, thresholds] = await Promise.all([
    fetchRates(),
    fetchThresholds(),
  ]);
  return <Calculator rates={rates} thresholds={thresholds} />;
}
```

## State Management (Zustand)

### Store Pattern
```tsx
import { create } from 'zustand';

interface CalculatorState {
  salary: number;
  taxCode: string;
  results: TaxBreakdown | null;
  setSalary: (salary: number) => void;
  calculate: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  salary: 0,
  taxCode: '1257L',
  results: null,
  setSalary: (salary) => set({ salary }),
  calculate: () => {
    const { salary, taxCode } = get();
    const results = calculateTax(salary, taxCode);
    set({ results });
  },
}));
```

### Selective Subscriptions
```tsx
// Only re-render when specific values change
const salary = useCalculatorStore((state) => state.salary);
const results = useCalculatorStore((state) => state.results);
```

## Component Patterns

### Compound Components
```tsx
// Flexible, composable API
<Calculator>
  <Calculator.Input />
  <Calculator.Options>
    <Calculator.PensionInput />
    <Calculator.StudentLoanSelect />
  </Calculator.Options>
  <Calculator.Results />
</Calculator>
```

### Render Props for Flexibility
```tsx
<Calculator
  renderResults={(results) => (
    <CustomResults data={results} />
  )}
/>
```

### Forward Refs
```tsx
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
);
Input.displayName = 'Input';
```

## Error Handling

### Error Boundaries
```tsx
// error.tsx - catches errors in route segment
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Graceful Degradation
```tsx
function Calculator() {
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (salary: number) => {
    try {
      const result = SalarySchema.parse(salary);
      // Calculate...
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
    }
  };
}
```

## Security Patterns

### Environment Variables
```tsx
// Server only (no NEXT_PUBLIC_ prefix)
const apiKey = process.env.API_KEY;

// Client accessible (explicit prefix)
const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

### Input Sanitization
```tsx
// Always validate user input
const sanitizedSalary = SalarySchema.parse(userInput);

// Never use dangerouslySetInnerHTML with user content
// If needed, sanitize first:
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

## Testing Patterns

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('calculator shows results', async () => {
  render(<Calculator />);

  await userEvent.type(screen.getByLabelText(/salary/i), '50000');

  expect(screen.getByText(/£32,320/)).toBeInTheDocument();
});
```

### E2E with Playwright
```tsx
test('full calculation flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="salary"]', '50000');
  await expect(page.getByText('£32,320')).toBeVisible();
});
```

## Key Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `src/app/layout.tsx` - Root layout
- `src/lib/validation.ts` - Zod schemas
- `src/store/calculatorStore.ts` - Zustand store
