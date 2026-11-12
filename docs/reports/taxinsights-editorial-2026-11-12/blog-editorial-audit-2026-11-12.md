# TaxInsights editorial audit and evergreen plan — 12 November 2026

Scope: `docs/blog/*` (5 files), all 33 posts in `content/blog/`, the article template
(`src/app/blog/[slug]/page.tsx`), `scripts/audit-blog-content.ts`, `check:blog-guidance`
(`src/lib/currentBlogGuidance.ts`), `check:tax-facts`, and the blog rules in `AGENTS.md` and
`docs/business/PRODUCT_DIRECTION.md`. Read-only: nothing in the tracked tree was changed. This
file sits in the git-ignored `audit-outputs/` folder.

Not done: no tax figure was re-derived. Statements about figures describe where they appear and
how they are framed, not whether they are correct. `bun` is not available in the shell this audit
ran from, so `bun run blog:audit` was not executed; the counts below come from direct file analysis.

Confidence labels: **high** = read directly in code or content; **moderate** = inference from
several observations; **low** = plausible, not tested.

---

## 1. Verdict

The standard written on 29 October (#146) is right. It has not been applied, and three parts of
the system work against it. The library is in three states, none of which matches the standard:

| State | Posts | What it reads like | Accuracy state |
| --- | ---: | --- | --- |
| Hype (2025 originals) | 11 | "Here's the shocking truth", TL;DR boxes, emoji, 100+ bullets | 9 of the 11 are still framed entirely as 2025/26 |
| Compliance (Jul–Nov 2026 refreshes) | 19 | Reference cards: assumption lists, tables, a qualifier on most sentences | Current for 2026/27 |
| Reader-first (partial) | 3 | Closer, still dense | 2 current; the pension post is still 2025/26 |

The pattern underneath is the finding that matters: **the 19 posts that went through the
2026/27 accuracy refresh read like reference cards, and 9 of the 11 posts that still have a
voice have not been through it.** In this repo accuracy and voice have been traded against each other, post by
post. That is a process property, so more style guidance will not fix it. (Confidence: high on
the pattern, moderate on the causal reading.)

## 2. The strongest case against changing anything

- PayeTax is an R&D project, "not a commercial growth site". The property had 660 clicks in the
  three months to August; even a large relative gain is small in absolute terms.
- The only posts with real search visibility are the dry salary pages (£40k: 35,222 impressions,
  £70k: 27,689, £60k: 17,103). `PRODUCT_DIRECTION.md` protects the £70k pattern on evidence.
- The lively posts are the ones carrying "shocking truth" and "save thousands", which the current
  guardrails ban. Reintroducing personality has a track record here of reintroducing error.

Why that does not settle it:

- The trade-off comes from how accuracy is implemented (as sentences in the reading path), not
  from accuracy itself. Section 5 removes the trade-off instead of picking a side.
- The dry version is not obviously winning. £40k sits at average position 6.7 with a 0.2% CTR.
  Generic position-7 CTR curves are in the low single digits (moderate confidence, general
  industry figures), so the page takes roughly a tenth
  of what position alone would suggest. Much of that gap is probably calculators and AI answers
  in the results page, not prose (low confidence on the split). So do not justify this work by
  traffic. Justify it by the docs' own test: "the writing must help a real reader understand
  something".
- By the repo's own standard the salary posts already fail: `VOICE_AND_STYLE.md` quotes "That is
  a modelled PAYE result, not a statement of exactly what every employee will receive" as the
  **Before** example, and that exact sentence is live in 5 posts.

## 3. Why the posts feel overwhelming and soulless — measured

| Observation | Evidence | Confidence |
| --- | --- | --- |
| Proof is in the reading path | £40k post: answer in sentence 1, then a disclaimer sentence, 8 assumption bullets, and a section reconciling a £2.44 difference between two calculation methods, before anything a reader asked for | high |
| Qualifier density | Salary posts carry 25–43 hedging terms ("estimate", "modelled", "does not establish", "assum…") in 900–1,700 words; £100k has 43 | high |
| Nobody is speaking | "you" appears 7–13 times per 1,000 words in the salary posts against 29–79 in most of the 2025 originals | high |
| One fifth of every post is tail | 19% of all body words sit in Sources / Tools / FAQ / Key Takeaways / Next Steps / Disclaimer sections; 23–34% in the salary posts | high |
| The template then adds four more blocks | Disclaimer box, "Useful tools for this topic", "Found this helpful?" CTA, Related Articles | high |
| FAQ is universal | 33 of 33 posts have an FAQ section although the guide says it is not mandatory; most FAQ answers restate the body | high |
| Summary box is near-universal | 27 of 33 open with Quick Summary / At a Glance / TL;DR, which the guide says is not required | high |
| Hype posts overload differently | £100k trap: 136 bold spans, 165 list items, 31 H3s. Marriage Allowance: 107 list items, 24 emoji | high |
| Library size | 59,330 words, mean 1,797 per post | high |

"Soul" here has a concrete meaning: a post has it when (a) someone is clearly talking to you,
(b) it has a point of view about what matters in the numbers, and (c) it shows you one thing you
did not expect. The compliance posts have none of the three. The hype posts fake (b) and (c) with
adjectives.

## 4. Audit of the docs and the system around them

### 4.1 `docs/blog/` file by file

| File | Size | Verdict | Findings |
| --- | --- | --- | --- |
| `README.md` | 33 lines | Keep as the single entry point | Pipeline is sound. Steps are dense paragraphs. Restates the philosophy file. |
| `CONTENT_PHILOSOPHY.md` | 46 lines | Fold into README, then delete | Almost every principle is restated in VOICE_AND_STYLE or BLOG_GUIDE. A fourth place to keep in sync. |
| `VOICE_AND_STYLE.md` | 107 lines | Right diagnosis, wrong form | No full-article exemplar: examples are single sentences with £X/£Y placeholders. Bans hype phrases but has no list of compliance phrases. 32 negations; the guide hedges the way the posts do ("neither … is a quota", "not approved tax figures"). "Adopting the standard" calls for a pilot that has not happened. |
| `BLOG_GUIDE.md` | 192 lines | Keep for accuracy and publishing only | "Editorial Position", "Post Structure" and the readability checklist duplicate the voice guide. The "one review, two verdicts" rule is restated in several sections of this file. The hardcoded-numbers rule ("avoid … when the calculator can carry the answer") is unimplemented: 1 of 33 posts uses a data-bound component. |
| `IMAGE_WORKFLOW.md` + `ai-image-prompts.json` | 159 + 184 lines | Fine | Self-contained and specific. One gap noted in 4.2. |

Across the four prose files: about 4,300 words of guidance, "answer-first" stated 7 times, and
both the five formats and the two-verdict review described in all 4 files. The guidance is correct and
repetitive, which is the same fault the posts have.

### 4.2 Contradictions and forces working against the standard

| # | Finding | Evidence | Confidence |
| --- | --- | --- | --- |
| C1 | **Two documents give opposite instructions about the salary pattern.** `PRODUCT_DIRECTION.md` says "Protect the £70k article's answer-first, evidence-first pattern; reproduce a concrete defect before changing it". The £70k post's second sentence is the voice guide's **Before** example. An agent will follow the protection. | `PRODUCT_DIRECTION.md` protected contracts; `VOICE_AND_STYLE.md` before/after; `what-70k…mdx` line 2 | high |
| C2 | **CI requires off-topic copy in salary posts.** `check:blog-guidance` makes the five registered "current guidance" posts, including £50k and £70k, contain the full mileage rule ("55p per mile … first 10,000 … 25p … after"), the phrase "cannot claim homeworking tax relief", and Plan 2 annual, monthly and weekly thresholds on one line. That is why two salary snapshots have a "Job Expenses in 2026/27" section. | `src/lib/currentBlogGuidance.ts` `checkPositiveCurrentGuidance`; `src/constants/currentTaxGuidance.ts` | high |
| C3 | **The published byline contradicts the docs.** All 33 posts say `author: "PayeTax Team"`; the template rewrites that to "PayeTax Editorial Team" on the page and in Article structured data. `blog.config.ts` uses "TaxInsights Editorial Team". The docs say "No invented editorial staff" and "Do not imply an editorial staff". | `page.tsx:240`; `StructuredData.tsx:772`; `blog.config.ts:91,193` | high |
| C4 | **The template breaks the Reader Journey rules on every post.** It always links Director Intelligence and Compliance. BLOG_GUIDE says link Director Intelligence "only for a relevant, supported director scenario" and that Compliance "is not a mandatory promotional link in every post". | `BASE_INTERNAL_LINKS` in `page.tsx` | high |
| C5 | **The real opening is not covered by the opening rules.** The template prints `excerpt` as a standfirst under the H1, then a 16:10 hero image, then the body. So the first thing a £40k reader meets is "See a clearly qualified 2026/27 PAYE estimate … including payroll-period rounding, Plan 2 and pension-method caveats." The guide treats excerpt as metadata. | `page.tsx` header; £40k frontmatter | high |
| C6 | **The accuracy review can only add.** One reviewer gives both verdicts. The accuracy verdict is checkable; the readability verdict is opinion. A missing caveat is a finding; a dead paragraph is not. The docs name this ratchet and answer it with an instruction, not a mechanism. | README step 6; observed outcome in 19 refreshed posts | moderate |
| C7 | **The standard was written and then bypassed.** Since #146 merged on 29 October, three commits touched posts (2, 3 and 11 November). All were factual patches. The £40k and £70k posts were edited on 3 November and kept the Before sentence. | `git log -- content/blog` | high |
| C8 | **FAQ sections exist for a search feature that has gone.** The template turns FAQ headings into FAQPage structured data. Google stopped showing FAQ rich results on 7 May 2026 and says the markup "can stay in place" without effect. | `extractFAQs` in `page.tsx`; Search Engine Journal report of Google's notice | high on the code, moderate on the search detail (one secondary source read) |
| C9 | **`blog:audit` cannot check images on Windows.** Size checks call macOS `sips`; on failure the function returns `undefined` and no flag is raised, so `--strict` passes without checking. The BLOG_GUIDE checklist item "the image is 1600x1000" is unverifiable on this machine. | `getImageSize` in `scripts/audit-blog-content.ts` | high |
| C10 | **Five in-body Disclaimer sections remain** although the template has added a disclaimer box since February. Readers of those posts get two. | `^## Disclaimer` in 5 posts; commit `295249df` | high |
| C11 | **No lifecycle.** 24 of 33 slugs contain "2025"; 14 of those now carry 2026/27 titles. Three expired news posts are kept alive by rewriting them in the past tense ("has passed", "took place", "ended"). The refresh workflow has keep/refresh/rewrite/merge/retire but no rule for what kind of post something is. | slugs and titles; openings of the Self Assessment, Spring Forecast and year-end posts | high |
| C12 | **No feedback signal for writing quality.** `blog_article_read` fires on mount and the docs rule out new tracking. The only readability gate is a reviewer's opinion. | README step 8 | high |

### 4.3 Stale-year exposure (accuracy, separate from voice)

Ten posts mention 2025/26 and never mention 2026/27: `100k-tax-trap-avoid-60-percent-tax-2025`
(featured and editor's pick), `frozen-tax-thresholds-stealth-tax-2026`,
`higher-rate-taxpayer-guide-uk-2025`, `marriage-allowance-uk-2025-guide`,
`pension-tax-relief-uk-2025-guide` (updated 2 November), `salary-sacrifice-explained-2025-26`,
`setting-up-limited-company-uk-2025-26`, `uk-tax-changes-2025-complete-guide`,
`understanding-the-uk-tax-system-2025`, `understanding-uk-tax-codes`. Whether each figure still
holds was not checked. Several of these also carry phrases the guardrails ban ("shocking truth",
"brutal", "save thousands", "Huge Opportunity!").

---

## 5. The system: take the accuracy out of the sentences

One idea drives everything below. Today a post has to be the answer, the evidence and the audit
trail at once, all in prose, so every accuracy improvement makes the prose longer and stiffer.
Split those three jobs and each can be done properly.

### 5.1 A fact ledger per post

A small sidecar (`content/blog/<slug>.facts.json`, or a frontmatter block) listing every figure
the post publishes, each one typed:

- `engine` — scenario inputs and the output field. A test recomputes it, and checks the scenario
  is covered by a hand-derived fixture in `src/test/payeVerificationFixtures/` or a recorded
  independent working, so the engine still does not certify itself.
- `source` — URL, section, date checked, legal status (enacted / proposed).
- `derived` — arithmetic on other ledger entries.

One CI rule: every £ amount and percentage in the body must match a ledger entry.
`check:tax-facts` already scans `content/blog` for values and keeps per-file counts, so this
extends an existing control. It replaces three things: the required-copy rules in
`check:blog-guidance` (C2), the practice of recording engine inputs and outputs in PR text, and
the per-file baseline counts for posts.

What it buys:

- The Tier 1 other-model review becomes a review of the ledger: small, mechanical, checkable.
- A prose edit that does not change the ledger becomes Tier 2. Voice work stops being blocked
  behind accuracy review, and accuracy review stops rewriting sentences.
- When `taxRates.ts` changes, CI can list every post whose ledger cites the changed value. That
  is the April refresh queue, generated instead of hand-built.

Confidence: high that this addresses the cause; moderate on effort, since only part of
`scripts/tax-domain-controls.ts` was read.

### 5.2 Page anatomy with a caveat budget

1. **Standfirst (`excerpt`)**: the hook, written as the first line a reader sees. One sentence.
2. **Answer**: one or two sentences, in the reader's units (per month before per year).
3. **The one thing**: the single observation that makes the number mean something. Every post
   needs one; if there is none, there is no post.
4. **One qualifying sentence**: only the assumptions that could change this reader's decision.
5. **Body**: only sections that answer the next question the reader would ask, in the order they
   would ask it.
6. **Two collapsed panels** (new MDX components): `What this assumes` and `How we checked this`.
   Everything displaced from the reading path goes here: the full assumption list, the
   monthly-versus-annual reconciliation, rounding, the fixture reference. The proof stays on the
   page, one tap away.
7. **One ending**: sources generated from the ledger, and one next step. No in-body Tools,
   Key Takeaways, Next Steps or Disclaimer sections; the template already supplies them.
8. **FAQ only for questions the body does not answer.** Default is none.

Caveat rule, as a test rather than a principle: a caveat stays inline only if a reader who missed
it could make a worse decision. Everything else goes in a panel. A reviewer who adds an inline
caveat must name the decision it protects.

Independent length estimates (moderate confidence): salary snapshot 450–600 visible words
(now 900–1,700); explainer 800–1,200 (now 1,250–3,400); library total about 30,000 words
(now 59,330).

### 5.3 Voice by exemplar

Agents imitate examples far more reliably than they follow rules, and at the moment there is no
example of a good complete post. So:

- Three gold posts, one per failure mode (see Phase 1), become the specification.
- `VOICE_AND_STYLE.md` shrinks to one screen: the reader, the anatomy, six moves, two banned
  lists, links to the exemplars.
- Six moves: say the number in monthly pay; say what it costs or gains per £1 or per payslip;
  give the reason for a rule in one plain sentence; address the reader as "you" and speak as
  "we" where PayeTax did the work; name the thing most people get wrong; stop when the question
  is answered.
- Banned list A, hype: "shocking truth", "brutal", "nobody tells you", "save thousands",
  "huge opportunity", "spoiler", emoji bullets.
- Banned list B, compliance: "That is a modelled PAYE result", "not a statement of",
  "does not establish", "It is not a generic …", "under the assumptions in this article",
  "clearly qualified", and any FAQ answer that repeats a body sentence.

Both lists are greppable, so `blog:audit` can flag them.

### 5.4 Roles in the pipeline

Fits the existing Codex-implements / Claude-reviews split.

| Step | Output | Rule |
| --- | --- | --- |
| 1. Brief | Five lines: reader, question, the answer in one sentence, the one thing, format | If the answer will not fit in one sentence, the post is not ready |
| 2. Facts | The ledger, verified | Tier 1, other-model review. No prose yet |
| 3. Draft | The post | The writer may use only ledger figures |
| 4. Accuracy pass | Flags | Compares prose with ledger and brief. May flag or delete. May not add sentences; additions go to a panel unless the caveat test in 5.2 is met |
| 5. Cold read | Three answers and a skip list | A reader with no context (a fresh model session works) sees only the rendered first screen and answers: what is the answer, does it apply to me, what would I do next. Then reads the whole post and lists every sentence they would skip. Skipped sentences are cut or moved to a panel |
| 6. Maintainer | Merge decision | Reads the opening aloud in the rendered page |

Step 5 is what makes readability falsifiable without adding any analytics.

### 5.5 Lifecycle: three kinds of post

| Class | What it is | Slug | How it stays current |
| --- | --- | --- | --- |
| `annual` | Salary and director snapshots | Year-neutral in future; existing slugs retained | Ledger is all `engine` entries, so it rolls with the supported tax year each April |
| `evergreen` | Explainers, problem-solvers, decisions | Year-neutral | Reviewed when a ledger value changes, and once each April |
| `dated` | Budgets, statements, a specific year's deadline | Year in slug | Never patched into current guidance. After the event it is frozen behind a one-line banner linking to the current evergreen page |

Add `lifecycle` and `reviewBy` to frontmatter; `blog:audit` flags anything overdue.

Yearly rhythm:

- **Autumn Budget**: one `dated` post; update ledgers only for measures that are enacted.
- **February–March**: prepare next-year ledger values as they are confirmed.
- **6 April**: roll `annual` posts; review `evergreen` posts flagged by the ledger diff.
- **Self Assessment and year-end**: one evergreen page each, with dates that roll, instead of a
  new post every year.

---

## 6. Plan

**Phase 0 — remove the contradictions (one small docs PR, Tier 2)**

- Decide C1: reword the `PRODUCT_DIRECTION.md` protection so it protects the £70k URL,
  answer-first order and independently verified figures, not its sentences.
- Decide C3: one honest byline (for example "PayeTax") in posts, template and config.
- Fold `CONTENT_PHILOSOPHY.md` into `README.md`; move all voice material out of `BLOG_GUIDE.md`;
  add the anatomy, caveat test, banned lists and lifecycle classes.
- Target: four prose docs become three, about 4,300 words become about 2,000.

**Phase 1 — three exemplars (pilot)**

| Post | Format | Why this one |
| --- | --- | --- |
| `what-40k-salary-actually-looks-like-uk-2025` | Salary snapshot | Most-seen page; figures corrected on 3 and 11 November; highest tail ratio among the refreshed posts |
| `how-national-insurance-works-uk-2025` | Explainer | Current facts, table-led, no voice; typical compliance explainer |
| `100k-tax-trap-avoid-60-percent-tax-2025` | Myth-buster / decision | Featured, still 2025/26, most banned phrases; proves the system can keep the energy and lose the hype |

Build the ledger and the two panel components for these three only. URLs unchanged.
Exit test: each passes the cold read, and each ledger passes other-model review.
Watch £40k CTR over matched 28-day windows, treated as a weak signal only.

**Phase 2 — template and tooling**

- Ledger check joins `check:repo`; retire the required-copy rules (C2).
- Template: contextual tool links only (C4); one closing block instead of four; decide whether
  FAQ structured data stays (C8).
- `blog:audit`: banned-phrase flags, lifecycle and `reviewBy` flags, an image-size check that
  works on Windows or reports that it was skipped (C9).

**Phase 3 — roll out in this order**

1. Remaining salary snapshots (£50k, £60k, £70k, £80k, £100k): mechanical once £40k exists.
2. The ten stale-year posts in 4.3, because they are an accuracy exposure as well as a voice one.
3. Remaining compliance explainers.
4. Merge candidates, each gated on search evidence and redirects as `PRODUCT_DIRECTION.md` requires.
5. Freeze the dated posts.

**Phase 4 — steady state**: the rhythm in 5.5. New posts only when a brief passes step 1.

---

## 7. Disposition of all 33 posts

Voice: H = hype, C = compliance, R = reader-first (partial). Class: A = annual, E = evergreen,
D = dated. "Stale" = mentions 2025/26 and never 2026/27.

| Post | Words | Voice | Class | Action |
| --- | ---: | :---: | :---: | --- |
| what-40k-salary-actually-looks-like-uk-2025 | 1,244 | C | A | **Exemplar 1** |
| what-50k-salary-actually-looks-like-uk-2025 | 1,026 | C | A | Rewrite from exemplar; drop Job Expenses section once C2 is retired |
| what-60k-salary-actually-looks-like-uk-2025 | 1,244 | C | A | Rewrite from exemplar |
| what-70k-salary-actually-looks-like-uk-2025 | 1,116 | C | A | Rewrite from exemplar after C1 is decided; drop Job Expenses section |
| what-80k-salary-actually-looks-like-uk-2025 | 1,389 | H | A | Rewrite from exemplar; the only salary post never brought into line |
| what-100k-salary-actually-looks-like-uk-2025 | 1,821 | C | A | Rewrite from exemplar; hand the taper explanation to the £100k trap post |
| 100k-company-profit-director-take-home-2025-26 | 1,170 | C | A | Rewrite as director snapshot |
| 100k-tax-trap-avoid-60-percent-tax-2025 | 2,752 | H, stale | E | **Exemplar 3** |
| how-national-insurance-works-uk-2025 | 1,247 | C | E | **Exemplar 2** |
| understanding-uk-tax-codes | 1,475 | H, stale | E | Rewrite as problem-solver ("is my tax code wrong?"). Liveliest post in the library; keep its directness |
| marriage-allowance-uk-2025-guide | 2,168 | H, stale | E | Rewrite; about 600 words would cover it |
| salary-sacrifice-explained-2025-26 | 3,371 | H, stale | E | Rewrite; longest post, 143 list items |
| pension-tax-relief-uk-2025-guide | 3,292 | R, stale | E | Rewrite; opening is already good, body is not |
| electric-car-salary-sacrifice-guide | 2,582 | R | E | Trim; 27% tail, summary box repeats the body |
| student-loan-repayment-changes-2025-26 | 1,399 | C | E | Rewrite as explainer |
| frozen-tax-thresholds-stealth-tax-2026 | 1,796 | H, stale | E | Rewrite as explainer of fiscal drag |
| scottish-vs-english-tax-rates-2026-comparison | 1,372 | C | E | Light rewrite; only post already using data-bound components. Move "how the crossover is reproduced" to a panel |
| making-tax-digital-income-tax-2026 | 1,933 | C | E | Light rewrite; good first sentence |
| setting-up-limited-company-uk-2025-26 | 2,422 | H, stale | E | Rewrite as decision post |
| director-salary-dividends-guide-2025-26 | 1,569 | C | E | Merge candidate with the next row |
| director-salary-vs-dividends-comparison-2025-26 | 1,274 | C | E | Merge candidate with the previous row |
| director-tax-deadlines-2025-26 | 1,336 | C | E | Rewrite as evergreen deadlines page |
| higher-rate-taxpayer-guide-uk-2025 | 2,600 | H, stale | E | Merge candidate: overlaps the £100k trap, pension and salary sacrifice posts |
| beginners-guide-to-uk-taxation | 1,903 | C | E | Merge candidate (three overlapping basics posts); had zero impressions in the August audit |
| understanding-the-uk-tax-system-2025 | 2,276 | H, stale | E | Merge candidate with the beginner's guide |
| how-much-tax-will-i-pay-uk-2025 | 1,364 | C | E | Merge candidate with the beginner's guide, or rewrite as a problem-solver |
| uk-tax-calculator-2025-complete-guide | 1,526 | C | E | This is product documentation ("what the calculator covers"). Retitle to say so, or move the content to `/compliance` |
| budget-2026-uk-tax-changes-explained | 1,676 | R | D | Light pass on the opening (LEL jargon in sentence 2); freeze after Finance Bill outcome |
| autumn-budget-2025-uk-tax-changes-explained | 2,730 | H | D | Freeze; already carries an update banner |
| spring-statement-2026-uk-what-to-expect | 995 | C | D | Freeze |
| uk-tax-changes-2025-complete-guide | 1,706 | H, stale | D | Freeze as a 2025/26 record |
| self-assessment-deadline-january-2026-what-you-need-to-know | 1,810 | C | D | Replace with an evergreen deadlines page; freeze this one |
| year-end-tax-planning-2025-26-complete-checklist | 1,746 | C | D | Replace with an evergreen checklist; freeze this one |

Merge and replace actions change URLs, so each needs page and query evidence plus redirects
first. If the evidence is not there, rewrite in place.

---

## 8. What "better" looks like: the £40k opening

Uses only figures already published in the post. None were re-derived for this audit.

**Now** (what a reader meets, in order):

> *Standfirst:* See a clearly qualified 2026/27 PAYE estimate for a £40,000 salary, including
> payroll-period rounding, Plan 2 and pension-method caveats.
>
> For 2026/27, PayeTax estimates that a £40,000 annual salary produces take-home pay of about
> £32,322 a year, or £2,694 a month.
>
> That is a modelled PAYE result, not a statement of exactly what every employee will receive.
>
> **Assumptions** — eight bullets — then two tables and a section on why a simplified annual
> calculation differs by £2.44.

**Proposed:**

> *Standfirst:* £2,694 a month, before a pension or student loan takes its share. Here is where
> the rest goes.
>
> On £40,000 a year you take home **£2,694 a month** in 2026/27, or £32,322 over the year.
> Income Tax takes £5,484 and National Insurance £2,194, so about 19p of every pound you earn is
> gone before it reaches you.
>
> That is the plain version: a standard tax code, living in England, Wales or Northern Ireland,
> no pension and no student loan. Most people on £40k have at least one of those, so this is
> what each does to your month.
>
> | If you also have | Monthly take-home |
> | --- | ---: |
> | Nothing else | £2,694 |
> | A Plan 2 student loan | £2,615 |
> | 5% into your pension by salary sacrifice | £2,574 |
>
> Look at the pension row. £167 a month goes into your pension and your pay drops by only £120.
> The other £47 is tax and National Insurance you no longer pay.
>
> ▸ What this assumes  ▸ How we checked these figures

Every figure is the same. The eight assumptions, the reconciliation and the pension-method
distinctions are still on the page, in the two panels. The reader gets a point of view (19p in
the pound; £167 for £120) that the current post never offers although it holds all the numbers
needed to make it.

Arithmetic for the new derived statements: (5,484 + 2,194) / 40,000 = 19.2%;
2,000 / 12 = £166.67; 2,694 − 2,574 = £120; 166.67 − 120 = £46.67.

---

## Sources

- Repository files named inline, at branch `codex/jgf-72-fixture-provenance`, 12 November 2026.
- Search Console figures: `docs/reports/search-discoverability-evidence-audit-2026-08-23.md`.
- FAQ rich results: Search Engine Journal, "Google Drops FAQ Rich Results From Search",
  https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
