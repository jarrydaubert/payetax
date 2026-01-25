# Backlog

> **This is a TODO list only.** No status tracking - when something is done, delete it.
> Keep items actionable and specific. If it's not actionable, it doesn't belong here.

## Monetization Setup

**Note:** All monetization features are built but disabled for launch. See `docs/guides/MONETIZATION.md` for enabling instructions.

- Find local accountant willing to pay per referral (informal partnership)
- Configure `REFERRAL_PARTNER_EMAIL` env var, then enable CTA in `CalculatorContainer.tsx`
- Enable page at `/pricing/business` when ready (currently returns 404)
- Reach out to finance content creators/newsletters about cross-promotion
- Revisit B2B affiliate partner programs (requires company registration)

## Tech Debt

- Align IncomeSource type in store with validation.ts discriminated union schema
- Add validationError state to calculatorStore for UI feedback on validation failures
- Create tsconfig.test.json to enable type-checking for test files


