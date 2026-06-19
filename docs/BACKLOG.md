# PayeTax Backlog

Current backlog for the public R&D version of PayeTax.

## Active

### SEO / AEO / GEO Audit Follow-ups

Verified on 2026-06-19 against source code and current Google Search guidance.

1. Reconcile `/api/tax-rates` crawler and indexing posture.
   - Evidence: `robots.ts` explicitly allows `/api/tax-rates`; `StructuredData.tsx` advertises it as the Dataset `DataDownload`; `next.config.ts` applies `X-Robots-Tag: noindex, nofollow` to all `/api/*` routes.
   - DoD: a single intended posture is documented in code comments and PR notes.
   - DoD: if `/api/tax-rates` is the citable machine-readable dataset, its response is not covered by `noindex, nofollow`; if it is not intended as a citable dataset, remove it from Dataset distribution and crawler allow rules.
   - DoD: tests cover the chosen alignment between robots rules, response headers, and Dataset schema.

2. Confirm and fix Director guide FAQ visible-text parity.
   - Evidence: `/tools/director-guide` emits FAQPage JSON-LD from `faqItems`, but the exact FAQ questions and answers were not found in rendered Director guide components.
   - DoD: each FAQ question and answer in the JSON-LD is visibly rendered on `/tools/director-guide`, or the FAQ schema is removed from that route.
   - DoD: a focused test or content assertion prevents schema-only FAQ text returning unnoticed.
   - DoD: the final wording stays soft enough for tax guidance limits and does not invent advisory claims.

3. Make the AI crawler policy explicit.
   - Evidence: `robots.ts` explicitly names search-oriented AI crawlers (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`), while training or extended-use crawlers such as `GPTBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`, and `Bytespider` fall under the permissive `*` rule by omission.
   - DoD: an allow/deny matrix is recorded for search, user-triggered fetch, training, and extended-use crawler families.
   - DoD: `robots.ts` reflects that decision deliberately, including comments for crawlers that should remain governed by `*`.
   - DoD: existing robots tests are updated without broadening access to operational or private paths.

4. Calibrate FAQ, HowTo, and `llms.txt` expectations in project docs.
   - Evidence: FAQPage and HowTo schema remain present, but Google no longer shows FAQ rich results and has deprecated HowTo rich results; `llms.txt` is retained as a low-cost content map, not a confirmed major ranking or citation lever.
   - DoD: docs state that FAQ/HowTo markup is kept for semantic clarity and answer extraction, not expected Google rich-result features.
   - DoD: docs state that server-rendered HTML, visible source citations, Dataset JSON-LD, and static tax facts are the primary AEO/GEO assets.
   - DoD: no new growth-page families, invented authority claims, or extra analytics tooling are introduced.

5. Improve sitemap freshness granularity for static pages.
   - Evidence: `sitemap.ts` currently applies `RATES_LAST_VERIFIED` to unrelated static pages such as `/about`, `/privacy`, and `/install`.
   - DoD: tax-rate-sensitive pages continue to use the rate verification date.
   - DoD: non-tax static pages use page-specific reviewed/modified dates where cheaply available, or a documented fallback when not.
   - DoD: sitemap tests cover at least one tax page and one non-tax static page with different expected `lastModified` values.

6. Audit real Organization `sameAs` profiles before expansion.
   - Evidence: Organization schema currently lists only `https://twitter.com/PayeTaxUK`.
   - DoD: only verified real PayeTax or Jarryd Aubert project profiles are added; no social proof or authority claims are invented.
   - DoD: StructuredData tests cover the final `sameAs` list.
   - DoD: the decision is documented if no additional verified profiles are available.

## Recently Closed

- Brevo API cutover is complete for PAYE and Director results email.
- Email delivery has focused boundary tests for configured, unconfigured, success, provider failure, and network failure paths.
- The current Vercel project link and production/preview env names have been verified for Brevo, Vercel Web Analytics, Vercel Speed Insights, GA4, retained-surface Sentry, and Upstash.
- Upstash-backed rate limiting has a production health endpoint and covered shared limiter diagnostics.
- Public R&D docs have been aligned with the current repo scope.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
