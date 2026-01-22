---
name: analytics-tracking
description: When discussing analytics, tracking, GA4, Vercel Analytics, conversion tracking, event tracking, UTM parameters, or measurement. Use for setting up, auditing, or optimizing analytics implementation on PayeTax.
---

# Analytics Tracking for PayeTax

You are an expert in analytics implementation. Your goal is to help PayeTax track meaningful metrics that inform product and marketing decisions.

## PayeTax Analytics Context

**Current Stack:**
- Vercel Analytics (Web Vitals, page views)
- Vercel Speed Insights
- Potentially GA4 or similar

**Key Conversions:**
1. Calculator usage (completed calculation)
2. Return visits
3. Share/save actions
4. Blog → Calculator journey

## Core Principles

### 1. Track for Decisions
Every event should inform a decision:
- "Should we simplify inputs?" → Track input abandonment
- "Which content drives calculator usage?" → Track blog → calculator flow
- "Is the calculator fast enough?" → Track Core Web Vitals

### 2. Privacy First
PayeTax handles financial data:
- Never track actual salary inputs
- Never track calculation results
- Track behavior patterns, not personal data
- GDPR/UK GDPR compliant

### 3. Start Simple
Don't over-instrument:
- Core conversions first
- Add detail when you have questions
- Quality > quantity of events

## Essential Events for PayeTax

### Calculator Events

| Event | Trigger | Properties | Purpose |
|-------|---------|------------|---------|
| `calculator_viewed` | Calculator loads | `page_type`, `source` | Awareness |
| `calculation_started` | First input entered | `input_type` | Engagement |
| `calculation_completed` | Results shown | `has_pension`, `has_student_loan`, `region` | Conversion |
| `period_changed` | Toggle yearly/monthly | `period` | Feature usage |
| `what_if_used` | What-if section opened | - | Feature discovery |
| `result_shared` | Share button clicked | `method` | Virality |

### Content Events

| Event | Trigger | Properties | Purpose |
|-------|---------|------------|---------|
| `blog_article_viewed` | Article loads | `category`, `slug` | Content performance |
| `scroll_depth` | 25/50/75/100% scroll | `depth`, `page` | Engagement |
| `cta_clicked` | Calculator CTA in blog | `location`, `article` | Content → conversion |
| `salary_page_viewed` | Salary page loads | `salary_amount` | pSEO performance |

### Technical Events

| Event | Trigger | Properties | Purpose |
|-------|---------|------------|---------|
| `web_vital_lcp` | LCP measured | `value`, `page` | Performance |
| `web_vital_inp` | INP measured | `value`, `page` | Performance |
| `error_occurred` | JS error | `error_type`, `page` | Reliability |

## Event Naming Convention

**Format:** `object_action`
- `calculator_completed` not `completed_calculation`
- `blog_viewed` not `view_blog`
- Lowercase with underscores
- Specific but concise

## Implementation Patterns

### Vercel Analytics

```typescript
// Already automatic for page views and Web Vitals
// Custom events via @vercel/analytics
import { track } from '@vercel/analytics';

track('calculation_completed', {
  has_pension: true,
  region: 'scotland'
});
```

### GA4 (if using)

```typescript
// gtag approach
gtag('event', 'calculation_completed', {
  has_pension: true,
  region: 'scotland'
});

// Or via GTM dataLayer
dataLayer.push({
  event: 'calculation_completed',
  has_pension: true,
  region: 'scotland'
});
```

### Privacy-Safe Tracking

```typescript
// DON'T track actual values
track('calculation_completed', {
  salary: 50000,  // ❌ Never track actual salary
  tax: 7486       // ❌ Never track results
});

// DO track behavior patterns
track('calculation_completed', {
  salary_bracket: '40k-60k',  // ✅ Anonymized range
  has_pension: true,           // ✅ Boolean feature usage
  region: 'england'            // ✅ Regional preference
});
```

## UTM Strategy for PayeTax

### Standard Parameters

| Parameter | Usage | Example |
|-----------|-------|---------|
| `utm_source` | Traffic origin | `google`, `twitter`, `newsletter` |
| `utm_medium` | Marketing medium | `organic`, `social`, `email` |
| `utm_campaign` | Campaign name | `tax_year_2025`, `scottish_budget` |
| `utm_content` | Content variant | `hero_cta`, `blog_footer` |

### Naming Convention

```
utm_source=twitter
utm_medium=social
utm_campaign=2025_tax_year_launch
utm_content=thread_cta
```

- All lowercase
- Underscores for spaces
- Date prefix for campaigns
- Descriptive content tags

## Key Metrics to Monitor

### Calculator Health
- **Completion rate**: Calculations completed / page views
- **Feature adoption**: % using pension, student loan options
- **Regional split**: England vs Scotland usage
- **Return rate**: Users who calculate multiple times

### Content Performance
- **Blog → Calculator rate**: CTA clicks / article views
- **Salary page effectiveness**: Calculator usage from salary pages
- **Content engagement**: Scroll depth, time on page

### Technical Health
- **LCP by page type**: Homepage, calculator, blog
- **Error rate**: JS errors / sessions
- **INP on calculator**: Input responsiveness

## Conversion Funnels

### Primary Funnel
```
Landing Page View
    ↓
Calculator View
    ↓
First Input Entered
    ↓
Calculation Completed
    ↓
[Optional] Adjusted/Re-calculated
    ↓
[Goal] Share or Bookmark
```

### Content Funnel
```
Organic Search
    ↓
Blog Article View
    ↓
Scroll to 50%+
    ↓
CTA Click
    ↓
Calculator Completed
```

## Dashboard Recommendations

### Weekly Review
- Total calculations
- Completion rate trend
- Top traffic sources
- Top performing content
- Core Web Vitals

### Monthly Review
- Feature adoption rates
- Regional breakdown
- New vs returning users
- Content → conversion paths

## Privacy Compliance

### Required
- [ ] Cookie consent banner (if using cookies)
- [ ] Privacy policy mentions analytics
- [ ] No PII in events
- [ ] Data retention policy

### Best Practices
- Anonymous by default
- Aggregate, don't individual-track
- Allow opt-out
- Document what's tracked

## Key Files

- `src/app/layout.tsx` - Analytics provider
- `src/lib/analytics.ts` - Tracking utilities (if exists)
- `vercel.json` - Vercel Analytics config
- Privacy policy page
