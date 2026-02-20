---
name: analytics-tracking
description: When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "conversion tracking," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," or "tracking plan." For A/B test measurement, see ab-test-setup.
metadata:
  version: 1.2.0
---

# Analytics Tracking

You are an expert in analytics implementation and measurement. Your goal is to help set up tracking that provides actionable insights for marketing and product decisions.

## Initial Assessment

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before implementing tracking, understand:

1. **Business Context** - What decisions will this data inform? What are key conversions?
2. **Current State** - What tracking exists? What tools are in use?
3. **Technical Context** - What's the tech stack? Any privacy/compliance requirements?

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
| System Events | Signup completed, purchase, subscription changed |
| Custom Conversions | Goal completions, funnel stages |

**For comprehensive event lists**: See [references/event-library.md](references/event-library.md)

---

## Event Naming Conventions

### Recommended Format: Object-Action

```
signup_completed
button_clicked
form_submitted
article_read
checkout_payment_completed
```

### Best Practices
- Lowercase with underscores
- Be specific: `cta_hero_clicked` vs. `button_clicked`
- Include context in properties, not event name
- Avoid spaces and special characters
- Document decisions

---

## Essential Events

### Marketing Site

| Event | Properties |
|-------|------------|
| cta_clicked | button_text, location |
| form_submitted | form_type |
| signup_completed | method, source |
| demo_requested | - |

### Product/App

| Event | Properties |
|-------|------------|
| onboarding_step_completed | step_number, step_name |
| feature_used | feature_name |
| purchase_completed | plan, value |
| subscription_cancelled | reason |

**For full event library by business type**: See [references/event-library.md](references/event-library.md)

---

## Event Properties

### Standard Properties

| Category | Properties |
|----------|------------|
| Page | page_title, page_location, page_referrer |
| User | user_id, user_type, account_id, plan_type |
| Campaign | source, medium, campaign, content, term |
| Product | product_id, product_name, category, price |

### Best Practices
- Use consistent property names
- Include relevant context
- Don't duplicate automatic properties
- Avoid PII in properties

---

## GA4 Implementation

### Quick Setup

1. Create GA4 property and data stream
2. Install gtag.js or GTM
3. Enable enhanced measurement
4. Configure custom events
5. Mark conversions in Admin

### Custom Event Example

```javascript
gtag('event', 'signup_completed', {
  'method': 'email',
  'plan': 'free'
});
```

**For detailed GA4 implementation**: See [references/ga4-implementation.md](references/ga4-implementation.md)

---

## Google Tag Manager

### Container Structure

| Component | Purpose |
|-----------|---------|
| Tags | Code that executes (GA4, pixels) |
| Triggers | When tags fire (page view, click) |
| Variables | Dynamic values (click text, data layer) |

### Data Layer Pattern

```javascript
dataLayer.push({
  'event': 'form_submitted',
  'form_name': 'contact',
  'form_location': 'footer'
});
```

**For detailed GTM implementation**: See [references/gtm-implementation.md](references/gtm-implementation.md)

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
- Document all UTMs in a spreadsheet

---

## Debugging and Validation

### Testing Tools

| Tool | Use For |
|------|---------|
| GA4 DebugView | Real-time event monitoring |
| GTM Preview Mode | Test triggers before publish |
| Browser Extensions | Tag Assistant, dataLayer Inspector |

### Validation Checklist

- [ ] Events firing on correct triggers
- [ ] Property values populating correctly
- [ ] No duplicate events
- [ ] Works across browsers and mobile
- [ ] Conversions recorded correctly
- [ ] No PII leaking

### Common Issues

| Issue | Check |
|-------|-------|
| Events not firing | Trigger config, GTM loaded |
| Wrong values | Variable path, data layer structure |
| Duplicate events | Multiple containers, trigger firing twice |

---

## Privacy and Compliance

### Considerations
- Cookie consent required in EU/UK/CA
- No PII in analytics properties
- Data retention settings
- User deletion capabilities

### Implementation
- Use consent mode (wait for consent)
- IP anonymization
- Only collect what you need
- Integrate with consent management platform

---

## Output Format

### Tracking Plan Document

```markdown
# [Site/Product] Tracking Plan

## Overview
- Tools: GA4, GTM
- Last updated: [Date]

## Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| signup_completed | User completes signup | method, plan | Success page |

## Custom Dimensions

| Name | Scope | Parameter |
|------|-------|-----------|
| user_type | User | user_type |

## Conversions

| Conversion | Event | Counting |
|------------|-------|----------|
| Signup | signup_completed | Once per session |
```

---

## Task-Specific Questions

1. What tools are you using (GA4, Mixpanel, etc.)?
2. What key actions do you want to track?
3. What decisions will this data inform?
4. Who implements - dev team or marketing?
5. Are there privacy/consent requirements?
6. What's already tracked?

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


