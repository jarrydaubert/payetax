# Self-Employed (Sole Trader) Tax Calculator

**Status:** Not Started  
**Priority:** Medium  
**Effort:** Medium (2-3 days)

---

## Problem

- Current calculator is PAYE-only.
- Self-employed (sole traders) pay Class 2/4 NI and tax on **profit**, not salary.
- We miss search demand for "self employed tax calculator" and related terms.

## Solution

Create a dedicated self-employed tool page focused on sole traders (not limited companies).

## How It Works

- Inputs: business income, allowable expenses, tax year, region, student loan.
- Profit = income - expenses.
- Income tax on profit using existing tax bands.
- Class 2 NI: flat weekly rate above threshold.
- Class 4 NI: 9%/2% bands above thresholds.
- Student loan repayment on profit.

## UI

- New tool page: `/tools/self-employed-tax-calculator`.
- Income + expenses inputs with period selectors.
- Profit summary card.
- Deductions cards: Income Tax, Class 2 NI, Class 4 NI, Student Loan (optional).
- Net profit + effective rate.

## Edge Cases

- Profit <= personal allowance → no income tax.
- Profit below Class 2 threshold → Class 2 = £0.
- Scottish rates.
- Negative profit → show £0 deductions, net loss.

## Implementation Notes

- Add Class 2/4 rates + thresholds to `src/constants/taxRates.ts`.
- Add `calculateClass2NI` + `calculateClass4NI` helpers (new `src/lib/selfEmployedCalculator.ts` or `src/lib/taxCalculator.ts`).
- Reuse `calculateTax` with `payNoNI: true` for income tax only.
- Unit tests for Class 2/4 + a few end-to-end examples.

## Success Criteria

- Matches HMRC examples for Class 2/4.
- Mobile-friendly, accessible.
- SEO page ranks for "self employed tax calculator UK".
