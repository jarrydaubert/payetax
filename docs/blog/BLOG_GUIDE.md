# PayeTax Blog Guide
**The Complete Content Strategy & Writing Guide**


---

## Table of Contents

1. [Content Strategy Overview](#content-strategy-overview)
2. [Quick Start Checklist](#quick-start-checklist)
3. [Writing Style Guide](#writing-style-guide)
4. [The Hook-Proof-Benefit Pattern](#the-hook-proof-benefit-pattern)
5. [Post Opening Formula](#post-opening-formula)
6. [Content Calendar & Publishing](#content-calendar--publishing)
7. [SEO & YMYL Compliance](#seo--ymyl-compliance)
8. [Content Types & Templates](#content-types--templates)
9. [Distribution Strategy](#distribution-strategy)

---

## Content Strategy Overview

### Mission Statement
Our blog transforms complex UK tax regulations into clear, actionable insights. We build authority through quality, not quantity, positioning PayeTax as the go-to resource for PAYE tax understanding.

### Strategic Approach: **Authority Builder**
- **Frequency:** 1-2 posts per week (Monday + Thursday)
- **Length:** 1,500-3,000 words (10-20 minute reads)
- **Focus:** Comprehensive guides, timely updates, YMYL authority

### Topic Mix (Target Distribution)
- **50% Pillar Content** - Ultimate guides, complete breakdowns, evergreen value
- **30% Timely Updates** - Budget responses, tax year changes, HMRC announcements
- **20% Deep Dives** - Tax code mysteries, edge cases, advanced scenarios

### Success Metrics
- **Primary:** Rank for high-value "money keywords" in 9-12 months
- **Secondary:** Time on page >3 minutes, organic traffic growth >25% MoM
- **Tertiary:** Newsletter signups, calculator usage from blog traffic

---

## Quick Start Checklist

**Read this BEFORE drafting.** Every post must tick these boxes:

### Content Quality
- [ ] Keyword research & competitor gap analysis complete
- [ ] Outline uses appropriate content template
- [ ] Written in "Transparent Educator" voice
- [ ] Real examples & calculations included
- [ ] All figures fact-checked against HMRC

### The "So What" Test
- [ ] Every claim answers "so what does this mean for me?"
- [ ] Features followed by benefits ("which means...")
- [ ] Numbers tied to real impact (monthly savings, lifestyle implications)
- [ ] Hook-Proof-Benefit pattern used throughout

### CTAs & Internal Links
- [ ] Calculator CTA in intro, middle, AND conclusion (minimum 3)
- [ ] CTAs use specific routes: `[Calculate your £50k salary](/calculator/50000-after-tax)`
- [ ] 2-3 links to related blog posts (contextual, not forced)
- [ ] Link to one pillar guide (if this isn't already a pillar)

### Technical & SEO
- [ ] Title & meta optimized (150-160 chars)
- [ ] Featured image added (optimized WebP, 1200x630px)
- [ ] Disclaimer & date stamp included
- [ ] Mobile preview checked (50%+ of traffic)

### Launch
- [ ] Publish & distribute (X, LinkedIn within 1h)
- [ ] Notify subscribers: `bun run notify-subscribers --post="slug"`
- [ ] Monitor performance (Search Console, Analytics)
- [ ] Schedule quarterly review & update

---

## Writing Style Guide

### Core Voice: **Transparent Educator**
**Tone:** Clear, honest, conversational but expert
**Perspective:** Second-person ("you"), active voice
**Philosophy:** No jargon without explanation, complex made simple

### Writing Principles

#### 1. **Lead with the Answer**
Bad: "To understand your tax liability, we must first examine the historical context of PAYE..."
Good: "Here's what you'll pay in tax on £40k: £5,486. Now let's break down why."

#### 2. **Explain Jargon Immediately**
Bad: "Your K-code affects your cumulative PAYE calculation."
Good: "Your K-code (the letter K in your tax code like K500) means you owe tax from a previous year..."

#### 3. **Use Real Examples**
Bad: "Higher earners face the 60% effective rate."
Good: "Earn £110k? You'll lose £1 of personal allowance for every £2 over £100k. That creates a brutal 60% effective tax rate on income between £100k-£125k."

#### 4. **Be Honest About Complexity**
Good: "This gets complicated (thanks, HMRC): Scottish taxpayers have 6 bands instead of 3..."

### Banned Phrases
Never use these overused/misleading terms:
- "Simple hack" (tax isn't simple, no hacks exist)
- "Loophole" (unless referring to legal, HMRC-sanctioned reliefs)
- "Secret" (all tax rules are public)
- "Game the system" (encourages evasion)
- "Tax-free" (without explaining specific reliefs/allowances)

### Approved Terminology
Use these clear, accurate terms:
- "Tax relief" not "tax break"
- "PAYE deduction" not "tax taken"
- "Personal Allowance" not "tax-free amount" (unless explaining)
- "Effective tax rate" not "real tax rate"
- "Take-home pay" or "net pay" (both acceptable; "take-home" is more user-friendly and matches search intent)

### Humor Policy
**When to use:** Breaking up dense explanations, acknowledging absurdity
**How to use:** Self-deprecating, aimed at the system, never at readers
**Example:** "Yes, you read that right—earning more can leave you with less. HMRC's idea of motivational design."

**When NOT to use:** Legal disclaimers, serious topics (debt, penalties), technical calculations

---

## The Hook-Proof-Benefit Pattern

Every section should follow this structure:

1. **Hook** — Surprising fact, number, or question that stops the reader
2. **Proof** — Data, calculation, or HMRC source that backs it up
3. **Benefit** — "Which means..." for the reader (the "so what")

### Example in Practice

**Weak version:**
> "The personal allowance reduces for incomes over £100k."

**Strong version (Hook-Proof-Benefit):**
> **Hook:** "Earn between £100k-£125k? You're paying 60% tax on every extra pound."
>
> **Proof:** "For every £2 you earn over £100k, HMRC claws back £1 of your Personal Allowance. Once you hit £125,140, your allowance is gone completely."
>
> **Benefit:** "That means someone earning £125k takes home just £1,250 more than someone on £100k—despite 'earning' £25,000 more. [See the exact breakdown for your salary](/calculator/125000-after-tax)."

### Applying the Pattern

| Section Type | Hook Example | Proof Example | Benefit Example |
|--------------|--------------|---------------|-----------------|
| Tax band explanation | "The 40% rate sounds scary..." | "But you only pay 40% on income above £50,270" | "So on £60k, just £9,730 is taxed at 40%—not the whole thing" |
| NI thresholds | "Earn under £12,570?" | "You pay zero NI on earnings below the Primary Threshold" | "Which means part-time workers often keep every penny" |
| Scottish tax | "Same £50k salary, different take-home" | "Scotland has 6 bands vs England's 3" | "A Scottish resident on £50k pays £458 more per year" |

### Checklist for Every Section
- [ ] Does it start with something surprising or valuable?
- [ ] Is there data, a calculation, or an official source?
- [ ] Does it end with reader impact ("you save", "you pay", "which means")?

---

## Post Opening Formula

The first three paragraphs determine whether readers stay or bounce. Follow this structure:

### Paragraph 1: The Hook
Lead with the answer or a surprising number. Never open with background, definitions, or "In this article, we'll cover..."

**Good:**
> "On a £50,000 salary in England, you'll take home £38,530 after tax and National Insurance. That's £3,211 per month hitting your bank account."

**Bad:**
> "Understanding your take-home pay is important for financial planning. In this comprehensive guide, we'll explore how UK tax works..."

### Paragraph 2: The Stakes
Why this matters. The cost of getting it wrong. Create emotional resonance—relief, frustration, or urgency.

**Good:**
> "Get your tax code wrong and you could overpay by £200+ per month without realising. One reader discovered HMRC had been using an emergency code for six months—we helped him claim back £1,400."

**Bad:**
> "Many people don't fully understand their tax obligations, which can lead to financial issues."

### Paragraph 3: The Promise
What this post will deliver. Be specific about outcomes.

**Good:**
> "In the next 5 minutes, you'll know exactly what your £50k salary looks like after tax, where every pound goes, and whether you're overpaying. Plus, a quick check to see if your tax code is costing you money."

**Bad:**
> "This guide will explain everything you need to know about UK tax."

### The Three-Paragraph Test
Before publishing, read just the first three paragraphs. Ask:
- [ ] Would I keep reading if I found this in a search?
- [ ] Do I know exactly what I'll get from this post?
- [ ] Is there a compelling reason to read NOW rather than later?

---

## Content Calendar & Publishing

### Weekly Publishing Schedule

**Monday** - **Pillar Content / Evergreen Guide**
- Target: 2,000-3,000 words
- Purpose: Build authority, rank for head terms
- Example: "Complete Guide to UK Tax Codes 2025"

**Thursday** - **Timely Update / Quick Value**
- Target: 1,000-1,500 words
- Purpose: Capture trending searches, news spikes
- Example: "Budget 2025: How the NI Cut Affects Your Paycheck"

### Monthly Topic Clusters

**April (Tax Year End)**
- Self-assessment preparation
- Tax year-end planning
- Pension contribution deadlines

**October/November (Budget Season)**
- Autumn Budget analysis
- Tax changes for next year
- Salary scenario comparisons

**January (Self-Assessment Deadline)**
- Completing SA returns
- Common errors to avoid
- Payment options & extensions

**Ongoing Evergreen**
- Tax code explainers
- Student loan repayment guides
- Pension tax relief deep dives

### Keyword Research Process

1. **Use Google Trends** - Identify rising UK tax queries
2. **Monitor HMRC Announcements** - React within 24h to changes
3. **Analyze Search Console** - Double down on ranking terms
4. **Review Competitors** - Fill gaps (Unbiased, MoneySavingExpert)
5. **Internal Data** - Top calculator queries = blog topics

**Tools:**
- Google Trends (UK filter)
- Google Search Console
- Ahrefs/SEMrush (if budget allows)
- Reddit UK Personal Finance (topic validation)

---

## SEO & YMYL Compliance

### YMYL Requirements (Your Money Your Life)
Tax content is YMYL. Google demands **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness).

#### Expertise Signals
- **Always cite sources:** Link to HMRC, Revenue Scotland, SLC official pages
- **Show calculations:** Demonstrate how figures are derived
- **Date stamp updates:** Show last reviewed date prominently
- **Author credentials:** If possible, note tax background (even if self-taught)

#### Content Standards
- **Fact-check against official sources** - Every rate, threshold, date
- **Update evergreen posts** - Review quarterly, update tax year references
- **Use disclaimers** - "This is guidance, not advice. Consult HMRC or an accountant."
- **Link internally** - Build topical authority clusters

### Title & Meta Requirements

**Title Format:**
`[Primary Keyword] | [Year] Guide | PayeTax`

Examples:
- "UK Tax Codes 2025 | Complete Guide | PayeTax"
- "Student Loan Repayment Thresholds 2025-26 | PayeTax"

**Meta Description (150-160 chars):**
- Include primary keyword
- Promise clear value
- Add year for freshness signal

Example:
"Understand UK tax codes in 2025. From 1257L to K500, we explain what each code means for your PAYE deductions. Clear examples included."

### Image Optimization
- **File names:** `uk-tax-code-2025-explanation.jpg` (not `IMG_1234.jpg`)
- **Alt text:** Descriptive, keyword-rich, but natural
- **Format:** WebP for speed, max 200KB per image
- **Featured images:** 1200x630px for social sharing

---

## Blog Image Generation (Nano Banana)

We use **Nano Banana** (AI image generation) to create consistent, professional blog post images.

### Style Guide

All blog images must follow this consistent style:

| Property | Value |
|----------|-------|
| **Style** | Isometric 3D illustration |
| **Background** | Dark slate (#0f172a) with category color gradient |
| **Aspect Ratio** | 16:10 (1600x1000px recommended) |
| **Lighting** | Soft ambient with subtle rim glow |
| **Mood** | Professional, trustworthy, modern fintech |
| **Text** | **NO TEXT** - website overlays title/category |

### Category Color Accents

Each category has a designated accent color for gradient highlights:

| Category | Color | Hex | Accent Style |
|----------|-------|-----|--------------|
| salary-guides | Amber | #f59e0b | Warm gold glow |
| tax-basics | Emerald | #10b981 | Green glow |
| tax-planning | Violet | #8b5cf6 | Purple glow |
| tax-tips | Cyan | #06b6d4 | Cyan glow |
| tax-comparison | Pink | #ec4899 | Pink glow |
| tax-tools | Teal | #14b8a6 | Teal glow |
| student-loans | Blue | #3b82f6 | Blue glow |
| tax-changes | Red | #ef4444 | Red glow |
| tax-deadlines | Orange | #f97316 | Orange glow |

### Prompt Template

Use this template for consistent results:

```
Isometric 3D illustration on dark slate background (#0f172a). 
[VISUAL CONCEPT - specific to post topic]. 
[CATEGORY COLOR] gradient accents with soft glow. 
No text. Clean fintech style. 16:10 aspect ratio.
```

### Example Prompts

**£100k Tax Trap (tax-planning):**
> Isometric 3D illustration on dark slate background (#0f172a). Person standing confused in the center of a glowing maze/labyrinth. A large "60%" floats ominously above them as a holographic display. Purple and cyan gradient accents. A visible trap door or pitfall in the maze floor. Soft ambient lighting with purple rim glow. No text. Clean fintech style. 16:10 aspect ratio.

**Salary Breakdown (salary-guides):**
> Isometric 3D illustration on dark slate background (#0f172a). A large stack of gold coins at the top gradually being sliced/reduced through visible horizontal cuts - each slice peeling away and floating off. The remaining smaller stack reaches a person figure at the bottom. Warm amber and gold gradient accents. No text. Clean fintech style. 16:10 aspect ratio.

**Student Loans (student-loans):**
> Isometric 3D illustration on dark slate background (#0f172a). Graduation cap with price tag, loan document unfurling showing repayment steps. Student figure. Blue academic tones with soft glow. No text. Clean fintech style. 16:10 aspect ratio.

### Image Workflow

1. **Generate** image using Nano Banana with prompt from template
2. **Save** to `/public/images/blog/[slug].jpg`
3. **Update** MDX frontmatter:
   ```yaml
   image: "/images/blog/[slug].jpg"
   imageAlt: "Descriptive alt text for accessibility and SEO"
   ```
4. **Delete** source file from desktop after copying

### Image Naming Convention

Use the post slug as the filename:
- `100k-tax-trap.jpg`
- `student-loan-changes.jpg`
- `pension-tax-relief.jpg`

### Reference JSON

Full prompt library available at: `/scripts/blog-images.json`

This file contains visual concepts for all existing posts and should be updated when adding new posts.

### Schema Markup (Article)
Already implemented in blog template:
- `@type: "Article"`
- `headline`, `datePublished`, `dateModified`
- `author` (organization: PayeTax)
- `publisher` (PayeTax with logo)

---

## Content Types & Templates

### 1. **Ultimate Guide Template**
**Purpose:** Rank for head terms, build authority
**Length:** 2,500-3,500 words

**Structure:**
```markdown
# [Topic]: The Complete 2025 Guide

## Quick Summary (TL;DR)
- 3-5 bullet points of key takeaways
- Include one calculator CTA here

## What Is [Topic]? (Simple Definition)
- Plain English explanation
- Why it matters to readers ("which means you...")

## How [Topic] Works (Step-by-Step)
- Numbered process
- Real examples with calculations
- Calculator CTA: [See your exact breakdown](/calculator/AMOUNT-after-tax)

## Common Scenarios
- 3-5 relatable examples (use Hook-Proof-Benefit)
- Different income levels/situations

## Frequently Asked Questions
- 5-8 FAQs from Google autocomplete

## Key Takeaways
- Summarize in 3-4 bullets

## Next Steps
- Calculator CTA (specific salary route)
- Related guides
- Newsletter CTA
```

### 2. **News/Update Template**
**Purpose:** Capture trending traffic, establish timeliness
**Length:** 1,000-1,500 words

**Structure:**
```markdown
# [Event]: What It Means for Your [Outcome]

## What Changed (The Headlines)
- Top 3-5 changes in bullets

## Impact Analysis
### Who benefits (with numbers)
### Who pays more (with numbers)
### No change scenarios

## Real Examples
- Before/after calculations
- Calculator CTA: [Check how this affects your salary](/calculator/AMOUNT-after-tax)

## What to Do Next
- Action items if applicable

## Related Reading
- Link to evergreen guides
```

### 3. **Comparison Template**
**Purpose:** Capture "X vs Y" searches
**Length:** 1,500-2,000 words

**Structure:**
```markdown
# [Option A] vs [Option B]: Which Is Better for You?

## Quick Comparison Table
| Feature | Option A | Option B |

## When to Choose [Option A]
- 3-4 scenarios with examples

## When to Choose [Option B]
- 3-4 scenarios with examples

## Side-by-Side Calculator
- [Calculate Option A](/calculator/X-after-tax)
- [Calculate Option B](/calculator/Y-after-tax)

## Verdict
- No universal answer, explain trade-offs
```

### 4. **How-To Template**
**Purpose:** Rank for "how to" keywords
**Length:** 800-1,200 words

**Structure:**
```markdown
# How to [Accomplish Task]: Step-by-Step Guide

## What You'll Need
- Prerequisites, documents, info

## Step-by-Step Process
1. First action
2. Second action
(Each step with screenshot/example)

## Common Mistakes to Avoid
- 3-5 pitfalls with solutions

## What to Do Next
- Calculator CTA
- Follow-up actions
```

---

## Distribution Strategy

### X (Twitter) Strategy
**Format:** Thread-style posts

**Post 1 (Hook):**
"Just analyzed the Autumn Budget. Here's what it means for your take-home pay:"

**Posts 2-5:** Key insights with data

**Final Post:** Link to full article + calculator

**Timing:** Publish immediately after blog goes live

### LinkedIn Strategy
**Format:** Professional insight post

**Structure:**
- Opening stat/question
- 3-4 key insights (numbered)
- Professional perspective
- Link to full guide

**Tone:** More formal than X, aimed at professionals/accountants

**Timing:** Next business day after blog publish (different audience cycle)

### Email Newsletter Integration

We use **Resend** for newsletter emails. Subscribers sign up via the footer form and are added to a Resend Audience.

#### When You Publish a New Post

Run the broadcast script to notify all subscribers:

```bash
# Preview first (no emails sent)
bun run notify-subscribers --post="your-post-slug" --dry-run

# Send for real
bun run notify-subscribers --post="your-post-slug"
```

The script:
- Fetches the post from `content/blog/{slug}.mdx`
- Gets all subscribers from Resend Audience
- Sends branded email with title, excerpt, and CTA
- Tracks announced posts to prevent duplicates (`.announced-posts.json`)
- Has 5-second countdown before sending (Ctrl+C to cancel)

#### Email Templates

Located in `/emails/`:
- `welcome.tsx` - Sent automatically when someone subscribes
- `new-blog-post.tsx` - Used by the broadcast script

Both match the calculator results email style (light theme, gradient CTA).

#### Subscriber Management

**Resend Dashboard:** https://resend.com/audiences

**API endpoints:**
- `POST /api/newsletter/subscribe` - Add subscriber (sends welcome email + admin notification)
- `GET /api/newsletter/unsubscribe?email=...` - Remove subscriber (shows confirmation page)

**Admin notifications:** support@payetax.co.uk receives email when someone subscribes.

#### Environment Variables

```
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=7ada0d6a-4440-4676-a361-b78e268f1538
```

Both configured in Vercel for all environments.

### Reddit/Forums Policy
**Where:** r/UKPersonalFinance, r/TaxUK

**How:**
- NEVER post links directly (spam filters)
- Answer questions genuinely
- If relevant, mention "I wrote a guide on this" with link in comment history
- Add value first, promote second

**Rule:** 90% helpful comments, 10% link to content (if genuinely useful)

### Internal Linking Strategy
**Goal:** Build topical authority clusters AND drive calculator usage

**Calculator CTAs (REQUIRED):**
Every blog post must include at minimum 3 calculator CTAs:
1. **Intro** - After the hook/stakes (paragraph 4-5)
2. **Middle** - After a key example or calculation
3. **Conclusion** - In the "Next Steps" section

**CTA Format:**
Use specific salary routes, not generic `/` links:
- Good: `[Calculate your £50,000 take-home pay](/calculator/50000-after-tax)`
- Good: `[See the exact breakdown for £85k](/calculator/85000-after-tax)`
- Bad: `[Use our calculator](/)`
- Bad: `[Calculate here](/calculator)`

**Blog-to-Blog Links:**
- 2-3 related blog posts (contextual, relevant)
- 1 pillar guide (if not already a pillar)

**Anchor Text:** Descriptive, natural ("check our guide to tax codes" not "click here")

---

## Dofollow Backlink Strategy (SEO Growth)

**Goal:** 10-20 quality dofollow backlinks in first 3 months

### What Are Dofollow Backlinks?
Dofollow backlinks pass "link juice" (SEO authority) to your site, unlike nofollow links. Quality dofollow links from high-authority, relevant sites build domain authority, improve rankings, and drive traffic.

**Key Criteria:**
- **Relevance:** Niche-aligned sites (UK tax, finance, accounting)
- **Authority:** Domain Rating 30+ (check with Ahrefs free tool)
- **Natural:** Earned through value, not bought

### 3-Month Roadmap

#### **Month 1: Foundation (3-5 Links)** - Quick Wins
1. **Social Profiles (Dofollow)**
   - Update LinkedIn, Twitter (X), Facebook bios with blog URL
   - Join 5-10 niche groups (r/UKPersonalFinance, r/TaxUK)
   - Share intro posts linking back
   - *Target:* 1-2 links in week 1

2. **HARO (Help a Reporter Out)**
   - Sign up at helpareporter.com
   - Respond to 3-5 daily queries as "tax expert"
   - Get quoted in articles = high-quality dofollow from media
   - *Target:* 1-2 links by month-end

3. **Resource Page Submissions**
   - Search "UK tax resources" / "PAYE calculator resources"
   - Email 10-15 curators pitching best post as fit
   - *Target:* 1-2 links

#### **Month 2: Content-Led Outreach (4-7 Links)**
1. **Guest Posting**
   - Find sites via "UK tax + write for us" searches
   - Pitch 2-3 original articles (800+ words) with dofollow bio link
   - Start with mid-tier sites (DR 20-40) for faster acceptance
   - *Target:* 2-3 links

2. **Broken Link Building**
   - Use Check My Links Chrome extension on competitor sites
   - Scan 20 resource pages for dead links
   - Email owners suggesting your post as replacement
   - *Target:* 1-2 links

3. **Influencer Outreach**
   - Identify 10 UK tax/finance influencers via Twitter
   - Email personalized pitches sharing their content
   - Link your post in relevant reply/thread
   - *Target:* 1-2 links

#### **Month 3: Scale and Refine (3-6 Links)**
1. **Skyscraper Technique**
   - Find top-ranking UK tax posts (Ahrefs free Content Explorer)
   - Create better version (more data/visuals/2025 updates)
   - Email 20-30 linkers to original suggesting yours
   - *Target:* 2-3 links

2. **Shareable Visuals/Webinars**
   - Design 1-2 infographics on tax topics (Canva)
   - Submit to Visual.ly (dofollow potential)
   - Host free Zoom webinar on UK tax changes
   - *Target:* 1-2 links

3. **Community Engagement**
   - Answer Quora/Reddit questions with value + subtle links
   - Run link-sharing thread on Twitter
   - Nurture early linkers by promoting their sites
   - *Target:* 1 link

### Tools & Tracking
**Free Tools:**
- Google Search Console (backlink monitoring)
- Moz's Link Explorer (free 10 queries/month)
- Ahrefs Backlink Checker (free, limited)
- Check My Links Chrome extension

**Track Weekly:**
- New backlinks acquired
- Referral traffic from backlinks
- Domain Authority changes (Moz)

### Best Practices
**Do:**
- Prioritize relevance over quantity
- Use natural anchor text ("UK tax guide" not "click here")
- Build relationships before asking for links
- Create genuinely useful content worth linking to

**Don't:**
- Buy links (Google penalty risk)
- Use comment spam (mostly nofollow now)
- Submit to directory farms
- Use exact-match anchor text excessively

**Timeline:** Links take 2-4 weeks to appear/index. Combine with on-page SEO for faster results.

---

## Legal & Compliance Checklist

Every post must include:

**Disclaimer** (at bottom):
> This article provides general guidance on UK tax for informational purposes only. Tax rules change frequently and individual circumstances vary. For official tax calculations or advice on your specific situation, consult HMRC or a qualified tax advisor.

**Date stamp** (at top):
Include "Last updated: [Month Year]" and update it whenever the post is revised.

**Source citations** (linked):
- HMRC guidance pages
- Revenue Scotland (for Scottish tax)
- Student Loans Company (for SL posts)
- Budget documents (for policy changes)

**Fact-check** before publishing:
- All rates, thresholds, dates against official sources
- Calculations verified with PayeTax calculator
- Links tested (no broken external links)

---

## Performance Review Process

**Monthly Review (First Monday):**
- Traffic: Total visitors, top 10 posts
- Engagement: Avg. time on page, bounce rate
- Rankings: Keyword position changes
- Conversions: Calculator visits from blog, newsletter signups

**Quarterly Deep Dive:**
- Content audit: Update/remove outdated posts
- Keyword gaps: What aren't we ranking for?
- Competitor analysis: What are they doing better?
- Strategy adjustment: Double down on what works

**Annual Refresh:**
- Update all evergreen guides for new tax year
- Archive outdated news posts (keep for SEO, add notice)
- Rewrite underperformers (traffic <50/month after 6 months)

---

## Voice & Tone Examples

### Good Examples

**Explaining complexity honestly:**
> "Here's where it gets messy: if you earn between £100k-£125k, you lose £1 of Personal Allowance for every £2 earned. This creates an effective tax rate of 60%—higher than the top rate. Yes, you read that right."

**Using relatable examples:**
> "Let's say you earn £35,000 in England. After tax and NI, you take home £28,114 annually—that's £2,343 per month. [See your exact breakdown](/calculator/35000-after-tax)."

**Being direct about action:**
> "Check your payslip right now. See that tax code? If it's wrong, you could be overpaying by hundreds of pounds every month."

**Creating emotional resonance (relief):**
> "Good news: that unexpected tax refund isn't a scam. HMRC sometimes overcollects during the year, and they do pay it back. Here's how to check if you're owed money."

**Creating emotional resonance (validation):**
> "If you've ever stared at your payslip wondering where 40% of your raise went, you're not imagining things. The UK tax system is genuinely confusing—by design, some would say."

**Being specific over vague:**
> "You'll save £252 per year with Marriage Allowance—that's £21 extra in your pocket every month. Not life-changing, but it takes 5 minutes to claim and lasts until you cancel it."

### Bad Examples

**Oversimplifying:**
> "Tax is easy! Just use this one weird trick..." (No, tax is complex and there are no tricks)

**Being vague:**
> "Many people pay too much tax." (How many? How much? Give specifics)

**Using unnecessary jargon:**
> "Your cumulative PAYE liability vis-à-vis your PSA..." (What does this mean to a normal person?)

**Missing the benefit:**
> "The Personal Allowance is £12,570." (So what? What does this mean for the reader?)

**Generic CTAs:**
> "Use our calculator to learn more." (Learn what? Be specific about the outcome)

**Inappropriate humor:**
> "HMRC penalties can be brutal—LOL!" (Penalties aren't funny to people facing them)

---

## Hook Formulas

### Blog Headlines
- "How Much Tax Do You Pay on £[X]? [Year] Calculator"
- "£[X] After Tax UK: Your Complete [Year] Breakdown"
- "The £100k Tax Trap: Why Your Raise Could Cost You"
- "[Topic]: The Complete [Year] Guide"
- "What [Event] Means for Your Take-Home Pay"

### Social Media Hooks
- "Most people don't realise..."
- "Here's what £[X] actually looks like..."
- "The tax mistake costing you £[X] per year"
- "Scotland vs England: Same salary, different take-home"
- "If you earn £[X], you need to know this..."

### Engagement Drivers
- **Regional comparisons:** Scotland vs England, Welsh rates
- **"What would you do?" scenarios:** The £100k raise dilemma
- **Surprising calculations:** Hidden effective rates, NI thresholds
- **Common misconceptions:** "I pay 40% tax on everything"
- **Deadline urgency:** Tax year end, self-assessment

### Opening Line Formulas
Use these to hook readers in the first paragraph:

| Formula | Example |
|---------|---------|
| Number reveal | "On a £45,000 salary, you'll pay £6,486 in income tax. Here's exactly how that breaks down." |
| Myth bust | "Think you're in the 40% tax bracket? You're probably only paying 40% on a fraction of your income." |
| Direct question | "What does your tax code actually mean? That five-digit code on your payslip controls your entire take-home pay." |
| Pain point | "Earning between £100k-£125k? You're paying a hidden 60% tax rate—here's why." |

---

## Content Ideas Bank

**Evergreen Topics (Always Relevant):**
- Tax code decoder (1257L, K500, BR, etc.)
- Student loan plan comparison (1, 2, 4, 5, PG)
- Scottish vs English tax breakdown
- Pension tax relief explained
- Marriage Allowance guide
- Emergency tax code recovery

**Seasonal Topics:**
- Budget analysis (October/November)
- Tax year planning (March)
- Self-assessment deadline (January)
- P60/P45 season (April/May)

**Trending Opportunities:**
- HMRC system changes
- New tax bands announced
- Student loan threshold changes
- Cost of living impact on take-home

**Advanced Topics (For Established Authority):**
- 60% tax trap (£100k-£125k)
- Salary sacrifice optimization
- Tax code appeals process
- PAYE vs Self-Assessment hybrid

---

**Remember:** Quality beats quantity. One exceptional 2,500-word guide ranks better and converts more than five rushed 500-word posts.

**Blog Mantra:** *"No jargon. No fluff. Just clear tax insights that actually make sense."*

---

*Document owner: PayeTax Content Team*
*Review cycle: Quarterly*
