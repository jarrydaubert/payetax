# Sentry v5.2.7 merge-readiness update — 3 November 2026

PR [#164](https://github.com/jarrydaubert/payetax/pull/164), tracking [JGF-5](https://linear.app/jgf-projects/issue/JGF-5).
Base is current main `e52f9730f034596be9c63da78cabb3d935fab302` (v5.2.6, merged JGF-6).
The existing Sentry branch was fast-forwarded to `7b6320b7` and merged with main without
conflicts. This is a **patch release, v5.2.7**. No merge or production deployment is authorised.
The maintainer explicitly permits the normal Vercel preview for this readiness review.
No deployment-suppression configuration is added; `vercel.json` remains identical to main.

## Focused update and preservation

- Bump package version 5.2.6 → 5.2.7 after #167 merged first.
- Update only Next.js and its matching bundle analyzer 16.4.3 → **16.4.5**, with the corresponding
  Next env/SWC lockfile entries. No other dependency upgrade; Sentry remains **11.10.0**.
- All six reviewed Sentry instrumentation/runtime/build files match remote `7b6320b7` unchanged:
  both src entrypoints, Node/Edge configs, `next.config.ts` and `scripts/sentry-build.ts`.
- All 19 JGF-6 files other than the intentionally versioned package manifest match current main
  byte-for-byte after line-ending normalisation. Articles, URLs, fixtures, CTA semantics and
  Scottish region selection are preserved.
- The original checkout remains on its own branch with its unrelated `.gitignore` edit and
  verification/release files untouched. No new worktree or duplicate repository was created.
  The existing Sentry checkout was clean before this update.

## Newly published Next.js security release

The official [v16.4.5 release](https://github.com/vercel/next.js/releases/tag/v16.4.5), published
**3 November 2026 at 18:38:39 UTC**, explicitly identifies fixes for all seven advisories published
around 18:39 UTC. This release evidence justifies the focused patch update.

| Advisory | Scope checked against this repository |
| --- | --- |
| [GHSA-mfr8-8qww-v76h](https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h) | No `unstable_cache()` use or root-param cache scoping found. |
| [GHSA-vc7v-qv4w-wrv8](https://github.com/vercel/next.js/security/advisories/GHSA-vc7v-qv4w-wrv8) | No `next/root-params` use; public cache helpers take strings or no arguments. |
| [GHSA-vvgp-ww4w-46vf](https://github.com/vercel/next.js/security/advisories/GHSA-vvgp-ww4w-46vf) | Production is Vercel, not self-hosted `next start`; the specified deeply nested fallback-param layout was not found. |
| [GHSA-rhh4-g77r-r9qj](https://github.com/vercel/next.js/security/advisories/GHSA-rhh4-g77r-r9qj) | Existing cache helper arguments are strings or empty, not binary values. Published range ends at 16.4.2. |
| [GHSA-pc58-hwjq-p385](https://github.com/vercel/next.js/security/advisories/GHSA-pc58-hwjq-p385) | No unchanged forwarding of fetched upstream responses; deployed platform is Vercel, not the specified self-hosted pipelining proxy. |
| [GHSA-7qx7-33qx-rqx2](https://github.com/vercel/next.js/security/advisories/GHSA-7qx7-33qx-rqx2) | Published scope is self-hosted image optimisation and range ends at 16.4.2. |
| [GHSA-f3mh-rxg3-f5g2](https://github.com/vercel/next.js/security/advisories/GHSA-f3mh-rxg3-f5g2) | No Edge route that sets `NextResponse` cookies found; published range ends at 16.4.2. |

This is a bounded source review, not a new penetration test. Some newly published individual
advisory records still have empty patched-version fields or unbounded/inconsistent affected
ranges. Do not claim every registry record agrees: the official release notes establish 16.4.5's
security-fix status. The dependency audit currently accepts only the existing glob/minimatch
exceptions; their review/expiry dates are unchanged, and no advisory allowlist was expanded.

## Verification of the integrated source

| Check | Result |
| --- | --- |
| Full Jest | **261 suites / 4,661 tests passed**, including real Node/Edge envelope, session suppression, privacy, instrumentation, build gates and JGF-6 regressions |
| Unmodified `bun run check:repo` | **Passed**, including lint and both application/test typechecks; no configuration exclusions or lint bypass |
| `bun run build:ci` | **Passed**, 64 static pages, Next 16.4.5 |
| `check-version --base origin/main` | **Passed**, 5.2.6 → 5.2.7 |
| Dependency audit | Accepted existing glob/minimatch entries only; no new allowlist |
| `verify-build.cjs`, Node and Bun | Both pass success/upload cases, fail-closed cleanup/injection/unrelated/configuration controls, and missing-`deploy:false` regression control |
| `verify-cli-failure.cjs`, Node and Bun | Both use the real CLI/debug-ID adapter against loopback HTTP 401: two requests, typed SentryError exit 30, upload failure recognised |
| Full release-build preload with synthetic upload failure | **Passed**, hook warning limited to safe CLI exit; compilation 27.8s, hook 132ms; timings are local, not provider benchmarks |
| Post-preload asset scan | **0 public `.map` files**; server instrumentation output exists |
| Load emitted instrumentation and `register()` | Client registered; release `payetax@5.2.7`, environment `preview`, traces 0, ProcessSession absent |

Source-map checks used the checked-in harnesses with synthetic credentials/stubbed SDK upload or
loopback-only HTTP rejection. No real Sentry request/credential was used by those harnesses.
They verify the installed SDK/Next hook contract and failure/cleanup behaviour, not provider
symbolication or real upload success. Browser and hosted checks for the final pushed head are
recorded on PR #164 once completed; earlier-head green status is not reused as proof.

Commands:

```text
bun install
bun run test:no-coverage --maxWorkers=2
bun run check:repo
bun run build:ci
bun run check-version --base origin/main
bun run audit:deps
node docs/reports/sentry-reliability-2026-11-02/verify-build.cjs
bun --no-env-file docs/reports/sentry-reliability-2026-11-02/verify-build.cjs
node docs/reports/sentry-reliability-2026-11-02/verify-cli-failure.cjs
bun --no-env-file docs/reports/sentry-reliability-2026-11-02/verify-cli-failure.cjs
node --require ./docs/reports/sentry-reliability-2026-11-02/verify-build.cjs node_modules/next/dist/bin/next build --webpack
bun run test:e2e:critical:ci
```

The Sentry checkout initially had a junction to the original checkout's `node_modules`. That
junction was moved intact into ignored `audit-outputs/jgf5-v527/node_modules` and an independent
install was made in the Sentry checkout. The original dependency tree remains at 16.4.3;
the updated checkout uses 16.4.5. An initial backup name outside the standard `node_modules`
exclusion let TypeScript scan old dependency sources; renaming that junction into the standard
excluded directory restored clean unmodified checks. No application nullability or tsconfig
workaround was introduced. The former junction-specific Tailwind-sort diagnostic did not recur.

## Independent review and remaining boundaries

Read-only independent review found **no blocking code findings**, confirmed the installed
16.4.5/11.10.0 compilation-hook contract and preservation of all JGF-6 changes. It did not execute
commands. Its approval remains conditional on final checks/evidence. Reviewed non-documentation
binary diff SHA-256: `0b6e34a7f19e71598dd03bcc21ffcd7604fce863f771d383f274f39bf38f58d3`, using
`git diff --binary origin/main -- . ':(exclude)docs/**'`.

- This run makes no provider, alert, telemetry, IP-scrubbing or credential change. It does not
  investigate or repair the excluded Linear–Codex cloud integration.
- Prior live preview browser-ingestion evidence belongs to its recorded SHA, not this new head.
  New hosted preview status certifies its exact build; local envelope tests establish bounded
  application privacy/error-only behaviour.
- Live production Node delivery and source-map symbolication remain post-deployment checks after
  separate approval. Existing provider linking/resolution/privacy-setting limits are unchanged;
  passing code checks does not close every acceptance item on JGF-5.
- Do not merge or deploy production from this readiness result. Recheck main/version if another
  release merges first.

## Raw evidence fingerprints

Raw artifacts remain local. This summary, reproducible checked-in harnesses and hashes preserve
useful evidence; final hosted results are independently linked in the PR description.

| Artifact | SHA-256 |
| --- | --- |
| `jest.log` | `109e483bd66e1601b041ed50175c9d5c3c82e97b764e6bbb94c5bdc7b64891ae` |
| `check-repo-final.log` | `28e72c10792f90e8fe481d2a750edd75dbf78b7c47e2c5501605a50c7484fb47` |
| `build-ci.log` | `83fbcbb27278523d9106a1160c9b4164373333ff288139a564bd2d3e039b3ae3` |
| `build-release-preload.log` | `64421836215b2430edd87f9f5839bc7f9895119cdc07d7682b4c0867f7fe3ca4` |
| `hook-node.log` | `33e8a0c131ff089688e56e39e6c5aa7f559a1f9c988ba3fc4f5cedfd29ce4093` |
| `hook-bun.log` | `33e8a0c131ff089688e56e39e6c5aa7f559a1f9c988ba3fc4f5cedfd29ce4093` |
| `cli-node.log` | `33c4556d9e0386c62ace4b5be4a6c64e987401c5d22a66b8b892ff985b0ff342` |
| `cli-bun.log` | `2b38fcc33d293fcbe39760d9ad31955650dd69efcccec97ca2119482f3684280` |
| `emitted-instrumentation.log` | `9020d5baacbd6984862a25d2be405ea35915849891923c86ea4c304a25200c75` |
| `preservation-and-maps.json` | `523028ec60ff5f52f13a21d9b4523a1649d5e5bc1d83a80165266160e1d99be6` |
| `dependency-audit-final.log` | `e8d2b8f4f391930017f8f8dabce45088ca4b8e143e9fe09cb2b535bb1ac04f1f` |
| `next-advisories.json` | `8b15a3f731e0f3836c53fe28e51d84fb4100055497fcedbbd16b61616a2dcae2` |
| `next-16.4.5-release.json` | `44f2d9b3fb9040d061f36d2b7647321fb870fecc4935a1165ba7048d3b41936f` |
