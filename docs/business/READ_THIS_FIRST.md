# READ THIS FIRST

> Stop adding features nobody asked for. Start distribution.

---

## The Uncomfortable Truth

PayeTax has excellent infrastructure. HMRC-compliant calculations. 150+ programmatic SEO pages. Clean UI. Comprehensive test coverage.

**Stripe dashboard: £0**

This document exists to fix that.

---

## Why You're Stuck

You're not stuck because you can't build. You're stuck because you won't sell.

### The Builder Addiction

Building doesn't feel like work. It's creative. It's tangible. Add a feature—dopamine hit. Fix a bug—feel productive.

This is a trap disguised as progress.

**The uncomfortable math:**
```
Product Quality × Distribution = Revenue

If distribution = 0, revenue = 0.
Zero times anything is zero.
```

### The Lies You Tell Yourself

| What You Say | What It Means |
|--------------|---------------|
| "I just need this one feature, then I'll market" | I'm scared of rejection |
| "Once it's polished, it'll sell itself" | I don't know how to sell |
| "I'm not ready to put it out there" | Building feels safe, selling doesn't |

This is avoidance dressed as work ethic.

**Every hour spent adding feature #17 instead of distributing is functionally equivalent to scrolling TikTok.** Both feel productive. Neither moves the needle.

### The Identity Shift

You're not a coder. You're not a builder. You're not a maker.

**You're a business owner.**

Business owners do whatever the business requires. Sometimes that's building. Sometimes that's selling. Sometimes that's cold outreach that feels uncomfortable.

The business doesn't care about your identity. It only cares about its needs.

### The Real Test

If you've never actually tried distribution—if you've been hiding behind your code editor, adding features nobody asked for, telling yourself you're "almost ready"—then you don't have a product problem.

**You have a courage problem.**

The product is done. Now do the other half of the work.

---

## Painkiller vs Vitamin

Most features are vitamins. Nice to have. Users might engage, might not.

The market pays for **painkillers**.

| Vitamin (Current) | Painkiller (Build This) |
|-------------------|-------------------------|
| "Calculate your tax" | "Save £8,000 on your director compensation" |
| Free calculator for everyone | £100k tax trap escape tool |
| Generic tax code decoder | SME Director Optimizer that saves real money |

**PayeTax for individuals = vitamin** (nice, free, SEO-driven)
**PayeTax Pro for directors = painkiller** (saves thousands, worth paying for)

The free calculator stays free. But the money comes from solving expensive problems for people who will pay.

---

## Targeting Everybody = Targeting Nobody

Current: "UK taxpayers" (65 million people)

> "My app could be used by anyone" is the worst thing you can say.

**Pick one avatar. Dominate. Then expand.**

| Avatar | Pain Level | Willingness to Pay |
|--------|------------|-------------------|
| Employee checking tax | Low | £0 |
| **SME Director (£60k-£150k)** | High | £19-49/month |
| **Accountant with SME clients** | High | £49-199/month |
| High earner in £100k trap | High | £19/month |

The SME Director is the avatar. One person. One problem. One solution.

---

## You're Charging Too Little (It's £0)

> If you're charging too little, you can't afford customer acquisition.

Current monetization: **disabled**.

Accountant referral CTA: **commented out**.
B2B pricing page: **returns 404**.
Affiliate links: **no active partners**.

Meanwhile, the SME Director Optimizer could charge £19/month and save users £8,000/year. That's a 420x ROI for the customer.

**Raise prices. Enable monetization. Stop leaving money on the table.**

---

## Distribution > Product

> Building is the easy part. With AI tools, you can ship features insanely fast.
> But none of that matters if nobody knows you exist.

**The rule: 50% of time on distribution.**

Not "researching." Not "preparing." **Posting. Uploading. DMing.**

### One Channel, Full Focus

| If avatar is... | Channel is... |
|-----------------|---------------|
| SME Directors | LinkedIn |
| Accountants | LinkedIn + AccountingWeb |
| High earners | SEO content |

Don't do YouTube AND TikTok AND LinkedIn AND Twitter. Pick one. Master it.

### Content That Works

Wrong: "Check out PayeTax's new feature!"
Right: "I saved £8,229 by switching from salary to dividends. Here's the math."

**Lead with value. Show the tool in action. Don't sell—demonstrate.**

---

## The Distribution Schedule

Before coding anything new:

```
Daily (non-negotiable):
- 30 min: Create/schedule 1 LinkedIn post
- 30 min: Engage with comments, DMs, relevant posts

Weekly:
- 1 blog post targeting specific keyword
- 1 case study or calculation breakdown
- Review analytics: what's working?

Monthly:
- 1 partnership outreach (accountant, newsletter, etc.)
- 1 guest post or collaboration
```

**First 60 minutes of each day = distribution.**

---

## Enable Monetization TODAY

### Step 1: Accountant Referral CTA (1 hour)

File: `src/components/organisms/CalculatorContainer.tsx`

1. Uncomment the import
2. Uncomment the JSX block
3. Set `REFERRAL_PARTNER_EMAIL` env var
4. Deploy

High-income users (£75k+) will see contextual CTAs. Even without a partner, you're building the habit and collecting data.

### Step 2: B2B Pricing Page (30 min)

File: `src/app/pricing/business/page.tsx`

1. Remove `notFound()` call
2. Uncomment metadata and component
3. Deploy

The page exists. Make it live.

### Step 3: Pre-sell SME Director Tools

Before building the full SME Optimizer:

1. Create landing page: `/tools/director-optimizer`
2. Explain the value (save £8k+ annually)
3. Collect emails: "Get early access"
4. **If nobody signs up, you've learned something important.**

> If nobody will pay for your product before it exists, that tells you something about whether they'll pay after it exists.

---

## What NOT To Build

| Don't Build | Why |
|-------------|-----|
| More free calculator features | Doesn't generate revenue |
| Tinder for tax | Nobody asked |
| AI chat integration | Complexity without clear monetization |
| Mobile app | Web works fine, app is expensive |

**Build only what SME Directors will pay for.**

---

## Success Metrics

### 30 Days
- Monetization enabled (all 3 features live)
- 1 distribution post per day
- SME Director landing page with waitlist

### 90 Days
- 500+ waitlist signups for Director Optimizer
- First paying customer (any tier)
- £500 MRR

### 6 Months
- £1,000 MRR
- 100+ Pro subscribers
- Clear demand signal for Tool #2

---

## The Test

Read this document. Then ask yourself:

**What did I do for distribution today?**

If the answer is "nothing" or "I was building features," you've failed the test.

Most people will ignore this and keep vibe coding.

A few will listen.

Those are the ones who will actually make money.

---

## Related Docs

| Document | Purpose |
|----------|---------|
| [MONETIZATION.md](./MONETIZATION.md) | Revenue streams, implementation details |
| [SME_DIRECTOR_TOOLS.md](./SME_DIRECTOR_TOOLS.md) | Full product spec |
| [IDEAS.md](./IDEAS.md) | Feature backlog (build AFTER revenue) |

---

*Adapted from David Ondrej's "How to build AI SaaS" and "Why you're stuck at $0 MRR" threads. The originals are worth reading in full.*
