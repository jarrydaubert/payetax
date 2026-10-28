# MC-04 submitted pay-period presentation — 28 October 2026

Base: freshly fetched `origin/main`, `432f4ce5b6d53b0b6c6f32aa91522ee255d001e9`.
Branch: `fix/mc04-submitted-pay-period`. This is local verification of the proposed slice,
not merge or production-deployment evidence. The draft PR records the final commit and its
independent Claude CLI review.

## Inspection and scope

Inspected the current calculator, summary cards, period checkboxes, results table, store,
mounted regressions and browser presentation before editing. #128 (`b4f10087`) was historical
reference only: its statement and comparison components are absent from current main, and its
desktop-card removal was superseded. No changes were imported from that branch.

The maintainer selected adapting the existing mobile take-home card for this slice. It now
leads the summary below the existing five-column card breakpoint (1024px). The desktop annual
and monthly take-home cards, three other cards, their values/tooltips/order, and the table remain.
This avoids implementing MC-05's statement, Edit flow, comparison or focus redesign just to
provide MC-04 with a visible consumer. Those remain dependencies for applying the rule to a
future statement/comparison; this slice does not claim to deliver them.

## Behaviour and preservation

- Monthly, four-weekly, fortnightly, weekly, daily and hourly input starts in its submitted period.
- Annual input starts Monthly, with annual take-home alongside it as context.
- Each successful Calculate resets the initial presentation, including another Calculate with
  unchanged inputs. A changed submitted period takes effect only after Calculate.
- Display selection reads `results.netPay[period]`; it performs no financial calculations or
  conversions and does not edit calculator/store state. Yearly display offers monthly context.
- CSS controls mobile/desktop visibility while the presentation component stays mounted.
  Resizing preserves selection. Existing table checkboxes keep their separate five-default,
  seven-available contract and their selections across Calculate and resizing.
- Existing invalidation unmounts the result cards after edits, invalid drafts or Reset. No stale
  result/action guards, session-history behaviour, engine, pension application, storage,
  telemetry, consent or email code changed. No new persisted financial state or analytics events.

## Regressions and verification

The new mounted tests use the real store and engine for all seven input periods, including
32-hour working weeks. They check display-only result/input identity, Yearly and Hourly
selection, a fresh Calculate with unchanged inputs, a changed submitted period, MC-03's
recalculation notice and Reset. Existing desktop-card assertions are scoped to the original
monthly tooltip button because CSS-hidden mobile/desktop content both exist in JSDOM.
The desktop keyboard journey now selects visible focus stops, excluding the hidden mobile
selector; it retains the exact five-card/ten-normal-motion-stop expectations and checks every
forward/reverse focus destination and header clearance.

The new critical E2E slice checks all seven submitted periods against the existing engine-owned
table values and one independent HMRC-derived fixture: `uk-40k-1257L` from
`src/test/payeVerificationFixtures/uk-baseline-2026-27.json`, with £32,322.04 annual and
£2,693.50 monthly take-home. It checks selection/calculation preservation at widths 320, 393,
852, 1023, 1024, 1280, 1440 and 2560, plus a fresh/changed-period Calculate and stale-result removal.

Verification commands and final results are recorded in the draft PR. Full Jest verification:
`bun --no-env-file run test:no-coverage --runInBand` — **255 suites, 4,513 tests passed**.
This includes independent PAYE, MC-03, pension suggestion and privacy tests. The final expanded
Yearly-display assertion also passed in the eight-test mounted slice.

| Check | Result |
| --- | --- |
| `bun --no-env-file run check:repo` | Passed, including lint, application/test types and financial/privacy contract guards |
| `bun run build:ci` (executed by Playwright's existing web-server setup) | Passed |
| Seven-file Chromium run: smoke, homepage-portal-stability, calculator-critical, director-guide-critical, payslip-regression, display-periods, responsive-calculator-layout | 77 passed; six test-preparation/query failures described here were corrected and rerun below |
| Final focused Chromium + WebKit run: MC-04 and desktop keyboard navigation | 24 passed; includes every previously failing case |

The final browser command was:

```powershell
bun --no-env-file x playwright test e2e/calculator-critical.spec.ts e2e/responsive-calculator-layout.spec.ts --grep 'MC-04|Desktop keyboard navigation' --project=chromium --project=webkit --workers=1 --reporter=line
```

The unchanged remainder of the broader run was not repeated after these test-only corrections.

## Browser inspection and limits

Browser plugin unavailable; used installed Playwright on `http://localhost:3100/#tax-calculator`.
Chromium and WebKit rendered the expected route/title and meaningful results without a framework
error overlay. Direct inspection matched the independent £40k fixture, switched Monthly to
Hourly, resized to 1440×900 and back to 393×852, and retained Hourly. The desktop screenshot
shows the five original cards and unchanged default period checkboxes.

Existing development diagnostics remain: reduced-motion `ResultTableRow` passes `layout=false`
to a plain DOM row; WebKit also reports its unsupported `interactive-widget` viewport argument
and an unused development CSS preload. These originate in unchanged code and do not establish
a new MC-04 failure. Existing Next/Sentry deprecation and unchanged-release-version notices
remain outside this slice.
Production-mode localhost inspection also reports the expected missing Vercel Insights and
Speed Insights script endpoints (404/MIME errors); those hosting-only endpoints are not served
by `next start`. No calculator runtime exception or framework overlay was observed.

Initial E2E runs failed during salary preparation: immediate entry after closing the input-period
dropdown could be interrupted by its focus restoration. The tests now await focus restoration
and assert typed and committed salary before Calculate. This is a test setup correction, not a
claim to close the backlog's native tap/pointer defects. Physical-device keyboards, OS clipboard,
MC-05 mobile focus, statement copying, full comparison, and the broader MC-05 visual matrix
remain unverified here.

Local inspection images are not independent hosted evidence. Their useful observations are
preserved above; SHA-256 hashes of the temporary originals:

| Image | SHA-256 |
| --- | --- |
| Chromium Monthly, 393×852 | `8e1150fc3e520321190f3d0034011714704fb3a598d39748699158a92fb7213b` |
| Chromium Hourly, 393×852 | `bd9e52e9c63ced75a66cbc264e2eb02180a732189baf48ac575aa05a5e3dcd76` |
| Chromium desktop, 1440×900 | `fff721a3f37aaddc21b77e9f733f668665d1665b4b7a411b510b1c1a96627e56` |
| Chromium production Monthly, 393×852, after animations settled | `ed3b6becbaf1f8da9f440bb31e155e0b618bb3733560f1e95cf02b427883124f` |
