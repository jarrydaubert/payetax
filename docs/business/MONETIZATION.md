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

Technical stack:
- Stripe Checkout
- Edge functions for PDF/CSV/DOCX generation
- Email delivery via Resend

Full spec: `DIRECTOR_TAX_PACK_SPEC.md`

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
