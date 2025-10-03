# 📦 Bundle Size Optimization Guide

This document provides comprehensive guidelines for monitoring and optimizing bundle size in the PayeTax application.

## 🎯 Current Bundle Status

| Metric | Current Target | Threshold | Status |
|--------|----------------|-----------|---------|
| Total Bundle Size | < 350KB | 512KB | ✅ |
| First Load JS | < 200KB | 250KB | ✅ |
| Individual Chunks | < 80KB | 100KB | ✅ |

## 🛠️ Available Tools

### Bundle Analysis Scripts

```bash
# Quick bundle analysis (requires built application)
npm run bundle:analyze

# Full build + analysis
npm run bundle:monitor

# Visual bundle analysis with webpack-bundle-analyzer
npm run build:analyze
```

### Continuous Monitoring

- **GitHub Actions**: Automated bundle analysis on every PR
- **Bundle History**: Tracks size changes over time
- **Threshold Alerts**: Fails CI if bundle size exceeds limits

## 📊 Understanding Bundle Components

### First Load JS
JavaScript that must be loaded for the initial page render:
- Framework code (React, Next.js)
- Main application bundle
- Critical CSS-in-JS
- Route-specific code for the current page

**Target**: < 250KB (current: ~200KB)

### Code-Split Chunks
JavaScript loaded on-demand:
- Dynamic imports
- Route-based chunks
- Component-level chunks
- Third-party libraries

### Static Assets
- Images, fonts, icons
- CSS files
- Other static resources

## 🎯 Optimization Strategies

### 1. Dynamic Imports

```typescript
// ❌ Static import (adds to main bundle)
import HeavyComponent from './HeavyComponent';

// ✅ Dynamic import (creates separate chunk)
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});

// ✅ Conditional dynamic import
const loadHeavyFeature = async () => {
  const { heavyFunction } = await import('./heavy-utils');
  return heavyFunction();
};
```

### 2. Library Optimization

```typescript
// ❌ Import entire library
import _ from 'lodash';

// ✅ Import specific functions
import { debounce } from 'lodash/debounce';

// ✅ Use tree-shakable alternatives
import { debounce } from 'lodash-es';
```

### 3. Next.js Optimizations

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },
  
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')();
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    
    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
};
```

### 4. Component-Level Optimizations

```typescript
// ✅ Lazy load heavy components
const ChartComponent = lazy(() => import('./ChartComponent'));

// ✅ Use React.memo for expensive renders
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// ✅ Split component bundles
const CalculatorSection = dynamic(() => import('./CalculatorSection'), {
  ssr: true, // Enable SSR for SEO
  loading: () => <CalculatorSkeleton />
});
```

### 5. CSS Optimization

```typescript
// ✅ Use CSS modules for better tree shaking
import styles from './Component.module.css';

// ✅ Dynamic CSS imports
const loadTheme = async (theme: string) => {
  await import(`./themes/${theme}.css`);
};

// ✅ Critical CSS extraction
// Automatically handled by Next.js 13+
```

## 📈 Monitoring & Alerts

### Bundle Size Thresholds

| Component | Warning | Error | Current |
|-----------|---------|-------|---------|
| Total Bundle | 400KB | 512KB | ~280KB |
| First Load JS | 200KB | 250KB | ~180KB |
| Individual Chunk | 80KB | 100KB | <60KB |
| Unused JS | 15KB | 20KB | <10KB |

### Performance Impact

```typescript
// Bundle size directly affects:
// - First Contentful Paint (FCP)
// - Largest Contentful Paint (LCP)  
// - Time to Interactive (TTI)
// - Cumulative Layout Shift (CLS)

// Target bundle sizes for optimal performance:
const PERFORMANCE_TARGETS = {
  mobile3G: 200, // KB for 3G mobile
  mobile4G: 350, // KB for 4G mobile  
  desktop: 500,  // KB for desktop
};
```

## 🔧 Troubleshooting Common Issues

### Large First Load JS

**Symptoms**: First Load JS > 250KB

**Solutions**:
1. Move non-critical components to dynamic imports
2. Defer loading of analytics and tracking scripts
3. Use React.lazy for route components
4. Split vendor libraries into separate chunks

```bash
# Analyze what's in First Load JS
npm run build:analyze
```

### Duplicate Dependencies

**Symptoms**: Multiple versions of same library

**Solutions**:
1. Use npm resolution to force single version
2. Remove unnecessary dependencies
3. Use peer dependencies where appropriate

```json
// package.json
{
  "resolutions": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

### Large Individual Chunks

**Symptoms**: Individual chunks > 100KB

**Solutions**:
1. Further split large components
2. Use dynamic imports for heavy libraries
3. Implement progressive loading

```typescript
// Split large forms
const TaxCalculatorForm = dynamic(() => 
  import('./forms/TaxCalculatorForm')
);

const ResultsDisplay = dynamic(() => 
  import('./results/ResultsDisplay')
);
```

## 📋 Bundle Optimization Checklist

### Pre-Development
- [ ] Choose lightweight alternatives to heavy libraries
- [ ] Plan component architecture with bundle splitting in mind
- [ ] Set up bundle monitoring in development workflow

### Development
- [ ] Use dynamic imports for non-critical code
- [ ] Implement lazy loading for heavy components  
- [ ] Avoid importing entire libraries
- [ ] Use tree-shakable library imports

### Pre-Deployment
- [ ] Run bundle analysis
- [ ] Check bundle size thresholds
- [ ] Verify no regression in bundle size
- [ ] Test performance on slow networks

### Post-Deployment
- [ ] Monitor bundle size trends
- [ ] Set up alerts for bundle size increases
- [ ] Regular dependency audits
- [ ] Performance monitoring

## 📊 Bundle Analysis Commands

```bash
# Complete bundle analysis workflow
npm run bundle:monitor

# Quick size check (requires built app)
npm run bundle:analyze  

# Visual analysis with webpack-bundle-analyzer
npm run build:analyze

# Performance + bundle analysis
npm run audit:perf:ci

# View bundle history
cat bundle-history.json | jq '.measurements[-5:]'
```

## 🎯 Optimization Goals for 2025

### Short Term (Next 3 Months)
- [ ] Maintain total bundle < 300KB
- [ ] Reduce First Load JS to < 180KB
- [ ] Implement progressive loading for calculator
- [ ] Set up automated bundle regression detection

### Medium Term (3-6 Months)  
- [ ] Implement service worker for caching
- [ ] Add bundle splitting by route
- [ ] Optimize third-party library loading
- [ ] Implement resource hints (prefetch/preload)

### Long Term (6+ Months)
- [ ] Evaluate WebAssembly for calculations
- [ ] Implement micro-frontend architecture
- [ ] Advanced caching strategies
- [ ] Edge computing optimizations

---

**Last Updated**: August 28, 2025
**Bundle Analysis**: Automated via GitHub Actions
**Monitoring**: Continuous with threshold alerts