# Director Results email inspection and active-export assessment

27 October 2026. Follow-up to PR #139 at `1a5f8b6e`, on the same branch and original
`main` base `6e2a4c8b`. The [interim safeguard report](di05-interim-email-safeguard-2026-10-27.md)
records its earlier implementation and verification. This addition inspects the
actual payload, server orchestration and both rendered formats. No real email,
merge or deployment was invoked. Fixtures contain synthetic figures and addresses.

## Recommendation

**A bounded annual active-scenario export is reasonably small at the calculation
level, and is preferable to permanent disabling of custom scenarios. It is not a
safe drop-in replacement obtained by forwarding the current salary alone. Keep the
interim guard in this PR; scope the annual exporter as a separate DI-05 slice with
an explicit snapshot/report contract. Do not wait for a visual email redesign to
make that improvement, but retain the agreed DI-02/04 dependency decisions.**

A local prototype using the existing `calculateStrategyComparison()` and
`calculateSalaryScenario()` reproduced all 14 active financial fields exactly in
all 18 non-survival audit cases, including salary/profit adjustments and card
selection via its effective slider salary. The monthly case proves only the
annualized financial figures, not its cash-aware draw. Survival has no active pay
strategy to reproduce. No new statutory calculator is necessary. This is cross-route
parity evidence, not independent
proof of tax correctness or a production-ready implementation.

The additional work is a small multi-module feature rather than a full redesign:

1. Extend the validated request with bounded primitive scenario controls and source
   metadata: original inputs, effective profit adjustment, effective slider salary
   or exact named-strategy source, and objective. Do not send trusted tax totals.
2. Extract the existing active-scenario resolution into one pure function used by
   the display and server. Preserve pension normalization, losses, BIK, associated
   companies, other PAYE/income and loan inputs; do not recreate the mechanics.
3. Report **current scenario** separately from **reference recommendation** and
   **original company inputs**. A selected card may disagree with the effective
   slider today, so exporting its name alone is unsafe. Both HTML and text need
   truthful labels. Recompute savings from the exported scenario, allowing negative
   deltas; do not retain the original recommendation's savings.
4. Retain the current-validity and same-task-submit protection. Add exact payload →
   server → HTML/text parity tests and browser tests before allowing those annual
   controls. Make the limited annual scope explicit.

The next exporter's tests must also cover an exact named strategy with a null
slider after recalculation. The 19-case prototype exercised the mounted salary
route (including card clicks that set salary), not that separate named-result path.

This touches producer/schema, shared resolver/display consumer, delivery, both
formatters and tests. The prototype proves arithmetic reuse; it does not validate
an extended public request contract, arbitrary boundaries or mail-client behaviour.
Monthly mode remains a separate problem: its cash-aware draw and some detail cards
use different financial bases (DI-03/06). An annual-result export alone cannot claim
to export that complete screen correctly. Survival, accounting dates and objective
reference consistency also need explicit semantics, not just extra request fields.
No such exporter or snapshot redesign is implemented here.

The audit-only prototype resolved simulated profit as
`roundToPence(max(0, originalComparison.grossProfit * (1 + percent / 100)))`, then
called `calculateStrategyComparison({...input, revenue: simulatedProfit,
expenses: 0, includesVat: false}, taxYear)` when the percentage was nonzero.
Otherwise it used the submitted inputs unchanged. For the mounted cases' effective
slider salary it then called `calculateSalaryScenario` with that salary, the
resolved comparison's `grossProfitAfterPension`, and the submitted region,
other-income, EA, loans, normalized pension, BIK, associated-company, other-PAYE,
loss and minimum-salary parameters. It compared each of the display's 14 fields,
not just take-home. This describes the experiment sufficiently to re-run it using
the committed synthetic cases; that duplicated mapping is a probe, not a second
production calculator or the proposed shared implementation.

## Method and actual data path

`directorResultsEmail.audit.test.tsx` mounts the real dashboard payload producer and
real active-scenario/eligibility hooks for 19 cases. Layout/interactive children and
the email dialog are replaced to capture its actual `emailInput`; this deliberately
avoids claiming those component tests exercise slider DOM events. Existing mocked
browser tests exercise those controls and show blocked cases send no requests.

Each captured input is JSON-round-tripped and parsed by the exact request schema,
then passed through the real `sendDirectorResultsEmail()` and HTML/text functions.
Only `sendOutboundEmail()` is stubbed. Blocked cases are **counterfactual server
inspections** of the old export, not submissions allowed by this PR. A separate
Node test invokes the real POST route, validation, delivery orchestration and both
templates while stubbing rate-limit/operational integrations and the provider;
`fetch` is asserted unused. No Brevo key is needed, inspected or configured.

The request is `{ email, input, taxYear }`. The baseline serializes 20 input keys:
`mode`, `region`, `revenue`, `includesVat`, `expenses`, `lossesBroughtForward`,
`otherIncome`, `employmentAllowance`, `studentLoanPlans`, `pensionContribution`,
`companyCarBIK`, `associatedCompaniesCount`, `hasOtherPAYEEmployment`, `ytdSalary`,
`ytdDividends`, `ytdDrawings`, `contractStartMonth`, `cashInBank`,
`minimumMonthlyDraw`, `runwayMonths`. Optional salary minimum, Your Setup salary/
dividends and monthly income/expenses are also sent when defined. `undefined`
properties are omitted by JSON. `hasEmploymentAllowance` is renamed; a pension
already deducted from expenses becomes `pensionContribution: 0`.

Absent: profit what-if, effective salary slider, selected strategy, objective,
year-end month/custom date, original-vs-simulated basis and client tax totals.
Monthly revenue/expenses are resolved projections, with the monthly input fields
also transmitted. The server nevertheless calls only `calculateStrategyComparison`
and selects `comparison.recommended`; it does not calculate the cash-aware draw.
Monthly cash/runway settings, mode and start month do not influence that function.
It passes only gross profit, three named results, recommendation, savings and tax
year to the templates. Your Setup and YTD/available-extraction metadata are dropped.

The reviewed provider adapter maps the message to Brevo's `sender`, `to` recipient
array, `subject`, `htmlContent` and `textContent`, then POSTs to its transactional
email endpoint. Audit capture stops before that adapter/network boundary; it is
not a delivered MIME message or a provider-rendering test. Existing adapter tests
cover the generic envelope separately. No attachments are constructed.

A direct schema probe also confirmed that hypothetical `targetSalary`,
`profitWhatIfPercent`, `selectedStrategy` and `objective` keys added only inside
`input` are stripped. Sending extra client fields without updating validation and
server resolution would still export the original recommendation.

## Representative results

All cases use 2026/27. Unless stated otherwise: rUK, annual revenue £100,000,
expenses £20,000, initial Baseline Mix salary, no other adjustments. These are
observed production-engine figures for parity, **not independently derived tax
fixtures**. Screen cards often round to pounds; the underlying display and both
email formats retain the same result with email amounts shown to two decimals.

| Case / change | Active annual take-home | Old email annual take-home | Current guard |
| --- | ---: | ---: | --- |
| Baseline | £55,764.88 | £55,764.88 | Allows |
| Salary what-if £20,000 | £55,221.94 | £55,764.88 | Blocks |
| Profit what-if +25% | £65,209.63 | £55,764.88 | Blocks |
| Select All Dividends / salary £0 | £54,160.90 | £55,764.88 | Blocks |
| Minimize NI objective | £55,764.88 | £55,764.88 | Blocks missing objective/reference context |
| Minimum salary £20,000 | £55,221.94 | £55,221.94 | Allows; reserve corrected below |
| Scotland, minimum salary £20,000 | £55,261.61 | £55,261.61 | Allows; explanatory rates defect below |
| Employer pension £6,000, Plan 2 + postgraduate | £47,740.63 | £47,740.63 | Allows |
| £6,000 pension already in expenses | £55,764.88 | £55,764.88 | Allows; normalized additional pension is £0 |
| BIK £5,000 + brought-forward losses £10,000 | £54,863.32 | £54,863.32 | Allows |
| VAT-inclusive flag enabled | £55,764.88 | £55,764.88 | Allows; existing model intentionally does not strip VAT |
| Other income £120,000 | £39,194.22 | £39,194.22 | Allows; missing income/allowance context |
| Employment Allowance, initial mixed selection | £56,301.10 | £56,578.66 (All Salary) | Blocks |
| Revenue £300,000, four associated companies | £141,644.41 | £141,644.41 | Allows |
| YTD salary/dividends/drawings £35,000 total; Your Setup entered | £55,764.88 | £55,764.88 | Allows; YTD/Your Setup context omitted |
| Custom company year-end 30 June | £55,764.88 | £55,764.88 | Allows; company dates not promised |
| Monthly £12,000 income, £2,000 costs, October start | £46,091.20 | £46,091.20 | Blocks: £2,000 cash-aware draw vs £3,840.93 email monthly amount |
| Revenue £10,000, expenses £20,000 | No active pay strategy | £0 with −£10,000 gross profit | Blocks survival report mismatch |
| Revenue £10m, zero expenses, initial mixed selection | £4,563,029.41 | £4,620,827.52 (All Salary) | Blocks |

Baseline email details are salary £12,570.00, dividends £52,476.46, pension £0,
Income Tax £0, employee NI £0, dividend tax £9,281.58, Student Loan £0,
Corporation Tax £13,818.04 and employer NI £1,135.50. Subject embeds £55,764.88.
The annualized monthly amount is £4,647.07. Company reserve is £14,953.54 and
personal reserve £9,281.58. The plain-text company-cost field is £27,523.54.

The candidate probe also shows why changing only salary is insufficient: the
£20,000 salary case needs savings of £3,938.68, not the original £4,481.62. The
Employment Allowance active mixed scenario is **£277.56 worse** than All Salary;
the current recommendation email says £0 savings. Its heading cannot remain
“Recommended Strategy” if exporting that active choice.

## What the two formats contain

| Content | HTML | Plain text |
| --- | --- | --- |
| Strategy name, tax year, salary/dividends/pension, take-home | Yes | Yes |
| Monthly amount | Annual take-home ÷ 12, plus effective rate | Annual take-home ÷ 12; no effective rate |
| Gross profit and savings vs All Salary | Yes | Yes |
| Individual Income Tax / employee NI / dividend tax / loan / employer NI | Aggregated into personal tax; no individual rows | Each has an annual row |
| Corporation Tax | Own row | Own row |
| Company and personal reserve pots | Yes | No |
| Company cost | No | Yes, without its model definition |
| Dates | Generic tax-year Self Assessment deadline only | None |
| Generated date | Yes | No |
| Rates/explanations | rUK allowance/band limits, dividend allowance, CT 19%/25% | No rate table |
| Region, complete inputs, assumptions, YTD, warnings, Your Setup or alternatives | No | No |
| Recalculate link and disclaimer | Yes; plus privacy/site links | Recalculate link and disclaimer |

There are no company year-end, CT-payment or CT-return dates, ICS/PDF attachments
or complete comparison alternatives. The generic HTML date is `31 January 2028`
for 2026/27, independent of company year-end. Thus “no dates at all” would be
incorrect; the unsupported promise was company/key-date coverage across the report.
The already-corrected dialog now accurately says company key dates are excluded.

## Findings and disposition

1. **Fixed — personal reserve disagreed with the displayed reserve.** HTML used
   `totalPersonalTax`, including payroll employee NI. The screen's Personal Tax Pot
   uses Income Tax + dividend tax + Student Loan. At minimum salary £20,000, email
   previously said £10,974.31 against the displayed pot's £10,379.91 annual basis
   (shown as a rounded £865 monthly budget): a £594.40 difference.
   The one-line HTML correction uses the same reserve components. Overall personal
   deductions and take-home still include employee NI; plaintext retains its NI
   row. This is display/export parity, not a claim that the pot equals an HMRC bill.
2. **Documented, deferred — misleading Scottish/high-income explanations.** The
   HTML's “Rates used” panel always uses rUK £50,270/£125,140 limits and displays
   £12,570 as Personal Allowance without taper qualification. Scottish salary tax
   uses different bands; other-income £120,000 changes the relevant allowance.
   Numeric parity is not an explanation audit pass. Income Tax and dividend tax
   percentages, NI/loan rules and regional identity are absent. Fix with the later
   export/explanation contract rather than copying policy tables into this PR.
3. **Documented, deferred — incomplete reproduction/assumptions.** Region, original
   revenue/expenses, other income, EA, loans/thresholds, BIK, losses, associated
   companies and pension method/status are not recorded. Included loan amounts do
   not identify the plans. Pension already in expenses displays £0 additional
   contribution without that qualification. VAT is a warning-only flag in this
   model. In the pension/loan case the 35.5% effective rate uses post-pension profit
   (£74,000), while the visible gross-profit card is £80,000; the basis is unstated.
4. **Documented, deferred — HTML/plain-text differences affect usefulness.** HTML
   has the date, reserve pots and rates panel but lacks the individual deductions
   that plain text contains. The dialog/CTA's broad detailed-report wording exceeds
   a full audited accountant-ready record. The text's “Total Company Cost” is the
   model's salary + employer NI + CT, excluding dividends and pension; its scope
   is not explained. “COMPARISON BREAKDOWN” contains only one strategy.
5. **Documented, deferred — reserve/deadline context is insufficient.** The HTML
   places illustrative reserves beside a generic January deadline without the
   screen's “not HMRC payment amounts” caveat. It does not distinguish payroll
   deductions from remaining Self Assessment liability or payments on account.
   Year-end settings and actual payment history are absent. No deadline arithmetic
   or reserve-model redesign was attempted (existing DI-07/16/26 owners apply).
   The corrected minimum-salary report now has £10,974.31 “Personal tax” but a
   £10,379.91 “Personal tax pot”; explaining the payroll-NI difference remains part
   of that context work rather than being silently treated as understood.
6. **Documented, deferred — YTD and comparison context disappear.** The £35,000
   YTD case still exports the same annual strategy and £80,000 gross profit, not
   the £45,000 available-extraction metadata or the entered Your Setup. These fields
   are received/calculated but not shown. They must not be described as a remaining
   cash withdrawal recommendation. Existing model issues retain their backlog owners.
7. **Documented, deferred — narrow-screen large-number overflow.** Browser rendering
   of the allowed £10m input's counterfactual HTML at 320 CSS px needed 354 px.
   The large annual amount/table minimum width drives overflow. Ordinary baseline,
   Scottish, pension/loans and minimum-salary HTML at 390 px fit; desktop at 760 px
   fits. No CSS/restyle change is included.
8. **Verified limits.** The recalculation links open the calculator, without embedding
   the missing inputs or guaranteeing reconstruction in another browser. HTML has
   inline styles, presentational outer tables, a responsive stack, text-only branding
   and readable ordinary figures. Individual data tables have limited structural
   headers; screen-reader and actual Gmail/Outlook/Apple Mail rendering, dark mode,
   font substitution, delivery and accessibility compliance are unverified. Browser
   screenshots are not evidence of those email clients.

Primary checks for the explanatory findings, accessed 27 October 2026:
[Scottish rates](https://www.gov.uk/scottish-income-tax),
[standard allowance/taper and rUK bands](https://www.gov.uk/income-tax-rates),
[Corporation Tax rates](https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax),
[marginal relief/associated companies](https://www.gov.uk/guidance/corporation-tax-marginal-relief),
[Self Assessment deadlines](https://www.gov.uk/self-assessment-tax-returns/deadlines),
[payments on account](https://www.gov.uk/understand-self-assessment-bill/payments-on-account).
This is targeted verification of template explanations, not a fresh statutory
audit of every Director calculation. Existing independent fixtures remain the
correctness oracle; the new audit fixtures explicitly test parity.

## Validation and artifacts

Local verification after the reserve correction and added tests:

| Command | Result |
| --- | --- |
| `bun run test:no-coverage --runInBand --testPathPatterns=directorResultsEmail` | Passed: 3 suites / 25 tests (19 matrix cases, 1 route integration, 4 existing template tests and a standalone reserve regression with hand-summed synthetic amounts). |
| `bun run test:no-coverage --runInBand` | Passed: 253 suites / 4,488 tests, including the existing guard, dialog, UI and independent PAYE coverage. |
| `bun run check:repo` | Passed, including production/test types, lint and domain/policy controls; no new tax-fact findings. |
| `bun run build:ci` | Passed. Existing Next/Sentry deprecation and unchanged-release-version notices remain. |

Independent Claude Opus 5.5 review returned **APPROVE**. It read the source, audit
cases, captured outputs and prototype but ran no commands/tests/builds, did not
view screenshots or independently recalculate artifact hashes, and did not certify
real email clients or statutory correctness. This is local external-model review,
not a formal GitHub review of the eventual commit.

Its evidence clarifications were applied: final verification results replace the
draft placeholder; “named selection” is qualified as card selection through salary;
the unprobed null-slider named branch is identified above; monthly parity is clearly
annual-only; the prototype source now has a fingerprint; and the different personal
tax vs reserve rows are explained as a documented omission. Its optional request
for an isolated reserve regression was also implemented without the dashboard mocks.
Review-result JSON SHA-256:
`79600A3235181CBD320A2CA4D1E8D5A1C3519341C98C67295EB84AC2C5C2FCBB`.

HTML captured from the stubbed production delivery was opened with Playwright
`setContent`, with no remote resources or email requests. Inspected full-page PNGs
cover baseline 760/390 px, Scotland/loans/minimum-salary 390 px and large-profit
320 px. No page errors appeared; the large-number overflow above was measured.
Plain-text files were read directly, including pension/loan and other-income cases.

Raw captured HTML/text, JSON matrix, prototype result and screenshots are local
synthetic audit artifacts; the tables/findings above preserve the useful evidence
in this repository. SHA-256 fingerprints identify the originals:

| Artifact | SHA-256 |
| --- | --- |
| 19-case matrix | `E48E5B216B68C0E49119DA5C11BAFF2795C536DCAB756BEF5395F9E4752F0458` |
| Active-export prototype results | `E6CD75456A5684C00DA4927FFF4AD7402B12E9BEBCF41902F8BE88523BD2B05F` |
| Audit-only prototype source | `A8E7DA11CBEDEBBE84E53F92EB5DBDE6431A964C18C6169FB2050421ABF2D37C` |
| Browser render observations | `496630E4F674940ABB9FBFC221F7D3C097647E62A113AB2995684E4A79A7B91D` |
| Baseline HTML | `0D8A82AB9683930C39B35936489325A4AE1EE2C7273B5A2DF9284C0A02BDBC28` |
| Baseline text | `81886AD1157516479F2F8E607D451D75017A5D97A53485C88DDCE6FD6B41D29A` |
| Scottish HTML | `9C5D00B4F21753939D8A6251A6700049D0C61A5EE83DEE658F1CE9F998A63412` |
| Pension/loan text | `7E36928A5B2A6E43E25C8AB6BB661EB463BFD5124F8F561F2FDFD4CAEB1C1A56` |
| Corrected minimum-salary HTML | `D80AD1F31B07BBA80177EDA212AEB8A1BC4BD88D2B747FA0C959D9130C2011E1` |
| Large-profit 320 px PNG | `340C533810793C66435A16E70AC46CD6FC6292F1C44F51FB4F99D24CBEBACE13` |

No campaign, privacy, tax calculation, schema/endpoint contract, unrelated backlog
or #128 implementation is changed. The only further production edit is the
personal-reserve formula; the key-dates copy correction remains from the initial
PR. Earlier hosted checks for `1a5f8b6e` passed CI, critical E2E and CodeQL; those
results do not certify the later audit additions. An automatic Vercel PR preview
also ran through the repository integration; no manual deployment was invoked.
