# Proposed temporary picomatch advisory exception

> **Retired by PR #207.** GitHub recorded the withdrawal of `GHSA-fc5q-39xc-vjpf` at
> 15:38:56 UTC on 18 November. The Picomatch maintainer explained that globs are regular
> expressions and advised against letting untrusted users define them. The upstream patch
> proposal closed without merging. Bun's live audit stopped reporting the advisory, which
> required removal under the existing unmatched-entry rule. PayeTax retains its
> `picomatch@4.0.7` override and lockfile.
> [GitHub advisory record](https://api.github.com/advisories/GHSA-fc5q-39xc-vjpf) ·
> [Maintainer comment](https://github.com/micromatch/picomatch/pull/235#issuecomment-6315749381)

The introducing PR is the decision record. The PayeTax maintainer owns the review and must explicitly approve this
one-time deviation from the [shrink-only policy](../guides/TESTING.md#calculation-verification-model)
in its PR before merge. The exception covers the npm package `picomatch` and
`GHSA-FC5Q-39XC-VJPF`. GitHub rates the advisory high and lists versions through 4.0.7 as affected
with no patched version. The npm registry reported 4.0.7 as latest on 18 November 2026.
[GitHub advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) ·
[npm registry](https://registry.npmjs.org/picomatch/latest)

## Reviewed graph

The 18 November assessment used clean `main` at `c77f8af0` and `bun.lock` Git blob
`d0ea62b13aa607fce7ffe36ff564bd726ace4469`. Bun's override resolved the standalone npm package
to one `picomatch@4.0.7` copy. Upgrading the reviewed parent packages or removing the override
still left affected versions at the time of review. [Manifest](https://github.com/jarrydaubert/payetax/blob/c77f8af000581db57853e0eba6208cf550b7de07/package.json#L127) ·
[Lockfile](https://github.com/jarrydaubert/payetax/blob/c77f8af000581db57853e0eba6208cf550b7de07/bun.lock)

| Reviewed paths | Use |
| --- | --- |
| `@sentry/nextjs` 11.11.0 via Rollup CommonJS and plugin utilities to the standalone copy. Rollup and the Sentry bundler CLI also embed copies. | Webpack build tooling. The Sentry runtime SDK is separate from these build paths. |
| Jest 30.5.2, jsdom and Jest type dependencies via haste-map, Jest utilities, `@parcel/watcher`, `anymatch` and `fdir`. | Test discovery, watchers and test utilities. |
| Knip 6.44.1 via its direct dependency and via `tinyglobby` and `fdir`. The `tsx` CLI also embeds a copy. | Repository analysis and fixture generation. |
| Next.js 16.4.5 vendors `picomatch@4.0.1`, independently of Bun's override. | Build tracing and the image optimizer. This vendored copy was the only picomatch copy found in the local server traces and warrants separate upstream follow-up. |

## Reachability, residual risk and evidence limits

- **Deployed observations.** The successful Vercel production deployment and release tag matched
  `c77f8af0`. The public site reported v5.5.4 and served an ordinary blog image through
  `/_next/image`. The HTTP response confirms the route worked. The deployed function contents and
  optimizer implementation were outside the evidence. [Deployment](https://api.github.com/repos/jarrydaubert/payetax/deployments/7855405341/statuses) ·
  [Release](https://github.com/jarrydaubert/payetax/releases/tag/v5.5.4)
- **Local inventory.** The assessment inspected all 28 file traces from a local production build
  of that commit. The traces showed the copy vendored by Next.js.
- **Source reachability.** In the reviewed Next.js source and configuration, the image route
  accepts a URL to match against a fixed glob that lacks the affected construct. Remote patterns
  were empty. The reviewed email, blog and telemetry routes supplied no public input to glob
  compilation. CPU exhaustion remains possible if untrusted patterns enter build or test inputs,
  or if future production configuration introduces an affected pattern. [Image optimizer](https://github.com/vercel/next.js/blob/v16.4.5/packages/next/src/server/image-optimizer.ts) ·
  [Local pattern matcher](https://github.com/vercel/next.js/blob/v16.4.5/packages/next/src/shared/lib/match-local-pattern.ts)

## Review and removal

Recheck upstream every seven days, first on **25 November 2026**. The audit warns when that
review is overdue. The hard expiry is the end of **2 December 2026 UTC**. Both audit commands
reject an expired entry from 00:00 UTC on 3 December. The required `audit:deps` gate rejects every
other advisory returned by its scanner. The reporting summary applies its existing severity thresholds.

When a verified compatible patch is available, update the override and lockfile and remove the entry.
If the scanner stops reporting the advisory, the required gate demands removal. Track remediation of
the Next.js vendored copy separately by checking the upstream Next.js vendor pin during each review.
The scanner's acceptance of the standalone lockfile package establishes no status for embedded copies.
The gate matches the exact package and advisory ID. It cannot enforce the documented graph scope,
so reopen this assessment if the advisory, lockfile, image configuration or CI trust boundary changes.
[Next.js vendor pin](https://github.com/vercel/next.js/blob/v16.4.5/packages/next/package.json)
