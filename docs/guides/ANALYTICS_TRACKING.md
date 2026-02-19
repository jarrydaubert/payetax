# Analytics Tracking Plan

Last updated: February 19, 2026

## Stack
- Vercel Analytics + Speed Insights (always on, cookieless): `src/app/layout.tsx`
- GA4 via direct `gtag.js` (consent-gated): `src/components/organisms/Analytics.tsx`
- Ahrefs Analytics (consent-gated): `src/components/organisms/AhrefsAnalytics.tsx`
- Shared event helper: `src/lib/analytics.ts`

## Conversion Events
| Event | Trigger | Properties | Source |
| --- | --- | --- | --- |
| `calculator_start` | User starts PAYE calculation | `label` | `src/components/organisms/CalculatorContainer.tsx` |
| `calculator_completed` | PAYE results computed | `salary_range`, `tax_year`, `region`, `employment_type` | `src/store/calculatorStore.ts` |
| `result_viewed` | User toggles result period | `label=period`, `selected`, `visible_period_count` | `src/components/organisms/CalculatorResults/ResultsTable.tsx` |
| `result_shared` | CSV export / print / email results | `label` + `tax_year` + `region` | `src/components/organisms/CalculatorContainer.tsx`, `src/components/molecules/EmailResultsForm.tsx` |
| `guide_started` | Director Intelligence opened | `label` | `src/lib/directorGuideAnalytics.ts` |
| `pro_calculator_started` | Director Intelligence opened (migration alias) | `label` | `src/lib/directorGuideAnalytics.ts` |
| `guide_results_shown` | Director Intelligence results shown | `profit_bucket`, `label=mode` | `src/lib/directorGuideAnalytics.ts` |
| `pro_calculator_completed` | Director results shown (migration alias) | `profit_bucket`, `label=mode` | `src/lib/directorGuideAnalytics.ts` |
| `guide_email_sent` | Director email sent | n/a | `src/lib/directorGuideAnalytics.ts` |
| `newsletter_subscribed` | Kit embed submit / CTA newsletter subscribe | `label` | `src/components/organisms/NewsletterCTA.tsx`, `src/components/molecules/CallToAction.tsx` |
| `blog_article_read` | Blog post opened | `slug`, `category` | `src/components/organisms/BlogArticleAnalytics.tsx` |
| `cta_clicked` | Hero CTA clicked | `label` | `src/components/molecules/HeroCTA.tsx` |
| `pwa_installed` | `appinstalled` fires | `label` | `src/components/organisms/PWAInstallBanner.tsx` |

## Migration Aliases
- `calculator_completion` is a legacy alias for `calculator_completed` (currently dual-emitted; target removal by April 30, 2026).
- `pro_calculator_started`/`pro_calculator_completed` are currently emitted alongside guide events.

## Privacy Rules
- No exact salary or revenue values in analytics.
- No email addresses or other PII in event payloads.
- Custom events require accepted analytics consent via cookie banner.
