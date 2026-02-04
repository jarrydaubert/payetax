# Monetization Strategy

## The Principle

We don't capitalize on stress and confusion. The core calculator stays free. We charge for convenience features that save time.

---

## The Model

Free calculator → Tax Pack (one-time) → Referrals → Optional widget (if demand).

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
