# PayeTax Backlog

Backlog for the public R&D version of PayeTax.

Keep this file for active or parked future work only. Closed work belongs in GitHub pull requests, release reports, or commit history. Programme context and evidence live in `docs/reports/paye-tax-domain-ownership-audit-2026-07-21.md` and the production truth audit that preceded PRs #82/#83.

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

Status is `To verify` for every row until a focused audit establishes whether each outcome is complete, partial or requires work. An item is not assumed incomplete merely because it also appears in the detailed backlog below.

| Concern | Desired outcome | Current status | Evidence or completion reference |
| --- | --- | --- | --- |
| Effective-dated policy model | Published rates, thresholds and effective dates live in one model that represents mid-year changes as data. | To verify | |
| One policy selector | A single selector resolves the policy in force for a tax year and effective date; consumers do not re-derive it. | To verify | |
| One shared pay-basis derivation | Pay-period and annual bases are derived once and shared, not recomputed per consumer. | To verify | |
| Explicit pension-method handling | Salary-sacrifice, net-pay and relief-at-source are handled explicitly, with the method exposed in the result. | To verify | |
| A transparent result that clearly exposes the selected policy, calculation basis, relevant pay bases and individual deductions | One result exposes the policy selected, the calculation basis, the relevant pay bases and each individual deduction, without callers reassembling them. | To verify | |
| Compact independent full-calculation fixture set | A small set of JSON fixtures, derived independently of production code, covers representative full-calculation interactions. | To verify | |
| Balanced test portfolio and updated `TESTING.md` | JSON fixtures, TypeScript rule and boundary tests, and Playwright journeys are balanced, with `TESTING.md` describing the split. | To verify | |
| Final backlog reconciliation | After the foundation audit, the detailed backlog items are reconciled against verified outcomes. | To verify | |

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
- [ ] Emergency codes W1/M1/X: parsed and flagged internally but silently computed cumulatively. DoD: non-cumulative basis modelled, or a visible caveat in main calculator results; tests cover the chosen behaviour.
- [ ] State Pension age transition: engine and `BasicInputs` hardcode 66 while SPA moves to 67 during 2026–2028. DoD: date-of-birth-aware rule or clearly framed self-declaration replaces the fixed age, with tests at the transition boundary.
- [ ] Marriage Allowance treatment: modelled as +£1,260 allowance rather than a 20% tax reducer; deviates for Scottish taxpayers and edge cases. DoD: documented decision, implementation matching it, and fixtures including Scottish cases.
- [ ] Personal Allowance taper parameterisation: `taxableThresholdToTotalIncome` hardcodes the £1-per-£2 taper shape instead of consuming `personalAllowanceReductionRate` (PR #83 review note). DoD: the function consumes the policy rate; a test pins behaviour for a non-default rate.
- [ ] Dead `taxRateDescriptions.ts` module: zero production consumers and emits "2000% basic rate" (`rate * 100` on percent values). DoD: module removed, or fixed and consumed by production; either outcome asserted by tests.
- [ ] `pensionOptimizer` hardcodes a 60% trap rate (rUK 40%+20% assumption) — wrong framing for Scottish taxpayers. DoD: trap framing derives from policy data or is region-aware/disclosed; a test covers the Scottish case.
- [ ] Marginal-rate chart shows the nominal 45% instead of the ~60%/67.5% effective rate inside the £100k–£125,140 taper (`chartUtils.estimateMarginalRate`, PR #83 review note). DoD: chart reflects the effective rate in the taper band or explicitly labels the nominal basis; a test pins the taper band.

### Tax-domain architecture

- [ ] Unambiguous annual-policy schema: unit- and basis-explicit fields (taxable vs total income, percent vs fraction, per-year vs per-week), effective-dated rates for mid-year changes. DoD: policy records carry explicit units/bases and effective dates; consumers compile against the new schema.
- [ ] One supported tax-domain public interface (`src/lib/tax/index.ts`); application code stops importing `constants/taxRates` and domain internals directly. DoD: the `check:tax-imports` baseline shrinks to zero direct imports.
- [ ] Display band interpreters still re-derive band presentation outside the owned mechanics (rUK and Scottish slicing each have one owner since #86/#98). DoD: display code consumes owned mechanics or generated projections; no independent band maths remains in display modules.
- [ ] Shadow helper `taxRateDescriptions` is test-only production-adjacent code. DoD: resolved together with the `taxRateDescriptions.ts` item under Tax correctness; no test-only shadow module remains.
- [ ] NI pay-date basis: payroll rate selection derives a pay date from the tax period start, so a weekly or four-weekly period straddling a mid-year rate change takes the earlier rate. DoD: callers pass a real pay date where they have one; a straddling-period test takes the later rate when the pay date does.
- [ ] Explicit ownership of deliberate statutory and payroll rounding rules (ceil/floor conventions) in one place. DoD: threshold ceilings and whole-pound taxable-pay floors have named owners; consumers do not duplicate them.
- [ ] Generated projections as the only path for UI band tables, tools, `/api/tax-rates`, structured data and llms.txt facts (Dataset JSON-LD currently projects independently of `crawlableTaxFacts`). DoD: all listed surfaces read one projection source; the independent JSON-LD projection is gone.
- [ ] Generated MDX tax facts: server components for band tables, threshold facts, worked examples, current-year labels, source links and last-verified dates. DoD: evergreen posts consume the components; historical posts stay pinned to their stated year; no hardcoded current-year values in evergreen MDX.
- [ ] Annual Budget workflow: value-only updates touch only policy/sources/fixtures. DoD: hardcoded years removed from `e2e/scripts/generate-golden-master.ts` and `scripts/audit-blog-content.ts`; the compile-forced `studentLoanPlans` per-year map folds into the policy records; a dry-run year update touches no other files.
- [ ] Golden-master generator rate-unit bug: `generate-golden-master.ts` filters bands with decimal rates (`0.2/0.4/0.45`) against percent-stored values, so fixture threshold metadata is silently `undefined`. DoD: filter matches stored units, metadata populated, regression test; fix alongside the unit-explicit policy schema.
- [ ] CI drift guards: import-boundary lint; a `check:tax-facts` scan for hardcoded policy values outside the domain, fixtures and pinned content; extend `audit-blog-content --strict` to reject literal rates in evergreen posts. DoD: all three guards run in `check:repo` or CI and fail on seeded violations.

Implementation sequencing for these items remains documented in the ownership audit report §6, beginning with its recommended Scottish vertical.

### Verification

- [ ] Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history). DoD: each supported year has independent fixtures at each band edge.
- [ ] Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern). DoD: each band edge has a fixture whose expected values are derived from statutory numbers, not repo thresholds.
- [ ] Cross-tool consistency tests: Scottish tool vs main engine, NI tool vs main engine, director annual method vs engine. DoD: comparisons exist with documented tolerance and pass.
- [ ] Article-to-engine verification for every published figure in evergreen posts. DoD: a check maps each evergreen figure to verified engine output and fails on drift.
- [ ] Fixture provenance controls: per-scenario official-figure citations; derivations start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources (the PR #83 lesson). DoD: every fixture carries a source citation and the review rule is written into `TESTING.md`.
- [ ] Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims. DoD: the report generates from fixtures and the public claims cite it.
- [ ] Machine-readable verification output (extend `/api/tax-rates` or a dedicated route). DoD: the route serves generated verification data and is covered by a test.
- [ ] Documented modelling assumptions and limitations (month-1 method, emergency-code handling, NI year model, pension method). DoD: assumptions published where users see results and kept in sync with the engine.

### Trust and sourcing

- [ ] Revenue Scotland misattribution: homepage FAQ link label, compliance page (twice), llms.txt. Scottish income tax is set by the Scottish Parliament and administered by HMRC. DoD: the homepage FAQ, both compliance references and `llms.txt` state the Parliament/HMRC roles correctly.
- [ ] Compliance-page overclaims: "historical rates back to 2020/21" (data starts 2023-24), "updates within 24 hours / same day / immediately", "independently verified against Revenue Scotland", ITTOIA 2005 cited for income-tax rates (ITA 2007 / Finance Acts / SRR). DoD: each claim corrected to match verifiable evidence or removed.
- [ ] Official-source registry: add legal basis (SRR motions, ITA 2007, SI numbers) alongside URLs. DoD: the registry lists legal bases and trust surfaces cite them correctly.
- [ ] Homepage and llms.txt trust wording aligned to what fixtures actually prove. DoD: wording states only what the verification suites demonstrate.
- [ ] Replace unsupported accuracy/verification claims with evidence-backed wording generated from verification output (update cadence, historical coverage, testing claims). DoD: no public accuracy claim exists without generated or cited evidence.

### Content accuracy

- [ ] Featured Scottish comparison article still presents 2025-26 bands as the live comparison months into 2026-27. DoD: the article shows current-year bands, via the first generated MDX band table where possible.
- [ ] Tax-code guide: add the statutory 50% overriding limit; fix the "K500 = you owe £5,000" conflation; refresh stale 2025-26 titles/meta; cover Scottish SD codes. DoD: all four corrections published and consistent with the engine.
- [ ] Salary-page figures (£40k–£100k series): hand-computed values drift by £2–£6. DoD: tables generate from verified engine output; drift check passes.
- [ ] Unsupported percentile/median/average salary claims across salary pages (internally inconsistent; uncited). DoD: sourced from ONS ASHE or removed.
- [ ] Unsupported lifestyle, rent and mortgage claims. DoD: sourced, softened or removed.
- [ ] Evergreen vs historical article policy: frontmatter declares the mode. DoD: evergreen posts contain no hardcoded rate values; historical posts stay pinned and labelled; the blog audit enforces the split.
- [ ] Blog visual refresh: regenerate legacy post images into the Ledger editorial style and retire stale tax-year content in small verified batches. DoD: each batch lands with refreshed imagery and verified figures.

### Production and public evidence

Work here completes only against deployed behaviour, external services or recorded external evidence — not local tests.

- [ ] Production verification of analytics consent withdrawal behaviour (post-PR #78). DoD: dashboard and behaviour evidence recorded in a dated report.
- [ ] Obtain and record Search Console page-performance evidence in-repo so content prioritisation stops relying on assumptions; do not treat Vercel traffic as popularity evidence. DoD: GSC evidence committed as a dated report.
- [ ] Search Console-led prioritisation of which pages get corrected first (blocked on the GSC evidence above). DoD: a recorded priority order derived from GSC data drives the content-accuracy batches.
- [ ] Periodic external oracle cross-check (HMRC test data or an independent calculator sample). DoD: a dated report records the sample, source and outcome.

## Parked / Triggered work

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants. Trigger: Search Console shows material impressions or confusing snippets for retired routes. DoD: affected routes redirected or cleaned, with the GSC evidence and outcome recorded.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison. Trigger: an explicit product decision that one variant is genuinely useful, evaluated one at a time. DoD: the chosen variant ships tested and verified, not as growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs. Trigger: evidence that the existing static HTML, visible citations, Dataset JSON-LD and crawlable tax facts stop serving AEO/GEO needs. DoD: a documented decision either adds the docs with owners or confirms the current assets suffice.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
