# Director Intelligence

Purpose: canonical business/spec reference for the Director Intelligence experience.

Route: `/tools/director-guide`

Tax logic sources:
- `src/constants/taxRates.ts`
- `src/lib/tax/`

## Who It Serves

Director Intelligence is for UK limited-company directors who need clarity about salary, dividends, tax set-asides, and what they can safely take from the business.

Primary audiences:
- first-time directors who need explanation as much as calculation
- experienced directors who want fast strategy comparison
- accountants who want a practical explainer they can share with clients

## Product Role

- Supports the main PAYE calculator for higher-complexity visitors.
- Combines education and calculator outputs in one workflow.
- Remains a free decision-support tool; no paid flow is in active scope.

## Scope

In scope:
- single-director limited company scenarios
- strategy comparison plus education panel
- contextual warnings for common director edge cases
- annual mode and monthly variable-income mode
- key dates and `.ics` calendar export

Out of scope:
- multi-director or household optimisation
- IR35/contractor journeys
- accounting integrations or bank feeds
- automated filings or formal advice

## Core Positioning

- Education-first for beginners, calculator-fast for confident users.
- Simple, safe, jargon-light guidance.
- Trust themes: accuracy, clarity, and practical set-aside guidance.

## Core Inputs

- Region (`rUK` or Scotland)
- Profit before director remuneration
- What-if controls: salary scenario and company profit scenario
- Already taken (salary/dividends)
- Other personal income
- Year-end month
- Losses brought forward
- Associated companies count
- Optional: Employment Allowance, student loan plan, pension, benefits in kind, other PAYE employment, minimum salary

Monthly mode adds:
- monthly income
- monthly expenses
- contract start month
- cash in bank
- minimum monthly draw
- runway target

## Core Outputs

- Strategy comparison: all salary, balanced mix, all dividends, your setup
- Unified baseline/what-if output path
- Net take-home summary and effective rate
- Company and personal tax pots
- Key dates and warnings
- Education panel content
- Safe monthly draw and buffer status in monthly mode

## Key Rules

- All rates and thresholds come from `src/constants/taxRates.ts`.
- Dashboard and calculator panels consume one active-scenario path so baseline and what-if views stay aligned.
- Corporation tax thresholds adjust when associated company count is greater than 1.
- VAT status is education-only and does not change calculations.
- Employment Allowance is user-declared, not inferred.
- Region controls income tax bands; dividend tax uses UK-wide rates.
- Non-positive profit triggers survival-mode messaging.

## Monthly Variable-Income Mode

Purpose:
- answer “What can I safely pay myself this month?” when annual figures are uncertain

Model:
- project annual revenue/expenses from monthly inputs and months remaining in the tax year
- run the existing annual strategy engine on the projected figures
- calculate safe monthly draw using both tax-aware and cash-aware constraints

Warnings:
- buffer shortfall
- contract-end risk
- projection assumption reminder
- existing director warnings still apply

## Must-Have Behavior

- Dual what-if controls stay available and outputs stay consistent across cards and tables.
- Quick Start reveals only the minimum required inputs first, with advanced detail available below.
- Company cost includes estimated Class 1A NI on benefits in kind.
- `Your Setup` is always visible, even when empty.
- `Your Setup` editing is explicit and user-controlled (`Apply`, `Reset`, `Clear`).
- Monthly mode preserves annual-mode strategy comparison while adding safe-draw guidance.

## Regression Anchors

- Golden director-calculation example is covered in `src/lib/tax/__tests__/directorCalculator.test.ts`.
- Recruiter “feast or famine” case-study behavior is covered in `src/lib/tax/__tests__/directorCalculator.caseStudy.test.ts`.
- Monthly mode behavior is anchored in `src/lib/tax/variableIncome.ts` tests plus store/component coverage.

## References

- UI: `src/components/organisms/DirectorGuide/`
- Store: `src/store/directorGuideStore.ts`
- Analytics: `src/lib/directorGuideAnalytics.ts`
- Tests: `src/lib/tax/__tests__/`
