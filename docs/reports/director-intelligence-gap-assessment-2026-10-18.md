# Director Intelligence proposal: implementation gap assessment

Date: 18 October 2026. Source baseline: `6412b6b9` (`main` at worktree creation).
Branch: `docs/director-intelligence-vision`.

## Decision

Keep the useful proposal as a candidate extension of the existing Director experience. The
next small Director PR should clarify the existing input and projection contract and qualify
NI-record wording. It should not introduce a new calculator, payroll-history model or dividend
legality engine. Feature work remains subject to maintainer approval and the existing pension,
transparent-result and independent-verification priorities in `docs/PROJECT_STATE.md`.

This review changes only the candidate [vision document](../business/DIRECTOR_INTELLIGENCE_VISION.md)
and this dated evidence report. It does not promote a parallel roadmap into `BACKLOG.md` or
change `PRODUCT_DIRECTION.md` or the canonical `DIRECTOR_INTELLIGENCE.md` specification.
The docs policy has no mandatory per-file index or index-generation command, so no index was
changed. The proposal links to its canonical owners and this report.

## Scope and evidence limits

Read `AGENTS.md`, `docs/README.md`, `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`,
`docs/business/PRODUCT_DIRECTION.md`, `docs/business/DIRECTOR_INTELLIGENCE.md`,
`docs/guides/TESTING.md`, the supplied handoff/proposal/setup script, and the source/test owners
below. The starter's clone and branch-switch procedure was deliberately replaced with an
isolated worktree of the same Git repository. The other agent's checkout was left on `main`.

Inspected the public route and the isolated local production build in Chrome. The public and
local empty states both show Annual Revenue and Business Expenses beside instructions to
enter company profit and costs. Local interactions used invented £100,000 revenue, £20,000
expenses, rUK, then £20,000 YTD salary and £5,000 YTD dividends. No real records, identifiers,
email submission, deployment credentials or production settings were used.

Browser inspection establishes these sampled states, not deployment parity, full accessibility
compliance or statutory correctness for the whole tool. Source reproduction and passing tests
do not make the production engine an independent tax oracle.

## Existing capability and residual gap

Paths in this table are relative to the repository root.

| Proposal area | Implemented owners and evidence | Assessment |
| --- | --- | --- |
| Audience and product scope | `docs/business/PRODUCT_DIRECTION.md`; `docs/business/DIRECTOR_INTELLIGENCE.md` | Single-director scenarios and free decision support are established. Multi-director optimisation, accounting integrations and filings remain outside scope. Remove the proposal's implication that audience scope is undecided. |
| Quick Start, Full Inputs and comparison | `src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx`; `src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx`; `src/lib/tax/strategyComparison.ts` | Present: All Salary, Baseline Mix, All Dividends, explicit Apply/Reset/Clear for Your Setup, salary and profit what-if controls. Extend these, rather than rebuilding the proposed Compare step. |
| Turnover versus profit | `InputsPanel.tsx` annual fields; `src/config/inputTooltips.ts`; `src/components/organisms/DirectorGuide/DirectorDashboard.tsx:417`; `strategyComparison.ts:197` | The actual annual contract is revenue minus expenses, then employer pension if not already deducted. Expenses explicitly exclude salary. There is no explicit pre-remuneration-profit input mode or after-paid-salary reconciliation. Empty-state profit wording conflicts with the actual contract. |
| Cost waterfall and tax reserve | `src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx`; `MoneyFlowChart.tsx`; `src/components/molecules/DirectorGuide/calculator/TaxBreakdownTable.tsx`; `TaxPots.tsx` | Company/personal tax pots, salary/dividend/CT breakdowns and a Money Flow display already exist. A fully reconciled flow would be an extension. `MoneyFlowChart.tsx` starts from profit after pension and subtracts pension again in its retained residual; the zero clamp can conceal this. Its displayed bars omit a separate personal-tax allocation. Do not claim that these bars prove a complete reconciliation. |
| Existing salary and YTD | `src/store/directorGuideStore.ts:666`; `strategyComparison.ts:187`; `useActiveDirectorScenario.ts` | Salary/dividend/drawings inputs and Your Setup already exist. YTD totals affect `alreadyTaken`, `availableForExtraction` and warnings, but are absent from the options used to calculate annual strategies. A strategy may show less total salary than has already been paid. No paid-to date, payroll-history reconstruction or appointment-aware remaining-year constraint was found. |
| Monthly planning | `src/lib/tax/variableIncome.ts`; `directorGuideStore.ts:723`; `dashboard/SummaryCards.tsx`; `__tests__/variableIncome.test.ts` | Present: contract-month projection through March, cash, expenses, minimum draw, runway and buffer warnings. This is a remaining-contract projection fed into annual tax calculations, not a complete YTD payroll model or statutory 6-April/5-April period ledger. |
| NI calculation and insight | `src/lib/tax/employerNI.ts`; `employeeNI.ts`; `nationalInsurance.ts`; `calculator/PensionGapWarning.tsx`; `dashboard/SurvivalModePanel.tsx`; `EducationPanel.tsx` | Annual NI mechanics and LEL-based panels already exist. Qualification wording is stronger than the available personal-record evidence; below-LEL wording also disregards credits from elsewhere. The gap is explanation and timing/category boundaries, not an absent NI panel. |
| Employment Allowance | `InputsPanel.tsx` advanced switch; `src/config/inputTooltips.ts:223`; `directorGuideStore.ts` defaults; `strategyComparison.ts` | Defaults false and is user-declared. A tooltip cautions about sole director/employee cases, but no eligibility questions prevent an inconsistent declaration. The separate `inputs/EmploymentAllowanceInput.tsx` is not the active dashboard control; do not treat its longer tooltip as the shipped dashboard's eligibility check. |
| Pension versus immediate cash | `inputs/PensionInput.tsx`; active `InputsPanel.tsx`; `strategyComparison.ts`; store pension-already-deducted mapping | Employer contributions and a pension-already-deducted switch already exist. Strategy `pension` is separate from `takeHome`. Preserve that distinction and test the display reconciliation instead of proposing pension support from scratch. This does not resolve the separate employee pension-method backlog. |
| Dividend profit and cash capacity | `strategyComparison.ts:807` Your Setup cost/CT check; `variableIncome.ts`; `SurvivalModePanel.tsx` | Modelled post-tax profit and cash-buffer checks exist. No opening distributable-reserve ledger, evidenced accounts, separate unpaid-liability reserve or HMRC-credit allocation model was found. Current-year losses alone cannot establish that dividends are impossible when prior reserves are unknown. A planning extension needs an explicit scope decision. |
| Two calendars and exports | `calculator/KeyDates.tsx`; `InputsPanel.tsx` year-end controls | Year-end selection, CT/SA date projections and `.ics` download already exist. The implementation uses the current date and month/day, rolls a past year-end forward and derives SA timing from that company-year context. It does not model actual first-account dates or split CT periods. Verify these date boundaries before expanding filing-deadline claims. |
| Region | `InputsPanel.tsx` Income Tax Region; `strategyComparison.ts`; `src/lib/tax/incomeTax.ts`; `dividendTax.ts` | Personal region is explicit and separate from company registration; there is no company-registration input. Preserve regional income-tax selection and UK-wide dividend treatment. The Scottish-company/England-resident case is an explanation/input-mapping regression, not a new registration model. |
| Policy year and validation | `src/constants/taxRates.ts`; `src/lib/tax/taxPolicy.ts`; `src/lib/validation/directorValidation.ts`; store persisted-state schema | Year-aware helpers exist; active dashboard/store use the current year. Validation exposes supported year types but the dashboard has no year picker. Do not promise future-year planning before policy exists. Currency, region, persisted-state and stale-year guards are already implemented. |
| Privacy and sharing | `directorGuideStore.ts:775`; `src/lib/safeStorage.ts`; `src/lib/directorGuideAnalytics.ts`; `DirectorDashboard.tsx:115`; `src/lib/email/outboundResultsDelivery.ts`; `/api/send-director-results` | Browser persistence includes form data, selected strategy, timestamp and tax year; hydration rejects stale/wrong-year data. Financial analytics values are bucketed, with interaction metadata. Optional email explicitly sends inputs for server recalculation and delivery. A blanket no-data-leaves-browser or redacted-email claim would be false. Provider configuration and production telemetry were not audited. |

## Prioritized findings and minimal next slices

Priorities below describe risk within this proposal review, not a replacement for the canonical
backlog. These are proposed follow-ups, not code changes delivered by this branch.

1. **P0: clarify what the existing form calculates.** Correct the empty-state profit/revenue
   contradiction and explain pre-remuneration costs. Make clear that annual comparisons and
   YTD withdrawals do not reconstruct completed payroll. Otherwise users can deduct ordinary
   expenses twice or interpret a hypothetical annual salary as a remaining-year instruction.
2. **P0: qualify NI-record claims in existing panels.** `PensionGapWarning` says that the year
   counts toward State Pension entitlement at the LEL and says there are no credits below
   thresholds. Survival guidance also presents a qualifying-year verdict. Explain salary-only
   evidence and link to personal NI records/credits. No new credits questionnaire is required
   for the first correction. Other income, credits and appointment timing remain relevant.
3. **P0: resolve the meaning of “safe” monthly draw before extending affordability.**
   `calculateSafeMonthlyDraw` returns a requested minimum when the cash ceiling is zero, even
   with zero tax-based capacity. Existing tests explicitly pin that behaviour. Treat the floor
   as a funding need or redesign the cap after a product decision; do not silently declare it
   spendable cash. The proposal previously missed this existing behaviour.
4. **P1: constrain current-year scenarios using paid history.** Keep annual comparisons, but
   define a separate current-year contract before adding fields. Salary/dividends already paid
   cannot be replaced by a lower hypothetical annual amount. Define gross/net treatment of
   paid amounts, employer NI paid, paid-to date and appointment method before implementing.
5. **P1: reconcile allocation and eligibility explanations.** Trace employer pension exactly
   once, separate personal tax in the allocation, and qualify the recommendation as the best
   among modelled scenarios. The coarse/refined salary search is bounded and does not prove a
   universal optimum. Improve EA declaration wording using the actual sole-director rule.
6. **P2, scope-gated: add reserves and calendar context.** Reuse existing cash, losses, YTD,
   tax pots and calendar export. Keep dividend headroom indicative and distinguish prior
   accounting losses from tax losses already modelled. Do not add HMRC-credit handling, banking
   connections, filing or a general accounts ledger simply to support an illustrative case.

### Reproductions from the unchanged engine

These establish current behaviour only. Run from this worktree with Bun imports from
`src/lib/tax/strategyComparison.ts`, `employerNI.ts` and `variableIncome.ts`:

- `getEmployerNI(6180, '2026-2027')` returns `177`. The independent working is in the test plan below.
- Compare `{region:'rUK', revenue:100000, expenses:20000, includesVat:false}` with the same
  input plus `{ytdSalary:20000, ytdDividends:5000}` for `2026-2027`. Both annual strategy
  objects are identical, including Baseline Mix salary `12570`; the second result's
  `availableForExtraction` is `55000`. The local UI showed these YTD fields beside an unchanged
  annual salary breakdown. This is not evidence that paid salary was lost from storage.
- `calculateSafeMonthlyDraw({annualTakeHome:0, monthsRemaining:6, cashInBank:0,
  minimumMonthlyDraw:900, runwayMonths:3, monthlyExpenses:300})` returns `safeMonthlyDraw:900`,
  `taxBasedMonthlyDraw:0`, `cashBasedCeiling:0` and `shortfall:3600`. Existing
  `variableIncome.test.ts` explicitly expects the £900 result.

## Recommended first implementation PR

**Suggested title:** Clarify Director annual-planning inputs and NI earnings limits.

Use the existing revenue-minus-expenses mode. Align empty-state steps with the actual labels,
state that costs exclude the salary/employer payroll costs being compared, and disclose that
YTD values do not turn annual comparisons into instructions to revise past payroll. Qualify
State Pension text as an earnings indication and direct users to their NI record. Keep figures,
rates and comparison outputs unchanged. Leave a new profit-input mode and current-year model
for separate, approved work.

Likely source files: `DirectorDashboard.tsx`, active `dashboard/InputsPanel.tsx`,
`src/config/inputTooltips.ts`, `calculator/PensionGapWarning.tsx`, `dashboard/SurvivalModePanel.tsx`
and related `EducationPanel.tsx` copy. Use their existing component tests, especially
`DirectorDashboard.render.test.tsx`, `InputsPanel.test.tsx`,
`DirectorGuideCalculatorComponents.test.tsx`, `SurvivalModePanel.test.tsx` and `EducationPanel.test.tsx`.

Acceptance: the same synthetic inputs produce the same numbers before/after; the form and
instructions agree; above/at/below LEL states do not claim to know an individual's whole NI
record; annual/YTD limits remain visible where users interpret the result; keyboard and
mobile users can reach the explanation. Follow the repo's `verify-frontend-change` skill,
`bun run check:repo`, relevant Director tests and `bun run build:ci`. A calculation change
would additionally require the full independent PAYE tests via `bun run test:no-coverage`
and `bun run test:e2e:golden`. This documentation branch does not implement that PR.

## Reusable owners and independent acceptance cases

Reuse `strategyComparison.ts` and `useActiveDirectorScenario.ts` for scenario orchestration;
`taxPolicy.ts` for selected policy; the existing `incomeTax`, `dividendTax`, `corporationTax`,
`employeeNI`, `employerNI` and shared NI modules for rules; `variableIncome.ts` for projection;
the store/validation schemas for mapping; existing breakdowns, tax pots and Key Dates for
presentation. Application consumers should use `@/lib/tax`; do not grow the existing import
baseline or create a parallel calculation engine.

The following are proposed future assertions, not newly committed tests or certified results.
Record primary-source citations and hand workings with each numerical case. Cross-path
equality and code-generated values alone are not independent statutory verification.

| Case | Independent expectation and boundary | Layer / owner to extend |
| --- | --- | --- |
| Same economics through approved input modes | £100,000 turnover less £20,000 operating costs gives an £80,000 pre-remuneration pool; an explicit £80,000 profit input maps to that pool with no second £20,000 deduction. Define prior-pay adjustments before allowing after-salary profit. | Input mapping/store and scenario tests; browser journey once a second mode exists. |
| Full-year Category A director, no EA or special relief, 2026/27 | £515 × 12 = £6,180. Employer NI: (£6,180 − £5,000) × 15% = £177. Employee NI is zero below the annual primary threshold. £6,180 is below the £6,708 LEL; this is a pay-only statement, not a personal NI-record verdict. | `employerNI.test.ts`, `employeeNI.test.ts`, NI-panel component tests. |
| LEL and Secondary Threshold boundaries | Check £4,999.99 / £5,000 / £5,000.01 and £6,707.99 / £6,708 / £6,708.01. At £6,708, annual Category A employer NI is (£6,708 − £5,000) × 15% = £256.20. Apply documented annual rounding separately from UI pounds. | NI rule tests plus all NI-panel states; do not copy stored thresholds as the expected oracle. |
| Credits outside this salary | Below-LEL salary with a hypothetical eligible parent registered for Child Benefit for a child under 12 must not imply zero personal credits. The tool does not verify eligibility or the actual record. | NI explanatory component tests and official-record link. |
| Sole director is the only employee liable for secondary Class 1 | Do not assume EA eligibility; include another employee below the secondary threshold as a counterexample. Also cover changes during the year and avoid converting a period earnings test into a blanket annual employee rule. | Active EA control/store mapping; existing employer-NI strategy tests after the contract is agreed. |
| Paid history and current-year timing | Six paid months at £515 fixes gross paid salary at £3,090; an unchanged further six months adds £3,090. A £20,000 already-paid case cannot be a current-year plan with total salary £12,570. Derive appointment/proration and NI-paid reconciliation from CA44 before asserting amounts. | Current-year orchestration/validation tests and browser result labels; no duplicate tax engine. |
| Scottish company, England-resident individual | Company registration has no input into personal tax-region selection. Pin a hand-derived rUK income-tax example and a separate Scottish example; keep dividend-rate treatment UK-wide. | Existing regional tax tests and active region input mapping. |
| £5,000 bank cash, £1,000 evidenced distributable profit | Indicative dividend headroom cannot exceed £1,000 before other restrictions, while cash affordability is computed separately. Unknown opening reserves must produce uncertainty; a current-year loss must not erase known prior reserves automatically. | Optional reserves validator and planning panel, only after scope approval. |
| Unallocated £49.50 HMRC account entry | Do not increase cash, available reserves or confirmed offsets. Label as unresolved; no recovery entitlement is inferred. This case does not justify adding an HMRC integration. | Only if a manually entered credit concept is approved. |
| Employer pension versus dividend | A synthetic £5,000 employer contribution reduces the declared pre-remuneration pool once when not included already. Track the £5,000 separately from immediately spendable cash; independently reconcile all flow components. Do not infer pension tax relief for every possible contribution without checking conditions. | Existing pension mapping, scenario and Money Flow tests. |
| Zero-cash minimum draw | With cash and tax capacity both zero, a requested £900 minimum must be labelled as a funding need if retained; a positive amount cannot be presented as an established affordable withdrawal. Agree the contract before replacing existing expectations. | `variableIncome.test.ts`, store tests, `SummaryCards` and monthly recruiter E2E. |
| Long first accounts and different clocks | Accounts exceeding 12 months need separate CT accounting periods/returns. Do not generate a certified deadline from month/day alone. Freeze the date in tests; include 31 March, 30 June, leap dates and invalid custom dates. | `KeyDates` component/calendar tests, then a date-only helper if warranted. |

Existing verification is substantial: `directorCalculator.*` suites, `strategyComparison.salaryScenario.test.ts`,
`variableIncome.test.ts`, store/input/dashboard/analytics/email/route suites and
`e2e/director-guide-critical.spec.ts` / `director-guide-recruiter-regression.spec.ts`.
Some examples are pinned to 2025/26, some assertions are broad or same-engine comparisons,
and store tests mock calculations. Those are useful contract tests, not proof that every
current-year interaction is independently verified. Preserve the wider supported-year,
provenance and Director annual-method gaps already in `BACKLOG.md`.

## Official source check

All five original proposal URLs resolved during this review; none needed a stale-link
replacement. Three focused sources were added to the proposal, plus the technical CA44 page.
Reachability does not establish that an entire calculation conforms to the linked guidance.

- [HMRC 2026/27 employer rates](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027):
  supports the dated Category A/annual-threshold examples above; do not replace annual director
  thresholds with monthly threshold × 12.
- [Single-director EA guidance](https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/single-director-companies-and-employment-allowance-further-employer-guidance):
  eligibility depends on who is liable for secondary Class 1, with additional-employee and
  in-year-change rules. Sole directorship by itself is not the whole test.
- [Taking money out of a company](https://www.gov.uk/running-a-limited-company/taking-money-out-of-a-limited-company):
  dividends are constrained by available current and prior-year profits, rather than bank cash.
- [CT accounting periods](https://www.gov.uk/corporation-tax-accounting-period):
  separates the maximum twelve-month tax period from longer accounts.
- [NI credits eligibility](https://www.gov.uk/national-insurance-credits/eligibility) and
  [personal NI records](https://www.gov.uk/check-national-insurance-record):
  support the distinction between this salary's earnings indication and a personal record.
- [Director NI methods](https://www.gov.uk/employee-directors) and
  [CA44 technical guidance](https://www.gov.uk/government/publications/ca44-national-insurance-for-company-directors):
  distinguish annual and alternative methods. Appointment timing, category changes, proration
  and detailed rounding need a focused technical derivation before current-year arithmetic changes.
- [Scottish taxpayer residence](https://www.gov.uk/scottish-income-tax/who-pays):
  use personal residence context rather than a company's registration address.

No unallocated-credit entitlement, universal optimum or next-year statutory policy was verified.

## Verification and local evidence

| Command / action | Result |
| --- | --- |
| `bun install --frozen-lockfile` | Passed in the isolated worktree; no dependency or lockfile change. |
| `bun run check:repo` | Passed on the source baseline and again after writing the proposal and assessment. |
| `bun run test:no-coverage --runInBand --testPathPatterns='director\|Director\|strategyComparison\|variableIncome\|employerNI\|employeeNI'` | Passed: 237 suites, 3,938 tests. Jest matches absolute paths; the worktree name contains `director`, so this filter ran all suites rather than a narrow slice. |
| `bun run build:ci` | Passed; production build/static generation completed with source maps disabled. |
| Local server: `bun run start --port 3217` | Started after allowing a local listening socket; distinct from the other agent's ports/output directory. No `.env.local` or production secret was copied. |
| Chrome local route and public empty state | Confirmed the input contradiction; local annual results, Full Inputs/YTD and existing breakdowns inspected. Captured synthetic-data screenshots. Local console warning/error capture returned none during this sample. |
| New browser E2E / production email delivery | Not run; this branch changes documentation only. Existing E2E files were read, and no production email was sent. |

Local screenshots are in ignored `audit-outputs/director-intelligence-review/`:
`public-empty-state.jpg` and `annual-ytd.jpg`. The former shows public instructions beside
actual labels; the latter shows paid-to-date inputs beside an unchanged annual salary result.
They are review evidence, not visual-regression baselines or committed source.

No workflows, required checks, branch protections, environment contracts, secrets or deployments
changed. The practical safety net is a source-backed gap map and a narrow next PR, avoiding
duplicate features and unsupported tax/privacy claims. No application code or expected tax
outputs changed. The initial review ended before commit or publication. Independent code review is required before any
subsequent non-trivial code commit; this documentation review does not replace that gate.
