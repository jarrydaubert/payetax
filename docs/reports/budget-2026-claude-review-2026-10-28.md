# Initial Claude CLI review — Budget 2026, 28 October 2026

This is the initial independent review, before the material legal-status revisions. It is not
final-head approval. The [verification report](budget-2026-content-verification-2026-10-28.md#independent-claude-cli-review-and-disposition)
records accepted findings, review-tool limitations, rejected optional additions and the blocked
re-review. The reviewer fetched paraphrased/truncated pages, so some statements about missing
anchors/sections and the optional £4,000 ISA figure must not be treated as established facts.

## Original response

**Verdict: changes requested.** There are no factual tax errors and no calculator-year problems. But there are three P2 citation/legal-status issues and one scope issue to fix before merge.

**The branch changed while I was reviewing it.** `vercel.json` became modified, and the new article (15:36) and verification report (15:37) were rewritten. Line numbers below refer to those latest versions.

## Findings

**P2 – Scope: `vercel.json` change in a content-only PR** (`vercel.json:2-6`; report lines 6–7 and 67–73)
- It adds `git.deploymentEnabled: {"content/budget-2026": false}`. The syntax matches Vercel's documentation and `main` is unaffected.
- However, it is a repo-control change that would sit permanently on `main` as a dead branch rule after merge.
- Either remove it before merge, or put it in a separate, clearly labelled commit with a removal plan and report its deployment implications as `AGENTS.md` requires for config changes.

**P2 – The `#property-taxation` anchor doesn't exist in the Treasury document**
- Affected lines: new article `:31` and `:41`; 2025 article `:163`.
- The Budget 2026 HTML has no "Property taxation" heading. Its chapter "7. Policy Decisions" contains only "7.1 Table 6.1".
- The LISA claim at `:41` is supported by OOTLAR 2.4 (laid 28 October, effective 29 October 2026) and Table 6.1 row 39. Cite those instead.
- For the savings/property rates, cite Treasury §3.9 ("Making fair choices on revenue raising") and Table 6.1 rows 61–62.

**P2 – The report's Treasury section numbers can't be found** (`docs/reports/budget-2026-content-verification-2026-10-28.md:15`)
- It cites "sections 7.20–7.22", which earlier in the session read "7.9, 7.15, 7.20". Neither set exists in the HTML.
- Table 6.1 rows 11, 15, 39, 52, 61 and 62 do check out: cash ISA, trading allowance, Lifetime ISA, Pension Tax Allowance, property income, savings income.
- Replace the section reference with §3.9 plus the table rows.

**P2 – The 2025 article calls enacted law "superseded" and "historical"** (2025 article `:5`, `:16`, `:21`, `:126`, `:160`, `:312`)
- Finance Act 2026 ss.5 and 7 enact 22/42/47% for 2027–28. Those rates stay law unless Finance Bill 2026–27 amends them.
- Labelling them "superseded projection" also contradicts the article's own table header, "enacted for 2027–28" (`:111`). "Corrected" in the SEO description (`:16`) wrongly implies the original rates were an error.
- Suggested wording: "currently enacted; Budget 2026 proposes replacing them with 24/44/49%". The new article already handles this correctly.

**P3 – Finance Act section range is inconsistent**
- 2025 article `:21` says "sections 5–7"; the new article `:31` and the report say "5–8".
- Section 8 covers Scottish/Welsh property rates. Use 5–8 in both, since both articles make devolution claims.

**P3 – Budget 2025 anchor `#modernising-the-tax-system` is unverified** (new article `:47`)
- In the Budget 2025 HTML, that phrase is a Table 4.1 group label, not a heading.
- I couldn't find the pensioner commitment there either, because the tool truncated the page at row 65.
- The provenance itself is sound: OOTLAR 1.4 says "As announced at Budget 2025". Drop the anchor or point it at a verified location.

**P3 – Optional editorial/report additions**
- **First Time Buyer ISA:** new article `:41` could add one line on it. OOTLAR 2.3 and row 38: it replaces the Lifetime ISA for new savers from April 2029, with up to £4,000 a year and a 25% bonus.
- **Future-year report thresholds:** could record Annex A's Pension Tax Allowance thresholds (£13,037 full allowance, removed at £13,319, £1 withdrawn per £3).
- **Payrolling benefits in kind:** the future-year report could note mandatory payrolling from April 2027 (OOTLAR 1.24), since Director Intelligence handles benefits in kind.

## What I verified as correct
- **Rates and provenance:** 24/44/49% savings (UK-wide) and property (England, Wales, Northern Ireland) from 6 April 2027 via Finance Bill 2026–27, against OOTLAR 1.1–1.2 and Annex A. Budget 2025's +2 points and Finance Act 2026's enacted 22/42/47% are kept distinct from the 2026 proposals.
- **Worked examples:** £200/£210/£220 for savings and £6,000/£6,300/£6,600 for rental profit; the differences quoted are correct.
- **Unchanged amounts:** Personal Savings Allowance £1,000/£500; savings starting-rate limit £5,000; main rates 20/40/45 unchanged for 2027–28, which supports the FAQ at `:57`.
- **Trading allowance:** £1,000 to £3,000 via Finance Bill (OOTLAR 1.5 does say "trading and miscellaneous income").
- **Cash ISA:** stays at £20,000 through secondary legislation in November 2026 (OOTLAR 2.5).
- **Pension Tax Allowance:** 6 April 2027 to 5 April 2030, Finance Bill route. OOTLAR 1.4 says it was announced at Budget 2025, but the PTA explainer landing page and Treasury row 52 call it Budget 2026. The report records this conflict correctly.
- **Salary sacrifice:** £2,000 from 6 April 2029, existing Budget 2025 policy (row 52). The NICs (Employer Pensions Contributions) Act 2026 received Royal Assent on 29 April 2026, with the £2,000 limit set through regulations.
- **Plan 2:** £29,385 frozen for three years from 6 April 2027 (Budget 2025 row 48, DfE methodology, and `taxRates.ts:486`).
- **Future-year requirements report:** the 2.1 NI figures (£133/week, £6,916, £7,355, £3.80, £19.05) are correct. Its 2.6 flag is valid: OOTLAR labels £30,200 as the van charge and £4,310 as the car-fuel multiplier, which looks swapped.
- **Calculator scope:** no `src/` changes; `TAX_YEARS` ends at 2026–27, so the "through 2026–27" claims are accurate.
- **Frontmatter, links and image:** frontmatter is within schema limits by manual count. Internal routes exist. The image is 1600×1000 JPEG in Ledger style, with no text or marks and accurate alt text.
- **Unchanged 2025 content:** sections such as HVCTS and the salary-sacrifice example are historical context outside this refresh. They're correctly not certified as a 2026 update.

## Sources and limits
- **Retrieved:** OOTLAR (full section list plus 1.1–1.5, 1.12, 2.1, 2.3–2.6), Annex A, Treasury Budget 2026 HTML (all segments), Budget 2025 HTML (partially), Finance Act 2026 contents and ss.5 and 7, NICs Act 2026, the HMRC salary-sacrifice paper (4 December 2025), the 2025 rates policy paper, DfE methodology, the PTA explainer landing page, and Vercel's git configuration docs.
- **Not retrieved:** Finance Bill 2026–27, the ISA/Lifetime ISA statutory instruments, the PTA explainer body, and Scottish/Welsh decisions.
- **Tool limits:** the fetch tool paraphrases pages and strips HTML ids, so anchor findings are based on heading inspection; direct `curl` was blocked. I couldn't run `check:repo`, `build:ci` or `blog:audit` because they needed approval.
