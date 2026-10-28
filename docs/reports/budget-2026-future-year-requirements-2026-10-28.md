# Budget 2026: future-year implementation requirements

Planning only, recorded on 28 October 2026. The content PR must not enable 2027–28 or change
calculations. `TaxYear`, `TAX_YEARS` and canonical records still end at 2026–27.

Use the [content verification report](budget-2026-content-verification-2026-10-28.md) for
independently checked official sources and announcement provenance. Reverify legislation and
final employer guidance in a separate implementation PR; Budget proposals are not final policy data.

## 2027–28 acceptance requirements

- Reconcile the full annual policy with HMRC's employer tables, Scottish Budget and Welsh
  decisions before adding any selectable year. Preserve canonical policy selection, pay-basis
  derivation, code-derived PAYE rules, shared deduction owners and independent fixtures.
- Savings: proposed UK rates 24/44/49% from 6 April 2027 require Finance Bill 2026–27.
  Property: the same proposed rates for England/Wales/Northern Ireland, with devolved checks.
  Preserve the separate income categories, band stacking and relief/allowance ordering enacted
  by Finance Act 2026. Check Budget 2026 OOTLAR 1.12 consequential amendments. Do not simply
  replace the employment rates or apply one rate to all non-employment income.
- Pension Tax Allowance: implement only after final legislation and eligibility rules are
  reconciled. Check the liability reduction, total-income test, withdrawal mechanics and
  interaction with PAYE/Simple Assessment for 2027–28 to 2029–30. It is separate from both the
  Personal Allowance and pension-contribution annual allowance. Cover qualifying, taper and
  non-qualifying cases independently; do not infer payroll collection from the policy summary.
- NI: OOTLAR 2.1 proposes LEL £133/week (£6,916/year), Small Profits Threshold £7,355/year,
  voluntary Class 2 £3.80/week and Class 3 £19.05/week through affirmative secondary legislation.
  Annex A independently confirms weekly values and the Small Profits Threshold. Retrieve final
  pay-period equivalents and employee/employer thresholds; do not derive payroll limits by
  dividing annual amounts. Rates/other thresholds being retained are not new Budget policies.
- Plan 2: retain the previously announced £29,385 threshold freeze for 2027–28 through 2029–30,
  subject to final student-loan regulations and HMRC employer tables. Do not imply all loan plans
  freeze. Obtain Plan 1/4/5/postgraduate values separately. An interest cap is not a payroll
  repayment rate or deduction cap; no interest model is introduced by this content work.
- Trading allowance: proposed £3,000 from 6 April 2027 is subject to the Finance Bill. It concerns
  gross receipts/alternative expense relief and reporting, not a PAYE salary allowance. Keep
  full Self Assessment outside the calculator unless separately scoped and supported.
- ISA changes are editorial/contextual requirements, not a new PAYE deduction. Track secondary
  legislation retaining the £20,000 cash limit and the Lifetime ISA withdrawal-charge change.
- Independently check benefit-in-kind values before implementation: OOTLAR 2.6 labels £30,200
  as the van charge and £4,310 as the car-fuel multiplier, whereas these appear inconsistent
  with the usual magnitudes. Do not copy those labels into policy automatically. Resolve
  against the final statutory instrument/employer tables; this explainer omits the disputed values.
- Benefits in kind: OOTLAR 1.24 and Treasury table 6.1 row 94 stage mandatory payrolling for
  cars, vans, fuel and medical benefits from 6 April 2027, with other benefits from 6 April 2028
  except employment-related loans and living accommodation. The Finance Bill route and final
  RTI/payroll guidance need review for Director Intelligence; do not infer a changed annual
  tax valuation merely from a changed collection method.

## Later years and release gates

The £2,000 salary-sacrifice NI cap is existing Budget 2025 policy with an enacted primary
framework, effective 6 April 2029. Final regulations must determine period treatment, earnings
bases, employer/employee NI and reporting. Keep Income Tax pension treatment separate. Do not
implement it in 2027–28 or describe it as new Budget 2026 policy.

Before any year is enabled: official-source reconciliation, independent boundary fixtures,
full `test:no-coverage`, golden-master browser regression, relevant content/metadata updates,
repository checks, production build and independent review. Enabling a future year and release
or deployment require a separately authorised change.
