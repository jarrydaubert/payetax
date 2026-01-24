# Backlog

## Setup Required

- [ ] Configure RESEND_API_KEY environment variable for email results feature
- [ ] Verify Resend sender domain for `noreply@payetax.co.uk`
- [ ] **Newsletter:** Create Resend Audience in dashboard (https://resend.com/audiences)
- [ ] **Newsletter:** Add `RESEND_AUDIENCE_ID` to `.env.local` (see `docs/ideas/NEWSLETTER_RESEND.md`)

## Monetization Setup

**Note:** All monetization features are built but disabled for launch. See `docs/guides/MONETIZATION.md` for enabling instructions.

- [ ] **Referrals:** Find local accountant willing to pay per referral (informal partnership)
- [ ] **Referrals:** Configure `REFERRAL_PARTNER_EMAIL` env var, then enable CTA in `CalculatorContainer.tsx`
- [ ] **B2B Pricing:** Enable page at `/pricing/business` when ready (currently returns 404)
- [ ] **Sponsorship:** Reach out to finance content creators/newsletters about cross-promotion
- [ ] **Future (if company registered):** Revisit B2B affiliate partner programs

## Completed

- [x] Add /tools/tax-code-decoder to sitemap (Jan 2026)
- [x] Add /tools/embed-widget to sitemap (added to static pages)
- [x] Add /tools/scottish-tax-calculator to sitemap
- [x] Add /tools/national-insurance-calculator to sitemap
- [x] Add /tools/marriage-allowance-calculator to sitemap
- [x] Add navigation links to new tools pages (footer updated)
- [x] Expand programmatic salary pages from 35 to 150+ (Jan 2026)
- [x] Create Scottish Tax Calculator landing page
- [x] Create National Insurance Calculator landing page
- [x] Create Marriage Allowance Calculator landing page
- [x] **SEO:** Add 24 new competitors (27 total) to `src/data/competitors.ts`
- [x] **SEO:** Create use case pages `/best-for/[use-case]` (8 audiences)
- [x] **Newsletter:** Create subscribe API and NewsletterSignup component
- [x] **Newsletter:** Add newsletter signup to footer
- [x] **Monetization:** Add affiliate link infrastructure to competitor pages (Jan 2026)
- [x] **Monetization:** Create B2B widget pricing page at `/pricing/business`
- [x] **Monetization:** Build accountant referral CTA for high-income users (£75k+)
- [x] **Monetization:** Create lead capture API at `/api/referral/lead`
- [x] **Monetization:** Add `trackAffiliateClick` to analytics
- [x] **Monetization:** Removed placeholder affiliate URLs (require company registration)

## Tech Debt

- [ ] Align IncomeSource type in store with validation.ts discriminated union schema
- [ ] Add validationError state to calculatorStore for UI feedback on validation failures
- [ ] Create tsconfig.test.json to enable type-checking for test files

## Content Backlog

- [ ] Write more salary insight blog posts (£25k, £30k, £35k, £45k, £55k, £65k, £75k, £90k)
- [ ] Create October/November content for Autumn Budget preview
- [ ] Expand programmatic salary pages to £200k+ executive salaries
