# MC-01: touch-pan review follow-up

Date: 23 October 2026. PR: [#127](https://github.com/jarrydaubert/payetax/pull/127).
Starting head: `9a2f6d1e`. Implementation: `f6bf64a378c0c491bedb9cda3b127ae9b4ece37c`.
This is an unmerged response to the owner's supplied independent Claude review, which confirmed
the original WebKit wrong-amount fix but returned REQUEST CHANGES for F1. MC-02 and MC-03 remain
separate blockers; no merge or release is authorised by these results.

## Review findings and response

| Finding | Response |
| --- | --- |
| F1: a pan starting on an amount focuses/selects it at pointer-down | Touch/pen focus now waits for the matching pointer-up; pointer cancellation forgets the pending entry. Mouse pointer-down and keyboard focus keep their existing behaviour. |
| F2: the two earlier component tests did not distinguish the pre-MC-01 source | Added a document-level pointer-down assertion: defaults are prevented on first mouse entry only (`[true, false]`). Added discriminating touch/pen release, cancellation and pointer-identity cases. |
| F3: the monetary spec was absent from CI's explicit file list | Added both monetary interaction and Chromium touch-pan specs to `test:e2e:critical:ci`. The existing job remains Chromium-only and non-blocking; no workflow or branch-protection change. |
| F4: the readiness checkbox occasionally lost a setup click under parallel WebKit load | Shared setup retries only the checkbox transition/readiness check within 15 seconds using `toPass`. An already checked box is not toggled off. Gesture, amount, error and calculation assertions remain outside that retry. |
| F5: recreated commit equivalence was asserted without tree hashes | Recorded exact prior and current tree/blob identities below; the original dated report now links this clarification. |

Deferring touch focus was assessed against browser gesture handling rather than adopted solely on
the prototype's recommendation. Cancelling the first pointer default still protects WebKit from
the compatibility mouse/caret action. Native panning still proceeds and emits pointercancel.
Waiting for pointer-up uses that native decision without adding a timer or movement threshold.
Only the matching pointer may complete the pending entry, and callers can still cancel pointer-up.
Subsequent actions in an already focused input remain native, including caret/range selection.

## Failing-then-passing regression

The new `e2e/monetary-input-pan.spec.ts` drives trusted Chromium DevTools touch events in a
393×727 mobile context. A warm-up gesture occurs away from controls because Chromium can drop
the first injected gesture. The actual regression starts on Salary, requires trusted pointer-down
and pointercancel, verifies more than 50px of real page scrolling, and asserts no focus or amount
change. It then taps the same field, types `30000` and checks `30,000.00` after blur.

On a fresh production build of the unchanged `9a2f6d1e` runtime, the regression failed because
Salary remained focused. Its recorded sequence was `pointerdown:true;focus:true;pointercancel:true;`.
The scroll assertion passed before that failure. Both new touch/pen component cases also failed
at pointer-down against this source. After the implementation change, all 64 NumberInput tests
passed and the same browser regression passed in development and three production repeats.

Direct production inspection recorded scrollY 855 → 990, Salary unfocused, text unchanged at
`0.00`, and trusted `pointerdown → pointercancel` with no focus event. The next tap generated
pointer-up before focus and successfully replaced the amount with `30,000.00`. Before/after
screenshots and a JSON event record were saved outside tracked source.

## Verification environment and execution

Windows; Bun 1.4.3 (the declared CI version remains 1.3.13); Node 24.18.0;
Playwright 1.61.1; Chromium 149.0.7827.55 and WebKit 26.5. Browser plugin unavailable, so regular
Playwright was used. Runtime route: `http://localhost:3100/#tax-calculator`; development inspection:
`http://localhost:3101/#tax-calculator`. Existing desktop and mobile device profiles were retained.

The production build used `bun --no-env-file run build:ci` with the existing critical-CI public
test flags `NEXT_PUBLIC_ENABLE_ANALYTICS=true` and `NEXT_PUBLIC_GA_ID=G-TESTLOCAL1`, followed by
`PORT=3100` and `bun --no-env-file run start`. No environment file, provider setting, dependency or
lockfile changed. Production application source matches the implementation identities below.

As in the earlier run, an external Playwright config imports the repository config and overrides
only absolute test/setup/storage paths, external artifact output, line reporting and
`webServer: undefined`, so slices share that one production build. No readiness/timeout/browser
settings were relaxed. Actual commands used `--config=<external-config>`; normal configuration
rebuilds/starts the server itself. All following browser commands use zero test retries:

```powershell
bun --no-env-file x playwright test e2e/monetary-input-pan.spec.ts --project=chromium --repeat-each=3 --workers=1 --retries=0
bun --no-env-file x playwright test e2e/monetary-input-interaction.spec.ts --project=webkit --project='Mobile Safari' --repeat-each=3 --workers=2 --retries=0
bun --no-env-file x playwright test e2e/monetary-input-interaction.spec.ts e2e/monetary-input-pan.spec.ts --project='Mobile Chrome' --workers=1 --retries=0
bun --no-env-file run test:e2e:critical:ci --retries=0
```

| Check | Result |
| --- | --- |
| `bun --no-env-file run check:repo` | Passed |
| `bun --no-env-file run build:ci` | Passed |
| `bun --no-env-file run test:changed -- --runInBand` | 10 suites / 222 tests passed |
| NumberInput component suite | 64/64 passed; touch/pen cases failed before the change |
| Production trusted Chromium pan regression | 3/3 passed after the change; 1/1 failed before |
| WebKit + Mobile Safari, 3 repeats, 2 workers | 54/54 passed (27 per engine project), zero test retries |
| Mobile Chrome interaction + pan | 10/10 passed, one worker, zero test retries |
| Exact updated critical-CI script | 71/71 passed, including all ten monetary cases, one worker, zero test retries |

The £60,000/1257L journey still checks the independent fixture's £45,365.28 annual net pay.
No calculation implementation or expected tax values changed. The full local Jest suite was not
rerun for this follow-up: the affected slice above passed; the five clean-main-reproduced failures
remain recorded in the prior report. At starting head `9a2f6d1e`, GitHub reports CI, CodeQL and
the existing non-blocking critical E2E job successful. Those results do not certify this new head.

Direct inspection confirmed page identity, meaningful content, no framework overlay and no
uncaught application errors. Local Vercel analytics/speed-insights 404/MIME messages and WebKit's
unsupported viewport warning remain. Development WebKit also emitted a framework CSS-preload
warning; it was not an amount-interaction error.

## Checkable source identities

| Revision | Root tree |
| --- | --- |
| Original unpublished source commit `5d4b8069` | `b56129bec073d18eb8fd4316319b1b0461e8eb21` |
| Recreated published source commit `810bf04e` | `b56129bec073d18eb8fd4316319b1b0461e8eb21` |
| Prior documentation head `9a2f6d1e` | `a4d46e7b1769b8c350a566ce2d107a4686554521` |
| This implementation `f6bf64a3` | `3c45d35854b24d88e6859f9878778d7abc47f604` |

Both `810bf04e` and `9a2f6d1e` have the same `src` tree
`15bae55f8ef760dde32960bd503bc1ca90175dc9`, `e2e` tree
`edc09be397b74b02ae6652472c946bbb1ba256ae` and Playwright-config blob
`daaef8d207830689965c104c905467d633f248d9`. The following identities describe the new code/test
snapshot used by the production verification, independently of a later documentation-only head:

- `src`: `810a55340efb8f9bf01a909ae8a23e5647bbf8cc`
- `e2e`: `a27390a686c529b1198d761b9370074ba353d2fc`
- `playwright.config.ts`: `2e43516fcffb027becfb0f92d8d5e2d62abb403a`
- `package.json`: `4f12915c23892af3817f77adae7a811573963efc`

These can be checked with `git rev-parse <commit>^{tree}` and `git rev-parse <commit>:<path>`.

## Remaining boundaries

The native pan test requires Chromium's DevTools protocol; WebKit cannot drive that gesture through
the available Playwright API. It is excluded from WebKit by project configuration, rather than
skipped at runtime. Shared WebKit tap/replacement/keyboard/caret coverage remains mandatory.
Pointercancel logic is also covered by component tests for touch and pen, but those are not native
WebKit pan evidence. Physical iPhone/Android/pen keyboards, OS clipboard and native paste events
remain unverified. A physical-device check before release is still advisable.

Stop for independent re-review of F1–F5. MC-01 stays open pending acceptance; MC-02 and both MC-03
scopes remain open. No merge, production email, new workflow or release was performed.
