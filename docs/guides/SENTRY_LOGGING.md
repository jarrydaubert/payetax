# Sentry Structured Logging Guide

**Last Updated:** December 4, 2024  
**Sentry SDK Version:** 10.28.0  
**Free Tier Quota:** 5GB logs/month

---

## ✅ Logging is Enabled

Sentry structured logging is now enabled across all runtimes:
- ✅ **Client-side** (`instrumentation-client.ts`)
- ✅ **Server-side** (`sentry.server.config.ts`)
- ✅ **Edge runtime** (`sentry.edge.config.ts`)

---

## 📊 What's Being Logged Automatically

### Console Integration (Automatic)
We're automatically capturing:
- ✅ `console.error()` - Error level logs
- ✅ `console.warn()` - Warning level logs
- ❌ `console.log()` - NOT captured (filtered to save quota)
- ❌ `console.debug()` - NOT captured (filtered to save quota)

### Log Filtering (Smart Quota Management)

**Automatically filtered OUT:**
- Development environment logs (never sent)
- `info`, `debug`, `trace` level logs (only `warn`, `error`, `fatal` sent)
- PII data (email, phone, tax codes, etc.)
- Static asset requests
- Health check endpoints

This keeps us well within the 5GB/month free tier! 🎯

---

## 🚀 How to Use Sentry Logging

### Method 1: Direct Sentry Logger (Recommended)

Use `Sentry.logger` for structured logs with searchable attributes:

```typescript
import * as Sentry from '@sentry/nextjs';

// Basic logging
Sentry.logger.error('Payment processing failed');
Sentry.logger.warn('Rate limit approaching');

// Logging with attributes (searchable in Sentry UI)
Sentry.logger.error('Failed to process payment', {
  orderId: 'order_123',
  amount: 99.99,
  userId: user.id,
  errorCode: 'PAYMENT_DECLINED',
});

// Using template literals with fmt
Sentry.logger.error(
  Sentry.logger.fmt`Payment failed for user ${userId} with order ${orderId}`
);

// Different log levels
Sentry.logger.trace('Starting function'); // Filtered out (not sent)
Sentry.logger.debug('Cache hit'); // Filtered out (not sent)
Sentry.logger.info('User logged in'); // Filtered out (not sent)
Sentry.logger.warn('API rate limit at 80%'); // ✅ Sent to Sentry
Sentry.logger.error('Database connection lost'); // ✅ Sent to Sentry
Sentry.logger.fatal('Critical system failure'); // ✅ Sent to Sentry
```

### Method 2: Console Logging (Automatic)

Just use `console.warn()` or `console.error()` - they're automatically captured:

```typescript
// Automatically captured by Sentry
console.error('Failed to load user data:', error);
console.warn('Deprecated API endpoint called');

// NOT captured (filtered)
console.log('User clicked button');
console.debug('Variable value:', someVar);
```

### Method 3: Printf-Style Formatting (Server-side only)

Works in Node.js and Bun runtimes:

```typescript
Sentry.logger.error(
  'Failed to process payment. Order: %s. Amount: %d',
  ['order_123', 99.99]
);

Sentry.logger.warn('User %s attempted %d failed logins', [
  'john@example.com',
  5,
]);
```

---

## 🔍 Real-World Examples

### Example 1: API Error Logging

```typescript
// src/app/api/calculate/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = calculateTax(body.salary);
    return Response.json(result);
  } catch (error) {
    // Automatically captured with full context
    Sentry.logger.error('Tax calculation failed', {
      salary: body.salary,
      taxCode: body.taxCode,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return Response.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
```

### Example 2: Client-side Error Boundary

```typescript
// src/components/atoms/ErrorBoundary.tsx
import * as Sentry from '@sentry/nextjs';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.logger.error('React error boundary caught error', {
    error: error.message,
    componentStack: errorInfo.componentStack,
    location: window.location.pathname,
  });
}
```

### Example 3: Business Logic Warnings

```typescript
// src/lib/calculations/taxCalculator.ts
import * as Sentry from '@sentry/nextjs';

export function calculateTax(salary: number) {
  // Log unusual inputs
  if (salary > 10_000_000) {
    Sentry.logger.warn('Unusually high salary detected', {
      salary,
      timestamp: Date.now(),
    });
  }

  // Your calculation logic...
}
```

---

## 📈 Viewing Logs in Sentry

1. **Go to your Sentry dashboard**
2. **Navigate to:** Explore → Logs
3. **Search and filter by:**
   - Log level (warn, error, fatal)
   - Attributes (userId, orderId, etc.)
   - Time range
   - Environment (production, staging)

### Logs are correlated with:
- ✅ Related errors
- ✅ User information
- ✅ Session replays
- ✅ Breadcrumbs
- ✅ Performance traces

---

## 🎯 Best Practices

### DO ✅

```typescript
// DO: Use structured attributes
Sentry.logger.error('Payment failed', {
  orderId: 'order_123',
  amount: 99.99,
  errorCode: 'DECLINED',
});

// DO: Log meaningful business events
Sentry.logger.warn('User reached rate limit', {
  userId: user.id,
  endpoint: '/api/calculate',
  requestCount: 100,
});

// DO: Add context for debugging
Sentry.logger.error('Database query failed', {
  query: 'SELECT * FROM users',
  database: 'production',
  duration: 5000, // ms
});
```

### DON'T ❌

```typescript
// DON'T: Log PII directly (it's filtered anyway, but avoid it)
Sentry.logger.error('User error', {
  email: 'user@example.com', // Will be filtered to '[Filtered]'
  name: 'John Doe', // Will be filtered to '[Filtered]'
});

// DON'T: Use info/debug levels (they're filtered anyway)
Sentry.logger.info('User logged in'); // Won't be sent

// DON'T: Log without context
Sentry.logger.error('Error'); // Not helpful for debugging
```

---

## 🔒 Privacy & PII Protection

All logs are automatically scrubbed for PII before being sent to Sentry.

**Filtered fields:**
- `email`
- `name`
- `phone`
- `address`
- `postcode`
- `password`
- `token`
- `secret`
- `apiKey`
- `authorization`
- `nationalInsuranceNumber`
- `taxCode`

**Example:**
```typescript
Sentry.logger.error('User update failed', {
  userId: '123', // ✅ Sent
  email: 'user@example.com', // ❌ Filtered to '[Filtered]'
  taxCode: '1257L', // ❌ Filtered to '[Filtered]'
});
```

---

## 📊 Quota Management

**Free Tier:** 5GB logs/month

**Our Usage Strategy:**
- ✅ Only send `warn`, `error`, `fatal` levels
- ✅ Filter out development/localhost logs
- ✅ Filter out noisy endpoints (health checks, static assets)
- ✅ Scrub PII to reduce log size

**Estimated Usage:**
- Average log entry: ~1-2 KB
- 5GB = ~2.5-5 million log entries/month
- ~80,000-160,000 logs per day

We should stay well within this limit! 📊

---

## 🧪 Testing Logging

### Development (Local)
```bash
# Logs are NOT sent in development
npm run dev

# Check console - you'll see logs locally but NOT in Sentry
```

### Production (Staging/Live)
```bash
# Deploy to production
npm run build
npm run start

# Trigger a test error
console.error('Test error from production');

# Check Sentry dashboard: Explore → Logs
```

---

## 🚨 Common Use Cases

### 1. API Errors
```typescript
Sentry.logger.error('External API call failed', {
  api: 'HMRC',
  endpoint: '/tax-rates',
  statusCode: 500,
  retry: 3,
});
```

### 2. Validation Errors
```typescript
Sentry.logger.warn('Invalid input detected', {
  field: 'salary',
  value: salary,
  expected: 'number > 0',
});
```

### 3. Performance Issues
```typescript
Sentry.logger.warn('Slow query detected', {
  query: 'getTaxRates',
  duration: 5000, // ms
  threshold: 1000, // ms
});
```

### 4. Business Logic Alerts
```typescript
Sentry.logger.warn('High value transaction', {
  salary: 1_000_000,
  userId: user.id,
  timestamp: Date.now(),
});
```

---

## 📚 Additional Resources

- [Sentry Logs Documentation](https://docs.sentry.io/product/explore/logs/getting-started/)
- [Next.js Logging Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [Sentry Free Tier Pricing](https://sentry.io/pricing/)

---

## 🎉 Summary

✅ **Logging is enabled and ready to use!**
- 5GB/month free quota
- Automatic console.error/warn capture
- Structured logging with `Sentry.logger`
- PII protection built-in
- Smart filtering to conserve quota

Just use `console.error()`, `console.warn()`, or `Sentry.logger.error()` and your logs will automatically appear in Sentry! 🚀
