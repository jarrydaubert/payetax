# Monetization Guide

**Status:** Infrastructure built, features disabled for launch

> **Note:** Monetization features are built but inactive. See "Enabling Features" section below.

---

## Overview

PayeTax monetization follows core principles:
- Consumer experience stays **100% free**
- Revenue from B2B and partnerships, not users
- Growth and revenue in parallel

---

## Revenue Streams

### 1. Affiliate Links

**Status:** Implemented

Competitor comparison pages include tracked affiliate links for accounting software providers.

**Files:**
- `src/data/competitors.ts` - Competitor data with `affiliateUrl` field
- `src/components/atoms/TrackedAffiliateLink.tsx` - Tracked link component
- `src/lib/analytics.ts` - `trackAffiliateClick()` function

**Current Affiliates:**
| Competitor | Program | Status |
|------------|---------|--------|
| — | — | No active affiliates (B2B programs require company registration) |

**To add a new affiliate:**
1. Add `affiliateUrl` and `affiliateProgram` to competitor in `competitors.ts`
2. Links automatically use affiliate URL via `TrackedAffiliateLink`
3. Clicks tracked via `trackAffiliateClick` in analytics

**Pages using affiliate links:**
- `/alternatives/[competitor]` - Alternative landing pages
- `/vs/[competitor]` - Head-to-head comparisons
- `/best-uk-tax-calculators` - Comparison hub

---

### 2. B2B Widget Pricing

**Status:** Implemented (pricing page only)

Business pricing page for embed widget at `/pricing/business`.

**Files:**
- `src/app/pricing/business/page.tsx` - Page metadata
- `src/app/pricing/business/BusinessPricingClient.tsx` - Pricing UI

**Tiers:**
| Tier | Price | Key Features |
|------|-------|--------------|
| Free | £0/forever | Full calculator, "Powered by PayeTax" badge |
| Professional | £49/month | Remove branding, custom accent color, 3 domains |
| Enterprise | £199/month | White-label, API access, unlimited domains, SLA |

**TODO:** Widget registration system and Stripe billing (see Phase 3 below).

---

### 3. Accountant Referral System

**Status:** Implemented

High-income users (£75k+) see contextual CTA for professional tax advice.

**Files:**
- `src/components/molecules/AccountantReferralCTA.tsx` - CTA component
- `src/app/api/referral/lead/route.ts` - Lead capture API
- `src/components/organisms/CalculatorContainer.tsx` - Integration point

**Triggering Conditions:**
| Condition | Headline Shown |
|-----------|----------------|
| £100k-£125,140 salary | "You're in the £100k Tax Trap" |
| £125,140+ salary | "Additional Rate Tax Planning" |
| Scottish + £75k+ | "Scottish High Earner" |
| £75k-£100k + 25%+ effective rate | "Maximize Your Take-Home Pay" |

**Lead Flow:**
1. User sees contextual CTA below calculator results
2. User clicks "Talk to an Expert"
3. Lead form collects email
4. API sends notification to `REFERRAL_PARTNER_EMAIL` (env var)
5. User receives confirmation email

**Environment Variables:**
```bash
REFERRAL_PARTNER_EMAIL=support@payetax.co.uk  # Default
```

---

## Analytics Tracking

All monetization actions are tracked:

| Event | Category | When |
|-------|----------|------|
| `affiliate_click` | monetization | User clicks affiliate link |
| `referral_cta_clicked` | monetization | User clicks "Talk to an Expert" |
| `referral_cta_dismissed` | monetization | User dismisses CTA |
| `referral_lead_submitted` | monetization | User submits email for referral |

Access via Google Analytics or check console in development.

---

## Phase 3: Future Implementation

### Widget Registration System
**Status:** Not implemented

Required:
- Database for license keys (Prisma + PostgreSQL recommended)
- License validation API
- Widget badge enforcement via postMessage
- Customer dashboard

### Stripe Billing
**Status:** Not implemented

Required:
- Stripe account and API keys
- Subscription checkout flow
- Webhook handler for subscription events
- Customer portal integration

---

## Testing

**Referral CTA:** Use calculator with salary > £100,000 to trigger CTA.

**Affiliate Links:** Check competitor pages - links should have `rel="sponsored"` and fire `affiliate_click` event.

**API Rate Limits:**
- Referral leads: 3 per hour per IP
- Email results: 5 per minute per IP

---

## Related Files

| Purpose | File |
|---------|------|
| Competitor data | `src/data/competitors.ts` |
| Analytics | `src/lib/analytics.ts` |
| Affiliate tracking | `src/components/atoms/TrackedAffiliateLink.tsx` |
| Referral CTA | `src/components/molecules/AccountantReferralCTA.tsx` |
| Referral API | `src/app/api/referral/lead/route.ts` |
| B2B pricing | `src/app/pricing/business/` |
| Widget embed | `src/app/tools/embed-widget/` |

---

## Enabling Features (Currently Disabled)

All monetization features are built but disabled for launch. To enable:

### 1. Accountant Referral CTA

**File:** `src/components/organisms/CalculatorContainer.tsx`

1. Uncomment the import at line 9
2. Uncomment the JSX block around line 230
3. Configure `REFERRAL_PARTNER_EMAIL` env var

### 2. B2B Pricing Page

**File:** `src/app/pricing/business/page.tsx`

1. Remove `notFound()` call
2. Uncomment the metadata export
3. Uncomment the component import and return statement

### 3. Affiliate Links

**File:** `src/data/competitors.ts`

Add `affiliateUrl` and `affiliateProgram` fields to competitor entries once you have valid affiliate agreements. Infrastructure is ready.
