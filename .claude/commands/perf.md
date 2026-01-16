---
description: Performance audit - Core Web Vitals, bundle analysis, LCP optimization
argument-hint: [focus area]
---

# /perf - Performance Engineering

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Do NOT create any files
- Output ALL findings directly in this conversation as markdown

Run a comprehensive performance audit focused on Core Web Vitals and bundle optimization.

**Rules:**
- DO NOT write or modify code
- OUTPUT directly in the chat response
- DO identify performance bottlenecks
- DO recommend specific optimizations with impact estimates
- DO reference file locations and line numbers
- LEAVE implementation to the builder session

## Usage
```
/perf [focus]
```

**Examples:**
- `/perf` - Full performance audit
- `/perf lcp` - Focus on Largest Contentful Paint
- `/perf bundle` - Focus on bundle size analysis
- `/perf mobile` - Focus on mobile performance
- `/perf images` - Focus on image optimization

## Core Web Vitals Checklist

### LCP (Largest Contentful Paint) - Target: <2.5s
- [ ] Identify LCP element (usually H1 or hero image)
- [ ] LCP element in initial HTML (not JS-rendered)
- [ ] No `initial={{ opacity: 0 }}` on LCP element (framer-motion)
- [ ] Fonts preloaded with `display: swap`
- [ ] Critical CSS inlined
- [ ] No render-blocking resources above fold

### FCP (First Contentful Paint) - Target: <1.8s
- [ ] Minimal blocking JavaScript
- [ ] CSS critical path optimized
- [ ] Server response time <200ms (TTFB)
- [ ] HTML streams early content

### CLS (Cumulative Layout Shift) - Target: <0.1
- [ ] Images have explicit width/height
- [ ] Fonts use `font-display: swap` with size-adjust
- [ ] No content injected above existing content
- [ ] Skeleton loaders match final dimensions

### INP (Interaction to Next Paint) - Target: <200ms
- [ ] Event handlers are fast (<50ms)
- [ ] No long tasks blocking main thread
- [ ] Use `startTransition` for non-urgent updates
- [ ] Debounce rapid user inputs

### TBT (Total Blocking Time) - Target: <200ms
- [ ] No individual tasks >50ms
- [ ] Heavy computations in Web Workers
- [ ] Code splitting for non-critical paths
- [ ] Defer non-essential JavaScript

## Bundle Analysis Checklist

### Size Targets
- [ ] Total bundle <3MB
- [ ] Initial JS <200KB (compressed)
- [ ] Largest chunk <500KB

### Common Bloat Sources
- [ ] framer-motion in critical path (~150KB)
- [ ] Full lodash instead of lodash-es
- [ ] Unshaken icon libraries
- [ ] Unused dependencies
- [ ] Source maps in production

### Tree Shaking Verification
- [ ] Named imports used (not `import *`)
- [ ] Side-effect-free packages marked
- [ ] Dead code eliminated
- [ ] Dynamic imports for heavy components

## framer-motion Audit

**Critical Path Detection:**
```bash
# Check for framer-motion in components loaded on initial render
grep -r "from 'framer-motion'" src/components/templates/
grep -r "from 'framer-motion'" src/components/organisms/SimpleNavbar
grep -r "from 'framer-motion'" src/app/layout.tsx
```

**Problematic Patterns:**
- [ ] `motion.div` with `initial={{ opacity: 0 }}` on above-fold content
- [ ] `AnimatePresence` wrapping critical UI
- [ ] Layout animations on initial render

**CSS Alternatives:**
```css
/* Instead of framer-motion for simple animations */
.animate-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
```

## Image Optimization

- [ ] All images use Next.js `<Image>` component
- [ ] Appropriate `sizes` prop set
- [ ] `priority` only on above-fold images
- [ ] WebP/AVIF formats served
- [ ] Lazy loading for below-fold images
- [ ] No oversized images (check intrinsic vs displayed size)

## Font Optimization

- [ ] Using `next/font` for automatic optimization
- [ ] `display: 'swap'` configured
- [ ] Subset to required characters (latin)
- [ ] Preload critical fonts
- [ ] Limited font weights loaded

## JavaScript Optimization

### Code Splitting
- [ ] Route-based splitting (automatic in Next.js)
- [ ] Component-based splitting for heavy components
- [ ] Library splitting (recharts, framer-motion)

### Deferral Strategies
- [ ] `dynamic()` with `ssr: false` for client-only
- [ ] Intersection Observer for below-fold content
- [ ] `requestIdleCallback` for non-critical work

## Lighthouse Commands

```bash
# Quick mobile performance check
bunx lighthouse https://payetax.co.uk --output=json --quiet --chrome-flags="--headless" | jq '{
  performance: (.categories.performance.score * 100),
  lcp: .audits["largest-contentful-paint"].displayValue,
  fcp: .audits["first-contentful-paint"].displayValue,
  cls: .audits["cumulative-layout-shift"].displayValue,
  tbt: .audits["total-blocking-time"].displayValue
}'

# Bundle analysis
bun run bundle:analyze
```

## Output Format

```markdown
## Performance Audit

### Core Web Vitals
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| LCP | X.Xs | <2.5s | ✓/⚠️/❌ |
| FCP | X.Xs | <1.8s | ✓/⚠️/❌ |
| CLS | X.XX | <0.1 | ✓/⚠️/❌ |
| TBT | Xms | <200ms | ✓/⚠️/❌ |

### Critical Issues
1. [Issue]: [Location] - [Impact] - [Fix]

### Bundle Analysis
| Chunk | Size | Issue |
|-------|------|-------|
| ... | ... | ... |

### Recommendations (Priority Order)
1. [High Impact] ...
2. [Medium Impact] ...
3. [Low Impact] ...

### Estimated Impact
- LCP improvement: ~Xs
- Bundle reduction: ~XKB
```

## Key Files to Review

- `src/app/page.tsx` - Homepage (LCP critical)
- `src/app/layout.tsx` - Root layout
- `src/components/templates/Layout.tsx` - Common layout
- `src/components/organisms/SimpleNavbar.tsx` - Navigation
- `next.config.ts` - Build optimization settings
- `package.json` - Dependencies to audit
