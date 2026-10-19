# Director Intelligence — product, design, accessibility, and component audit

18 October 2026 · Route: /tools/director-guide · Audited revision: 6412b6b935cc52aeb779837cdcbfc9b36ee7e7c2 (main, v5.1.4)

Open actions and their definitions of done are maintained in [BACKLOG.md](../BACKLOG.md#director-intelligence-audit-follow-up), DI-01–DI-18. This report is dated supporting evidence, not a second live backlog.

## Assessment

The existing Ledger design is a useful foundation: ivory surfaces, navy accents, serif headings, restrained borders, and monospaced financial values suit this product. The answer-first result, explicit company/personal tax distinction, regional inputs, and annual/monthly modes are valuable.

The main priority is making every displayed figure belong to a clearly identified, consistent scenario. Several interaction defects currently undermine that trust. A visual refresh should follow those fixes and make the page easier to scan, especially on phones and when multiple desktop panels are open.

## What was reviewed and verified

- Read the route, orchestrator, all 25 Director UI modules, active-scenario hook, persisted store, relevant calculation helpers, validation, email generation/delivery path, global layout/print styles, tooltips, and existing tests.
- Exercised annual results, monthly results, negative-profit survival mode, strategy selection, both sliders, advanced inputs, student loans, pension, calendar dates, mobile drawers, education, and mocked email submission.
- Captured desktop, mobile, narrow-width, tablet, email, and print-media screenshots. Measured 320px reflow and the 1024px layout with Learn expanded.
- Production build: passed. Full unit suite: 237 suites and 3,938 tests passed.
- Existing Director critical and recruiter browser tests: eight passed across Chromium and WebKit, using the production server.
- Automated accessibility checks: desktop, mobile, and production. Manual keyboard checks: drawer exit, focus restoration, and tab escape.
- Production browser observation recorded no console errors or warnings during the tested annual/email journey. An early development capture produced a hydration message involving screenshot-injected caret styling; it did not reproduce in the clean production session and is not counted as an application defect.

The financial figures below reproduce the application's current behaviour; they are not independent certification of every tax calculation. Production email delivery, physical-device keyboards, screen-reader speech, and field Core Web Vitals were not verified. Email requests were intercepted locally; no email was sent.

## Highest-priority fixes

| ID | Priority | Finding | Evidence |
| --- | --- | --- | --- |
| F01 | P1 | Currency parsing silently changes decimal amounts | Browser + source |
| F02 | P1 | Missing required inputs leave old results on screen | Browser + source |
| F03 | P1 | “Safe” draw can exceed available cash and is detached from selected scenario | Browser + source |
| F04 | P1 | Selecting All Salary is clamped into a mixed salary/dividend scenario | Browser + source |
| F05 | P1 | Emailed results omit the scenario currently being explored | Mocked browser request + source |
| F06 | P1 | Monthly breakdown and survival figures read annual-mode inputs | Browser + source |
| F07 | P1 | Calendar calculation can produce a late payment date; invalid dates roll over | Browser + HMRC + source |
| F08 | P1 | Other-PAYE checkbox assumes another job consumes this job's NI threshold | Source + current HMRC guidance |

P1 means address before relying on the affected feature for financial decisions. P2 findings below materially improve comprehension, accessibility, and reliability.

## F01 — Preserve the amount the user entered

Entering 1234.56 into Annual Revenue displays £123,456. Both currency parsers strip every non-digit character, including the decimal point and minus sign. The same pattern is used throughout the active input panel.

Recommendation: use one shared currency-input component with editable text separate from parsed numeric state. Accept unambiguous pounds/pence, commas, and pasted currency symbols; reject invalid signs with a specific message. Format on blur rather than rewriting every keystroke. Add decimal input mode for mobile and retain an empty value distinctly from zero.

Acceptance: 1,234.56, £1,234.56, and 1234.56 resolve to the same £1,234.56. Unsupported input is explained rather than silently transformed. Mid-string editing preserves the caret and numeric value.

Source: [InputsPanel parsers](../../src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx#L103).

## F02 — Invalidate results when their inputs stop being valid

After calculating, clearing Annual Revenue leaves the recommendation and breakdown on screen. The automatic-calculation effect returns early for incomplete data; it does not clear or mark the comparison stale. Store errors and calculating state are not surfaced by the dashboard.

Recommendation: define explicit incomplete, valid, updating, invalid, and current-result states. When a required field becomes empty or invalid, remove or clearly mark the previous result and disable export. Associate field errors with inputs and show a short error summary where several fields need attention.

Acceptance: clearing revenue, expenses, or changing to an incomplete monthly mode cannot leave a current-looking result. Results and email use the same validated input snapshot.

Sources: [calculation effect](../../src/components/organisms/DirectorGuide/DirectorDashboard.tsx#L180), [store calculation](../../src/store/directorGuideStore.ts#L631). The [GOV.UK validation pattern](https://design-system.service.gov.uk/patterns/validation/) explains how to give specific recovery guidance.

## F03 — Separate desired draw from affordable draw

In monthly mode, entering £10,000 income, £2,000 expenses, £0 cash, £3,000 minimum draw, and three months' runway displays a recommended “safe” draw of £3,000, alongside a £15,000 buffer shortfall. The helper explicitly returns the requested minimum when the cash ceiling is zero.

The monthly output is also calculated from the baseline mixed strategy, rather than the active salary/profit scenario. Changing sliders can update annual cards without updating the safe-draw calculation.

Recommendation: model desired personal spending, projected after-tax capacity, cash available now, reserved tax, and protected operating buffer separately. An unfunded requested minimum should appear as an unmet need, not a safe recommendation. Use the selected scenario consistently, and distinguish cash available today from forecast receipts.

Acceptance: a zero-cash case cannot claim a positive cash-funded safe draw without explicitly modelling a receipt. Scenario changes update draw and buffer together. Test minimum draw above projected capacity, zero cash, shortfall, and boundary months.

Sources: [safe-draw helper](../../src/lib/tax/variableIncome.ts#L132), [monthly store output](../../src/store/directorGuideStore.ts#L723), [SummaryCards](../../src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx#L25).

In annual mode, rename “Safe Monthly Draw” to “Average monthly take-home”: dividing annual take-home by 12 does not establish cash-flow safety.

## F04 — Keep the selected strategy and displayed calculation identical

With £100,000 revenue and £20,000 expenses, the All Salary comparison card shows £70,217 salary and £0 dividends. Selecting it leaves the card selected but changes the summary to £50,270 salary and £18,581 dividends.

The card writes its salary into slider state. SalarySlider then clamps that value to the NI upper earnings limit, so the active result becomes another scenario. The hero continues to show the maximum-take-home recommendation, which adds another competing set of figures.

Recommendation: represent the active choice explicitly as a named strategy or a custom salary. Named strategies should consume their exact result; an exploratory slider must not modify them behind the scenes. Calculate the slider's affordable maximum from the same company-cost model rather than treating an NI threshold as affordability.

Acceptance: selecting each strategy makes summary, breakdowns, reserves, warnings, and exports match that card. Moving a slider changes the selected state to “Custom”. Changing the objective gives the headline an explicit, consistent meaning.

Sources: [strategy selection](../../src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx#L93), [slider cap](../../src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx#L40), [active scenario](../../src/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario.ts#L109).

## F05 — Save the scenario the user is viewing

After increasing company profit by 10%, the screen shows £80,000 → £88,000. The intercepted email request still contains £100,000 revenue minus £20,000 expenses and no profit adjustment, custom salary, selected strategy, or objective. The server regenerates the baseline comparison.

The dialog also promises key dates, but year-end settings are absent from its input and the email generator does not generate that calendar schedule.

Recommendation: create a validated scenario snapshot shared by display and export. Recalculate on the server from that snapshot. Clearly label whether the report is the current scenario, original inputs, or all comparisons. Make the email promise match its contents.

Acceptance: the emailed scenario reproduces the on-screen figures for both sliders and monthly mode. Include assumptions and the selected accounting period if key dates are promised.

Sources: [email payload](../../src/components/organisms/DirectorGuide/DirectorDashboard.tsx#L115), [server recomputation](../../src/lib/email/outboundResultsDelivery.ts#L54), [email dialog](../../src/components/molecules/DirectorGuide/EmailResultsDialog.tsx#L195). Evidence: mocked request (local audit artifact; not versioned).

## F06 — Use resolved financials in every mode

After annual inputs of £100,000 revenue/£20,000 expenses, switching to monthly £10,000 income/£2,000 expenses from April projects £120,000/£24,000. The Corporation Tax breakdown still prints £100,000/£20,000, while calculating from the monthly projection.

With monthly income below expenses, SurvivalModePanel can show an estimated company loss of £0 because it reads the previous annual figures. A fresh monthly-only session instead treats missing annual values as zero.

Recommendation: expose resolved annual financials, projection period, and active deductions from one scenario object. DetailCards and SurvivalModePanel should consume it. State the projection period next to the result.

Acceptance: monthly-only, annual-to-monthly, monthly-to-annual, and monthly negative-profit cases reconcile without retained annual inputs leaking into the display.

Sources: [DetailCards](../../src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx#L25), [SurvivalModePanel](../../src/components/molecules/DirectorGuide/dashboard/SurvivalModePanel.tsx#L32). Evidence: monthly survival output (local audit artifact; not versioned).

## F07 — Correct calendar arithmetic and collect a real accounting-period end

Selecting 31 December displays year-end 31 December 2026 and Corporation Tax payment 2 October 2027. The ordinary nine-month-and-one-day rule gives 1 October 2027. JavaScript month overflow changes 31 September into 1 October before the code adds another day.

Entering the impossible custom date 02-31 silently becomes 3 March 2027, with no invalid-field message. The UI also guesses the next occurrence of an accounting date instead of asking which accounting period the user means.

Recommendation: validate a complete accounting-period end date, use deliberate end-of-month date arithmetic, separate personal tax-year dates from company deadlines, and qualify deadlines for companies subject to instalment rules. Generate visible dates and calendar events from the same helper.

Acceptance: December, leap-year, month-end, invalid-day, unknown-date, and previous-period cases are independently tested. Include a clear HMRC source beside the schedule.

Source: [KeyDates](../../src/components/molecules/DirectorGuide/calculator/KeyDates.tsx#L34). Official rule: [HMRC Corporation Tax payment deadlines](https://www.gov.uk/pay-corporation-tax).

## F08 — Review the other-PAYE National Insurance rule

The helper removes the primary threshold whenever the user says they have another PAYE job. The educational warning repeats that NI applies from the first pound because the threshold is used elsewhere.

HMRC's current employer guide says to calculate NICs normally on this employer's earnings and ignore payments from other jobs with different employers, with separate rules for associated businesses. A generic “other employment” checkbox does not establish that exception.

Recommendation: correct the ordinary separate-employment case and model aggregation only when supported by the necessary facts. Review the resulting strategy rankings and pension-credit wording using independent fixtures.

Source: [threshold removal](../../src/lib/tax/strategyComparison.ts#L177). Primary source: [HMRC 2026–27 employer guide, section 3.4.1](https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions/2026-to-2027-employer-further-guide-to-paye-and-national-insurance-contributions#341-an-employee-has-2-or-more-jobs-with-different-employers-and-each-one-pays-the-employee).

## Further findings and improvements

## F09 — Make displayed totals reconcile, including loans, pensions, and losses (P2)

With Plan 2 enabled, the headline shows £27,445 total deductions to set aside, but the detailed “All Taxes & NI” total shows £24,235: the detail omits £3,210 student-loan repayment. A loan is not a tax, so different totals can be legitimate, but their relationship must be explicit.

Other presentation gaps:
- The Corporation Tax “Taxable Profit” display does not deduct losses brought forward even though the engine does.
- Pension contributions reduce the calculation's profit but are missing from the visible revenue-to-taxable-profit bridge.
- The dividend “Taxable Amount” subtracts the dividend allowance without representing unused Personal Allowance.
- Money Flow omits personal deductions from its allocation, labels profit after pension as Gross Profit, and subtracts pension again in retained-profit arithmetic.

Use one explanatory bridge: company profit → pension/company costs → company tax → salary/dividends → personal deductions → cash take-home/retained amount. Show “Tax and NI”, “Student loan repayments”, and “Total deductions” distinctly. Derive the rows from the engine's actual basis rather than reconstructing them in components.

Sources: [DetailCards](../../src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx#L29), [MoneyFlowChart](../../src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx#L20), [TaxPots](../../src/components/molecules/DirectorGuide/calculator/TaxPots.tsx#L20). Evidence: stable loan comparison (local audit artifact; not versioned).

## F10 — Show consequential warnings in the main decision flow (P2)

Learn is collapsed by default. Most warnings, including director-loan and VAT messages, live inside it without an always-visible warning count. Warnings use the original baseline mixed strategy rather than the active salary/profit scenario.

Keep educational material optional, but place important scenario warnings beside the decision they affect. A compact “2 things to check” summary can link to details. Recompute warnings from the active scenario. Do not mark warnings as user-seen in analytics merely because a hidden panel mounted.

Sources: [EducationPanel baseline calculation](../../src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx#L91), [warning tracking](../../src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx#L192).

## F11 — Tighten financial explanations (P2)

- Replace the blanket assertion that dividends are taxed when declared, not paid. HMRC distinguishes when dividends become due and payable, including differences between interim and final dividends. See [HMRC SAIM5040](https://www.gov.uk/hmrc-internal-manuals/savings-and-investment-manual/saim5040).
- Replace “VAT registration required” inferred from an annual forecast with a prompt to check taxable turnover and the actual registration tests. The threshold is not simply a projected financial-year total, and the notification timing is more specific. See [HMRC VAT registration](https://www.gov.uk/register-for-vat).
- Describe pension status as what this salary may contribute to the NI record. A zero director salary does not prove the person has no qualifying year or credits elsewhere. Link to [State Pension eligibility](https://www.gov.uk/new-state-pension/eligibility) and the NI-record checker.
- Review “60% tax” taper messaging before showing it to Scottish users or for dividend-heavy income; the current warning is not qualified by income mix or region.
- Keep the Child Benefit warning useful above the top threshold too; the current visibility condition ends at that threshold. See [HMRC Child Benefit charge](https://www.gov.uk/child-benefit-tax-charge).
- Rename “Contract-End Risk” unless there is an actual contract-end input. The existing flag compares the projection's months to March with the buffer target.
- State that a current-year trading loss alone does not establish the company's total distributable reserves. Survival mode cannot determine historic reserves from these inputs. See [HMRC company dividend guidance](https://www.gov.uk/running-a-limited-company/taking-money-out-of-a-limited-company).

Source: [warning rules](../../src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx#L346), [pension messaging](../../src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx#L45).

## F12 — Fix accessible names, contrast, and landmarks (P2)

The production scan found:
- Two sliders without accessible names.
- Four chart progressbar nodes without accessible names.
- Five contrast failures in the expanded-input state; initial desktop hints measured about 4.44:1 against a required 4.5:1.
- Nested and duplicate main-landmark problems.

Give slider thumbs names, currency/percentage value text, and linked visible labels. A financial allocation is better represented as a chart with a text/table equivalent than progress towards completion. Use a single main landmark and a working skip target. Add an explicit result-status announcement after debounced calculation rather than announcing every monetary row.

Make strategy cards a labelled single-choice group with programmatically exposed selection; the visual border currently carries that state.

Sources: [SalarySlider](../../src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx#L117), [chart semantics](../../src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx#L91), [layout landmark](../../src/components/templates/Layout.tsx#L35). Evidence: full production axe results (local audit artifact; not versioned). Guidance: [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## F13 — Use the existing accessible dialog primitive for mobile drawers (P2)

The custom drawer opens with close-button focus and handles Escape, but its “focus trap” effect does not implement tab wrapping or focus restoration. Manual checks allowed focus to escape to the skip link; closing returned focus to the body. Background inertness covers the dashboard wrapper, not all sibling content.

Use the Radix dialog foundation already used by EmailResultsDialog. Trap focus, make the entire background inert, restore focus to the opener, and expose a meaningful result status. “View Results” should be enabled only when results are current and valid.

Source: [MobileDrawer](../../src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx#L67). Guidance: [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## F14 — Respond to the width of the workspace, not just the viewport (P2)

At 1024px with Learn open, fixed panels leave a 360px results area. Its content measures 384px; the headline's monetary figures overlap, and the calendar action overflows. Viewport-based large-screen layouts activate inside this narrow column.

Use container-responsive result components, minimum useful workspace width, and automatic panel changes. Show Learn as an overlay or drawer at laptop/tablet widths; reserve three-column working layouts for sufficient space. Stack the hero's side metrics when its own container is narrow.

The tested 320px mobile state had no document-level horizontal overflow, which is good. This does not establish all-state reflow compliance.

Evidence: 1024px expanded Learn screenshot (local audit artifact; not versioned).

## F15 — Give mobile a shorter route to the useful answer (P2 design recommendation)

The initial screen spends most of the first viewport explaining how to enter data while the entry button sits farther down the empty state; the small sticky Inputs action is available at the top. Results then repeat annual/monthly take-home across large cards and require roughly 5,276px of internal scroll in the tested monthly state.

Recommendation:
- Put a clear “Enter company figures” action directly beneath a concise heading.
- Offer example figures as an explicit preview mode, clearly distinct from the user's real inputs.
- Lead results with one take-home figure, selected split, and reserve requirement.
- Use compact rows for repeated supporting metrics.
- Let users expand detailed workings, assumptions, and education on demand.
- Make the input action easy to rediscover after a long scroll; preserve its current sticky access.
- Keep input text comfortably readable on mobile and verify physical iOS focus/keyboard behaviour; the active currency fields are text inputs without a decimal input-mode hint.
- Use plain labels such as “Already paid this year” instead of unexplained YTD.

Evidence: initial mobile (local audit artifact; not versioned), mobile result (local audit artifact; not versioned).

## F16 — Repair print and make saving useful without email (P2)

Print-media inspection shows the result scroll container retains a fixed viewport height and overflow scrolling. Global print CSS hides every button, including the strategy cards because the whole card is a button. Panel hiding relies on class-name substrings not present in the relevant wrappers.

Use explicit print hooks, reset all containing heights/overflow, and render static strategy summaries for print. A short printable report should include selected inputs, assumptions, tax year, complete deductions, sources, and generated date. Offer a copy/print action next to email.

For email, retain the current inline error handling and address autocomplete. Add a success status announcement and verify focus after success. Keep baseline and custom report semantics explicit.

Sources: [print styles](../../src/app/globals.css#L446), [email dialog](../../src/components/molecules/DirectorGuide/EmailResultsDialog.tsx#L139). Evidence: print-media capture (local audit artifact; not versioned). This was a CSS/print-media inspection, not a physical printed-page test.

## F17 — Reduce competing state and component drift (P2 engineering recommendation)

The live InputsPanel is over 1,000 lines and reimplements fields that also exist in seven standalone input modules. Those seven modules and TaxBreakdownTable have no production consumer beyond barrel exports; tests still cover them. Some dormant content has different behaviour and older examples, so its tests should not be mistaken for coverage of the rendered input path.

Use one field implementation and shared formatting/validation. Split by coherent input groups, retaining a single form state. Centralise resolved scenario data once per dashboard; repeated calls to the active-scenario hook currently repeat local memoised calculation work across several consumers. Profile before introducing a worker or other major performance machinery.

Represent objective, named strategy, custom salary, profit adjustment, validated inputs, resolved financials, and result provenance explicitly. Keep the existing tax-domain owners; avoid adding a second calculator or a generic rules engine.

Source: [InputsPanel](../../src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx#L1), [active-scenario hook](../../src/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario.ts#L45), [standalone input exports](../../src/components/molecules/DirectorGuide/inputs/index.ts#L6).

## F18 — Put assumptions, sources, and remembered state where people can see them (P2 product recommendation)

Show tax year, region, projection period, and selected scenario in a short visible context strip. Link to calculation basis and relevant HMRC sources near the result; metadata and an optional Learn panel do not replace that explanation.

The form is remembered in local storage, with seven-day and tax-year checks. Tell users that figures are remembered on this device and provide an obvious clear action. Consider an undo for resetting a detailed input set. Keep the already-implemented hidden-details warning when returning to Quick Start.

The page uses several names: Director Intelligence, Director Pay Dashboard, Director Salary & Dividend Calculator, and Baseline Mix/Optimal mix. Use one product name and consistent task language. “Highest estimated take-home under these assumptions” is clearer than an unqualified “Recommended strategy”.

## Suggested design direction

Keep the Ledger identity and refine the hierarchy:

| Area | Proposed treatment | Purpose |
| --- | --- | --- |
| Header | Director Pay Calculator, short purpose, tax year/region context, Edit figures action | Establish task and current assumptions |
| Primary result | One prominent take-home amount; annual/monthly display choice; salary/dividend split | Answer the main question quickly |
| Reserves | Company reserve, personal reserve, payroll withholding, and any shortfall | Separate money available from money owed |
| Scenario comparison | Three compact alternatives with take-home and delta; explicit selection | Make trade-offs understandable |
| What-if controls | Labelled slider plus exact numeric entry, visible current value, reset | Support both exploration and precision |
| Your Setup | Direct Edit action that opens the actual fields, with explicit Apply/Cancel | Avoid instructions to hunt through Full Inputs |
| Important checks | Visible concise warning summary with links to details | Keep consequential information discoverable |
| Detailed workings | Expandable calculation bridge/table with all deductions | Preserve depth without dominating the screen |
| Learn | Contextual explanatory drawer or expandable material | Explain concepts close to the relevant decision |
| Dates and save | Validated accounting period, sourced deadlines, print/copy/email | Make outputs useful outside the dashboard |

Avoid treating normal tax deductions as red error states. Reserve red for invalid inputs, unaffordable plans, or critical issues; use neutral styling for expected costs. Keep green for a qualified positive outcome. Consolidate border/radius/spacing tokens across the angular main dashboard and more rounded learning cards.

Use generous touch targets for major mobile actions. WCAG 2.2 AA's minimum target criterion is 24×24 CSS pixels with exceptions; 44px is a sensible comfort target for primary actions, not a blanket AA requirement. See [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Component-by-component disposition

| Component | Disposition |
| --- | --- |
| Route page + FAQ | Keep metadata and visible FAQ. Reconcile page naming, landmark ownership, and FAQ placement outside the internal dashboard scroller. |
| DirectorDashboard | Expose invalid/updating/current states; consume and export one scenario snapshot. |
| DashboardLayout | Container-aware panels; accessible mobile drawers; reliable print hooks. |
| InputsPanel | Shared decimal-safe fields; simpler disclosure; inline validation; retain hidden-details notice. |
| SidebarNav | Keep useful jump links, but reduce competing navigation; use text for key actions and respect reduced-motion preferences for scripted scrolling. |
| RecommendationHero | Clearly distinguish the active choice from any alternative recommendation; match the current objective. |
| SummaryCards | Remove duplicate headline metrics; rename annual “safe” draw; align monthly values with active scenario. |
| SalarySlider | Remove NI-threshold affordability clamp; label controls; add exact entry/current salary display and Custom state. |
| StrategyComparisonTable | Preserve comparison value; expose selection semantically and prevent slider mutation of named strategies. |
| DetailCards | Resolve monthly input leakage, losses/pension bridges, dividend tax basis, and deduction totals. |
| TaxPots | Separate reserves from payroll amounts already withheld and avoid implying the same tax should be paid twice. |
| PensionGapWarning | Qualify NI-record claims and account for allowance/other-income context in explanatory wording. |
| MoneyFlowChart | Complete the financial bridge; label post-pension basis; replace progress semantics and provide textual values. |
| KeyDates | Fix month overflow, invalid dates, accounting-period selection, and deadline qualifications. Keep all-day ICS format and stable event identifiers. |
| EducationPanel | Separate warnings from teaching; use the active scenario; verify financial wording; avoid hidden-panel seen analytics. |
| SurvivalModePanel | Use monthly resolved financials; qualify distributable-reserve and pension-credit statements. |
| EmailResultsDialog | Keep address autocomplete, visible errors, and mocked test coverage; align report promise/snapshot and announce success. |
| CoreInputs, AlreadyTakenInputs | Dormant production paths. Consolidate with active fields; do not maintain independent parsing/labels. |
| CompanyCarInput, EmploymentAllowanceInput | Dormant paths. Retire or consolidate after checking external consumers; review dated examples and eligibility phrasing first. |
| OtherIncomeInput, PensionInput, StudentLoanInputs | Dormant paths. Consolidate their useful field logic/help with the live panel; keep policy-backed content current. |
| TaxBreakdownTable | Not mounted in the live flow. Reuse its structured-table idea for expanded workings only after making it scenario-aware. |
| Store + active-scenario hook | One coherent current scenario, explicit invalidation, shared monthly projection, and export provenance. |

## Implementation order

1. Protect numerical integrity: F01–F08, with focused independent calculation fixtures and interaction reproductions.
2. Reconcile output and warnings: F09–F11; make financial context and assumptions visible.
3. Fix accessibility and panel responsiveness: F12–F14.
4. Refine mobile hierarchy and save/print workflows: F15–F16.
5. Consolidate components/state and clarify remembered-input behaviour: F17–F18.

Add targeted regression cases for the actual defects rather than expanding generic test scaffolding: pence parsing, empty-field invalidation, selected-card/result parity, zero-cash draw, monthly mode switching, exported what-if state, month-end dates, separate-employer NI, student-loan totals, keyboard focus return, and 1024px expanded-panel layout.

For calculation changes, follow the repository's independent-verification and browser-regression requirements. Existing passing tests establish the tested contracts, not statutory completeness.

## Validation evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Full unit suite | PASS: 237 suites, 3,938 tests | unit log (local audit artifact; not versioned) |
| Production build | PASS | build log (local audit artifact; not versioned) |
| Director critical + recruiter E2E | PASS: eight tests, Chromium and WebKit | E2E log (local audit artifact; not versioned) |
| Production accessibility | FAIL: six rule categories in expanded-input state | axe report (local audit artifact; not versioned) |
| Desktop accessibility | FAIL: unnamed sliders/chart elements and hint contrast | axe report (local audit artifact; not versioned) |
| Mobile accessibility | FAIL: unnamed sliders/chart elements and warning contrast | axe report (local audit artifact; not versioned) |
| Repo checks | PASS | bun run check:repo (local audit log; not versioned) |

Application source files were not changed during the audit. Raw captures, logs, and the local browser harness remain in the ignored audit-outputs directory; they are not part of this report or pull request. The repository-relative source links above are the durable investigation entry points.
