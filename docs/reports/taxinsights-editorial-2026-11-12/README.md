# TaxInsights editorial archive · 12 November 2026

The maintainer approved the corrected £40k rewrite as an **editorial reference draft only**. It has no publication approval. Keep the archived MDX outside `content/blog/` and out of application imports. This archive preserves Claude’s handover for [JGF-152](https://linear.app/jgf-projects/issue/JGF-152) under [JGF-92](https://linear.app/jgf-projects/issue/JGF-92), which remains in Backlog.

Claude prepared the materials on 12 November 2026 in the ignored `audit-outputs/` directory. The £40k review used `origin/main` at `3f1a73ec`. The audit, review and decisions retain their original wording, paths and point-in-time status. Treat their commands and proposals as historical context.

## Files

- [Initial editorial audit](blog-editorial-audit-2026-11-12.md) records Claude’s inventory of 33 posts and initial recommendations.
- [Approved reference draft](what-40k-salary-actually-looks-like-uk-2025.reference.mdx) preserves the corrected Income Tax and National Insurance explanation, qualified 72p pay-rise observation and £167 pension versus about £120 less take-home comparison.
- [Baseline article](original/what-40k-salary-actually-looks-like-uk-2025.mdx) is the original export for side-by-side comparison.
- [Owner decisions](JGF-92-DECISIONS.md) and [Claude’s review](REVIEW.md) record the draft changes, sources, test replay and future proposals.
- [Figure-check script](verify_figures.py), [original output](verify_figures.txt) and [fixture snapshot](fixture-snapshot-salary-guides-payroll-2026-27.json) preserve the inputs and evidence for rerunning the check.

## Editorial decisions and future work

The reference leads with the answer and keeps the tax year, region, monthly payroll, pension and loan qualifications. The improved excerpt and removal of the duplicate FAQ apply to the reference draft. The live article retains its FAQ, title, SEO title, SEO description and public URL.

The proposed organisational byline **PayeTax**, blog template and guidance changes, and replacing 12 wording-pinned assertions in `salaryGuideArticles.test.ts` with checks for figures, assumptions and material disclosures are separate proposals. The test proposal applies if a live rewrite is approved. The National Insurance explainer is a candidate pilot subject to three months of page and query evidence from Search Console and explicit maintainer approval.

## Reproduce the figure check

From this directory, run with Python 3. The script uses the standard library and reads the two archived inputs locally.

```sh
python -X utf8 verify_figures.py what-40k-salary-actually-looks-like-uk-2025.reference.mdx fixture-snapshot-salary-guides-payroll-2026-27.json
```

Compare stdout with `verify_figures.txt`. The script recomputes the worked examples from recorded inputs and checks 44 distinct body values across three formats (35 currency amounts, five percentages and four pence amounts) against its expected sets. Nine comparisons against the hand-derived fixture agree to the penny. The script allows a two-pence tolerance. Eight figures introduced in the draft lack direct fixture entries. Claude’s review records their workings.

The archive rerun reproduces arithmetic and numeric coverage for the recorded scenarios. The script checks numeric tokens and fixture values. Context and wording still require editorial review. The source inputs are hard-coded, and the initial inventory’s broader claims were outside the scope of the rerun. Claude’s assertion replay is described in `REVIEW.md`. The reference draft has no application render or publication verification.

Primary sources for the recorded inputs include the [HMRC 2026/27 employer rates and thresholds](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027), [HMRC loan deduction tables](https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables) and [ONS October 2026 earnings bulletin](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2026).
