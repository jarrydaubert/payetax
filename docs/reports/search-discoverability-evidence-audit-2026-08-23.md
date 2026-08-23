# Search Discoverability Evidence Audit — 23 August 2026

**Status:** audit only; no production behaviour changed

**Code baseline:** clean `main` at `b721987451bd064721569259e8c138894848ef49` (merged PR #110)

**Evidence date:** 23 August 2026

**Scope:** reconcile supplied manual Google Search Console observations with the retained public surface and current source code

## Executive conclusion

The current code does not expose a technical indexing block for the beginner guide. It is canonical, indexable, present in the sitemap and `llms.txt`, linked from paginated blog and category listings, and selected by four related-article modules. Its weak discovery is more plausibly associated with low deliberate internal prominence, substantial semantic overlap with three other general PAYE guides, and Google having a stored crawl from before the 29 July rewrite. The live URL test and submitted indexing request mean another beginner-guide rewrite would be premature.

The clearest evidence-backed implementation opportunity is on the £40k and £60k salary pages. Their title, metadata title, H1 and Article headline match high-impression after-tax queries, but their excerpts, openings and first FAQ entities lead with lifestyle and unsupported income-position claims instead of the take-home answer. The £70k page already leads with a qualified annual and monthly answer; its recent query expansion and broader average positions should be monitored while Google reassesses it.

The Scottish calculator has a materially stronger and more varied source-level link footprint, and Search Console shows a correspondingly stronger click-through result. This is correlation, not proof of causation, but it supplies a useful internal-link benchmark.

The canonical sitemap currently contains 52 retained, indexable URLs. Search Console last read the sitemap on 12 June and reports 50 discovered pages, so the two counts are not contemporaneous. The supplied crawl and Page Indexing data do not support crawl-budget work, redirect removal, mass deletion, mass `noindex`, or salary-page consolidation.

## Evidence rules and limitations

This report uses two deliberately separate evidence classes:

1. **Observed Search Console facts** are the values and manual observations supplied for this audit. No raw Search Console export or authenticated API access was available in the repository, so “observed” means faithfully transcribed from the supplied manual investigation, not independently re-fetched.
2. **Code findings** were reproduced against the baseline SHA above by inspecting the MDX content, route metadata, sitemap generation, redirect rules, structured-data extraction and internal-link components.

Any causal explanation is labelled as an **inference**. Search Console’s Internal Links and External Links screens are sampled and can lag recrawls; their counts are not expected to equal a count of current HTML anchors. Position, CTR and impression changes alone do not prove cannibalisation, ranking loss or a crawl problem.

Primary code evidence came from:

- the audited articles in `content/blog/`;
- blog metadata, Article/FAQ/HowTo generation and contextual tool links in `src/app/blog/[slug]/page.tsx` and `src/lib/mdx.ts`;
- listing, category and related-article selection in `src/app/blog/`, `src/components/organisms/AllPostsGrid.tsx` and `src/lib/blog.ts`;
- tool-directory links in `src/constants/pages/toolsData.ts`, `src/app/tools/page.tsx` and the Director Intelligence sidebar;
- sitemap, robots and `llms.txt` routes in `src/app/`;
- retained redirects in `next.config.ts`;
- the sitemap crawl guard in `e2e/search-discoverability.spec.ts`.

## Supplied Search Console observations

### Performance

| Scope | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| Property, latest 3 months | 660 | 180,000 | 0.4% | 10.8 |
| £40k salary page | 60 | 35,222 | 0.2% | 6.7 |
| £60k salary page | 56 | 17,103 | 0.3% | 6.8 |
| £70k salary page | 35 | 27,689 | 0.1% | 8.0 |
| Scottish calculator | 242 | 8,979 | 2.7% | 10.0 |
| Query `scotland v england income tax calculator` | not supplied | not supplied | 15.8% | 3.9 |

Additional observed facts:

- In the latest 28-day view, £70k impressions expanded dramatically for the same core after-tax queries while average positions broadened towards 9–10.
- The beginner guide recorded zero impressions in both recent 28-day periods.
- Search Console stored the beginner guide’s last crawl as 11 April 2026. A live test on 23 August passed and reported that the page can be indexed; a manual indexing request was submitted.
- The sitemap is successful, but Search Console last read it on 12 June and reports 50 discovered pages.
- The sampled external-link report currently shows one backlink.

### Crawl and indexing

Observed Crawl Stats:

- 6.1k crawl requests
- 141 ms average response time
- no host problems
- 88% `200`
- 7% permanent redirects
- 5% `404`
- sampled `404` responses are primarily obsolete Next.js chunks and Apple association probes
- sampled redirects are retired programme URLs

Observed sampled internal-link counts:

| Target | Sampled internal links |
|---|---:|
| Scottish calculator | 106 |
| Scotland-v-England article | 80 |
| £40k salary page | 35 |
| £60k salary page | 29 |
| £100k salary page | 25 |
| £70k salary page | 16 |
| Beginner guide | absent from sample |

Observed Page Indexing classifications:

| Classification | Count |
|---|---:|
| Indexed | 36 |
| Crawled — currently not indexed | 38 |
| Redirect | 82 |
| `noindex` | 108 |

The supplied `Chart.csv` reading moves from 121 indexed pages and 593 impressions on 25 May to 36 indexed pages and 4,184 impressions on 17 August.

**Inference:** the simultaneous fall in indexed URL count and rise in impressions is consistent with the retired programme being removed while retained pages gain visibility. It is not evidence that the current 52-URL sitemap should be reduced further. The Page Indexing total also materially exceeds the current route inventory, which shows that the property classifications include historical and non-canonical URLs.

## Code audit

### 1. Actual source-level links into the priority pages

The following distinction matters:

- **Deliberate links** are explicit page or MDX anchors to a target.
- **Generated HTML links** arise from listings, category pages, related-article selection or contextual link components.
- The sitemap and `llms.txt` are machine-readable discovery surfaces, not HTML internal-link equivalents.

#### Beginner guide

There are no explicit hand-authored anchors to `/blog/beginners-guide-to-uk-taxation` in current production source. The only exact slug references are its own frontmatter/canonical and the reviewed-guidance registry.

It is not orphaned:

- it is item 30 of 32 in the canonical publish-date order, placing it on `/blog?page=3` with 12 posts per page;
- it is item 4 of 6 on `/blog/category/tax-basics`;
- the current related-post algorithm selects it on four article pages:
  - `how-national-insurance-works-uk-2025`;
  - `understanding-the-uk-tax-system-2025`;
  - `uk-tax-calculator-2025-complete-guide`;
  - `understanding-uk-tax-codes`;
- it is included in the XML sitemap and in the reviewed-current-guidance section of `llms.txt`.

The `featured: true` frontmatter flag does not create current homepage prominence. The blog page renders the latest five posts, five editor’s picks and the paginated all-post grid; the older beginner guide is not in either of the first two sets.

**Inference:** the code explains weak *prominence* better than weak *indexability*. Generated related links and deep listing placement provide crawl paths, but the absence of intentional contextual anchors gives the page a weaker editorial signal than the Scottish calculator. Search Console’s absent sample is consistent with that pattern, but it does not prove Google sees zero links.

#### Salary pages

There are no explicit hand-authored anchors to any of the six retained salary-page slugs. Each page is reachable from the blog grid, the Salary Guides category, related-article modules, sitemap and `llms.txt`.

| Page | Blog grid position | Salary category position | Current incoming related-article selections |
|---|---:|---:|---|
| £40k | 9 (page 1) | 2 | £100k company-profit guide; £80k, £70k, £50k and £60k salary pages |
| £50k | 12 (page 1) | 5 | £70k salary page |
| £60k | 13 (page 2) | 6 | £40k, £80k and £100k salary pages |
| £70k | 11 (page 1) | 4 | £100k company-profit guide and £50k salary page |
| £80k | 10 (page 1) | 3 | £100k company-profit guide and £40k, £60k and £100k salary pages |
| £100k | 16 (page 2) | 7 | £80k and £60k salary pages |

These selections are produced by `getRelatedPosts`, which gives +10 for the same category, +1 per exact shared tag, then uses publication date as the tie-breaker and keeps three results. Small frontmatter changes can therefore alter the link graph without any explicit link review.

**Inference:** Search Console’s differing sampled counts are not fully explained by current explicit links because there are none. Age, historic links, generated related selections, crawl timing and sampling can all contribute. A durable test or report of the generated graph would make future changes easier to reason about.

#### Scottish calculator

The Scottish calculator has a broader source-level footprint:

- the shared tools directory creates a homepage link and a tools-hub card;
- the tools hub contains a second, use-case-specific table link;
- the Director Intelligence sidebar links to it;
- the contextual blog tool-card logic selects it on the £50k page, £70k page and Scotland-v-England article because their title, excerpt or tags match `Scottish`/`Scotland`;
- explicit article-body anchors occur twice in the Scotland-v-England article, once in the salary-sacrifice guide, and three times in the £100k tax-trap guide;
- sitemap and `llms.txt` entries provide machine-readable exposure.

This mix of high-level navigation, contextual modules and inline editorial anchors is materially stronger than the beginner or salary-page pattern.

### 2. Salary query, visible copy and schema alignment

The blog route uses:

- `seoTitle` for the document/search title;
- `seoDescription`, falling back to `excerpt`, for the meta description;
- `title` for the visible H1 and Article `headline`;
- the same `seoDescription`/`excerpt` value for the Article description;
- visible FAQ content for FAQ structured data;
- visible numbered steps for HowTo structured data.

All six salary pages emit FAQ schema and no HowTo schema, which is appropriate for salary-result explainers. Their separate frontmatter `description` values are validated but are not the values used by the blog route’s metadata or Article schema; the operational field is `seoDescription`. The duplicated fields currently point in the same broad direction, but they create an avoidable editorial verification trap.

| Page | Title/meta/H1 | Opening answer | FAQ schema order | Assessment |
|---|---|---|---|---|
| £40k | Strong match for `40k after tax` and `take home pay` | Delayed by median, car/flat and lifestyle framing | Starts with “Is £40k a good salary?”; direct after-tax question appears later | High-impression snippet intent is present in metadata but diluted in visible lead and schema |
| £50k | Strong, qualified PAYE-estimate alignment | First sentence gives annual and monthly take-home | Starts with the direct after-tax question | Aligned; no discoverability change supported by supplied evidence |
| £60k | Strong match for `60k after tax` and higher-rate take-home | Delayed by median and “taxman” framing | Starts with “Is £60k a good salary?”; direct after-tax question appears later | Same actionable answer-first mismatch as £40k |
| £70k | Strong match for `70000 after tax`/`£70k after tax` and PAYE estimate | First sentence gives a qualified annual and monthly answer | Starts with the direct after-tax question | Aligned; monitor query expansion rather than rewriting now |
| £80k | Strong query terms, with planning/lifestyle additions | Delayed by percentile and tax framing | Starts with lifestyle/earnings-position questions | Lower-confidence opportunity because no page performance was supplied |
| £100k | Strong after-tax and tax-trap terms | Leads with the taper rather than the exact £100k take-home | Starts with lifestyle/earnings-position questions | Plausible mixed intent; obtain page/query evidence before changing its emphasis |

Two current-source discrepancies reinforce the £40k/£60k priority:

- the £40k page shows £32,320 annual and £2,693 monthly take-home, while the current 2026/27 common-salary table shows £32,322 and £2,694;
- the £60k page shows £45,357 annual take-home, while the current common-salary table shows £45,361.

The differences are small, but a page competing for an exact-answer query should not expose internally inconsistent figures. The £40k and £60k FAQs also contain unsupported savings targets, earnings prevalence, housing and lifestyle statements. Those claims are poor answer-engine inputs regardless of whether they directly affect Google CTR.

**Inference:** at average positions 6.7 and 6.8, the observed 0.2% and 0.3% CTRs make snippet/intent alignment worth testing. They do not prove that metadata is the cause: result features, query mix, brand strength and Google-selected snippets are unknown without query-by-page exports.

### 3. Search-intent overlap among the four general guides

| Guide | Intended role visible in current copy | Main overlap |
|---|---|---|
| Beginner guide | Employee-oriented primer to Income Tax, NI, PAYE, codes, pensions, loans, expenses and Self Assessment | Tax-system explanation and calculator-checking steps |
| Understanding the UK tax system | Broad system guide covering HMRC, bands, PAYE, NI, other taxes and public spending | Beginner concepts, PAYE calculation and take-home steps |
| How much tax will I pay? | Current PAYE outcome examples and variables that change take-home | Calculator inputs, rates and payslip comparison |
| UK tax calculator guide | Product/method guide to supported PAYE inputs and limitations | Rates, deductions, take-home estimation and payslip comparison |

The overlap is concrete:

- all four target Income Tax/PAYE/NI concepts in titles, descriptions, headings or tags;
- all four emit HowTo schema with four or five steps that culminate in checking or calculating take-home pay;
- all four emit FAQ schema;
- the beginner and calculator guides are in the same Tax Basics category and select one another through related articles;
- the older system guide still uses 2025 in title, metadata and core rate headings, while the other three present 2026/27.

**Inference:** this creates a credible risk of ambiguous page selection for broad queries such as “UK tax guide”, “how UK tax works” and “take home pay”. It is not enough to establish cannibalisation. A query-by-page export is required to show whether the same query is actually split across these URLs and whether one page displaces another. No consolidation is supported by the current evidence.

The cleanest future intent boundaries would be:

- beginner guide: first-time employee concepts;
- system guide: HMRC and the wider tax-system architecture;
- how-much-tax guide: salary-to-net examples and variables;
- calculator guide: how to use PayeTax and interpret supported outputs.

That boundary can be strengthened without deleting or merging pages, but the system guide should first receive a factual/current-year review separate from this audit.

### 4. Retired route and category references

No production link was found to:

- `/calculator/*`;
- `/alternatives/*`;
- `/best-for/*`;
- `/vs/*`;
- retired `/blog/category/tax-tools`;
- retired `/blog/category/self-assessment`.

The old paths remain in `next.config.ts` as permanent redirects to retained destinations. A `/calculator/50000` example remains in a source-code validation comment, and a test uses a synthetic old canonical, but neither is a published internal link. The service worker’s `/_next/static/chunks/` string is an asset strategy, not a retired programme reference.

**Conclusion:** the observed 7% permanent-redirect share is compatible with crawlers revisiting retired programme URLs. With no current internal links feeding those hops, redirect removal is not warranted.

### 5. Canonical sitemap versus route/indexability policy

The current sitemap is deterministically composed as follows:

| Inventory class | Count | Policy |
|---|---:|---|
| Retained static pages and tools | 12 | Canonical, indexable, included |
| Blog articles | 32 | Canonical, indexable, included |
| Non-empty blog categories | 8 | Canonical, indexable, included |
| **Total** | **52** | — |

All 32 article canonicals exactly match `https://payetax.co.uk/blog/{slug}`. All eight configured categories are non-empty: Tax Basics 6, Tax Tips 3, Tax Planning 7, Tax Changes 4, Tax Comparison 2, Student Loans 1, Salary Guides 7 and Tax Deadlines 2.

The sitemap intentionally excludes:

- the noindex offline and not-found surfaces;
- operational API routes;
- metadata resources such as `robots.txt`, `sitemap.xml` and `llms.txt`;
- retired paths that redirect;
- paginated blog URLs such as `/blog?page=2`, which remain internally linked, self-canonical and indexable while the sitemap lists the collection root;
- calculator query-state variants.

`/api/tax-rates` has an explicit crawler exception in `robots.txt` but is not in the sitemap. That existing policy is outside this audit and the supplied evidence does not support changing it.

The merged hygiene baseline includes a production-style Playwright crawl guard in `e2e/search-discoverability.spec.ts` that requests every sitemap URL and fails on redirects, non-`200` responses or `noindex`, and also detects internal `/tools/` redirect hops. This provides a deterministic code safeguard; Search Console still needs time to reread the changed sitemap.

**Inference:** the 50 discovered pages reported from the 12 June read should not be compared as if it were a 23 August crawl of the 52-URL inventory. Wait for a fresh read before diagnosing a two-URL discovery gap.

## Findings ranked by impact and confidence

| Rank | Finding | Impact | Confidence | Evidence boundary |
|---:|---|---|---|---|
| 1 | £40k and £60k metadata targets match valuable queries, but the visible lead and FAQ schema prioritise lifestyle/prevalence claims and their exact figures drift from the current table | High | High | Direct code plus page-level GSC metrics |
| 2 | The beginner guide has no deliberate contextual inbound anchor and sits on blog page 3, although it is reachable through listings and four related modules | Medium–high | High | Direct code; GSC internal-links screen is sampled |
| 3 | £70k is already answer-first and is expanding across related queries; changing it again now would interrupt a live reassessment | Medium | High | Direct code plus supplied recent-period observation |
| 4 | Four broad guides have overlapping metadata, content and HowTo schema, but actual query cannibalisation is unproven | Potentially high | Medium | Direct semantic overlap; missing query-by-page export |
| 5 | The Scottish calculator’s varied contextual/internal-link footprint is substantially stronger than the priority articles’ footprint | Medium | High | Direct code; causal link to CTR remains inference |
| 6 | Current production source contains no links to the audited retired programme or category URLs | Medium protective value | High | Exact source search and redirect inspection |
| 7 | The current 52-URL sitemap and the stale 50-page GSC read are temporally mismatched, not demonstrably inconsistent | Low immediate risk | High | Deterministic inventory plus supplied last-read date |
| 8 | Duplicate `description` and `seoDescription` frontmatter fields make editorial verification harder because only `seoDescription` feeds metadata/schema | Low | High | Direct route and validation inspection |

## Do now / monitor / do not touch

“Do now” means a justified next implementation slice, not a change made by this audit.

| Decision | Item | Reason / stop condition |
|---|---|---|
| **Do now** | One focused £40k/£60k answer-first and factual-alignment slice | Strong impression volume, low CTR, direct lead/schema mismatch and reproducible figure drift. Keep stable URLs; validate against the current calculator; remove unsupported lifestyle/prevalence/savings claims; put qualified annual/monthly answers first. |
| **Do now** | A small deliberate internal-link slice for the beginner guide | Add a few genuinely contextual inline anchors from closely related retained guides; do not add site-wide boilerplate. Measure the source graph and preserve relevance. This addresses a current code gap without rewriting the page. |
| **Do now** | Obtain and retain two redacted GSC export bundles, then build the local analyser described below | Required to distinguish page/query overlap, query expansion and snippet opportunities without repeating manual transcription. |
| **Monitor** | Beginner guide indexing after the 23 August request | Recheck stored crawl, impressions and indexing after Google recrawls. Do not infer failure from two pre-recrawl 28-day windows; do not rewrite again unless fresh data shows a content problem. |
| **Monitor** | £70k query expansion and positions | Compare matched query/page exports over equivalent 28-day windows. Revisit only if CTR remains poor after positions/query mix stabilise or selected snippets demonstrably mismatch. |
| **Monitor** | Sitemap read date and discovered count | Expect a read later than 23 August before comparing against 52. Escalate only if current canonical URLs remain missing after a fresh successful read. |
| **Monitor** | Page Indexing and `Chart.csv` trend | Track retained canonical URLs, not property-wide headline totals alone. Separate historic redirects/noindex URLs from current sitemap URLs. |
| **Monitor** | Sampled 404s and redirects | Act only if samples shift to current canonical pages, internal links or host errors. Old chunks, probes and retired external URLs are not a current crawl-budget problem. |
| **Do not touch** | Mass `noindex`, mass URL deletion or salary-page consolidation | Current impressions rose while the indexed count fell; no query/page evidence supports another broad reduction. |
| **Do not touch** | Retired-route redirects | No current internal links feed them; sampled requests are historical. Removing them would turn known retired requests into 404s without a demonstrated benefit. |
| **Do not touch** | Another beginner-guide rewrite | It was materially updated on 29 July, Google’s stored crawl is 11 April, the live test passes and a recrawl request is pending. |
| **Do not touch** | Crawl-budget optimisation | Healthy host status and 141 ms average response do not show a crawl-capacity issue. |
| **Do not touch** | Sitemap/indexability policy, `/api/tax-rates`, calculator query state or pagination policy | No supplied observation isolates these as a problem; they are outside this audit’s implementation scope. |

## Proposed next implementation slices

1. **£40k/£60k exact-answer alignment.** Recalculate all visible and FAQ values using the current engine; use a qualified annual/monthly answer in the excerpt and first paragraph; reorder the primary FAQ first; remove unsupported lifestyle, prevalence, savings and mortgage claims; retain the existing canonical URLs. Add guards that compare the displayed baseline figures and first FAQ intent with the current calculation fixtures.
2. **Beginner-guide contextual links.** Add a small number of inline links from pages where “beginner UK tax”, PAYE basics, tax codes or deduction concepts are already discussed. Add a focused test or audit output that makes explicit and generated inbound links visible. Do not alter the beginner article copy in this slice.
3. **Local GSC export analyser.** Add the no-credential script and fixtures described below after representative exports are available. It should be tooling-only and should not make network calls.
4. **Post-recrawl query/page review.** Once the sitemap has a fresh read and the beginner request has been processed, compare two equivalent 28-day exports. Decide whether the system/beginner/how-much/calculator intent boundaries need metadata or section changes. Do not begin with consolidation.
5. **Older salary-page evidence review.** Apply the same answer-first and unsupported-claim audit to £80k/£100k only when their page/query exports show opportunity, or when a factual review independently requires correction.

## GSC CSV export analyser recommendation

**Recommendation: build it, but only after obtaining representative redacted exports for tests.** The repeated manual steps, absent query/page join and ambiguity around period comparisons make a small local utility worthwhile. It should remain a repository tool, not a service.

A minimal useful shape is:

- `bun run audit:gsc -- <export-directory> [--compare=<second-directory>]`;
- accept common GSC `Queries.csv`, `Pages.csv`, `Dates.csv`/`Chart.csv` column names and UTF-8 CSV quoting;
- parse clicks, impressions, CTR percentages and position without locale-dependent coercion;
- report totals, weighted CTR, query/page leaders, period deltas and newly expanding queries;
- when a page/query export is present, show queries mapped to multiple landing pages and landing pages competing for the same query;
- emit deterministic Markdown and optional JSON to stdout or an explicitly supplied output path;
- warn when an export is truncated, dimensions cannot be joined, date windows differ or aggregate rows cannot reproduce Search Console’s headline totals;
- make no API calls, require no credentials and add no external service;
- use small committed synthetic fixtures, while keeping real GSC exports out of version control by default.

The analyser must not manufacture causality. It should label raw observations, calculated deltas and heuristics separately, just as this report does. A query/page overlap flag should be a review prompt, not an automatic consolidation recommendation.

Without representative CSVs, building the parser now would risk encoding guessed filenames, headers, locales and export shapes. Acquiring two redacted bundles is therefore the deterministic start condition; successful parsing, reproducible totals and fixture-tested quoted fields are the completion condition.

## Audit stop

This pass stops at evidence and recommendations. No production content, route, metadata, schema, sitemap, redirect or indexability behaviour was changed.
