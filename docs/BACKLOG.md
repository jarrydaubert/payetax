# PayeTax Backlog

Backlog for the public R&D version of PayeTax. Read [`PROJECT_STATE.md`](PROJECT_STATE.md) first
for the current product, architecture, verification and search handover.

Keep this file for active or parked future work only. Closed work belongs in GitHub pull requests,
dated reports or commit history. Statutory truth belongs in canonical policy and current primary
sources, not in backlog prose.

## Working Rules

- Tax correctness, security, privacy, user-data integrity and evidence-backed public claims take priority over all other work.
- This file holds unresolved work only. Remove completed work; preserve evidence in pull requests, dated reports and git history.
- Independent PAYE fixtures are the statutory correctness oracle. Generated golden-master expectations protect behaviour and presentation regression only — they derive from the engine and can never prove it correct.
- Tax-domain baselines, test-skip baselines and advisory allowlists are shrink-only. Lower them in the same PR that removes the debt; never add broad exceptions merely to pass a check.
- Published rates, thresholds and effective dates change only through canonical policy data, official-source evidence and independent verification.
- Generated golden masters, API projections, structured data, `llms.txt`, reports and article tables are downstream outputs, not editable policy sources.
- Never commit secrets, tokens, raw calculator inputs, unredacted analytics payloads or personal data — in fixtures, logs or evidence.
- Record unrelated findings as named follow-ups here rather than expanding a slice's scope.
- Prefer small independently reviewable slices over generic frameworks, big-bang rewrites or cosmetic restructuring.

## Active

Current correctness sequence:

1. Scottish calculator and Scottish-vs-English comparison.
2. £40k, £60k and £100k salary articles; protect the verified £70k article.
3. Explicit pension-method handling.
4. Transparent calculation results.
5. Independent fixture/test-portfolio completion and Foundation reconciliation.

### Foundation

Permanent architectural and testing direction for the tax domain. This is a verification burn-down, not a new architecture programme: it records the agreed end state and tracks what still needs checking. It does not duplicate the detailed items below or prescribe implementation before a focused audit.

**North star**

> One effective-dated policy model, one policy selector, one pay-basis derivation, one rule owner per deduction, one supported route to each statutory calculation, one transparent result, and one compact independent set of full-calculation cases.

**Flows**

- Policy: official change → effective-dated policy data → one selector.
- Calculation: normalised input → shared pay bases → statutory rules → supported orchestration → transparent result.
- Verification: official rules and independent working → compact fixtures → comparison against the production calculation.

**Principles**

- Published rates, thresholds and effective dates belong in policy data.
- Calculation mechanics belong in small, clearly owned rule modules.
- Consumers must not recreate statutory calculations.
- Production policy and mechanics must remain separate from independently derived verification expectations.
- JSON fixtures cover representative full-calculation interactions.
- TypeScript tests cover rules, boundaries and detailed mechanics.
- Playwright covers critical browser journeys.
- Do not introduce a generic rules engine, plugin system, duplicate calculator, test-only calculator, exhaustive JSON matrix or cosmetic folder reshuffle.
- Repository-root configuration and generated artefacts must have clear ownership; do not relocate conventional framework files merely to make the root look tidier.

**Verification burn-down**

Rows are `Open` or `Partial` after reconciliation against current code and evidence. An item is not
assumed wholly incomplete merely because its residual work also appears in the detailed backlog
below.

| Concern | Desired outcome | Current status | Evidence or completion reference |
| --- | --- | --- | --- |
| Explicit pension-method handling | Salary-sacrifice, net-pay and relief-at-source are handled explicitly, with the method exposed in the result. | Open | The shared pay-basis owner currently models the pension input as salary sacrifice. |
| A transparent result that clearly exposes the selected policy, calculation basis, relevant pay bases and individual deductions | One result exposes the policy selected, the calculation basis, the relevant pay bases and each individual deduction, without callers reassembling them. | Partial | Tax-code basis is exposed after PRs #111/#112. Selected policy, relevant pay bases and pension method remain incomplete. |
| Compact independent full-calculation fixture set | A small set of JSON fixtures, derived independently of production code, covers representative full-calculation interactions. | Partial | Representative PAYE and tax-code fixtures exist. Supported-year, boundary and per-scenario provenance gaps remain below. |
| Balanced test portfolio and updated `TESTING.md` | JSON fixtures, TypeScript rule and boundary tests, and Playwright journeys are balanced, with `TESTING.md` describing the split. | Partial | The three-layer split exists; the final coverage balance and documentation reconciliation remain open. |
| Final backlog reconciliation | After the foundation audit, the detailed backlog items are reconciled against verified outcomes. | Open | Remove the remaining Foundation rows as focused slices close them. |

**Burn-down rule**

- A focused foundation slice must update this section in the same pull request.
- Once an outcome is verified and any required work is merged, remove its open row rather than retaining completed work in the backlog.
- Preserve completion evidence in the pull request, commit history or a dated report.
- If an audit confirms that no work is required, remove the row and cite the audit reference in the related pull request.
- Keep slices small and independently reviewable.
- The permanent north star and flow descriptions remain after the burn-down rows have been removed.

### Tax correctness and product semantics

- [ ] K-code overriding limit base: the 50% cap uses gross-minus-pension including non-employment income the engine also PAYE-taxes monthly. DoD: documented decision on the payment base for mixed-income users, engine behaviour matching it, and mixed-income K-code fixtures.
- [ ] Pension method semantics: the engine treats every pension input as salary sacrifice (reduces NI). DoD: explicit salary-sacrifice / net-pay / relief-at-source handling, or the assumption disclosed at the input and in results; tests assert whichever is chosen.
- [ ] State Pension age transition: engine and `BasicInputs` hardcode 66 while SPA moves to 67 during 2026–2028. DoD: date-of-birth-aware rule or clearly framed self-declaration replaces the fixed age, with tests at the transition boundary.
- [ ] Marriage Allowance treatment: modelled as +£1,260 allowance rather than a 20% tax reducer; deviates for Scottish taxpayers and edge cases. DoD: documented decision, implementation matching it, and fixtures including Scottish cases.
- [ ] Personal Allowance taper parameterisation: `taxableThresholdToTotalIncome` hardcodes the £1-per-£2 taper shape instead of consuming `personalAllowanceReductionRate` (PR #83 review note). DoD: the function consumes the policy rate; a test pins behaviour for a non-default rate.
- [ ] Dead `taxRateDescriptions.ts` module: zero production consumers and emits "2000% basic rate" (`rate * 100` on percent values). DoD: module removed, or fixed and consumed by production; either outcome asserted by tests.
- [ ] `pensionOptimizer` hardcodes a 60% trap rate (rUK 40%+20% assumption) — wrong framing for Scottish taxpayers. DoD: trap framing derives from policy data or is region-aware/disclosed; a test covers the Scottish case.
- [ ] Marginal-rate chart shows the nominal 45% instead of the ~60%/67.5% effective rate inside the £100k–£125,140 taper (`chartUtils.estimateMarginalRate`, PR #83 review note). DoD: chart reflects the effective rate in the taper band or explicitly labels the nominal basis; a test pins the taper band.

### Tax-domain architecture

- [ ] One supported tax-domain public interface (`src/lib/tax/index.ts`); application code stops importing `constants/taxRates` and domain internals directly. DoD: the `check:tax-imports` baseline shrinks to zero direct imports.
- [ ] Display band interpreters still re-derive band presentation outside the owned mechanics (rUK and Scottish slicing each have one owner since #86/#98). DoD: display code consumes owned mechanics or generated projections; no independent band maths remains in display modules.
- [ ] Shadow helper `taxRateDescriptions` is test-only production-adjacent code. DoD: resolved together with the `taxRateDescriptions.ts` item under Tax correctness; no test-only shadow module remains.
- [ ] NI pay-date basis: payroll rate selection derives a pay date from the tax period start, so a weekly or four-weekly period straddling a mid-year rate change takes the earlier rate. DoD: callers pass a real pay date where they have one; a straddling-period test takes the later rate when the pay date does.
- [ ] Explicit ownership of deliberate statutory and payroll rounding rules (ceil/floor conventions) in one place. DoD: threshold ceilings and whole-pound taxable-pay floors have named owners; consumers do not duplicate them.
- [ ] Generated projections as the only path for UI band tables, tools, `/api/tax-rates`, structured data and llms.txt facts (Dataset JSON-LD currently projects independently of `crawlableTaxFacts`). DoD: all listed surfaces read one projection source; the independent JSON-LD projection is gone.
- [ ] Generated MDX tax facts: server components for band tables, threshold facts, worked examples, current-year labels, source links and last-verified dates. DoD: evergreen posts consume the components; historical posts stay pinned to their stated year; no hardcoded current-year values in evergreen MDX.
- [ ] Annual Budget workflow: value-only updates touch only policy/sources/fixtures. DoD: hardcoded years removed from `e2e/scripts/generate-golden-master.ts` and `scripts/audit-blog-content.ts`; the compile-forced `studentLoanPlans` per-year map folds into the policy records; a dry-run year update touches no other files.
- [ ] Golden-master generator rate-unit bug: `generate-golden-master.ts` filters bands with decimal rates (`0.2/0.4/0.45`) against percent-stored values, so fixture threshold metadata is silently `undefined`. DoD: filter matches stored units, metadata populated, regression test; fix alongside the unit-explicit policy schema.
- [ ] Evergreen-content policy-value guard: extend `audit-blog-content --strict` to reject literal rates in evergreen posts. Import-boundary and tax-fact guards already run in `check:repo`; do not recreate them. DoD: the residual blog guard fails on a seeded violation.

Implementation sequencing for these items remains documented in the ownership audit report §6, beginning with its recommended Scottish vertical.

### Verification

- [ ] Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history). DoD: each supported year has independent fixtures at each band edge.
- [ ] Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern). DoD: each band edge has a fixture whose expected values are derived from statutory numbers, not repo thresholds.
- [ ] Director annual-method consistency test: Scottish-tool/main-engine and NI-tool/main-engine comparisons exist. DoD: the remaining Director annual-method comparison has a documented tolerance and passes.
- [ ] Article-to-engine verification for every published figure in evergreen posts. DoD: a check maps each evergreen figure to verified engine output and fails on drift.
- [ ] Fixture provenance controls: per-scenario official-figure citations; derivations start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources (the PR #83 lesson). DoD: every fixture carries a source citation and the review rule is written into `TESTING.md`.
- [ ] Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims. DoD: the report generates from fixtures and the public claims cite it.
- [ ] Machine-readable verification output (extend `/api/tax-rates` or a dedicated route). DoD: the route serves generated verification data and is covered by a test.
- [ ] Documented modelling assumptions and limitations (month-1 projection, NI year model and pension method). Non-cumulative tax-code limitations are now visible. DoD: the remaining assumptions are published where users see results and kept in sync with the engine.

### Trust and sourcing

- [ ] Revenue Scotland misattribution: homepage FAQ link label, compliance page (twice), llms.txt. Scottish income tax is set by the Scottish Parliament and administered by HMRC. DoD: the homepage FAQ, both compliance references and `llms.txt` state the Parliament/HMRC roles correctly.
- [ ] Compliance-page overclaims: "historical rates back to 2020/21" (data starts 2023-24), "updates within 24 hours / same day / immediately", "independently verified against Revenue Scotland", ITTOIA 2005 cited for income-tax rates (ITA 2007 / Finance Acts / SRR). DoD: each claim corrected to match verifiable evidence or removed.
- [ ] Official-source registry: add legal basis (SRR motions, ITA 2007, SI numbers) alongside URLs. DoD: the registry lists legal bases and trust surfaces cite them correctly.
- [ ] Homepage and llms.txt trust wording aligned to what fixtures actually prove. DoD: wording states only what the verification suites demonstrate.
- [ ] Replace unsupported accuracy/verification claims with evidence-backed wording generated from verification output (update cadence, historical coverage, testing claims). DoD: no public accuracy claim exists without generated or cited evidence.

### Content accuracy

- [ ] Scottish calculator input and trust contract: malformed or decimal salary input is silently transformed into a different integer; assumptions and primary-source path are not visible before calculation. DoD: invalid input is rejected rather than rewritten, the Income-Tax-only scope and assumptions are explicit, an official source is visible, and focused tests pin the behaviour.
- [ ] Featured Scottish comparison article: rebuild the stale 2025-26 live comparison for 2026/27, independently re-derive every worked figure, narrow overconfident pension/bonus/relocation claims and expose dated primary sources. Keep its URL and differentiated comparison purpose. DoD: current bands and examples match independent working, assumptions are explicit, and factual/schema regression tests pass.
- [ ] Tax-code guide: add the statutory 50% overriding limit; fix the "K500 = you owe £5,000" conflation; refresh stale 2025-26 titles/meta; cover Scottish SD codes. DoD: all four corrections published and consistent with the engine.
- [ ] £40k, £60k and £100k salary articles: independently rebuild current PAYE and Student Loan figures, put the qualified annual/monthly answer first, state calculation and pension-method assumptions, and remove contradictory FAQ outputs and unsupported lifestyle, prevalence, savings, housing and accountant-value claims. Keep the existing URLs. DoD: displayed figures reproduce from independent working, visible copy/metadata/schema agree, and focused drift tests pass.
- [ ] Remaining salary-page unsupported-claim audit: after the priority repair, inspect the retained series for uncited percentile/median, lifestyle, rent, savings and mortgage claims. The verified £70k article is the reference pattern and should not be rewritten without a reproduced defect. DoD: each remaining claim is sourced from an appropriate primary dataset, qualified or removed.
- [ ] FAQ extraction boundary: `extractFAQs` treats bold labels outside a genuine FAQ section as questions, producing malformed FAQ schema. DoD: extraction is constrained to deliberate FAQ content and a regression test rejects label/list artefacts from the Scottish comparison article.
- [ ] Evergreen vs historical article policy: frontmatter declares the mode. DoD: evergreen posts contain no hardcoded rate values; historical posts stay pinned and labelled; the blog audit enforces the split.
- [ ] Blog visual refresh: regenerate legacy post images into the Ledger editorial style and retire stale tax-year content in small verified batches. DoD: each batch lands with refreshed imagery and verified figures.

### Production and public evidence

Work here completes only against deployed behaviour, external services or recorded external evidence — not local tests.

- [ ] Production verification of analytics consent withdrawal behaviour (post-PR #78). DoD: dashboard and behaviour evidence recorded in a dated report.
- [ ] Periodic external oracle cross-check (HMRC test data or an independent calculator sample). DoD: a dated report records the sample, source and outcome.

## Parked / Triggered work

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants. Trigger: Search Console shows material impressions or confusing snippets for retired routes. DoD: affected routes redirected or cleaned, with the GSC evidence and outcome recorded.
- Beginner-guide discovery follow-up. Trigger: Google has recrawled the 29 July rewrite and matched page/query evidence still shows no discovery. DoD: diagnose the post-recrawl evidence before changing content or internal prominence.
- Local Search Console CSV analyser. Trigger: redacted page/query exports are available and another manual reconciliation would otherwise be required. DoD: a small credential-free script produces reproducible summaries without storing personal or sensitive exports.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison. Trigger: an explicit product decision that one variant is genuinely useful, evaluated one at a time. DoD: the chosen variant ships tested and verified, not as growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs. Trigger: evidence that the existing static HTML, visible citations, Dataset JSON-LD and crawlable tax facts stop serving AEO/GEO needs. DoD: a documented decision either adds the docs with owners or confirms the current assets suffice.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
