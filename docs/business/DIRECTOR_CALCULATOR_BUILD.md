# Director Pay Calculator — Product Spec

Purpose: define inputs, outputs, and behaviors for the Director Intelligence calculator. Keep numeric values in code.

## Scope

- Single-director limited company
- Strategy comparison + education panel
- Clear warnings for complex situations

## Inputs

- Region (rUK or Scotland)
- Profit before director remuneration
- What-if controls: salary scenario and company profit scenario
- Quick Start path (minimum required inputs first; progressive reveal for advanced inputs)
- VAT status (education-only)
- Already taken (salary/dividends)
- Other personal income
- Year-end month
- Losses brought forward
- Associated companies count (for CT threshold splitting)
- Optional: Employment Allowance, student loan plan, pension, benefits in kind, other PAYE employment, minimum salary

## Outputs

- Strategy comparison (all salary, balanced mix, all dividends, your setup)
- Unified scenario outputs that reflect baseline or active what-if state
- Net take-home summary and effective rate
- Company vs personal tax pots
- Key dates and warnings
- Education panel content
- Company costs include estimated Class 1A NI on BIK

### Compare My Setup Behavior

- `Your Setup` should be always visible in strategy outputs (show `Not set` when empty).
- Editing `Your Setup` must be explicit and user-controlled (`Apply`, `Reset`, `Clear`).
- Do not force pre-population from baseline/optimal values.

## Rules

- All rates and thresholds come from `src/constants/taxRates.ts`.
- All dashboard/calculator panels should consume one active-scenario path so baseline and what-if views stay in sync.
- CT thresholds should be adjusted when associated company count is greater than 1.
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
