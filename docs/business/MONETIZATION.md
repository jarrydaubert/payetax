# Monetization Strategy

## The Principle

We don't capitalize on stress and confusion. The core calculator stays free. We charge for convenience features that save time.

---

## The Model

High‑intent traffic → calculator → paid outcome.

1) **SEO → Calculator → Tax Pack**  
2) **SEO → Calculator → Accountant referral**  
3) **Lifecycle loops (email + content)** to keep users warm

---

## Current Status

- Director Guide is live and free.
- Referral infrastructure is partially live:
  - `POST /api/referral/lead` is implemented.
  - Referral CTA in main calculator UI remains intentionally disabled until partner agreements are in place.
- Tax Pack flow is not implemented yet (no live checkout/export pipeline).
- Newsletter lifecycle loop is live (manual broadcast script available).

---

## Revenue Model (Evergreen)

Define the funnel with variables and tune the leverage points:

- **Traffic:** `sessions`
- **Calculator engagement:** `start_rate`, `complete_rate`
- **Tax Pack conversion:** `tax_pack_take_rate`, `tax_pack_price`
- **Referral conversion:** `referral_intent_rate`, `referral_close_rate`, `referral_fee`
- **Revenue:**
  - `tax_pack_revenue = sessions × start_rate × complete_rate × tax_pack_take_rate × tax_pack_price`
  - `referral_revenue = sessions × start_rate × complete_rate × referral_intent_rate × referral_close_rate × referral_fee`

Primary levers:
- Improve calculator completion and trust signals (biggest multiplier).
- Make CTAs explicit and scenario‑specific (largest lift per change).
- Keep blog output anchored to calculator conversion, not vanity traffic.

---

## Free Calculator (Always Free)

Includes:
- Full strategy comparison
- All inputs (profit, YTD, pension, BIK, student loans, losses)
- All calculations (IT, NI, CT, DT, student loans)
- Key dates and contextual warnings
- Education panel with accuracy/scope disclosure

---

## Tax Pack (One‑Time Purchase)

What it is:
- Personalised tax summary (PDF)
- Annual schedule (CSV)
- Board minutes template (DOCX)
- Dividend voucher template (DOCX)
- One downloadable bundle (ZIP)

Who it is for:
- Directors who completed the Director Guide and want a clean export for records or accountant handoff.

Flow:
- User completes Director Guide and sees a Tax Pack CTA
- Checkout via Stripe
- Signature-verified webhook marks order paid (idempotent)
- Async worker generates bundle and stores artifact privately
- Success page polls status and unlocks secure download
- Recovery link supports re-download via expiring grant

Technical stack:
- Stripe Checkout
- Signature-verified webhooks + idempotent order processing
- Deterministic payload snapshot with checksum
- Async PDF/CSV/DOCX generation + ZIP packaging
- Private object storage + signed download grants
- Email delivery via Resend

Execution:
- Source plan: `docs/business/tax-pack/TAX_PACK_PLAN.md`
- Delivery tasks: `docs/BACKLOG.md` (Monetization -> Tax Pack V1)

---

## Accountant Referrals

How it works:
- Triggered by complexity warnings
- Lead capture → partner accountant

Infrastructure:
- Referral CTA component
- Lead API route
- Email notification

---

## Widget (If Demand)

A white‑label embed for accountants or platforms. Validate before building.

---

## Priorities

- Nail conversion before scaling content.  
- Tax Pack first; referrals second if partner quality isn’t proven.  
- Build repeatable hooks (salary pages, tax‑trap, director scenarios) that feed the calculator.  
- Keep blog output anchored to calculator CTAs.  
