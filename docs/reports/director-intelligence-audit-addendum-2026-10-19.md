# Director Intelligence audit — verification addendum

19 October 2026 · Route: /tools/director-guide · Audited revision: 6412b6b935cc52aeb779837cdcbfc9b36ee7e7c2 (main)

This addendum extends the [18 October audit](director-intelligence-audit-2026-10-18.md). That report stays unchanged as dated evidence for F01–F18. The open actions remain in [BACKLOG.md](../BACKLOG.md#director-intelligence-audit-follow-up): DI-19–DI-27 are new, DI-07 and DI-11 have extended scope, and DI-14 has a measurement correction.

## Method and independence

- **Two audits.** The findings below came from two separate audits of the same baseline, run in isolated checkouts. One audit recorded its findings before reading PR #120 or PR #121 content; the other audit's additional claims were re-run against the baseline before inclusion. Neither audit's working notes are part of this repository.
- **Where expected values come from.** Each expected value is derived by hand from primary sources and elementary arithmetic. Production functions were called only to observe current behaviour. No golden master, canonical policy object or engine output was used as an expected answer.
- **Disclosure.** The original PR #121 commit's git author is `Codex <codex@localhost>`. Agreement between audits is not proof; the primary sources and arithmetic below decide.
- **Out of scope.** Application code, expected tax results and generated fixtures are unchanged.

## Reproduction

The engine observations below can be reproduced from the baseline with `bun`, importing from `src/lib/tax/strategyComparison.ts` and `src/lib/tax/directorCalculator.ts`. Use tax year `'2026-2027'`, region `'rUK'` and `includesVat: false` unless stated. All inputs are synthetic.

## New verified defects

### DI-19 — All Dividends spends more than the company has when a benefit in kind attracts Class 1A

| | |
| --- | --- |
| Input | `calculateStrategyComparison({ revenue: 100000, expenses: 20000, companyCarBIK: 10000 })` |
| Observed (`strategies.allDividends`) | Class 1A £1,500, Corporation Tax £17,450, dividends £62,550. Total outflow **£81,500** from an £80,000 pool. |
| Expected | Class 1A is 15% × £10,000 = £1,500. Class 1A is deductible in computing trading profits ([BIM42523](https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim42523)), so CT applies to £78,500: 25% × 78,500 − 3/200 × (250,000 − 78,500) = **£17,052.50**. Dividends = 78,500 − 17,052.50 = **£61,447.50**. Outflow is £80,000. |
| Source | `src/lib/tax/strategyComparison.ts:745-759`. CT uses gross profit before Class 1A, and dividends use `grossProfit - corporationTax`. |
| Existing tests | Check BIK income-tax direction, not budget conservation. |

### DI-20 — Personal Allowance lost on other income is omitted from the extraction's tax cost

| | |
| --- | --- |
| Input | `calculateStrategyComparison({ revenue: 40000, expenses: 0, otherIncome: 100000 })` (other income is non-dividend) |
| Observed | `allDividends`: dividends £32,400, income tax **£0**. A slider scenario at £12,570 salary reports income tax £5,028, which is the salary's own 40% only. |
| Expected | Dividends raise adjusted net income, which includes dividends ([adjusted net income](https://www.gov.uk/guidance/adjusted-net-income)), from £100,000 to £132,400. That removes the £12,570 allowance ([Income Tax rates and allowances](https://www.gov.uk/income-tax-rates)). Tax on the £100,000 of other income rises from £27,432 (7,540 + 49,730 × 40%) to £32,460 (7,540 + 62,300 × 40%). The extraction therefore adds **£5,028** that is omitted. |
| Source | `strategyComparison.ts:353-355, 453-455, 568-570, 764-769, 864-866`. All Dividends computes income tax only when a benefit in kind exists. The other paths subtract a baseline that already uses the reduced allowance, which cancels the increment. |
| Existing tests | Taper tests derive expectations from the shared helper and do not pin this interaction. |

### DI-21 — Employment Allowance affordability and minimum-salary constraints are not honoured

| | |
| --- | --- |
| Input A | `calculateStrategyComparison({ revenue: 100000, expenses: 20000, employmentAllowance: true })`, then `calculateSalaryScenario` with that All Salary salary as target |
| Observed A | All Salary £79,347. The same target in the slider path becomes **£70,217.39 salary + £7,923.91 dividends**. |
| Expected A | With an eligible £10,500 allowance: employer NI = 15% × (79,347 − 5,000) − 10,500 = £652.05. Total cost is £79,999.05, which is within £80,000, so £79,347 is affordable. |
| Input B | `calculateStrategyComparison({ revenue: 200000, expenses: 0, minimumSalaryRequirement: 60000 })` |
| Observed B | Baseline Mix salary **£50,270**. |
| Expected B | £60,000 + 15% × 55,000 = £68,250, which fits within £200,000. A feasible user minimum must be honoured, or the result must explain why it is not. |
| Source | `strategyComparison.ts:305-318` (EA-aware all-salary), `:414-422` and `:528-532` (EA-unaware affordability cap), `:611-622` (search bound replaces the minimum). EA eligibility stays user-declared ([single-director EA guidance](https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/single-director-companies-and-employment-allowance-further-employer-guidance)). |

### DI-22 — Unrendered legacy Director route returns negative dividends

| | |
| --- | --- |
| Input | `calculateDirectorScenario({ revenue: 13000, expenses: 0, alreadyTaken: 0, alreadyTakenViaPayroll: null, confirmedSoleIncome: true })` |
| Observed | Salary £12,570, employer NI £1,135.50, dividends **−£705.50**. |
| Expected | Dividends cannot be negative. 13,000 − 12,570 − 1,135.50 < 0, so no dividend is available. |
| Source | `src/lib/tax/directorCalculator.ts:222-235`. The store computes this result (`src/store/directorGuideStore.ts:687`), but no mounted component renders it. The UI uses `strategyComparison`. |
| Note | Visible exposure is low. The larger risk is a second Director calculation route that has its own tests, contrary to the Foundation principle of one supported route to each statutory calculation. |

### DI-23 — Section 455 warning states a superseded rate

| | |
| --- | --- |
| Observed | The Learn panel says S455 is charged "at 33.75%" (`src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx:401`). The current year is 2026-27. |
| Expected | [CTM61505](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505): 33.75% for loans made 6 April 2022 to 5 April 2026, and **35.75% for loans made on or after 6 April 2026**. |

### DI-24 — "Your Setup" ignores the other-PAYE National Insurance basis used by every other path

| | |
| --- | --- |
| Input | `calculateStrategyComparison({ revenue: 80000, expenses: 10000, otherIncome: 30000, hasOtherPAYEEmployment: true, yourSetupSalary: 12570, yourSetupDividends: 0 })` |
| Observed | Your Setup employee NI £0. The slider path at the same £12,570 salary reports £1,005.60. |
| Source | `strategyComparison.ts:853` calls `getEmployeeNI(salary, taxYear)` without the flag, while `:343`, `:441` and `:556` apply it. |
| Note | The £0 happens to match the statutory separate-employer result (DI-08), but the comparison delta is computed against a different basis. Correct both in one owner. |

### DI-25 — Student loan collected by another employer is deducted again from director take-home

| | |
| --- | --- |
| Input | `calculateSalaryScenario({ targetSalary: 12570, grossProfit: 60000, otherIncome: 40000, hasEmploymentAllowance: false, studentLoanPlans: ['plan2'] })`, compared with `otherIncome: 0` |
| Observed | Student loan £5,461.52 with other income, against £1,861.52 without. The whole repayment is deducted from director take-home. |
| Expected | Plan 2 at 9% over £29,385 ([repayment thresholds](https://www.gov.uk/repaying-your-student-loan/what-you-pay)). The other employer's PAYE already collects about 9% × (40,000 − 29,385) = **£955.35**. Income tax is attributed marginally, so the extraction's attributable repayment is £5,461.52 − £955.35 = **£4,506.17**. |
| Source | `strategyComparison.ts:362, 462, 577, 776, 881` apply `getStudentLoanRepayment(totalIncome, …)`, including other income. |

## Corporation Tax deadline arithmetic (extends DI-07)

[HMRC CTM01800](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm01800): "Where the accounting period ends on the last day of a calendar month, the normal due date is the first day of the tenth month."

`KeyDates.tsx:58-59` adds nine months and then one day. Applying that arithmetic to every 2026 month-end gives **7 of 12 wrong**:

| Year end (2026) | Component arithmetic | HMRC | Direction |
| --- | --- | --- | --- |
| 28 Feb | 29 Nov | 1 Dec | early |
| 30 Apr | 31 Jan | 1 Feb | early |
| 31 May | 4 Mar | 1 Mar | **late** |
| 30 Jun | 31 Mar | 1 Apr | early |
| 31 Jul | 2 May | 1 May | **late** |
| 30 Nov | 31 Aug | 1 Sep | early |
| 31 Dec | 2 Oct | 1 Oct | **late** (browser-confirmed) |

31 Jan, 31 Mar, 31 Aug, 30 Sep and 31 Oct are correct. The presets expose 31 March (correct) and 31 December (late). The custom `MM-DD` field reaches the rest. Invalid input such as `02-31` silently becomes 3 March (`KeyDates.tsx:43-45`). The component moves a past year end forward a year (`KeyDates.tsx:53-55`), so the displayed date depends on the current date and leap years. For example, on 19 October 2026 a 31 May year end is treated as 31 May 2027, and the app shows 3 March 2028.

CTM01800 also covers year ends that are not the last day of a month. The due date is the day after the matching day in the ninth following month. If that month has no matching day, it is the first day of the tenth month. For example, a 30 May year end is due 1 March; the component gives 3 March in a non-leap year.

## Workspace width at 1024px (corrects DI-14)

Chromium at a 1024 × 900 viewport, with £100,000 revenue and £20,000 expenses entered, and the inputs and Learn panels both open. Measured after the panel transition finished, the recommendation hero's bounding width was 297px (content `clientWidth` 295px, `scrollWidth` 312px). The "total tax to set aside" and "vs all salary" figures visibly overlapped, and there was no document-level horizontal overflow. The 18 October audit reported a 360px workspace. The defect holds in every run; only the width varies, with scrollbar and transition timing.

## Findings incorporated from PR #120

PR #120 remains open and unchanged. These of its findings were re-verified independently, using different synthetic inputs, before inclusion:

- **DI-26 — empty-state contract mismatch.** The empty state asks for "company profit" and then "expenses" (`src/components/organisms/DirectorGuide/DirectorDashboard.tsx:417, 424, 428`). The fields are Annual Revenue and Business Expenses, so following the instructions can deduct expenses twice.
- **DI-27 — amounts already paid do not constrain annual strategies.** `calculateStrategyComparison({ revenue: 100000, expenses: 20000 })` returns identical strategies with and without `ytdSalary: 20000, ytdDividends: 5000`. Baseline Mix salary stays £12,570, below the £20,000 already paid. YTD values only feed `alreadyTaken` and `availableForExtraction` (`strategyComparison.ts:192-220`).
- **Employment Allowance wording** (folded into DI-11). The live tooltip says the allowance is "Not available if you're the only director/employee in most cases" (`src/config/inputTooltips.ts:226`). HMRC's test is narrower: a company is ineligible where the sole director is the only employee liable for secondary Class 1. An extra employee paid below the Secondary Threshold does not make it eligible.
- **NI-record wording** is already covered by DI-11.

**Figure provenance.** PR #120's vision uses specific company-like figures. None is reused or quoted here; their provenance should be confirmed before that PR merges.

## Priority reconciliation

[PROJECT_STATE.md](../PROJECT_STATE.md#where-to-resume) keeps the Foundation order: pension method, then transparent result, then fixture portfolio.

Some defects silently alter inputs, or show wrong money figures, deadlines or statutory rates. These are classed as **urgent correctness exceptions** under the backlog's first working rule:

- DI-01–DI-04, DI-07 and DI-08;
- DI-19, DI-20, DI-21 and DI-23–DI-25.

Each may be taken as a small independent slice between Foundation items. None reorders them. Any exception that needs a Foundation change waits for, or is folded into, that item. DI-08, DI-20, DI-24 and DI-25 share the same income-attribution code in `strategyComparison.ts` and should be designed together with independent fixtures.

DI-15, DI-17 and DI-18 are design and refactoring proposals rather than defects, so they move to Parked.

## Limitations

- **Statutory scope.** Expected values cover rUK, 2026-27 and full-year Category A directors. Scottish rates, other supported years and part-year appointments were not exhaustively derived.
- **Environment.** Verification ran on Windows. The repository's exact `check:repo` gate passes on an LF checkout. Five `NODE_ENV`-toggling Jest tests fail on win32; none is a Director suite. The [CI run on this SHA](https://github.com/jarrydaubert/payetax/actions/runs/34275968746/job/102228922400), which includes the unit tests, passed on Linux.
- **Browser coverage.** WebKit, physical devices and screen readers were not exercised for this addendum.
