# Budget 2026 content verification — 28 October 2026

Base: `origin/main` at `89b442918db23177bd9faeb7f2309c5bc8119aa0` (#143).
Scope: correct the historical Budget 2025 savings/property projections and calculator claims;
add one TaxInsights explainer and one Ledger image. No calculator, policy, tax-year selection,
runtime or dependencies are changed. A branch-specific Vercel deployment exclusion is the
only configuration change, required to honour the instruction not to deploy when opening the PR.

## Sources and independent checks

Read during this work session, rather than relying on another article or calculator output:

1. [HMRC Budget 2026 OOTLAR](https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar): sections 1.1–1.5, 1.12 and 2.1–2.5 establish announcement provenance, operative dates and legislative routes.
2. [HMRC Budget 2026 Annex A](https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances): independently checked savings/property rates, retained savings allowances and the overall ISA limit against the narrative.
3. [Treasury Budget 2026](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html): table 6.1 rows 11, 15, 39, 52, 61–62 independently corroborate dates, values and policy scope.
4. [HMRC's 2025 savings/property/dividend policy paper](https://www.gov.uk/government/publications/income-tax-changes-to-tax-rates-for-property-savings-and-dividend-income/income-tax-changes-to-tax-rates-for-property-savings-and-dividend-income) and [Finance Act 2026](https://www.legislation.gov.uk/ukpga/2026/11/contents/enacted), sections 5–8: the original 22/42/47% plans became law; the proposed 24/44/49% rates require further primary legislation. The 2025 article's original publication date and URL remain intact.
5. [Budget 2025](https://www.gov.uk/government/publications/budget-2025-document/budget-2025-html), State Pension/Simple Assessment and Plan 2 sections, cross-checked against [DfE methodology](https://explore-education-statistics.service.gov.uk/methodology/student-loan-forecasts-for-england): the pensioner commitment and £29,385 Plan 2 freeze were previously announced. The freeze covers 2027–28 through 2029–30, not a new Budget 2026 repayment policy.
6. [HMRC salary-sacrifice policy paper, 4 December 2025](https://www.gov.uk/government/publications/salary-sacrifice-reform-for-pension-contributions-effective-from-6-april-2029/salary-sacrifice-reform-for-pension-contributions) and [National Insurance Contributions (Employer Pensions Contributions) Act 2026](https://www.legislation.gov.uk/ukpga/2026/15), sections 1–3: £2,000, 6 April 2029, employee/employer Class 1 scope, Income Tax relief preserved; primary framework enacted, operating regulations separate.

The explainer distinguishes primary Finance Bill provisions (savings/property/trading/PTA),
secondary legislation (cash/Lifetime ISA changes), and existing enacted provisions (the
original rates and salary-sacrifice framework). It does not claim that the new Finance Bill
has passed or that an announced statutory instrument is already in force.

## Editorial decisions and source caveats

- Classify the existing post as a focused refresh, not a rewrite of the historical Budget.
  Its unchanged 2025 sections are not certified as a comprehensive 2026 policy update.
- Omit the student-loan interest cap: it is an earlier announcement and adds little to this
  personal-tax explainer. No implication that it is new Budget 2026 policy.
- The [PTA explainer landing page](https://www.gov.uk/government/publications/pension-tax-allowance-explainer)
  calls the allowance a Budget 2026 announcement, while OOTLAR 1.4 expressly attributes it to
  Budget 2025. The original 2025 document contains the pensioner-protection commitment, with
  detail promised later. The article therefore distinguishes the earlier commitment from
  2026 implementation detail, rather than inventing a second new policy.
- Do not use the 2025 policy paper as the current authority for the superseded 2027 rates.
  Do not treat historical legislation and later proposals as an unresolved rate conflict.
- Regional qualification is explicit: published property rates cover England, Wales and
  Northern Ireland; devolved powers for Scotland and Wales require later regional checks.
- The new table labels its 2026–27 column as savings rates, avoiding a UK-wide claim about
  Scottish rental-income rates in that year.

## Independently derived examples

These are hand calculations, not output from the production engine. Future rates cannot be
verified by a calculator which intentionally does not support that year. Inputs/allowances
and current-year rates were cross-checked with Annex A and `src/constants/taxRates.ts`.

| Example and assumptions | 2026–27 | Currently enacted 2025 rates | 2026 proposal |
| --- | --- | --- | --- |
| £20,000 × 5% = £1,000 interest; higher-rate £500 allowance; remaining £500 entirely higher-rate; no ISA or starting-rate relief | £500 × 40% = £200 | £500 × 42% = £210 | £500 × 44% = £220 |
| £15,000 taxable rental profit entirely higher-rate, England, after expenses/allowances; no finance-cost tax reduction or other relief | £15,000 × 40% = £6,000 | £15,000 × 42% = £6,300 | £15,000 × 44% = £6,600 |

Savings increments are £20 against 2026–27 and £10 against the old plan. Rental increments
are £600 and £300 respectively. No future-year engine fixture or expected output is changed.

## Image and verification

One new built-in imagegen asset, inspected before import: blank forms, muted red folder,
ink-blue calculator/calendar, pen and coins on a warm paper surface; no text or official marks.
Imported with the existing Sharp dependency to 1600×1000 JPEG because the repository's shell
importer requires macOS `sips`. No importer or dependency change. Both final image dimensions
and desktop/mobile article renders were inspected; the Budget card is present on the blog and category.

## Checks and practical limits

| Check | Result |
| --- | --- |
| `bun --no-env-file run check:repo` after final content/config edits | PASS: lint, application/test typechecks, repository and current-guidance guards |
| `bun --no-env-file run blog:audit --strict` | PASS: 33 posts, no missing/duplicate/bad image assets; 25 existing editorial review candidates remain |
| `bun --no-env-file run test:no-coverage --runInBand --testPathPatterns='blog\|mdx\|currentBlogGuidance'` | PASS: 13 suites, 118 tests |
| `bun --no-env-file run build:ci` | PASS; repeated by the final unmodified Playwright web-server configuration |
| `bun --no-env-file x playwright test e2e/seo-blog.spec.ts e2e/search-discoverability.spec.ts --project=chromium --workers=1 --reporter=list` | PASS: 9 tests, including full sitemap crawl, indexing, redirects and navigation |
| Focused frontmatter/SEO/Sharp/arithmetic check | PASS: both schemas, description/title lengths, canonical, reader links, 1600×1000 JPEG assets, six independently derived example results |
| Direct external article links | PASS: all requested document URLs return HTTP 200; one invalid Budget 2025 fragment was removed |
| Direct article route/metadata/image and internal-link checks | PASS: blog, tax-changes category and both articles return 200, headings render, canonical/BlogPosting metadata and images resolve; article internal targets return 200 |
| Desktop 1440×1000 and mobile 390×844 | PASS for direct loads and visual inspection; no page-level horizontal overflow. Mobile table scrolls to its proposal column (331px scroll range). |
| Cross-article client navigation | INCOMPLETE: the local custom flow sometimes remained at `Loading article...` after following a link, leaving previous hidden DOM in place. Direct document loads passed. Locator stability and network-idle retries did not establish reliable SPA completion; do not describe this as a passing interaction check. No runtime code was changed to mask it. |

Browser plugin not available; used the repository's installed Playwright/Chromium. Direct-page
inspection found no JavaScript page exceptions. Accepting essential-only consent on localhost
also exposed existing Vercel Insights/Speed Insights script 404/MIME messages, because those
hosting endpoints are unavailable on `next start`; console validation is qualified, not clean.
No claim about physical devices, WebKit or production rendering is made. The custom interaction
failure needs separate investigation and is recorded in the verification backlog.

Final direct-load screenshot SHA-256 hashes (large PNGs kept outside the repository):

- Desktop: `72307b9aa7b4a1adf82a9f6427564549d856df79ddaf9188b2a3caee0489c135`
- Mobile: `d9d75064a045f489133380ad14b1ab2eb7c6dec33c9177b4d79b625b9a8db4da`

Existing build notices about Sentry configuration, `experimental.useCache` and unchanged
release version remain. This PR is not a release and does not bump versions. A check initially
caught type errors in an untracked temporary QA script; the script was moved out of TypeScript
discovery and the final repository checks passed. No application types or checks were weakened.

## Independent Claude CLI review and disposition

The first fresh-context `claude -p --output-format json` review completed with **changes requested**.
Its [full response](budget-2026-claude-review-2026-10-28.md) is preserved with its limitations.

- **Accepted:** enacted 2025 rates remain law pending amendment. Corrected the update notice,
  metadata, examples and takeaway instead of treating the 2026 proposals as already enacted.
- **Accepted:** use Finance Act sections 5–8 consistently, covering devolved property powers.
- **Accepted:** isolate the Vercel branch guard in commit `5162a64e` (originally `83bb8f5d` before the unpublished commit email was replaced with GitHub no-reply) and state its removal plan.
- **Citation robustness:** removed Treasury/Budget 2025 fragments and use document links/table
  references. The first reviewer inferred absent headings from truncated/paraphrased fetches;
  direct HTTP HTML inspection did find the Treasury `property-taxation` id and sections 7.20–7.22.
  This was a review-tool limitation, not evidence that Treasury omitted the measures.
- **Accepted optional follow-up:** record staged mandatory benefits payrolling separately.
- **Not added:** a new First Time Buyer ISA section/£4,000 figure or numeric PTA thresholds.
  They are unnecessary to this concise explainer; the suggested £4,000 was not independently
  established by the official sources used here. Future PTA implementation must reconcile detail.

The required material-change re-review was requested in a second fresh CLI session, but stopped
after 12 turns with `is_error: true`: **"You've hit your session limit · resets 7:20pm (Europe/London)"**.
The local time is 28 October 2026; this means **19:20 London time**. There is no second verdict
and no final-head independent approval. Keep the PR in draft with re-review pending. No merge
or deployment is authorised.

## No-deployment guard

Existing PR #131 has a successful Vercel deployment, establishing that draft/content PRs can
trigger preview hosting. `vercel.json` disables Git deployments only for `content/budget-2026`.
This follows [Vercel's documented branch exclusion](https://vercel.com/docs/project-configuration/git-configuration#gitdeploymentenabled).
It leaves `main` and all other branches at their existing defaults. No deployment command,
environment change, merge or production release is authorised or performed.

The deployment exclusion is kept in a separate commit so that the maintainer can remove it
when preparing an authorised merge/release. While the no-deployment instruction applies,
retain the guard on this PR branch. No branch protection, workflow, environment or secret changes.
