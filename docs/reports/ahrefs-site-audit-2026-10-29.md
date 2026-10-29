# Ahrefs Site Audit notification — 29 October 2026

## Source and limits

- Source: Ahrefs Site Audit email from `sa@ahrefs.com`, subject `(Payetax) Page has links to broken page [New]: 2 URLs`, received **29 October 2026 at 08:34 UTC**.
- [Authenticated crawl overview](https://app.ahrefs.com/site-audit/8954972/overview?current=29-10-2026T083433) for crawl `29-10-2026T083433`.
- [Affected-page explorer for broken-page links](https://app.ahrefs.com/site-audit/8954972/data-explorer?current=29-10-2026T083433&columns=pageRating%2Curl%2Ctraffic%2ChttpCode%2CcontentType%2Cdepth%2ClinksInternal4xx%2ClinksCountInternal4xx%2ClinksExternal4xx%2ClinksCountExternal4xx&filterId=ef910605970b081acfca3ff161170299&sorting=-pageRating&issueId=c64daf06-d0f4-11e7-8ed1-001e67ed4656&filterCollapsed=true).
- Evidence status: **notification only**. No affected source URLs, link destinations, HTTP response traces, recrawl results, IndexNow request logs or deployment correlation were provided in the email. Ahrefs counts describe reported *issue records*, not proven distinct broken destinations or independently verified defects.

## Reported crawl snapshot

| Metric / issue | Reported value | Change vs previous crawl |
| --- | ---: | ---: |
| Internal URLs analysed | 59 | not reported |
| Health Score | 99/100 | −1 |
| Errors | 2 | +2 |
| Warnings | 16 | −2 |
| Notices | 58 | +1 |
| Page has links to broken page | 2 URLs | +2, new |
| External 4XX | 3 | +2 |
| Page has links to redirect | 3 | +1 |
| External 3XX redirect | 2 | +1 |
| Changed pages not submitted to IndexNow | 4 | +3 |
| Inconsistent AI training bot policy | 55 | +1 |
| Meta description changed | 2 | +1 |

## Disposition and verification

1. **P2 triage, potential escalation on impact:** retrieve and record the exact linking page, link/anchor, target URL and response for the two broken-page-link records and the three external-4XX records. Determine overlap, verify from live responses and distinguish genuine missing resources from crawler/bot restrictions, transient responses or intended retired routes. Fix only confirmed user-facing or trust/source failures; prioritise calculator and statutory-source links on evidence.
2. **IndexNow — verify before calling a defect:** identify the four changed URLs, check eligibility, timing and whether submission is implemented/expected. Only file a corrective action for a demonstrated contract gap. IndexNow notices alone do not establish a Google indexing problem.
3. **Redirects — P3 hygiene:** record the three linking-through-redirect records and two external-3XX records, and remove avoidable hops only where verified useful. Do not indiscriminately change retired-route redirects or canonicals.
4. **Bot-policy notices — existing owner:** compare served `robots.txt` to claims in `llms.txt` under the existing Trust and sourcing M1 item. A different training-bot access policy requires an explicit decision; do not loosen robots rules merely to clear 55 notices.
5. **Meta descriptions — informational:** two changed descriptions are not failures. Do not overwrite editorial copy without a reproduced problem.

## Completion evidence required in a subsequent implementation PR

- Dated affected-URL inventory and reproducible failure/false-positive classification; record crawler and independent HTTP observations separately.
- Narrow fixes, relevant checks, and a follow-up crawl or explicit access limitation; explain remaining warnings with reason.
- No sitewide SEO score promise, new tracking vendor, blanket content refresh, route migration, or changes to search-bot permissions.

Related ownership: [`BACKLOG.md` — Search and discoverability](../BACKLOG.md#search-and-discoverability) and [Trust and sourcing](../BACKLOG.md#trust-and-sourcing). This report is a snapshot of third-party email claims, not proof of production behaviour.
