# Blog Guide

Purpose: help agents publish and refresh PayeTax blog content that is accurate, calm, useful, and visually consistent.

The blog is a public trust surface for the calculator. Treat every tax claim, deadline, rate, threshold, and image as part of that trust.

## Canonical Files

- Posts live in `content/blog/*.mdx`.
- Slug is the filename unless a post has explicit legacy frontmatter for SEO.
- Frontmatter is validated by `BlogFrontmatterSchema` in `src/lib/validation.ts`.
- Category data lives in `src/config/blog.config.ts`.
- Visual category styling currently lives in `src/constants/blogCategories.ts`; keep it aligned with `src/config/blog.config.ts` until the two sources are consolidated.
- Featured images live in `public/images/blog/`.
- Image workflow and prompt rules live in `docs/blog/IMAGE_WORKFLOW.md` and `docs/blog/ai-image-prompts.json`.
- Open content work belongs in `docs/BACKLOG.md`, a GitHub issue, or the pull request description. Do not leave loose future-work notes in evergreen docs.

## Editorial Position

- Read [VOICE_AND_STYLE.md](VOICE_AND_STYLE.md) before drafting **or reviewing** a post. It defines the reader, answer-first openings, five flexible formats and the caveat rule; this guide owns the accuracy and publishing constraints.
- Write as `TaxInsights by PayeTax`: direct, warm, contemporary British English, grounded in concrete pay and tax examples. A reader should understand the useful answer before meeting specialist terminology.
- Target a real UK working adult's question or decision; avoid writing to an age bracket or producing content merely to catch search queries.
- Prefer clarity over drama. No aggressive saving promises, fear-mongering, fake urgency, fabricated expertise, forced slang or formulaic SEO filler.
- Be honest about scope: PayeTax is a PAYE and director calculator, not full Self Assessment, accounting or regulated personal tax advice.
- Keep material exclusions alongside their claims. Remove repeated, non-material defensive caveats rather than allowing review to make prose progressively stiffer.
- Every article's structure and length must fit its reader question. Answer-first is universal; mandatory Quick Summaries, FAQs and uniformly sized articles are not.

## Source Hierarchy

Use this hierarchy whenever publishing or refreshing content:

1. Canonical effective-dated policy and implemented tax-domain code for the calculator's supported years; `src/constants/taxRates.ts` is a useful published-value interface, not independent statutory evidence. Verify relevant values against the current primary official sources below.
2. Official primary sources for rules and dates:
   - GOV.UK Income Tax: `https://www.gov.uk/income-tax-rates`
   - GOV.UK Scottish Income Tax: `https://www.gov.uk/scottish-income-tax/how-it-works`
   - GOV.UK National Insurance: `https://www.gov.uk/national-insurance-rates-letters`
   - GOV.UK student loan repayments: `https://www.gov.uk/repaying-your-student-loan/what-you-pay`
   - GOV.UK Self Assessment deadlines: `https://www.gov.uk/self-assessment-tax-returns/deadlines`
   - GOV.UK Making Tax Digital for Income Tax: `https://www.gov.uk/guidance/sign-up-for-making-tax-digital-for-income-tax`
   - Companies House guidance for company-formation claims.
   - Student Loans Company or GOV.UK guidance for student-loan claims.
   - Scottish Government sources for Scottish tax policy where GOV.UK has not yet mirrored the detail.
3. HMRC manuals, legislation, or policy papers for specialist claims.
4. Reputable secondary sources only for context, never as the sole source for a tax rule, date, rate, or obligation.

If official sources disagree, stop and document the conflict in the PR or issue. Do not guess.

## Tax-Year Discipline

- Use exact tax years, for example `2026/27` or `2026 to 2027`, instead of relying on "this year".
- Use absolute dates for deadlines and policy starts.
- Do not publish "latest", "current", "now", or "from today" claims without checking official sources during the current work session.
- Do not silently convert a 2025 or 2025/26 article into a 2026/27 article if the slug, examples, and links still imply the old year. Either refresh the whole post or leave a clear scope.
- Keep `publishedAt` as the original publication date.
- Set or update `updatedAt` when a post receives a meaningful factual, rate, deadline, or policy refresh.

## Hardcoded Numbers

The house rule is conservative:

- Avoid hardcoded tax-rate and threshold values in prose when the calculator can carry the answer.
- Hardcoded values are allowed only when they are the subject of the article, source-checked, and necessary for clarity.
- For any supported-year worked calculation, record exact inputs and compare the calculator result with **independently derived** official-rule workings or approved hand-derived fixtures. Neither the calculator nor `src/constants/taxRates.ts` independently proves statutory correctness. Do not present hypothetical future-year projections as supported calculator outputs.
- Never copy a worked example forward from a previous tax year without recalculating it.
- Avoid "save thousands", "free money", or similar claims unless the exact assumptions are visible and sourced.

## Frontmatter

Required fields:

- `title`
- `description`
- `excerpt`
- `publishedAt`
- `category`

Expected fields for public posts:

- `seoTitle`
- `updatedAt` when refreshed
- `featured`
- `tags`
- `image`
- `imageAlt`

Frontmatter guidance:

- Titles should state the topic plainly and include the tax year only when it is genuinely part of the search intent.
- Descriptions should be useful summaries, not keyword stuffing.
- Excerpts should avoid stale claims such as "new", "latest", or "this January" unless the date context is explicit.
- `imageAlt` should describe the image content, not repeat the title. Example: "Tax forms, calendar, calculator, and coins on a warm paper desk".
- Keep canonical URLs only where the existing post already uses them or the SEO route needs explicit preservation.

## Slugs And Redirects

- Prefer stable slugs for existing posts, even when the title is refreshed.
- Do not rename a published post file just to replace `2025` in the slug unless the work also adds a redirect and checks internal links.
- For new evergreen posts, avoid year-specific slugs unless the post is intentionally tax-year-specific.
- If a stale slug is retained for SEO, make the title, metadata, and intro clear about the current tax year.

## Post Structure

**Universal: open with the useful answer and its consequence.** Usually two or three sentences establish the result, who it affects and why the reader should continue. For a technical explanation or myth-buster, name the recognisable reader problem and resolve it promptly.

Choose the primary article format from [VOICE_AND_STYLE.md](VOICE_AND_STYLE.md):

- **Salary snapshot:** net pay first, one readable breakdown, material assumptions, relevant differences.
- **Explainer:** familiar situation, simple mechanism, appropriate example, practical check.
- **Problem-solver:** symptom, likely causes, tests to distinguish them, resolution.
- **What's changed:** affected groups, practical consequence, start dates and policy status.
- **Myth-buster / decision:** belief, correction, supporting calculation, where the answer differs.

These are choices, not rigid templates. Vary length with complexity; do not add a mandatory FAQ, character, table, joke or “TL;DR” box. A worked example is encouraged **when useful and when its outputs can be independently validated**, not required for every brief news update.

After the opening, each section should deliver additional explanation, a worked consequence or a useful next step—not repeat the same summary. Use headings that make the next thought clear; questions are optional.

## Reader Journey

Check the reader's next useful step before publishing or refreshing a post:

- Link to `/#tax-calculator` when readers can genuinely use the supported calculator for the scenario; explain any unsupported year or calculation.
- Link to `/tools/director-guide` only for a relevant, supported director scenario.
- Link to `/compliance` where evidence, methodology or limitations materially help assess a claim; it is **not** a mandatory promotional link in every post.
- Add genuinely useful contextual article or tool links without a fixed link quota.
- Do not link to tools, features or future products that do not exist.

## Refresh Workflow

Use this workflow for audits, tax-year refreshes, or consistency passes:

1. Run `bun run blog:audit`.
2. Inventory the posts being touched and classify each as `keep`, `refresh`, `rewrite`, `merge`, or `retire`.
3. Check frontmatter, slug/date alignment, current tax year, image path, and links.
4. Source-check unstable claims against the hierarchy above.
5. Recalculate supported-year examples with recorded engine inputs/outputs **and** independently cross-check official-rule workings or hand-derived fixtures. For future years, separate illustrative assumptions from unsupported calculator functionality.
6. Rewrite prose against the voice guide, then update examples, metadata, disclaimer and internal links together. Keep material caveats close to claims; remove duplicative defensive text.
7. Regenerate the featured image if the post image does not match the Ledger style in `docs/blog/IMAGE_WORKFLOW.md`.
8. Update `updatedAt` only for meaningful factual refreshes.
9. Record large refresh batches in `docs/BACKLOG.md`, a GitHub issue, or the PR description.

## Accuracy and Readability Checklist

Before a content PR is ready, run **one independent review with two explicit verdicts** (accuracy and editorial readability). Both must pass; there is no second mandatory reviewer loop.

**Accuracy:**

- Current tax year and absolute dates are correct.
- Official sources were checked during the work session for unstable claims.
- For supported years, worked examples have recorded inputs/outputs **and** an independent statutory calculation or fixture confirming the relevant values and rounding; future-year illustrations are clearly labelled and separately sourced.
- No unsupported provider, product, security, production-status, or usage claims were introduced.
- UK English is used throughout.
- The article does not overpromise savings, certainty, or personalised advice.
- The disclaimer is present and proportionate.
- The image path exists, the image is 1600x1000, and the `imageAlt` is accurate.

**Readability:**

- The first screen gives the answer and consequence in natural British English; the intro does not begin with obligatory caveats or a definition when the reader came for an answer.
- The draft has a specific intended reader and one useful primary format; paragraphs and examples advance the explanation rather than repeat a Quick Summary.
- Headings, sentence rhythm, tables, examples and links are easy to follow; forced slang, hype, generic transitions and repetitive disclaimers are removed.
- Caveats that materially affect interpretation stay with their claims. Other assumptions are grouped or omitted when genuinely non-material; citations remain traceable to the statements they support.
- Realistic scenarios are clearly hypothetical, show the relevant pay period and use independently verified figures. Do not invent a named person's real experience or force a character into every article.
- Inspect the rendered opening and a representative middle section, including mobile table width and text hierarchy. The maintainer makes the final publication decision.

Reviewers must flag misleading omissions **and** remove unnecessary caveats. Passing repo tests proves neither editorial quality nor article comprehension.

## Verification

For docs-only changes, run the smallest relevant checks.

For blog refresh planning, run:

```bash
bun run blog:audit
```

For post or image changes, prefer:

```bash
bun run check:repo
bun run build:ci
```

When touching blog rendering, category behaviour, image paths, or MDX components, also inspect:

- `/blog`
- one category page
- at least one changed post

Use local visual inspection when practical. The build catches MDX and route-generation failures, but it will not tell you whether a post reads well or whether a generated image feels off-brand.

For editorial changes, inspect the title, opening, at least one middle section, tables and links in a real desktop/mobile rendering. Keep one independent review with separate accuracy and readability verdicts, followed by the maintainer's human spot-check. Do not infer article completion from GA4's `blog_article_read` event: it fires on component mount, while site-wide `scroll_depth` tracks the whole page. Consent limitations and the backlog's search-evidence protection remain in force.
