# Tax-code correctness follow-up — 2026-08-23

## Purpose

This report preserves and independently checks the post-merge review findings raised after PR
#111 (`e64516df97907deadb9a360fa7ce0bd402fb282e`). The review is treated as a set of
claims to reproduce, not as an authority. Behaviour changes in the follow-up are limited to
findings supported by current HMRC primary material and current-code reproduction.

## Primary evidence

- [HMRC Specification for PAYE Tax Table Routines v24.0 (February 2026)](https://assets.publishing.service.gov.uk/media/698c9824bd090be481c2879a/PAYErout-v24-0.odt), especially paragraphs 2.1–2.2, 3.3.2, 4.3.1–4.3.4, 6.4, 8.1–8.3 and Appendices A–C.
- [HMRC payroll technical specifications: Income Tax](https://www.gov.uk/government/publications/payroll-technical-specifications-income-tax), the publication page for v24.0.
- [GOV.UK: what the numbers and letters in a tax code mean](https://www.gov.uk/tax-codes/what-your-tax-code-means).
- [GOV.UK: Income Tax rates and Personal Allowances](https://www.gov.uk/income-tax-rates), including the adjusted-net-income taper and Blind Person’s Allowance.
- [HMRC PAYE11015: special types of code](https://www.gov.uk/hmrc-internal-manuals/paye-manual/paye11015), including K-code range and current code descriptions.
- [HMRC PAYE11050: rules for working out codes](https://www.gov.uk/hmrc-internal-manuals/paye-manual/paye11050), including coding allowances, deductions and operational long-code guidance.
- [GOV.UK: K in your tax code](https://www.gov.uk/tax-codes/k-in-your-tax-code).

## Reproduction summary

All monetary reproductions use tax year 2026/27, annual salary input and no pension unless stated.

| Review finding | Result | Reproduction and official evidence | Final disposition |
| --- | --- | --- | --- |
| Blank-code and explicit `1257L` high-income behaviour differ | **CONFIRMED** | At £110,000, blank input derives £7,570 and £33,427.20 Income Tax; explicit `1257L` uses £12,570 and £31,425.60. GOV.UK says HMRC works an individual code from allowances and coding deductions; v24.0 then operates the numeric code supplied to payroll. | Preserve explicit-code ownership, but disclose the calculation basis and warn when it materially differs from the policy-only amount derived from entered facts. |
| PayeTax should not apply its PA taper again to an explicit code | **DESIGN DECISION** | An explicit code is source-specific HMRC PAYE coding. Applying PayeTax’s allowance taper, Blind Person’s Allowance or Marriage Allowance on top would second-guess or double-count HMRC coding. `1257L` may still be stale or inconsistent with entered facts, so ownership does not make it a final annual assessment. | A valid supplied code owns coding adjustments. Policy-derived allowance logic runs independently for comparison and warnings, not as a second adjustment to the code. |
| PR #111 restored taper coverage by changing `1257L` to `757T` / `0T` | **REJECTED** | Those cases verify explicit code amounts, not PayeTax’s own taper branch. The independent 2026/27 baseline had no blank-code high-income fixture after PR #111, and golden scenarios named as taper scenarios supplied explicit codes. | Add hand-derived blank-code taper fixtures and make golden scenario inputs/names cover the behaviour they claim. Never change independent fixtures merely to bypass production semantics. |
| Numeric codes are limited to five digits | **CONFIRMED DEFECT** | v24.0 paragraph 3.3.2 tells developers to allow tax codes up to seven characters and gives `999999T` as its example. PR #111 accepts at most five numeric digits and rejects that required form. PAYE11050 contains narrower operational wording, but it does not override the current payroll-software specification’s explicit example. | Accept required base-code forms up to seven characters, including `999999T`; apply the same total-length limit to S/C-prefixed suffix codes. Remove the five-digit rule and “unusually long” warning for supported forms. |
| Blank and explicit `1257L` use inconsistent period-free-pay bases | **CONFIRMED** | At £30,000, blank uses £1,048 Month 1 free pay and £3,484.80 tax; explicit `1257L` uses Tables A £1,048.26 and £3,482.40. v24.0 paragraph 4.3.1 prescribes the same Tables A code-number calculation for suffix-code free pay. | Use the Tables A basis for policy-derived and explicit numeric-code calculations. A derived annual amount is translated to the corresponding code number by dropping its final digit, matching GOV.UK’s code construction, before applying Tables A. |
| Positive derived amounts below £10 become code 0 | **CONFIRMED DEFECT** | A fresh-context review reproduced `getMonthlyTaxCodeFreePay(9)` as £0. v24.0 paragraph 4.3.1 assigns every positive annual allowance from £1 to £19 to code 1; only an allowance of nil maps to code 0. | Map every positive amount from £1 to £19 to code 1 and independently assert the £1, £9, £10, £19 and £20 boundaries. |
| HMRC “reserves D4–D8” | **CONFIRMED DEFECT** | Neither v24.0 nor the public code table uses “reserved”. v24.0 maps SD0 upward only as far as the current Scottish rate sequence permits; with 2026/27 parameters that is SD0–SD3. PAYE11015 discusses other D-code numbers but does not establish a current rate for SD4–SD8. | Reject SD4–SD8 with the evidence-backed statement that they do not correspond to a current 2026/27 Scottish rate in HMRC v24.0. |
| Maximum K-code range may be too narrow | **REJECTED** | PAYE11015 explicitly describes K codes as K followed by a number from 1 to 9999. The general seven-character software field size is not evidence that HMRC issues larger K numbers. | Retain K1–K9999 (and S/C-prefixed equivalents); retain rejection of K0 and K10000. Cite the specific K-code source in fixtures. |
| Calculator and email treat partial/invalid codes differently | **DESIGN DECISION** | The interactive calculator must permit partial edit states. On calculation it visibly falls back for an invalid completed value; email validation rejects an invalid non-empty code so a sent result cannot silently recalculate from malformed input. | Retain the split. Correct calculator fallback wording to identify the policy-derived fallback basis, and keep email rejection tests. |
| Emailed results omit the selected tax-code basis | **CONFIRMED DEFECT** | The results email accepted a completed `TaxCalculationResults` object but did not render its new basis metadata. A user could therefore leave the visible result and lose the explicit-code divergence, fallback and Tables A disclosures. | Give the on-page notice and text/HTML email one shared basis presenter, with blank, explicit and invalid-fallback email tests. |
| Every checked marriage answer is described as an ignored adjustment under an explicit code | **CONFIRMED DEFECT** | A £60,000 user with a £8,000-earning partner is not eligible for the policy-derived Marriage Allowance addition, but the initial metadata called the checked answer an ignored allowance adjustment. | Track whether the policy calculation actually included Marriage Allowance and disclose it as ignored only when it was eligible and deliberately not added to the explicit code. |
| Annual code amount and Tables A period free pay are insufficiently distinguished | **CONFIRMED** | The results row says “Tax-Free Allowance” while an explicit code is a source-specific coding amount. Period columns can differ from annual amount divided by 12 because v24.0 adds the £9 code range and applies Tables A rounding. | Use basis-aware result labels and explain that annual code amounts are the public code interpretation while period values use Tables A. |

## Detailed pre-fix reproduction

The following table records the merged-PR-#111 baseline before this follow-up changed the
calculation basis. It is retained as evidence of the reproduced discrepancy, not as a statement
of the final implementation.

| Input | Current annual tax-free amount | Current Month 1 free pay | Current Income Tax |
| --- | ---: | ---: | ---: |
| £30,000, blank code | £12,570 | £1,048.00 | £3,484.80 |
| £30,000, `1257L` | £12,570 | £1,048.26 | £3,482.40 |
| £110,000, blank code | £7,570 | £631.00 | £33,427.20 |
| £110,000, `1257L` | £12,570 | £1,048.26 | £31,425.60 |
| £110,000, `757T` | £7,570 | £631.59 | £33,427.20 |
| £125,140, blank code | £0 | £0 | £42,513.60 |
| £125,140, `1257L` | £12,570 | £1,048.26 | £37,483.20 |
| £125,140, `0T` | £0 | £0 | £42,513.60 |

At £30,000, a blank code plus the Blind Person control currently gives £15,820; explicit
`1257L` plus that control gives £12,570 because the separate control is ignored. A blank code
plus eligible Marriage Allowance answers gives £13,830; explicit `1257L` remains £12,570.
Ignoring the controls for a valid explicit code is correct only when the UI makes that ownership
and the ignored inputs clear.

## Verified-correct PR #111 work retained

- Tables A `+£9`, quotient/remainder and rounded block mechanics.
- K-code additional pay, whole-pound taxable-pay flooring and the 50% overriding limit.
- Current SD0–SD3 mappings.
- `W1`, `M1`, `X` and `NONCUM` parsing and non-cumulative caveat.
- M/N semantics: the numeric code already reflects HMRC’s coding calculation.
- Region-aware S/C handling and the unsupported calculator-prefill removal.

## Implemented validated corrections

1. Make the tax-code parser implement v24.0’s seven-character base-code requirement while
   retaining PAYE11015’s K1–K9999 range.
2. Use Tables A for both explicit numeric codes and policy-derived estimated code amounts.
3. Calculate the policy-only allowance independently even when a valid code is supplied, expose
   the selected basis in results, and warn on divergence or ignored allowance controls.
4. Restore independent blank-code PA taper fixtures and honest browser scenario names.
5. Replace the unsupported “reserved” wording for SD4–SD8.
6. Distinguish annual code/estimated amounts from Tables A period free pay in visible results.
7. Apply v24.0’s code-1 rule for every positive derived amount from £1 to £19.
8. Share the tax-code basis explanation between the visible result and text/HTML result emails.
9. Report only eligible policy adjustments as deliberately ignored under an explicit code.

## Final verification

The first fresh-context correctness/maintainability review confirmed the seven-character,
S/C-prefix and K-code boundaries, and raised the three additional defects recorded above:
code-1’s £1–£19 range, missing email disclosure, and ineligible Marriage Allowance disclosure.
All three were fixed on the same branch. The reviewer then rechecked the fixes read-only and
reported no remaining actionable findings; its targeted run passed 155 tests plus application
and test TypeScript checks.

Repository verification completed on 23 August 2026:

- `git diff --check`: passed.
- `bun run check:repo`: passed, including lint, application/test TypeScript, repository contracts,
  tax-fact inventory, current-guidance guards and rate freshness.
- `bun run test:no-coverage`: 233 suites and 3,849 tests passed.
- `bun run build:ci`: passed; 63 static pages generated.
- `CI=1 bun run test:e2e:golden`: all 20 HMRC-sourced browser scenarios passed, including the
  restored blank-code taper cases.
- `CI=1 bun run test:e2e:smoke`: all 20 smoke tests passed.
- `bun run audit:deps` and `bun audit`: no advisories or vulnerabilities.

Manual browser checks also reproduced the visible basis disclosure for blank and explicit codes,
the policy comparison at £110,000, the seven-character `999999T` acceptance boundary and the
S-prefixed length rejection. The decoder remained usable at a mobile viewport. The earlier
search-discoverability evidence report was preserved unchanged.
