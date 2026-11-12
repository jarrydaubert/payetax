# JGF-92: £40k editorial rewrite, for review — 12 November 2026

Status: approved by the maintainer on 12 November 2026 as a **reference draft, not for publication**.
Decisions are recorded in `JGF-92-DECISIONS.md`. Nothing is committed, no PR is open, nothing in the
tracked tree or in `.git` was written. Base: `origin/main` at `3f1a73ec`.

## What is in this folder

| Path | What it is |
| --- | --- |
| `content/blog/what-40k-salary-actually-looks-like-uk-2025.mdx` | The rewrite, at the same repo-relative path and filename, so the URL is unchanged |
| `original/what-40k-salary-actually-looks-like-uk-2025.mdx` | The live article, exported from `origin/main` |
| `verify_figures.py`, `verify_figures.txt` | Independent derivation of every figure in the rewrite, and its output |
| `fixture-snapshot-salary-guides-payroll-2026-27.json` | Copy of the existing hand-derived fixture from `origin/main`, used for comparison only |
| `JGF-92-DECISIONS.md` | Decision summary to paste into JGF-92 |

### This is an isolated export, not a registered git worktree

You asked for a worktree. I did not run `git worktree add`, for three reasons found on inspection:

1. The shell I reach your machine through cannot delete files in this folder. Git removes its own
   lock files as it works, so a git write from here can leave `.lock` files in the shared `.git`
   that would make Codex's next commit on JGF-72 fail.
2. That shell sees the repo at a Linux path. A worktree created from it would record that path in
   its metadata and be broken on Windows until repaired. It already reports your 15 Windows
   worktrees as "prunable" for the same reason.
3. The only cross-platform fix (relative worktree paths) changes the main repo's config format.

So the files were exported with read-only git commands (`git show`, optional locks disabled) into
the git-ignored `audit-outputs/` folder. JGF-72's branch, index and working tree were not touched.
To turn this into a real worktree later, on Windows:

```
git worktree add ..\payetax-jgf-92 -b codex/jgf-92-40k-editorial origin/main
copy audit-outputs\jgf-92-40k-editorial\content\blog\what-40k-salary-actually-looks-like-uk-2025.mdx ..\payetax-jgf-92\content\blog\
```

One stray zero-byte file, `audit-outputs/.deltest`, is left over from testing whether deletion
was possible. It is git-ignored and safe to delete.

## The rewrite

### Preserved

- Filename, `canonicalUrl`, `publishedAt`, `updatedAt`, title, SEO title, SEO description,
  description, keywords, tags, image. Only `excerpt` changed in the frontmatter.
- All 8 calculator assumptions, word for word, including the Month 1-style projection sentence.
- All 7 official source links, word for word, plus every inline GOV.UK and ONS link.
- The three pension methods (salary sacrifice, net pay, relief at source) and the qualifying-earnings point.
- The separately derived annual illustration: both table rows and the explanation of why it differs.
- The ONS comparison with its release date, population and provisional status.
- Every published figure. No figure was changed.

### Changed

- **Excerpt** (rendered as the standfirst): leads with the monthly figure and says what the page covers.
- **Opening**: answer, then what tax and NI take, then one sentence on who the figure applies to and
  that it is an estimate. The sentence "That is a modelled PAYE result, not a statement of exactly
  what every employee will receive" is replaced by "Treat all of it as a close estimate, not a copy
  of your payslip", with a link to the assumptions.
- **Order**: the reader's questions first (where the money goes, student loan, pension, how it
  compares, Scotland), then the assumptions and the method as reference sections.
- **Caveats** sit beside the figure they qualify. The "What can change the result" list is folded into
  the assumptions section because each item was the inverse of an assumption.
- **Removed**: the FAQ (five answers that repeated the body), the in-body Tools list, the weekly Plan 2
  threshold (£565.09), the `/tools` hub link and the duplicate calculator link.
- **Added**: eight figures (below), a rounding note under the first table, and a link to the
  student loan guide for readers who do not know their plan.
- **Corrected after review (12 November)**: the Income Tax and NI paragraph now describes this
  example and separates the yearly Personal Allowance from the monthly NI threshold (£1,048), and
  the 72p pay-rise observation is stated as approximate and dependent on the same assumptions.

### Honest measures (no targets applied)

| | Original | Rewrite |
| --- | ---: | ---: |
| Prose words, excluding URLs and tables | 1,051 | about 1,160 |
| Words before the reference sections begin | n/a | about 825 |
| Hedging terms ("modelled", "estimate", "does not establish", "assum…") | 37 | 8 |
| "you" / "your" | 11 | 69 |
| H2 sections | 12 | 9 |

The rewrite is not shorter. What changed is the order and who is being spoken to.

## Figure check

`verify_figures.py` derives the figures from published values read on 12 November 2026:

- HMRC, Rates and thresholds for employers 2026 to 2027 (last updated 1 September 2026): Personal
  Allowance £12,570; 20% basic rate on the next £37,700; primary threshold £1,048 a month;
  upper earnings limit £50,270; employee rates 8% and 2%; Plan 2 £29,385 a year, £2,448.75 a month; 9%.
- HMRC, 2026 to 2027 student loan deduction tables: multiply the excess by 9% and round down to a whole pound.
- ONS, Annual Survey of Hours and Earnings 2026 (released 22 October 2026): £40,911, full-time
  employees in their job for at least a year, all 2026 estimates provisional.

Monthly PAYE uses HMRC's Tables A free-pay method and whole-pound rounding of taxable pay. The
headline tax is unchanged if free pay is taken as £12,570 / 12 instead, so it does not depend on
that detail.

Result: all 44 figures in the rewritten body (35 money, 5 percentages, 4 pence amounts) are in the
verified set, and the 9 values compared with the existing fixture agree to the penny. Full output
in `verify_figures.txt`.

Eight figures are new in the rewrite and are not in any fixture. Seven are arithmetic on figures
that are; one is a published HMRC threshold:

| New figure | Working |
| --- | --- |
| 8% of monthly pay above £1,048 | HMRC monthly primary threshold, 2026 to 2027 (published value) |
| about 19p of every pound | (5,484 + 2,193.96) / 40,000 = 19.19% |
| keep about 72p of each extra pound | 100 − 20 − 8; checked on the monthly model: £41,000 nets £720.88 more than £40,000 |
| until salary passes £50,270 | 12,570 + 37,700 |
| £167 a month into the pension | 2,000 / 12 = 166.67 |
| take-home drops by £120 | (32,322.04 − 30,882.92) / 12 = 119.93 |
| the other £47 | 166.67 − 119.93 = 46.74 |
| £2.44 lower | 32,322.04 − 32,319.60 |

Not checked: the article was not built or rendered in the real template, and Jest, `check:repo`
and `build:ci` were not run (no `bun` in the shell available to me).

## The existing test pins sentences, not only figures

This is the main tooling finding, and it corrects my earlier audit, which said the "Before" sentence
had merely been left in. `src/lib/__tests__/salaryGuideArticles.test.ts` requires it:

```ts
expect(post?.excerpt).toContain('PAYE estimate');
expect(content).toContain('That is a modelled PAYE result');
```

Replaying its 28 assertions for the £40k article against both versions:

- The original passes all 28.
- The rewrite passes 16, including all 15 that check a figure, a source link or a material fact.
- The 12 it fails all pin wording: the excerpt phrase, the "modelled PAYE result" sentence, eight
  exact bullet phrases (for example `monthly Plan 2 deduction: £79`), the requirement for five FAQ
  entries, and a median FAQ entry.

The rewrite was written to keep the fact assertions green without bending the prose: the headline
string, both breakdown rows, both annual-illustration rows, the pension-method phrases and the ONS
strings are all present as the test expects.

## Smallest changes that stop the problems returning

No new platform. Four existing files, all small. None is implemented, and none is approved to
start: the maintainer's instruction of 12 November is not to change tests, template or tooling yet.

### 1. Wording pins → figure pins (`salaryGuideArticles.test.ts`)

- Delete the two assertions quoted above.
- Replace the excerpt phrase pin with a figure pin from the same fixture, for example
  `expect(post?.excerpt).toContain(pounds(Math.round(expected.netPayMonthly), 0))`. That keeps the
  intent of the August audit (the answer is in the excerpt) and makes a generic excerpt fail.
- Replace the eight exact-phrase assertions with checks that the same fixture values appear in the
  body (`£79`, `£948`, `£31,374`, `£2,615`, `£2,000`, `£38,000`, `£30,883`, `£2,574`).
- FAQ assertions: change only if you accept removing the FAQ (decision 1 below).

Same fixtures, same file, same independence from the engine. This has to land with any salary-page
rewrite, because the rewrite cannot pass CI otherwise.

### 2. Irrelevant guidance requirements (`src/lib/currentBlogGuidance.ts`)

`checkPositiveCurrentGuidance` makes every registered post contain the full mileage rule and the
homeworking sentence. That is why the £50k and £70k salary pages have a "Job Expenses" section.
Make those two requirements conditional: if a post mentions mileage or homeworking, the complete
current rule must be present. The file already has `MILEAGE_DOMAIN_PATTERN` and
`HOMEWORKING_DOMAIN_PATTERN` for exactly this test. The stale-value guards stay as they are, and
the existing "rejects plausible bypasses" cases still fail as intended because those posts still
mention mileage. Add one case: a post with no mention passes.

The £40k article is not in that registry, so this does not block it. It unblocks trimming £50k and
£70k later. This file is a control over published tax facts, so treat the change as Tier 1.

### 3. Generic excerpts

- The figure pin in change 1 covers the salary pages.
- For the rest, one non-blocking flag in `scripts/audit-blog-content.ts`: excerpts that open with
  "See", "Learn", "Discover", "Read", "Find out" or "Complete guide", or that contain "caveat" or
  "clearly qualified". Eight of the 33 posts would be flagged today; five of them are the salary pages.
- No template change is needed. The template already prints the excerpt as the standfirst; the
  guidance just never said so. One sentence in `BLOG_GUIDE.md` when the docs are next touched.

### 4. Attribution

`src/app/blog/[slug]/page.tsx:240` turns the frontmatter author "PayeTax Team" into
"PayeTax Editorial Team" on the page and in Article structured data, and
`src/config/blog.config.ts` has "TaxInsights Editorial Team" twice. The docs say not to imply an
editorial staff. Smallest fix: one constant for the byline (I suggest "PayeTax"), used in those
three places and in the `Organization`/`Person` check at `StructuredData.tsx:772`. No test pins
either string. The name is your decision; it is a published claim.

### 5. Boilerplate (`src/app/blog/[slug]/page.tsx`)

- `BASE_INTERNAL_LINKS` puts Director Intelligence and Compliance under every post, which
  `BLOG_GUIDE.md` says not to do. Keep the PAYE calculator as the base link, move Director
  Intelligence into `CONTEXTUAL_INTERNAL_LINKS` behind a director/dividend/limited-company matcher,
  and drop Compliance from the default set.
- Remove the "Found this helpful?" block. The "Useful tools" block directly above it already leads
  with the calculator.
- One non-blocking `blog:audit` flag for in-body `## Tools`, `## Disclaimer`, `## Next Steps` and
  `## Key Takeaways` headings, so they are caught when a post is next edited.
- Leave the disclaimer box and FAQ structured data alone for now.

No unit or e2e test references any of these template strings.

## Decisions

Made by the maintainer on 12 November 2026 and recorded in `JGF-92-DECISIONS.md`: the FAQ stays out
of the draft; the live title, SEO title and SEO description are preserved; the improved excerpt is
kept; `updatedAt` is unchanged because no fact changed.

## First publishable pilot: not this page

The £40k page is the right page to judge the writing on and the wrong page to publish first.

Search evidence available (Search Console figures transcribed in the 23 August audit; nothing newer
is in the repo, and the Vercel Web Analytics API returned "not found" for the project when I tried):

| Page | Impressions (3 months) | Clicks | Status in the repo |
| --- | ---: | ---: | --- |
| £40k salary | 35,222 | 60 | Retain URL; answer-first repair done 24 August |
| £70k salary | 27,689 | 35 | "Protect and monitor" |
| £60k salary | 17,103 | 56 | Retain URL |
| Whole property | 180,000 | 660 | |
| Beginner's guide | 0 | 0 | "Do not touch: another rewrite" pending recrawl |

Those three salary pages carried 44% of the property's impressions. They are also pinned by the
test above and protected in `PRODUCT_DIRECTION.md`.

**Recommendation: `how-national-insurance-works-uk-2025`.** (Moderate confidence.)

- It is not a salary page, not in the current-guidance registry, not an editor's pick, not featured,
  and not under any protect or monitor instruction.
- It is already current for 2026/27, so the pilot is editorial only. I spot-checked its employee and
  employer rates, thresholds, the seven-row NI example table and the employer NI example against the
  GOV.UK page above; they agree. I did not check its State Pension figure.
- Its example table can be pinned to the shared annual NI owner in the same style as the existing
  salary test, which is reuse, not new machinery.
- It is a plain explainer, the commonest format in the library, so what is learned transfers.

Ruled out: the student loan guide is first in `EDITORS_PICKS_ORDER`, which the code comment ties to
traffic priority, and its Plan 2 examples use annual arithmetic where the fixture uses payroll
rounding, so a rewrite there would not be editorial only. The ten posts still framed as 2025/26
need a factual refresh first.

One gap: there is no page-level search data for the NI page in the repo. Before publishing, take a
three-month Search Console export for that URL as the baseline. If it turns out to be among the top
pages by clicks, use `making-tax-digital-income-tax-2026` instead: it has no calculator figures at all.

## Sources read for this review

- https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
- https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables
- https://www.gov.uk/guidance/special-rules-for-student-loans
- https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2026
- https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
