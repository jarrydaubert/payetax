# Sentry Error Tracking & Performance Monitoring

> Complete guide to Sentry integration in PayeTax (v10.22.0)

**Last Updated:** 7 November 2025  
**Related:** PAYTAX-76 - Sentry 10.22.0 Maximization

---

## 📋 Overview

PayeTax uses Sentry for comprehensive error tracking, performance monitoring, and user experience insights. This document covers configuration, usage patterns, and best practices.

### Key Features

- **Error Tracking** - Automatic exception capture with rich context
- **Performance Monitoring** - Transaction and span tracking for optimization
- **Session Replay** - Visual playback of error scenarios (production only)
- **Breadcrumbs** - Debug trail showing user actions leading to errors
- **Source Maps** - Readable stack traces in production
- **Custom Context** - Calculator-specific error data

---

## 🚀 Quick Start

### Using Sentry Utilities

```typescript
import {
  captureCalculatorError,
  captureValidationError,
  captureAPIError,
  addBreadcrumb,
  setContext,
  startPerformanceTransaction,
} from '@/lib/sentry';

// Track calculator errors
try {
  const result = calculateTax(input);
} catch (error) {
  captureCalculatorError(error, {
    salary: 50000,
    taxYear: '2025-26',
    region: 'England',
    taxCode: '1257L'
  });
}

// Track validation errors
const result = schema.safeParse(data);
if (!result.success) {
  captureValidationError(result.error, {
    field: 'salary',
    errorMessage: result.error.message,
    attemptedValue: data.salary,
    location: 'CalculatorInputs'
  });
}

// Add breadcrumbs for debugging
addBreadcrumb('calculator-input', {
  message: 'User changed salary',
  level: 'info',
  data: { previousSalary: 45000, newSalary: 50000 }
});

// Track performance
const transaction = startPerformanceTransaction('calculate-tax');
try {
  // ... perform calculation
  transaction.setStatus('ok');
} finally {
  transaction.finish();
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional (for uploading source maps)
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=payetax
SENTRY_PROJECT=javascript-nextjs
```

### Runtime Configurations

Sentry is configured separately for each Next.js runtime:

1. **Client Runtime** (`instrumentation-client.ts`)
   - Session Replay with privacy controls
   - Browser tracing for performance
   - Breadcrumbs (DOM, fetch, navigation)
   - 20% transaction sampling in production

2. **Server Runtime** (`sentry.server.config.ts`)
   - HTTP instrumentation
   - Extra error data capture
   - Custom trace sampling (80% for critical APIs)
   - 30% default transaction sampling

3. **Edge Runtime** (`sentry.edge.config.ts`)
   - Lightweight configuration
   - 50% transaction sampling
   - Middleware monitoring (80% sampling)

### Sampling Rates

**Production:**
- Client: 20% general, 40% calculator pages, 50% API routes
- Server: 30% general, 80% critical APIs (calculate, tax, salary)
- Edge: 50% general, 80% middleware

**Development:**
- All runtimes: 100% sampling for comprehensive debugging

---

## 📊 Error Tracking

### Automatic Error Capture

Sentry automatically captures:
- ✅ Unhandled exceptions
- ✅ Promise rejections
- ✅ React component errors (via ErrorBoundary)
- ✅ API route errors
- ✅ Server-side rendering errors

### Manual Error Capture

Use specialized capture functions for better grouping:

```typescript
// Calculator errors
captureCalculatorError(error, {
  salary: 50000,
  taxYear: '2025-26',
  region: 'England',
  taxCode: '1257L',
  studentLoanPlan: 'plan2',
  pensionContribution: 5,
  isMarried: true
});

// Validation errors
captureValidationError(error, {
  field: 'salary',
  errorMessage: 'Salary must be positive',
  attemptedValue: -1000,
  location: 'calculatorStore.setSalary'
});

// API errors
captureAPIError(error, {
  endpoint: '/api/calculate',
  method: 'POST',
  statusCode: 500,
  requestParams: { salary: 50000 }
});
```

### Error Boundary

React errors are caught by `ErrorBoundary` component:

```tsx
<ErrorBoundary fallback={CustomErrorUI}>
  <YourComponent />
</ErrorBoundary>
```

Global errors use Next.js `global-error.tsx`:
- Automatically reports to Sentry
- Sends email notification
- Shows user-friendly error page

---

## 🎯 Performance Monitoring

### Transactions

Track important operations:

```typescript
const transaction = startPerformanceTransaction('calculate-tax', {
  salary: 50000,
  taxYear: '2025-26'
});

try {
  const result = calculateTax(input);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Spans

Measure specific operations within a transaction:

```typescript
const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
const span = startPerformanceSpan(transaction, 'validate-input');
// ... validation logic
span?.finish();
```

### Wrapped Functions

Automatically track function performance:

```typescript
// Async function
const safeCalculate = withErrorTracking(
  calculateTax,
  'calculate-tax',
  { operation: 'tax-calculation' }
);

// Sync function
const safeValidate = withErrorTrackingSync(
  validateInput,
  'validate-input',
  { operation: 'validation' }
);
```

---

## 🍞 Breadcrumbs

Breadcrumbs create a trail of events leading to an error.

### Adding Breadcrumbs

```typescript
addBreadcrumb('user-action', {
  message: 'User changed salary input',
  level: 'info',
  data: {
    previousSalary: 45000,
    newSalary: 50000,
    timestamp: Date.now()
  }
});

addBreadcrumb('calculator', {
  message: 'Starting tax calculation',
  level: 'info',
  data: {
    salary: 50000,
    taxYear: '2025-26',
    region: 'England'
  }
});
```

### Automatic Breadcrumbs

Sentry automatically records:
- ✅ DOM events (clicks, inputs)
- ✅ Fetch/XHR requests
- ✅ Navigation (route changes)
- ✅ Console messages (error/warn only)
- ❌ Console.log (filtered to reduce noise)

---

## 🏷️ Context & Tags

### Custom Context

Add structured data to error reports:

```typescript
setContext('calculator_state', {
  salary: 50000,
  taxYear: '2025-26',
  lastCalculation: new Date().toISOString(),
  hasStudentLoan: true,
  pensionContribution: 5
});

setContext('browser_info', {
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  online: navigator.onLine,
  connection: navigator.connection?.effectiveType
});
```

### Tags for Filtering

Tags help group and filter errors in Sentry:

```typescript
setTags({
  tax_year: '2025-26',
  region: 'Scotland',
  feature: 'calculator',
  environment: 'production'
});
```

### User Context

Track which users experience errors:

```typescript
setUserContext({
  id: 'user-123',
  email: 'user@example.com',
  region: 'England'
});

// Clear on logout
clearUserContext();
```

---

## 🎨 Session Replay

### Configuration

Session Replay is enabled in **production only** with privacy controls:

```typescript
replaysOnErrorSampleRate: 1.0,  // Capture 100% of errors
replaysSessionSampleRate: 0.1,  // Sample 10% of sessions
```

### Privacy Controls

```typescript
replayIntegration({
  maskAllText: true,           // Hide all text content
  blockAllMedia: true,          // Hide images/videos
  block: [
    '.sentry-block',
    '[data-sentry-block]',
    '[data-private]',
    'input[type="email"]',
    'input[type="tel"]'
  ],
  ignore: ['iframe[src*="buymeacoffee"]']  // Allow specific iframes
})
```

### What's Recorded

- ✅ DOM mutations and layout
- ✅ Mouse movements and clicks
- ✅ Scroll position
- ✅ Console logs (error/warn)
- ✅ Network requests (URLs only, no bodies by default)
- ❌ Text content (masked)
- ❌ Images/media (blocked)
- ❌ Passwords/sensitive inputs (blocked)

---

## 🔒 Privacy & Security

### Data Scrubbing

Sentry automatically scrubs sensitive data:

```typescript
// Sensitive fields removed from request data
const sensitiveFields = [
  'email', 'name', 'phone', 'address', 'postcode',
  'password', 'token', 'secret', 'apiKey',
  'nationalInsuranceNumber', 'taxCode'
];

// Sensitive headers removed
const sensitiveHeaders = [
  'authorization', 'cookie', 'x-api-key', 'x-auth-token'
];
```

### URL Sanitization

Query strings are removed to prevent PII leakage:

```typescript
// Before: https://payetax.co.uk/calculator?email=user@example.com
// After:  https://payetax.co.uk/calculator
```

### Ignored Errors

Common non-actionable errors are filtered:

```typescript
ignoreErrors: [
  // Browser extensions
  'ResizeObserver loop limit exceeded',
  // Network errors (transient)
  'Network request failed',
  'Failed to fetch',
  // User cancellations
  'AbortError',
  'The operation was aborted'
]
```

---

## 📈 Performance Best Practices

### 1. Use Appropriate Sampling

- **Critical paths**: 80-100% (calculator, API)
- **Important pages**: 40-50%
- **General traffic**: 20-30%
- **Static assets**: 0% (don't sample)

### 2. Add Meaningful Context

```typescript
// ✅ Good - Rich context
captureCalculatorError(error, {
  salary: 50000,
  taxYear: '2025-26',
  region: 'England',
  taxCode: '1257L',
  studentLoanPlan: 'plan2'
});

// ❌ Bad - No context
Sentry.captureException(error);
```

### 3. Use Breadcrumbs Strategically

```typescript
// ✅ Good - Track user journey
addBreadcrumb('calculator-input', {
  message: 'Salary updated',
  data: { salary: 50000 }
});

// ❌ Bad - Too much noise
addBreadcrumb('render', { message: 'Component rendered' });
```

### 4. Group Errors with Fingerprints

Errors are automatically grouped by type and location:

```typescript
fingerprint: ['calculator-error', taxYear, region]
fingerprint: ['validation-error', location, field]
fingerprint: ['api-error', endpoint, method]
```

---

## 🧪 Testing Sentry Integration

### Manual Testing

```typescript
import * as Sentry from '@sentry/nextjs';

// Test error capture
Sentry.captureException(new Error('Test error'));

// Test performance
const transaction = Sentry.startTransaction({ name: 'test' });
transaction.finish();

// Test breadcrumbs
Sentry.addBreadcrumb({
  message: 'Test breadcrumb',
  level: 'info'
});
```

### Verify Configuration

```typescript
import { isSentryEnabled } from '@/lib/sentry';

if (isSentryEnabled()) {
  console.log('Sentry is active');
}
```

### Check Source Maps

1. Trigger an error in production
2. Check Sentry dashboard for readable stack traces
3. Verify file paths match your source code

---

## 📊 Monitoring & Alerts

### Key Metrics

Monitor these in Sentry dashboard:

1. **Error Rate** - Errors per minute/hour
2. **Transaction Duration** - P50, P95, P99 percentiles
3. **Apdex Score** - User satisfaction metric
4. **Session Replay** - Visual error debugging
5. **User Impact** - Unique users affected

### Recommended Alerts

- Error rate spike (>100/hour)
- Critical error (severity: fatal)
- Performance regression (P95 >2s)
- High error concentration (single user >10 errors)

---

## 🔍 Debugging Tips

### 1. Use Breadcrumbs

Add breadcrumbs before complex operations:

```typescript
addBreadcrumb('calculator', {
  message: 'Starting tax calculation',
  data: { salary, taxYear, region }
});
```

### 2. Add Context

Set context at the start of operations:

```typescript
setContext('calculator_input', {
  salary: input.salary,
  taxYear: input.taxYear,
  region: input.region
});
```

### 3. Check Transaction Performance

Monitor slow operations:

```typescript
const transaction = startPerformanceTransaction('calculate-tax');
// ... operation
transaction.finish();
// Check duration in Sentry dashboard
```

### 4. Review Session Replays

For user-reported issues:
1. Find error in Sentry
2. Click "Session Replay"
3. Watch user's actions leading to error

---

## 🚨 Common Issues

### Issue: Errors Not Appearing

**Solutions:**
- Check `NEXT_PUBLIC_SENTRY_DSN` is set
- Verify not in development mode (errors filtered)
- Check error isn't in `ignoreErrors` list
- Ensure error rate isn't hitting quota

### Issue: Stack Traces Unreadable

**Solutions:**
- Verify source maps are uploaded
- Check `SENTRY_AUTH_TOKEN` is configured
- Run `npm run build` to generate source maps
- Enable `productionBrowserSourceMaps: true` in next.config

### Issue: Too Many Events

**Solutions:**
- Reduce sampling rates
- Add more errors to `ignoreErrors`
- Filter noisy breadcrumbs
- Implement rate limiting

### Issue: Sensitive Data Leaked

**Solutions:**
- Review `beforeSend` scrubbing logic
- Add fields to `sensitiveFields` array
- Use `maskAllText` in Session Replay
- Check `block` selectors are comprehensive

---

## 📚 Resources

### Documentation

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

### PayeTax Files

- `instrumentation-client.ts` - Client configuration
- `sentry.server.config.ts` - Server configuration
- `sentry.edge.config.ts` - Edge configuration
- `src/lib/sentry.ts` - Utility functions
- `src/components/atoms/ErrorBoundary.tsx` - React error boundary
- `src/app/global-error.tsx` - Global error handler

### Support

- **Internal:** Check Sentry dashboard at [sentry.io](https://sentry.io)
- **Issues:** Tag with `sentry` in Linear
- **Questions:** Refer to this document or Sentry docs

---

## ✅ Checklist: Sentry Integration

Use this checklist when adding Sentry to new features:

- [ ] Import Sentry utilities from `@/lib/sentry`
- [ ] Add error tracking for critical operations
- [ ] Add breadcrumbs for user actions
- [ ] Set context for relevant data
- [ ] Use specialized capture functions (Calculator, Validation, API)
- [ ] Add performance monitoring for slow operations
- [ ] Test error capture in development
- [ ] Verify source maps work in production
- [ ] Review privacy/scrubbing for sensitive data
- [ ] Document any custom Sentry usage

---

**Questions?** Update this document or create a Linear issue tagged `sentry` or `PAYTAX-76`.
