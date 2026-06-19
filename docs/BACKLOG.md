# PayeTax Backlog

Current backlog for the public R&D version of PayeTax.

## Active

No active backlog items. Keep this list empty until there is a specific verified issue or product improvement worth tracking.

## Parked

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants: revisit only if Search Console shows material impressions or confusing snippets for retired routes.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison: evaluate one at a time only when the workflow is genuinely useful, tested, and not just growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs: PR notes and product direction already treat static HTML, visible citations, Dataset JSON-LD, and crawlable tax facts as the real AEO/GEO assets.

## Recently Closed

- PR #65 implements the final traffic quick wins: browser-only copy/CSV result actions, calculator preset chips for common salaries/modifiers, and 2026/27 metadata refreshes for retained high-visibility salary guides without slug churn.
- PR #65 implements the verified SEO/AEO/GEO and live-audit hygiene items: `/api/tax-rates` crawler/indexing alignment, Director FAQ visible-text parity, explicit AI crawler posture, sitemap freshness granularity, real Organization `sameAs` expansion, single semantic Editor's Picks output, shared public version rendering, About trust summary, and stale blog metadata wording cleanup.
- Brevo API cutover is complete for PAYE and Director results email.
- Email delivery has focused boundary tests for configured, unconfigured, success, provider failure, and network failure paths.
- The current Vercel project link and production/preview env names have been verified for Brevo, Vercel Web Analytics, Vercel Speed Insights, GA4, retained-surface Sentry, and Upstash.
- Upstash-backed rate limiting has a production health endpoint and covered shared limiter diagnostics.
- Public R&D docs have been aligned with the current repo scope.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
