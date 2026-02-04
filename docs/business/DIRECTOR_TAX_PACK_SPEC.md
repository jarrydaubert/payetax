# Director Tax Pack — Product Spec

Purpose: define the paid export bundle for director results. Keep details evergreen and store live tasks in `docs/BACKLOG.md`.

## What It Is

A paid bundle that turns Director Guide results into downloadable documents for record-keeping.

## Who It’s For

Directors who have already used the Director Guide and want a clean export of their results.

## Artifacts

- Summary report (PDF)
- Detailed breakdown (CSV)
- Dividend voucher template (DOCX)
- Board minutes template (DOCX)
- One downloadable bundle (ZIP)

## High-Level Flow

- User completes Director Guide and sees a CTA
- Checkout via Stripe
- Server verifies payment and returns export payload
- Client generates documents and offers a download
- Recovery link available for re-download

## Architecture Notes

- Stripe Checkout for payments
- Temporary storage for payloads
- Generation runs client-side or edge workers depending on bundle size

## References

- `docs/business/DIRECTOR_CALCULATOR_BUILD.md`
- `src/lib/tax/`
- `src/constants/taxRates.ts`
