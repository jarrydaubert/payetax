# Budget 2026 reader-first refresh — 28 October 2026

Base: `6f60dc9d440d2898c9a8e29260ff36bb5492cc32` (merged #144).
The supplied Claude revision is the editorial basis: retain its title, reader-first section
order, at-a-glance view, wage/savings examples, existing slug, publication date and Ledger image.
This refresh changes no calculator, canonical policy, fixture, supported year, shared component,
CSS, dependency, workflow or deployment configuration. The separate typography item is in
`BACKLOG.md`; it is not implemented in this PR. The maintainer allows the normal automatic
preview, with no merge or manual deployment.

## Primary-source verification

- [HMRC Budget 2026 OOTLAR](https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar), sections 1.1–1.5, 2.1, 2.4–2.7: proposals, dates, primary/secondary legislation and provenance.
- [Annex A](https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances): main rates, allowances, savings/property rates, NI, Child Benefit and ISA totals; independently compared with OOTLAR and the Treasury document. Child Benefit is labelled by tax year, not an invented daily commencement date.
- [Treasury Budget 2026](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html), household support, personal taxation and policy-decision tables: wage rates and other Budget measures.
- [Official minimum wage rates](https://www.gov.uk/national-minimum-wage-rates) independently confirms £12.71 → £13.21 and £11.27 for ages 18–20 from April 2027; [LPC recommendations](https://www.gov.uk/government/publications/minimum-wage-rates-for-2027) corroborate the values. The LPC landing-page introduction mistakenly says April 2026, while its table says April 2027; Treasury explicitly dates the increase 1 April 2027. The article uses that corroborated date, not the conflicting introduction.
- [Minimum wage calculation guidance](https://www.gov.uk/guidance/calculating-the-minimum-wage/calculating-the-minimum-wage): a new rate applies from the first pay reference period beginning on or after the change.
- [HMRC emergency tax codes](https://www.gov.uk/tax-codes/emergency-tax-codes): M1 calculates tax on that month's pay only; independently confirms the new plain-English explanation.
- [Finance Act 2026](https://www.legislation.gov.uk/ukpga/2026/11/contents/enacted), sections 5–8: 22/42/47% are enacted 2027/28 savings/property rates, remaining law unless amended. Budget 2026's proposed 24/44/49% replacement needs Finance Bill 2026–27. Both columns and savings examples distinguish their status.
- [HMRC online-selling guidance](https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform): selling unwanted personal possessions is usually not trading; buying/making goods to sell for profit can be. The paid-gardening example is explicitly qualifying gross trading income, not a house-clearance example. The proposed £3,000 threshold is not presented as current law or a salary allowance.
- [Budget 2025](https://www.gov.uk/government/publications/budget-2025-document/budget-2025-html) and the [pension NI Act](https://www.legislation.gov.uk/ukpga/2026/15): earlier salary-sacrifice/PTA/Plan 2 origins retained. The enacted pension framework is distinguished from operational regulations; PTA still requires the Finance Bill. No interest-cap claim is added.

The Lower Earnings Limit rises £129 → £133/week; primary, upper and secondary payment
thresholds are retained. The LEL's contribution-record role is distinguished from the employee
payment threshold, and all blanket “NI thresholds unchanged” claims have been removed. Other
NI upratings are acknowledged. The mileage change is correctly attributed to 27 October,
before Budget day, and applies to the specified own-car/van mileage case.

## Independently derived wage example

The following hand derivation uses Decimal arithmetic and official rules, not engine outputs
as an oracle. It was then cross-checked against the existing 2026/27 calculator for both salaries.
Both engine calls explicitly used **2026-2027**, with no future-year selection or policy mutation.

Sources: [HMRC PAYE routines v24.0](https://assets.publishing.service.gov.uk/media/698c9824bd090be481c2879a/PAYErout-v24-0.odt),
paragraphs 4.3–4.4, the monthly Appendix B and Month 1 basis section 8;
[Tables A](https://www.gov.uk/government/publications/tables-a-pay-adjustment-tables);
[2026/27 employer rates](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027);
[CWG2 exact-percentage NI rounding](https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions/2026-to-2027-employer-further-guide-to-paye-and-national-insurance-contributions).

Official ODT downloaded during this session, SHA-256:
`799609b7ba81b5399015b32ebdaed774683ce4992caff33d67bbf68ba57f5599`.

Assumptions: England, age 21+, 37.5 paid hours × 52 weeks, 12 monthly periods, 1257L M1,
NI category A, no pension/student loan/other deductions. Each column annualises a constant wage,
not actual calendar payroll history. The future column is a what-if using the existing monthly
routine and retained headline parameters, not independently certified 2027/28 payroll software.

Tables A free pay: code 1257 = two full 500 blocks plus code 257.
`2 × ceil-to-pence(5000 / 12) + ceil-to-pence(2579 / 12) = 1048.26`.
PAYE taxable pay is rounded down to whole pounds before applying 20%; employee NI is 8%
above the published monthly £1,048 threshold, rounded separately to the nearest penny
(exact half-pennies down). Never use £12,570 / 12 as the monthly NI threshold.

| Calculation | £12.71 wage | £13.21 wage |
| --- | --- | --- |
| Annual gross: hourly rate × 37.5 × 52 | £24,784.50 | £25,759.50 |
| Six monthly gross pays of each amount, retaining annual gross exactly | £2,065.37 / £2,065.38 | £2,146.62 / £2,146.63 |
| Monthly whole-pound taxable pay after £1,048.26 free pay | £1,017 | £1,098 |
| Monthly PAYE | £203.40 | £219.60 |
| Monthly employee NI | £81.39 | £87.89 |
| Annual PAYE (monthly amount × 12) | £2,440.80 | £2,635.20 |
| Annual NI (monthly amount × 12) | £976.68 | £1,054.68 |
| Annualised net | £21,367.02 | £22,069.62 |
| Actual monthly net penny pair in this model | £1,780.58 / £1,780.59 | £1,839.13 / £1,839.14 |
| Rounded average monthly net | £1,780.59 | £1,839.14 |

Differences: £975 gross, £702.60 annual net and £58.55 average monthly net. Rounding the
half-penny monthly averages before multiplying by 12 creates a 6p discrepancy; the article
explains that its monthly amounts are rounded averages. These results are not interchangeable
with cumulative PAYE, or a simple annual allowance/band calculation. This article's explicitly
stated 37.5 × 52 assumption produces £975 gross; it does not reuse the Treasury's £910 headline.

The two savings calculations are independently unchanged: £500 taxable × 40/42/44% yields
£200/£210/£220. The proposed £3,000 allowance example uses £2,500 qualifying gardening receipts
and no other trading/miscellaneous income; exclusions and actual circumstances still matter.

## Content and mobile strategy

The four-column wage comparison is retained. Its first header is “Pay measure” rather than
blank; its future header is “2027/28 scenario”. Rates-table headers distinguish enacted and
proposed law and identify the current column as savings, avoiding Scottish property-rate
ambiguity. A visible swipe instruction explains the existing horizontal table behaviour;
the key £702.60/£58.55 comparison is repeated in prose outside the wide table.

An additional column-by-column check found that the original overview/earlier-measures text
cells were wider than a narrow phone's viewport. The final revision shortens those summary
cells, adds explicit wage/Child Benefit units immediately below, and keeps pension and legal
qualifications in nearby prose. It retains the four-column wage and rates comparisons.
The final production-build check brings every individual column of every table fully into
view at 1440/390/320px in Chrome; even at 320px, no cell is wider than its scrolling viewport.

No shared typography or table implementation is changed. Browser checks confirm all four
tables scroll within the article without page-wide overflow at 1440, 390 and 320 CSS pixels,
in installed Chrome 156.0.8078.49 and WebKit 26.5. Real horizontal wheel input reaches each
table's rightmost column on both mobile widths; headers, column counts, canonical and
BlogPosting metadata also pass. Navigation from the blog and category listings reaches the
revised title in both engines, with no JavaScript page errors. Chrome screenshots of the wage
table's left and right edges were visually inspected: labels, periods and amounts are readable,
although all columns require horizontal scrolling on narrow screens. This is desktop browser
viewport testing, not a physical-device touch or screen-reader audit.

Local Vercel analytics/speed-insight scripts return expected 404/MIME messages outside Vercel;
WebKit also ignores the existing interactive-widget viewport key. These do not affect article
rendering or navigation. Installed Chrome is used because the bundled Chromium 149 has the
previously recorded cross-document view-transition/test stability issue; dependencies and
application transitions are unchanged.

Reading-width, paragraph/list sizing and table-heading typography remain
the separately recorded backlog task, not a hidden redesign.

## Verification and independent review

Source/schema/SEO/image/link/arithmetic checks and strict blog audit pass. The supplied SEO
title exceeded the 60-character check, so only SEO metadata was shortened; the visible title
is preserved exactly. The original publication date, filename/slug and image remain intact.
The article's source word count is about 1,590, matching its eight-minute reading estimate.

Repository checks, 13 blog/MDX/current-guidance suites (118 tests) and production build pass.
The existing SEO/blog-navigation and search-discoverability browser suites also pass (9 tests),
using installed Chrome against the same production build. A temporary ignored configuration
reuses the running server and selects installed Chrome; no committed test configuration changes.
Screenshot evidence SHA-256 (390px left/right):
`d3c8241bace1313bed03f6a855c7680bd4a212a02376be66900c4fe6702a7bd9` /
`9121deb506b7caad4f8ad3a0372ef668969f28be88194abe7caebf352e79f5fb`.
Exact-head independent review and hosted run results will be attached to the draft PR,
without making another commit solely to insert its own SHA.

## First independent review and dispositions

Claude CLI 2.1.308 independently audited `7d853eb42285cfb1a17ccdd93d29b1647f500f78`
against the base, including official sources and PR #144's original dispositions. Verdict:
**APPROVE WITH NONBLOCKING NOTES**, with no blocking findings. It derived the wage figures
by hand and confirmed the enacted/proposed and previously announced distinctions.

- Savings FAQ: made enacted 22/42/47% and proposed 24/44/49% explicit, because the FAQ can
  appear independently in structured data/search.
- Month 1 jargon: explained that this emergency basis taxes each month separately and
  replaced “free pay” with plain language. Exact figures and non-cumulative caveat retained.
- Wage timing citation: linked the first-pay-reference-period claim directly to HMRC's
  calculation guidance, keeping the official rate source separately.
- Scenario inputs: clarified retained rates and annual/weekly thresholds, using existing
  monthly routines, rather than suggesting that final 2027/28 payroll tables are available.
- Mileage breadth: kept this concise article's explicitly specified above-10,000-mile case.
  The row is not a full mileage guide. No 55p claim is added: the reviewer could corroborate
  that broader change only in Treasury text and did not verify the earlier HMRC announcement.
- Density/mobile: retained the supplied structure and exact wage comparison, shortening long
  summary cells and moving qualifications into prose. Shared typography stays in the backlog.

The reviewer did not rerun checks or audit physical devices/screen readers; source-access
limitations and the full response will be attached to the PR. These content/presentation
follow-ups require verification and an independent re-review of the new exact head.

A fresh-context review of `49ab50dd2bccb0f52ad0ff8cc5261098e88ea8ad` again approved
with nonblocking notes and independently confirmed the figures. Two final wording fixes restore
the property-rate territorial limit beside the overview and introduce the LEL abbreviation.
The broader devolved qualification remains in the main property section. The reviewer also
asked that PR evidence identify the correct build log: `reader-build-reviewed.log` covers the
larger article follow-up (built 20:52 UTC, browser checks 20:53), whereas the older
`reader-build-final.log` covers the first draft only. Exact-ref build/check evidence and an
independent re-review of these last wording fixes will be attached to the PR.
