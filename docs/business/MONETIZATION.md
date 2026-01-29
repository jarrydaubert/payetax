# Monetization Strategy

> **Last Updated:** January 2026
> **Status:** Phase 1 (Free tool, building trust)

---

## The Principle

**We don't capitalize on stress and confusion.**

Our users are often:
- First-time directors who are anxious about tax
- People on tight budgets (why else DIY instead of accountant?)
- Stressed about getting it wrong

**The core guide and calculator are FREE. Forever. No exceptions.**

We only charge for convenience features that save time, not for reducing anxiety.

---

## The Model

**Free tool → Trust → Referrals → Optional Pro (if they WANT it)**

| Phase | Focus | Revenue |
|-------|-------|---------|
| **Phase 1 (Now)** | Free guide + calculator | £0 (SEO, trust) |
| **Phase 2 (Month 2-3)** | Accountant referrals | £500-1k/mo |
| **Phase 3 (If demand)** | Optional Pro tier | £500-1k/mo |
| **Phase 4 (If demand)** | Embeddable widget | TBD |

**Year 1 Target:** £20-40k ARR (very conservative, and that's fine)

---

## Phase 1: Free (Current)

### What's Free Forever
- Director's Guide to Paying Yourself
- Calculator with "simple & safe" recommendation
- Educational content, FAQs, tooltips
- Key dates and deadlines

### Why Free?
1. **SEO traffic** - "how to pay yourself as director" queries
2. **Build trust** - Users bookmark, return, share
3. **Accountants share** - Saves them explaining basics
4. **Referral pipeline** - Complex cases need accountants

---

## Phase 2: Accountant Referrals

### How It Works
1. User completes guide
2. Sees "This is confusing—connect me with an accountant" CTA
3. Lead captured → sent to partner accountant
4. PayeTax receives referral fee

### Triggers for CTA
| Trigger | Why |
|---------|-----|
| Profit > £100k | Complex, needs optimization advice |
| Other income present | Tax stacking, multiple sources |
| DLA warning triggered | Needs professional help |
| VAT threshold approaching | Registration decision |
| "My situation is complex" clicked | Self-selected |

### Revenue Model
- Referral fee: £50-200 per qualified lead
- Or: Revenue share on first-year fees
- Target: 10-20 leads/month = £500-2k/mo

### Infrastructure (Already Built)
| Component | File | Status |
|-----------|------|--------|
| Referral CTA | `AccountantReferralCTA.tsx` | Built, disabled |
| Lead API | `/api/referral/lead/route.ts` | Built |
| Email notification | Via Resend | Ready |

### To Enable
1. Find accountant partner willing to pay for leads
2. Uncomment CTA in `CalculatorContainer.tsx`
3. Set `REFERRAL_PARTNER_EMAIL` env var
4. Deploy

---

## Phase 3: Pro Tier (Optional, If Demand)

### Philosophy

**Pro is for convenience, not access.**

Everything that reduces anxiety stays free:
- The guide
- The calculator
- The "safe monthly draw" output
- The set-aside pots
- The FAQ and education

Pro is ONLY for people who want to save time:
- Save scenarios for later
- PDF to share with accountant
- Email reminders for deadlines

### Features
| Free (Forever) | Pro (Optional) |
|----------------|----------------|
| Full guide | Same |
| Full calculator | Same |
| Results on screen | + Save scenarios |
| Copy results | + PDF export |
| Key dates shown | + Email reminders |

### Pricing (Compassionate)

| Option | Price | Notes |
|--------|-------|-------|
| Monthly | £5/mo | Coffee price |
| Annual | £39/yr | 3 months free |

**Why so cheap?**
- Our users are often on tight budgets
- £5/mo is accessible to almost everyone
- 100 users at £5 = £500/mo (that's fine)
- Trust matters more than revenue per user

### Build Trigger
- Users explicitly asking for save/export
- At least 50 requests
- NOT before Phase 1 is working well

---

## Phase 4: Widget (If Demand)

### Only Build If
1. Accountants explicitly ask to embed
2. At least 10 requests received
3. Willing to pay (not just "that would be nice")

### What Changed from Original Strategy
| Original | New |
|----------|-----|
| Widget is primary product | Widget is optional add-on |
| Build first, validate later | Validate first, build if demand |
| £49-75/mo pricing | £19-49/mo (if at all) |
| Complex license system | Simple embed code |

### If We Build It
- Embeds the GUIDE, not just calculator
- "Powered by PayeTax" badge (free tier)
- White-label option (paid tier)
- Lead capture flows to accountant

---

## What's NOT in the Plan

| Idea | Why Not |
|------|---------|
| Paywall on calculator | Kills trust and SEO |
| Ads | Looks cheap, low revenue |
| Data selling | Unethical, GDPR nightmare |
| Premium-only features that should be free | Undermines education mission |

---

## Revenue Projections (Very Conservative)

### Month 6
| Stream | Projection |
|--------|------------|
| Referrals | £200/mo |
| Pro tier | £0 (not built yet) |
| **Total** | **£200/mo** |

### Month 12
| Stream | Projection |
|--------|------------|
| Referrals | £500/mo |
| Pro tier | £250/mo (50 users × £5) |
| **Total** | **£750/mo** |

### Year 2 (If It Works)
| Stream | Projection |
|--------|------------|
| Referrals | £1,000/mo |
| Pro tier | £500/mo (100 users) |
| Widget (only if demand) | TBD |
| **Total** | **£1,500/mo** |

**And that's okay.** This isn't a VC-backed startup. It's a tool that helps people.

---

## Success Metrics

### Phase 1 (Now)
| Metric | Target |
|--------|--------|
| Monthly visitors | 1,000 |
| Guide completions | 200 |
| Time on page | > 2 min |
| "This helped" feedback | Positive |

### Phase 2 (Referrals)
| Metric | Target |
|--------|--------|
| CTA click rate | 2% |
| Leads/month | 5 |
| Revenue/month | £200 |

### Phase 3 (Pro - Only If Requested)
| Metric | Target |
|--------|--------|
| Save/export requests | 50+ |
| Pro users | 50 |
| MRR | £250 |

**The real success metric:** People saying "this finally made sense to me."

---

## The Rule

**Don't build monetization features until there's demand signal.**

Signs of demand:
- Users emailing asking for feature
- High exit rate at specific points
- Accountants asking to partner
- Competitors copying the approach

No demand signal = don't build it yet.

---

## Related Docs

| Document | Purpose |
|----------|---------|
| `DIRECTOR_GUIDE_POSITIONING.md` | Product positioning (audiences) |
| `DIRECTOR_CALCULATOR_BUILD.md` | Build spec and features |
| `DIRECTOR_TAX_MATH.md` | Tax calculation reference |
| `READ_THIS_FIRST.md` | The mantra |

---

## Technical Implementation Reference

> Developer guide for enabling monetization features.

### Current State

All monetization features are **built but disabled** for launch:

| Feature | Code Status | Enabled |
|---------|-------------|---------|
| Affiliate links | ✅ Built | ❌ No affiliates signed |
| Accountant referral CTA | ✅ Built | ❌ Commented out |
| B2B widget pricing page | ✅ Built | ❌ Returns 404 |
| Lead capture API | ✅ Built | ✅ Ready |

### File Locations

| Purpose | File |
|---------|------|
| Competitor data | `src/data/competitors.ts` |
| Analytics | `src/lib/analytics.ts` |
| Affiliate tracking | `src/components/atoms/TrackedAffiliateLink.tsx` |
| Referral CTA | `src/components/molecules/AccountantReferralCTA.tsx` |
| Referral API | `src/app/api/referral/lead/route.ts` |
| B2B pricing | `src/app/pricing/business/` |
| Widget embed | `src/app/tools/embed-widget/` |

### Affiliate Links

**To add a new affiliate:**
1. Add `affiliateUrl` and `affiliateProgram` to competitor in `competitors.ts`
2. Links automatically use affiliate URL via `TrackedAffiliateLink`
3. Clicks tracked via `trackAffiliateClick` in analytics

**Pages using affiliate links:**
- `/alternatives/[competitor]`
- `/vs/[competitor]`
- `/best-uk-tax-calculators`

### Referral CTA Triggers

| Condition | Headline Shown |
|-----------|----------------|
| £100k-£125,140 salary | "You're in the £100k Tax Trap" |
| £125,140+ salary | "Additional Rate Tax Planning" |
| Scottish + £75k+ | "Scottish High Earner" |
| £75k-£100k + 25%+ effective rate | "Maximize Your Take-Home Pay" |

### Analytics Events

| Event | When |
|-------|------|
| `affiliate_click` | User clicks affiliate link |
| `referral_cta_clicked` | User clicks "Talk to an Expert" |
| `referral_cta_dismissed` | User dismisses CTA |
| `referral_lead_submitted` | User submits email |

### Enabling Features

**1. Accountant Referral CTA**
- File: `src/components/organisms/CalculatorContainer.tsx`
- Uncomment the import and JSX block
- Set `REFERRAL_PARTNER_EMAIL` env var

**2. B2B Pricing Page**
- File: `src/app/pricing/business/page.tsx`
- Remove `notFound()` call
- Uncomment metadata and component

**3. Affiliate Links**
- File: `src/data/competitors.ts`
- Add `affiliateUrl` field to competitor entries
