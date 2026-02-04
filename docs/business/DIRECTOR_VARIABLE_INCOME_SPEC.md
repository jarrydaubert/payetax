# Director Guide — Variable Income Mode (Monthly Cashflow)

## Purpose

Enable first‑time directors with uncertain income to answer: “What can I safely pay myself this month?” without guessing annual figures. The mode adds a monthly input path, cash‑buffer logic, and mid‑year projection while reusing the existing annual tax engine.

## Scope

**In scope**
- Monthly inputs (income + expenses) with contract start month
- Cash buffer / runway guidance
- Safe monthly draw calculation (cash‑aware + tax‑aware)
- Mid‑year projection into annualized strategy comparison
- Warnings for buffer shortfalls and contract‑end risk

**Out of scope**
- Multi‑director, household optimization, IR35
- Bank feeds or accounting integrations
- Automated filings or compliance actions
- Real cashflow forecasting by invoice/payment dates

## User Story

“I just started a £3k/month contract. I don’t know my annual numbers yet. What’s safe to take this month without breaking the business later?”

## UX / Entry

- Add a **mode toggle** in the Inputs panel: **Annual** (default) vs **Monthly (Variable Income)**.
- Switching to **Monthly** shows a dedicated section at the top; advanced inputs remain available below.
- Summary cards and strategy comparison remain visible; add a **Safe Monthly Draw** call‑out above results.

## Inputs (Monthly Mode)

**Core monthly inputs**
- **Monthly contract income** (gross invoicing)
- **Monthly business expenses** (excluding director salary)
- **Contract start month** (month within current tax year)
- **Cash in bank now**
- **Minimum monthly draw** (personal floor)
- **Runway target (months)**

**Still supported (advanced, same as annual mode)**
- Region (rUK/Scotland)
- VAT included toggle (warning‑only)
- Other personal income
- Other PAYE employment flag
- Student loans (plans 1/2/4/postgrad)
- Employer pension contribution
- Company car BIK
- Employment Allowance toggle
- Minimum salary requirement
- Losses brought forward
- YTD salary/dividends/drawings (optional; default 0)

## Derived Values

**Months remaining in tax year**
- Tax year runs **Apr → Mar**.
- `monthsRemaining = countInclusive(startMonth … Mar)`.

**Projected annual figures**
- `projectedRevenue = monthlyIncome × monthsRemaining`
- `projectedExpenses = monthlyExpenses × monthsRemaining`
- If YTD amounts are provided, include them in the “already taken” logic (existing).

## Core Calculations

1. **Project annual inputs** using monthly values and months remaining.
2. **Run existing strategy engine** (`calculateStrategyComparison`) with projected annual revenue/expenses + advanced inputs.
3. **Compute monthly‑tax guidance**:
   - `taxBasedMonthlyDraw = annualTakeHome / monthsRemaining`
4. **Compute buffer requirement**:
   - `requiredBuffer = runwayMonths × (minimumMonthlyDraw + monthlyExpenses)`
5. **Compute cash‑based ceiling**:
   - `cashBasedCeiling = max(0, cashInBank - requiredBuffer)`
6. **Safe monthly draw**:
   - `safeMonthlyDraw = min(taxBasedMonthlyDraw, cashBasedCeiling + minimumMonthlyDraw)`
   - If `cashBasedCeiling` is 0, show safe draw = **minimumMonthlyDraw** with warning.

## Outputs (Monthly Mode)

**Primary**
- **Safe Monthly Draw** (cash‑aware + tax‑aware)
- **Buffer status**: Required buffer vs cash in bank, shortfall amount
- **Projected annual strategy comparison** (same 3 strategies)

**Secondary (existing outputs)**
- Annual salary/dividends, corporation tax, NI, income tax, dividend tax
- Effective rate
- Personal + company tax pots

## Warnings (Monthly Mode)

- **Buffer shortfall**: `cashInBank < requiredBuffer`
- **Contract‑end risk**: `monthsRemaining <= runwayMonths`
- **Mid‑year assumption**: Always shown in monthly mode (projection assumption)
- Existing warnings still apply (VAT threshold, pension gap, already taken too much, DLA risk, high complexity, etc.)

## Data Model Changes

Add to DirectorGuide state (monthly mode only):
- `mode: 'annual' | 'monthly'`
- `monthlyIncome` (number)
- `monthlyExpenses` (number)
- `contractStartMonth` (01–12)
- `cashInBank` (number)
- `minimumMonthlyDraw` (number)
- `runwayMonths` (number)

## Analytics

- `director_guide_mode_changed` (annual ↔ monthly)
- `director_guide_safe_draw_calculated`
- `director_guide_buffer_shortfall_shown`

## Edge Cases

- `monthsRemaining <= 0` → show validation error
- `monthlyIncome = 0` → survival mode warning + safe draw = 0 or minimum only
- Large cash buffer but low income → safe draw capped by tax‑based monthly draw
- Already‑taken > projected profit → show existing “overdrawn” warnings

## Non‑Goals / Not Implemented

- Variable income optimization by invoice schedule
- Dynamic switching between salary/dividends monthly
- Bank balance sync or cashflow reconciliation
- Multi‑director or spouse optimization

## Testing Plan

- Unit tests for projection math and safe draw calculation
- Strategy comparison regression tests with monthly inputs
- UI tests: monthly mode toggle, safe draw output, buffer warnings
- Analytics event coverage for mode change and shortfall

## Rollout Notes

- Feature‑flag monthly mode initially
- Default to Annual mode to preserve existing behavior
- Add tooltip copy to explain projection assumptions
