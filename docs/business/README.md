# PayeTax Business Docs

Everything related to making money.

---

## Start Here

**[READ_THIS_FIRST.md](./READ_THIS_FIRST.md)** - The manifesto. Read before building anything.

---

## Documents

| Document | Purpose |
|----------|---------|
| [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) | Distribution > Features. The mindset reset. |
| [MONETIZATION.md](./MONETIZATION.md) | Current revenue streams and how to enable them |
| [SME_DIRECTOR_TOOLS.md](./SME_DIRECTOR_TOOLS.md) | Priority #1 product: Director Optimizer spec |
| [IDEAS.md](./IDEAS.md) | Future features (build AFTER revenue) |

---

## Quick Actions

### Enable Monetization Today

```bash
# 1. Accountant Referral CTA
# File: src/components/organisms/CalculatorContainer.tsx
# Uncomment import and JSX block

# 2. B2B Pricing Page  
# File: src/app/pricing/business/page.tsx
# Remove notFound() call

# 3. Set env var
vercel env add REFERRAL_PARTNER_EMAIL
```

### Distribution Checklist

- [ ] Posted on LinkedIn today?
- [ ] Engaged with 5 relevant comments?
- [ ] Published blog content this week?
- [ ] Reviewed analytics?

---

## The Rule

**50% of time on distribution. 50% on product.**

Not 90% building, 10% "marketing later."

If Stripe shows £0, you're not distributing enough.
