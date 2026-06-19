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

### Live SEO / Product Audit Follow-ups

Verified on 2026-06-19 against live PayeTax pages, source code, and cited competitor surfaces.

1. Audit retired intent-route redirects and index remnants.
   - Evidence: `next.config.ts` permanently redirects retired `/scenarios/*`, `/alternatives/*`, `/best-for/*`, `/best-uk-tax-calculators/*`, and `/vs/*` routes; live checks show `/alternatives/salary-calculator` and `/best-for/contractors` resolving to `/tools`, while `/scenarios/*` resolves to `/#tax-calculator`.
   - DoD: Search Console or another live-index source confirms which retired URLs, if any, still receive impressions or indexed snippets.
   - DoD: each remaining indexed retired URL has a documented decision: keep redirecting to a genuinely equivalent retained page, request removal/noindex where appropriate, or build a useful retained surface only when it fits the R&D scope.
   - DoD: no competitor-style SEO page family or generic growth page family is restored by default.
   - DoD: redirect tests cover representative retired routes and their intended destinations.

2. Remove duplicate Editor's Picks output from the blog page.
   - Evidence: `/blog` renders repeated Editor's Picks blocks in crawlable output; source renders separate desktop and mobile `EditorsPicksSticky` instances, and the component itself renders desktop/tablet plus mobile variants.
   - DoD: the blog has one semantic Editor's Picks section in crawled text and the accessibility tree across desktop and mobile breakpoints.
   - DoD: visual behavior remains responsive, with a sticky desktop sidebar and a compact mobile interaction if still desired.
   - DoD: tests or an automated assertion prevent repeated Editor's Picks headings/lists from returning.

3. Unify public version rendering from one source of truth.
   - Evidence: live pages currently show `v5.1.4`, but source uses `APP_VERSION` from `package.json` on compliance while the footer reads `process.env.NEXT_PUBLIC_APP_VERSION`, allowing future deployment drift.
   - DoD: footer and compliance use the same build-time version source, with no required Vercel env var for public version display.
   - DoD: tests cover footer and compliance version rendering from the shared source.
   - DoD: `bun run check-version` remains the release gate for package and service-worker cache alignment.

4. Refresh stale-looking blog titles, slugs, and metadata for current tax-year positioning.
   - Evidence: multiple posts published or updated in 2026 still present as `2025` in titles, slugs, SEO titles, and descriptions, while the main calculator is positioned around 2026-27.
   - DoD: salary-guide titles and metadata use tax-year-first wording where appropriate, for example `2026-27` instead of a generic calendar `2025`.
   - DoD: redirects are added for changed slugs, canonical URLs are updated, and internal links continue to resolve.
   - DoD: content body calculations are rechecked against current tax-year constants before wording changes claim freshness.
   - DoD: no broad programmatic salary-page family is added; refresh existing useful guides first.

5. Add a mainstream trust summary near the top of the About page.
   - Evidence: the live About page leads with the R&D/test-lab framing and later proof links; it does not immediately summarize who built the calculator, how calculations are checked, when rates were verified, and what limits apply in user-first language.
   - DoD: the top viewport includes a concise trust block covering builder, verification method, latest rate verification date, privacy posture, and limitations.
   - DoD: wording remains accurate to implementation and avoids invented credentials, review claims, production metrics, or advisory status.
   - DoD: if any professional review note is added, the reviewer and review scope are genuine and documented.

6. Improve result actions and preset exploration on the PAYE calculator.
   - Evidence: the app already supports email results and What If comparison, and static salary examples exist; it does not expose copyable result summaries, CSV download, or salary/loan/region preset chips as first-class calculator controls.
   - DoD: users can copy a concise monthly/annual breakdown without sending data to the server.
   - DoD: any download/share action is client-side or uses the existing email-results flow with the current privacy guarantees.
   - DoD: salary and modifier presets populate the calculator predictably, are keyboard accessible, and do not shift the layout.
   - DoD: analytics events, if added, reuse the existing analytics contract and respect consent rules.

7. Evaluate focused calculator variant gaps against the retained product scope.
   - Evidence: the tools hub currently lists Director Intelligence, tax-code decoder, Scottish tax, NI, and Marriage Allowance calculators; The Salary Calculator exposes reverse/required salary, two-jobs, pro-rata, hourly, overtime/bonus, and two-salary comparison workflows.
   - DoD: decide which variants are genuinely useful for PayeTax's deterministic R&D scope: reverse salary, two-job, pro-rata, bonus/overtime, and salary comparison.
   - DoD: existing salary comparison logic is reused or retired deliberately rather than left as a hidden/partial capability.
   - DoD: any accepted variant ships as a focused calculator/tool with tests, current tax-year metadata, and clear limitations.
   - DoD: rejected variants are documented with the reason, especially when they would become growth-page clutter rather than useful tooling.

## Recently Closed

- Brevo API cutover is complete for PAYE and Director results email.
- Email delivery has focused boundary tests for configured, unconfigured, success, provider failure, and network failure paths.
- The current Vercel project link and production/preview env names have been verified for Brevo, Vercel Web Analytics, Vercel Speed Insights, GA4, retained-surface Sentry, and Upstash.
- Upstash-backed rate limiting has a production health endpoint and covered shared limiter diagnostics.
- Public R&D docs have been aligned with the current repo scope.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
