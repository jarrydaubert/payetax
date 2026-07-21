# PayeTax Backlog

Backlog for the public R&D version of PayeTax.

Keep this file for active or parked future work only. Closed work belongs in GitHub pull requests, release reports, or commit history. Programme context and evidence live in `docs/reports/paye-tax-domain-ownership-audit-2026-07-19.md` and the production truth audit that preceded PRs #82/#83.

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
| Current ownership audit | A current audit maps, per deduction, who owns policy data, mechanics, orchestration and verification, and where duplication or drift remains. | To verify | |
| Effective-dated policy model | Published rates, thresholds and effective dates live in one model that represents mid-year changes as data. | To verify | |
| One policy selector | A single selector resolves the policy in force for a tax year and effective date; consumers do not re-derive it. | To verify | |
| One shared pay-basis derivation | Pay-period and annual bases are derived once and shared, not recomputed per consumer. | To verify | |
| One rule owner for Income Tax | Income Tax mechanics live in one clearly owned rule module. | To verify | |
| One rule owner for National Insurance | National Insurance mechanics live in one clearly owned rule module. | To verify | |
| One rule owner for student loans | Student loan mechanics live in one clearly owned rule module. | To verify | |
| Explicit pension-method handling | Salary-sacrifice, net-pay and relief-at-source are handled explicitly, with the method exposed in the result. | To verify | |
| Shared tax-code interpretation | One tax-code interpretation is shared by engine, decoder, validation and any edit gate. | To verify | |
| Shared period-conversion and rounding ownership | Period-conversion factors and rounding conventions are owned in one place and reused. | To verify | |
| One supported route for each statutory calculation | Each statutory calculation is reachable through one supported route, with no duplicate or test-only calculators. | To verify | |
| A transparent result that clearly exposes the selected policy, calculation basis, relevant pay bases and individual deductions | One result exposes the policy selected, the calculation basis, the relevant pay bases and each individual deduction, without callers reassembling them. | To verify | |
| Compact independent full-calculation fixture set | A small set of JSON fixtures, derived independently of production code, covers representative full-calculation interactions. | To verify | |
| Balanced test portfolio and updated `TESTING.md` | JSON fixtures, TypeScript rule and boundary tests, and Playwright journeys are balanced, with `TESTING.md` describing the split. | To verify | |
| Root repository hygiene and generated-artifact ownership | Every root item has a clear current purpose; required framework and tooling files remain in conventional locations, generated caches and disposable outputs are ignored, deliberately tracked evidence is justified, and obsolete or duplicated items are resolved without cosmetic restructuring. | To verify | |
| Final backlog reconciliation | After the foundation audit, the detailed backlog items are reconciled against verified outcomes. | To verify | |

**Burn-down rule**

- A focused foundation slice must update this section in the same pull request.
- Once an outcome is verified and any required work is merged, remove its open row rather than retaining completed work in the backlog.
- Preserve completion evidence in the pull request, commit history or a dated report.
- If an audit confirms that no work is required, remove the row and cite the audit reference in the related pull request.
- Keep slices small and independently reviewable.
- The permanent north star and flow descriptions remain after the burn-down rows have been removed.

### Tax correctness and product semantics

- K-code overriding limit base: the 50% cap uses gross-minus-pension including non-employment income the engine also PAYE-taxes monthly. Decide the correct payment base for mixed-income users and add fixtures.
- Pension method semantics: the engine treats every pension input as salary sacrifice (reduces NI). Add explicit salary-sacrifice / net-pay / relief-at-source handling or, at minimum, disclose the assumption at the input and in results.
- Emergency codes W1/M1/X: parsed and flagged internally but silently computed cumulatively with no caveat in the main calculator results. Model the non-cumulative basis or disclose.
- State Pension age transition: engine and `BasicInputs` hardcode 66 while SPA moves to 67 during 2026–2028. Replace the fixed age with a date-of-birth-aware rule or clearly framed self-declaration only.
- Marriage Allowance treatment: modelled as +£1,260 allowance rather than a 20% tax reducer; deviates for Scottish taxpayers and edge cases. Decide and fix with fixtures.
- Personal Allowance taper parameterisation: `taxableThresholdToTotalIncome` hardcodes the £1-per-£2 taper shape instead of consuming `personalAllowanceReductionRate` (PR #83 review note).
- Dead `taxRateDescriptions.ts` module: zero production consumers and emits "2000% basic rate" (`rate * 100` on percent values); remove it or fix and consume it. Found during the ownership audit.
- `pensionOptimizer` hardcodes a 60% trap rate (rUK 40%+20% assumption) — wrong framing for Scottish taxpayers.

### Tax-domain architecture

- Unambiguous annual-policy schema: unit- and basis-explicit fields (taxable vs total income, percent vs fraction, per-year vs per-week), effective-dated rates for mid-year changes.
- One supported tax-domain public interface (`src/lib/tax/index.ts`); application code stops importing `constants/taxRates` and domain internals directly.
- Consolidate income-tax band mechanics (currently 4 implementations plus 2 display interpreters).
- Consolidate student-loan mechanics (currently 3 implementations).
- One tax-code grammar shared by engine, decoder, validation schema and store edit-gate (currently 4).
- Remove shadow helpers that tests exercise but production never calls (`calculateIncomeTaxFromBands`, `calculateStudentLoanRepayments`, `payrollPeriodDeductions` as production-adjacent code, `taxRateDescriptions`).
- NI pay-date basis: payroll rate selection derives a pay date from the tax period start, so a weekly or four-weekly period straddling a mid-year rate change takes the earlier rate. Accept a real pay date where callers have one.
- Explicit ownership of pay-period conversion and rounding rules (factors, ceil/floor conventions, period scaling) in one place.
- Generated projections as the only path for UI band tables, tools, `/api/tax-rates`, structured data and llms.txt facts (Dataset JSON-LD currently projects independently of `crawlableTaxFacts`).
- Generated MDX tax facts: server components for band tables, threshold facts, worked examples, current-year labels, source links and last-verified dates; evergreen posts consume them, historical posts stay pinned to their stated year.
- Annual Budget workflow: value-only updates touch only policy/sources/fixtures; remove hardcoded years in `e2e/scripts/generate-golden-master.ts` and `scripts/audit-blog-content.ts`, and fold the compile-forced `studentLoanPlans` per-year map into the policy records.
- Golden-master generator rate-unit bug: `generate-golden-master.ts` filters bands with decimal rates (`0.2/0.4/0.45`) against percent-stored values, so fixture threshold metadata is silently `undefined`. Fix alongside the unit-explicit policy schema.
- CI drift guards: import-boundary lint; a `check:tax-facts` scan for hardcoded policy values outside the domain, fixtures and pinned content; extend `audit-blog-content --strict` to reject literal rates in evergreen posts.
- Migration slices and the recommended Scottish-vertical first slice: see the ownership audit report §6.

### Verification and public evidence

- Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history).
- Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern).
- Cross-tool consistency tests: Scottish tool vs main engine, NI tool vs main engine, director annual method vs engine, with documented tolerance.
- Article-to-engine verification for every published figure in evergreen posts.
- Fixture provenance controls: per-scenario official-figure citations; derivations must start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources, not the stored table (the PR #83 lesson).
- Periodic external oracle cross-check (HMRC test data or an independent calculator sample) recorded as a dated report.
- Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims.
- Machine-readable verification output (extend `/api/tax-rates` or a dedicated route).
- Documented modelling assumptions and limitations (month-1 method, emergency-code handling, NI year model, pension method).

### Trust and sourcing

- Revenue Scotland misattribution: homepage FAQ link label, compliance page (twice), llms.txt. Scottish income tax is set by the Scottish Parliament and administered by HMRC.
- Compliance-page overclaims: "historical rates back to 2020/21" (data starts 2023-24), "updates within 24 hours / same day / immediately", "independently verified against Revenue Scotland", ITTOIA 2005 cited for income-tax rates (ITA 2007 / Finance Acts / SRR).
- Official-source registry: add legal basis (SRR motions, ITA 2007, SI numbers) alongside URLs; correct legislative attribution across trust surfaces.
- Homepage and llms.txt trust wording aligned to what fixtures actually prove.
- Replace unsupported accuracy/verification claims with evidence-backed wording generated from verification output (update cadence, historical coverage, testing claims).

### Content accuracy

- Featured Scottish comparison article: still presents 2025-26 bands as the live comparison months into 2026-27; refresh via the first generated MDX band table where possible.
- Tax-code guide: add the statutory 50% overriding limit; fix the "K500 = you owe £5,000" conflation; refresh stale 2025-26 titles/meta; cover Scottish SD codes.
- Salary-page figures (£40k–£100k series): generate tables from verified engine output instead of hand-computed values that drift by £2–£6.
- Unsupported percentile/median/average salary claims across salary pages (internally inconsistent; uncited); source from ONS ASHE or remove.
- Unsupported lifestyle, rent and mortgage claims: source, soften or remove.
- Evergreen vs historical article policy: frontmatter declares the mode; evergreen posts must contain no hardcoded rate values; historical posts stay pinned and labelled.
- Search Console-led prioritisation of which pages get corrected first (blocked on obtaining GSC evidence — see Operations).
- Blog visual refresh: regenerate legacy post images into the Ledger editorial style and retire stale tax-year content in small verified batches.

### Operational follow-up

- Production verification of analytics consent withdrawal behaviour (post-PR #78 dashboard and behaviour evidence).
- Obtain and record Search Console page-performance evidence in-repo so content prioritisation stops relying on assumptions; do not treat Vercel traffic as popularity evidence.
- Marginal-rate chart shows the nominal 45% instead of the ~60%/67.5% effective rate inside the £100k–£125,140 taper (`chartUtils.estimateMarginalRate`, PR #83 review note).

## Parked

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants: revisit only if Search Console shows material impressions or confusing snippets for retired routes.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison: evaluate one at a time only when the workflow is genuinely useful, tested, and not just growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs: PR notes and product direction already treat static HTML, visible citations, Dataset JSON-LD, and crawlable tax facts as the real AEO/GEO assets.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
