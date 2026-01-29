# Backlog

> **This is a TODO list only.** When done, delete it.
> If Stripe = £0, monetization items come first.

---

## Recurring / Floating Items

> Keep these as reminders - not one-time tasks

### After Each HMRC/Gov Budget Change
- Review ALL blog posts for outdated tax rates, thresholds, and allowances
- Update `publishedAt` / `updatedAt` dates on affected posts
- Check director-related posts especially (salary thresholds, dividend allowance, CT rates)
- Verify calculator constants in `src/constants/taxRates.ts` are updated first
- Key posts to check: director guides, £100k tax trap, Scottish rates comparison, student loans

---

## P0 - Revenue & Trust

### Monetization Setup
> All features are built but disabled. See `docs/business/MONETIZATION.md` for enabling instructions.

- [ ] Find local accountant willing to pay per referral (informal partnership)
- [ ] Configure `REFERRAL_PARTNER_EMAIL` env var
- [ ] Enable CTA in `CalculatorContainer.tsx`
- [ ] Enable `/pricing/business` page (currently returns 404)
- [ ] Reach out to finance content creators/newsletters about cross-promotion

### Other Income Input
> "Assumes this is your only income" footnote is NOT sufficient - can be wrong by thousands

- [ ] Add "Is this your only income?" Yes/No toggle
- [ ] Add optional "Roughly how much? £____" field
- [ ] If "No/Not sure", show warning: "Personal tax numbers may be too low"
- [ ] Add helper text: "Redundancy: only amount over £30,000 counts"

### Missing Tests
> New pro tool files have NO test coverage - high risk

- [ ] Implement tests in `src/lib/tax/__tests__/directorCalculator.spec.ts`
- [ ] Tighten golden example tolerances (currently ±30%, should be ±£100)
- [ ] Test other income scenarios (band consumption, PA taper)

---

## P1 - Approved Features

### Compare My Setup (APPROVED)
> Option B (Always-On Custom Row) unanimously selected by 4 reviewers.
> Full spec: `docs/business/DIRECTOR_CALCULATOR_BUILD.md` → "Feature: Compare My Setup Mode"

---

## P2 - Lower Priority

### Tools Directory Audit
- [ ] Create `/tools/page.tsx` index page
- [ ] Add navigation links to orphaned tools (marriage-allowance, NI calculator, embed-widget)
- [ ] Update MarriageAllowanceAlert to link to internal tool instead of gov.uk

### Analytics Events
- [ ] Add: `pro_calculator_started`, `pro_calculator_completed`, `pro_strategy_selected`, `pro_calendar_downloaded`
