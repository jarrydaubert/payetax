---
description: Verify tax policy and calculations against independent official evidence
argument-hint: [area or tax year]
---

# /finance - Tax Correctness Review

Read `AGENTS.md` first. Keep this review read-only unless implementation is explicitly requested. Report findings in chat and preserve relied-upon evidence according to the root contract.

## Establish The Scope

- Identify the shipped calculator or content being reviewed and its supported tax years. Do not assume a fixed current year or that future announcements are enacted policy.
- Record region, tax code, cumulative or non-cumulative basis, pay period, NI category, student-loan plan, pension method and other material assumptions.
- Check `src/constants/taxRates.ts` and the selected policy in `src/lib/tax/taxPolicy.ts`; follow the actual call path from `src/lib/taxCalculator.ts` or `src/lib/tax/directorCalculator.ts`.

## Independent Evidence

- Verify changing rules against current primary sources for the relevant year: [HMRC income tax](https://www.gov.uk/income-tax-rates), [HMRC NI](https://www.gov.uk/national-insurance-rates-letters), [Scottish Government](https://www.gov.scot/policies/taxes/income-tax/), and [student-loan employer guidance](https://www.gov.uk/guidance/special-rules-for-student-loans).
- Use official payroll tables or specifications for period thresholds, rounding and tax-code semantics. Do not substitute annual percentage arithmetic for payroll-period calculations.
- Derive expected values independently of production functions. Show inputs, source dates, formula, period basis, rounding and expected versus actual values for each discrepancy.
- Inspect the hand-derived suites under `src/test/payeVerificationFixtures/` and `src/lib/__tests__/taxCalculator.verification.test.ts`, plus relevant domain tests under `src/lib/tax/__tests__/`.
- Generated golden-master fixtures demonstrate regression consistency, not independent statutory correctness. Follow the root verification requirements if implementing a change.

## Risk-Based Cases

Choose relevant cases from allowance taper and band boundaries, Scottish and Welsh codes, flat-rate and K codes, emergency/non-cumulative basis, NI category and period thresholds, state-pension age, student-loan plan start dates and rounding, pension methods, salary sacrifice, and Director salary/dividend/corporation-tax interactions. Do not state fixed expected figures in this command; derive them for the selected policy and basis.

## Report

State the files and scenarios actually examined, commands run and results, official sources and access dates, discrepancies with mathematical proof and severity, and anything unverified. Separate implemented behaviour, statutory evidence and policy proposals. Do not claim HMRC compliance from passing tests alone.
