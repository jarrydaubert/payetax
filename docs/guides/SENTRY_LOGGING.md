# Sentry Calculator Monitoring

## Scope

Sentry is configured as a calculator failure net, not as sitewide analytics.

Reportable surfaces:

- `/` for the main PAYE calculator.
- `/calculator` for old calculator entry points and redirects.
- `/tools/director-guide` for Director Intelligence.
- `/api/send-results` and `/api/send-director-results` for email-results failures.

Blog, privacy, static content, and non-core tool pages still render their local error UI, but their browser errors are filtered before they reach Sentry.

## What Is Captured

- Unhandled client errors on the monitored calculator routes.
- Handled operational failures for PAYE and Director email-results API routes.
- Calculator anomaly exceptions.
- Source maps for production releases when `SENTRY_AUTH_TOKEN` is configured.

## What Is Not Captured

- Session Replay.
- Browser performance tracing.
- Structured Sentry logs.
- Sitewide content-page errors.
- Raw user-entered salary, tax code, email, or pension values.

## Files

- Scope helper: `src/lib/sentryScope.ts`.
- Client configuration: `instrumentation-client.ts`.
- Server configuration: `sentry.server.config.ts`.
- Edge configuration: `sentry.edge.config.ts`.
- Calculator utility wrappers: `src/lib/sentry.ts`.

## Calculation Anomaly Alerts

PayeTax emits explicit anomaly alerts when calculator output contains impossible values, such as non-finite numbers, negative tax components, or invalid effective-rate bounds.

Primary signal:

- Sentry exception message containing `Calculation anomaly detected`.
- Analytics event `calculator_error` with `error_type=calculation_anomaly`.

Minimum triage steps:

1. Capture the Sentry event ID and inspect non-PII tags such as tax year and region.
2. Reproduce with equivalent non-PII input in non-production.
3. If reproducible, create a blocker issue before marking release health as complete.
