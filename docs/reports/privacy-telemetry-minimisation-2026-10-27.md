# Privacy telemetry minimisation — 27 October 2026

Review candidate based on merged main `51aaf14522d19579f3be9e5f7a4440f97180fc7a` (#127 included),
in the isolated `fix/privacy-telemetry` worktree. Revised after Claude's REQUEST CHANGES;
awaiting independent Claude re-review. No commit, PR, merge or deployment is authorised.
The implementation is local and uncommitted.

## Problem and resulting behaviour

The supporting-pages audit identified calculator-derived financial information reaching GA4 and
Sentry despite local-processing claims. Independent browser investigation additionally reproduced
full query URLs on GA events other than page views, Sentry navigation breadcrumbs, and a Vercel
external-referrer field appended after its `beforeSend` callback.

The candidate removes PAYE salary bands, year/region, loan/pension attributes and result flags;
Director revenue/expense/profit bands, profitability modes, recommendation/strategy attributes,
financial-warning and buffer-shortfall events; and year/region attributes on email success events.
Generic interaction/completion counts and technical timings remain. The GA boundary accepts only
known event names and permitted parameters/labels; unknown custom and nested data is discarded.
Numeric performance values require a recognised technical metric label.

Sentry keeps error types/messages/stacks, release, monitored route, technical browser/runtime
information, validated displayed error digests, boundary/router tags, cleaned request paths,
calculation stage, anomaly codes/field paths and operational failure reasons/status.
Calculator-state contexts, financial tags, request bodies/cookies, arbitrary extras/Error properties
and stack variables are excluded. Automatic DOM and console breadcrumbs are omitted; manual
calculation and network/navigation breadcrumbs remain. Client, server and edge use the same
sanitisation functions; existing route/noise filters still run. Replay, tracing and logs remain off.
This excludes attached calculator state; it is not a claim that all technical error text is anonymous.

URL credentials, queries and fragments are removed from GA defaults and events, Sentry request/
navigation/network fields and URLs in error text/component stacks, and Vercel page URLs. Vercel's
callback exposes no referrer override: when `document.referrer` contains data the callback cannot
remove, the event is suppressed. This sacrifices those metrics rather than forwarding the URL;
ordinary safe-referrer traffic/performance signals remain available. The suppression is deliberately
conservative: it also loses same-site-referrer metrics and Speed Insights measurements even though
the inspected vendor versions do not send those referrers. Narrowing it is a separate follow-up (L2).

Privacy copy, metadata, the browser-storage inventory and `llms.txt` explain actual processing.
The PAYE email form identifies the server/email-provider processing and links Privacy before send.
The policy accurately describes automatic remembering today, including the distinction between
30-day PAYE/seven-day Director restoration guards and actual deletion. It does not advertise the
future opt-in or clear-data controls. The raw-IP rate-limit disclosure is also corrected.

No tax-engine formulas, input validation, persistence/reset semantics, calculation eligibility,
consent expiry/withdrawal/queue mechanics or email request contracts are changed. The existing
critical CI browser command includes the new four-test telemetry privacy spec; no workflow,
dependency, secret or branch-protection change is introduced.

## Claude REQUEST CHANGES resolutions

- **M1:** `error_details.digest` is restored with bounded identifier validation; `error_boundary`
  and `router_kind` use their actual call-site enums. `request_path` and `contexts.request.url`
  use the shared URL cleaner. Tests exercise the real `ErrorState`, `ErrorBoundary` and
  `onRequestError` producers, all three runtime hooks and exclusion of seeded financial extras.
- **M2:** all seven SEO event types now validate labels with the same token-or-cleaned-URL rule
  as their source/target fields. `blog_article_read` requires a bounded lowercase slug for both
  label and slug. No missing label registry entry means arbitrary text is accepted. Tests cover
  every SEO action, malicious labels, valid slugs and the real `trackSEOAction` → GA queue path.
- **M3:** only the two existing email-template triplets below are restored as native GA campaign
  source/medium/name parameters, after consent. All three UTM keys must occur exactly once and
  match one complete tuple; partial, mixed, duplicate or unknown combinations are discarded.
  Matching a campaign never forwards other query values, click IDs, term/content or raw URLs.
  No campaign storage or consent lifecycle is added. Unknown campaigns deliberately lose attribution.

| Source | Medium | Campaign | Existing producer |
| --- | --- | --- | --- |
| `results_email` | `email` | `results_followup` | `src/lib/email/payeResultsEmail.ts` |
| `director_results_email` | `email` | `director_recalculate` | `src/lib/email/directorResultsEmail.ts` |

**L1 assessment:** the URL-text cleaner now covers dynamic paths containing brackets/parentheses
and standalone query/fragment text. Unit tests and a real SDK envelope verify these canaries are
removed. The other three opaque paths are not recursively cleaned: `logentry`, exception mechanism
data and fingerprints. Current app message producers use plain strings, not Sentry parameterised
messages (`logentry.params`); the inspected browser SDK mechanism data contains handler/target
names; active app fingerprints use fixed operational reasons or calculation stages. The API and
performance fingerprint helpers have no current app consumers. No current flow from calculator
values to those paths was identified. Introducing arbitrary fingerprints, template parameters or
custom mechanism data would need a new privacy check; those remain a defence-in-depth follow-up,
not a guarantee that arbitrary future SDK metadata is safe. Existing error/noise scope is preserved.

**Other low-priority findings:** L2's conservative metrics loss is described above. L3's blog-category
dimension remains absent; L4's generic student-loan field-change count remains without a selected
plan/value; L5's Director email/blog wording is tracked separately. None identified a new current
financial payload path in this review. No unrelated product/UI changes are included.

## Verification

Windows; Bun 1.4.3; Node 24.18.0; Playwright 1.61.1. Browser plugin unavailable; repository
Playwright used. Chromium 149.0.7827.55 and WebKit 26.5. Production build served on loopback port
3107. External Playwright configuration disables automatic server/global setup, uses synthetic
consent state, and writes artifacts outside the repository. Workers: two; retries: zero.

Revised-source results: **4,433 unit tests / 249 suites passed**, **73/73 Chromium browser checks
passed**, and **17/18 WebKit consent/telemetry/Director/MC-03 checks passed**. All four new privacy
checks passed on each engine. Repository checks and the production build passed.

The WebKit failure is the unchanged Director negative/empty-input keyboard test: select-all raced
the existing one-frame focus formatter (first leaving `100000-500`, then an isolated run deleting
only one digit of expenses). The component and test match the base commit. A recorded external
selection probe shows complete selection after the focus transition; an external copy of the
same test waiting two animation frames before select-all passes with all product assertions
unchanged. This is additional diagnostic evidence, not a replacement for the failed repository run.
No retry hides that failure and neither product input code nor its existing test is modified.
Independent review reproduced this timing race in 6/10 runs on both the candidate and base
`51aaf145`, confirming it predates this change.
Checks include:

- `bun --no-env-file run check:repo` (lint, application/test types, environment/event contracts and repository guards).
- `bun --no-env-file run test:no-coverage --runInBand` (the complete unit suite, including independent PAYE fixtures).
- `bun --no-env-file run build:ci` with analytics enabled, synthetic GA/Sentry configuration, and source-map upload disabled.
- Chromium smoke, homepage stability, calculator critical, Director critical, payslip, golden-master,
  consent and telemetry privacy specs. The golden masters establish browser/engine agreement,
  not independent statutory correctness.
- WebKit consent/telemetry/Director regressions and MC-03 integrity checks.

**L6 provenance:** build `5Fy7icBXoB12k0azfPuCD` was generated after the final source changes.
`build-source-manifest.json` records SHA-256 hashes for all 38 changed/new source, test and package
files, captured at `2026-10-27T15:16:46.524Z`; `.next/BUILD_ID` was written at
`2026-10-27T15:17:13.249Z`. Verification before and after browser testing confirms those source
hashes still match. This report and the review handoff were written afterwards; runtime source
was not edited after building. This supersedes the original candidate's older-build caveat.

## Actual outbound payload checks

External script/evidence directory:
`C:/Users/JGF Desktop/Development/PayeTax/scratch/privacy-telemetry-rereview-2026-10-27/`.
`outbound.cjs` serves the production build through a browser-only `https://payetax.test` alias so
the existing localhost Sentry exclusion is respected, not removed. It runs genuine gtag.js,
Sentry SDK and Vercel scripts and intercepts collection requests before delivery. Sentry uses a
synthetic public DSN and GA uses `G-TESTLOCAL1`; no credentials are required. Vercel scripts normally
suppress automation, so this isolated QA context sets `navigator.webdriver` false and uses an
ordinary Chromium user-agent to exercise their real transport. These are test-harness settings,
not application changes.

Both engines exercise rejection → calculation → synthetic browser error capture → acceptance → PAYE
completion → intercepted email → Director calculation → withdrawal → recalculation. Payload
assertions cover financial keys/bands, nested Error properties and URL/referrer canaries. They also
require completion events and an actionable error/stack with calculation breadcrumbs to survive.
A second real SDK event checks the restored M1 diagnostic fields and L1 URL-text bypasses.
Unknown and both approved campaign landings check actual native GA `cs`/`cm`/`cn` fields, not just
queued commands. All result-email requests are fulfilled locally; no actual email is delivered.
Final captures: Chromium **40 GA events, two Sentry envelopes and 14 Vercel payloads**; WebKit
**45 GA events, two Sentry envelopes and 11 Vercel payloads**. Both passed all payload assertions.
Counts depend on timing; field assertions and required events determine success.

The browser's £40,000 / 1257L annual net pay is checked against the hand-derived HMRC fixture
`uk-40k-1257L` (£32,322.04), not generated from the running engine. Desktop email disclosure and
390×844 Privacy screenshots are saved and inspected. Chromium has no relevant console errors;
WebKit reports the pre-existing unsupported `interactive-widget` viewport-key message. This
change does not edit the viewport. Server/edge sanitisation is checked through their configured
SDK hooks; real server-side failures are not induced against production.

## Follow-ups and review focus

The backlog separately owns opt-in remembering (off by default), clear-data and existing-snapshot/
cross-tab handling; Director privacy-controls access; provider settings/retention verification;
and separately authorised historical telemetry deletion. DI-10's acceptance criteria now prohibit
reintroducing financial warning analytics. Other supporting-page and accessibility findings remain
outside this candidate. Passing local checks is not production deployment or provider-dashboard evidence.

Claude should independently re-review M1/M2/M3, the L1 assessment and the recorded WebKit test
limitation, then inspect source removal and outbound boundaries, diagnostic usefulness,
all URL/referrer paths (including Vercel suppression), claims versus current storage behaviour,
and preservation of #127/consent/email behaviour. No independent approval is claimed here.
