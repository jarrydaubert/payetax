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
| **Starter** | £49/mo | Embedded widget, "Powered by PayeTax" badge, 1 site |
| **Professional** | £74.99/mo | White-label, custom logo, API access, 1 site |

*Need more sites? Add another subscription.*

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
- 30 Professional (£74.99) = £2,250/mo
- **Conservative Year 1:** £55k ARR

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
| Embedded Widget | £55k | High | P1 |
| Accountant Referrals | £15k | Low | P2 |
| Affiliate Links | £5k | Very Low | P3 |
| **Total** | **£110k ARR** | | |

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

| Feature | Starter £49 | Professional £74.99 |
|---------|-------------|---------------------|
| Embed on website | ✅ | ✅ |
| "Powered by PayeTax" | Required | Removed |
| Custom accent color | ❌ | ✅ |
| Custom logo | ❌ | ✅ |
| Sites per subscription | 1 | 1 |
| "Contact [Firm]" CTA | ✅ | ✅ |
| Analytics dashboard | Basic | Full |
| API access | ❌ | ✅ |
| Priority support | ❌ | Email |

*Multi-site firms: purchase additional subscriptions.*

---

## Widget Operations - Critical Questions

### Why would an accountant need multiple domains?

**Answer: They probably don't.**

Most accountants have:
- 1 main website (e.g., `smithandco-accountants.co.uk`)
- Maybe a landing page on the same domain

Edge cases:
- Firm with multiple brands (rare for small firms)
- Separate site for a specific service

**Decision:** 1 site per subscription is correct. Keep it simple.

---

### How do we know when someone cancels?

**Payment provider webhooks.**

```
┌─────────────────┐    Webhook: subscription.cancelled    ┌─────────────────┐
│  Polar/Stripe   │ ────────────────────────────────────► │  Our API        │
└─────────────────┘                                       └─────────────────┘
                                                                  │
                                                                  ▼
                                                          ┌─────────────────┐
                                                          │  DB: Set        │
                                                          │  license.active │
                                                          │  = false        │
                                                          └─────────────────┘
```

**Events to handle:**
| Webhook Event | Action |
|---------------|--------|
| `subscription.created` | Create license key, activate |
| `subscription.updated` | Update tier/features |
| `subscription.cancelled` | Mark license inactive |
| `payment.failed` | Grace period (3 days), then deactivate |
| `payment.recovered` | Reactivate license |

---

### How do we revoke access when they stop paying?

**Real-time license validation on every widget load.**

```javascript
// Their site loads our widget
<script src="https://payetax.co.uk/embed.js" data-key="pk_live_abc123"></script>

// Our embed.js does this on load:
async function init() {
  const response = await fetch('https://api.payetax.co.uk/widget/validate', {
    method: 'POST',
    body: JSON.stringify({
      key: 'pk_live_abc123',
      domain: window.location.hostname
    })
  });
  
  if (!response.ok) {
    // License invalid - show nothing or show "License expired"
    return renderExpiredState();
  }
  
  const { tier, features } = await response.json();
  renderWidget(tier, features);
}
```

**What happens when license is invalid:**
- Widget doesn't render OR
- Shows: "This calculator's license has expired. Contact [firm name]."
- We do NOT break their site - graceful degradation

---

### How do we enforce 1 domain only?

**Domain locked to license key at signup.**

```
License Table:
┌─────────────┬─────────────────────────────┬────────┬────────┐
│ license_key │ allowed_domain              │ tier   │ active │
├─────────────┼─────────────────────────────┼────────┼────────┤
│ pk_abc123   │ smithaccountants.co.uk      │ pro    │ true   │
│ pk_def456   │ taxhelp.co.uk               │ starter│ true   │
│ pk_ghi789   │ oldclient.com               │ pro    │ false  │
└─────────────┴─────────────────────────────┴────────┴────────┘
```

**Validation logic:**
```javascript
// Server-side validation
function validateLicense(licenseKey, requestDomain) {
  const license = db.licenses.find(licenseKey);
  
  if (!license) return { valid: false, reason: 'invalid_key' };
  if (!license.active) return { valid: false, reason: 'cancelled' };
  if (license.allowed_domain !== requestDomain) {
    return { valid: false, reason: 'domain_mismatch' };
  }
  
  return { valid: true, tier: license.tier };
}
```

**What about subdomains?**
- `www.site.com` and `site.com` = same domain (normalize)
- `blog.site.com` = different subdomain = needs separate license? 
- **Decision needed:** Probably allow all subdomains of registered domain

**What about localhost/staging?**
- Allow `localhost` and `*.localhost` for development
- Allow ONE staging domain (e.g., `staging.smithaccountants.co.uk`)
- Configurable in their dashboard

---

### How do we prevent abuse?

**Multiple layers:**

| Layer | What It Prevents |
|-------|------------------|
| Domain validation | Using key on unauthorized sites |
| Rate limiting | Scraping our API |
| Referer/Origin check | Direct API calls bypassing widget |
| Usage caps (optional) | Excessive calculations (if needed) |
| Key rotation | Compromised keys |

**Abuse scenarios & responses:**

| Scenario | Detection | Response |
|----------|-----------|----------|
| Key shared on multiple sites | Domain mismatch in logs | Auto-block, email customer |
| Key posted publicly (GitHub) | Secret scanning / reports | Revoke key, issue new one |
| Competitor scraping | Unusual traffic patterns | Rate limit, CAPTCHA |
| Customer cancels but keeps script | License check fails | Widget stops working |

**Logging for abuse detection:**
```
widget_loads table:
- license_key
- domain (actual)
- ip_address
- timestamp
- user_agent
```

Weekly report: Flag any key with loads from multiple domains.

---

### What if they want to change domains?

**Self-service in dashboard.**

- Customer logs in
- Goes to "Widget Settings"
- Changes domain from `old-site.com` to `new-site.com`
- Change takes effect immediately
- Old domain stops working

**Limit:** 2 domain changes per month (prevent gaming)

---

### What data do we collect from their visitors?

**Privacy-first approach:**

| Data | Collected? | Stored? | Why |
|------|------------|---------|-----|
| Calculation inputs | Yes (client-side) | No | Needed for calculation |
| IP address | Yes (server logs) | 30 days | Abuse prevention |
| Results | Yes (client-side) | No | Display only |
| Cookies | No | No | Not needed |
| Personal info | No | No | Not needed |

**Key point:** We're a calculator, not a data harvester. Visitors' financial data stays in their browser.

**For analytics (accountant dashboard):**
- Number of calculations (count only)
- Peak usage times
- No individual calculation data

---

### Who owns the data?

**GDPR roles:**

| Party | Role | Responsibility |
|-------|------|----------------|
| Accountant firm | Data Controller | Decides why data is processed |
| PayeTax | Data Processor | Processes on their behalf |
| Visitor | Data Subject | Has rights over their data |

**But wait - do we even process personal data?**

If calculation inputs (salary, profit) are:
- Not stored
- Not transmitted to us (calculated client-side)
- Only aggregated counts sent to us

Then we may not be processing personal data at all. **Needs legal review.**

---

### What's our uptime commitment?

| Tier | SLA | Credits |
|------|-----|---------|
| Starter | Best effort (target 99%) | None |
| Professional | 99.5% uptime | 10% credit if breached |

**Status page:** `status.payetax.co.uk`

---

### What if our service goes down?

**Graceful degradation:**

```javascript
// Widget with fallback
async function init() {
  try {
    const license = await validateLicense();
    renderWidget(license);
  } catch (error) {
    // API unreachable - show static fallback
    renderFallback("Calculator temporarily unavailable. Try payetax.co.uk");
  }
}
```

We do NOT break their site. Widget either works or shows a polite message.

---

### End-to-End Widget Flow

```
SIGNUP:
Customer → Pricing page → Checkout (Polar) → Webhook → Create license → Email with embed code

USAGE:
Visitor → Accountant site → Widget loads → Validate license (API) → Render widget → Calculate (client-side)

CANCELLATION:
Customer → Cancel in Polar → Webhook → Deactivate license → Widget stops rendering

DOMAIN CHANGE:
Customer → Dashboard → Update domain → DB updated → New domain works, old domain blocked
```

---

### Open Questions (Need Decisions)

| Question | Options | Recommendation |
|----------|---------|----------------|
| Subdomains - same license? | Yes / No / Configurable | Yes (simpler) |
| Grace period after failed payment? | 0 / 3 / 7 days | 3 days |
| What shows when license expires? | Nothing / Error message / Redirect to us | Error message with firm contact |
| Usage caps? | None / 1000 calcs/mo / 10000 | None for now (monitor) |
| Can they see individual calculations? | Yes / No | No (privacy) |
| Free trial for widget? | None / 7 days / 14 days | 14 days (reduce friction) |

---

## Becoming a SaaS Provider - What We Need

We're not just adding a feature. We're starting a B2B SaaS business. That requires:

### 1. Customer-Facing Documentation

**Location:** `docs.payetax.co.uk` or `payetax.co.uk/docs/widget`

```
docs/
├── Getting Started
│   ├── Quick Start (5 min setup)
│   ├── Create Account
│   └── Install Widget
├── Setup Guides
│   ├── WordPress
│   ├── Squarespace
│   ├── Wix
│   ├── Webflow
│   ├── Custom HTML
│   └── React/Next.js
├── Customization
│   ├── Styling & Colors
│   ├── Custom Logo (Pro)
│   └── "Contact Us" CTA Setup
├── Dashboard
│   ├── Analytics Overview
│   ├── Change Domain
│   └── Billing & Invoices
├── API Reference (Pro)
│   ├── Authentication
│   ├── Endpoints
│   └── Rate Limits
├── Troubleshooting
│   ├── Widget Not Loading
│   ├── License Errors
│   ├── Domain Mismatch
│   └── Common Issues
└── Legal
    ├── Terms of Service
    ├── Privacy Policy
    ├── Data Processing Agreement
    └── SLA
```

### 2. Self-Service Setup Flow

User should go from signup to live widget in <10 minutes without talking to us.

```
STEP 1: Sign Up
┌─────────────────────────────────────────────────────────────┐
│  Create your PayeTax Widget account                         │
│                                                             │
│  Email: [________________________]                          │
│  Company: [______________________]                          │
│  Website: [https://_______________]  ← Auto-sets domain     │
│                                                             │
│  [Continue with Google]  or  [Continue with Email]          │
└─────────────────────────────────────────────────────────────┘

STEP 2: Choose Plan
┌─────────────────────────────────────────────────────────────┐
│  ○ Starter £49/mo     ○ Professional £74.99/mo              │
│    "Powered by" badge    White-label, custom logo           │
│                                                             │
│  [Start 14-day free trial]                                  │
└─────────────────────────────────────────────────────────────┘

STEP 3: Get Your Code
┌─────────────────────────────────────────────────────────────┐
│  Copy this code and paste it into your website:             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ <script src="https://payetax.co.uk/embed.js"         │ │
│  │         data-key="pk_live_abc123xyz"></script>       │ │
│  └───────────────────────────────────────────────────────┘ │
│  [Copy Code]                                                │
│                                                             │
│  Or follow our platform guide:                              │
│  [WordPress] [Squarespace] [Wix] [Other]                    │
└─────────────────────────────────────────────────────────────┘

STEP 4: Verify Installation
┌─────────────────────────────────────────────────────────────┐
│  We'll check if the widget is installed correctly...        │
│                                                             │
│  [Check Now]                                                │
│                                                             │
│  ✅ Widget detected on smithaccountants.co.uk!              │
│                                                             │
│  [Go to Dashboard]                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3. Customer Dashboard

**Location:** `payetax.co.uk/dashboard` or `app.payetax.co.uk`

```
Dashboard Features:
├── Overview
│   ├── Widget status (Active/Inactive)
│   ├── This month: 342 calculations
│   └── Quick actions
├── Widget Settings
│   ├── Embed code (copy)
│   ├── Registered domain (editable)
│   ├── Allowed staging domain
│   ├── Accent color (Pro)
│   └── Logo upload (Pro)
├── Analytics
│   ├── Calculations over time (chart)
│   ├── Peak usage hours
│   └── Export data (CSV)
├── Billing
│   ├── Current plan
│   ├── Next invoice
│   ├── Payment method
│   ├── Invoices history
│   └── Upgrade/downgrade
└── Account
    ├── Company details
    ├── Team members (future)
    └── API keys (Pro)
```

### 4. Support Infrastructure

| Channel | Starter | Professional |
|---------|---------|--------------|
| Documentation | ✅ | ✅ |
| Email support | 48hr response | 24hr response |
| Live chat | ❌ | ❌ (future) |
| Phone | ❌ | ❌ |
| Onboarding call | ❌ | Optional (15 min) |

**Support tools needed:**
- Help desk: Intercom, Crisp, or just shared inbox to start
- Status page: Betterstack or similar
- Changelog: For feature updates

### 5. Onboarding Emails

```
Day 0: Welcome + Quick Start Guide
Day 1: "Did you install the widget?" (if not detected)
Day 3: Tips for customization
Day 7: "How's it going?" feedback request
Day 12: Trial ending reminder (if on trial)
Day 14: Trial ended - convert or expire
```

### 6. Legal Documents Needed

| Document | Purpose | Priority |
|----------|---------|----------|
| Widget Terms of Service | Contract with widget customers | P0 |
| Privacy Policy (updated) | Cover widget data processing | P0 |
| Data Processing Agreement | GDPR compliance for B2B | P1 |
| SLA | Uptime commitments (Pro tier) | P1 |
| Acceptable Use Policy | Prevent abuse | P2 |

### 7. What "SaaS Provider" Means Operationally

| Responsibility | Before (Free Tool) | After (SaaS) |
|----------------|-------------------|--------------|
| Uptime | Best effort | Monitored, SLA |
| Support | None | Email, docs |
| Billing | None | Subscriptions, invoices |
| Onboarding | None | Self-service + docs |
| Legal | Simple disclaimer | ToS, DPA, SLA |
| Security | Basic | SOC2 considerations |
| Updates | When convenient | Communicated, changelog |

### 8. Build vs Buy

| Component | Build | Buy | Recommendation |
|-----------|-------|-----|----------------|
| Auth | Clerk | - | Buy (Clerk) |
| Billing | - | Polar | Buy (Polar) |
| Docs site | - | GitBook/Mintlify | Buy or Docusaurus (free) |
| Help desk | - | Crisp/Intercom | Buy (Crisp - free tier) |
| Status page | - | Betterstack | Buy ($20/mo) |
| Email sequences | - | Loops/Resend | Buy |
| Dashboard | Build | - | Build (custom) |
| Widget | Build | - | Build (core product) |

**MVP approach:** Use free tiers where possible, upgrade as we scale.

### 9. Docs Site Options

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Docusaurus** | Free, customizable, React | Self-host, maintain | Free |
| **GitBook** | Beautiful, easy | Limited free tier | Free → $8/mo |
| **Mintlify** | Modern, API docs | Expensive | $150/mo |
| **Notion** | Quick to set up | Looks amateur | Free |
| **In-app** | No extra domain | More to build | Free |

**Recommendation:** Start with Docusaurus (free, we know React) or GitBook free tier.

### 10. Domain Strategy

| Domain | Purpose |
|--------|---------|
| `payetax.co.uk` | Main site + free calculator |
| `payetax.co.uk/tools/` | Director tools (free + paid) |
| `payetax.co.uk/dashboard` | Customer dashboard |
| `payetax.co.uk/docs` | Documentation |
| `api.payetax.co.uk` | Widget validation API |
| `status.payetax.co.uk` | Status page |

Keep everything on one domain for now. Subdomains later if needed.

---

## Tech Stack (Full Picture)

### Current Stack (Keep)

| Layer | Technology | Status |
|-------|------------|--------|
| Framework | Next.js 16 | ✅ Existing |
| UI | React 19 | ✅ Existing |
| Language | TypeScript 5.9 | ✅ Existing |
| Styling | Tailwind CSS 4 | ✅ Existing |
| Components | shadcn/ui | ✅ Existing |
| State | Zustand 5 | ✅ Existing |
| Validation | Zod 4 | ✅ Existing |
| Hosting | Vercel | ✅ Existing |
| Analytics | PostHog | ✅ Existing |
| Error tracking | Sentry | ✅ Existing |

### New Stack (Add for SaaS)

| Component | Technology | Cost | Why |
|-----------|------------|------|-----|
| **Auth** | Clerk | Free → $25/mo | Fastest to implement, handles all edge cases |
| **Payments** | Polar | 5% + fees | Merchant of record = no VAT headaches |
| **Database** | Supabase | Free → $25/mo | PostgreSQL + RLS + good DX |
| **Email** | Resend | Free → $20/mo | Already in project, transactional emails |
| **Docs** | Docusaurus | Free | React-based, self-hosted on Vercel |
| **Status page** | Betterstack | Free → $20/mo | Uptime monitoring + status page |
| **Help desk** | Crisp | Free | Live chat + inbox (free tier sufficient) |

### Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAYETAX PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Main Site  │  │   Tools     │  │  Dashboard  │  │    Docs     │        │
│  │  payetax.   │  │  /tools/    │  │ /dashboard  │  │   /docs     │        │
│  │  co.uk      │  │  director-  │  │             │  │             │        │
│  │             │  │  optimizer  │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                         │
│                            ┌──────┴──────┐                                  │
│                            │   Next.js   │                                  │
│                            │   (Vercel)  │                                  │
│                            └──────┬──────┘                                  │
│                                   │                                         │
│         ┌─────────────────────────┼─────────────────────────┐              │
│         │                         │                         │              │
│         ▼                         ▼                         ▼              │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐        │
│  │    Clerk    │          │  Supabase   │          │    Polar    │        │
│  │    (Auth)   │          │    (DB)     │          │  (Payments) │        │
│  └─────────────┘          └─────────────┘          └─────────────┘        │
│                                   │                         │              │
│                                   │                         │              │
│                            ┌──────┴──────┐                  │              │
│                            │   Tables:   │                  │              │
│                            │ - licenses  │◄─────────────────┘              │
│                            │ - users     │   (webhooks)                    │
│                            │ - usage     │                                  │
│                            └─────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EMBEDDED WIDGET FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Accountant's Website                      PayeTax Infrastructure          │
│   ┌─────────────────────┐                  ┌─────────────────────┐         │
│   │                     │                  │                     │         │
│   │  <script src=       │ ─── 1. Load ──► │  Vercel Edge        │         │
│   │   "payetax.co.uk/   │                  │  (embed.js)         │         │
│   │    embed.js"        │                  │                     │         │
│   │    data-key="xxx"/> │                  └──────────┬──────────┘         │
│   │                     │                             │                     │
│   │  ┌───────────────┐  │                  ┌──────────▼──────────┐         │
│   │  │               │  │ ◄── 2. Render ── │  Widget Bundle      │         │
│   │  │   Calculator  │  │                  │  (React component)  │         │
│   │  │   Widget      │  │                  │                     │         │
│   │  │               │  │                  └──────────┬──────────┘         │
│   │  └───────────────┘  │                             │                     │
│   │                     │                  ┌──────────▼──────────┐         │
│   │                     │ ─ 3. Validate ─► │  /api/widget/       │         │
│   │                     │    license       │  validate           │         │
│   │                     │                  │                     │         │
│   │                     │ ◄─ 4. OK/Deny ── │  (checks Supabase)  │         │
│   │                     │                  └─────────────────────┘         │
│   └─────────────────────┘                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema (Supabase)

```sql
-- Users (synced from Clerk via webhook)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses (one per widget subscription)
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  license_key TEXT UNIQUE NOT NULL,  -- pk_live_xxx
  allowed_domain TEXT NOT NULL,
  staging_domain TEXT,               -- optional
  tier TEXT NOT NULL,                -- 'starter' | 'professional'
  active BOOLEAN DEFAULT true,
  polar_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (for analytics)
CREATE TABLE widget_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id),
  domain TEXT NOT NULL,              -- actual domain (for abuse detection)
  calculation_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(license_id, date)           -- one row per license per day
);

-- Indexes
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_domain ON licenses(allowed_domain);
CREATE INDEX idx_usage_license_date ON widget_usage(license_id, date);
```

### API Routes (New)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/widget/validate` | POST | Validate license key + domain |
| `/api/webhooks/polar` | POST | Handle subscription events |
| `/api/webhooks/clerk` | POST | Sync user data |
| `/api/dashboard/license` | GET/PATCH | Get/update license settings |
| `/api/dashboard/usage` | GET | Get usage analytics |

### Widget Technical Details

**Delivery options:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **iframe** | Isolated, secure | Hard to style, SEO issues | ❌ |
| **Web Component** | Framework-agnostic, encapsulated | Shadow DOM complexity | ✅ |
| **React bundle** | Easy for us | Requires React on their site | ❌ |
| **Vanilla JS** | Universal | More work | Backup option |

**Recommended: Web Component**

```javascript
// embed.js loads and registers a custom element
class PayeTaxWidget extends HTMLElement {
  connectedCallback() {
    const key = this.getAttribute('data-key');
    // Validate license, render shadow DOM
  }
}
customElements.define('payetax-widget', PayeTaxWidget);
```

Their code:
```html
<script src="https://payetax.co.uk/embed.js"></script>
<payetax-widget data-key="pk_live_xxx"></payetax-widget>
```

### Cost Projection (Monthly)

| Service | Free Tier | At 50 Customers | At 200 Customers |
|---------|-----------|-----------------|------------------|
| Vercel | Free | Free | Free (hobby) |
| Clerk | Free (<10k MAU) | Free | $25 |
| Supabase | Free (<500MB) | Free | $25 |
| Polar | 5% of revenue | ~£220 | ~£450 |
| Resend | Free (<3k/mo) | Free | $20 |
| Betterstack | Free | Free | $20 |
| **Total** | **£0** | **~£220** | **~£540** |

At 50 customers (avg £75/mo) = £3,750 MRR - £220 costs = **£3,530 profit**

---

## Self-Serve Model - How It Actually Works

**Yes, it's fully self-serve.** No sales calls, no demos, no contracts to sign.

### The Complete Customer Journey

```
DISCOVERY
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  1. LAND ON PRICING PAGE                                    │
│     - See Starter (£49) vs Professional (£74.99)            │
│     - Compare features                                       │
│     - "Start 14-day free trial" button                      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SIGN UP (Clerk)                                         │
│     - Email or Google                                        │
│     - Company name                                           │
│     - Website URL (becomes allowed_domain)                   │
│     - Accept Terms of Service ← CLICK-TO-ACCEPT             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. START TRIAL (No card required? Or card upfront?)        │
│     DECISION NEEDED:                                         │
│     Option A: No card for trial → higher trial starts        │
│     Option B: Card upfront → higher conversion, less waste   │
│     RECOMMENDATION: Card upfront (serious buyers only)       │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. GET EMBED CODE                                          │
│     - Instant license key generated                          │
│     - Copy/paste code shown                                  │
│     - Platform-specific guides linked                        │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. INSTALL & VERIFY                                        │
│     - They paste code on their site                          │
│     - We detect installation (or they click "Verify")        │
│     - Success message + dashboard access                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  6. TRIAL PERIOD (14 days)                                  │
│     - Full functionality                                     │
│     - Onboarding emails (Day 0, 1, 3, 7, 12)                │
│     - Dashboard shows "Trial: 8 days remaining"             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  7. CONVERSION                                              │
│     - Day 12: "Trial ending soon" email                     │
│     - Day 14: Card charged (if provided) OR widget stops    │
│     - Welcome to paid plan email                             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  8. ONGOING                                                 │
│     - Monthly billing (auto-renew)                          │
│     - Dashboard for settings/analytics                       │
│     - Self-serve upgrade/downgrade/cancel                   │
│     - Invoices via Polar (VAT compliant)                    │
└─────────────────────────────────────────────────────────────┘
```

### Legal: Click-to-Accept (No Signed Contracts)

**How it works:**
- Checkbox at signup: "I agree to the [Terms of Service] and [Privacy Policy]"
- Terms include SLA, liability, acceptable use
- This is legally binding (standard for SaaS)
- No wet signatures, no PDFs, no DocuSign

**What's in the Terms of Service:**

| Section | What It Covers |
|---------|----------------|
| Service Description | What we provide |
| Subscription & Billing | Pricing, renewals, refunds |
| Acceptable Use | No abuse, no illegal use |
| Intellectual Property | We own the widget, they get a license |
| Data & Privacy | What we collect, GDPR |
| SLA | Uptime commitment (Pro tier) |
| Liability | Cap at 12 months of fees paid |
| Indemnification | They indemnify us for their use |
| Termination | How either party can end |
| Changes | We can update terms with notice |

**Do we need a lawyer?**
- For MVP: Use a template (Termly, iubenda, or copy from similar SaaS)
- Before scaling: Get a lawyer to review (~£500-1000)

---

## Gotchas, Concerns & Edge Cases

### Technical Gotchas

| Issue | Risk | Mitigation |
|-------|------|------------|
| **CSP blocking our script** | Their site has Content Security Policy that blocks external scripts | Docs: "Add payetax.co.uk to your CSP" |
| **Aggressive CDN caching** | Widget doesn't update when we deploy | Use versioned URLs: embed.js?v=1.2.3 |
| **CORS issues** | API validation fails from their domain | Proper CORS headers on our API |
| **Page builder mangles code** | Wix/Squarespace/etc modify the embed | Test on all major platforms, provide alternatives |
| **Our deployment breaks widget** | We push bad code, their site breaks | Staging environment, canary deploys, instant rollback |
| **Their site is slow, they blame us** | Widget loads fine but they think it's us | Performance monitoring, clear docs on load time |
| **Widget works, API is down** | Validation fails, widget won't render | Graceful degradation, cache valid licenses briefly |

### Business Gotchas

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Chargebacks** | Customer disputes charge with bank | Polar handles disputes; clear refund policy reduces them |
| **Enterprise wants custom contract** | Big firm won't accept click-through terms | Politely decline for now, or charge premium for custom MSA |
| **Want to pay by invoice** | Accountant firms often prefer invoices over cards | Polar supports invoices for annual plans |
| **Annual billing requests** | "Can I pay yearly for a discount?" | Offer 2 months free (£490/year vs £600) |
| **Reseller/white-label for their clients** | Accountant wants to charge THEIR clients | Not supported in MVP; potential future tier |
| **Competitor copies us** | Someone builds the same thing | Move fast, build trust, iterate |
| **Price is wrong** | Too high = no sales; too low = no profit | Start at £49/£74.99, adjust based on data |

### Support Gotchas

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Widget broken on their site** | They blame us, hard to debug remotely | Ask for URL, test ourselves; provide debug mode |
| **Non-technical accountant can't install** | "I don't know how to add code" | Video tutorials, platform-specific guides |
| **Time zone support** | UK business hours only? | Clearly state: "Email support, response within 24-48 hours (UK business days)" |
| **They want phone support** | We don't offer it | Docs say "email only"; consider optional paid support later |
| **Feature requests** | "Can you add X?" | Log them, prioritize, don't promise |

### Security Concerns

| Issue | Risk | Mitigation |
|-------|------|------------|
| **XSS in our widget** | Attacker exploits our code on their site | Security review, CSP in widget, sanitize all inputs |
| **Their site hacked, our widget abused** | Our widget used as attack vector | Widget is sandboxed, doesn't access their DOM beyond container |
| **License key leaked** | Key posted on GitHub or shared | Monitor for abuse, easy key rotation in dashboard |
| **Enterprise security questionnaire** | "Fill out our 200-question security form" | Politely decline for £49/mo customers; create a security page |
| **Data breach** | Our database compromised | We store minimal data; no financial data; Supabase RLS |
| **PCI compliance** | Do we need it? | NO - Polar handles all payments, we never see card numbers |

### Legal Gotchas

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Calculator gives wrong answer** | User makes financial decision based on error | Strong disclaimer: "estimates only, consult accountant" |
| **They call it "advice"** | Marketing implies we give advice | Never use "advice"; always "estimates", "illustrations" |
| **GDPR compliance** | Are we controller or processor? | Minimal data, client-side calculation, clear privacy policy |
| **SLA breach** | We miss uptime target, they want credits | Auto-credit system, or manual review |
| **Terms change** | We update terms, they complain | 30-day notice for material changes |
| **Refund demands** | "I want my money back" | Clear refund policy: 14 days, no questions |

### Edge Cases

| Scenario | How to Handle |
|----------|---------------|
| Customer wants widget behind login (client portal) | Works fine - we validate domain, not page |
| Customer on mobile app, not web | Not supported in MVP; web only |
| Customer in regulated industry (FCA, etc.) | They're responsible for their compliance |
| Customer wants data residency (EU only) | Supabase is EU; Vercel can be EU |
| Customer wants to embed on 10 sites | Buy 10 subscriptions (or we create multi-site tier later) |
| Customer's site uses React | Our Web Component works alongside React |
| Customer cancels, wants data export | Provide CSV of their analytics |
| Customer goes out of business | License expires, widget stops |
| We go out of business | Provide source code? Open source widget? TBD |

---

## Pricing Decisions Still Needed

| Question | Options | Notes |
|----------|---------|-------|
| **Trial: card required?** | Yes / No | Recommend: Yes (filters tyre-kickers) |
| **Trial length?** | 7 / 14 / 30 days | Recommend: 14 days |
| **Refund policy?** | 14 days / 30 days / None | Recommend: 14 days, no questions |
| **Annual discount?** | None / 1 month / 2 months | Recommend: 2 months free |
| **Setup fee?** | None / £99 / £199 | Recommend: None (friction) |
| **Charity discount?** | None / 50% / Free | Nice to have, not MVP |
| **Multi-site discount?** | None / 10% / 20% | Maybe 10% for 3+ sites |

---

## Contracts & SLA Summary

### What Customers Agree To

**At signup (click-to-accept):**
1. Terms of Service
2. Privacy Policy
3. Acceptable Use Policy (can be part of ToS)

**No separate contract.** No signatures. No negotiation.

### SLA (Service Level Agreement)

| Tier | Uptime Target | Measurement | Credit |
|------|---------------|-------------|--------|
| Starter | Best effort | N/A | None |
| Professional | 99.5% monthly | Betterstack monitoring | 10% of monthly fee per 0.5% missed |

**Exclusions from SLA:**
- Scheduled maintenance (with 24hr notice)
- Their site issues
- Force majeure
- Third-party services (Clerk, Polar, etc.)

**How credits work:**
- Customer requests via email
- We verify against our monitoring
- Credit applied to next invoice (not refund)
- Max credit: 100% of one month

### Invoicing & Tax

**Polar handles everything:**
- VAT calculation (UK 20%)
- VAT invoices (compliant)
- Tax remittance
- Multiple payment methods
- Receipt emails

**What customers get:**
- Email receipt after each charge
- Downloadable invoice in dashboard
- Annual statement if requested

---

## Pre-Launch Checklist (Non-Code)

### Legal (P0 - Must have before launch)

- [ ] Terms of Service (draft from template)
- [ ] Privacy Policy (update existing)
- [ ] Cookie policy (if needed)
- [ ] Disclaimer on calculator (already have)

### Legal (P1 - Before scaling)

- [ ] Lawyer review of ToS (~£500-1000)
- [ ] Data Processing Agreement template
- [ ] SLA document

### Operations (P0)

- [ ] Support email setup (support@payetax.co.uk)
- [ ] Shared inbox or help desk
- [ ] Canned responses for common questions
- [ ] Escalation process (just you for now)

### Content (P0)

- [ ] Pricing page copy
- [ ] Signup flow copy
- [ ] Onboarding email sequence (5 emails)
- [ ] Quick start guide
- [ ] FAQ page

### Content (P1)

- [ ] Platform install guides (WordPress, Wix, Squarespace, etc.)
- [ ] Troubleshooting guide
- [ ] Video walkthrough (optional)

### Monitoring (P0)

- [ ] Uptime monitoring (Betterstack free tier)
- [ ] Error alerting (Sentry - already have)
- [ ] Revenue dashboard (Polar provides)

---

## What Could Kill This

Being honest about risks:

| Risk | Likelihood | Impact | Notes |
|------|------------|--------|-------|
| No one wants it | Low | Fatal | Clear market signal exists |
| Price is wrong | Medium | High | Can adjust; start low |
| Too hard to install | Medium | High | Good docs + video mitigate |
| Competitor with more features | Medium | Medium | Speed + trust matter more |
| Technical issues at scale | Low | High | Start simple, scale infrastructure later |
| Legal issues (advice liability) | Low | High | Strong disclaimers mitigate |
| Support overwhelm | Medium | Medium | Good docs reduce tickets |
| Churn too high | Medium | High | Focus on activation + value |

---

## Final Questions Before Dev

| Question | Answer Needed From |
|----------|-------------------|
| Trial: require card upfront? | Product decision |
| Refund policy: 14 or 30 days? | Product decision |
| SLA: offer credits or just target? | Product decision |
| Who writes ToS? Template or lawyer? | Business decision |
| Who handles support initially? | Operations decision |
| Launch to public or beta first? | GTM decision |
| Pricing: confident in £49/£74.99? | Business decision |

---

## Marketing Channels & Content

### Social Media Presence

| Platform | Audience | Priority | Content Type |
|----------|----------|----------|--------------|
| **LinkedIn** | Accountants, FDs, professionals | P1 | Thought leadership, product updates |
| **Facebook** | SME owners, sole traders, tradespeople | P1 | Tips, tools, community |
| **Twitter/X** | Tech-savvy founders, accountants | P2 | Quick tips, engagement |
| **TikTok** | Younger entrepreneurs | P3 | Educational shorts |
| **YouTube** | Everyone | P2 | Tutorials, explainers |

**Facebook is essential for UK SMEs.** Many small business owners (especially trades, retail, services) live on Facebook, not LinkedIn. Create a Facebook Business Page.

### Facebook Strategy

**Page setup:**
- Name: PayeTax UK
- Category: Financial Service / Business Service
- Cover: "Free UK Tax Calculators"

**Content mix:**
- Tax tips (carousel posts)
- "Did you know?" facts
- Tool announcements
- User questions / engagement
- Seasonal (tax year end, self-assessment deadline)

**Groups to join/engage:**
- UK Small Business Owners
- Self Employed UK
- Limited Company Directors UK
- Contractor/Freelancer groups

### Remotion for Video Content

**We have Remotion installed - USE IT!**

Remotion lets us programmatically generate videos. Perfect for:

| Content Type | Use Case | Frequency |
|--------------|----------|-----------|
| **Product demos** | "How to use the calculator" | Once, update as needed |
| **Tax tip reels** | "3 things directors get wrong" | Weekly |
| **Rate change alerts** | "April 2026: What's changing" | Seasonal |
| **Comparison videos** | "Salary vs Dividends explained" | Evergreen |
| **Testimonials** | Animated quotes | As we get them |
| **Ad creatives** | Multiple variants for A/B testing | Campaign-based |

**Remotion advantages:**
- Consistent branding across all videos
- Generate variants at scale (different numbers, scenarios)
- Update videos when tax rates change (just change data)
- No video editing skills needed
- Version control (it's just code)

**Video specs:**
| Platform | Aspect Ratio | Duration |
|----------|--------------|----------|
| Instagram/TikTok Reels | 9:16 | 15-60s |
| Facebook Feed | 1:1 or 4:5 | 15-60s |
| YouTube Shorts | 9:16 | <60s |
| LinkedIn | 1:1 or 16:9 | 30-90s |
| YouTube (long) | 16:9 | 2-10 min |

**First videos to create:**
1. "What is Salary vs Dividends?" (explainer, 60s)
2. "Director Tax Calculator Demo" (product, 45s)
3. "5 Tax Mistakes New Directors Make" (tips, 60s)
4. "Why £12,570 Salary?" (educational, 30s)

---

## Sole Traders - Do We Support Them?

### Short Answer: NOT with this tool.

The Director Salary vs Dividend tool is specifically for **limited company directors**. Sole traders have completely different tax mechanics:

| | Limited Company Director | Sole Trader |
|---|---|---|
| Pay yourself salary? | ✅ Yes | ❌ No (it's all profit) |
| Take dividends? | ✅ Yes | ❌ No (no company) |
| Corporation Tax? | ✅ Yes (on company profits) | ❌ No |
| Income Tax? | On salary + dividends | On ALL profits |
| National Insurance? | Employee + Employer NI | Class 2 + Class 4 NI |
| Extraction planning? | Complex (salary/dividend mix) | Simple (profit = income) |

**Sole traders don't have the same "optimisation" question.** Their profit IS their income. There's no salary vs dividend decision.

### BUT: Sole Traders Are a Huge Market

| Segment | UK Numbers |
|---------|------------|
| Sole traders | ~3.5 million |
| Limited companies | ~5 million |
| Of which single-director | ~2 million |

### What Sole Traders WOULD Want

| Tool | What It Does |
|------|--------------|
| **Self-Employed Tax Calculator** | "What's my tax on £X profit?" |
| **Should I Incorporate?** | "Am I better off as Ltd?" |
| **Class 2/4 NI Calculator** | "What's my NI bill?" |
| **Tax Payment Estimator** | "How much to save for Jan/July?" |
| **Allowable Expenses Checker** | "Can I claim this?" |

### Recommendation

**Phase 1 (Now):** Director tools only. Clear messaging: "For limited company directors."

**Phase 2 (If demand):** Add "Should I Incorporate?" tool - this bridges sole traders to directors and could convert them to Ltd (and then to our tools).

**Phase 3 (Later):** Full self-employed calculator suite.

### Messaging Clarity

On the tool page, be explicit:

```
WHO THIS IS FOR:
✅ Directors of UK limited companies
✅ Contractors operating through a Ltd
✅ Small business owners with a Ltd

NOT FOR:
❌ Sole traders (see our self-employed calculator - coming soon)
❌ Partnerships (LLP)
❌ Employees (use our PAYE calculator)
```

---

## TL;DR - What We're Building

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAYETAX WIDGET BUSINESS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRODUCT:    Embeddable tax calculator for accountant websites  │
│  PRICING:    £49/mo (badge) or £74.99/mo (white-label)          │
│  MODEL:      Self-serve SaaS, click-to-accept terms             │
│  TRIAL:      14 days (card required TBD)                        │
│  SUPPORT:    Email only, 24-48hr response                       │
│  SLA:        99.5% for Pro tier                                 │
│  BILLING:    Polar (handles VAT, invoices, compliance)          │
│                                                                 │
│  YEAR 1 TARGET:                                                 │
│  - 80 widget customers (avg £62/mo)                             │
│  - £5,000 MRR = £60,000 ARR                                     │
│  - Plus direct SaaS subscriptions                               │
│  - Total target: £110,000 ARR                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

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
| Total MRR | £9,000 |
| Total ARR | £110,000 |
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
