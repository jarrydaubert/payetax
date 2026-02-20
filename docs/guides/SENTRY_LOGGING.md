# Sentry Structured Logging Guide

## Overview

Sentry structured logging is enabled across client, server, and edge runtimes.

## What Is Captured

- `console.error()` and `console.warn()`
- Structured logs via `Sentry.logger`

Low‑value logs (debug/info/trace) and PII are filtered out.

## How to Log

Use `Sentry.logger` for structured logs with searchable attributes:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.logger.error('Payment processing failed');
Sentry.logger.warn('Rate limit approaching');

Sentry.logger.error('Failed to process payment', {
  orderId: 'order_id',
  amount: amount,
  userId: user.id,
  errorCode: 'PAYMENT_DECLINED',
});

Sentry.logger.error(
  Sentry.logger.fmt`Payment failed for user ${userId} with order ${orderId}`
);
```

Console logging is also captured automatically for warnings and errors.

## Files

- Client: `instrumentation-client.ts`
- Server: `sentry.server.config.ts`
- Edge: `sentry.edge.config.ts`

## Calculation Anomaly Alerts

PayeTax emits explicit anomaly alerts when calculator output contains impossible values
(for example non-finite numbers, negative tax components, or invalid effective-rate bounds).

Primary signal:
- Sentry exception message containing `Calculation anomaly detected`
- Analytics event `calculator_error` with `error_type=calculation_anomaly`

Minimum triage steps:
1. Capture the Sentry event ID and inspect `tax_year`, `region`, and `salary` context.
2. Reproduce with equivalent non-PII input in non-production.
3. If reproducible, create a blocker issue before marking release health as complete.
