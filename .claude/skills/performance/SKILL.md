---
name: performance
description: When discussing performance, Core Web Vitals, page speed, LCP, bundle size, or optimization. PayeTax targets excellent Lighthouse scores for SEO and UX.
---

# Performance for PayeTax

You are a performance engineer. Your goal is to ensure PayeTax loads fast, responds instantly, and provides excellent Core Web Vitals for SEO ranking and user experience.

## PayeTax Performance Context

**Stack:** Next.js 16, React 19, Tailwind CSS 4
**Hosting:** Vercel (Edge, CDN)
**Critical Path:** Calculator on homepage must be interactive fast

## Core Web Vitals Targets

| Metric | Target | PayeTax Focus |
|--------|--------|---------------|
| **LCP** | <2.5s | Hero + Calculator visible fast |
| **INP** | <200ms | Calculator inputs responsive |
| **CLS** | <0.1 | No layout shift on results |

## LCP Optimization

### Identify LCP Element
Usually the hero H1 or calculator container.

### Server-Side Render Critical Content
```tsx
// Good: SSR hero content
export default function HomePage() {
  return (
    <main>
      <h1>UK Tax Calculator</h1> {/* LCP candidate */}
      <Calculator />
    </main>
  );
}

// Bad: Client-only rendering
'use client';
export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  // H1 only appears after hydration = slow LCP
}
```

### Avoid Animation on LCP
```tsx
// Bad: framer-motion delays LCP
<motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  UK Tax Calculator
</motion.h1>

// Good: CSS animation or no animation
<h1 className="animate-fadeIn">UK Tax Calculator</h1>
```

### Font Optimization
```tsx
// next.config.ts - using next/font
import { Inter } from 'next/font/google';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
});
```

## INP Optimization

### Keep Event Handlers Fast
```tsx
// Bad: Heavy computation in handler
const handleSalaryChange = (value) => {
  const result = calculateFullTaxBreakdown(value); // Expensive
  setResults(result);
};

// Good: Debounce or defer
const handleSalaryChange = useDebouncedCallback((value) => {
  startTransition(() => {
    const result = calculateFullTaxBreakdown(value);
    setResults(result);
  });
}, 150);
```

### Use React 19 Transitions
```tsx
import { useTransition, startTransition } from 'react';

const [isPending, startTransition] = useTransition();

const handleInput = (value) => {
  // Urgent: Update input immediately
  setInputValue(value);

  // Non-urgent: Calculate in background
  startTransition(() => {
    setResults(calculate(value));
  });
};
```

## CLS Prevention

### Reserve Space for Dynamic Content
```tsx
// Bad: Results appear and shift content
{results && <ResultsTable data={results} />}

// Good: Skeleton maintains layout
{results ? (
  <ResultsTable data={results} />
) : (
  <ResultsSkeleton /> // Same dimensions
)}
```

### Image Dimensions
```tsx
// Always specify dimensions
<Image
  src="/chart.png"
  width={600}
  height={400}
  alt="Tax breakdown chart"
/>
```

### Font Size Adjust
```css
/* Prevent layout shift from font loading */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  size-adjust: 100%;
}
```

## Bundle Optimization

### Code Splitting

```tsx
// Split heavy components
const Charts = dynamic(() => import('./Charts'), {
  loading: () => <ChartsSkeleton />,
  ssr: false, // Client-only for chart libraries
});

// Split below-fold content
const FAQ = dynamic(() => import('./FAQ'));
```

### Tree Shaking

```tsx
// Bad: Import entire library
import { motion } from 'framer-motion'; // ~150KB

// Good: Import specific
import { motion } from 'framer-motion/m'; // Smaller
// Or use CSS animations instead
```

### Package Analysis

```bash
# Analyze bundle
bun run bundle:analyze

# Check for large dependencies
# Target: Initial JS <200KB compressed
```

### Common Bloat Sources
- `framer-motion` (~150KB) - Use CSS where possible
- `recharts` (~200KB) - Lazy load charts
- `lodash` - Use `lodash-es` or native
- `moment` - Use `date-fns` or native

## Image Optimization

```tsx
// Next.js Image with proper config
<Image
  src="/hero.webp"
  alt="UK Tax Calculator"
  width={1200}
  height={630}
  priority // Only for above-fold
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Image Checklist
- [ ] Use Next.js `<Image>` component
- [ ] WebP/AVIF formats
- [ ] Proper `sizes` attribute
- [ ] `priority` only for LCP images
- [ ] Lazy load below-fold images

## Caching Strategy

### Static Assets (Vercel default)
```
Cache-Control: public, max-age=31536000, immutable
```

### ISR for Dynamic Pages
```tsx
// Salary pages - regenerate periodically
export const revalidate = 3600; // 1 hour

// Or on-demand revalidation
export async function generateStaticParams() {
  return popularSalaries.map(s => ({ salary: s }));
}
```

## Performance Monitoring

### Vercel Analytics
- Automatic Web Vitals tracking
- Real user metrics (RUM)
- No additional setup needed

### Manual Testing
Use Chrome DevTools Lighthouse panel or PageSpeed Insights for ad-hoc testing.

**Key thresholds:**
- Performance score: >90
- LCP: <2.5s
- INP: <200ms
- CLS: <0.1

## Next.js 16 Optimizations

### Turbopack (Dev)
```bash
# Faster dev builds
next dev --turbo
```

### PPR (Partial Prerendering)
```tsx
// next.config.ts
experimental: {
  ppr: true,
}

// Static shell with dynamic holes
export default function Page() {
  return (
    <main>
      <StaticHero /> {/* Pre-rendered */}
      <Suspense fallback={<Skeleton />}>
        <DynamicCalculator /> {/* Streamed */}
      </Suspense>
    </main>
  );
}
```

### Optimized Package Imports
```tsx
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts'],
}
```

## Performance Checklist

### Before Deploy
- [ ] LCP element server-rendered
- [ ] No animation on LCP element
- [ ] Bundle size <200KB initial JS
- [ ] Images optimized with next/image
- [ ] Fonts use `display: swap`
- [ ] Heavy components code-split

### After Deploy
- [ ] Lighthouse score >90
- [ ] LCP <2.5s in field data
- [ ] INP <200ms
- [ ] CLS <0.1
- [ ] No console errors

## Key Files

- `src/app/page.tsx` - Homepage (LCP critical)
- `src/app/layout.tsx` - Root layout, fonts
- `next.config.ts` - Build optimizations
- `src/components/organisms/CalculatorContainer.tsx` - Calculator perf
