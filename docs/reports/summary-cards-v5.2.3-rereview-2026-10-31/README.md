# PayeTax v5.2.3 verification and independent re-review

31 October 2026. Patch release from v5.2.2 main
`de610adac8ecd796d678092c6ad8619ffcb5a75f`. Local verification only;
merging and deployment require separate authorisation.

## Scope and review

The five summary cards use hover/focus tooltips only with
`(hover: hover) and (pointer: fine)`. Touch cards contain no tooltip triggers,
buttons, tab stops or press gestures. Important financial limitations remain
visible, and the fifth label is **Marginal Rate Estimate**. Its visible explanation
identifies the rounded extra-£100-a-year Income Tax, employee NI and applicable
student-loan estimate, excluding pension contributions. Calculations, financial
values, card/grid styling, shared tooltip primitives and v5.2.2 input help are unchanged.

Claude requested changes after reproducing Chromium mouse focus pinning a tooltip
through click -> re-hover -> pointer exit. The corrected implementation records
focus provenance, clears keyboard provenance on pointer presses, protects genuine
keyboard focus during scrolling, and uses one active explanation for the summary
row. Native Enter/Space activation toggles help; Escape dismisses without losing
focus. A stale close callback cannot dismiss another card's newer explanation.

The maintainer reported independent Claude **APPROVED** in the Codex chat on
31 October 2026, after this correction. This is a maintainer-reported review
outcome; the implementation agent did not perform or independently retrieve that review.
No optional polish or unrelated warning fixes were added.

MC-05's fifth-card wording criterion is implemented by this patch and becomes a
preservation requirement. MC-05 remains open for the mobile payslip, direct Edit,
two-period comparison and existing mobile focus work. This does not claim production delivery.

## Local verification

Windows PowerShell, Bun 1.4.3, existing dependencies. Regular Playwright was used
because the Browser plugin was unavailable. Production route: `http://localhost:3100/`;
dev probe: `http://localhost:3203/`. Desktop 1440x1000, narrow mouse 393x852,
touch widths 393 and 1440. Desktop cases explicitly set mouse capabilities;
touch cases retain each project's mobile setting with touch enabled.

| Check | Result |
| --- | --- |
| Three Chromium regression tests against the reviewed pre-fix build | Expected failures: pinned tooltip; two explanations; activation could not reopen help |
| `bun run test:changed --maxWorkers=2` | PASS: 9 suites, 148 tests |
| Focused Jest slice: result cards, input help, tooltip and independent PAYE fixtures | PASS: 7 suites, 142 tests |
| `bun run check:repo` | PASS: lint, app/test types, repository contracts and zero skip/todo debt |
| `bun run check-version --base origin/main` after fetching main | PASS: patch 5.2.2 -> 5.2.3 |
| `bun run build:ci` | PASS; corrected runtime also built by production browser setup |
| `e2e/summary-cards.spec.ts`, Chromium/WebKit/Mobile Chrome/Mobile Safari | PASS: 32, zero skipped/flaky/unexpected |
| Smoke slice: smoke, homepage portal, calculator critical, Director critical, payslip regression; Chromium, one worker | PASS: 65, zero skipped/flaky/unexpected |
| Normal-motion dev probe | PASS: five-card click/re-hover/exit, keyboard scrolling, activation, Escape, one explanation, fixture value; no browser errors |
| `git diff --check` and protected calculation/input-help source comparison | PASS |

The focused spec covers hoverable/persistent help, pointer exit after clicking,
forward/reverse Tab, real scrolling, Escape, Enter/Space, replacement of a
keyboard-focused explanation, and static touch DOM. Safari does not focus buttons
on mouse click, so keyboard activation tests explicitly establish focus before
sending keys. The £40,000/1257L/England/2026-27 fixture still yields £32,322.04 annual
take-home; its expectations come from the hand-derived payroll fixture, not a generated golden.

Reproduce browser checks with `bunx playwright test e2e/summary-cards.spec.ts
--project=chromium --project=webkit --project='Mobile Chrome' --project='Mobile Safari'
--workers=2 --reporter=line`. Use the repository's `test:e2e:smoke` spec list for smoke.
The recorded final runs inherited the checked-in config and started the already-built
production app instead of rebuilding it. Independently rerunning the normal config rebuilds first.

Focused tests stub only the two Vercel-hosted analytics script URLs on localhost and
ignore exactly WebKit's existing `interactive-widget` warning. Other production
browser errors/warnings fail. The dev probe recorded a Next.js `global-error.css`
preload warning. The pre-existing reduced-motion `layout={false}` warning was left
untouched. Real devices, screen readers, analytics delivery and a full WCAG audit
remain unverified; these tests cover the relevant dismissal/hover/persistence behaviour.

## Raw evidence hashes

Generated screenshots, traces, builds and browser JSON are excluded from the commit.
This summary and the executable regression tests are the durable review evidence.
SHA-256 hashes identify the original local artifacts (not independently hosted):

| Original artifact | SHA-256 |
| --- | --- |
| `red.log` (three pre-fix failures) | `6b281bc92eec68f62e5919317024a47b7d16768824aacf79fa5331e6df9b1b72` |
| `focused-final-results.json` (32 passes) | `a1944e03b2f3cd91e7b98f0da51e8e5b70f25c0dcdded8743b9aa7dacb8bac14` |
| `smoke-results.json` (65 passes) | `cf65a012d25d63d620e08a59c67b11187ac86d7f5fd8f700812f4d467f03341a` |

Artifacts remain locally under `C:/Users/JGF Desktop/.codex/visualizations/2026/10/31/01a19176-d8c3-7072-b919-f2fbcbb43abe/summary-cards-v5.2.3-rereview/`.
