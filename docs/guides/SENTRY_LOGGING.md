# Sentry Monitoring

## Scope

Sentry is configured as an error net for retained calculator, tool, blog, and email-results
surfaces. It is not used as sitewide analytics.

Reportable surfaces:

- `/` for the main PAYE calculator.
- `/tools/*` for retained tax tools, including Director Intelligence and standalone calculators.
- `/blog` and `/blog/*` for public article rendering failures.
- `/api/send-results` and `/api/send-director-results` for email-results failures.

Privacy, compliance, install, offline, and other static utility pages still render their local
error UI, but their browser errors are filtered before they reach Sentry.

## What Is Captured

- Unhandled client errors on the monitored calculator routes.
- Blog rendering errors on public article routes.
- Handled operational failures for PAYE and Director email-results API routes.
- Calculator anomaly exceptions.
- Source maps for production releases when `SENTRY_AUTH_TOKEN` is configured and the build is a
  Vercel production build or `PAYETAX_ENABLE_SENTRY_SOURCEMAPS=true`.

## What Is Not Captured

- Session Replay.
- Browser performance tracing.
- Structured Sentry logs.
- Static utility-page errors outside the monitored surfaces.
- Raw user-entered salary, tax code, email, or pension values.
- Source maps from CI, PR preview, and local builds by default.

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
