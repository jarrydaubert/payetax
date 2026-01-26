# SME Director Tools - Strategy & Monetization

> **Version:** 1.0 | **Created:** 2026-01-26 | **Status:** Strategic Planning

---

## Vision

Transform PayeTax from a free PAYE calculator into the UK's most trusted SME financial tools platform—while keeping our core calculator free forever.

**The Opportunity:** Directors ask "salary or dividends?" thousands of times monthly. Existing tools are ugly, inaccurate, or paywalled. We have a trusted brand and proven calculation engine.

---

## Strategic Principles

| Principle | What It Means |
|-----------|---------------|
| **Free stays free** | Consumer PAYE calculator never gets paywalled |
| **Accuracy is trust** | Every calculation matches HMRC to the penny |
| **B2B funds B2C** | Business revenue subsidizes free consumer tools |
| **Build → Measure → Learn** | Ship fast, validate with real usage |

---

## Target Audiences

### Primary: SME Directors (B2C → B2B)

| Segment | Size | Pain Point | Willingness to Pay |
|---------|------|------------|-------------------|
| First-time directors | ~200k/year new Ltd companies | "I don't know what I don't know" | Low (free tier) |
| Experienced directors | ~5M active Ltd companies | "I want to optimize without calling my accountant" | Medium (£19/mo) |
| Finance Directors | ~50k SMEs with dedicated FDs | "I need scenarios for board meetings" | High (£49/mo) |

### Secondary: Accountants (B2B)

| Segment | Size | Pain Point | Willingness to Pay |
|---------|------|------------|-------------------|
| Sole practitioners | ~15k UK | "I need quick client estimates without building spreadsheets" | Medium (£49/mo) |
| Small firms (2-10) | ~8k UK | "I want branded tools for client self-service" | High (£99-199/mo) |
| Mid-size firms (10-50) | ~2k UK | "I need API access and white-label" | Very high (£199+/mo) |

---

## Product Roadmap

### Phase 1: Foundation (NOW)

**Tool #1: Director Salary vs Dividend Optimizer**

- Free: Basic calculation, results on screen
- Purpose: Prove product-market fit, build traffic, gather feedback

**Implementation:** See `DIRECTOR_TOOLS_IMPLEMENTATION.md` (1,600 lines, fully spec'd)

### Phase 2: Monetization (After validation)

Enable Pro/Firm tiers once we have:
- 500+ monthly users
- Positive feedback signal
- Clear demand for premium features

### Phase 3: Expansion (Based on demand)

| Tool | Build Trigger |
|------|---------------|
| Dividend Tax Calculator | Search traffic to optimizer |
| Director's Loan Account Checker | User requests |
| Corporation Tax Planner | Pro adoption > 100 |
| Employer NI Calculator | Firm adoption > 20 |
| VAT Scheme Comparator | Clear demand |

**Rule:** Don't build Tool #2 until Tool #1 proves PMF.

---

## Monetization Strategy

### Revenue Stream #1: SaaS Subscriptions (Direct)

Users pay us directly for premium features.

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Free** | £0 | Individual directors | Basic calculations, results on screen |
| **Pro** | £19/mo | Regular users | PDF export, save scenarios, year-on-year |
| **Firm** | £49/mo | Accountants | Unlimited scenarios, client management |

**Annual discount:** 2 months free (£190/year Pro, £490/year Firm)

**Revenue potential:**
- 100 Pro subs = £1,900/mo
- 20 Firm subs = £980/mo
- **Conservative Year 1:** £35k ARR

---

### Revenue Stream #2: Embedded Widget (B2B SaaS) ⭐ NEW

Accountants embed our calculator on their website. Their clients use it. They pay us monthly.

**The Pitch:** "Give your clients a self-service tax optimizer—branded as yours."

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | £49/mo | Embedded widget, "Powered by PayeTax" badge, 1 domain |
| **Professional** | £99/mo | Remove badge, custom accent color, 3 domains |
| **White-Label** | £199/mo | Full white-label, custom logo, unlimited domains, API |

**How it works:**
1. Accountant signs up at `/embed/pricing`
2. Gets embed code: `<script src="payetax.co.uk/embed.js" data-key="xxx"></script>`
3. Widget appears on their site with their branding
4. Results include "Speak to [Firm Name]" CTA (drives leads to them)
5. We track usage, they pay monthly

**Why accountants want this:**
- Differentiator vs competitors ("We have a tool, they don't")
- Lead generation (visitors become clients)
- Client retention (clients return to their site)
- No dev work required

**Technical requirements:**
- Embeddable iframe or web component
- License key validation
- Domain allowlist
- Usage analytics dashboard
- Stripe/Polar billing

**Revenue potential:**
- 50 Starter (£49) = £2,450/mo
- 20 Professional (£99) = £1,980/mo
- 10 White-Label (£199) = £1,990/mo
- **Conservative Year 1:** £75k ARR

---

### Revenue Stream #3: Accountant Referrals (Affiliate)

High-income users get connected to partner accountants.

**How it works:**
1. User calculates with £100k+ income
2. We show: "Complex situation? Talk to a specialist"
3. User submits email
4. Partner accountant gets lead
5. We get referral fee (£50-200 per qualified lead)

**Current status:** Built but disabled. Need accountant partner.

**Revenue potential:** £500-2k/mo with one good partner

---

### Revenue Stream #4: Affiliate Links (Passive)

Accounting software comparisons include affiliate links.

**Current status:** Infrastructure built, no active affiliates yet.

**Revenue potential:** £200-500/mo (low priority)

---

## Monetization Summary

| Stream | Year 1 Potential | Effort | Priority |
|--------|------------------|--------|----------|
| SaaS Subscriptions | £35k | Medium | P1 |
| Embedded Widget | £75k | High | P1 |
| Accountant Referrals | £15k | Low | P2 |
| Affiliate Links | £5k | Very Low | P3 |
| **Total** | **£130k ARR** | | |

**Focus:** Embedded Widget has highest revenue potential per customer.

---

## Embedded Widget - Deep Dive

### Why This Is The Big Opportunity

1. **Recurring B2B revenue** - Accountants don't churn like consumers
2. **Higher price tolerance** - £199/mo is nothing for a firm billing £200/hr
3. **Network effects** - Their clients see our tech, some become direct users
4. **Moat** - Once embedded, switching cost is high
5. **Scale** - Same widget, thousands of sites

### Target Accountant Personas

**Early Adopter:** Tech-forward sole practitioner
- Already has a website
- Active on LinkedIn/Twitter
- Looking for differentiation
- Budget: £50-100/mo

**Growth Firm:** 5-person practice scaling up
- Invests in marketing
- Wants "modern" image
- Multiple service pages
- Budget: £100-200/mo

**Established Firm:** 20+ staff, multiple offices
- Has IT budget
- Wants white-label everything
- API integration into their systems
- Budget: £200-500/mo

### Go-To-Market for Widget

**Phase 1: Soft launch**
- Build widget with basic branding options
- Reach out to 10-20 accountants personally
- Offer 3 months free for feedback
- Iterate on their needs

**Phase 2: Content marketing**
- Blog: "How accountants are using self-service tools to win clients"
- Case study with early adopter
- LinkedIn content targeting accountants

**Phase 3: Outbound**
- Scrape accountant websites without calculators
- Cold email: "I noticed [firm] doesn't have a tax calculator..."
- Offer free trial

**Phase 4: Partnerships**
- AccountingWeb sponsored content
- Accounting software integrations (Xero, QuickBooks)
- Accountant associations

### Widget Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Accountant's Website                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  <div id="payetax-widget"></div>                      │ │
│  │  <script src="payetax.co.uk/embed.js?key=xxx"/>       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PayeTax Embed Service                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ License     │  │ Widget      │  │ Analytics           │ │
│  │ Validation  │  │ Renderer    │  │ Dashboard           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Billing (Polar/Stripe)                                     │
│  - Monthly subscription                                     │
│  - Usage tracking (optional overage)                        │
│  - Customer portal                                          │
└─────────────────────────────────────────────────────────────┘
```

### Widget Features by Tier

| Feature | Starter £49 | Pro £99 | White-Label £199 |
|---------|-------------|---------|------------------|
| Embed on website | ✅ | ✅ | ✅ |
| "Powered by PayeTax" | Required | Optional | Removed |
| Custom accent color | ❌ | ✅ | ✅ |
| Custom logo | ❌ | ❌ | ✅ |
| Domains allowed | 1 | 3 | Unlimited |
| "Contact [Firm]" CTA | ✅ | ✅ | ✅ |
| Analytics dashboard | Basic | Full | Full + API |
| API access | ❌ | ❌ | ✅ |
| Priority support | ❌ | Email | Slack channel |

---

## Tech Stack for Monetization

| Component | Technology | Notes |
|-----------|------------|-------|
| Auth | Clerk | Fast to implement, handles edge cases |
| Payments | Polar | Merchant of record, handles VAT globally |
| Database | Supabase | PostgreSQL + RLS for user data |
| Widget | Web Component | Framework-agnostic embed |
| Analytics | PostHog | Product metrics, conversion tracking |

---

## Success Metrics

### Phase 1 (MVP - Free only)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Monthly active users | 500 | 8 weeks |
| Calculations completed | 1,000 | 8 weeks |
| Drop-off rate | < 20% | Ongoing |
| NPS from feedback | > 30 | 8 weeks |

### Phase 2 (Monetization)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Pro subscribers | 50 | 3 months |
| Firm subscribers | 10 | 3 months |
| MRR | £1,500 | 3 months |
| Churn rate | < 5%/mo | Ongoing |

### Phase 3 (Widget Launch)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Widget customers | 30 | 6 months |
| Widget MRR | £3,000 | 6 months |
| Avg revenue per account | £100 | Ongoing |

### Year 1 Goals

| Metric | Target |
|--------|--------|
| Total MRR | £8,000 |
| Total ARR | £100,000 |
| Paying customers | 200 |
| Free users | 10,000/mo |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Calculation errors | High (trust destroyed) | Spreadsheet oracle, accountant sign-off, unit tests |
| Legal liability | High | Disclaimers, "estimates only" language, no advice |
| Accountant adoption slow | Medium | Start with direct users, widget is Phase 3 |
| Pricing too high/low | Medium | Start low, increase with value |
| Competition copies | Low | Speed to market, brand trust, feature velocity |

---

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Which payment provider? Polar vs Lemon Squeezy | Dev | Decision needed |
| Widget iframe vs web component? | Dev | Research needed |
| Accountant partnership for referrals? | Business | Outreach needed |
| Scottish tax rates - when to add? | Product | After PMF |

---

## Next Steps

1. **Ship MVP** - Free director optimizer (spec complete)
2. **Gather feedback** - 50+ users, iterate
3. **Enable payments** - Pro/Firm tiers
4. **Build widget** - Embeddable version
5. **Outreach** - Accountant partnerships

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `DIRECTOR_TOOLS_IMPLEMENTATION.md` | Detailed implementation spec (1,600 lines) |
| `MONETIZATION.md` | Current monetization infrastructure |
| `taxRates.ts` | Single source of truth for tax rates |

---

**Document Status:** Strategic overview complete. Ready for implementation.
