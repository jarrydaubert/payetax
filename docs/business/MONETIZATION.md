# Monetization Strategy

> **Last Updated:** January 2026
> **Status:** Phase 1 (Free tool, building trust)

---

## The Model

**Free tool → Trust → Referrals → Pro tier → Widget (if demand)**

| Phase | Focus | Revenue |
|-------|-------|---------|
| **Phase 1 (Now)** | Free guide + calculator | £0 (SEO, trust) |
| **Phase 2 (Month 2-3)** | Accountant referrals | £500-2k/mo |
| **Phase 3 (Month 4-6)** | Pro tier | £1-2k/mo |
| **Phase 4 (If demand)** | Embeddable widget | £2-4k/mo |

**Year 1 Target:** £50-80k ARR (realistic)

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

## Phase 3: Pro Tier

### Features
| Free | Pro (£9-19/mo) |
|------|----------------|
| One-time calculation | Save scenarios |
| Results on screen | PDF export |
| Manual date tracking | Email reminders for deadlines |
| Basic output | Detailed breakdown |
| — | Year-on-year comparison |
| — | Payment schedule |

### Target User
Directors who:
- Return multiple times
- Want to track changes over time
- Need to share with accountant
- Value convenience

### Pricing
| Option | Price | Notes |
|--------|-------|-------|
| Monthly | £19/mo | Cancel anytime |
| Annual | £149/yr | 2 months free |

### Build Trigger
- 500+ monthly users
- Users asking to save/export
- Positive NPS feedback

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

## Revenue Projections (Conservative)

### Month 3
| Stream | Projection |
|--------|------------|
| Referrals | £500/mo |
| Pro tier | £0 (not built yet) |
| **Total** | **£500/mo** |

### Month 6
| Stream | Projection |
|--------|------------|
| Referrals | £1,500/mo |
| Pro tier | £500/mo (25 users) |
| **Total** | **£2,000/mo** |

### Month 12
| Stream | Projection |
|--------|------------|
| Referrals | £2,000/mo |
| Pro tier | £2,000/mo (100 users) |
| Widget (if built) | £1,000/mo |
| **Total** | **£4-5,000/mo** |

---

## Success Metrics

### Phase 1 (Now)
| Metric | Target |
|--------|--------|
| Monthly visitors | 5,000 |
| Guide completions | 1,000 |
| Time on page | > 3 min |
| Return visitors | 20% |

### Phase 2 (Referrals)
| Metric | Target |
|--------|--------|
| CTA click rate | 5% |
| Lead conversion | 20% |
| Leads/month | 20 |
| Revenue/month | £1,000 |

### Phase 3 (Pro)
| Metric | Target |
|--------|--------|
| Free → Pro conversion | 2% |
| Monthly Pro users | 100 |
| Churn rate | < 5%/mo |
| MRR | £2,000 |

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
| `DIRECTOR_TOOLS.md` | Product strategy (education-first) |
| `DIRECTOR_TOOLS_IMPLEMENTATION.md` | Technical spec |
| `READ_THIS_FIRST.md` | The mantra |
