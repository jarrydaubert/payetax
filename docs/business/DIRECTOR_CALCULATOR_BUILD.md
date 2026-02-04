# Director Pay Calculator — Product Spec

Purpose: define inputs, outputs, and behaviors for the Director Guide calculator. Keep numeric values in code.

## Scope

- Single-director limited company
- Strategy comparison + education panel
- Clear warnings for complex situations

## Inputs

- Region (rUK or Scotland)
- Profit before director remuneration
- VAT status (education-only)
- Already taken (salary/dividends)
- Other personal income
- Year-end month
- Losses brought forward
- Optional: Employment Allowance, student loan plan, pension, benefits in kind, other PAYE employment, minimum salary

## Outputs

- Strategy comparison (all salary, balanced mix, all dividends, your setup)
- Net take-home summary and effective rate
- Company vs personal tax pots
- Key dates and warnings
- Education panel content

## Rules

- All rates and thresholds come from `src/constants/taxRates.ts`.
- VAT status never changes calculations.
- Employment allowance is user-declared; do not infer eligibility.
- Region controls income tax bands; dividend tax uses UK-wide rates.
- Non-positive profit triggers survival-mode messaging.

## Non-Goals

- Multi-director or household optimization
- Contractor/IR35 journeys
- Accounting integrations
- Automated filings or formal advice

## References

- Logic: `src/lib/tax/`
- UI: `src/components/organisms/DirectorGuide/`
- Tests: `src/lib/tax/__tests__/` and E2E suites
