---
name: analytics-tracking
version: 1.1.0
description: When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "conversion tracking," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," or "tracking plan." For A/B test measurement, see ab-test-setup.
---

# Analytics Tracking

You are an expert in analytics implementation and measurement. Your goal is to help set up tracking that provides actionable insights for marketing and product decisions.

Tax Pack pre-live guardrail: Tax Pack is planned (not live); unless explicitly requested, optimize and audit only live event funnels and list Tax Pack events as deferred.

## Initial Assessment

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before implementing tracking, understand:

1. **Business Context** - What decisions will this data inform? What are key conversions?
2. **Current State** - What tracking exists? What tools are in use?
3. **Technical Context** - What's the tech stack? Any privacy/compliance requirements?

For PayeTax, start from the known context below and ask only delta questions.

---

## PayeTax Context

PayeTax is a free tool with no user accounts, no purchases, and no subscriptions. Analytics must reflect this model.

### Existing Analytics Stack (live implementation)
- **Vercel Analytics** + **Vercel Speed Insights** in `src/app/layout.tsx` (privacy-preserving)
- **Direct GA4 (`gtag.js`, no GTM)** in `src/components/organisms/Analytics.tsx`
- **Ahrefs Analytics** in `src/components/organisms/AhrefsAnalytics.tsx`
- Shared tracking helper in `src/lib/analytics.ts`
- Director Intelligence event module in `src/lib/directorGuideAnalytics.ts`

### Consent Model (must match code)
- Consent state keys in localStorage:
  - `cookie-consent` (`accepted` / `declined`)
  - `cookie-consent-timestamp` (12-month expiry)
- Consent helper: `src/lib/cookieUtils.ts`
- Banner dispatches `cookieConsentUpdated`: `src/components/organisms/CookieBanner.tsx`
- GA4 defaults to denied storage and upgrades only `analytics_storage` after consent
- Ahrefs script loads only when consent is accepted and key exists
- Vercel Analytics/Speed Insights are not consent-gated in this implementation

### Required Environment Variables
- `NEXT_PUBLIC_ENABLE_ANALYTICS` (set `false` to disable analytics components)
- `NEXT_PUBLIC_GA_ID` (required for GA4)
- `NEXT_PUBLIC_AHREFS_KEY` (required for Ahrefs)
- Keep these documented in `.env.template`

### Canonical Conversion Events (PayeTax)
| Funnel | Event | Key Properties | Source File |
|-------|-------|----------------|-------------|
| PAYE | `calculator_start` | `label` | `src/components/organisms/CalculatorContainer.tsx` |
| PAYE | `calculator_completed` | `salary_range`, `tax_year`, `region`, `employment_type` | `src/store/calculatorStore.ts` |
| PAYE | `result_viewed` | `label` (period), `selected`, `visible_period_count` | `src/components/organisms/CalculatorResults/ResultsTable.tsx` |
| PAYE | `result_shared` | `label`, `tax_year`, `region` | `src/components/organisms/CalculatorContainer.tsx`, `src/components/molecules/EmailResultsForm.tsx` |
| Director Intelligence | `guide_started` | `label` | `src/lib/directorGuideAnalytics.ts` |
| Director Intelligence | `guide_results_shown` | `label`, `profit_bucket` | `src/lib/directorGuideAnalytics.ts` |
| Director Intelligence | `guide_email_sent` | `label` | `src/lib/directorGuideAnalytics.ts` |
| Content/Retention | `newsletter_subscribed` | `label` | `src/components/organisms/NewsletterCTA.tsx`, `src/components/molecules/CallToAction.tsx` |
| Content/Retention | `blog_article_read` | `slug`, `category` | `src/components/organisms/BlogArticleAnalytics.tsx` |
| Content/Retention | `cta_clicked` | `label` | `src/components/molecules/HeroCTA.tsx` |
| Platform | `pwa_installed` | `label` | `src/components/organisms/PWAInstallBanner.tsx` |

### Event Naming and Migration Rules
- Canonical list lives in `docs/guides/ANALYTICS_TRACKING.md`
- Keep dual emits only for active migrations
- Current aliases:
  - `calculator_completion` (legacy alias of `calculator_completed`)
  - `pro_calculator_started` / `pro_calculator_completed` (alongside `guide_*`)
- Every alias must have a removal item in `docs/BACKLOG.md`

### Privacy Constraints
- No user accounts: do **not** introduce `user_id`, `plan_type`, or `account_id`
- Never send exact salary, revenue, profit, or email address values
- Use bucketed fields (`salary_range`, `profit_bucket`, etc.)
- Use `trackEvent()` / `trackSEOAction()` helpers so consent gating remains centralized

### Audit-Derived Guardrails
- Do not exclude homepage from Ahrefs unless explicitly requested
- If events change, update all of:
  - `docs/guides/ANALYTICS_TRACKING.md`
  - `docs/guides/POST_RELEASE_VALIDATION.md`
  - relevant tests
- If public analytics env vars change, update both `.env.template` and `src/lib/env.ts`
- If tracking/privacy materially changes, ensure privacy-page wording/date is updated

---

## Core Principles

### 1. Track for Decisions, Not Data
- Every event should inform a decision
- Avoid vanity metrics
- Quality > quantity of events

### 2. Start with the Questions
- What do you need to know?
- What actions will you take based on this data?
- Work backwards to what you need to track

### 3. Name Things Consistently
- Naming conventions matter
- Establish patterns before implementing
- Document everything

### 4. Maintain Data Quality
- Validate implementation
- Monitor for issues
- Clean data > more data

---

## Tracking Plan Framework

### Structure

```
Event Name | Category | Properties | Trigger | Notes
---------- | -------- | ---------- | ------- | -----
```

### Event Types

| Type | Examples |
|------|----------|
| Pageviews | Automatic, enhanced with metadata |
| User Actions | Button clicks, form submissions, feature usage |
| System Events | Consent updates, performance metrics, PWA install |
| Custom Conversions | Goal completions, funnel stages |

**For comprehensive event lists**: See [references/event-library.md](references/event-library.md)

---

## Event Naming Conventions

### Recommended Format: Object-Action

```
calculator_completed
cta_clicked
form_submitted
blog_article_read
result_shared
```

### Best Practices
- Lowercase with underscores
- Be specific: `cta_clicked` + contextual properties beats many near-duplicate names
- Keep context in properties, not in bloated event names
- Avoid spaces/special characters
- Document every new event in tracking docs

---

## Essential Events

### PayeTax

| Event | Properties |
|-------|------------|
| `calculator_start` | label |
| `calculator_completed` | salary_range, tax_year, region, employment_type |
| `result_viewed` | label (period), selected, visible_period_count |
| `result_shared` | label (csv_export/print/email), tax_year, region |
| `guide_started` / `guide_results_shown` | label, profit_bucket |
| `guide_email_sent` | label |
| `newsletter_subscribed` | label |
| `blog_article_read` | slug, category |
| `cta_clicked` | label |
| `pwa_installed` | label |

---

## Event Properties

### Standard Properties (PayeTax)

| Category | Properties |
|----------|------------|
| Page | page_title, page_location, page_referrer |
| Visitor (anonymous) | returning_visitor, source |
| Campaign | source, medium, campaign, content, term |
| Calculation | tax_year, region, employment_type, salary_range, profit_bucket |

### Best Practices
- Use consistent property names
- Include only decision-relevant context
- Do not duplicate automatic GA fields unless needed
- Avoid PII in properties

---

## GA4 Implementation

### PayeTax Quick Setup

1. Create GA4 property and web data stream
2. Set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_ENABLE_ANALYTICS`
3. Keep Consent Mode defaults denied in `src/components/organisms/Analytics.tsx`
4. Emit events through `trackEvent()` from `src/lib/analytics.ts`
5. Mark canonical events as conversions in GA4 Admin

### Custom Event Example

```javascript
gtag('event', 'calculator_completed', {
  category: 'funnel',
  label: 'paye_calculator',
  salary_range: '50k_75k',
  tax_year: '2025-2026',
  region: 'rUK'
});
```

**For detailed GA4 implementation**: See [references/ga4-implementation.md](references/ga4-implementation.md)

---

## Google Tag Manager

PayeTax currently does **not** use GTM. Do not introduce GTM unless explicitly requested.
If GTM is requested, document migration steps and avoid dual tracking.

**For GTM details (only if adopted)**: See [references/gtm-implementation.md](references/gtm-implementation.md)

---

## UTM Parameter Strategy

### Standard Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| utm_source | Traffic source | google, newsletter |
| utm_medium | Marketing medium | cpc, email, social |
| utm_campaign | Campaign name | spring_sale |
| utm_content | Differentiate versions | hero_cta |
| utm_term | Paid search keywords | running+shoes |

### Naming Conventions
- Lowercase everything
- Use underscores or hyphens consistently
- Be specific but concise: `blog_footer_cta`, not `cta1`
- Document campaign naming decisions

---

## Debugging and Validation

### Testing Tools

| Tool | Use For |
|------|---------|
| GA4 DebugView | Real-time event verification |
| Browser DevTools | Network/script load and consent state checks |
| Browser Extensions | Tag Assistant, dataLayer Inspector |
| GTM Preview Mode | Only if GTM is explicitly adopted |

### Validation Checklist

- [ ] Events fire on expected user actions
- [ ] Consent declined -> no GA4/Ahrefs custom events
- [ ] Consent accepted -> events include expected properties
- [ ] No duplicate events from multiple emit points
- [ ] Event names match `docs/guides/ANALYTICS_TRACKING.md`
- [ ] No PII leakage in payloads

### Common Issues

| Issue | Check |
|-------|-------|
| Events not firing | Consent accepted, env vars present, scripts loaded |
| Wrong values | Correct bucketed fields and property names |
| Duplicate events | Multiple emit sites, Strict Mode re-run, stale migration aliases |

### PayeTax Verification Commands

```bash
bun run fix-all
bun run test:no-coverage
bun run build
```

---

## Privacy and Compliance

### Considerations
- Cookie consent required in UK/EU contexts
- No PII in analytics properties
- Data retention settings should be reviewed in vendor tools
- Keep privacy policy aligned with tracking behavior

### Implementation
- Use Consent Mode with denied defaults
- Keep IP anonymization enabled
- Collect minimum viable analytics data
- Route custom events through centralized helpers

---

## Output Format

### Tracking Plan Document

```markdown
# PayeTax Analytics Tracking Plan

## Overview
- Tools: Vercel Analytics, GA4 (direct), Ahrefs
- Last updated: [Date]

## Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| calculator_completed | PAYE result computed | salary_range, tax_year, region | Successful calculation |

## Custom Dimensions

| Name | Scope | Parameter |
|------|-------|-----------|
| salary_range | Event | salary_range |
| tax_year | Event | tax_year |

## Conversions

| Conversion | Event | Counting |
|------------|-------|----------|
| PAYE completion | calculator_completed | Once per successful calculation |
```

---

## Task-Specific Questions

For PayeTax, ask only what changed:

1. Which flows are in scope (PAYE, Director Intelligence, blog/newsletter, PWA)?
2. Is this a net-new event, a rename, or a deprecation?
3. Which dashboards currently depend on the event names being changed?
4. Do docs/privacy text need updates with this change?
5. Which tests should be added or updated for regression safety?

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md). Key analytics tools:

| Tool | Best For | MCP | Guide |
|------|----------|:---:|-------|
| **GA4** | Web analytics, Google ecosystem | ✓ | [ga4.md](../../tools/integrations/ga4.md) |
| **Mixpanel** | Product analytics, event tracking | - | [mixpanel.md](../../tools/integrations/mixpanel.md) |
| **Amplitude** | Product analytics, cohort analysis | - | [amplitude.md](../../tools/integrations/amplitude.md) |
| **PostHog** | Open-source analytics, session replay | - | [posthog.md](../../tools/integrations/posthog.md) |
| **Segment** | Customer data platform, routing | - | [segment.md](../../tools/integrations/segment.md) |

---

## Related Skills

- **ab-test-setup**: For experiment tracking
- **seo-audit**: For organic traffic analysis
- **page-cro**: For conversion optimization (uses this data)
