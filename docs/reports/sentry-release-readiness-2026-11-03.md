# PayeTax v5.2.6 release investigation — 3 November 2026

Tracking: [JGF-5](https://linear.app/jgf-projects/issue/JGF-5/verify-sentry-linear-automation-and-production-monitoring-before-v526).
PR: [#164](https://github.com/jarrydaubert/payetax/pull/164), base of this repair `5775fca8`.
No merge or Production deployment is authorised. Live outcomes after this dated investigation
are recorded on JGF-5 and the PR, with their exact deployed SHA.

## Deployment failure and focused repair

Authenticated `vercel inspect payetax-owehij2wc-jgfprojects.vercel.app --scope jgfprojects --logs`
identifies Preview `dpl_DxKuCLesnmUhJfx8uAEEHyK7YW6z`, source `5775fca8`, as failed during
Webpack `createRelease`, rejected by `handleSentryBuildError`. The build used restored cache,
Next 16.4.3, Bun 1.3.14 and Vercel CLI 65.4.0 (2 cores / 8 GB). GitHub CI at the same SHA passed;
that did not exercise this authenticated Vercel release-management path.

Installed Sentry 11.10.0's `normalizeUserOptions` fills `release.deploy` from Vercel when it is
undefined, independently of `release.create`, `finalize` and `setCommits`. The build manager
then calls `newDeploy` from `createRelease`. Those calls were not intended by this PR.
The repair explicitly sets **`release.deploy: false`**. The Vercel-like harness proves that
omitting it makes the real manager call the deployment stub, which rejects; with the opt-out,
no release-management command is invoked. The original masked logs do **not** identify whether
the incidental remote rejection was auth, network or missing release; none is asserted.
The fresh Preview outcome is the operational validation, not this local inference alone.

A second reproduced defect affected outage tolerance: Bun's stack uses `uploadSourcemaps`
without the class prefix, so the Node-only matcher rejected typed upload failures. The repair
allows both names **only** at the inspected CLI adapter's actual module path. Wrong types,
paths and injection errors remain fatal; cleanup auditing is unchanged.

## Direct local verification

- Node 24.18.0 and Bun 1.4.3 each pass `docs/reports/sentry-reliability-2026-11-02/verify-build.cjs`:
  success and upload failure continue after browser-map removal; cleanup, injection, unrelated
  and invalid-configuration failures reject. Vercel/Preview flags are set before config loading.
  The negative control proves the missing `deploy: false` regression, without editing source.
- Both runtimes pass `verify-cli-failure.cjs`: real `sentry` 0.45.0 SDK, real adapter and debug-ID
  injection, synthetic token, local HTTP 401 server. Each makes two loopback requests and produces
  a genuine `SentryError` (exit 30) accepted by the handler. Global fetch is restricted to loopback
  and CLI telemetry is disabled. This guard does not intercept every Node networking API; the
  inspected upload uses the configured loopback origin. No Sentry request or real credential is used.
- Full Jest run: **261 suites / 4,652 tests pass**. Both typechecks pass. Focused build/config
  suites: 18 tests pass. Version remains 5.2.6: this is the same patch PR, not a second release.
- The isolated Windows checkout still produces the documented sorter discrepancy in
  `CalculatorContainer.tsx:446`; no unrelated fix or lint suppression is committed. Remaining
  repo guards and diagnostic lint pass. Hosted checks certify their exact heads independently.
- `bun run build:ci` passes: cached compilation 6.2 seconds, 64 static pages. This local timing
  is not a provider benchmark. Build log SHA-256:
  `c2ff740fe1199ef04450f575655e7e2d8a9b6b7914ecbd23693404de1e7c7e07`.
- Full release-build preload also passes: compilation 30.2 seconds, hook 55ms, typed synthetic
  upload failure tolerated, 64 static pages, **zero public maps**. This uses a stub, not Sentry.
  Build log SHA-256: `611789181babac4956019090d4c49aa7fdf19c9e976a543cdcd247daedc5b196`.
- Staged-tree Gitleaks passes. Fresh hosted CI/Preview results are attached to PR #164 and JGF-5
  as they complete. They must not be inferred from the earlier head's green CI.

Fresh Claude Code 2.1.311 review **APPROVE**, with no blocking code findings. It inspected the
installed SDK and current files read-only; it did not rerun commands. Its low-severity evidence
wording and earlier-head labelling notes were corrected here. The separate CLI telemetry gap
below remains explicit. Raw review SHA-256:
`8c8fc2312de6f369f036131c42b7ea5a1e5ab4ad884151dd0baff88b118c37a8`.

## Dependency, SDK and CLI audit (separate from the repair)

`bun outdated` and the repository's `bun run audit:deps` were run against the existing lockfile.
`bun pm audit` is not a command in local Bun 1.4.3; the repository correctly uses `bun audit`.
`bun pm scan` requires a separately configured scanner and is not a replacement for that audit.
No dependency update is needed to fix these two reproduced defects; **package pins and
`bun.lock` are unchanged**. No global tool was installed or upgraded.

| Package/tool | Installed / observed | Available stable / disposition |
| --- | --- | --- |
| Next / bundle analyzer | 16.4.3 | 16.4.4 is available; release notes describe bugfix backports, not the announced November security patches. Recheck security patches before Production. |
| Sentry Next SDK / bundler plugins | 11.10.0 | Current stable. Next's post-compile hook is compatible; no SDK upgrade needed. |
| Sentry CLI adapter dependency | `sentry` 0.45.0 (`^0.45.0`) | Global CLI is 0.47.0, current stable. Do not force the transitive dependency across its minor range to fix configuration. |
| Legacy Sentry CLI | Global 3.8.2; transitive `@sentry/cli` 2.58.5 | Global 3.8.2 current. The Sentry 11 bundler uses the newer adapter; legacy HTTP timeout settings are not assumed effective. |
| Vercel CLI | Local 65.9.0; failed provider build 65.4.0 | 65.10.0 available. No evidence a CLI upgrade is required; provider build tooling was not changed. |
| Bun | Local 1.4.3; CI pin 1.3.13; provider 1.3.14 | 1.4.4 available. The relevant Bun frame difference is reproduced; no runtime upgrade is needed for the repair. |
| Node | Local 24.18.0; Vercel configured 24.x | Supported by installed Next/Sentry engine ranges. Exact provider runtime patch not claimed. |
| Other direct updates | lucide-react 1.66.0, shiki 4.5.0, Tailwind/PostCSS 4.3.3, Zod 4.6.6 | 1.67.0, 4.6.0, 4.3.4 and 4.6.7 available respectively; deferred as unrelated, absent a new applicable advisory. |
| Existing quality tools | Biome 2.6.4, TypeScript 7.0.2, Jest 30.5.2, Playwright 1.64.1 | Registry current at the audit; no change required. |
| Other installed tooling | GitHub CLI 2.102.0, Claude Code 2.1.311, Gitleaks 8.30.1 | Available 2.103.3 / 2.1.317 / 8.30.1 respectively. No release-critical update identified; no global upgrade. |
| Vercel browser SDKs | Analytics 2.0.1, Speed Insights 2.0.0 | Registry current; retained without changes. |

The only audit findings are existing moderate build/test `glob` and `minimatch` exceptions
([glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4),
[minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249)). Fixed majors remain outside
the installed consumers' accepted ranges. The exception review/deadline was not extended:
review by 7 November, expiry 14 November inclusive. Current latest glob/minimatch are 14.0.3 /
11.0.4; availability alone does not establish compatibility.

**Security gate:** Next.js [announced seven medium fixes for 3 November](https://nextjs.org/blog/upcoming-nextjs-security-release-november-2026).
At this audit the current stable was 16.4.4 and full advisories were not yet available. The
allowlisted-only audit is not proof those pending fixes are irrelevant. Recheck published
patches/advisories before any Production approval and apply applicable stable fixes separately.

## Native workflow and remaining verification

Confirmed provider facts: PayeTax Sentry project `4511500748193872` and its public DSN's project
ID match; native Linear app installation is installed and alert-capable; JGF Projects is public;
the PayeTax project is available in the native form. Sentry's GitHub repository integration is
active. Both current issue alerts are email-only. The Linear GitHub connection can read PR #164;
at investigation start its native issue-link list was empty.

The maintainer approved one new-production-issue alert: `first_seen_event`, environment
`production`, severity >= error, native Create Linear issue, public JGF Projects / PayeTax,
Medium priority / Backlog. No resolved/reopened or per-event trigger; existing email alerts stay.
The approved create request returned **HTTP 403**. The current credential's read scopes do not
permit that write. The maintainer chose to apply the prepared alert in their existing Sentry UI;
no new credential or webhook is being created. Its read-back and synthetic dedup/resolution
acceptance remain open until actually demonstrated. JGF-5 records the exact settings.

Project data scrubbing/default scrubbing are enabled; project IP scrubbing is **false**.
Financial-data protection must be verified on actual outbound/ingested synthetic events, not
inferred from those provider toggles. Existing code protection and real-SDK envelope regressions
remain. IP/retention setting changes require separate approval; no such change was made here.
Build token presence in Preview/Production metadata is confirmed; its effective upload scopes
have not been verified and are not inferred from the separate CLI credential's scopes.

Build-plugin `telemetry: false` does not disable the newer CLI's independent anonymised error
reporting. The offline harness explicitly sets `SENTRY_CLI_NO_TELEMETRY=1`; provider builds have
not been proved to have that opt-out. Recommend separately approving that provider build setting
for consistency with error-only monitoring. It does not control application sessions or tracing,
and no provider environment value was changed as part of this repair.

Release gates still include real Preview error delivery/privacy/release labels, native one-ticket
creation and deduplication, reciprocal Sentry/Linear/GitHub links and status propagation, and
production source-map symbolication after an authorised deployment. A direct CLI-injected event
would only prove the provider workflow, not application capture. No permanent error endpoint,
custom webhook, app Linear key, merge or Production deployment is introduced.
