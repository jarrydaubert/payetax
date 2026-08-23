# High-value Organic Landing Pages: Reconciled Audit, 23 August 2026

**Status:** audit evidence only; no production behaviour changed

**Code baseline:** clean `main` at `e16c10fc37bfa323ae4785910fa1472fe23ddd60`
(merged PR #112)

**Selection basis:** actual Google Search Console landing-page performance, not keyword research

## Method and evidence boundary

This report reconciles the independent Codex and Claude audit conclusions supplied for this slice.
No conclusion is retained merely because a model stated it. Each retained finding was reproduced
from current merged source, current calculation output, an existing dated evidence report or a
primary official source.

The external Claude approval of PR #112 is a supplied review fact rather than a formal GitHub
review event. The tax-code findings it approved are independently supported by current code,
fixtures and the [tax-code correctness report](tax-code-correctness-follow-up-2026-08-23.md).

Calculation comparisons below use 2026/27, monthly pay, category A NI, the stated regional code,
no pension, no Student Loan and no other deductions unless stated. Production-engine output is
used to reproduce internal inconsistency, not as independent proof of itself. Statutory rules and
expected mechanics are checked against the primary sources below.

## Primary sources

- [HMRC: Income Tax rates and Personal Allowances](https://www.gov.uk/income-tax-rates)
- [HMRC: rates and thresholds for employers, 2026/27](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027)
- [HMRC: employee National Insurance rates](https://www.gov.uk/national-insurance-rates-letters/contribution-rates)
- [Scottish Government: Scottish Income Tax rates and bands, 2026/27](https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/)
- [Scottish Budget 2026/27: Income Tax policy and Rate Resolution](https://www.gov.scot/publications/scottish-budget-2026-2027/pages/4/)
- [HMRC: Scottish Income Tax](https://www.gov.uk/scottish-income-tax)
- [HMRC: workplace pension methods](https://www.gov.uk/workplace-pensions/managing-your-pension)
- [HMRC: 2026/27 Student Loan deduction tables](https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables)
- [ONS: Employee earnings in the UK, 2025](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025)
- [HMRC: Tax-Free Childcare adjusted-net-income condition](https://www.gov.uk/hmrc-internal-manuals/tax-free-childcare-technical-manual/tfc11050)
- [GOV.UK: Free Childcare for Working Parents eligibility](https://www.gov.uk/free-childcare-if-working/check-youre-eligible)
- [HMRC payroll-software specification and tax-code sources](tax-code-correctness-follow-up-2026-08-23.md#primary-evidence)

Search observations and internal-link evidence come from the
[search-discoverability evidence audit](search-discoverability-evidence-audit-2026-08-23.md).

## Status summary

| Surface | Accuracy | Structure | Search-intent fit | Trust presentation | Decision |
| --- | --- | --- | --- | --- | --- |
| `/tools/scottish-tax-calculator` | **ISSUE** | **ADEQUATE** | **STRONG** | **ADEQUATE** | First correctness slice; protect purpose and URL |
| £40k salary article | **ISSUE** | **WEAK** | **ADEQUATE** | **WEAK** | Evidence-first repair now; retain URL |
| £60k salary article | **ISSUE** | **WEAK** | **ADEQUATE** | **WEAK** | Evidence-first repair now; retain URL |
| £70k salary article | **PASS** | **STRONG** | **STRONG** | **STRONG** | Protect and monitor |
| £100k salary article | **ISSUE** | **ADEQUATE** | **STRONG** | **WEAK** | Evidence-first repair now; retain URL |
| Scottish-vs-English comparison | **ISSUE** | **WEAK** | **STRONG** | **WEAK** | Current-year correctness priority |
| `/tools/tax-code-decoder` | **PASS** | **STRONG** | **STRONG** | **STRONG** | Materially resolved; protect tool-first model |

`ISSUE` means at least one reproduced correctness or materially misleading-risk defect. It does
not mean every statement on the page is wrong.

## `/tools/scottish-tax-calculator`

### Confirmed findings

- **Correctness retained:** the tool selects `CURRENT_TAX_YEAR`, uses the owned annual
  `calculateIncomeTax()` mechanic for both Scotland and rUK, and dynamically renders the canonical
  Scottish bands. The 2026/27 thresholds and rates match Scottish Government and HMRC tables.
- **Correctness defect:** the text input removes every non-digit before parsing. `-50000` becomes
  `50000`, `50000.50` becomes `5000050`, and non-numeric text becomes zero. The tool can therefore
  return a confident answer for a different salary from the value entered.
- **Misleading risk:** the page's differentiated purpose is annual **Income Tax** comparison, not
  full PAYE or take-home comparison. That scope appears in metadata and after the result, but the
  H1/lead and “Quick Comparison” framing can be read more broadly. Assumptions are not presented
  before calculation.
- **Trust gap:** current bands are visible, but the page has no direct primary-source/checking path.
  Some rate/threshold prose is static beside the generated table, creating avoidable drift risk.
- **Static-copy correctness defect:** the FAQ says people earning under roughly £28,000 often pay
  less Scottish Income Tax. Using the published 2026/27 bands and a full £12,570 Personal
  Allowance, the annual rUK and Scottish liabilities are equal at approximately £33,493. At
  £29,526, cumulative Scottish tax is £3,351.53; the 21% Scottish intermediate rate then closes
  the £39.67 advantage over the 20% rUK rate across the next £3,967.
- **Optional polish:** the lead repeats “how much”. This is not the reason to change the page.

### Current status and decision

The calculation owner and current policy are sound, and the 2026/27 £50,000 regression test pins
Scottish £8,982, rUK £7,486 and the £1,496 difference. Fix input validation and make the income-tax-
only assumptions/source visible, and correct the static crossover copy to approximately £33,493.
Preserve the canonical URL, navigation footprint and the Scottish-versus-rUK comparison purpose;
do not turn it into another full calculator.

## £40k salary article

### Confirmed findings

- **Internal correctness inconsistency:** the article gives £5,486 Income Tax, £2,194 NI and
  £32,320 take-home. The current monthly PAYE model with `1257L` gives £5,484, £2,193.96 and
  £32,322.04. An annual statutory approximation can explain most of the difference, but the page
  says it uses the current PAYE calculator without naming that different basis.
- **Payroll defect:** its Plan 2 text uses an annual formula (£955), while current equal-month
  payroll deductions are £79 per month and £948 per year. The article then gives conflicting
  monthly outcomes (£2,614 in the body and about £2,607 in the FAQ).
- **Misleading pension explanation:** “standard workplace pension” is treated as one generic
  pre-tax method. Salary sacrifice, net pay and relief at source have different Income Tax, NI and
  payslip effects, and contributions may use qualifying earnings rather than whole salary.
- **Incorrect-source risk, not merely a missing citation:** the article repeatedly says the UK
  median salary is around £35,000. The latest applicable ONS ASHE evidence reviewed for this audit
  reports median gross annual earnings of £39,039 for full-time employees who had been in their
  jobs for at least a year in April 2025. The article's claim therefore appears materially
  inconsistent with the applicable evidence and should be verified against the then-current ONS
  definition and value, then corrected or removed rather than merely given a citation.
- **Unsupported claims:** percentile, rent, lifestyle, savings targets and mortgage capacity lack
  a defined dataset or primary citation and are presented too categorically.
- **Structure/search:** title, metadata and H1 fit `40k after tax`, but the opening and first
  extracted FAQs lead with lifestyle/prevalence rather than the qualified answer. “Common
  Questions” and “Frequently Asked Questions” also create duplicated FAQ entities.

### Current status and decision

This page has genuine page-one visibility and should keep its URL. Rebuild its facts from an
independent 2026/27 calculation basis, state payroll assumptions, put annual/monthly take-home
first, describe pension methods explicitly, remove unsupported personal-finance/lifestyle claims,
verify and correct/remove the median claim against then-current ONS evidence, and make the visible
FAQ set the intended schema set.

## £60k salary article

### Confirmed findings

- **Internal correctness inconsistency:** the article gives £11,432 Income Tax, £3,211 NI and
  £45,357 take-home. Current monthly PAYE output is £11,424, £3,210 and £45,366. The article does
  not explain that its annual approximation differs from payroll-period calculation.
- **Payroll defect:** equal-month Plan 2 deductions are £229 per month and £2,748 per year, not the
  £2,755 annual figure shown. The body and FAQ also disagree on the resulting monthly take-home.
- **Misleading pension explanation:** the 5% example mixes relief rates and says the result varies
  by method without actually defining which method produced the displayed take-home. Later
  “£100 costs £60” claims are not true for every workplace-pension cash-flow method.
- **Unsupported claims:** top-15%, class, housing, lifestyle and prescribed savings claims lack a
  defined source and add little value to the after-tax query.
- **Structure/search:** the title/H1 fit the dominant intent, but the lead and first FAQ entity
  delay the answer behind earnings-position and lifestyle framing.

### Current status and decision

Keep the URL and higher-rate explanatory purpose. Apply the same answer-first, independently
verified and method-explicit pattern as £70k; remove unsupported advice rather than sourcing it
for decoration.

## £70k salary article

### Confirmed findings

- **Correctness:** its rounded baseline (£15,427 Income Tax, £3,410 employee NI, £51,163 annual
  and £4,264 monthly take-home) matches the current monthly PAYE model. Its Plan 2 and 5% whole-
  salary-sacrifice examples also reproduce current payroll-period mechanics.
- **Assumptions:** the opening says “estimates”, then lists region, code, pay period, NI category,
  pension/loan exclusions and other deductions before the detail.
- **Pension trust:** it distinguishes salary sacrifice, net pay and relief at source and warns
  that qualifying-earnings definitions can change the contribution.
- **Structure/search:** title, metadata, H1, opening and first FAQ all answer the same after-tax
  intent. Official sources are grouped and linked. Unsupported percentile/lifestyle claims are
  explicitly declined.

### Current status and protect decision

This is the editorial reference pattern. Its recent Search Console query expansion was still being
reassessed on 23 August. Do not rewrite it for generic SEO scoring, extra length or stylistic
uniformity. Change only a reproduced factual defect or evidence-backed search presentation issue.

## £100k salary article

### Confirmed findings

- **Internal correctness inconsistency:** the article gives £27,432 Income Tax, £4,011 NI and
  £68,557 take-home. Current monthly PAYE output is £27,427.20, £4,010.04 and £68,562.76. Again,
  the article presents an annual approximation as the calculator result without explaining basis.
- **Payroll defect:** equal-month Plan 2 deduction is £529 per month and £6,348 annually. One body
  result rounds correctly to about £5,184 monthly take-home, while the final FAQ says about £5,177.
- **Misleading pension claims:** the page conflates salary sacrifice, net pay and relief at source;
  says a £10,000 sacrificed employer contribution receives further tax relief; calls the exchange
  a 160% “instant return”; and implies the employee automatically receives employer-NI savings.
- **Missing high-income childcare consequence:** Tax-Free Childcare eligibility is affected when
  adjusted net income exceeds £100,000. Free Childcare for Working Parents also has a £100,000
  adjusted-net-income condition and is England-specific. These are separate eligibility facts to
  verify against current official sources during repair, not components of the Income Tax marginal
  rate and not financial advice.
- **Unsupported claims:** percentile, lifestyle, housing, mortgage and savings-capacity assertions
  lack defined evidence. “The smart strategy: stay at £100k” is financial advice framed as a
  universal answer despite cash-flow, allowance, annual-allowance and scheme differences.
- **Structure/search:** the taper is relevant mixed intent, but the opening delays the exact
  take-home answer and the first FAQ entities prioritise salary quality/lifestyle. Duplicate
  question sections inflate the schema set.

### Current status and decision

Keep the established URL and taper explainer. Put the qualified £100k answer first, separate
statutory annual taper examples from payroll projections, make pension method and adjusted-net-
income assumptions explicit, and remove categorical advice and unsupported lifestyle claims.
Verify and source the childcare eligibility consequences current at the time of repair, keeping
their geographic and adjusted-net-income scope separate from the tax-taper explanation.

## Scottish-vs-English comparison article

### Confirmed findings

- **Current-year defect:** this featured article still presents 2025/26 as the live comparison in
  title, metadata, bands, examples, CTA and update line during 2026/27. The current Scottish
  starter/basic thresholds changed, so this is not a cosmetic year replacement.
- **Worked-figure defect:** even for 2025/26, the £150,000 difference is stated as about £6,340.
  The owned annual mechanics reproduce Scottish tax of £59,666.10 and rUK tax of £53,703, a
  £5,963.10 difference. NI is common and cannot explain the extra £377.
- **Static crossover defect:** the article repeatedly carries the old roughly £30,300 crossover.
  The independently derived annual 2026/27 crossover is approximately £33,493 under a full
  Personal Allowance, using the published Scottish starter/basic/intermediate bands and the rUK
  20% basic rate.
- **Misleading claims:** “HMRC-accurate” and “exact” are broader than the article's assumptions and
  unsupported by a public verification output. Pension relief, bonus timing, relocation and
  Marriage Allowance are presented too categorically; the current engine itself still has an open
  Scottish Marriage Allowance modelling decision.
- **Schema defect:** the FAQ extractor treats bold labels anywhere in the document as questions.
  Current output includes “Average Band D 2025-26:”, “Important caveats:” and “You pay Scottish
  tax if:” as FAQ entities, with truncated/list-like answers. This is a systemic parser problem,
  not merely bad prose in this article.
- **Structure/trust:** the core comparison intent, salary examples and link to the differentiated
  calculator are valuable, but stale facts, long lifestyle/relocation sections and weak source
  control bury the current answer.

### Current status and protect decision

This is a current-year correctness priority. Retain the URL and the focused Scottish-versus-rUK
Income Tax comparison. Rebuild 2026/27 bands and every example from primary sources plus
independent working, remove unproven advice, label assumptions, add source dates, and fix the FAQ
extractor with a regression test rather than editing around it. Replace the old crossover copy
with the independently derived approximately £33,493 figure in the same correctness slice.

## `/tools/tax-code-decoder`

### Confirmed findings

- **Materially resolved:** PRs #111/#112 established one parser/semantic owner for the decoder and
  calculator, corrected code-derived amounts, M/N wording, K additional-pay semantics, current
  Scottish/Welsh D-code handling and malformed-code rejection.
- **Supported boundaries:** current tests cover rUK, S/C prefixes, M/N, K1–K9999, current SD0–SD3,
  `W1`/`M1`/`X`/`NONCUM`, the seven-character `999999T` example, prefixed length limits and
  malformed/bare inputs.
- **Trust:** the page explains that code numbers represent the tax-free amount assigned to that
  employment or pension, links to HMRC's checker and guidance, and tells users what to do when a
  code looks unexpected.
- **Product fit:** the tool remains interaction-first, keeps its canonical URL and links to the
  calculator without pretending unsupported `?taxCode=` prefill exists.

### Current status and protect decision

No further high-priority decoder correction was reproduced. Preserve the shared semantic owner,
tool-first layout, canonical and primary-source path. The stale public tax-code article is separate
work and must not be treated as evidence that the decoder remains defective.

## Discrepancies requiring a focused decision

- **Pension methods:** the engine input currently means salary sacrifice, while several articles
  discuss net pay and relief at source as though one displayed result represented all three. A
  Foundation slice must either model the methods explicitly or narrow and expose the product
  contract before the articles can share one generic pension example.
- **Scottish Marriage Allowance:** the current allowance-addition model does not reproduce the
  statutory tax-reducer treatment for all Scottish and edge cases. Do not publish categorical
  Scottish savings until the tax-domain decision and fixtures are complete.
- **Article calculation basis:** £40k, £60k and £100k mix annual-formula figures with equal-month
  PAYE results while calling both calculator output. The repair needs one explicit editorial rule
  for presenting statutory annual illustrations versus payroll-period projections.

These decisions are bounded implementation slices, not blockers to this audit or reasons to
change URLs, indexability policy or the calculator architecture broadly.

## Cross-page decisions

### Make now

1. Scottish calculator validation/scope/source corrections and the 2026/27 Scottish comparison
   rebuild, including the systemic FAQ extractor guard.
2. Evidence-first £40k/£60k/£100k repairs, with independent calculations and explicit pension
   methods.

### Test rather than assume

- Search snippets and CTR changes after factual repairs; page-one position does not prove a title
  rewrite will improve CTR.
- Measure the effect of the already justified small contextual-link slice rather than assuming it;
  gate another beginner-guide content or intent overhaul on recrawl and matched page/query evidence.
- Query overlap among general guides only with matched query/page exports.

### Protect

- Existing canonical salary URLs.
- £70k's concise qualified answer, assumptions, official sources and FAQ ordering.
- The Scottish calculator's differentiated Income Tax comparison and strong contextual links.
- The decoder's shared model and checking path.
- Retired-route redirects and current indexability policy absent new evidence.

## Audit stop

This report records current evidence and priority. It changes no route, calculation, metadata,
schema, content or indexability behaviour.
