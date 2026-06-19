# PayeTax Backlog

Current backlog for the public R&D version of PayeTax.

## Active

### Traffic Quick Wins Worth Keeping

Verified on 2026-06-19 after PR #65 handled the obvious SEO/AEO/GEO hygiene.

1. Improve result actions and preset exploration on the PAYE calculator.
   - Evidence: the app already supports email results and What If comparison, and static salary examples exist; it does not expose copyable result summaries, CSV download, or salary/loan/region preset chips as first-class calculator controls.
   - DoD: users can copy a concise monthly/annual breakdown without sending data to the server.
   - DoD: any download/share action is client-side or uses the existing email-results flow with the current privacy guarantees.
   - DoD: salary and modifier presets populate the calculator predictably, are keyboard accessible, and do not shift the layout.
   - DoD: analytics events, if added, reuse the existing analytics contract and respect consent rules.

2. Lightly refresh high-visibility stale blog metadata where the content is already accurate.
   - Evidence: existing salary and tax guides still include calendar-year `2025` or `2025-26` in visible titles, slugs, SEO titles, and descriptions, while the calculator is now positioned around 2026-27.
   - DoD: start with only the most visible retained guides; do not add broad salary-page families.
   - DoD: content body calculations are checked against the tax-year constants before any title or metadata claims current-year freshness.
   - DoD: prefer metadata and title refreshes without slug churn; if a slug changes, add redirects and update canonicals/internal links.

## Parked

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants: revisit only if Search Console shows material impressions or confusing snippets for retired routes.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison: evaluate one at a time only when the workflow is genuinely useful, tested, and not just growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs: PR notes and product direction already treat static HTML, visible citations, Dataset JSON-LD, and crawlable tax facts as the real AEO/GEO assets.

## Recently Closed

- PR #65 implements the verified SEO/AEO/GEO and live-audit hygiene items: `/api/tax-rates` crawler/indexing alignment, Director FAQ visible-text parity, explicit AI crawler posture, sitemap freshness granularity, real Organization `sameAs` expansion, single semantic Editor's Picks output, shared public version rendering, About trust summary, and stale blog metadata wording cleanup.
- Brevo API cutover is complete for PAYE and Director results email.
- Email delivery has focused boundary tests for configured, unconfigured, success, provider failure, and network failure paths.
- The current Vercel project link and production/preview env names have been verified for Brevo, Vercel Web Analytics, Vercel Speed Insights, GA4, retained-surface Sentry, and Upstash.
- Upstash-backed rate limiting has a production health endpoint and covered shared limiter diagnostics.
- Public R&D docs have been aligned with the current repo scope.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
