# JGF-92 decision summary — 12 November 2026

**Outcome.** The rewritten £40,000 salary article is approved as the editorial **reference draft**.
It is not approved for publication. No tracked file, test, template or tooling was changed; no
branch, commit or PR exists for it.

## Decisions (maintainer)

1. **Direction approved.** The rewrite's approach is the reference for TaxInsights editorial work:
   answer first, one observation that gives the number meaning, caveats beside the figure they
   qualify, assumptions and method as reference sections at the end.
2. **FAQ removed** from the draft because it repeated the body.
3. **Search-facing metadata preserved**: live title, SEO title and SEO description stay as they are.
4. **Improved excerpt kept.**
5. **Byline**: "PayeTax" is the proposed organisational byline, to be made in a future, separate
   change. Not part of this draft.
6. **First publishable pilot**: `how-national-insurance-works-uk-2025` is preferred. It is not to
   be started without page-level Search Console evidence for that URL.
7. **No further work on the £40k exemplar** beyond the two corrections below.

## Corrections applied after review

- The Income Tax and National Insurance paragraph now describes this £40,000 example and separates
  the yearly Personal Allowance (£12,570) from the monthly NI threshold (£1,048).
- The pay-rise observation now reads "about 72p of each extra pound", on the same assumptions and
  below £50,270, and says a pension, a student loan and payroll rounding change it.
- The £167 pension against £120 take-home comparison is kept.

## Evidence (in `audit-outputs/jgf-92-40k-editorial/`, git-ignored)

- Draft: `content/blog/what-40k-salary-actually-looks-like-uk-2025.mdx`. Original for comparison: `original/`.
- Base: `origin/main` at `3f1a73ec`. URL, canonical, `updatedAt`, all 8 calculator assumptions,
  all 7 official sources, the three pension methods and the annual illustration are preserved.
  No published figure changed.
- `verify_figures.py` / `verify_figures.txt`: all 44 figures in the draft re-derived from the HMRC
  2026 to 2027 employer rates page, the 2026 to 2027 student loan deduction tables and the ONS
  release of 22 October 2026. The 9 values compared with `salary-guides-payroll-2026-27.json` agree
  to the penny. Eight figures are new in the draft and have no fixture; workings are in `REVIEW.md`.
- `REVIEW.md`: full comparison notes, test replay, tooling options and pilot reasoning.

## Not done, by instruction

- No change to `salaryGuideArticles.test.ts` or any other test. Existing tests are not to be weakened.
- No template, tooling or documentation change. No PR, merge or deployment.
- The draft was not built or rendered in the real template; Jest, `check:repo` and `build:ci` were not run.

## Open points for a later decision

- **The draft cannot be published as it stands.** Replayed against the existing article test, it
  passes all 15 figure, source and fact assertions and fails 12 that require specific wording
  (including "That is a modelled PAYE result", "PAYE estimate" in the excerpt and five FAQ
  entries). Publication needs a separate decision on that test.
- **Pilot gate.** A three-month Search Console page export for the NI explainer is needed before
  any work starts on it. If it is among the top pages by clicks, reconsider the choice.
- **Template and tooling options** (guidance requirements, excerpts, byline, boilerplate) are
  listed in `REVIEW.md` and are not started.
