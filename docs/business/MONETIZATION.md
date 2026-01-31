# Monetization Strategy

> **Last Updated:** January 2026
> **Status:** Phase 2 (Tax Pack build)

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

**Free calculator → Tax Pack (£19) → Referrals**

| Phase | Focus | Revenue |
|-------|-------|---------|
| **Phase 1 (Done)** | Free calculator, SEO, trust | £0 |
| **Phase 2 (Now)** | Director Tax Pack (£19) | £200-400/mo |
| **Phase 3 (Month 3+)** | Accountant referrals | £500-1k/mo |
| **Phase 4 (If demand)** | White-label widget | TBD |

**Year 1 Target:** £15-30k (conservative)

---

## Phase 1: Free Calculator (Done)

### What's Free Forever
- Full 4-strategy comparison (All Salary / Optimal / All Dividends / Your Setup)
- All inputs: profit, YTD, pension, BIK, student loans, losses, etc.
- All calculations: IT, NI, CT, DT, student loans
- Two Pots monthly set-aside
- Key Dates (CT payment, CT return, Self Assessment)
- 16+ contextual warnings
- Education Panel with accuracy & scope disclosure

### Why Free?
1. **SEO traffic** - "director salary dividend calculator" queries
2. **Build trust** - Users bookmark, return, share
3. **Accountants share** - Saves them explaining basics
4. **Referral pipeline** - Complex cases need accountants

---

## Phase 2: Director Tax Pack (Now)

### What It Is
A one-off £19 purchase that gives directors everything they need to implement their chosen strategy:

| Deliverable | Format |
|-------------|--------|
| **Personalised Tax Summary** | PDF (A4, print-ready) |
| **Annual Spreadsheet** | CSV (12-month payroll + dividends) |
| **Board Minutes Template** | DOCX (pre-filled with amounts) |
| **Dividend Voucher Template** | DOCX (pre-filled, ready to sign) |

### Why £19?
- Cheaper than 30 mins of accountant time
- Low enough to be impulse purchase
- High enough to filter tire-kickers
- No subscription friction

### Revenue Model
- Price: £19 one-off (no recurring)
- Target: 10-20 packs/month = £190-380/mo
- Conversion: ~1-2% of calculator users

### Technical Stack
- Stripe Checkout (one-time payment)
- Cloudflare KV (purchase validation)
- Edge functions (PDF/CSV/DOCX generation)
- Email delivery via Resend

### Full Spec
See **[DIRECTOR_TAX_PACK_SPEC.md](./DIRECTOR_TAX_PACK_SPEC.md)** for complete build spec.

---

## Phase 3: Accountant Referrals

### How It Works
1. User completes calculator
2. Sees complexity warnings (PA taper, HICBC, DLA, etc.)
3. Clicks "Talk to an Expert" CTA
4. Lead captured → sent to partner accountant
5. PayeTax receives referral fee

### Triggers for CTA
| Trigger | Why |
|---------|-----|
| Profit > £100k | Complex, needs optimization advice |
| PA taper zone | Effective 60% rate, needs planning |
| Other income present | Tax stacking, multiple sources |
| DLA warning triggered | Needs professional help |
| "My situation is complex" clicked | Self-selected |

### Revenue Model
- Referral fee: £50-200 per qualified lead
- Target: 10-20 leads/month = £500-2k/mo

### Infrastructure (Already Built)
| Component | File | Status |
|-----------|------|--------|
| Referral CTA | `AccountantReferralCTA.tsx` | Built, disabled |
| Lead API | `/api/referral/lead/route.ts` | Built |
| Email notification | Via Resend | Ready |

---

## Phase 4: Widget (If Demand)

### Only Build If
1. Accountants explicitly ask to embed
2. At least 10 requests received
3. Willing to pay (not just "that would be nice")

### If We Build It
- Embeds the calculator, not just results
- "Powered by PayeTax" badge (free tier)
- White-label option (paid tier)
- Lead capture flows to accountant

---

## What's NOT in the Plan

| Idea | Why Not |
|------|---------|
| Subscription/Pro tier | One-off Tax Pack is simpler, less friction |
| Paywall on calculator | Kills trust and SEO |
| Ads | Looks cheap, low revenue |
| Data selling | Unethical, GDPR nightmare |
| Premium-only features that should be free | Undermines education mission |

---

## Revenue Projections (Conservative)

### Month 3 (Tax Pack launched)
| Stream | Projection |
|--------|------------|
| Tax Packs | £150/mo (8 × £19) |
| Referrals | £0 (not enabled yet) |
| **Total** | **£150/mo** |

### Month 6
| Stream | Projection |
|--------|------------|
| Tax Packs | £300/mo (16 × £19) |
| Referrals | £200/mo (4 leads) |
| **Total** | **£500/mo** |

### Month 12
| Stream | Projection |
|--------|------------|
| Tax Packs | £500/mo (26 × £19) |
| Referrals | £500/mo (10 leads) |
| **Total** | **£1,000/mo** |

### Year 2 (If It Works)
| Stream | Projection |
|--------|------------|
| Tax Packs | £750/mo |
| Referrals | £1,000/mo |
| Widget (only if demand) | TBD |
| **Total** | **£1,750/mo** |

**And that's okay.** This isn't a VC-backed startup. It's a tool that helps people.

---

## Success Metrics

### Phase 1 (Calculator - Done)
| Metric | Target | Status |
|--------|--------|--------|
| Monthly visitors | 1,000 | Tracking |
| Calculator completions | 200 | Tracking |
| Time on page | > 2 min | Tracking |

### Phase 2 (Tax Pack - Now)
| Metric | Target |
|--------|--------|
| Pack CTA click rate | 5% |
| Checkout conversion | 20% |
| Monthly packs sold | 10 |
| MRR | £190 |

### Phase 3 (Referrals)
| Metric | Target |
|--------|--------|
| Referral CTA click rate | 2% |
| Leads/month | 10 |
| Revenue/month | £500 |

**The real success metric:** People saying "this finally made sense to me."

---

## The Rule

**Don't build monetization features until there's demand signal.**

Signs of demand:
- Users emailing asking for feature
- High exit rate at specific points
- Accountants asking to partner
- Competitors copying the approach

Exception: Tax Pack is validated by market research (see TAX_PACK_SPEC.md competitive analysis).

---

## Related Docs

| Document | Purpose |
|----------|---------|
| `DIRECTOR_TAX_PACK_SPEC.md` | Full Tax Pack build spec |
| `DIRECTOR_CALCULATOR_BUILD.md` | Calculator features |
| `DIRECTOR_GUIDE_POSITIONING.md` | Product positioning |
| [`READ_THIS_FIRST.md`](../READ_THIS_FIRST.md) | The mantra |

---

## Technical Implementation Reference

### Current State

| Feature | Code Status | Enabled |
|---------|-------------|---------|
| Calculator | ✅ Built | ✅ Live |
| Tax Pack | 🔨 Building | ❌ Not yet |
| Affiliate links | ✅ Built | ❌ No affiliates signed |
| Accountant referral CTA | ✅ Built | ❌ Commented out |
| Lead capture API | ✅ Built | ✅ Ready |

### File Locations

| Purpose | File |
|---------|------|
| Competitor data | `src/data/competitors.ts` |
| Analytics | `src/lib/analytics.ts` |
| Affiliate tracking | `src/components/atoms/TrackedAffiliateLink.tsx` |
| Referral CTA | `src/components/molecules/AccountantReferralCTA.tsx` |
| Referral API | `src/app/api/referral/lead/route.ts` |

### Tax Pack (To Build)

See **[DIRECTOR_TAX_PACK_SPEC.md](./DIRECTOR_TAX_PACK_SPEC.md)** for:
- Stripe Checkout integration
- KV storage schema
- PDF/CSV/DOCX generation
- Email delivery flow
- Security considerations
